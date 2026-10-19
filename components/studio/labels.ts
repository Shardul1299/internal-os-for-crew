// Display labels for Studio enums.
export const STUDIO_STATUS = ["idea", "researched", "scripted", "filmed", "edited", "posted"] as const;
export const STATUS_LABEL: Record<string, string> = { idea: "Idea", researched: "Researched", scripted: "Scripted", filmed: "Filmed", edited: "Edited", posted: "Posted" };
export const KIND_LABEL: Record<string, string> = { anchor: "Anchor", derivative: "Derivative", sponsored: "Sponsored", organic: "Organic", shoot: "Shoot", blackout: "Blackout" };
export const BUCKET_LABEL: Record<string, string> = { proven: "Proven", double_down: "Double down", experimental: "Experimental" };
export const PILLAR_LABEL: Record<string, string> = { authority: "Authority", journey: "Journey" };
export const FUNNEL_LABEL: Record<string, string> = { tofu: "TOFU", mofu: "MOFU", bofu: "BOFU" };
export const CTA_LABEL: Record<string, string> = { follow: "Follow", engagement: "Engagement", manychat: "ManyChat", none: "None", save: "Save", share: "Share", comment: "Comment", link: "Link" };
export const EFFORT_LABEL: Record<string, string> = { low: "Low", default: "Default", high: "High" };
export const TYPE_LABEL: Record<string, string> = { educational: "Educational", storytelling: "Storytelling", authority: "Authority", other: "Other" };
export const DELIV_STATUS: Record<string, string> = { briefed: "Briefed", drafting: "Drafting", in_review: "In review", approved: "Approved", scheduled: "Scheduled", live: "Live", reported: "Reported", cancelled: "Cancelled" };
export const PAYOUT_KIND: Record<string, string> = { fee_advance: "Fee · advance", fee_balance: "Fee · balance", upsell_share: "Upsell share", referral_share: "Referral share" };
export const ROADMAP_AREA: Record<string, string> = { platform_audience: "Platform & audience", own_product: "Own product or course", speaking_press: "Speaking & press", advisory_fund_board: "Advisory, fund, board" };
export const CHECKIN_TYPE: Record<string, string> = { quarterly: "Quarterly", strategy_refresh: "Strategy refresh", roadmap: "Roadmap", adhoc: "Ad hoc", pilot_end: "Pilot-end review", exit_window: "Exit-window review" };
export const lbl = (m: Record<string, string>, k: string | null | undefined) => (k ? (m[k] ?? k.replace(/_/g, " ")) : "—");
