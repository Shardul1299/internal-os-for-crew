// Labels for creator enums (display only).
export const SOURCE_LABEL: Record<string, string> = {
  program: "Program",
  frontseat: "Frontseat",
  ayush_network: "Ayush network",
  referral: "Referral",
  inbound: "Inbound",
  outbound: "Outbound",
  event: "Event",
};

export const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
  other: "Other",
};

export const SIGNAL_LABEL: Record<string, string> = {
  inbound_founder: "Founder inbound",
  inbound_brand: "Brand inbound",
  speaking: "Speaking",
  podcast: "Podcast",
  press: "Press",
  newsletter_subs: "Newsletter subscribers",
  community: "Community",
  prior_enterprise_deal: "Prior enterprise deal",
  prior_vc_deal: "Prior VC deal",
  advisory_role: "Advisory role",
  other: "Other",
};

export const EVIDENCE_LABEL: Record<string, string> = {
  shipped_product: "Shipped product",
  repo: "Repo",
  employment: "Employment",
  cited_by_practitioners: "Cited by practitioners",
  paper: "Paper",
  benchmark: "Benchmark",
  tutorial_series: "Tutorial series",
  other: "Other",
};

export const CONTEXT_LABEL: Record<string, string> = {
  scout: "Scout",
  challenge: "Challenge",
  watchlist_review: "Watchlist review",
  incubation_review: "Incubation review",
  roster_review: "Roster review",
  quarterly: "Quarterly",
};

export const CHECKIN_LABEL: Record<string, string> = {
  quarterly: "Quarterly",
  strategy_refresh: "Strategy refresh",
  roadmap: "Roadmap",
  adhoc: "Ad hoc",
  pilot_end: "Pilot-end review",
  exit_window: "Exit-window review",
};

export const AREA_LABEL: Record<string, string> = {
  platform_audience: "Platform / audience",
  own_product: "Own product or course",
  speaking_press: "Speaking and press",
  advisory_fund_board: "Advisory / fund / board",
};

export const AGREEMENT_LABEL: Record<string, string> = {
  pilot: "Pilot",
  active: "Partnership",
  exit_window_open: "Exit window open",
  exited: "Exited",
};

export const TOPIC_KIND_LABEL: Record<string, string> = {
  category: "Category",
  competitor: "Competitor",
  claim: "Claim",
  format: "Format",
  brand: "Brand",
};

export const DEAL_TYPE_LABEL: Record<string, string> = {
  pilot: "Pilot",
  retainer: "Retainer",
  quarterly: "Quarterly",
  annual: "Annual",
  one_off: "One-off",
};

export const PAYOUT_KIND_LABEL: Record<string, string> = {
  fee_advance: "Fee advance",
  fee_balance: "Fee balance",
  upsell_share: "Upsell share",
  referral_share: "Referral share",
};

export const CALENDAR_KIND_LABEL: Record<string, string> = {
  anchor: "Anchor",
  derivative: "Derivative",
  sponsored: "Sponsored",
  organic: "Organic",
  shoot: "Shoot",
  blackout: "Blackout",
};

export const ROADMAP_STATUS = ["open", "in_progress", "done", "dropped"] as const;
