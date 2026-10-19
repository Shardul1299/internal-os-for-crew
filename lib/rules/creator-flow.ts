// Creator workflow gates built on lib/rules/creators.ts (BRIEF §1, §4, §19.3, §20).
// The two-step roster promotion, the stage menu with blocked reasons, who edits what,
// and Studio invitations. Follower counts are not an input anywhere in this file.
import { type RulesConfig, gate, type GateResult } from "./config";
import { canTransition, rosterGate, type CreatorFacts, type Role, type Stage, type TransitionTarget } from "./creators";
import type { ISODate } from "../dates";

const CREW = new Set<string>(["owner", "crew_lead"]);

/** Step one of → roster: the Crew lead proposes once every roster-gate item is met (§4). */
export function canProposeRoster(cfg: RulesConfig, c: CreatorFacts, ctx: { role: Role; today: ISODate; alreadyProposed: boolean }): GateResult {
  const r: string[] = [];
  if (!CREW.has(ctx.role)) r.push("Only the Crew lead proposes roster promotions");
  if (c.stage !== "incubation" && c.stage !== "watchlist") r.push("Only Incubation or Watchlist creators move to Roster");
  if (ctx.alreadyProposed) r.push("Already proposed; awaiting the Owner");
  r.push(...rosterGate(cfg, c, ctx.today).missing.map((m) => m.reason));
  return gate(r);
}

/** The Owner turns down a roster proposal. */
export function canRejectRoster(ctx: { role: Role; proposed: boolean }): GateResult {
  const r: string[] = [];
  if (ctx.role !== "owner") r.push("Only the Owner decides roster proposals");
  if (!ctx.proposed) r.push("No roster proposal");
  return gate(r);
}

export type StageMove = {
  /** What the action layer runs. */
  key: "watchlist" | "incubation" | "propose_roster" | "approve_roster" | "reject_roster" | "revisit" | "declined" | "alumni" | "return_roster";
  label: string;
  /** Empty when the move is allowed. */
  reasons: string[];
  /** The move collects a reason in a sheet before it runs. */
  needsReason: boolean;
  /** The move has side effects that can't be undone (agreement, check-ins). */
  irreversible: boolean;
};

const LABEL: Record<StageMove["key"], string> = {
  watchlist: "Watchlist",
  incubation: "Incubation",
  propose_roster: "Propose to roster",
  approve_roster: "Approve roster",
  reject_roster: "Reject roster proposal",
  revisit: "Revisit",
  declined: "Declined",
  alumni: "Alumni",
  return_roster: "Return to roster",
};

/**
 * Every §4 move from the creator's stage, each with its blocked reasons from canTransition.
 * Reason-collecting moves are evaluated as if a reason were given; the sheet then requires one.
 */
export function stageMoves(cfg: RulesConfig, c: CreatorFacts, ctx: { role: Role; today: ISODate; rosterProposed: boolean }): StageMove[] {
  const base = { role: ctx.role, today: ctx.today };
  const t = (to: TransitionTarget, extra: { reason?: string; ownerApproval?: boolean } = {}) => canTransition(cfg, c, to, { ...base, ...extra }).reasons;
  const out: StageMove[] = [];
  const add = (key: StageMove["key"], reasons: string[], needsReason = false, irreversible = false) => out.push({ key, label: LABEL[key], reasons, needsReason, irreversible });

  if (c.stage === "scout" || c.stage === "revisit") add("watchlist", t("watchlist"));
  if (c.stage === "watchlist") add("incubation", t("incubation"));
  if (c.stage === "watchlist" || c.stage === "incubation") {
    if (!ctx.rosterProposed) add("propose_roster", canProposeRoster(cfg, c, { ...base, alreadyProposed: false }).reasons);
    else {
      add("approve_roster", t("roster", { ownerApproval: true }), false, true);
      add("reject_roster", canRejectRoster({ role: ctx.role, proposed: true }).reasons, true);
    }
  }
  if (c.stage === "roster") add("alumni", t("alumni", { reason: "—" }), true, true);
  if (c.stage === "alumni") add("return_roster", t("return_roster"), false, true);
  if (c.stage !== "revisit") add("revisit", t("revisit"));
  if (c.stage !== "declined") {
    // BRIEF: clarify — restrictive reading: partnered creators leave through Alumni, never Declined.
    const extra = c.stage === "roster" || c.stage === "alumni" ? ["Roster creators move to Alumni, not Declined"] : [];
    add("declined", [...t("declined", { reason: "—" }), ...extra], true);
  }
  return out;
}

/** roster → alumni side effects (§4): agreement exits and exclusivity ends. */
export function alumniEffects() {
  return { agreement: { status: "exited" as const, exclusive: false } };
}

/** The Filter context a new score defaults to for a stage (§3.1). */
export function filterContextFor(stage: Stage): "scout" | "watchlist_review" | "incubation_review" | "roster_review" {
  switch (stage) {
    case "watchlist":
      return "watchlist_review";
    case "incubation":
      return "incubation_review";
    case "roster":
    case "alumni":
      return "roster_review";
    default:
      return "scout";
  }
}

/** Interns do Scout/Watchlist research and data entry (§1); Crew edits any stage. */
export function canEditCreator(role: string, stage: Stage): GateResult {
  if (CREW.has(role)) return gate([]);
  if (role === "intern") return gate(stage === "scout" || stage === "watchlist" || stage === "revisit" ? [] : ["Interns edit Scout and Watchlist records only"]);
  return gate(["Your role can't edit creators"]);
}

/** Interns create Scouts only; every new record starts at Scout (§4 → scout). */
export function canCreateCreator(role: string): GateResult {
  return gate(CREW.has(role) || role === "intern" ? [] : ["Your role can't create creators"]);
}

/** Interns score as scribes; Crew scores. Viewers never do. */
export function canScoreFilter(role: string): GateResult {
  return gate(CREW.has(role) || role === "intern" ? [] : ["Your role can't score the Filter"]);
}

/** Tier signals feed tier, which interns can't see (§1, §0.1 #6). */
export function canEditSignals(role: string): GateResult {
  return gate(CREW.has(role) ? [] : ["Only the Crew lead records tier signals"]);
}

/** A creator's Standard is a money field: Crew lead and Owner only (§1). */
export function canSetStandards(role: string): GateResult {
  return gate(CREW.has(role) ? [] : ["Only the Crew lead sets Standards"]);
}

/** Topic filters and anchor plans: Crew with the creator, plus the Strategist (§1, §20). */
export function canEditContentPlan(role: string): GateResult {
  return gate(CREW.has(role) || role === "strategist" ? [] : ["Only the Crew lead or Strategist edits the content plan"]);
}

/** Blackout weeks are the creator's call; Crew calendar roles record them (§3.1, §1). */
export function canEditBlackouts(role: string): GateResult {
  return gate(CREW.has(role) || role === "strategist" || role === "ops" ? [] : ["Your role can't edit calendars"]);
}

/** Crew lead or Strategist can propose items on a creator's calendar; the creator decides (§19.3). */
export function canProposeCalendarItem(role: string, kind: string): GateResult {
  const r: string[] = [];
  if (!(CREW.has(role) || role === "strategist")) r.push("Only the Crew lead or Strategist proposes calendar items");
  if (kind === "sponsored") r.push("Sponsored items come from scheduled deliverables");
  if (kind === "blackout") r.push("Blackouts are set as blackout weeks");
  return gate(r);
}

/** Agreement edits and check-ins are Crew lead work (§1). */
export function canRunCheckins(role: string): GateResult {
  return gate(CREW.has(role) ? [] : ["Only the Crew lead runs check-ins"]);
}

export function canEditAgreement(role: string): GateResult {
  return gate(CREW.has(role) ? [] : ["Only the Crew lead edits agreements"]);
}

/**
 * Studio access starts at incubation and stays at roster (§4 Studio access, §19.16).
 * Consent must be opted in and the record must carry an email to invite.
 * BRIEF: clarify — consent opted-in is required to invite (restrictive reading).
 */
export function canInviteToStudio(args: { role: string; stage: Stage; consentStatus: string; email: string | null; hasActiveUser: boolean }): GateResult {
  const r: string[] = [];
  if (!CREW.has(args.role)) r.push("Only the Crew lead invites creators to Studio");
  if (args.stage !== "incubation" && args.stage !== "roster") r.push("Studio opens at Incubation");
  if (args.consentStatus !== "opted_in") r.push("Consent not opted in");
  if (!args.email?.trim()) r.push("Add an email first");
  if (args.hasActiveUser) r.push("Already invited");
  return gate(r);
}

/** Display status of an agreement: the exit window opens on its date (§3.1). */
export function agreementDisplayStatus(a: { status: "pilot" | "active" | "exit_window_open" | "exited"; exitWindowAt: ISODate | null }, today: ISODate) {
  if (a.status === "active" && a.exitWindowAt && today >= a.exitWindowAt) return "exit_window_open" as const;
  return a.status;
}

/** Anchor plan (§3.1): the creator's sponsored ratio can be stricter than the setting, never looser (§0.1 #11). */
export function validateAnchorPlan(cfg: RulesConfig, plan: { anchorFormat: string; sponsoredRatioMax: number }): GateResult {
  const r: string[] = [];
  if (!plan.anchorFormat.trim()) r.push("Anchor format is required");
  if (!Number.isFinite(plan.sponsoredRatioMax) || plan.sponsoredRatioMax < 0) r.push("Sponsored ratio must be 0 or more");
  else if (plan.sponsoredRatioMax > cfg.n.sponsored_ratio_max + 1e-9) r.push(`Sponsored ratio can't exceed ${Math.round(cfg.n.sponsored_ratio_max * 100)}%`);
  return gate(r);
}

/**
 * Each completed quarterly check-in schedules the next (§9). Roster entry already schedules four,
 * so the next one is added only when no quarterly is still pending after this one.
 * BRIEF: clarify — §9 says both "schedules four" and "each completed check-in schedules the next".
 */
export function needsNextQuarterly(type: string, pendingQuarterlyDueDates: ISODate[], heldOn: ISODate): boolean {
  if (type !== "quarterly") return false;
  return !pendingQuarterlyDueDates.some((d) => d > heldOn);
}

/** Blackout weeks need a start on or before the end. */
export function validateBlackout(b: { startsOn: ISODate; endsOn: ISODate }): GateResult {
  return gate(b.endsOn < b.startsOn ? ["End is before start"] : []);
}

/**
 * roster pilot → partnership happens "at pilot end" (§4). canStartPartnership checks the Filter re-score
 * and Owner approval; this adds the pilot-end date so a partnership can't start mid-pilot.
 */
export function canStartPartnershipNow(base: GateResult, pilotEndsOn: ISODate | null, today: ISODate): GateResult {
  const r = [...base.reasons];
  if (!pilotEndsOn) r.push("Pilot end date missing");
  else if (today < pilotEndsOn) r.push(`Pilot ends ${pilotEndsOn}`);
  return gate(r);
}
