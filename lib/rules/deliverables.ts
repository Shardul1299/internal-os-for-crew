// Deliverable blocking — BRIEF §5.4, §8. The UI shows the first reason as one grey line.
import { type RulesConfig, gate, type GateResult } from "./config";
import { isAtLeast, topicConflicts, type DealStage } from "./deals";
import { monthKey, inRange, type ISODate } from "../dates";

export const DELIVERABLE_FLOW = ["briefed", "drafting", "in_review", "approved", "scheduled", "live", "reported"] as const;
export type DeliverableStatus = (typeof DELIVERABLE_FLOW)[number] | "cancelled";

export type DeliverableFacts = {
  status: DeliverableStatus;
  scheduledFor: ISODate | null;
  disclosureChecked: boolean;
  claimsApprovedByBrand: boolean;
  briefTags: string[];
  revisionRound: number;
};

export type DeliverableContext = {
  dealStage: DealStage;
  hasAdvanceOverride: boolean;
  hasPoOverride: boolean;
  poOrConfirmation: boolean;
  topicFilters: { kind: string; value: string }[];
  blackouts: { startsOn: ISODate; endsOn: ISODate }[];
  /** Calendar items for the creator in the month of scheduled_for, excluding this deliverable and blackouts. */
  monthItems: { kind: string }[];
  sponsoredRatioMax: number;
};

/** Sponsored share of the month if this deliverable is added (§0.1 #11: max 1 in 4). */
export function sponsoredRatioWith(monthItems: { kind: string }[]): number {
  const items = monthItems.filter((i) => i.kind !== "blackout" && i.kind !== "shoot");
  const sponsored = items.filter((i) => i.kind === "sponsored").length + 1;
  return sponsored / (items.length + 1);
}

export function blackoutOverlap(date: ISODate | null, blackouts: { startsOn: ISODate; endsOn: ISODate }[]): boolean {
  if (!date) return false;
  return blackouts.some((b) => inRange(date, b.startsOn, b.endsOn));
}

/** Can the deliverable move to scheduled or live? Returns blocks and warnings. */
export function canScheduleOrGoLive(cfg: RulesConfig, d: DeliverableFacts, ctx: DeliverableContext): GateResult {
  const r: string[] = [];
  const w: string[] = [];
  if (!isAtLeast(ctx.dealStage, "advance_received") && !ctx.hasAdvanceOverride) r.push("Advance not received");
  if (!ctx.poOrConfirmation && !ctx.hasPoOverride) r.push("No PO or email confirmation");
  if (!d.disclosureChecked) r.push("Disclosure not checked");
  if (!d.claimsApprovedByBrand) r.push("Claims not approved by brand");
  const max = ctx.sponsoredRatioMax ?? cfg.n.sponsored_ratio_max;
  if (sponsoredRatioWith(ctx.monthItems) > max + 1e-9) r.push(`Sponsored share this month would exceed ${Math.round(max * 100)}%`);
  const conflicts = topicConflicts(d.briefTags, ctx.topicFilters);
  if (conflicts.length) r.push(`Topic filter: ${conflicts[0]}`);
  if (blackoutOverlap(d.scheduledFor, ctx.blackouts)) w.push("Inside a creator blackout week");
  return gate(r, w);
}

export function canTransitionDeliverable(cfg: RulesConfig, d: DeliverableFacts, to: DeliverableStatus, ctx: DeliverableContext): GateResult {
  if (to === "cancelled") return gate([]);
  if (d.status === "cancelled") return gate(["Deliverable is cancelled"]);
  const from = DELIVERABLE_FLOW.indexOf(d.status as (typeof DELIVERABLE_FLOW)[number]);
  const target = DELIVERABLE_FLOW.indexOf(to as (typeof DELIVERABLE_FLOW)[number]);
  // Requested changes send a draft back to drafting.
  if (to === "drafting" && (d.status === "in_review" || d.status === "approved")) return gate([]);
  if (target !== from + 1) return gate([`Next status is ${DELIVERABLE_FLOW[from + 1] ?? "none"}`]);
  if (to === "approved" && !d.claimsApprovedByBrand) return gate(["Claims not approved by brand"]);
  if (to === "scheduled" || to === "live") {
    if (to === "scheduled" && !d.scheduledFor) return gate(["Pick a date"]);
    return canScheduleOrGoLive(cfg, d, ctx);
  }
  return gate([]);
}

/** Claims-only approvals, two rounds; round 3 opens a case-by-case revision line (§0.1 #11, §8.3). */
export function requestChanges(d: DeliverableFacts): { revisionRound: number; opensCaseByCaseLine: boolean } {
  const round = d.revisionRound + 1;
  return { revisionRound: round, opensCaseByCaseLine: round >= 3 };
}

export function monthOf(date: ISODate) {
  return monthKey(date);
}
