// Owner month-end one-pager (§1, §10, §20): roster, pipeline, money, payouts, declined log,
// framework exceptions, retention signals, Program counts and AI usage — for one month.
import "server-only";
import { and, eq, gte, isNull, lt, notInArray, sql as dsql } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { checkinAdherence } from "@/lib/rules/retention";
import { addDays, addMonths, today as todayISO, toISO } from "@/lib/dates";

export type MonthKey = string; // YYYY-MM

export function previousMonth(t = todayISO()): MonthKey {
  return addMonths(`${t.slice(0, 7)}-01`, -1).slice(0, 7);
}

export function monthBounds(m: MonthKey) {
  const start = `${m}-01`;
  const next = addMonths(start, 1);
  return {
    start,
    next,
    lastDay: addDays(next, -1),
    fromTs: new Date(`${start}T00:00:00+05:30`),
    toTs: new Date(`${next}T00:00:00+05:30`),
  };
}

const OPEN_EXCLUDE = ["paid_in_full", "declined", "lost"] as const;
const SIGNED_PLUS = ["signed", "advance_received", "in_production", "live", "reported", "paid_in_full"] as const;

function group<T>(rows: T[], key: (r: T) => string) {
  const m = new Map<string, number>();
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
  return [...m.entries()].map(([k, n]) => ({ key: k, n })).sort((a, b) => b.n - a.n);
}

export async function getMonthEnd(month: MonthKey) {
  const b = monthBounds(month);
  const t = todayISO();
  const asOf = b.lastDay < t ? b.lastDay : t;

  const [creators, deals, invoices, payouts, overrides, checkins, signedAudit, alumniAudit, cohorts, challenges, entries, shoots, ai] = await Promise.all([
    db.select({ id: s.creators.id, stage: s.creators.stage, tier: s.creators.tier, sub: s.creators.subCategory, name: s.creators.displayName, stageChangedAt: s.creators.stageChangedAt }).from(s.creators).where(isNull(s.creators.archivedAt)),
    db.select({ d: s.deals, brand: s.brands.name }).from(s.deals).innerJoin(s.brands, eq(s.brands.id, s.deals.brandId)).where(isNull(s.deals.archivedAt)),
    db.select().from(s.invoices).where(and(isNull(s.invoices.archivedAt), notInArray(s.invoices.status, ["void", "draft"]))),
    db.select({ p: s.creatorPayouts, name: s.creators.displayName }).from(s.creatorPayouts).innerJoin(s.creators, eq(s.creators.id, s.creatorPayouts.creatorId)).where(isNull(s.creatorPayouts.archivedAt)),
    db.select().from(s.dealOverrides).where(and(gte(s.dealOverrides.createdAt, b.fromTs), lt(s.dealOverrides.createdAt, b.toTs))),
    db
      .select({ dueOn: s.creatorCheckins.dueOn, heldOn: s.creatorCheckins.heldOn, stage: s.creators.stage })
      .from(s.creatorCheckins)
      .innerJoin(s.creators, eq(s.creators.id, s.creatorCheckins.creatorId))
      .where(isNull(s.creatorCheckins.archivedAt)),
    db
      .select({ id: s.auditLog.entityId })
      .from(s.auditLog)
      .where(and(eq(s.auditLog.entity, "deals"), gte(s.auditLog.at, b.fromTs), lt(s.auditLog.at, b.toTs), dsql`${s.auditLog.detail} -> 'changed' -> 'stage' ->> 1 = 'signed'`)),
    db
      .select({ id: s.auditLog.entityId })
      .from(s.auditLog)
      .where(and(eq(s.auditLog.entity, "creators"), gte(s.auditLog.at, new Date(`${addMonths(asOf, -12)}T00:00:00+05:30`)), dsql`${s.auditLog.detail} -> 'changed' -> 'stage' ->> 1 = 'alumni'`)),
    db.select().from(s.programCohorts).where(isNull(s.programCohorts.archivedAt)),
    db.select().from(s.programChallenges).where(and(isNull(s.programChallenges.archivedAt), gte(s.programChallenges.opensAt, b.fromTs), lt(s.programChallenges.opensAt, b.toTs))),
    db
      .select({ outcome: s.programEntries.outcome, challengeId: s.programEntries.challengeId, createdAt: s.programEntries.createdAt, updatedAt: s.programEntries.updatedAt })
      .from(s.programEntries)
      .where(isNull(s.programEntries.archivedAt)),
    db.select().from(s.programSundayShoots).where(and(isNull(s.programSundayShoots.archivedAt), gte(s.programSundayShoots.date, b.start), lt(s.programSundayShoots.date, b.next))),
    db
      .select({ creatorId: s.aiUsage.creatorId, name: s.creators.displayName, calls: dsql<number>`count(*)::int`, tokens: dsql<number>`coalesce(sum(${s.aiUsage.tokensEst}),0)::int` })
      .from(s.aiUsage)
      .leftJoin(s.creators, eq(s.creators.id, s.aiUsage.creatorId))
      .where(and(gte(s.aiUsage.at, b.fromTs), lt(s.aiUsage.at, b.toTs)))
      .groupBy(s.aiUsage.creatorId, s.creators.displayName),
  ]);

  // Roster (snapshot as of generation)
  const byStage = group(creators, (c) => c.stage);
  const tiered = creators.filter((c) => c.stage === "roster" || c.stage === "incubation");
  const byTier = group(tiered, (c) => c.tier ?? "none");
  const bySub = group(
    creators.filter((c) => c.stage === "roster"),
    (c) => c.sub,
  );

  // Pipeline (open deals, snapshot)
  const open = deals.filter(({ d }) => !(OPEN_EXCLUDE as readonly string[]).includes(d.stage));
  const pipeMap = new Map<string, { n: number; value: number }>();
  for (const { d } of open) {
    const v = pipeMap.get(d.stage) ?? { n: 0, value: 0 };
    v.n++;
    v.value += d.signedTotalPaise ?? d.quotedTotalPaise;
    pipeMap.set(d.stage, v);
  }
  const pipeline = [...pipeMap.entries()].map(([stage, v]) => ({ stage, ...v }));

  // Money
  const inMonth = (d: string | null) => !!d && d >= b.start && d < b.next;
  const signedIds = new Set(signedAudit.map((r) => r.id).filter(Boolean) as string[]);
  for (const { d } of deals) {
    const changed = toISO(d.stageChangedAt);
    if (d.stage === "signed" && inMonth(changed)) signedIds.add(d.id);
  }
  const signedDeals = deals.filter(({ d }) => signedIds.has(d.id));
  const signedPaise = signedDeals.reduce((t, { d }) => t + (d.signedTotalPaise ?? d.quotedTotalPaise), 0);
  const collected = invoices.filter((i) => i.status === "paid" && inMonth(i.paidOn));
  const collectedPaise = collected.reduce((t, i) => t + (i.paidAmountPaise ?? i.amountPaise), 0);
  const outstandingRows = invoices.filter((i) => i.issuedOn <= asOf && !(i.status === "paid" && i.paidOn && i.paidOn <= asOf));
  const outstandingPaise = outstandingRows.reduce((t, i) => t + i.amountPaise, 0);
  const overdueRows = outstandingRows.filter((i) => i.dueOn < asOf);
  const overduePaise = overdueRows.reduce((t, i) => t + i.amountPaise, 0);

  // Payouts and shares
  const kinds = ["fee_advance", "fee_balance", "upsell_share", "referral_share"] as const;
  const payoutRows = kinds.map((k) => {
    const of = payouts.filter(({ p }) => p.kind === k);
    const paid = of.filter(({ p }) => p.status === "paid" && inMonth(p.paidOn));
    const due = of.filter(({ p }) => p.status !== "paid" && p.dueOn <= b.lastDay);
    return { kind: k, paidN: paid.length, paidPaise: paid.reduce((t, { p }) => t + p.amountPaise, 0), dueN: due.length, duePaise: due.reduce((t, { p }) => t + p.amountPaise, 0) };
  });

  // Declined log
  const declined = deals
    .filter(({ d }) => d.stage === "declined" && inMonth(toISO(d.stageChangedAt)))
    .map(({ d, brand }) => ({ id: d.id, brand, title: d.title, reason: d.declinedReason, valuePaise: d.declinedValuePaise ?? d.quotedTotalPaise, on: toISO(d.stageChangedAt) }));

  // Framework exceptions (overrides by kind)
  const exMap = new Map<string, { requested: number; approved: number; rejected: number; pending: number }>();
  for (const o of overrides) {
    const v = exMap.get(o.kind) ?? { requested: 0, approved: 0, rejected: 0, pending: 0 };
    v.requested++;
    if (o.approvedAt) v.approved++;
    else if (o.rejectedAt) v.rejected++;
    else v.pending++;
    exMap.set(o.kind, v);
  }
  const exceptions = [...exMap.entries()].map(([kind, v]) => ({ kind, ...v }));

  // Retention signals
  const adherence = checkinAdherence(
    checkins.filter((c) => c.stage === "roster" || c.stage === "alumni").map((c) => ({ dueOn: c.dueOn, heldOn: c.heldOn })),
    asOf,
  );
  const rosterNow = creators.filter((c) => c.stage === "roster").length;
  const churned = new Set(alumniAudit.map((r) => r.id).filter(Boolean) as string[]);
  for (const c of creators) if (c.stage === "alumni" && toISO(c.stageChangedAt)! >= addMonths(asOf, -12)) churned.add(c.id);
  const churn = rosterNow + churned.size ? churned.size / (rosterNow + churned.size) : null;
  const done = deals.filter(({ d }) => d.stage === "paid_in_full" || d.stage === "reported");
  const renewedBrands = new Set<string>();
  const doneBrands = new Set(done.map(({ d }) => d.brandId));
  for (const { d } of deals) {
    if (!doneBrands.has(d.brandId)) continue;
    const firstDone = done.filter((x) => x.d.brandId === d.brandId).sort((a, z) => (a.d.createdAt < z.d.createdAt ? -1 : 1))[0];
    if (firstDone && d.id !== firstDone.d.id && d.createdAt > firstDone.d.createdAt && d.stage !== "declined" && d.stage !== "lost") renewedBrands.add(d.brandId);
  }
  const renewal = doneBrands.size ? renewedBrands.size / doneBrands.size : null;
  const signedPlus = deals.filter(({ d }) => (SIGNED_PLUS as readonly string[]).includes(d.stage) && d.type);
  const recurring = signedPlus.filter(({ d }) => d.type === "retainer" || d.type === "quarterly" || d.type === "annual").length;
  const recurringShare = signedPlus.length ? recurring / signedPlus.length : null;

  // Program
  const activeCohorts = cohorts.filter((c) => c.startsOn < b.next && c.endsOn >= b.start).length;
  const chIds = new Set(challenges.map((c) => c.id));
  const monthEntries = entries.filter((e) => chIds.has(e.challengeId));
  const routedInMonth = entries.filter((e) => e.outcome && e.updatedAt >= b.fromTs && e.updatedAt < b.toTs);
  const program = {
    activeCohorts,
    challenges: challenges.length,
    entries: monthEntries.length,
    tier0: routedInMonth.filter((e) => e.outcome === "tier0").length,
    revisit: routedInMonth.filter((e) => e.outcome === "revisit").length,
    commissions: routedInMonth.filter((e) => e.outcome === "brand_commission").length,
    shoots: shoots.length,
    attended: shoots.reduce((n, sh) => n + sh.attended.length, 0),
    invited: shoots.reduce((n, sh) => n + sh.creators.length, 0),
  };

  const aiUsage = ai.map((r) => ({ creatorId: r.creatorId, name: r.name ?? "Crew / unattributed", calls: r.calls, tokens: r.tokens })).sort((a, z) => z.tokens - a.tokens);

  return {
    month,
    bounds: b,
    asOf,
    roster: { byStage, byTier, bySub, total: creators.length },
    pipeline,
    money: { signedN: signedDeals.length, signedPaise, collectedN: collected.length, collectedPaise, outstandingN: outstandingRows.length, outstandingPaise, overdueN: overdueRows.length, overduePaise },
    payouts: payoutRows,
    declined,
    exceptions,
    retention: { adherence, churn, churnedN: churned.size, renewal, recurringShare, rosterNow },
    program,
    aiUsage,
  };
}

export async function monthsWithData(): Promise<MonthKey[]> {
  const t = todayISO();
  return Array.from({ length: 12 }, (_, i) => addMonths(`${t.slice(0, 7)}-01`, -i).slice(0, 7));
}

