// Campaign workflow helpers — BRIEF §8 (add creators, Frontseat, report, feedback), §0.1 #14.
import { type RulesConfig, gate, type GateResult } from "./config";
import { dealEligibility, type CreatorFacts } from "./creators";
import { topicConflicts } from "./deals";
import { daysBetween, type ISODate } from "../dates";

/** Frontseat amplification is a five-post package (§3.4, §8.4). BRIEF: clarify — package size as a setting. */
export const FRONTSEAT_POSTS = 5;
export const FRONTSEAT_KEY = "frontseat_amplification";

/** Add creators (§8.7): roster only, Filter passes, not represented elsewhere, no topic-filter conflict with the brief. */
export function canAddToCampaign(
  cfg: RulesConfig,
  c: Pick<CreatorFacts, "stage" | "filterScores" | "representedElsewhere">,
  briefTags: string[],
  topicFilters: { kind: string; value: string }[],
): GateResult {
  const e = dealEligibility(cfg, c, false);
  const conflicts = topicConflicts(briefTags, topicFilters);
  return gate([...e.reasons, ...conflicts.map((x) => `Topic filter: ${x}`)]);
}

export type MetricRow = {
  saves: number | null;
  shares: number | null;
  commentsDecisionMaker: number | null;
  inboundToBrand: number | null;
  trackedSignups: number | null;
  impressions: number | null;
};

export type Credibility = {
  decisionMakerComments: number;
  saves: number;
  shares: number;
  inbound: number;
  signups: number;
  impressions: number;
  reporting: number;
};

/** Report (§8.5): credibility metrics first, impressions last. One metrics record per deliverable. */
export function credibilityTotals(rows: MetricRow[]): Credibility {
  const n = (v: number | null) => v ?? 0;
  return rows.reduce<Credibility>(
    (t, r) => ({
      decisionMakerComments: t.decisionMakerComments + n(r.commentsDecisionMaker),
      saves: t.saves + n(r.saves),
      shares: t.shares + n(r.shares),
      inbound: t.inbound + n(r.inboundToBrand),
      signups: t.signups + n(r.trackedSignups),
      impressions: t.impressions + n(r.impressions),
      reporting: t.reporting + 1,
    }),
    { decisionMakerComments: 0, saves: 0, shares: 0, inbound: 0, signups: 0, impressions: 0, reporting: 0 },
  );
}

/** Five-question survey average (1–5), or null when nothing is answered. */
export function feedbackAverage(f: { q1: number | null; q2: number | null; q3: number | null; q4: number | null; q5: number | null }): number | null {
  const vals = [f.q1, f.q2, f.q3, f.q4, f.q5].filter((v): v is number => v != null);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export function quarterOf(d: ISODate): string {
  const m = Number(d.slice(5, 7));
  return `${d.slice(0, 4)}-Q${Math.floor((m - 1) / 3) + 1}`;
}

/** Quarterly NPS (§0.1 #14): one response per brand per quarter, 0–10. */
export function canSubmitNps(score: number, lastNpsOn: ISODate | null, today: ISODate): GateResult {
  const r: string[] = [];
  if (!Number.isInteger(score) || score < 0 || score > 10) r.push("Score must be 0–10");
  if (lastNpsOn && quarterOf(lastNpsOn) === quarterOf(today)) r.push("Already answered this quarter");
  return gate(r);
}

/** Five-question survey after a campaign: only once feedback is requested, once per campaign, every answer 1–5. */
export function canSubmitCampaignFeedback(
  answers: (number | null)[],
  campaign: { feedbackRequestedAt: Date | string | null },
  alreadySubmitted: boolean,
): GateResult {
  const r: string[] = [];
  if (!campaign.feedbackRequestedAt) r.push("Feedback hasn't been requested for this campaign");
  if (alreadySubmitted) r.push("Feedback already submitted");
  if (answers.length !== 5 || answers.some((a) => a == null || !Number.isInteger(a) || a < 1 || a > 5)) r.push("Answer all five questions, 1–5");
  return gate(r);
}

/** Brand risk review is valid for `risk_review_days` (§5.2). */
export function riskReviewCurrent(cfg: RulesConfig, reviewedOn: ISODate | null, today: ISODate): boolean {
  return !!reviewedOn && daysBetween(reviewedOn, today) <= cfg.n.risk_review_days;
}

export const RISK_FLAGS = [
  { key: "misleading_claims", label: "Misleading claims" },
  { key: "undisclosed_data_use", label: "Undisclosed data use" },
  { key: "crypto_or_regulatory", label: "Crypto or regulatory exposure" },
  { key: "blocklist_gambling", label: "Blocklist: gambling / RMG" },
  { key: "blocklist_crypto", label: "Blocklist: crypto" },
  { key: "blocklist_unregulated_lending", label: "Blocklist: unregulated lending" },
  { key: "blocklist_political_religious", label: "Blocklist: political / religious" },
] as const;
export type RiskFlag = (typeof RISK_FLAGS)[number]["key"];

/** Brand portal invite: the contact needs an email and no existing portal user. */
export function canInviteContact(c: { email: string | null; portalUserId: string | null }): GateResult {
  const r: string[] = [];
  if (!c.email?.trim()) r.push("Contact needs an email");
  if (c.portalUserId) r.push("Already invited");
  return gate(r);
}
