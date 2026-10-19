// Loads database rows into the plain "facts" the rules engine evaluates (lib/rules/*).
// Every gate in the UI and in server actions goes through these, so the UI never re-implements a rule.
import "server-only";
import { and, eq, inArray, isNull, notInArray, sql as dsql, count, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import type { CreatorFacts, FilterScore } from "@/lib/rules/creators";
import type { DealFacts, DealCreatorFacts, OverrideKind } from "@/lib/rules/deals";
import { toISO } from "@/lib/dates";

export async function filterScoresFor(creatorIds: string[]): Promise<Map<string, FilterScore[]>> {
  const map = new Map<string, FilterScore[]>();
  if (!creatorIds.length) return map;
  const rows = await db
    .select()
    .from(s.creatorFilterScores)
    .where(and(inArray(s.creatorFilterScores.creatorId, creatorIds), isNull(s.creatorFilterScores.archivedAt)))
    .orderBy(desc(s.creatorFilterScores.scoredAt));
  for (const r of rows) {
    const arr = map.get(r.creatorId) ?? [];
    arr.push({ aesthetics: r.aesthetics, taste: r.taste, personality: r.personality, total: r.total, sentence: r.sentence, scoredAt: toISO(r.scoredAt)!, context: r.context });
    map.set(r.creatorId, arr);
  }
  return map;
}

export async function creatorFacts(creatorId: string): Promise<{ creator: typeof s.creators.$inferSelect; facts: CreatorFacts } | null> {
  const [c] = await db.select().from(s.creators).where(eq(s.creators.id, creatorId));
  if (!c) return null;
  const [scores, signals, topics, anchor, entry, openDeals, unsettled, agreement] = await Promise.all([
    filterScoresFor([creatorId]),
    db.select({ n: count() }).from(s.creatorTierSignals).where(and(eq(s.creatorTierSignals.creatorId, creatorId), isNull(s.creatorTierSignals.archivedAt))),
    db.select({ n: count() }).from(s.creatorTopicFilters).where(and(eq(s.creatorTopicFilters.creatorId, creatorId), eq(s.creatorTopicFilters.active, true), isNull(s.creatorTopicFilters.archivedAt))),
    db.select({ id: s.creatorAnchorPlans.id }).from(s.creatorAnchorPlans).where(eq(s.creatorAnchorPlans.creatorId, creatorId)),
    db
      .select({ rank: s.programEntries.rank, topN: s.programChallenges.topN })
      .from(s.programEntries)
      .innerJoin(s.programChallenges, eq(s.programChallenges.id, s.programEntries.challengeId))
      .where(eq(s.programEntries.creatorId, creatorId))
      .orderBy(desc(s.programEntries.createdAt))
      .limit(1),
    db
      .select({ n: count() })
      .from(s.dealCreators)
      .innerJoin(s.deals, eq(s.deals.id, s.dealCreators.dealId))
      .where(and(eq(s.dealCreators.creatorId, creatorId), notInArray(s.deals.stage, ["paid_in_full", "declined", "lost"]), isNull(s.deals.archivedAt))),
    db.select({ n: count() }).from(s.creatorPayouts).where(and(eq(s.creatorPayouts.creatorId, creatorId), inArray(s.creatorPayouts.status, ["due", "held"]))),
    db.select().from(s.creatorAgreements).where(eq(s.creatorAgreements.creatorId, creatorId)),
  ]);
  return {
    creator: c,
    facts: {
      stage: c.stage,
      source: c.source,
      subCategory: c.subCategory,
      consentStatus: c.consentStatus,
      representedElsewhere: c.representedElsewhere,
      isEmployedElsewhere: c.isEmployedElsewhere,
      employerDisclosureUrl: c.employerDisclosureUrl,
      isFounder: c.isFounder,
      ownProductContentPct: c.ownProductContentPct,
      filterScores: scores.get(creatorId) ?? [],
      tierSignalCount: signals[0]?.n ?? 0,
      topicFilterCount: topics[0]?.n ?? 0,
      hasAnchorPlan: anchor.length > 0,
      programEntry: entry[0] ? { rank: entry[0].rank, topN: entry[0].topN } : null,
      ownerNote: c.stageReason,
      openDealCount: openDeals[0]?.n ?? 0,
      unsettledPayoutCount: unsettled[0]?.n ?? 0,
      agreementStatus: agreement[0]?.status ?? null,
      pilotEndsOn: agreement[0]?.pilotEndsOn ?? null,
    },
  };
}

export async function dealFacts(dealId: string): Promise<{ deal: typeof s.deals.$inferSelect; brand: typeof s.brands.$inferSelect; facts: DealFacts } | null> {
  const [d] = await db.select().from(s.deals).where(eq(s.deals.id, dealId));
  if (!d) return null;
  const [brand] = await db.select().from(s.brands).where(eq(s.brands.id, d.brandId));
  const [dcs, lines, overrides, invoices, campaign, payouts] = await Promise.all([
    db
      .select({ dc: s.dealCreators, c: s.creators })
      .from(s.dealCreators)
      .innerJoin(s.creators, eq(s.creators.id, s.dealCreators.creatorId))
      .where(and(eq(s.dealCreators.dealId, dealId), isNull(s.dealCreators.archivedAt))),
    db.select().from(s.dealQuoteLines).where(and(eq(s.dealQuoteLines.dealId, dealId), isNull(s.dealQuoteLines.archivedAt))),
    db.select().from(s.dealOverrides).where(eq(s.dealOverrides.dealId, dealId)),
    db.select().from(s.invoices).where(and(eq(s.invoices.dealId, dealId), isNull(s.invoices.archivedAt))),
    db.select().from(s.campaigns).where(eq(s.campaigns.dealId, dealId)),
    db.select().from(s.creatorPayouts).where(and(eq(s.creatorPayouts.dealId, dealId), isNull(s.creatorPayouts.archivedAt))),
  ]);
  const creatorIds = dcs.map((x) => x.c.id);
  const [scores, signalCounts, topicRows] = await Promise.all([
    filterScoresFor(creatorIds),
    creatorIds.length
      ? db
          .select({ creatorId: s.creatorTierSignals.creatorId, n: count() })
          .from(s.creatorTierSignals)
          .where(inArray(s.creatorTierSignals.creatorId, creatorIds))
          .groupBy(s.creatorTierSignals.creatorId)
      : Promise.resolve([]),
    creatorIds.length
      ? db
          .select()
          .from(s.creatorTopicFilters)
          .where(and(inArray(s.creatorTopicFilters.creatorId, creatorIds), eq(s.creatorTopicFilters.active, true), isNull(s.creatorTopicFilters.archivedAt)))
      : Promise.resolve([]),
  ]);
  const deliverables = campaign[0]
    ? await db.select({ status: s.deliverables.status }).from(s.deliverables).where(and(eq(s.deliverables.campaignId, campaign[0].id), isNull(s.deliverables.archivedAt)))
    : [];
  const adv = invoices.filter((i) => i.kind === "advance" && i.status !== "void").sort((a, b) => (a.issuedOn < b.issuedOn ? 1 : -1))[0];
  const bal = invoices.filter((i) => i.kind === "balance" && i.status !== "void").sort((a, b) => (a.issuedOn < b.issuedOn ? 1 : -1))[0];
  const creators: DealCreatorFacts[] = dcs.map(({ dc, c }) => ({
    id: c.id,
    name: c.displayName,
    role: dc.role,
    status: dc.status,
    stage: c.stage,
    source: c.source,
    subCategory: c.subCategory,
    consentStatus: c.consentStatus,
    representedElsewhere: c.representedElsewhere,
    isEmployedElsewhere: c.isEmployedElsewhere,
    employerDisclosureUrl: c.employerDisclosureUrl,
    isFounder: c.isFounder,
    ownProductContentPct: c.ownProductContentPct,
    filterScores: scores.get(c.id) ?? [],
    tierSignalCount: signalCounts.find((x) => x.creatorId === c.id)?.n ?? 0,
    topicFilterCount: topicRows.filter((t) => t.creatorId === c.id).length,
    hasAnchorPlan: true,
    topicFilters: topicRows.filter((t) => t.creatorId === c.id).map((t) => ({ kind: t.kind, value: t.value })),
  }));
  const facts: DealFacts = {
    stage: d.stage,
    type: d.type,
    oneOffReason: d.oneOffReason,
    origin: d.origin,
    originatingCreatorId: d.originatingCreatorId,
    quotedTotalPaise: d.quotedTotalPaise,
    signedTotalPaise: d.signedTotalPaise,
    termStartsOn: d.termStartsOn,
    termEndsOn: d.termEndsOn,
    piecesPerMonth: d.piecesPerMonth,
    exclusivity: d.exclusivity,
    usageRights: d.usageRights,
    briefMd: d.briefMd,
    briefUrl: d.briefUrl,
    briefTags: d.briefTags,
    referralNote: d.referralNote,
    sowMd: d.sowMd,
    sowUrl: d.sowUrl,
    poReference: d.poReference,
    confirmationUrl: d.confirmationUrl,
    reportUrl: d.reportUrl ?? campaign[0]?.reportUrl ?? null,
    reportMd: campaign[0]?.reportMd ?? null,
    feedbackRequested: !!campaign[0]?.feedbackRequestedAt,
    noListCheck: d.noListCheck
      ? {
          rev_share_only: d.noListCheck.rev_share_only,
          no_budget_educational: d.noListCheck.no_budget_educational,
          barter: d.noListCheck.barter,
          lifetime_rights: d.noListCheck.lifetime_rights,
          shady_tool: d.noListCheck.shady_tool,
          blocklist_category: d.noListCheck.blocklist_category,
        }
      : null,
    declinedReason: d.declinedReason,
    declinedValuePaise: d.declinedValuePaise,
    lostReason: d.lostReason,
    brand: { ownerTeam: brand.ownerTeam, riskReviewedAt: toISO(brand.riskReviewedAt), isHouseClient: brand.isHouseClient },
    creators,
    lines: lines.map((l) => ({
      creatorId: l.creatorId,
      deliverableKey: l.deliverableKey,
      qty: l.qty,
      standardPaise: l.standardPaise,
      rung: l.rung,
      addons: l.addons.map((a) => a.key),
      manualTotalPaise: l.manualTotalPaise,
      isCaseByCase: l.isCaseByCase,
    })),
    overrides: overrides.map((o) => ({ kind: o.kind as OverrideKind, approved: !!o.approvedAt && !o.rejectedAt })),
    advanceInvoice: adv ? { status: adv.status, paidAmountPaise: adv.paidAmountPaise, amountPaise: adv.amountPaise } : null,
    balanceInvoice: bal ? { status: bal.status } : null,
    deliverables,
    payouts: payouts.map((p) => ({ status: p.status })),
  };
  return { deal: d, brand, facts };
}

export const _sql = dsql;
