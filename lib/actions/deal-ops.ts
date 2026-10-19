// Write helpers shared by the deal, quote and money server actions. Not a "use server" module:
// nothing here is callable from the client; every caller has already passed actor() and a lib/rules gate.
import "server-only";
import { and, eq, inArray, isNull, like, ne } from "drizzle-orm";
import * as s from "@/lib/db/schema";
import type { Tx } from "@/lib/db/tx";
import type { RulesConfig } from "@/lib/rules/config";
import { finalLineTotal, type QuoteLineInput } from "@/lib/rules/ladder";
import { advancePayouts, balancePayouts, balanceInvoice, creatorFees, invoiceNumber, referralFacts } from "@/lib/rules/money";
import { suggestDueDates, cadenceGapDays } from "@/lib/rules/schedule";
import { addDays, type ISODate } from "@/lib/dates";

type Deal = typeof s.deals.$inferSelect;
type ActivityKind = (typeof s.activityKindEnum.enumValues)[number];

export async function logActivity(tx: Tx, dealId: string, by: string, kind: ActivityKind, bodyMd: string) {
  await tx.insert(s.dealActivity).values({ dealId, by, kind, bodyMd, createdBy: by });
}

export function lineInput(l: typeof s.dealQuoteLines.$inferSelect): QuoteLineInput {
  return {
    creatorId: l.creatorId,
    deliverableKey: l.deliverableKey,
    qty: l.qty,
    standardPaise: l.standardPaise,
    rung: l.rung,
    addons: l.addons.map((a) => a.key),
    manualTotalPaise: l.manualTotalPaise,
    isCaseByCase: l.isCaseByCase,
  };
}

/** Keeps deals.quoted_total_paise and ladder_version_id in step with the quote lines. */
export async function recomputeQuoted(tx: Tx, cfg: RulesConfig, dealId: string) {
  const lines = await tx.select().from(s.dealQuoteLines).where(and(eq(s.dealQuoteLines.dealId, dealId), isNull(s.dealQuoteLines.archivedAt)));
  if (!lines.length) return;
  const total = lines.reduce((t, l) => t + finalLineTotal(cfg, lineInput(l)), 0);
  await tx.update(s.deals).set({ quotedTotalPaise: total, ladderVersionId: cfg.ladderVersionId }).where(eq(s.deals.id, dealId));
}

/** Each creator's gross fee on the deal (signed total split pro rata over their quote lines). */
export async function feesFor(tx: Tx, cfg: RulesConfig, deal: Deal) {
  const [lines, dcs] = await Promise.all([
    tx.select().from(s.dealQuoteLines).where(and(eq(s.dealQuoteLines.dealId, deal.id), isNull(s.dealQuoteLines.archivedAt))),
    tx.select().from(s.dealCreators).where(and(eq(s.dealCreators.dealId, deal.id), isNull(s.dealCreators.archivedAt))),
  ]);
  return creatorFees(
    lines.map((l) => ({ creatorId: l.creatorId, totalPaise: finalLineTotal(cfg, lineInput(l)) })),
    dcs.map((d) => ({ id: d.creatorId, role: d.role })),
    deal.signedTotalPaise,
  );
}

export async function nextInvoiceNumber(tx: Tx, kind: string, year: number) {
  const prefix = invoiceNumber(kind, 0, year).slice(0, -4);
  const rows = await tx.select({ n: s.invoices.number }).from(s.invoices).where(like(s.invoices.number, `${prefix}%`));
  const max = rows.reduce((m, r) => Math.max(m, Number(r.n.slice(prefix.length)) || 0), 0);
  return invoiceNumber(kind, max + 1, year);
}

/** On advance receipt: fee_advance payouts (50% of each creator's share), once. */
export async function generateAdvancePayouts(tx: Tx, cfg: RulesConfig, deal: Deal, invoiceId: string, receivedOn: ISODate, by: string) {
  const existing = await tx
    .select({ id: s.creatorPayouts.id })
    .from(s.creatorPayouts)
    .where(and(eq(s.creatorPayouts.dealId, deal.id), eq(s.creatorPayouts.kind, "fee_advance"), isNull(s.creatorPayouts.archivedAt)));
  if (existing.length) return 0;
  const fees = await feesFor(tx, cfg, deal);
  const lines = advancePayouts(cfg, deal.origin, fees, receivedOn);
  if (lines.length)
    await tx.insert(s.creatorPayouts).values(
      lines.map((p) => ({ dealId: deal.id, creatorId: p.creatorId, kind: p.kind, triggeredByInvoiceId: invoiceId, dueOn: p.dueOn, amountPaise: p.amountPaise, currency: deal.currency, createdBy: by })),
    );
  return lines.length;
}

/** On balance receipt: fee_balance, upsell_share and referral_share payouts, once. */
export async function generateBalancePayouts(tx: Tx, cfg: RulesConfig, deal: Deal, invoiceId: string, receivedOn: ISODate, by: string) {
  const existing = await tx
    .select()
    .from(s.creatorPayouts)
    .where(and(eq(s.creatorPayouts.dealId, deal.id), isNull(s.creatorPayouts.archivedAt)));
  if (existing.some((p) => p.kind === "fee_balance" || p.kind === "upsell_share" || p.kind === "referral_share")) return 0;
  const fees = await feesFor(tx, cfg, deal);
  const creatorIds = fees.map((f) => f.creatorId);
  const people = creatorIds.length ? await tx.select({ id: s.creators.id, referredByCreatorId: s.creators.referredByCreatorId }).from(s.creators).where(inArray(s.creators.id, creatorIds)) : [];
  const referred = people.filter((p) => p.referredByCreatorId).map((p) => p.id);
  const prior = new Map<string, number>();
  if (referred.length) {
    const rows = await tx
      .select({ creatorId: s.dealCreators.creatorId, dealId: s.deals.id })
      .from(s.dealCreators)
      .innerJoin(s.deals, eq(s.deals.id, s.dealCreators.dealId))
      .where(and(inArray(s.dealCreators.creatorId, referred), eq(s.deals.stage, "paid_in_full"), ne(s.deals.id, deal.id), eq(s.dealCreators.status, "accepted"), isNull(s.deals.archivedAt)));
    for (const r of rows) prior.set(r.creatorId, (prior.get(r.creatorId) ?? 0) + 1);
  }
  const lines = balancePayouts(cfg, {
    origin: deal.origin,
    originatingCreatorId: deal.originatingCreatorId,
    fees,
    advancePaid: existing.filter((p) => p.kind === "fee_advance").map((p) => ({ creatorId: p.creatorId, amountPaise: p.amountPaise })),
    referrals: referralFacts(people, prior),
    receivedOn,
  });
  if (lines.length)
    await tx.insert(s.creatorPayouts).values(
      lines.map((p) => ({ dealId: deal.id, creatorId: p.creatorId, kind: p.kind, triggeredByInvoiceId: invoiceId, dueOn: p.dueOn, amountPaise: p.amountPaise, currency: deal.currency, createdBy: by })),
    );
  return lines.length;
}

/** live → reported: balance invoice issued at completion, due in balance_due_days. */
export async function issueBalanceInvoice(tx: Tx, cfg: RulesConfig, deal: Deal, completedOn: ISODate, by: string) {
  const invs = await tx.select().from(s.invoices).where(and(eq(s.invoices.dealId, deal.id), isNull(s.invoices.archivedAt), ne(s.invoices.status, "void")));
  if (invs.some((i) => i.kind === "balance")) return null;
  const advanced = invs.filter((i) => i.kind === "advance").reduce((t, i) => t + i.amountPaise, 0);
  const b = balanceInvoice(cfg, deal.signedTotalPaise ?? 0, advanced, completedOn);
  if (b.amountPaise <= 0) return null;
  const number = await nextInvoiceNumber(tx, "balance", Number(completedOn.slice(0, 4)));
  const [row] = await tx
    .insert(s.invoices)
    .values({ dealId: deal.id, kind: "balance", number, issuedOn: b.issuedOn, dueOn: b.dueOn, amountPaise: b.amountPaise, currency: deal.currency, gstPct: cfg.n.gst_pct, status: "sent", createdBy: by })
    .returning();
  return row;
}

/**
 * advance_received → in_production: the campaign, one deliverable per quote-line unit, and a
 * sponsored calendar item per deliverable (one calendar, §0.1 #17). Due dates are the creator's next
 * free slots in the term, avoiding blackouts; an unavoidable blackout overlap is stored as a warning.
 */
export async function createCampaignFromDeal(tx: Tx, cfg: RulesConfig, deal: Deal, brandName: string, today: ISODate, by: string) {
  const [existing] = await tx.select().from(s.campaigns).where(eq(s.campaigns.dealId, deal.id));
  if (existing) return { campaign: existing, created: 0 };
  const lines = await tx
    .select()
    .from(s.dealQuoteLines)
    .where(and(eq(s.dealQuoteLines.dealId, deal.id), isNull(s.dealQuoteLines.archivedAt), eq(s.dealQuoteLines.isCaseByCase, false)));
  const startFloor = addDays(today, cfg.addons.find((a) => a.key === "rush_7d")?.days ?? 7); // no rush by default
  const start = deal.termStartsOn && deal.termStartsOn > startFloor ? deal.termStartsOn : startFloor;
  const [campaign] = await tx
    .insert(s.campaigns)
    .values({ brandId: deal.brandId, dealId: deal.id, name: deal.title, startsOn: deal.termStartsOn ?? today, endsOn: deal.termEndsOn, status: "active", createdBy: by })
    .returning();

  const creatorIds = [...new Set(lines.map((l) => l.creatorId))];
  const [busyRows, blackoutRows] = creatorIds.length
    ? await Promise.all([
        tx
          .select({ creatorId: s.creatorCalendarItems.creatorId, date: s.creatorCalendarItems.date, kind: s.creatorCalendarItems.kind })
          .from(s.creatorCalendarItems)
          .where(and(inArray(s.creatorCalendarItems.creatorId, creatorIds), isNull(s.creatorCalendarItems.archivedAt))),
        tx.select().from(s.creatorBlackouts).where(and(inArray(s.creatorBlackouts.creatorId, creatorIds), isNull(s.creatorBlackouts.archivedAt))),
      ])
    : [[], []];

  const gap = cadenceGapDays(deal.piecesPerMonth);
  let created = 0;
  for (const creatorId of creatorIds) {
    const mine = lines.filter((l) => l.creatorId === creatorId);
    const units = mine.flatMap((l) => Array.from({ length: l.qty }, (_, i) => ({ line: l, n: i + 1, of: l.qty })));
    const slots = suggestDueDates({
      start,
      end: deal.termEndsOn,
      count: units.length,
      gapDays: gap,
      busy: busyRows.filter((b) => b.creatorId === creatorId && b.kind !== "blackout").map((b) => b.date),
      blackouts: blackoutRows.filter((b) => b.creatorId === creatorId).map((b) => ({ startsOn: b.startsOn, endsOn: b.endsOn })),
    });
    for (let i = 0; i < units.length; i++) {
      const { line, n, of } = units[i];
      const def = cfg.deliverables.find((d) => d.key === line.deliverableKey);
      const platform = (def?.platform ?? "other") as (typeof s.platformEnum.enumValues)[number];
      const title = `${def?.label ?? line.deliverableKey}${of > 1 ? ` #${n}` : ""}`;
      const [dl] = await tx
        .insert(s.deliverables)
        .values({ campaignId: campaign.id, creatorId, deliverableKey: line.deliverableKey, platform, title, briefTags: deal.briefTags, dueOn: slots[i].date, warnings: slots[i].warnings, createdBy: by })
        .returning({ id: s.deliverables.id });
      await tx.insert(s.creatorCalendarItems).values({
        creatorId,
        date: slots[i].date,
        kind: "sponsored",
        title: `${brandName} · ${title}`,
        platform,
        deliverableId: dl.id,
        campaignId: campaign.id,
        notes: deal.briefMd ?? null,
        createdBy: by,
      });
      created++;
    }
  }

  if (deal.frontseatAmplification) {
    // Five tracked amplification posts with Frontseat as the channel (§8.4). They are Frontseat's posts,
    // not the creator's, so they get no calendar item and never count toward the creator's sponsored ratio.
    // BRIEF: clarify — deliverables.creator_id is required; amplification rows hang off the primary creator.
    const [primary] = await tx
      .select({ creatorId: s.dealCreators.creatorId })
      .from(s.dealCreators)
      .where(and(eq(s.dealCreators.dealId, deal.id), eq(s.dealCreators.status, "accepted"), isNull(s.dealCreators.archivedAt)))
      .orderBy(s.dealCreators.role, s.dealCreators.createdAt)
      .limit(1);
    const owner = primary?.creatorId ?? creatorIds[0];
    if (owner) {
      const amp = suggestDueDates({ start, end: deal.termEndsOn, count: 5, gapDays: gap, busy: [], blackouts: [] });
      for (let i = 0; i < 5; i++) {
        await tx.insert(s.deliverables).values({
          campaignId: campaign.id,
          creatorId: owner,
          deliverableKey: "frontseat_amplification",
          platform: "instagram",
          title: `Frontseat amplification #${i + 1}`,
          channel: "frontseat",
          briefTags: deal.briefTags,
          dueOn: amp[i].date,
          createdBy: by,
        });
        created++;
      }
    }
  }
  return { campaign, created };
}
