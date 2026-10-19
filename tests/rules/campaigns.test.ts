import { describe, it, expect } from "vitest";
import { cfg, creator, TODAY } from "./fixtures";
import {
  canAddToCampaign,
  credibilityTotals,
  feedbackAverage,
  canSubmitNps,
  canSubmitCampaignFeedback,
  quarterOf,
  riskReviewCurrent,
  canInviteContact,
  nextFreeSlot,
} from "@/lib/rules/campaigns";
import { forwardingAddress, forwardedHandle, routeInbound, prescreenFlags, conversionDefaults, canConvert, canForward } from "@/lib/rules/inbox";
import { requestChanges, canTransitionDeliverable } from "@/lib/rules/deliverables";
import { assertNoInternal } from "@/lib/rules/visibility";

describe("§8.7 add creators", () => {
  const roster = creator({ stage: "roster" });
  it("roster creator with a passing Filter can be added", () => expect(canAddToCampaign(cfg, roster, ["agents"], []).ok).toBe(true));
  it("a non-roster creator can't be added", () => expect(canAddToCampaign(cfg, creator({ stage: "incubation" }), [], []).reasons[0]).toMatch(/Tier 0/));
  it("a Filter fail can't be added", () =>
    expect(canAddToCampaign(cfg, { ...roster, filterScores: [{ ...roster.filterScores[0], total: 9 }] }, [], []).reasons).toContain("Below the Filter threshold"));
  it("topic-filter conflict blocks with the filter named", () => {
    const g = canAddToCampaign(cfg, roster, ["crypto wallets"], [{ kind: "category", value: "crypto" }]);
    expect(g.ok).toBe(false);
    expect(g.reasons[0]).toBe("Topic filter: category: crypto");
  });
});

describe("§8.5 report — credibility first", () => {
  it("sums credibility metrics across deliverables and keeps impressions separate", () => {
    const t = credibilityTotals([
      { saves: 10, shares: 2, commentsDecisionMaker: 3, inboundToBrand: 1, trackedSignups: 5, impressions: 1000 },
      { saves: null, shares: 1, commentsDecisionMaker: 2, inboundToBrand: null, trackedSignups: 0, impressions: null },
    ]);
    expect(t).toEqual({ decisionMakerComments: 5, saves: 10, shares: 3, inbound: 1, signups: 5, impressions: 1000, reporting: 2 });
  });
});

describe("§8.6 feedback and quarterly NPS", () => {
  it("averages the five questions", () => expect(feedbackAverage({ q1: 5, q2: 4, q3: 5, q4: 5, q5: 5 })).toBe(4.8));
  it("one NPS per quarter, 0–10", () => {
    expect(quarterOf("2026-10-19")).toBe("2026-Q4");
    expect(canSubmitNps(9, null, TODAY).ok).toBe(true);
    expect(canSubmitNps(9, "2026-10-01", TODAY).ok).toBe(false);
    expect(canSubmitNps(9, "2026-09-30", TODAY).ok).toBe(true);
    expect(canSubmitNps(11, null, TODAY).ok).toBe(false);
  });
  it("survey needs a request, once per campaign, all five answers", () => {
    expect(canSubmitCampaignFeedback([5, 4, 5, 5, 5], { feedbackRequestedAt: null }, false).ok).toBe(false);
    expect(canSubmitCampaignFeedback([5, 4, 5, 5, 5], { feedbackRequestedAt: "2026-10-18" }, true).ok).toBe(false);
    expect(canSubmitCampaignFeedback([5, 4, null, 5, 5], { feedbackRequestedAt: "2026-10-18" }, false).ok).toBe(false);
    expect(canSubmitCampaignFeedback([5, 4, 3, 5, 5], { feedbackRequestedAt: "2026-10-18" }, false).ok).toBe(true);
  });
});

describe("§3.3 brand risk review and portal invite", () => {
  it("risk review valid for 180 days", () => {
    expect(riskReviewCurrent(cfg, "2026-05-01", TODAY)).toBe(true);
    expect(riskReviewCurrent(cfg, "2026-04-01", TODAY)).toBe(false);
    expect(riskReviewCurrent(cfg, null, TODAY)).toBe(false);
  });
  it("invite needs an email and no existing user", () => {
    expect(canInviteContact({ email: "a@b.c", portalUserId: null }).ok).toBe(true);
    expect(canInviteContact({ email: null, portalUserId: null }).ok).toBe(false);
    expect(canInviteContact({ email: "a@b.c", portalUserId: "u" }).ok).toBe(false);
  });
});

describe("§6 inbox — forwarding address routing", () => {
  const creators = [
    { id: "meera", handles: ["@meera.builds.ai"] },
    { id: "arjun", handles: ["arjun.ships"] },
  ];
  it("builds the per-creator forwarding address", () => expect(forwardingAddress("@Meera.Builds.AI", "inbox.crew.example")).toBe("meera.builds.ai@inbox.crew.example"));
  it("reads the handle from a display-name address", () => expect(forwardedHandle("Crew for Meera <meera.builds.ai@inbox.crew.example>", "inbox.crew.example")).toBe("meera.builds.ai"));
  it("routes to the matching creator, else to Crew", () => {
    expect(routeInbound("meera.builds.ai@inbox.crew.example", "inbox.crew.example", creators)).toBe("meera");
    expect(routeInbound("nobody@inbox.crew.example", "inbox.crew.example", creators)).toBeNull();
    expect(routeInbound("arjun.ships@gmail.com", "inbox.crew.example", creators)).toBeNull();
  });
  it("pre-screen flags and conversion defaults", () => {
    expect(prescreenFlags({ rev_share_only: false, barter: true, blocklist_category: "crypto" })).toEqual(["barter", "blocklist crypto"]);
    expect(prescreenFlags(null)).toEqual([]);
    expect(conversionDefaults({ creatorId: null })).toEqual({ origin: "crew_originated", originatingCreatorId: null });
    expect(canConvert({ brandId: "b", status: "triaged", noListPrescreen: {} }).ok).toBe(true);
    expect(canForward({ creatorId: null }).ok).toBe(false);
  });
});

describe("§8.3 claims-only approvals, two rounds", () => {
  const d = { status: "in_review" as const, scheduledFor: null, disclosureChecked: false, claimsApprovedByBrand: false, briefTags: [], revisionRound: 1 };
  const ctx = { dealStage: "in_production" as const, hasAdvanceOverride: false, hasPoOverride: false, poOrConfirmation: true, topicFilters: [], blackouts: [], monthItems: [], sponsoredRatioMax: 0.25 };
  it("changes requested send the draft back to drafting", () => expect(canTransitionDeliverable(cfg, d, "drafting", ctx).ok).toBe(true));
  it("approved needs the brand's claims approval", () => {
    expect(canTransitionDeliverable(cfg, d, "approved", ctx).ok).toBe(false);
    expect(canTransitionDeliverable(cfg, { ...d, claimsApprovedByBrand: true }, "approved", ctx).ok).toBe(true);
  });
  it("round 3 opens the case-by-case line", () => expect(requestChanges({ ...d, revisionRound: 2 }).opensCaseByCaseLine).toBe(true));
});

describe("brand portal visibility", () => {
  it("rejects internal fields in brand-facing payloads", () => {
    expect(() => assertNoInternal({ campaigns: [{ name: "x", deliverables: [{ status: "live" }] }] })).not.toThrow();
    expect(() => assertNoInternal({ lines: [{ rung: "pitch" }] })).toThrow();
    expect(() => assertNoInternal({ creator: { tier: "T2" } })).toThrow();
  });
});

describe("§8.1 due date suggestion", () => {
  it("skips busy days and blackout weeks", () => {
    expect(nextFreeSlot("2026-11-02", ["2026-11-02", "2026-11-03"], [])).toBe("2026-11-04");
    expect(nextFreeSlot("2026-11-02", [], [{ startsOn: "2026-11-01", endsOn: "2026-11-07" }])).toBe("2026-11-08");
  });
});
