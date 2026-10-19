// Campaigns read model — the shared content tracker (BRIEF §8, §10). Crew Desk only.
import "server-only";
import { and, asc, desc, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import type { RulesConfig } from "@/lib/rules/config";
import { DELIVERABLE_FLOW, canTransitionDeliverable, type DeliverableContext, type DeliverableFacts, type DeliverableStatus } from "@/lib/rules/deliverables";
import { latestFilter } from "@/lib/rules/creators";
import { topicConflicts } from "@/lib/rules/deals";
import { ratioMeters } from "@/lib/rules/studio";
import { canAddToCampaign, credibilityTotals, FRONTSEAT_KEY } from "@/lib/rules/campaigns";
import { withBlockers, type DeliverableWithBlock } from "./deliverables";
import { filterScoresFor } from "./facts";
import { today as todayISO } from "@/lib/dates";

export const DELIVERABLE_STATUS_LABEL: Record<string, string> = {
  briefed: "Briefed",
  drafting: "Drafting",
  in_review: "In review",
  approved: "Approved",
  scheduled: "Scheduled",
  live: "Live",
  reported: "Reported",
  cancelled: "Cancelled",
};

export const PLATFORM_LABEL: Record<string, string> = { instagram: "Instagram", youtube: "YouTube", x: "X", linkedin: "LinkedIn", newsletter: "Newsletter", other: "Other" };

export function deliverableLabel(cfg: RulesConfig, key: string): string {
  if (key === FRONTSEAT_KEY) return "Frontseat amplification";
  return cfg.deliverables.find((d) => d.key === key)?.label ?? key.replace(/_/g, " ");
}

function monthBounds(date: string) {
  const [y, m] = date.split("-").map(Number);
  return { start: `${date.slice(0, 7)}-01`, end: new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10) };
}

// ---------- List ----------
export type CampaignListRow = {
  id: string;
  name: string;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
  brandId: string;
  brandName: string;
  dealId: string;
  dealTitle: string;
  dealStage: string;
  liveCount: number;
  deliverableCount: number;
  blockedCount: number;
  nextBlocker: string | null;
};

export async function listCampaigns(cfg: RulesConfig, status?: string): Promise<CampaignListRow[]> {
  const rows = await db
    .select({ c: s.campaigns, brandName: s.brands.name, dealTitle: s.deals.title, dealStage: s.deals.stage })
    .from(s.campaigns)
    .innerJoin(s.brands, eq(s.brands.id, s.campaigns.brandId))
    .innerJoin(s.deals, eq(s.deals.id, s.campaigns.dealId))
    .where(and(isNull(s.campaigns.archivedAt), status ? eq(s.campaigns.status, status as "planning") : undefined))
    .orderBy(desc(s.campaigns.createdAt));
  if (!rows.length) return [];
  const delivs = await db
    .select()
    .from(s.deliverables)
    .where(and(inArray(s.deliverables.campaignId, rows.map((r) => r.c.id)), isNull(s.deliverables.archivedAt)))
    .orderBy(asc(s.deliverables.dueOn));
  const open = delivs.filter((d) => !["live", "reported", "cancelled"].includes(d.status));
  const withB = await withBlockers(cfg, open);
  return rows.map(({ c, brandName, dealTitle, dealStage }) => {
    const mine = delivs.filter((d) => d.campaignId === c.id && d.status !== "cancelled");
    const blocked = withB.filter((d) => d.campaignId === c.id && d.blockers.length);
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      startsOn: c.startsOn,
      endsOn: c.endsOn,
      brandId: c.brandId,
      brandName,
      dealId: c.dealId,
      dealTitle,
      dealStage,
      liveCount: mine.filter((d) => d.status === "live" || d.status === "reported").length,
      deliverableCount: mine.length,
      blockedCount: blocked.length,
      nextBlocker: blocked[0] ? `${blocked[0].title}: ${blocked[0].blockers[0]}` : null,
    };
  });
}

// ---------- Record ----------
export type TrackerRow = DeliverableWithBlock & { creatorName: string; label: string };

export async function getCampaign(cfg: RulesConfig, id: string) {
  const [row] = await db
    .select({ c: s.campaigns, brand: s.brands, deal: s.deals })
    .from(s.campaigns)
    .innerJoin(s.brands, eq(s.brands.id, s.campaigns.brandId))
    .innerJoin(s.deals, eq(s.deals.id, s.campaigns.dealId))
    .where(eq(s.campaigns.id, id));
  if (!row) return null;
  const delivRows = await db
    .select()
    .from(s.deliverables)
    .where(and(eq(s.deliverables.campaignId, id), isNull(s.deliverables.archivedAt)))
    .orderBy(asc(s.deliverables.dueOn), asc(s.deliverables.createdAt));
  const creatorIds = [...new Set(delivRows.map((d) => d.creatorId))];
  const [withB, creators, metrics, feedback, contacts, dealCreators] = await Promise.all([
    withBlockers(cfg, delivRows),
    creatorIds.length ? db.select({ id: s.creators.id, name: s.creators.displayName }).from(s.creators).where(inArray(s.creators.id, creatorIds)) : [],
    delivRows.length
      ? db.select().from(s.deliverableMetrics).where(and(inArray(s.deliverableMetrics.deliverableId, delivRows.map((d) => d.id)), isNull(s.deliverableMetrics.archivedAt))).orderBy(desc(s.deliverableMetrics.capturedAt))
      : [],
    db.select().from(s.brandFeedback).where(and(eq(s.brandFeedback.campaignId, id), isNull(s.brandFeedback.archivedAt))).orderBy(desc(s.brandFeedback.submittedOn)),
    db.select().from(s.brandContacts).where(and(eq(s.brandContacts.brandId, row.c.brandId), isNull(s.brandContacts.archivedAt))),
    db.select().from(s.dealCreators).where(and(eq(s.dealCreators.dealId, row.c.dealId), isNull(s.dealCreators.archivedAt))),
  ]);
  const name = new Map(creators.map((c) => [c.id, c.name]));
  const tracker: TrackerRow[] = withB.map((d) => ({ ...d, creatorName: name.get(d.creatorId) ?? "—", label: deliverableLabel(cfg, d.deliverableKey) }));
  // One metrics record per deliverable: the latest capture.
  const latest = new Map<string, typeof s.deliverableMetrics.$inferSelect>();
  for (const m of metrics) if (!latest.has(m.deliverableId)) latest.set(m.deliverableId, m);
  const reportable = tracker.filter((d) => d.channel !== "frontseat" && d.status !== "cancelled");
  const credibility = credibilityTotals(reportable.map((d) => latest.get(d.id)).filter((m): m is NonNullable<typeof m> => !!m));
  return { campaign: row.c, brand: row.brand, deal: row.deal, tracker, metrics: latest, credibility, feedback, contacts, dealCreators };
}

// ---------- Deliverable context (for status moves in the Inspector and server actions) ----------
export async function deliverableContext(cfg: RulesConfig, d: typeof s.deliverables.$inferSelect, scheduledFor?: string | null): Promise<{ ctx: DeliverableContext; dealId: string }> {
  const [camp] = await db
    .select({ dealId: s.campaigns.dealId, stage: s.deals.stage, po: s.deals.poReference, conf: s.deals.confirmationUrl })
    .from(s.campaigns)
    .innerJoin(s.deals, eq(s.deals.id, s.campaigns.dealId))
    .where(eq(s.campaigns.id, d.campaignId));
  const date = (scheduledFor === undefined ? d.scheduledFor : scheduledFor) ?? d.dueOn ?? todayISO();
  const { start, end } = monthBounds(date);
  const [overrides, topics, blackouts, anchor, monthItems] = await Promise.all([
    db.select().from(s.dealOverrides).where(eq(s.dealOverrides.dealId, camp.dealId)),
    db.select().from(s.creatorTopicFilters).where(and(eq(s.creatorTopicFilters.creatorId, d.creatorId), eq(s.creatorTopicFilters.active, true), isNull(s.creatorTopicFilters.archivedAt))),
    db.select().from(s.creatorBlackouts).where(and(eq(s.creatorBlackouts.creatorId, d.creatorId), isNull(s.creatorBlackouts.archivedAt))),
    db.select().from(s.creatorAnchorPlans).where(eq(s.creatorAnchorPlans.creatorId, d.creatorId)),
    db
      .select({ kind: s.creatorCalendarItems.kind, deliverableId: s.creatorCalendarItems.deliverableId })
      .from(s.creatorCalendarItems)
      .where(and(eq(s.creatorCalendarItems.creatorId, d.creatorId), gte(s.creatorCalendarItems.date, start), lte(s.creatorCalendarItems.date, end), isNull(s.creatorCalendarItems.archivedAt))),
  ]);
  const approvedOv = (k: string) => overrides.some((o) => o.kind === k && o.approvedAt && !o.rejectedAt);
  return {
    dealId: camp.dealId,
    ctx: {
      dealStage: camp.stage,
      hasAdvanceOverride: approvedOv("go_live_without_advance"),
      hasPoOverride: approvedOv("go_live_without_po"),
      poOrConfirmation: !!(camp.po?.trim() || camp.conf?.trim()),
      topicFilters: topics.map((t) => ({ kind: t.kind, value: t.value })),
      blackouts: blackouts.map((b) => ({ startsOn: b.startsOn, endsOn: b.endsOn })),
      monthItems: monthItems.filter((m) => m.deliverableId !== d.id),
      sponsoredRatioMax: anchor[0]?.sponsoredRatioMax ?? cfg.n.sponsored_ratio_max,
    },
  };
}

export function deliverableFacts(d: typeof s.deliverables.$inferSelect, over: Partial<DeliverableFacts> = {}): DeliverableFacts {
  return {
    status: d.status,
    scheduledFor: d.scheduledFor,
    disclosureChecked: d.disclosureChecked,
    claimsApprovedByBrand: d.claimsApprovedByBrand,
    briefTags: d.briefTags,
    revisionRound: d.revisionRound,
    ...over,
  };
}

/** Every status move with its gate, for the MenuPill. Blocked moves carry their first reason. */
export async function statusMoves(cfg: RulesConfig, d: typeof s.deliverables.$inferSelect) {
  const { ctx } = await deliverableContext(cfg, d);
  const facts = deliverableFacts(d);
  const targets: DeliverableStatus[] = [...DELIVERABLE_FLOW, "cancelled"];
  return targets
    .filter((t) => t !== d.status)
    .map((t) => {
      const g = canTransitionDeliverable(cfg, facts, t, ctx);
      return { value: t, label: DELIVERABLE_STATUS_LABEL[t], disabledReason: g.ok ? null : g.reasons[0], hint: g.warnings?.[0] };
    });
}

// ---------- Add creators sheet (§8.7): roster, Filter total, sub-category, conflicts, ratio headroom. No followers. ----------
export type Candidate = {
  id: string;
  name: string;
  subCategory: string;
  filterTotal: number | null;
  conflicts: string[];
  headroom: number;
  blockedReason: string | null;
  onCampaign: boolean;
};

export async function addCreatorCandidates(cfg: RulesConfig, campaignId: string): Promise<Candidate[]> {
  const [camp] = await db
    .select({ startsOn: s.campaigns.startsOn, briefTags: s.deals.briefTags })
    .from(s.campaigns)
    .innerJoin(s.deals, eq(s.deals.id, s.campaigns.dealId))
    .where(eq(s.campaigns.id, campaignId));
  if (!camp) return [];
  const roster = await db.select().from(s.creators).where(and(eq(s.creators.stage, "roster"), isNull(s.creators.archivedAt))).orderBy(asc(s.creators.displayName));
  if (!roster.length) return [];
  const ids = roster.map((c) => c.id);
  const t = todayISO();
  const month = camp.startsOn && camp.startsOn > t ? camp.startsOn : t;
  const { start, end } = monthBounds(month);
  const [scores, topics, anchors, profiles, items, existing] = await Promise.all([
    filterScoresFor(ids),
    db.select().from(s.creatorTopicFilters).where(and(inArray(s.creatorTopicFilters.creatorId, ids), eq(s.creatorTopicFilters.active, true), isNull(s.creatorTopicFilters.archivedAt))),
    db.select().from(s.creatorAnchorPlans).where(inArray(s.creatorAnchorPlans.creatorId, ids)),
    db.select({ creatorId: s.creatorProfiles.creatorId, pillarRatio: s.creatorProfiles.pillarRatio, conceptRatio: s.creatorProfiles.conceptRatio }).from(s.creatorProfiles).where(inArray(s.creatorProfiles.creatorId, ids)),
    db
      .select()
      .from(s.creatorCalendarItems)
      .where(and(inArray(s.creatorCalendarItems.creatorId, ids), gte(s.creatorCalendarItems.date, start), lte(s.creatorCalendarItems.date, end), isNull(s.creatorCalendarItems.archivedAt))),
    db.select({ creatorId: s.deliverables.creatorId }).from(s.deliverables).where(and(eq(s.deliverables.campaignId, campaignId), isNull(s.deliverables.archivedAt))),
  ]);
  return roster.map((c) => {
    const sc = scores.get(c.id) ?? [];
    const tf = topics.filter((x) => x.creatorId === c.id).map((x) => ({ kind: x.kind, value: x.value }));
    const prof = profiles.find((p) => p.creatorId === c.id) ?? { pillarRatio: { authority: 70, journey: 30 }, conceptRatio: { proven: 90, double_down: 0, experimental: 10 } };
    const max = anchors.find((a) => a.creatorId === c.id)?.sponsoredRatioMax ?? cfg.n.sponsored_ratio_max;
    const meters = ratioMeters(
      cfg,
      items.filter((i) => i.creatorId === c.id).map((i) => ({ date: i.date, kind: i.kind, pillar: i.pillar, conceptBucket: i.conceptBucket, studioStatus: i.studioStatus })),
      prof,
      max,
    );
    const g = canAddToCampaign(cfg, { stage: c.stage, filterScores: sc, representedElsewhere: c.representedElsewhere }, camp.briefTags, tf);
    return {
      id: c.id,
      name: c.displayName,
      subCategory: c.subCategory,
      filterTotal: latestFilter(sc)?.total ?? null,
      conflicts: topicConflicts(camp.briefTags, tf),
      headroom: meters.sponsored.headroom,
      blockedReason: g.ok ? null : g.reasons[0],
      onCampaign: existing.some((e) => e.creatorId === c.id),
    };
  });
}

/** The five questions from the brand_feedback_5q template. */
export async function feedbackQuestions(): Promise<string[]> {
  const [tpl] = await db.select({ bodyMd: s.templates.bodyMd }).from(s.templates).where(eq(s.templates.key, "brand_feedback_5q"));
  return (tpl?.bodyMd ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*\d+\.\s*/, "").replace(/\s*\(1–5\)\s*$/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}
