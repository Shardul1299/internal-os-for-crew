// Deals read models — board, list, declined log, footer totals, the deal record (BRIEF §5, §10).
// Gates come from lib/rules via dealFacts(); nothing here re-implements a rule.
import "server-only";
import { and, asc, desc, eq, gte, inArray, isNull, lte, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getConfig } from "@/lib/settings";
import { dealFacts } from "./facts";
import { withBlockers } from "./deliverables";
import { canAdvance, firstBlocker, nextStage, hasOverride, topicConflicts, isAtLeast, DEAL_STAGES, type DealStage } from "@/lib/rules/deals";
import { finalLineTotal, rungMix, resolveStandard, commissionPct, splitDeal } from "@/lib/rules/ladder";
import { creatorFees, ledger, lateFee, isOverdue } from "@/lib/rules/money";
import { sponsoredHeadroom } from "@/lib/rules/schedule";
import { latestFilter } from "@/lib/rules/creators";
import { RUNG_ORDER, type RungKey, type Tier } from "@/lib/rules/config";
import { today as todayISO, daysBetween, toISO, type ISODate } from "@/lib/dates";
import { filterScoresFor } from "./facts";

export type DealRow = {
  id: string;
  brandId: string;
  brand: string;
  title: string;
  stage: DealStage;
  type: string | null;
  origin: string;
  totalPaise: number;
  currency: "INR" | "USD";
  rungMix: string;
  daysInStage: number;
  blocker: string | null;
  stageChangedAt: ISODate;
  createdAt: ISODate;
  declinedReason: string | null;
  declinedValuePaise: number | null;
  lostReason: string | null;
};

export type DealsFooter = { pipelinePaise: number; signedQuarterPaise: number; declinedPaise: number; declinedCount: number };

function quarterStart(d: ISODate): ISODate {
  const m = Number(d.slice(5, 7));
  const qm = Math.floor((m - 1) / 3) * 3 + 1;
  return `${d.slice(0, 4)}-${String(qm).padStart(2, "0")}-01`;
}

/** Board + list + declined log rows with blockers from canAdvance (via firstBlocker). */
export async function getDeals(): Promise<{ rows: DealRow[]; footer: DealsFooter }> {
  const cfg = await getConfig();
  const t = todayISO();
  const deals = await db
    .select({ d: s.deals, brand: s.brands.name })
    .from(s.deals)
    .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
    .where(isNull(s.deals.archivedAt))
    .orderBy(desc(s.deals.stageChangedAt));
  const ids = deals.map((x) => x.d.id);
  const [lines, signedActs] = ids.length
    ? await Promise.all([
        db.select().from(s.dealQuoteLines).where(and(inArray(s.dealQuoteLines.dealId, ids), isNull(s.dealQuoteLines.archivedAt))),
        db
          .select({ dealId: s.dealActivity.dealId, at: s.dealActivity.at, body: s.dealActivity.bodyMd })
          .from(s.dealActivity)
          .where(and(inArray(s.dealActivity.dealId, ids), eq(s.dealActivity.kind, "stage_change"))),
      ])
    : [[], []];
  const open = deals.filter((x) => !["declined", "lost", "paid_in_full"].includes(x.d.stage));
  const facts = new Map(await Promise.all(open.map(async (x) => [x.d.id, await dealFacts(x.d.id)] as const)));

  const rows: DealRow[] = deals.map(({ d, brand }) => {
    const mine = lines.filter((l) => l.dealId === d.id);
    const linesTotal = mine.reduce(
      (tt, l) => tt + finalLineTotal(cfg, { creatorId: l.creatorId, deliverableKey: l.deliverableKey, qty: l.qty, standardPaise: l.standardPaise, rung: l.rung, addons: l.addons.map((a) => a.key), manualTotalPaise: l.manualTotalPaise, isCaseByCase: l.isCaseByCase }),
      0,
    );
    const fx = facts.get(d.id);
    return {
      id: d.id,
      brandId: d.brandId,
      brand,
      title: d.title,
      stage: d.stage,
      type: d.type,
      origin: d.origin,
      totalPaise: d.signedTotalPaise ?? (mine.length ? linesTotal : d.quotedTotalPaise),
      currency: d.currency,
      rungMix: rungMix(mine.filter((l) => !l.isCaseByCase)),
      daysInStage: daysBetween(toISO(d.stageChangedAt)!, t),
      blocker: fx ? firstBlocker(cfg, fx.facts, t) : null,
      stageChangedAt: toISO(d.stageChangedAt)!,
      createdAt: toISO(d.createdAt)!,
      declinedReason: d.declinedReason,
      declinedValuePaise: d.declinedValuePaise,
      lostReason: d.lostReason,
    };
  });

  // Signed date: the stage_change row into "signed", else the term start, else the stage change.
  const qs = quarterStart(t);
  const signedOn = (r: DealRow, d: typeof s.deals.$inferSelect): ISODate => {
    const act = signedActs.filter((a) => a.dealId === r.id && /→ Signed$/.test(a.body)).sort((a, b) => (a.at < b.at ? -1 : 1))[0];
    return act ? toISO(act.at)! : (d.termStartsOn ?? r.stageChangedAt);
  };
  // BRIEF: clarify — "Pipeline" read as open deals not yet signed (lead → negotiation), at their quoted value.
  const footer: DealsFooter = { pipelinePaise: 0, signedQuarterPaise: 0, declinedPaise: 0, declinedCount: 0 };
  for (const { d } of deals) {
    const r = rows.find((x) => x.id === d.id)!;
    if (d.stage === "declined") {
      footer.declinedPaise += d.declinedValuePaise ?? 0;
      footer.declinedCount++;
    } else if (d.stage !== "lost") {
      if (isAtLeast(d.stage, "signed")) {
        if (signedOn(r, d) >= qs) footer.signedQuarterPaise += d.signedTotalPaise ?? r.totalPaise;
      } else footer.pipelinePaise += r.totalPaise;
    }
  }
  return { rows, footer };
}

export type DealsExportRow = DealRow;

// ---------- Deal record ----------

export async function userNames(ids: (string | null | undefined)[]) {
  const uniq = [...new Set(ids.filter((x): x is string => !!x))];
  if (!uniq.length) return new Map<string, string>();
  const rows = await db.select({ id: s.users.id, name: s.users.name, email: s.users.email }).from(s.users).where(inArray(s.users.id, uniq));
  return new Map(rows.map((r) => [r.id, r.name ?? r.email ?? "—"]));
}

function monthBounds(date: ISODate) {
  const [y, m] = date.split("-").map(Number);
  return { start: `${date.slice(0, 7)}-01`, end: new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10) };
}

const SIGNED_PLUS = DEAL_STAGES.slice(DEAL_STAGES.indexOf("signed")) as (typeof s.dealStageEnum.enumValues)[number][];

export type StandardCell = { standardPaise: number; isDefault: boolean };

export async function getDealRecord(id: string) {
  const cfg = await getConfig();
  const t = todayISO();
  const fx = await dealFacts(id);
  if (!fx) return null;
  const { deal, brand, facts } = fx;
  const [dcs, lineRows, overrides, activity, invoices, payouts, campaignRows] = await Promise.all([
    db
      .select({ dc: s.dealCreators, c: s.creators })
      .from(s.dealCreators)
      .innerJoin(s.creators, eq(s.creators.id, s.dealCreators.creatorId))
      .where(and(eq(s.dealCreators.dealId, id), isNull(s.dealCreators.archivedAt)))
      .orderBy(asc(s.dealCreators.role), asc(s.dealCreators.createdAt)),
    db.select().from(s.dealQuoteLines).where(and(eq(s.dealQuoteLines.dealId, id), isNull(s.dealQuoteLines.archivedAt))).orderBy(asc(s.dealQuoteLines.createdAt)),
    db.select().from(s.dealOverrides).where(eq(s.dealOverrides.dealId, id)).orderBy(desc(s.dealOverrides.createdAt)),
    db.select().from(s.dealActivity).where(and(eq(s.dealActivity.dealId, id), isNull(s.dealActivity.archivedAt))).orderBy(desc(s.dealActivity.at)),
    db.select().from(s.invoices).where(and(eq(s.invoices.dealId, id), isNull(s.invoices.archivedAt))).orderBy(asc(s.invoices.issuedOn)),
    db
      .select({ p: s.creatorPayouts, name: s.creators.displayName })
      .from(s.creatorPayouts)
      .innerJoin(s.creators, eq(s.creators.id, s.creatorPayouts.creatorId))
      .where(and(eq(s.creatorPayouts.dealId, id), isNull(s.creatorPayouts.archivedAt)))
      .orderBy(asc(s.creatorPayouts.dueOn)),
    db.select().from(s.campaigns).where(eq(s.campaigns.dealId, id)),
  ]);
  const campaign = campaignRows[0] ?? null;
  const deliverableRows = campaign ? await db.select().from(s.deliverables).where(and(eq(s.deliverables.campaignId, campaign.id), isNull(s.deliverables.archivedAt))).orderBy(asc(s.deliverables.dueOn)) : [];
  const deliverables = await withBlockers(cfg, deliverableRows);

  // Creators on the deal, with what the Match and Quote steps show.
  const dealCreatorIds = dcs.map((x) => x.c.id);
  const scores = await filterScoresFor(dealCreatorIds);
  const creators = dcs.map(({ dc, c }) => ({
    linkId: dc.id,
    id: c.id,
    name: c.displayName,
    role: dc.role,
    status: dc.status,
    stage: c.stage,
    tier: c.tier as Tier | null,
    subCategory: c.subCategory,
    filterTotal: latestFilter(scores.get(c.id) ?? [])?.total ?? null,
    referredByCreatorId: c.referredByCreatorId,
    conflicts: topicConflicts(deal.briefTags, facts.creators.find((x) => x.id === c.id)?.topicFilters ?? []),
  }));

  // Standards table: creator × deliverable → own Standard or the flagged default.
  const rates = dealCreatorIds.length
    ? await db
        .select()
        .from(s.creatorStandardRates)
        .where(and(inArray(s.creatorStandardRates.creatorId, dealCreatorIds), eq(s.creatorStandardRates.currency, deal.currency), isNull(s.creatorStandardRates.archivedAt)))
    : [];
  const standards: Record<string, Record<string, StandardCell>> = {};
  for (const c of creators) {
    standards[c.id] = {};
    for (const d of cfg.deliverables) {
      const own = rates.find((r) => r.creatorId === c.id && r.deliverableKey === d.key)?.standardPaise ?? null;
      standards[c.id][d.key] = resolveStandard(cfg, { ownStandardPaise: own, deliverableKey: d.key, tier: c.tier });
    }
  }
  // Usual close per creator: their most frequent rung on signed deals (for the quarterly default).
  const usualClose: Record<string, RungKey> = {};
  if (dealCreatorIds.length) {
    const past = await db
      .select({ creatorId: s.dealQuoteLines.creatorId, rung: s.dealQuoteLines.rung })
      .from(s.dealQuoteLines)
      .innerJoin(s.deals, eq(s.deals.id, s.dealQuoteLines.dealId))
      .where(and(inArray(s.dealQuoteLines.creatorId, dealCreatorIds), inArray(s.deals.stage, SIGNED_PLUS), ne(s.deals.id, id), eq(s.dealQuoteLines.isCaseByCase, false)));
    for (const cid of dealCreatorIds) {
      const counts = new Map<RungKey, number>();
      for (const p of past.filter((x) => x.creatorId === cid)) counts.set(p.rung, (counts.get(p.rung) ?? 0) + 1);
      const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || RUNG_ORDER.indexOf(a[0]) - RUNG_ORDER.indexOf(b[0]))[0];
      if (best) usualClose[cid] = best[0];
    }
  }

  // Quote lines and splits.
  const lines = lineRows.map((l) => ({
    ...l,
    creatorName: creators.find((c) => c.id === l.creatorId)?.name ?? "—",
    totalPaise: finalLineTotal(cfg, { creatorId: l.creatorId, deliverableKey: l.deliverableKey, qty: l.qty, standardPaise: l.standardPaise, rung: l.rung, addons: l.addons.map((a) => a.key), manualTotalPaise: l.manualTotalPaise, isCaseByCase: l.isCaseByCase }),
  }));
  const quoteTotal = lines.reduce((tt, l) => tt + l.totalPaise, 0);
  const commission = commissionPct(cfg, deal.origin);
  const fees = creatorFees(
    lines.map((l) => ({ creatorId: l.creatorId, totalPaise: l.totalPaise })),
    creators.map((c) => ({ id: c.id, role: c.role })),
    null,
  );
  const splits = splitDeal(cfg, deal.origin, fees);
  const signedFees = creatorFees(
    lines.map((l) => ({ creatorId: l.creatorId, totalPaise: l.totalPaise })),
    creators.map((c) => ({ id: c.id, role: c.role })),
    deal.signedTotalPaise,
  );
  const signedSplits = splitDeal(cfg, deal.origin, signedFees);
  const commissionPaise = signedSplits.reduce((tt, x) => tt + x.crewCommissionPaise, 0);
  const sharesPaise = payouts.filter(({ p }) => p.kind === "upsell_share" || p.kind === "referral_share").reduce((tt, { p }) => tt + p.amountPaise, 0);
  const led = ledger(
    invoices.map((i) => ({ kind: i.kind, amountPaise: i.amountPaise, paidAmountPaise: i.paidAmountPaise, status: i.status, dueOn: i.dueOn })),
    payouts.map(({ p }) => ({ kind: p.kind, amountPaise: p.amountPaise, status: p.status })),
    commissionPaise - sharesPaise,
    t,
  );

  // Roster picker for Match: roster creators (Tier 0 only with an approved override), not already on the deal.
  const t0 = hasOverride(facts, "tier0_in_deal");
  const pool = await db
    .select()
    .from(s.creators)
    .where(and(inArray(s.creators.stage, t0 ? ["roster", "incubation"] : ["roster"]), isNull(s.creators.archivedAt)))
    .orderBy(asc(s.creators.displayName));
  const poolIds = pool.filter((c) => !dealCreatorIds.includes(c.id)).map((c) => c.id);
  const { start, end } = monthBounds(t);
  const [poolScores, poolTopics, poolMonth, poolAnchors] = poolIds.length
    ? await Promise.all([
        filterScoresFor(poolIds),
        db.select().from(s.creatorTopicFilters).where(and(inArray(s.creatorTopicFilters.creatorId, poolIds), eq(s.creatorTopicFilters.active, true), isNull(s.creatorTopicFilters.archivedAt))),
        db
          .select({ creatorId: s.creatorCalendarItems.creatorId, kind: s.creatorCalendarItems.kind })
          .from(s.creatorCalendarItems)
          .where(and(inArray(s.creatorCalendarItems.creatorId, poolIds), gte(s.creatorCalendarItems.date, start), lte(s.creatorCalendarItems.date, end), isNull(s.creatorCalendarItems.archivedAt))),
        db.select().from(s.creatorAnchorPlans).where(inArray(s.creatorAnchorPlans.creatorId, poolIds)),
      ])
    : [new Map(), [], [], []];
  const originating = creators.find((c) => c.id === deal.originatingCreatorId);
  const candidates = pool
    .filter((c) => poolIds.includes(c.id))
    .map((c) => ({
      id: c.id,
      name: c.displayName,
      stage: c.stage,
      subCategory: c.subCategory,
      filterTotal: latestFilter((poolScores as Map<string, never[]>).get(c.id) ?? [])?.total ?? null,
      conflicts: topicConflicts(
        deal.briefTags,
        poolTopics.filter((x) => x.creatorId === c.id).map((x) => ({ kind: x.kind, value: x.value })),
      ),
      headroom: sponsoredHeadroom(
        poolMonth.filter((m) => m.creatorId === c.id),
        poolAnchors.find((a) => a.creatorId === c.id)?.sponsoredRatioMax ?? cfg.n.sponsored_ratio_max,
      ),
      inBand: !!originating && c.subCategory === originating.subCategory,
    }))
    .sort((a, b) => Number(b.inBand) - Number(a.inBand) || (b.filterTotal ?? 0) - (a.filterTotal ?? 0));

  const names = await userNames([
    ...overrides.flatMap((o) => [o.requestedBy, o.approvedBy]),
    ...activity.map((a) => a.by),
    deal.noListCheck?.checked_by,
    deal.ownerUserId,
    brand.riskReviewedBy,
  ]);

  // Gate for the next move and the exits, for the stage pill.
  const next = nextStage(deal.stage);
  const nextGate = next ? canAdvance(cfg, facts, next, t) : null;
  const blocker = firstBlocker(cfg, facts, t);

  const overdue = invoices
    .filter((i) => isOverdue(i.dueOn, i.status, t))
    .map((i) => ({ id: i.id, days: daysBetween(i.dueOn, t), lateFeePaise: lateFee(cfg, i.amountPaise - (i.paidAmountPaise ?? 0), i.dueOn, t) }));

  return {
    cfg,
    today: t,
    deal,
    brand,
    facts,
    creators,
    standards,
    usualClose,
    lines,
    quoteTotal,
    commission,
    splits,
    signedSplits,
    overrides,
    activity,
    invoices,
    payouts: payouts.map(({ p, name }) => ({ ...p, creatorName: name })),
    overdue,
    ledger: led,
    campaign,
    deliverables: deliverables.map((d) => ({
      ...d,
      creatorName: creators.find((c) => c.id === d.creatorId)?.name ?? "—",
      // Scheduling warnings stored at creation (e.g. a due date inside a blackout week).
      storedWarnings: deliverableRows.find((x) => x.id === d.id)?.warnings ?? [],
    })),
    candidates,
    names,
    next,
    nextGate,
    blocker,
    t0Override: t0,
  };
}

export type DealRecord = NonNullable<Awaited<ReturnType<typeof getDealRecord>>>;

/** Brands for the new-deal sheet, roster creators for the originating-creator select. */
export async function getNewDealOptions() {
  const [brands, creators] = await Promise.all([
    db.select({ id: s.brands.id, name: s.brands.name, ownerTeam: s.brands.ownerTeam }).from(s.brands).where(isNull(s.brands.archivedAt)).orderBy(asc(s.brands.name)),
    db
      .select({ id: s.creators.id, name: s.creators.displayName })
      .from(s.creators)
      .where(and(inArray(s.creators.stage, ["roster", "incubation"]), isNull(s.creators.archivedAt)))
      .orderBy(asc(s.creators.displayName)),
  ]);
  return { brands, creators };
}

/** Calculator: roster/T0 creators with their Standards per deliverable. Tier stays on Crew Desk. */
export async function getCalculatorData() {
  const cfg = await getConfig();
  const creators = await db
    .select({ id: s.creators.id, name: s.creators.displayName, tier: s.creators.tier })
    .from(s.creators)
    .where(and(inArray(s.creators.stage, ["roster", "incubation"]), isNull(s.creators.archivedAt)))
    .orderBy(asc(s.creators.displayName));
  const rates = creators.length
    ? await db
        .select()
        .from(s.creatorStandardRates)
        .where(and(inArray(s.creatorStandardRates.creatorId, creators.map((c) => c.id)), eq(s.creatorStandardRates.currency, "INR"), isNull(s.creatorStandardRates.archivedAt)))
    : [];
  const standards: Record<string, Record<string, StandardCell>> = {};
  for (const c of creators) {
    standards[c.id] = {};
    for (const d of cfg.deliverables) {
      const own = rates.find((r) => r.creatorId === c.id && r.deliverableKey === d.key)?.standardPaise ?? null;
      standards[c.id][d.key] = resolveStandard(cfg, { ownStandardPaise: own, deliverableKey: d.key, tier: c.tier });
    }
  }
  const tierDefaults: Record<string, Record<string, StandardCell>> = {};
  for (const tier of ["T0", "T1", "T2", "T3"] as Tier[]) {
    tierDefaults[tier] = {};
    for (const d of cfg.deliverables) tierDefaults[tier][d.key] = resolveStandard(cfg, { ownStandardPaise: null, deliverableKey: d.key, tier });
  }
  return { cfg, creators: creators.map((c) => ({ id: c.id, name: c.name })), standards, tierDefaults };
}

/** Template bodies by key (sow, cpv_reframe_page, self_serve). */
export async function getTemplate(key: string) {
  const [row] = await db.select().from(s.templates).where(eq(s.templates.key, key));
  return row?.bodyMd ?? "";
}
