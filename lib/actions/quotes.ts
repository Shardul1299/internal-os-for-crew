"use server";
// Quote server actions — the ladder calculator on a deal (BRIEF §5.3, §12.1–12.4).
// line_total = standard × qty × (1 + rung) × (1 + Σ add-ons). No follower, impression, CPV or CPM input exists.
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { dealFacts } from "@/lib/queries/facts";
import { hasOverride, isAtLeast } from "@/lib/rules/deals";
import { resolveStandard, validateQuote, finalLineTotal, isAddonSelectable, type QuoteLineInput } from "@/lib/rules/ladder";
import { RUNG_ORDER, type Tier } from "@/lib/rules/config";
import { rupeesToPaise } from "@/lib/format";
import { ok, fail, guard, type ActionResult } from "./result";
import { recomputeQuoted, logActivity } from "./deal-ops";

const id = z.string().uuid();

const Line = z.object({
  lineId: z.preprocess((v) => (v === "" ? undefined : v), id.optional()),
  dealId: id,
  creatorId: id,
  deliverableKey: z.string().min(1),
  qty: z.coerce.number().int().min(1, "Quantity at least 1").max(100),
  rung: z.enum(RUNG_ORDER as [string, ...string[]]),
  manualRupees: z.preprocess((v) => (v === "" || v == null ? null : v), z.coerce.number().min(0).nullable()),
  note: z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().trim().nullable().optional()),
});

async function loadForQuote(dealId: string) {
  const [fx, cfg] = await Promise.all([dealFacts(dealId), getConfig()]);
  if (!fx) throw new Error("Deal not found");
  // BRIEF: clarify — the quote stays editable through negotiation and locks at signature.
  if (isAtLeast(fx.facts.stage, "signed") || fx.facts.stage === "declined" || fx.facts.stage === "lost") throw new Error("The quote is locked once signed");
  return { fx, cfg };
}

export async function saveQuoteLine(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const parsed = Line.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const v = parsed.data;
    const addonKeys = [...new Set(fd.getAll("addons").map(String).filter(Boolean))];
    const { fx, cfg } = await loadForQuote(v.dealId);
    const onDeal = fx.facts.creators.find((c) => c.id === v.creatorId);
    if (!onDeal || onDeal.status === "declined_by_creator") return fail("Pick a creator on this deal");
    if (!cfg.deliverables.some((d) => d.key === v.deliverableKey)) return fail("Unknown deliverable");
    for (const k of addonKeys) if (!isAddonSelectable(cfg, k)) return fail(`${cfg.addons.find((a) => a.key === k)?.label ?? k} is not offered`);
    if (addonKeys.filter((k) => cfg.addons.find((a) => a.key === k)?.kind === "rush").length > 1) return fail("Pick one rush add-on");
    if (addonKeys.some((k) => cfg.addons.find((a) => a.key === k)?.pct == null)) return fail("Case-by-case items go on their own line");

    const [creator] = await db.select({ tier: s.creators.tier }).from(s.creators).where(eq(s.creators.id, v.creatorId));
    const [own] = await db
      .select({ p: s.creatorStandardRates.standardPaise })
      .from(s.creatorStandardRates)
      .where(and(eq(s.creatorStandardRates.creatorId, v.creatorId), eq(s.creatorStandardRates.deliverableKey, v.deliverableKey), eq(s.creatorStandardRates.currency, fx.deal.currency), isNull(s.creatorStandardRates.archivedAt)));
    const std = resolveStandard(cfg, { ownStandardPaise: own?.p ?? null, deliverableKey: v.deliverableKey, tier: (creator?.tier ?? null) as Tier | null });
    const line: QuoteLineInput = {
      creatorId: v.creatorId,
      deliverableKey: v.deliverableKey,
      qty: v.qty,
      standardPaise: std.standardPaise,
      rung: v.rung as QuoteLineInput["rung"],
      addons: addonKeys,
      manualTotalPaise: v.manualRupees != null ? rupeesToPaise(v.manualRupees) : null,
    };
    // A hand-set price below the Lucrative price needs an approved Owner override (§0.1 #7).
    const g = validateQuote(cfg, { lines: [line], exclusivity: { scope: "none", days: 0 }, usageRights: [], hasBelowLucrativeOverride: hasOverride(fx.facts, "below_lucrative") });
    if (!g.ok) return fail(g.reasons[0]);
    const values = {
      dealId: v.dealId,
      creatorId: v.creatorId,
      deliverableKey: v.deliverableKey,
      qty: v.qty,
      standardPaise: std.standardPaise,
      standardIsDefault: std.isDefault,
      rung: line.rung!,
      addons: addonKeys.map((k) => ({ key: k, pct: cfg.addons.find((a) => a.key === k)?.pct ?? null })),
      // line_total_paise holds the effective price (the hand price when one is set).
      lineTotalPaise: finalLineTotal(cfg, line),
      manualTotalPaise: line.manualTotalPaise ?? null,
      note: v.note ?? null,
      isCaseByCase: false,
    };
    const lineId = await withUser(me.id, async (tx) => {
      let rowId = v.lineId;
      if (rowId) await tx.update(s.dealQuoteLines).set(values).where(and(eq(s.dealQuoteLines.id, rowId), eq(s.dealQuoteLines.dealId, v.dealId)));
      else rowId = (await tx.insert(s.dealQuoteLines).values({ ...values, createdBy: me.id }).returning({ id: s.dealQuoteLines.id }))[0].id;
      await recomputeQuoted(tx, cfg, v.dealId);
      return rowId!;
    });
    revalidatePath(`/deals/${v.dealId}`);
    revalidatePath("/deals");
    return ok(v.lineId ? "Line updated" : "Line added", { undo: { entity: "deal_quote_lines", id: lineId } });
  });
}

/** Revisions beyond round 2: a free-text priced line, never automatic (§5.3). */
export async function saveCaseByCaseLine(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const v = z
      .object({
        dealId: id,
        creatorId: id,
        note: z.string().trim().min(1, "Describe the revision"),
        priceRupees: z.coerce.number().min(0, "Price required"),
      })
      .safeParse(Object.fromEntries(fd));
    if (!v.success) return fail(v.error.issues[0].message);
    const { fx, cfg } = await loadForQuote(v.data.dealId);
    if (!fx.facts.creators.some((c) => c.id === v.data.creatorId)) return fail("Pick a creator on this deal");
    const price = rupeesToPaise(v.data.priceRupees);
    const lineId = await withUser(me.id, async (tx) => {
      const [row] = await tx
        .insert(s.dealQuoteLines)
        .values({
          dealId: v.data.dealId,
          creatorId: v.data.creatorId,
          deliverableKey: "revisions_r3",
          qty: 1,
          standardPaise: 0,
          rung: "standard",
          addons: [],
          lineTotalPaise: price,
          manualTotalPaise: price,
          note: v.data.note,
          isCaseByCase: true,
          createdBy: me.id,
        })
        .returning({ id: s.dealQuoteLines.id });
      await recomputeQuoted(tx, cfg, v.data.dealId);
      await logActivity(tx, v.data.dealId, me.id, "note", `Revision line priced case by case: ${v.data.note}`);
      return row.id;
    });
    revalidatePath(`/deals/${v.data.dealId}`);
    return ok("Revision line added", { undo: { entity: "deal_quote_lines", id: lineId } });
  });
}

export async function removeQuoteLine(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const v = z.object({ lineId: id }).parse(Object.fromEntries(fd));
    const [line] = await db.select().from(s.dealQuoteLines).where(eq(s.dealQuoteLines.id, v.lineId));
    if (!line) return fail("Not found");
    const { cfg } = await loadForQuote(line.dealId);
    await withUser(me.id, async (tx) => {
      await tx.update(s.dealQuoteLines).set({ archivedAt: new Date() }).where(eq(s.dealQuoteLines.id, v.lineId));
      await recomputeQuoted(tx, cfg, line.dealId);
    });
    revalidatePath(`/deals/${line.dealId}`);
    revalidatePath("/deals");
    return ok("Line removed", { undo: { entity: "deal_quote_lines", id: v.lineId } });
  });
}
