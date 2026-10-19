// The rules configuration. Every threshold, percentage and cadence is a setting
// (BRIEF §3.7, §12). DEFAULT_CONFIG mirrors the §12 seed exactly; at runtime the
// config is loaded from the settings tables by lib/settings.ts.

export type RungKey = "lucrative" | "semi" | "standard" | "pitch" | "premium";
export const RUNG_ORDER: RungKey[] = ["lucrative", "semi", "standard", "pitch", "premium"];

export type DealOrigin = "crew_originated" | "creator_inbound" | "frontseat_lead" | "snoball_referral" | "owled_referral";
export type Tier = "T0" | "T1" | "T2" | "T3";

export type AddonDef = { key: string; label: string; pct: number | null; kind: "usage" | "rush" | "revision" | "blocked"; days: number | null; note?: string };
export type DeliverableDef = { key: string; label: string; platform: string; multiple: number };

export type RulesConfig = {
  ladderVersionId: string | null;
  rungs: Record<RungKey, number>; // pct vs Standard, e.g. -30
  tierScale: Record<Tier, number>;
  deliverables: DeliverableDef[];
  addons: AddonDef[];
  filter: { watchlist: number; roster: number; challengeTopN: number; revisitMin: number; revisitMax: number };
  commission: Record<DealOrigin, number>;
  upsellSharePct: number;
  referralSharePct: number;
  referralDealCount: number;
  noList: { key: string; label: string }[];
  blocklist: { key: string; label: string }[];
  n: {
    advance_pct: number;
    advance_due_days: number;
    balance_due_days: number;
    payout_days: number;
    pilot_days: number;
    partnership_months: number;
    exit_window_months: number;
    sponsored_ratio_max: number;
    min_deal_paise: number;
    inbox_sla_hours: number;
    checkin_cadence_days: number;
    usage_max_days: number;
    first_look_months: number;
    revisit_months: number;
    tier1_reel_standard_placeholder: number;
    late_fee_pct_month: number;
    kill_fee_after_script: number;
    kill_fee_after_production: number;
    retainer_pause_days: number;
    risk_review_days: number;
    filter_rescore_days: number;
    strategy_refresh_months: number;
    program_revisit_months: number;
    // Studio (§12.8)
    ratio_warning_points: number;
    ideation_batch_size: number;
    outlier_threshold: number;
    calendar_window_weeks: number;
    carousel_default_slides: number;
    gst_pct: number;
  };
};

export const NUMERIC_SETTINGS: { key: keyof RulesConfig["n"]; label: string; value: number; unit?: string }[] = [
  { key: "advance_pct", label: "Advance", value: 50, unit: "%" },
  { key: "advance_due_days", label: "Advance due", value: 7, unit: "days" },
  { key: "balance_due_days", label: "Balance due after completion", value: 7, unit: "days" },
  { key: "payout_days", label: "Creator payout after receipt", value: 5, unit: "business days" },
  { key: "pilot_days", label: "Pilot length", value: 90, unit: "days" },
  { key: "partnership_months", label: "Partnership length", value: 24, unit: "months" },
  { key: "exit_window_months", label: "Exit window", value: 12, unit: "months" },
  { key: "sponsored_ratio_max", label: "Sponsored ratio max", value: 0.25, unit: "ratio" },
  { key: "min_deal_paise", label: "Minimum deal", value: 2500000, unit: "paise" },
  { key: "inbox_sla_hours", label: "Inbox SLA", value: 24, unit: "hours" },
  { key: "checkin_cadence_days", label: "Check-in cadence", value: 90, unit: "days" },
  { key: "usage_max_days", label: "Usage max", value: 365, unit: "days" },
  { key: "first_look_months", label: "First look", value: 18, unit: "months" },
  { key: "revisit_months", label: "Revisit after", value: 6, unit: "months" },
  { key: "tier1_reel_standard_placeholder", label: "Tier 1 Reel Standard placeholder", value: 5000000, unit: "paise" },
  { key: "late_fee_pct_month", label: "Late fee", value: 1.5, unit: "%/month" },
  { key: "kill_fee_after_script", label: "Kill fee after script approval", value: 50, unit: "%" },
  { key: "kill_fee_after_production", label: "Kill fee after production", value: 100, unit: "%" },
  { key: "retainer_pause_days", label: "Retainer pause (once a year)", value: 30, unit: "days" },
  { key: "risk_review_days", label: "Brand risk review valid for", value: 180, unit: "days" },
  { key: "filter_rescore_days", label: "Filter re-score valid for", value: 90, unit: "days" },
  { key: "strategy_refresh_months", label: "Strategy refresh after roster entry", value: 6, unit: "months" },
  { key: "program_revisit_months", label: "Program revisit after", value: 3, unit: "months" },
  { key: "ratio_warning_points", label: "Studio ratio warning", value: 10, unit: "points" },
  { key: "ideation_batch_size", label: "Studio ideation batch", value: 12, unit: "topics" },
  { key: "outlier_threshold", label: "Outlier threshold", value: 5, unit: "×" },
  { key: "calendar_window_weeks", label: "Calendar window", value: 8, unit: "weeks" },
  { key: "carousel_default_slides", label: "Carousel default", value: 8, unit: "slides" },
  { key: "gst_pct", label: "GST on invoices", value: 18, unit: "%" },
];

export const DEFAULT_DELIVERABLES: DeliverableDef[] = [
  { key: "ig_reel_dedicated", label: "Instagram Reel, dedicated", platform: "instagram", multiple: 1.0 },
  { key: "ig_reel_integrated", label: "Instagram Reel, integrated", platform: "instagram", multiple: 0.7 },
  { key: "ig_carousel_static", label: "Instagram carousel / static", platform: "instagram", multiple: 0.6 },
  { key: "ig_story_set", label: "Instagram story set (3–5) + link", platform: "instagram", multiple: 0.25 },
  { key: "yt_integration", label: "YouTube integration", platform: "youtube", multiple: 1.5 },
  { key: "yt_dedicated", label: "YouTube dedicated", platform: "youtube", multiple: 3.0 },
  { key: "x_thread", label: "X thread", platform: "x", multiple: 0.5 },
  { key: "linkedin_post", label: "LinkedIn post", platform: "linkedin", multiple: 0.6 },
];

export const DEFAULT_ADDONS: AddonDef[] = [
  { key: "usage_organic_90", label: "Organic reuse, 90 days", pct: 20, kind: "usage", days: 90 },
  { key: "usage_whitelist_90", label: "Whitelisting, 90 days", pct: 40, kind: "usage", days: 90 },
  { key: "usage_web_365", label: "Web / print, 12 months", pct: 30, kind: "usage", days: 365 },
  { key: "rush_7d", label: "Rush, under 7 days", pct: 15, kind: "rush", days: 7 },
  { key: "rush_2d", label: "Rush, under 2 days", pct: 25, kind: "rush", days: 2 },
  { key: "revisions_r3", label: "Revisions beyond round 2", pct: null, kind: "revision", days: null, note: "Case by case" },
  { key: "exclusivity", label: "Exclusivity", pct: null, kind: "usage", days: null, note: "Forces the Premium rung" },
  { key: "lifetime", label: "Lifetime usage", pct: null, kind: "blocked", days: null, note: "Not offered" },
];

export const DEFAULT_NO_LIST = [
  { key: "rev_share_only", label: "Rev-share only" },
  { key: "no_budget_educational", label: "Educational without pricing" },
  { key: "barter", label: "Barter" },
  { key: "lifetime_rights", label: "Lifetime rights" },
  { key: "shady_tool", label: "Shady AI tool" },
];

export const DEFAULT_BLOCKLIST = [
  { key: "gambling_rmg", label: "Gambling / real-money gaming" },
  { key: "crypto", label: "Crypto exchanges & tokens" },
  { key: "unregulated_lending", label: "Unregulated lending / fintech" },
  { key: "political_religious", label: "Political & religious" },
];

export const DEFAULT_CONFIG: RulesConfig = {
  ladderVersionId: null,
  rungs: { lucrative: -30, semi: -15, standard: 0, pitch: 20, premium: 50 },
  tierScale: { T0: 0.5, T1: 1, T2: 2.5, T3: 6 },
  deliverables: DEFAULT_DELIVERABLES,
  addons: DEFAULT_ADDONS,
  filter: { watchlist: 12, roster: 12, challengeTopN: 7, revisitMin: 10, revisitMax: 11 },
  commission: { crew_originated: 20, frontseat_lead: 20, snoball_referral: 20, owled_referral: 20, creator_inbound: 15 },
  upsellSharePct: 3,
  referralSharePct: 1.5,
  referralDealCount: 10,
  noList: DEFAULT_NO_LIST,
  blocklist: DEFAULT_BLOCKLIST,
  n: Object.fromEntries(NUMERIC_SETTINGS.map((s) => [s.key, s.value])) as RulesConfig["n"],
};

export type GateResult = { ok: boolean; reasons: string[]; warnings?: string[] };
export const pass = (warnings: string[] = []): GateResult => ({ ok: true, reasons: [], warnings });
export const gate = (reasons: string[], warnings: string[] = []): GateResult => ({ ok: reasons.length === 0, reasons, warnings });
