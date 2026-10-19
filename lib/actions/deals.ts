"use server";
// Deal server actions — BRIEF §5.1, §5.2, §3.4. Zod → actor() → lib/rules gate → withUser() → revalidatePath.
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { dealFacts, creatorFacts } from "@/lib/queries/facts";
import { canAdvance, canApproveOverride, canRequestOverride, hasOverride, noListFlags, noListPassed, belowMinimum, type DealStage } from "@/lib/rules/deals";
import { dealEligibility } from "@/lib/rules/creators";
import { commissionPct, validateQuote } from "@/lib/rules/ladder";
import { can } from "@/lib/rules/visibility";
import { rupeesToPaise, money, DEAL_STAGE_LABEL, label, humanize, date as fmtDate } from "@/lib/format";
import { today } from "@/lib/dates";
import { ok, fail, guard, type ActionResult } from "./result";
import { logActivity, createCampaignFromDeal, issueBalanceInvoice, generateAdvancePayouts } from "./deal-ops";

const bool = z.preprocess((v) => v === "on" || v === "true" || v === true || v === "1", z.boolean());
const optText = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().trim().nullable().optional());
const optDate = z.preprocess((v) => (v === "" || v == null ? null : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable());
const rupees = z.preprocess((v) => (v === "" || v == null ? null : v), z.coerce.number().min(0).nullable());
const id = z.string().uuid();

const ORIGINS = s.dealOriginEnum.enumValues;
const TYPES = s.dealTypeEnum.enumValues;
const STAGES = s.dealStageEnum.enumValues;
const OVERRIDE_KINDS = s.overrideKindEnum.enumValues;

function paths(dealId?: string) {
  revalidatePath("/deals");
  revalidatePath("/today");
  if (dealId) revalidatePath(`/deals/${dealId}`);
}

// ---------- New deal (with brand quick-create) ----------

const NewDeal = z
  .object({
    brandId: z.preprocess((v) => (v === "" || v === "new" ? null : v), id.nullable()),
    brandName: optText,
    brandCategory: z.enum(s.brandCategoryEnum.enumValues).default("other"),
    brandOwnerTeam: z.enum(s.ownerTeamEnum.enumValues).default("crew"),
    title: z.string().trim().min(1, "Title required"),
    type: z.enum(TYPES),
    oneOffReason: optText,
    origin: z.enum(ORIGINS),
    originatingCreatorId: z.preprocess((v) => (v === "" ? null : v), id.nullable().optional()),
    expectedRupees: z.coerce.number().min(0, "Expected value required"),
    minDealOverride: bool.default(false),
    minDealReason: optText,
  })
  .refine((v) => v.brandId || v.brandName, { message: "Pick a brand or name a new one" })
  .refine((v) => v.origin !== "creator_inbound" || !!v.originatingCreatorId, { message: "Originating creator required for creator inbound" })
  .refine((v) => v.type !== "one_off" || !!v.oneOffReason, { message: "One-off needs a reason" });

export async function createDeal(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const parsed = NewDeal.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const v = parsed.data;
    const cfg = await getConfig();
    const value = rupeesToPaise(v.expectedRupees);
    const below = belowMinimum(cfg, value);
    if (below && !v.minDealOverride) return fail("Below the ₹25K minimum — send the self-serve template or request a min_deal override");
    if (below) {
      const g = canRequestOverride(me.role, v.minDealReason ?? "");
      if (!g.ok) return fail(g.reasons[0]);
    }
    if (v.originatingCreatorId) {
      const cf = await creatorFacts(v.originatingCreatorId);
      if (!cf) return fail("Creator not found");
    }
    const dealId = await withUser(me.id, async (tx) => {
      let brandId = v.brandId;
      if (!brandId) {
        const [b] = await tx.insert(s.brands).values({ name: v.brandName!, category: v.brandCategory, ownerTeam: v.brandOwnerTeam, createdBy: me.id }).returning({ id: s.brands.id });
        brandId = b.id;
      }
      const [d] = await tx
        .insert(s.deals)
        .values({
          brandId,
          title: v.title,
          ownerUserId: me.id,
          type: v.type,
          oneOffReason: v.type === "one_off" ? v.oneOffReason : null,
          origin: v.origin,
          originatingCreatorId: v.origin === "creator_inbound" ? v.originatingCreatorId : null,
          commissionPct: commissionPct(cfg, v.origin),
          quotedTotalPaise: value,
          createdBy: me.id,
        })
        .returning({ id: s.deals.id });
      if (v.origin === "creator_inbound" && v.originatingCreatorId) {
        // The creator who brought the deal is its primary creator.
        await tx.insert(s.dealCreators).values({ dealId: d.id, creatorId: v.originatingCreatorId, role: "primary", status: "accepted", createdBy: me.id });
      }
      await logActivity(tx, d.id, me.id, "note", `Deal created · ${humanize(v.origin)} · expected ${money(value)}`);
      if (below) {
        await tx.insert(s.dealOverrides).values({ dealId: d.id, kind: "min_deal", requestedBy: me.id, reason: v.minDealReason!, createdBy: me.id });
        await logActivity(tx, d.id, me.id, "override", `Requested min_deal override: ${v.minDealReason}`);
      }
      return d.id;
    });
    paths(dealId);
    return ok("Deal created", { redirect: `/deals/${dealId}`, undo: { entity: "deals", id: dealId } });
  });
}

// ---------- Qualify ----------

const Qualify = z.object({
  dealId: id,
  rev_share_only: bool.default(false),
  no_budget_educational: bool.default(false),
  barter: bool.default(false),
  lifetime_rights: bool.default(false),
  shady_tool: bool.default(false),
  blocklist_category: optText,
  type: z.enum(TYPES),
  oneOffReason: optText,
  expectedRupees: rupees.optional(),
  referralNote: optText,
});

export async function saveQualify(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const parsed = Qualify.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const v = parsed.data;
    const fx = await dealFacts(v.dealId);
    if (!fx) return fail("Deal not found");
    if (fx.facts.stage !== "lead" && fx.facts.stage !== "qualified") return fail("Qualify is closed after the brief");
    if (v.type === "one_off" && !v.oneOffReason) return fail("One-off needs a reason");
    const cfg = await getConfig();
    if (v.blocklist_category && !cfg.blocklist.some((b) => b.key === v.blocklist_category)) return fail("Unknown blocklist category");
    const toggles = {
      rev_share_only: v.rev_share_only,
      no_budget_educational: v.no_budget_educational,
      barter: v.barter,
      lifetime_rights: v.lifetime_rights,
      shady_tool: v.shady_tool,
      blocklist_category: v.blocklist_category ?? null,
    };
    const passed = noListPassed(toggles, hasOverride(fx.facts, "no_list"));
    const flags = noListFlags(toggles);
    const hasLines = fx.facts.lines.length > 0;
    await withUser(me.id, async (tx) => {
      await tx
        .update(s.deals)
        .set({
          noListCheck: { ...toggles, passed, checked_at: new Date().toISOString(), checked_by: me.id },
          type: v.type,
          oneOffReason: v.type === "one_off" ? v.oneOffReason : null,
          referralNote: v.referralNote ?? null,
          ...(v.expectedRupees != null && !hasLines ? { quotedTotalPaise: rupeesToPaise(v.expectedRupees) } : {}),
        })
        .where(eq(s.deals.id, v.dealId));
      await logActivity(tx, v.dealId, me.id, "note", flags.length ? `NO-list check flagged: ${flags.join(", ")}` : "NO-list check passed");
    });
    paths(v.dealId);
    return ok(flags.length && !passed ? "Saved — flagged, needs Owner override" : "Qualify saved", { undo: { entity: "deals", id: v.dealId } });
  });
}

export async function markRiskReviewed(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeBrands");
    const v = z.object({ dealId: id, brandId: id }).parse(Object.fromEntries(fd));
    await withUser(me.id, async (tx) => {
      await tx.update(s.brands).set({ riskReviewedAt: new Date(), riskReviewedBy: me.id }).where(eq(s.brands.id, v.brandId));
      await logActivity(tx, v.dealId, me.id, "note", "Brand risk reviewed");
    });
    paths(v.dealId);
    revalidatePath(`/brands/${v.brandId}`);
    return ok("Risk reviewed", { undo: { entity: "brands", id: v.brandId } });
  });
}

// ---------- Brief ----------

export async function saveBrief(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const v = z.object({ dealId: id, briefMd: optText, briefUrl: optText, briefTags: z.string().optional().default("") }).parse(Object.fromEntries(fd));
    if (v.briefUrl && !/^https?:\/\//.test(v.briefUrl)) return fail("Brief URL must start with http");
    const tags = [...new Set(v.briefTags.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean))];
    await withUser(me.id, async (tx) => {
      await tx.update(s.deals).set({ briefMd: v.briefMd ?? null, briefUrl: v.briefUrl ?? null, briefTags: tags }).where(eq(s.deals.id, v.dealId));
    });
    paths(v.dealId);
    return ok("Brief saved", { undo: { entity: "deals", id: v.dealId } });
  });
}

// ---------- Match ----------

export async function addDealCreator(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const v = z.object({ dealId: id, creatorId: id, role: z.enum(["primary", "upsell"]) }).parse(Object.fromEntries(fd));
    const [fx, cf, cfg] = await Promise.all([dealFacts(v.dealId), creatorFacts(v.creatorId), getConfig()]);
    if (!fx || !cf) return fail("Not found");
    if (fx.facts.creators.some((c) => c.id === v.creatorId)) return fail("Already on this deal");
    // Roster only; Tier 0 only with a tier0_in_deal override; Filter and representation hold (§5.2).
    const g = dealEligibility(cfg, cf.facts, hasOverride(fx.facts, "tier0_in_deal"));
    if (!g.ok) return fail(g.reasons[0]);
    const role = fx.deal.origin === "creator_inbound" && v.creatorId !== fx.deal.originatingCreatorId ? "upsell" : v.role;
    const linkId = await withUser(me.id, async (tx) => {
      const [row] = await tx.insert(s.dealCreators).values({ dealId: v.dealId, creatorId: v.creatorId, role, status: "proposed", createdBy: me.id }).returning({ id: s.dealCreators.id });
      await logActivity(tx, v.dealId, me.id, "note", `Proposed ${cf.creator.displayName}${role === "upsell" ? " as upsell" : ""}`);
      return row.id;
    });
    paths(v.dealId);
    return ok(`${cf.creator.displayName} proposed`, { undo: { entity: "deal_creators", id: linkId } });
  });
}

export async function updateDealCreator(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const v = z
      .object({ linkId: id, status: z.enum(s.dealCreatorStatusEnum.enumValues).optional(), role: z.enum(["primary", "upsell"]).optional() })
      .parse(Object.fromEntries(fd));
    const [link] = await db.select().from(s.dealCreators).where(eq(s.dealCreators.id, v.linkId));
    if (!link) return fail("Not found");
    const fx = await dealFacts(link.dealId);
    if (!fx) return fail("Deal not found");
    if (fx.facts.stage !== "brief_received" && fx.facts.stage !== "creator_matched" && fx.facts.stage !== "qualified") {
      if (v.status && v.status !== link.status) return fail("Creators are locked after the proposal");
    }
    if (v.role === "primary" && fx.deal.origin === "creator_inbound" && link.creatorId !== fx.deal.originatingCreatorId) return fail("Extras on a creator-inbound deal are upsell");
    await withUser(me.id, async (tx) => {
      await tx.update(s.dealCreators).set({ ...(v.status ? { status: v.status } : {}), ...(v.role ? { role: v.role } : {}) }).where(eq(s.dealCreators.id, v.linkId));
      const name = fx.facts.creators.find((c) => c.id === link.creatorId)?.name ?? "Creator";
      if (v.status) await logActivity(tx, link.dealId, me.id, "note", `${name} ${v.status === "declined_by_creator" ? "declined" : v.status}`);
      if (v.role) await logActivity(tx, link.dealId, me.id, "note", `${name} now ${v.role}`);
    });
    paths(link.dealId);
    return ok(v.status ? humanize(v.status) : "Role changed", { undo: { entity: "deal_creators", id: v.linkId } });
  });
}

export async function removeDealCreator(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const v = z.object({ linkId: id }).parse(Object.fromEntries(fd));
    const [link] = await db.select().from(s.dealCreators).where(eq(s.dealCreators.id, v.linkId));
    if (!link) return fail("Not found");
    const lines = await db.select({ id: s.dealQuoteLines.id }).from(s.dealQuoteLines).where(and(eq(s.dealQuoteLines.dealId, link.dealId), eq(s.dealQuoteLines.creatorId, link.creatorId), isNull(s.dealQuoteLines.archivedAt)));
    if (lines.length) return fail("Remove their quote lines first");
    await withUser(me.id, async (tx) => {
      await tx.delete(s.dealCreators).where(eq(s.dealCreators.id, v.linkId));
      await logActivity(tx, link.dealId, me.id, "note", "Creator removed from deal");
    });
    paths(link.dealId);
    return ok("Removed");
  });
}

// ---------- Terms, SOW, signature, report ----------

const UsageRow = z.object({ kind: z.enum(["organic_reuse", "whitelisting", "web_print"]), days: z.coerce.number().int(), channels: z.array(z.string()).default([]) });

export async function saveTerms(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const v = z
      .object({
        dealId: id,
        signedRupees: rupees,
        termStartsOn: optDate,
        termEndsOn: optDate,
        piecesPerMonth: z.preprocess((x) => (x === "" ? null : x), z.coerce.number().int().min(1).nullable()),
        exclusivityScope: z.enum(["none", "product", "category"]),
        exclusivityDays: z.preprocess((x) => (x === "" ? 0 : x), z.coerce.number().int().min(0)),
        usage: z.string().default("[]"),
        frontseat: bool.default(false),
        pauseUsed: bool.default(false),
      })
      .parse(Object.fromEntries(fd));
    const usage = z.array(UsageRow).parse(JSON.parse(v.usage || "[]"));
    const [fx, cfg] = await Promise.all([dealFacts(v.dealId), getConfig()]);
    if (!fx) return fail("Deal not found");
    if (fx.facts.stage !== "proposal_sent" && fx.facts.stage !== "negotiation" && fx.facts.stage !== "creator_matched") return fail("Terms are locked once signed");
    if (v.termStartsOn && v.termEndsOn && v.termEndsOn < v.termStartsOn) return fail("Term ends before it starts");
    if (v.exclusivityScope !== "none" && v.exclusivityDays <= 0) return fail("Exclusivity needs days");
    if (v.pauseUsed && fx.deal.type !== "retainer") return fail("The pause applies to retainers only");
    // Usage ≤ 365 days, add-ons on lines, exclusivity at Premium — the quote gate decides (§5.2, §5.3).
    const q = validateQuote(cfg, {
      lines: fx.facts.lines,
      exclusivity: { scope: v.exclusivityScope, days: v.exclusivityDays },
      usageRights: usage,
      hasBelowLucrativeOverride: hasOverride(fx.facts, "below_lucrative"),
    });
    if (!q.ok) return fail(q.reasons[0]);
    await withUser(me.id, async (tx) => {
      await tx
        .update(s.deals)
        .set({
          signedTotalPaise: v.signedRupees != null ? rupeesToPaise(v.signedRupees) : null,
          termStartsOn: v.termStartsOn,
          termEndsOn: v.termEndsOn,
          piecesPerMonth: v.piecesPerMonth,
          exclusivity: { scope: v.exclusivityScope, days: v.exclusivityScope === "none" ? 0 : v.exclusivityDays },
          usageRights: usage,
          frontseatAmplification: v.frontseat,
          pauseUsed: v.pauseUsed,
        })
        .where(eq(s.deals.id, v.dealId));
    });
    paths(v.dealId);
    return ok("Terms saved", { undo: { entity: "deals", id: v.dealId } });
  });
}

const USAGE_LABEL: Record<string, string> = { organic_reuse: "Organic reuse", whitelisting: "Whitelisting", web_print: "Web / print" };

export async function generateSow(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const v = z.object({ dealId: id }).parse(Object.fromEntries(fd));
    const [fx, cfg] = await Promise.all([dealFacts(v.dealId), getConfig()]);
    if (!fx) return fail("Deal not found");
    const d = fx.deal;
    if (!d.signedTotalPaise || !d.termStartsOn || !d.termEndsOn || !d.piecesPerMonth) return fail("Save the signed total, term and pieces first");
    const [tpl] = await db.select().from(s.templates).where(eq(s.templates.key, "sow"));
    if (!tpl) return fail("SOW template missing in Settings");
    // Brand-facing: deliverables and quantities only — no tier, rung, Standard or commission.
    const lines = await db
      .select({ l: s.dealQuoteLines, name: s.creators.displayName })
      .from(s.dealQuoteLines)
      .innerJoin(s.creators, eq(s.creators.id, s.dealQuoteLines.creatorId))
      .where(and(eq(s.dealQuoteLines.dealId, d.id), isNull(s.dealQuoteLines.archivedAt)));
    const deliverables = lines
      .map(({ l, name }) =>
        l.isCaseByCase ? `- ${l.note ?? "Revision — case by case"} (${name})` : `- ${l.qty} × ${cfg.deliverables.find((x) => x.key === l.deliverableKey)?.label ?? l.deliverableKey} — ${name}`,
      )
      .join("\n");
    const usage = d.usageRights.length ? d.usageRights.map((u) => `- ${USAGE_LABEL[u.kind]}: ${u.days} days${u.channels?.length ? ` on ${u.channels.join(", ")}` : ""}`).join("\n") : "Organic posting only. No paid usage.";
    const exclusivity = d.exclusivity.scope === "none" ? "None." : `${humanize(d.exclusivity.scope)} exclusivity for ${d.exclusivity.days} days.`;
    const fill: Record<string, string> = {
      brand: fx.brand.name,
      title: d.title,
      type: label({ one_off: "One-off", pilot: "Pilot", retainer: "Retainer", quarterly: "Quarterly", annual: "Annual" }, d.type),
      term_starts_on: fmtDate(d.termStartsOn),
      term_ends_on: fmtDate(d.termEndsOn),
      pieces_per_month: String(d.piecesPerMonth),
      deliverables: deliverables || "- To be confirmed",
      signed_total: money(d.signedTotalPaise, d.currency),
      usage,
      exclusivity,
    };
    const sow = tpl.bodyMd.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k: string) => fill[k] ?? m);
    await withUser(me.id, async (tx) => {
      await tx.update(s.deals).set({ sowMd: sow }).where(eq(s.deals.id, d.id));
      await logActivity(tx, d.id, me.id, "file", "SOW generated from template");
    });
    paths(d.id);
    return ok("SOW generated", { undo: { entity: "deals", id: d.id } });
  });
}

export async function saveSignature(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    if (!can(me.role, "writeDeals") && !can(me.role, "writeMoney")) return fail("Your role can't do that");
    const v = z.object({ dealId: id, sowUrl: optText, poReference: optText, confirmationUrl: optText, confirmationReceivedOn: optDate }).parse(Object.fromEntries(fd));
    for (const u of [v.sowUrl, v.confirmationUrl]) if (u && !/^https?:\/\//.test(u)) return fail("Links must start with http");
    await withUser(me.id, async (tx) => {
      await tx
        .update(s.deals)
        .set({
          sowUrl: v.sowUrl ?? null,
          poReference: v.poReference ?? null,
          confirmationUrl: v.confirmationUrl ?? null,
          confirmationReceivedAt: v.confirmationReceivedOn ? new Date(`${v.confirmationReceivedOn}T12:00:00+05:30`) : null,
        })
        .where(eq(s.deals.id, v.dealId));
    });
    paths(v.dealId);
    return ok("Saved", { undo: { entity: "deals", id: v.dealId } });
  });
}

export async function saveReport(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const v = z.object({ dealId: id, reportUrl: optText }).parse(Object.fromEntries(fd));
    if (v.reportUrl && !/^https?:\/\//.test(v.reportUrl)) return fail("Report link must start with http");
    await withUser(me.id, async (tx) => {
      await tx.update(s.deals).set({ reportUrl: v.reportUrl ?? null }).where(eq(s.deals.id, v.dealId));
    });
    paths(v.dealId);
    return ok("Report link saved", { undo: { entity: "deals", id: v.dealId } });
  });
}

export async function requestFeedback(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const v = z.object({ dealId: id }).parse(Object.fromEntries(fd));
    const [camp] = await db.select().from(s.campaigns).where(eq(s.campaigns.dealId, v.dealId));
    if (!camp) return fail("No campaign yet");
    if (camp.feedbackRequestedAt) return fail("Feedback already requested");
    await withUser(me.id, async (tx) => {
      await tx.update(s.campaigns).set({ feedbackRequestedAt: new Date() }).where(eq(s.campaigns.id, camp.id));
      await logActivity(tx, v.dealId, me.id, "email", "Brand feedback requested (five questions)");
    });
    paths(v.dealId);
    revalidatePath(`/campaigns/${camp.id}`);
    return ok("Feedback requested");
  });
}

// ---------- Stage moves ----------

const Move = z.object({
  dealId: id,
  to: z.enum(STAGES),
  reason: optText,
  valueRupees: rupees.optional(),
});

/** Every forward move runs canAdvance first and writes stage_changed_at + a deal_activity row. */
export async function moveDealStage(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const parsed = Move.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const v = parsed.data;
    const [fx, cfg] = await Promise.all([dealFacts(v.dealId), getConfig()]);
    if (!fx) return fail("Deal not found");
    const from = fx.facts.stage;
    const to = v.to as DealStage;
    if ((to === "declined" || to === "lost") && ["paid_in_full", "declined", "lost"].includes(from)) return fail("Deal is closed");
    const facts = {
      ...fx.facts,
      declinedReason: to === "declined" ? (v.reason ?? null) : fx.facts.declinedReason,
      declinedValuePaise: to === "declined" ? (v.valueRupees != null ? rupeesToPaise(v.valueRupees) : null) : fx.facts.declinedValuePaise,
      lostReason: to === "lost" ? (v.reason ?? null) : fx.facts.lostReason,
    };
    const t = today();
    const g = canAdvance(cfg, facts, to, t);
    if (!g.ok) return fail(g.reasons[0]);
    let extra = "";
    await withUser(me.id, async (tx) => {
      await tx
        .update(s.deals)
        .set({
          stage: to,
          stageChangedAt: new Date(),
          ...(to === "declined" ? { declinedReason: facts.declinedReason, declinedValuePaise: facts.declinedValuePaise } : {}),
          ...(to === "lost" ? { lostReason: facts.lostReason } : {}),
        })
        .where(eq(s.deals.id, v.dealId));
      const deal = { ...fx.deal, stage: to };
      await logActivity(
        tx,
        v.dealId,
        me.id,
        "stage_change",
        `${label(DEAL_STAGE_LABEL, from)} → ${label(DEAL_STAGE_LABEL, to)}${to === "declined" ? ` · ${facts.declinedReason} · ${money(facts.declinedValuePaise)}` : to === "lost" ? ` · ${facts.lostReason}` : ""}`,
      );
      if (to === "advance_received") {
        // Payouts follow receipts, never ahead of them: generated only when the advance is actually paid.
        // BRIEF: clarify — with a go_live_without_advance override and no receipt, payouts wait for the payment.
        const [adv] = await tx
          .select()
          .from(s.invoices)
          .where(and(eq(s.invoices.dealId, v.dealId), eq(s.invoices.kind, "advance"), eq(s.invoices.status, "paid"), isNull(s.invoices.archivedAt)));
        if (adv) {
          const n = await generateAdvancePayouts(tx, cfg, deal, adv.id, adv.paidOn ?? t, me.id);
          if (n) extra = ` · ${n} advance payout${n === 1 ? "" : "s"}`;
        }
      }
      if (to === "in_production") {
        const r = await createCampaignFromDeal(tx, cfg, deal, fx.brand.name, t, me.id);
        extra = ` · campaign with ${r.created} deliverables`;
      }
      if (to === "reported") {
        const [camp] = await tx.select().from(s.campaigns).where(eq(s.campaigns.dealId, v.dealId));
        if (camp) await tx.update(s.campaigns).set({ completedAt: new Date(), reportedAt: camp.reportedAt ?? new Date(), status: "reporting" }).where(eq(s.campaigns.id, camp.id));
        const inv = await issueBalanceInvoice(tx, cfg, deal, t, me.id);
        if (inv) {
          extra = ` · balance invoice ${inv.number}`;
          await logActivity(tx, v.dealId, me.id, "note", `Balance invoice ${inv.number} issued · ${money(inv.amountPaise)} due ${fmtDate(inv.dueOn)}`);
        }
      }
      if (to === "paid_in_full") {
        await tx.update(s.campaigns).set({ status: "closed" }).where(eq(s.campaigns.dealId, v.dealId));
      }
    });
    paths(v.dealId);
    revalidatePath("/money");
    revalidatePath("/campaigns");
    const effects = ["advance_received", "in_production", "reported", "paid_in_full"].includes(to);
    return ok(`Moved to ${label(DEAL_STAGE_LABEL, to)}${extra}`, effects ? {} : { undo: { entity: "deals", id: v.dealId } });
  });
}

// ---------- Overrides ----------

export async function requestOverride(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    const v = z.object({ dealId: id, kind: z.enum(OVERRIDE_KINDS), reason: z.string().default("") }).parse(Object.fromEntries(fd));
    const g = canRequestOverride(me.role, v.reason);
    if (!g.ok) return fail(g.reasons[0]);
    const pending = await db
      .select({ id: s.dealOverrides.id })
      .from(s.dealOverrides)
      .where(and(eq(s.dealOverrides.dealId, v.dealId), eq(s.dealOverrides.kind, v.kind), isNull(s.dealOverrides.approvedAt), isNull(s.dealOverrides.rejectedAt)));
    if (pending.length) return fail("A request of this kind is already pending");
    await withUser(me.id, async (tx) => {
      await tx.insert(s.dealOverrides).values({ dealId: v.dealId, kind: v.kind, requestedBy: me.id, reason: v.reason.trim(), createdBy: me.id });
      await logActivity(tx, v.dealId, me.id, "override", `Requested ${v.kind} override: ${v.reason.trim()}`);
    });
    paths(v.dealId);
    return ok("Override requested");
  });
}

export async function decideOverride(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    const v = z.object({ overrideId: id, decision: z.enum(["approve", "reject"]) }).parse(Object.fromEntries(fd));
    const g = canApproveOverride(me.role);
    if (!g.ok) return fail(g.reasons[0]);
    const [o] = await db.select().from(s.dealOverrides).where(eq(s.dealOverrides.id, v.overrideId));
    if (!o) return fail("Not found");
    if (o.approvedAt || o.rejectedAt) return fail("Already decided");
    await withUser(me.id, async (tx) => {
      // approved_by records the deciding Owner either way; rejected_at marks a rejection (audited by trigger).
      await tx
        .update(s.dealOverrides)
        .set(v.decision === "approve" ? { approvedBy: me.id, approvedAt: new Date() } : { approvedBy: me.id, rejectedAt: new Date() })
        .where(eq(s.dealOverrides.id, o.id));
      if (v.decision === "approve" && o.kind === "no_list") {
        const [d] = await tx.select({ c: s.deals.noListCheck }).from(s.deals).where(eq(s.deals.id, o.dealId));
        if (d?.c) await tx.update(s.deals).set({ noListCheck: { ...d.c, passed: true } }).where(eq(s.deals.id, o.dealId));
      }
      await logActivity(tx, o.dealId, me.id, "override", `${v.decision === "approve" ? "Approved" : "Rejected"} ${o.kind} override: ${o.reason}`);
    });
    paths(o.dealId);
    return ok(v.decision === "approve" ? "Override approved" : "Override rejected");
  });
}

// ---------- Activity ----------

export async function addNote(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    if (!can(me.role, "writeDeals") && !can(me.role, "writeMoney")) return fail("Your role can't do that");
    const v = z.object({ dealId: id, kind: z.enum(["note", "call", "email"]).default("note"), body: z.string().trim().min(1, "Write something") }).safeParse(Object.fromEntries(fd));
    if (!v.success) return fail(v.error.issues[0].message);
    const actId = await withUser(me.id, async (tx) => {
      const [row] = await tx.insert(s.dealActivity).values({ dealId: v.data.dealId, by: me.id, kind: v.data.kind, bodyMd: v.data.body, createdBy: me.id }).returning({ id: s.dealActivity.id });
      return row.id;
    });
    paths(v.data.dealId);
    return ok("Note added", { data: actId });
  });
}
