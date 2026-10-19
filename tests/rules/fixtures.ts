import { DEFAULT_CONFIG } from "@/lib/rules/config";
import type { CreatorFacts } from "@/lib/rules/creators";
import type { DealFacts, DealCreatorFacts } from "@/lib/rules/deals";

export const cfg = DEFAULT_CONFIG;
export const TODAY = "2026-10-19";

export function creator(over: Partial<CreatorFacts> = {}): CreatorFacts {
  return {
    stage: "scout",
    source: "outbound",
    subCategory: "ai_educator",
    consentStatus: "opted_in",
    representedElsewhere: false,
    isEmployedElsewhere: false,
    employerDisclosureUrl: null,
    isFounder: false,
    ownProductContentPct: null,
    filterScores: [{ aesthetics: 4, taste: 4, personality: 5, total: 13, sentence: "Sharp, specific, warm.", scoredAt: "2026-10-01", context: "scout" }],
    tierSignalCount: 2,
    topicFilterCount: 3,
    hasAnchorPlan: true,
    ...over,
  };
}

export function dealCreator(over: Partial<DealCreatorFacts> = {}): DealCreatorFacts {
  return { ...creator({ stage: "roster" }), id: "c1", name: "Asha", role: "primary", status: "accepted", topicFilters: [], ...over };
}

export function deal(over: Partial<DealFacts> = {}): DealFacts {
  return {
    stage: "lead",
    type: "pilot",
    oneOffReason: null,
    origin: "crew_originated",
    originatingCreatorId: null,
    quotedTotalPaise: 50_000_00,
    signedTotalPaise: null,
    termStartsOn: null,
    termEndsOn: null,
    piecesPerMonth: null,
    exclusivity: { scope: "none", days: 0 },
    usageRights: [],
    briefMd: null,
    briefUrl: null,
    briefTags: [],
    referralNote: null,
    sowMd: null,
    sowUrl: null,
    poReference: null,
    confirmationUrl: null,
    reportUrl: null,
    feedbackRequested: false,
    noListCheck: { rev_share_only: false, no_budget_educational: false, barter: false, lifetime_rights: false, shady_tool: false, blocklist_category: null },
    brand: { ownerTeam: "crew", riskReviewedAt: "2026-09-01", isHouseClient: false },
    creators: [dealCreator()],
    lines: [{ creatorId: "c1", deliverableKey: "ig_reel_dedicated", qty: 1, standardPaise: 50_000_00, rung: "standard", addons: [] }],
    overrides: [],
    advanceInvoice: null,
    balanceInvoice: null,
    deliverables: [],
    payouts: [],
    ...over,
  };
}
