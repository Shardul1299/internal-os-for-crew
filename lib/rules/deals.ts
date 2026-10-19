// Deal pipeline — BRIEF §5.1, §5.2.
import { type RulesConfig, gate, type GateResult, type DealOrigin } from "./config";
import { validateQuote, type QuoteLineInput, type DealType } from "./ladder";
import { dealEligibility, type CreatorFacts } from "./creators";
import { daysBetween, type ISODate } from "../dates";

export const DEAL_STAGES = [
  "lead",
  "qualified",
  "brief_received",
  "creator_matched",
  "proposal_sent",
  "negotiation",
  "signed",
  "advance_received",
  "in_production",
  "live",
  "reported",
  "paid_in_full",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number] | "declined" | "lost";

export function stageIndex(s: DealStage): number {
  return (DEAL_STAGES as readonly string[]).indexOf(s);
}

export function nextStage(s: DealStage): DealStage | null {
  const i = stageIndex(s);
  if (i < 0 || i >= DEAL_STAGES.length - 1) return null;
  return DEAL_STAGES[i + 1];
}

export function isAtLeast(s: DealStage, target: DealStage): boolean {
  const a = stageIndex(s);
  return a >= 0 && a >= stageIndex(target);
}

export type OverrideKind = "no_list" | "below_lucrative" | "tier0_in_deal" | "go_live_without_advance" | "go_live_without_po" | "min_deal" | "other";

export type NoListToggles = {
  rev_share_only: boolean;
  no_budget_educational: boolean;
  barter: boolean;
  lifetime_rights: boolean;
  shady_tool: boolean;
  blocklist_category: string | null;
};

export function noListFlags(t: NoListToggles): string[] {
  const flags: string[] = [];
  if (t.rev_share_only) flags.push("Rev-share only");
  if (t.no_budget_educational) flags.push("Educational without pricing");
  if (t.barter) flags.push("Barter");
  if (t.lifetime_rights) flags.push("Lifetime rights");
  if (t.shady_tool) flags.push("Shady AI tool");
  if (t.blocklist_category) flags.push(`Blocklist: ${t.blocklist_category.replace(/_/g, " ")}`);
  return flags;
}

/** NO-list check passes only with no flags; any flag blocks unless an Owner override exists (§0.1 #10). */
export function noListPassed(t: NoListToggles | null, hasOverride: boolean): boolean {
  if (!t) return false;
  return noListFlags(t).length === 0 || hasOverride;
}

export type DealCreatorFacts = CreatorFacts & {
  id: string;
  name: string;
  role: "primary" | "upsell";
  status: "proposed" | "accepted" | "declined_by_creator";
  topicFilters: { kind: string; value: string }[];
};

export type DealFacts = {
  stage: DealStage;
  type: DealType | null;
  oneOffReason: string | null;
  origin: DealOrigin;
  originatingCreatorId: string | null;
  quotedTotalPaise: number;
  signedTotalPaise: number | null;
  termStartsOn: ISODate | null;
  termEndsOn: ISODate | null;
  piecesPerMonth: number | null;
  exclusivity: { scope: "none" | "product" | "category"; days: number };
  usageRights: { kind: string; days: number; channels?: string[] }[];
  briefMd: string | null;
  briefUrl: string | null;
  briefTags: string[];
  referralNote: string | null;
  sowMd: string | null;
  sowUrl: string | null;
  poReference: string | null;
  confirmationUrl: string | null;
  reportUrl: string | null;
  reportMd?: string | null;
  feedbackRequested: boolean;
  noListCheck: NoListToggles | null;
  declinedReason?: string | null;
  declinedValuePaise?: number | null;
  lostReason?: string | null;
  brand: { ownerTeam: "crew" | "owled_social" | "snoball" | "shared"; riskReviewedAt: ISODate | null; isHouseClient: boolean };
  creators: DealCreatorFacts[];
  lines: QuoteLineInput[];
  overrides: { kind: OverrideKind; approved: boolean }[];
  advanceInvoice: { status: string; paidAmountPaise: number | null; amountPaise: number } | null;
  balanceInvoice: { status: string } | null;
  deliverables: { status: string }[];
  payouts: { status: string }[];
};

export function hasOverride(d: Pick<DealFacts, "overrides">, kind: OverrideKind) {
  return d.overrides.some((o) => o.kind === kind && o.approved);
}

/** Topic-filter conflicts between brief tags and a creator's filters — blocks, naming the filter. */
export function topicConflicts(briefTags: string[], filters: { kind: string; value: string }[]): string[] {
  const tags = briefTags.map((t) => t.trim().toLowerCase()).filter(Boolean);
  return filters.filter((f) => tags.some((t) => t === f.value.trim().toLowerCase() || t.includes(f.value.trim().toLowerCase()))).map((f) => `${f.kind}: ${f.value}`);
}

/** Gate for moving a deal from its current stage to `to` (§5.2). */
export function canAdvance(cfg: RulesConfig, d: DealFacts, to: DealStage, today: ISODate): GateResult {
  const r: string[] = [];
  const warnings: string[] = [];

  if (to === "declined") {
    if (!d.declinedReason?.trim()) r.push("Declined reason required");
    if (d.declinedValuePaise == null) r.push("Declined value required");
    return gate(r);
  }
  if (to === "lost") {
    if (!d.lostReason?.trim()) r.push("Lost reason required");
    return gate(r);
  }
  if (d.stage === "declined" || d.stage === "lost" || d.stage === "paid_in_full") return gate(["Deal is closed"]);
  const expected = nextStage(d.stage);
  if (to !== expected) return gate([`Next stage is ${expected}`]);

  switch (to) {
    case "qualified": {
      if (!d.noListCheck) r.push("NO-list check not done");
      else if (!noListPassed(d.noListCheck, hasOverride(d, "no_list"))) r.push(`NO list: ${noListFlags(d.noListCheck).join(", ")} — needs Owner override`);
      if (!d.brand.riskReviewedAt) r.push("Brand risk not reviewed");
      else if (daysBetween(d.brand.riskReviewedAt, today) > cfg.n.risk_review_days) r.push(`Brand risk review older than ${cfg.n.risk_review_days} days`);
      if (!d.type) r.push("Deal type not set");
      if (d.type === "one_off" && !d.oneOffReason?.trim()) r.push("One-off needs a reason");
      if (d.quotedTotalPaise < cfg.n.min_deal_paise && !hasOverride(d, "min_deal")) r.push("Below the ₹25K minimum — send the self-serve template or get a min_deal override");
      if (d.brand.ownerTeam === "owled_social" && !d.referralNote?.trim()) r.push("OWLED Social brand needs a referral note");
      break;
    }
    case "brief_received": {
      if (!d.briefMd?.trim() && !d.briefUrl?.trim()) r.push("Brief not attached");
      break;
    }
    case "creator_matched": {
      const accepted = d.creators.filter((c) => c.status === "accepted");
      if (accepted.length === 0) r.push("No creator accepted");
      const t0 = hasOverride(d, "tier0_in_deal");
      for (const c of accepted) {
        const e = dealEligibility(cfg, c, t0);
        r.push(...e.reasons.map((x) => `${c.name}: ${x}`));
        const conflicts = topicConflicts(d.briefTags, c.topicFilters);
        if (conflicts.length) r.push(`${c.name}: topic filter ${conflicts.join(", ")}`);
      }
      if (d.origin === "creator_inbound" && !d.creators.some((c) => c.role === "upsell")) {
        warnings.push("Upsell with other roster creators in the requirement band?");
      }
      break;
    }
    case "proposal_sent": {
      const q = validateQuote(cfg, {
        lines: d.lines,
        exclusivity: d.exclusivity,
        usageRights: d.usageRights,
        hasBelowLucrativeOverride: hasOverride(d, "below_lucrative"),
      });
      r.push(...q.reasons);
      const t0Creators = d.creators.filter((c) => c.status === "accepted" && c.stage === "incubation").map((c) => c.id);
      if (t0Creators.length && d.lines.some((l) => t0Creators.includes(l.creatorId) && l.rung !== "standard")) {
        // BRIEF: clarify — "at the T0 rung" read as Standard on the T0-scaled default.
        r.push("Tier 0 lines stay at the T0 Standard");
      }
      break;
    }
    case "negotiation":
      break;
    case "signed": {
      if (!d.signedTotalPaise || d.signedTotalPaise <= 0) r.push("Signed total missing");
      if (!d.termStartsOn || !d.termEndsOn) r.push("Term dates missing");
      if (!d.piecesPerMonth) r.push("Pieces per month missing");
      for (const u of d.usageRights) if (u.days > cfg.n.usage_max_days) r.push(`Usage over ${cfg.n.usage_max_days} days`);
      if (!d.sowMd?.trim() && !d.sowUrl?.trim()) r.push("SOW not generated");
      break;
    }
    case "advance_received": {
      const inv = d.advanceInvoice;
      const needed = Math.round(((d.signedTotalPaise ?? 0) * cfg.n.advance_pct) / 100);
      const paidOk = !!inv && inv.status === "paid" && (inv.paidAmountPaise ?? inv.amountPaise) >= needed;
      if (!paidOk && !hasOverride(d, "go_live_without_advance")) r.push(`Advance (${cfg.n.advance_pct}%) not received`);
      break;
    }
    case "in_production": {
      if (!d.poReference?.trim() && !d.confirmationUrl?.trim() && !hasOverride(d, "go_live_without_po")) r.push("PO or email confirmation missing");
      break;
    }
    case "live": {
      if (!d.deliverables.some((x) => x.status === "live" || x.status === "reported")) r.push("No deliverable live yet");
      break;
    }
    case "reported": {
      const open = d.deliverables.filter((x) => !["live", "reported", "cancelled"].includes(x.status));
      if (open.length) r.push(`${open.length} deliverables not live or cancelled`);
      if (!d.reportUrl?.trim() && !d.reportMd?.trim()) r.push("Report not attached");
      if (!d.feedbackRequested) r.push("Brand feedback not requested");
      break;
    }
    case "paid_in_full": {
      if (!d.balanceInvoice || d.balanceInvoice.status !== "paid") r.push("Balance not paid");
      const unpaid = d.payouts.filter((p) => p.status !== "paid");
      if (unpaid.length) r.push(`${unpaid.length} payouts not paid`);
      if (d.payouts.length === 0) r.push("No payouts generated");
      break;
    }
  }
  return gate(r, warnings);
}

/** The first blocker for the board card's one-line blocker. */
export function firstBlocker(cfg: RulesConfig, d: DealFacts, today: ISODate): string | null {
  const n = nextStage(d.stage);
  if (!n) return null;
  const g = canAdvance(cfg, d, n, today);
  return g.ok ? null : g.reasons[0];
}

/** Below ₹25K the OS offers the self-serve template instead of a deal (§5.3). */
export function belowMinimum(cfg: RulesConfig, valuePaise: number): boolean {
  return valuePaise < cfg.n.min_deal_paise;
}

/** Overrides are approved by the Owner only (§3.4). */
export function canApproveOverride(role: string): GateResult {
  return gate(role === "owner" ? [] : ["Only the Owner approves overrides"]);
}

export function canRequestOverride(role: string, reason: string): GateResult {
  const r: string[] = [];
  if (!["owner", "crew_lead"].includes(role)) r.push("Only the Crew lead requests overrides");
  if (!reason.trim()) r.push("Reason required");
  return gate(r);
}
