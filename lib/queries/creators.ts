// Read models for Creators and the Creator record (BRIEF §4, §9, §10, §20).
// Gates are evaluated through lib/rules; these functions only load rows and shape them.
import "server-only";
import { and, asc, desc, eq, gte, ilike, inArray, isNull, lte, notInArray, or, sql as dsql, arrayContains } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { filterScoresFor, creatorFacts } from "./facts";
import { latestFilter, rosterGate, rosterVerdict, type FilterScore, type Stage } from "@/lib/rules/creators";
import { stageMoves } from "@/lib/rules/creator-flow";
import { calendarAdherence, type CalendarItemLite } from "@/lib/rules/studio";
import { checkinAdherence } from "@/lib/rules/retention";
import { churn12m, renewalRate, dealTypeShare, brandRepeatRate, averageFeedback, type DealRow } from "@/lib/rules/retention-metrics";
import type { RulesConfig } from "@/lib/rules/config";
import { can } from "@/lib/rules/visibility";
import { parseQuery } from "@/lib/search";
import { addDays, toISO, type ISODate } from "@/lib/dates";

export const SEGMENTS = ["all", "scout", "watchlist", "incubation", "roster", "alumni", "revisit", "declined"] as const;
export type Segment = (typeof SEGMENTS)[number];
const OPEN_DEAL_EXCLUDE = ["paid_in_full", "declined", "lost"] as ("paid_in_full" | "declined" | "lost")[];

export type CreatorRow = {
  id: string;
  name: string;
  stage: Stage;
  subCategory: string;
  source: string;
  languages: string[];
  tier: string | null;
  filter: FilterScore | null;
  nextCheckin: { dueOn: ISODate; type: string } | null;
  openDeals: number;
  adherence: number | null;
  handle: string | null;
  followers: number | null;
  rosterProposed: boolean;
};

async function calendarItemsSince(creatorIds: string[], since: ISODate, until: ISODate) {
  if (!creatorIds.length) return new Map<string, CalendarItemLite[]>();
  const rows = await db
    .select({
      creatorId: s.creatorCalendarItems.creatorId,
      date: s.creatorCalendarItems.date,
      kind: s.creatorCalendarItems.kind,
      pillar: s.creatorCalendarItems.pillar,
      conceptBucket: s.creatorCalendarItems.conceptBucket,
      studioStatus: s.creatorCalendarItems.studioStatus,
    })
    .from(s.creatorCalendarItems)
    .where(and(inArray(s.creatorCalendarItems.creatorId, creatorIds), gte(s.creatorCalendarItems.date, since), lte(s.creatorCalendarItems.date, until), isNull(s.creatorCalendarItems.archivedAt)));
  const map = new Map<string, CalendarItemLite[]>();
  for (const r of rows) {
    const arr = map.get(r.creatorId) ?? [];
    arr.push(r);
    map.set(r.creatorId, arr);
  }
  return map;
}

/** The Creators list: segment + token search (`sub:` `tier:` `src:` `lang:` `stage:`). */
export async function listCreators(args: { seg: Segment; q?: string; role: string; today: ISODate; cfg: RulesConfig }): Promise<{ rows: CreatorRow[]; counts: Record<Segment, number> }> {
  const { text, tokens } = parseQuery(args.q);
  const canTier = can(args.role, "tier");
  const where = [isNull(s.creators.archivedAt)];
  const stages = (tokens.stage ?? []).filter((x): x is Stage => (SEGMENTS as readonly string[]).includes(x) && x !== "all");
  if (args.seg !== "all") where.push(eq(s.creators.stage, args.seg));
  else if (!stages.length) where.push(notInArray(s.creators.stage, ["declined"]));
  if (stages.length) where.push(inArray(s.creators.stage, stages));
  const subs = (tokens.sub ?? []).filter((x) => s.subCategoryEnum.enumValues.includes(x as never));
  if (tokens.sub && !subs.length) return { rows: [], counts: await segmentCounts() };
  if (subs.length) where.push(inArray(s.creators.subCategory, subs as (typeof s.subCategoryEnum.enumValues)[number][]));
  const srcs = (tokens.src ?? []).filter((x) => s.creatorSourceEnum.enumValues.includes(x as never));
  if (tokens.src && !srcs.length) return { rows: [], counts: await segmentCounts() };
  if (srcs.length) where.push(inArray(s.creators.source, srcs as (typeof s.creatorSourceEnum.enumValues)[number][]));
  if (canTier && tokens.tier) {
    const tiers = tokens.tier.map((t) => t.toUpperCase()).filter((t) => ["T0", "T1", "T2", "T3"].includes(t)) as ("T0" | "T1" | "T2" | "T3")[];
    if (tokens.tier.includes("none")) where.push(or(isNull(s.creators.tier), tiers.length ? inArray(s.creators.tier, tiers) : dsql`false`)!);
    else where.push(tiers.length ? inArray(s.creators.tier, tiers) : dsql`false`);
  }
  for (const l of tokens.lang ?? []) where.push(arrayContains(s.creators.languages, [l]));
  if (text) {
    const like = `%${text}%`;
    where.push(
      or(
        ilike(s.creators.displayName, like),
        ilike(s.creators.legalName, like),
        ilike(s.creators.city, like),
        dsql`exists (select 1 from ${s.creatorPlatforms} p where p.creator_id = ${s.creators.id} and p.handle ilike ${like} and p.archived_at is null)`,
      )!,
    );
  }
  const creators = await db
    .select()
    .from(s.creators)
    .where(and(...where))
    .orderBy(asc(s.creators.displayName));
  const ids = creators.map((c) => c.id);
  const [scores, checkins, deals, cal, platforms, counts] = await Promise.all([
    filterScoresFor(ids),
    ids.length
      ? db
          .select({ creatorId: s.creatorCheckins.creatorId, dueOn: s.creatorCheckins.dueOn, type: s.creatorCheckins.type })
          .from(s.creatorCheckins)
          .where(and(inArray(s.creatorCheckins.creatorId, ids), isNull(s.creatorCheckins.heldOn), isNull(s.creatorCheckins.archivedAt)))
          .orderBy(asc(s.creatorCheckins.dueOn))
      : [],
    ids.length
      ? db
          .select({ creatorId: s.dealCreators.creatorId, n: dsql<number>`count(*)::int` })
          .from(s.dealCreators)
          .innerJoin(s.deals, eq(s.deals.id, s.dealCreators.dealId))
          .where(and(inArray(s.dealCreators.creatorId, ids), notInArray(s.deals.stage, OPEN_DEAL_EXCLUDE), isNull(s.deals.archivedAt), isNull(s.dealCreators.archivedAt)))
          .groupBy(s.dealCreators.creatorId)
      : [],
    calendarItemsSince(ids, addDays(args.today, -7 * args.cfg.n.calendar_window_weeks), args.today),
    ids.length
      ? db
          .select()
          .from(s.creatorPlatforms)
          .where(and(inArray(s.creatorPlatforms.creatorId, ids), isNull(s.creatorPlatforms.archivedAt)))
      : [],
    segmentCounts(),
  ]);
  const rows: CreatorRow[] = creators.map((c) => {
    const next = checkins.find((k) => k.creatorId === c.id);
    const plats = platforms.filter((p) => p.creatorId === c.id);
    const primary = plats.find((p) => p.isPrimary) ?? plats.find((p) => p.platform === c.primaryPlatform) ?? plats[0];
    return {
      id: c.id,
      name: c.displayName,
      stage: c.stage,
      subCategory: c.subCategory,
      source: c.source,
      languages: c.languages,
      tier: canTier ? c.tier : null,
      filter: latestFilter(scores.get(c.id) ?? []),
      nextCheckin: next ? { dueOn: next.dueOn, type: next.type } : null,
      openDeals: deals.find((d) => d.creatorId === c.id)?.n ?? 0,
      adherence: calendarAdherence(cal.get(c.id) ?? [], args.today, args.cfg.n.calendar_window_weeks),
      handle: primary?.handle ?? null,
      followers: primary?.followers ?? null,
      rosterProposed: !!c.rosterProposedAt && !c.rosterApprovedBy,
    };
  });
  return { rows, counts };
}

export async function segmentCounts(): Promise<Record<Segment, number>> {
  const rows = await db
    .select({ stage: s.creators.stage, n: dsql<number>`count(*)::int` })
    .from(s.creators)
    .where(isNull(s.creators.archivedAt))
    .groupBy(s.creators.stage);
  const out = Object.fromEntries(SEGMENTS.map((k) => [k, 0])) as Record<Segment, number>;
  for (const r of rows) {
    out[r.stage] = r.n;
    if (r.stage !== "declined") out.all += r.n;
  }
  return out;
}

/** §9 retention metrics, computed from the database. Reported, never enforced. */
export async function retentionMetrics(today: ISODate) {
  const [creators, checkins, deals, links, feedback] = await Promise.all([
    db.select({ stage: s.creators.stage, previousStage: s.creators.previousStage, stageChangedAt: s.creators.stageChangedAt }).from(s.creators).where(isNull(s.creators.archivedAt)),
    db.select({ dueOn: s.creatorCheckins.dueOn, heldOn: s.creatorCheckins.heldOn }).from(s.creatorCheckins).where(isNull(s.creatorCheckins.archivedAt)),
    db
      .select({ id: s.deals.id, brandId: s.deals.brandId, type: s.deals.type, stage: s.deals.stage, createdAt: s.deals.createdAt, termEndsOn: s.deals.termEndsOn })
      .from(s.deals)
      .where(isNull(s.deals.archivedAt)),
    db.select({ dealId: s.dealCreators.dealId, creatorId: s.dealCreators.creatorId }).from(s.dealCreators).where(isNull(s.dealCreators.archivedAt)),
    db
      .select({ q1: s.brandFeedback.q1, q2: s.brandFeedback.q2, q3: s.brandFeedback.q3, q4: s.brandFeedback.q4, q5: s.brandFeedback.q5 })
      .from(s.brandFeedback)
      .where(and(eq(s.brandFeedback.kind, "campaign_5q"), isNull(s.brandFeedback.archivedAt))),
  ]);
  const dealRows: DealRow[] = deals.map((d) => ({
    id: d.id,
    brandId: d.brandId,
    type: d.type,
    stage: d.stage,
    createdOn: toISO(d.createdAt)!,
    termEndsOn: d.termEndsOn,
    creatorIds: links.filter((l) => l.dealId === d.id).map((l) => l.creatorId),
  }));
  return {
    checkinAdherence: checkinAdherence(checkins, today),
    churn: churn12m(
      creators.map((c) => ({ stage: c.stage, previousStage: c.previousStage, stageChangedOn: toISO(c.stageChangedAt) })),
      today,
    ),
    renewal: renewalRate(dealRows, today),
    mix: dealTypeShare(dealRows),
    brandRepeat: brandRepeatRate(dealRows),
    feedback: averageFeedback(feedback),
  };
}

/** The record header + inspector summary: facts, gate verdict and stage moves. */
export const isUuid = (v: string | undefined | null): v is string => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export async function creatorSummary(id: string, cfg: RulesConfig, role: string, today: ISODate) {
  if (!isUuid(id)) return null;
  const loaded = await creatorFacts(id);
  if (!loaded || loaded.creator.archivedAt) return null;
  const { creator, facts } = loaded;
  const [next, platforms, studioUser] = await Promise.all([
    db
      .select()
      .from(s.creatorCheckins)
      .where(and(eq(s.creatorCheckins.creatorId, id), isNull(s.creatorCheckins.heldOn), isNull(s.creatorCheckins.archivedAt)))
      .orderBy(asc(s.creatorCheckins.dueOn))
      .limit(1),
    db
      .select()
      .from(s.creatorPlatforms)
      .where(and(eq(s.creatorPlatforms.creatorId, id), isNull(s.creatorPlatforms.archivedAt)))
      .orderBy(desc(s.creatorPlatforms.isPrimary)),
    db.select({ id: s.users.id, email: s.users.email, active: s.users.active }).from(s.users).where(eq(s.users.creatorId, id)).limit(1),
  ]);
  const rosterProposed = !!creator.rosterProposedAt && !creator.rosterApprovedBy;
  const gateItems = rosterGate(cfg, facts, today);
  const cal = await calendarItemsSince([id], addDays(today, -7 * cfg.n.calendar_window_weeks), today);
  return {
    creator,
    facts,
    filter: latestFilter(facts.filterScores),
    gate: gateItems,
    verdict: rosterVerdict(gateItems),
    moves: stageMoves(cfg, facts, { role: role as never, today, rosterProposed }),
    rosterProposed,
    nextCheckin: next[0] ?? null,
    platforms,
    studioUser: studioUser[0] ?? null,
    adherence: calendarAdherence(cal.get(id) ?? [], today, cfg.n.calendar_window_weeks),
  };
}

export type CreatorSummary = NonNullable<Awaited<ReturnType<typeof creatorSummary>>>;

export async function creatorOverview(id: string, referredById: string | null) {
  const [profile, referredBy, creatorsForReferral] = await Promise.all([
    db.select().from(s.creatorProfiles).where(eq(s.creatorProfiles.creatorId, id)).limit(1),
    referredById ? db.select({ id: s.creators.id, name: s.creators.displayName }).from(s.creators).where(eq(s.creators.id, referredById)).limit(1) : Promise.resolve([]),
    referralOptions(),
  ]);
  return { profile: profile[0] ?? null, referredBy: referredBy[0] ?? null, creatorsForReferral };
}

/** Creators who can refer others (partnered or incubating). */
export async function referralOptions() {
  return db
    .select({ id: s.creators.id, name: s.creators.displayName })
    .from(s.creators)
    .where(and(isNull(s.creators.archivedAt), inArray(s.creators.stage, ["roster", "alumni", "incubation"])))
    .orderBy(asc(s.creators.displayName));
}

export async function creatorFilterTier(id: string) {
  const [scores, signals, evidence, users] = await Promise.all([
    db
      .select()
      .from(s.creatorFilterScores)
      .where(and(eq(s.creatorFilterScores.creatorId, id), isNull(s.creatorFilterScores.archivedAt)))
      .orderBy(desc(s.creatorFilterScores.scoredAt)),
    db
      .select()
      .from(s.creatorTierSignals)
      .where(and(eq(s.creatorTierSignals.creatorId, id), isNull(s.creatorTierSignals.archivedAt)))
      .orderBy(desc(s.creatorTierSignals.date)),
    db
      .select()
      .from(s.creatorEvidence)
      .where(and(eq(s.creatorEvidence.creatorId, id), isNull(s.creatorEvidence.archivedAt)))
      .orderBy(desc(s.creatorEvidence.date)),
    db.select({ id: s.users.id, name: s.users.name }).from(s.users),
  ]);
  const names = new Map(users.map((u) => [u.id, u.name ?? ""]));
  return { scores, signals, evidence, names };
}

export async function creatorRates(id: string) {
  return db
    .select()
    .from(s.creatorStandardRates)
    .where(and(eq(s.creatorStandardRates.creatorId, id), isNull(s.creatorStandardRates.archivedAt)));
}

export async function creatorCalendar(id: string, month: string) {
  const start = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const end = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const [items, blackouts, topics, anchor, users] = await Promise.all([
    db
      .select()
      .from(s.creatorCalendarItems)
      .where(and(eq(s.creatorCalendarItems.creatorId, id), gte(s.creatorCalendarItems.date, start), lte(s.creatorCalendarItems.date, end), isNull(s.creatorCalendarItems.archivedAt)))
      .orderBy(asc(s.creatorCalendarItems.date)),
    db
      .select()
      .from(s.creatorBlackouts)
      .where(and(eq(s.creatorBlackouts.creatorId, id), isNull(s.creatorBlackouts.archivedAt)))
      .orderBy(asc(s.creatorBlackouts.startsOn)),
    db
      .select()
      .from(s.creatorTopicFilters)
      .where(and(eq(s.creatorTopicFilters.creatorId, id), isNull(s.creatorTopicFilters.archivedAt)))
      .orderBy(desc(s.creatorTopicFilters.active), asc(s.creatorTopicFilters.kind)),
    db.select().from(s.creatorAnchorPlans).where(eq(s.creatorAnchorPlans.creatorId, id)).limit(1),
    db.select({ id: s.users.id, name: s.users.name }).from(s.users),
  ]);
  return { items, blackouts, topics, anchor: anchor[0] ?? null, names: new Map(users.map((u) => [u.id, u.name ?? ""])) };
}

export async function creatorDeals(id: string) {
  const rows = await db
    .select({ dc: s.dealCreators, d: s.deals, brand: s.brands.name })
    .from(s.dealCreators)
    .innerJoin(s.deals, eq(s.deals.id, s.dealCreators.dealId))
    .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
    .where(and(eq(s.dealCreators.creatorId, id), isNull(s.dealCreators.archivedAt), isNull(s.deals.archivedAt)))
    .orderBy(desc(s.deals.stageChangedAt));
  const dealIds = rows.map((r) => r.d.id);
  const lines = dealIds.length
    ? await db
        .select()
        .from(s.dealQuoteLines)
        .where(and(inArray(s.dealQuoteLines.dealId, dealIds), eq(s.dealQuoteLines.creatorId, id), isNull(s.dealQuoteLines.archivedAt)))
    : [];
  return rows.map((r) => {
    const mine = lines.filter((l) => l.dealId === r.d.id);
    return {
      id: r.d.id,
      title: r.d.title,
      brand: r.brand,
      stage: r.d.stage,
      type: r.d.type,
      role: r.dc.role,
      status: r.dc.status,
      currency: r.d.currency,
      lineCount: mine.length,
      totalPaise: mine.reduce((t, l) => t + (l.manualTotalPaise ?? l.lineTotalPaise), 0),
      open: !OPEN_DEAL_EXCLUDE.includes(r.d.stage as never),
    };
  });
}

/** Credibility first (decision-maker comments, saves/shares, inbound, sign-ups); impressions last. */
export async function creatorPerformance(id: string) {
  const delivs = await db
    .select({ d: s.deliverables, campaign: s.campaigns.name, brand: s.brands.name })
    .from(s.deliverables)
    .innerJoin(s.campaigns, eq(s.campaigns.id, s.deliverables.campaignId))
    .innerJoin(s.brands, eq(s.brands.id, s.campaigns.brandId))
    .where(and(eq(s.deliverables.creatorId, id), isNull(s.deliverables.archivedAt)))
    .orderBy(desc(s.deliverables.dueOn));
  const ids = delivs.map((x) => x.d.id);
  const metrics = ids.length
    ? await db
        .select()
        .from(s.deliverableMetrics)
        .where(and(inArray(s.deliverableMetrics.deliverableId, ids), isNull(s.deliverableMetrics.archivedAt)))
        .orderBy(desc(s.deliverableMetrics.capturedAt))
    : [];
  // One metrics record per sponsored post: take the latest capture per deliverable.
  const latest = new Map<string, (typeof metrics)[number]>();
  for (const m of metrics) if (!latest.has(m.deliverableId)) latest.set(m.deliverableId, m);
  const sum = (k: "commentsDecisionMaker" | "saves" | "shares" | "inboundToBrand" | "trackedSignups" | "impressions") => [...latest.values()].reduce((t, m) => t + (m[k] ?? 0), 0);
  return {
    totals: {
      decisionMakerComments: sum("commentsDecisionMaker"),
      saves: sum("saves"),
      shares: sum("shares"),
      inbound: sum("inboundToBrand"),
      signups: sum("trackedSignups"),
      impressions: sum("impressions"),
      measured: latest.size,
    },
    rows: delivs.map((x) => ({ ...x.d, campaign: x.campaign, brand: x.brand, metrics: latest.get(x.d.id) ?? null })),
  };
}

export async function creatorCheckins(id: string) {
  const [checkins, roadmap, users, templates] = await Promise.all([
    db
      .select()
      .from(s.creatorCheckins)
      .where(and(eq(s.creatorCheckins.creatorId, id), isNull(s.creatorCheckins.archivedAt)))
      .orderBy(asc(s.creatorCheckins.dueOn)),
    db
      .select()
      .from(s.creatorRoadmapItems)
      .where(and(eq(s.creatorRoadmapItems.creatorId, id), isNull(s.creatorRoadmapItems.archivedAt)))
      .orderBy(asc(s.creatorRoadmapItems.area)),
    db.select({ id: s.users.id, name: s.users.name }).from(s.users),
    db
      .select()
      .from(s.templates)
      .where(inArray(s.templates.key, ["checkin_quarterly", "checkin_pilot_end", "checkin_exit_window", "checkin_roadmap"])),
  ]);
  return { checkins, roadmap, names: new Map(users.map((u) => [u.id, u.name ?? ""])), templates: new Map(templates.map((t) => [t.key, t.bodyMd])) };
}

/** "What shipped" = posted calendar items since the last held check-in (§9 v3). */
export async function shippedSince(id: string, since: ISODate | null, today: ISODate) {
  return db
    .select({ date: s.creatorCalendarItems.date, title: s.creatorCalendarItems.title, kind: s.creatorCalendarItems.kind })
    .from(s.creatorCalendarItems)
    .where(
      and(
        eq(s.creatorCalendarItems.creatorId, id),
        eq(s.creatorCalendarItems.studioStatus, "posted"),
        since ? gte(s.creatorCalendarItems.date, since) : dsql`true`,
        lte(s.creatorCalendarItems.date, today),
        isNull(s.creatorCalendarItems.archivedAt),
      ),
    )
    .orderBy(asc(s.creatorCalendarItems.date));
}

export async function creatorPayments(id: string) {
  return db
    .select({ p: s.creatorPayouts, title: s.deals.title, brand: s.brands.name })
    .from(s.creatorPayouts)
    .innerJoin(s.deals, eq(s.deals.id, s.creatorPayouts.dealId))
    .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
    .where(and(eq(s.creatorPayouts.creatorId, id), isNull(s.creatorPayouts.archivedAt)))
    .orderBy(desc(s.creatorPayouts.dueOn));
}

export async function creatorAgreement(id: string): Promise<typeof s.creatorAgreements.$inferSelect | null> {
  const [a] = await db.select().from(s.creatorAgreements).where(eq(s.creatorAgreements.creatorId, id)).limit(1);
  return a ?? null;
}

/** Score mode rows: creators in the segment with their latest Filter. */
export async function scoreSheet(seg: Segment, q: string | undefined) {
  const where = [isNull(s.creators.archivedAt)];
  if (seg === "all") where.push(inArray(s.creators.stage, ["scout", "watchlist", "incubation", "revisit"]));
  else where.push(eq(s.creators.stage, seg));
  const { text } = parseQuery(q);
  if (text) where.push(ilike(s.creators.displayName, `%${text}%`));
  const creators = await db
    .select({ id: s.creators.id, name: s.creators.displayName, stage: s.creators.stage, subCategory: s.creators.subCategory })
    .from(s.creators)
    .where(and(...where))
    .orderBy(asc(s.creators.displayName));
  const scores = await filterScoresFor(creators.map((c) => c.id));
  return creators.map((c) => ({ ...c, latest: latestFilter(scores.get(c.id) ?? []) }));
}

export async function existingHandles(): Promise<string[]> {
  const rows = await db.select({ h: s.creatorPlatforms.handle }).from(s.creatorPlatforms).where(isNull(s.creatorPlatforms.archivedAt));
  return rows.map((r) => r.h);
}
