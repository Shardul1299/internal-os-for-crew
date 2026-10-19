// Deliverable facts + blockers (§5.4), shared by Today, Campaigns, the deal Delivery step and Studio.
import "server-only";
import { and, eq, inArray, isNull, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { canScheduleOrGoLive, type DeliverableContext, type DeliverableFacts } from "@/lib/rules/deliverables";
import type { RulesConfig } from "@/lib/rules/config";
import type { DealStage } from "@/lib/rules/deals";
import { today as todayISO } from "@/lib/dates";

export type DeliverableWithBlock = typeof s.deliverables.$inferSelect & {
  dealId: string;
  dealStage: DealStage;
  blockers: string[];
  warnings: string[];
};

function monthBounds(date: string) {
  const [y, m] = date.split("-").map(Number);
  const start = `${date.slice(0, 7)}-01`;
  const end = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  return { start, end };
}

/** Evaluates the §5.4 gate for each deliverable. */
export async function withBlockers(cfg: RulesConfig, rows: (typeof s.deliverables.$inferSelect)[]): Promise<DeliverableWithBlock[]> {
  if (!rows.length) return [];
  const campaignIds = [...new Set(rows.map((r) => r.campaignId))];
  const creatorIds = [...new Set(rows.map((r) => r.creatorId))];
  const campaigns = await db
    .select({ id: s.campaigns.id, dealId: s.campaigns.dealId, stage: s.deals.stage, po: s.deals.poReference, conf: s.deals.confirmationUrl })
    .from(s.campaigns)
    .innerJoin(s.deals, eq(s.deals.id, s.campaigns.dealId))
    .where(inArray(s.campaigns.id, campaignIds));
  const dealIds = campaigns.map((c) => c.dealId);
  const [overrides, topics, blackouts, anchors] = await Promise.all([
    dealIds.length ? db.select().from(s.dealOverrides).where(inArray(s.dealOverrides.dealId, dealIds)) : [],
    db.select().from(s.creatorTopicFilters).where(and(inArray(s.creatorTopicFilters.creatorId, creatorIds), eq(s.creatorTopicFilters.active, true), isNull(s.creatorTopicFilters.archivedAt))),
    db.select().from(s.creatorBlackouts).where(and(inArray(s.creatorBlackouts.creatorId, creatorIds), isNull(s.creatorBlackouts.archivedAt))),
    db.select().from(s.creatorAnchorPlans).where(inArray(s.creatorAnchorPlans.creatorId, creatorIds)),
  ]);
  const out: DeliverableWithBlock[] = [];
  for (const r of rows) {
    const camp = campaigns.find((c) => c.id === r.campaignId)!;
    const date = r.scheduledFor ?? r.dueOn ?? todayISO();
    const { start, end } = monthBounds(date);
    const monthItems = await db
      .select({ kind: s.creatorCalendarItems.kind, deliverableId: s.creatorCalendarItems.deliverableId })
      .from(s.creatorCalendarItems)
      .where(and(eq(s.creatorCalendarItems.creatorId, r.creatorId), gte(s.creatorCalendarItems.date, start), lte(s.creatorCalendarItems.date, end), isNull(s.creatorCalendarItems.archivedAt)));
    const approvedOv = (k: string) => overrides.some((o) => o.dealId === camp.dealId && o.kind === k && o.approvedAt && !o.rejectedAt);
    const ctx: DeliverableContext = {
      dealStage: camp.stage,
      hasAdvanceOverride: approvedOv("go_live_without_advance"),
      hasPoOverride: approvedOv("go_live_without_po"),
      poOrConfirmation: !!(camp.po?.trim() || camp.conf?.trim()),
      topicFilters: topics.filter((t) => t.creatorId === r.creatorId).map((t) => ({ kind: t.kind, value: t.value })),
      blackouts: blackouts.filter((b) => b.creatorId === r.creatorId).map((b) => ({ startsOn: b.startsOn, endsOn: b.endsOn })),
      monthItems: monthItems.filter((m) => m.deliverableId !== r.id),
      sponsoredRatioMax: anchors.find((a) => a.creatorId === r.creatorId)?.sponsoredRatioMax ?? cfg.n.sponsored_ratio_max,
    };
    const facts: DeliverableFacts = {
      status: r.status,
      scheduledFor: r.scheduledFor,
      disclosureChecked: r.disclosureChecked,
      claimsApprovedByBrand: r.claimsApprovedByBrand,
      briefTags: r.briefTags,
      revisionRound: r.revisionRound,
    };
    const g = canScheduleOrGoLive(cfg, facts, ctx);
    out.push({ ...r, dealId: camp.dealId, dealStage: camp.stage, blockers: ["live", "reported", "cancelled"].includes(r.status) ? [] : g.reasons, warnings: g.warnings ?? [] });
  }
  return out;
}
