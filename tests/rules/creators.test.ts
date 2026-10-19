import { describe, it, expect } from "vitest";
import { cfg, creator, TODAY } from "./fixtures";
import { canTransition, rosterGate, rosterVerdict, stageEffects, canStartPartnership, partnershipDates, validateFilterScore, dealEligibility, canApproveTier, canProposeTier } from "@/lib/rules/creators";

const lead = { role: "crew_lead" as const, today: TODAY };

describe("Filter score", () => {
  it("three 1–5 scores and a required sentence ≤ 200 chars", () => {
    expect(validateFilterScore({ aesthetics: 5, taste: 5, personality: 5, sentence: "Yes." }).ok).toBe(true);
    expect(validateFilterScore({ aesthetics: 6, taste: 5, personality: 5, sentence: "Yes." }).ok).toBe(false);
    expect(validateFilterScore({ aesthetics: 5, taste: 5, personality: 5, sentence: " " }).ok).toBe(false);
    expect(validateFilterScore({ aesthetics: 5, taste: 5, personality: 5, sentence: "x".repeat(201) }).ok).toBe(false);
  });
});

describe("§4 scout → watchlist", () => {
  it("passes with Filter ≥ 12 and consent", () => {
    expect(canTransition(cfg, creator(), "watchlist", lead).ok).toBe(true);
  });
  it("blocks without a Filter score", () => {
    expect(canTransition(cfg, creator({ filterScores: [] }), "watchlist", lead).reasons).toContain("No Filter score");
  });
  it("blocks below 12/15", () => {
    const c = creator({ filterScores: [{ aesthetics: 4, taste: 4, personality: 3, total: 11, sentence: "s", scoredAt: "2026-10-01", context: "scout" }] });
    expect(canTransition(cfg, c, "watchlist", lead).ok).toBe(false);
  });
  it("blocks without consent", () => {
    expect(canTransition(cfg, creator({ consentStatus: "none" }), "watchlist", lead).reasons).toContain("Consent not opted in");
  });
  it("program entries need top-N or an Owner note", () => {
    const c = creator({ source: "program", programEntry: { rank: 9, topN: 7 } });
    expect(canTransition(cfg, c, "watchlist", lead).ok).toBe(false);
    expect(canTransition(cfg, { ...c, ownerNote: "Strong voice" }, "watchlist", lead).ok).toBe(true);
    expect(canTransition(cfg, { ...c, programEntry: { rank: 3, topN: 7 } }, "watchlist", lead).ok).toBe(true);
  });
  it("interns can't move creators", () => {
    expect(canTransition(cfg, creator(), "watchlist", { role: "intern", today: TODAY }).ok).toBe(false);
  });
});

describe("§4 watchlist → incubation", () => {
  const w = creator({ stage: "watchlist" });
  it("passes with anchor plan, 3 topic filters, representation noted", () => {
    expect(canTransition(cfg, w, "incubation", lead).ok).toBe(true);
  });
  it("blocks on each missing item", () => {
    expect(canTransition(cfg, { ...w, hasAnchorPlan: false }, "incubation", lead).reasons).toContain("Anchor plan not set");
    expect(canTransition(cfg, { ...w, topicFilterCount: 2 }, "incubation", lead).reasons).toContain("2 of 3 topic filters");
    expect(canTransition(cfg, { ...w, representedElsewhere: null }, "incubation", lead).reasons).toContain("Representation not noted");
  });
  it("sets T0 and first look +18 months", () => {
    expect(stageEffects(cfg, "incubation", TODAY)).toEqual({ tier: "T0", firstLookUntil: "2028-04-19" });
  });
});

describe("§4 → roster", () => {
  const inc = creator({ stage: "incubation" });
  const owner = { role: "owner" as const, today: TODAY, ownerApproval: true };
  it("needs Owner approval", () => {
    expect(canTransition(cfg, inc, "roster", lead).reasons).toContain("Needs Owner approval");
    expect(canTransition(cfg, inc, "roster", owner).ok).toBe(true);
  });
  it("needs a Filter re-score ≥ 12 in the last 90 days", () => {
    const stale = { ...inc, filterScores: [{ ...inc.filterScores[0], scoredAt: "2026-05-01" }] };
    expect(canTransition(cfg, stale, "roster", owner).ok).toBe(false);
  });
  it("needs ≥ 2 tier signals", () => {
    expect(canTransition(cfg, { ...inc, tierSignalCount: 1 }, "roster", owner).ok).toBe(false);
  });
  it("needs represented_elsewhere = false", () => {
    expect(canTransition(cfg, { ...inc, representedElsewhere: true }, "roster", owner).ok).toBe(false);
    expect(canTransition(cfg, { ...inc, representedElsewhere: null }, "roster", owner).ok).toBe(false);
  });
  it("employed creators need a disclosure; founders ≤ 70% own-product", () => {
    expect(canTransition(cfg, { ...inc, isEmployedElsewhere: true }, "roster", owner).ok).toBe(false);
    expect(canTransition(cfg, { ...inc, isEmployedElsewhere: true, employerDisclosureUrl: "https://x" }, "roster", owner).ok).toBe(true);
    expect(canTransition(cfg, { ...inc, isFounder: true, ownProductContentPct: 80 }, "roster", owner).ok).toBe(false);
    expect(canTransition(cfg, { ...inc, isFounder: true, ownProductContentPct: 70 }, "roster", owner).ok).toBe(true);
  });
  it("verdict line reads 'Roster gate: 3 of 4 met · missing: …'", () => {
    const g = rosterGate(cfg, { ...inc, isEmployedElsewhere: true, filterScores: [] }, TODAY);
    expect(rosterVerdict(g)).toBe("Roster gate: 2 of 4 met · missing: Filter re-score, Employer disclosure");
  });
  it("creates a 90-day pilot agreement", () => {
    expect(stageEffects(cfg, "roster", TODAY)).toEqual({ agreement: { status: "pilot", pilotStartedOn: TODAY, pilotEndsOn: "2027-01-17", exclusive: true } });
  });
});

describe("§4 pilot → partnership, revisit, alumni", () => {
  it("partnership needs Owner + recent Filter re-score", () => {
    const r = creator({ stage: "roster", agreementStatus: "pilot" });
    expect(canStartPartnership(cfg, r, { role: "owner", today: TODAY }).ok).toBe(true);
    expect(canStartPartnership(cfg, r, { role: "crew_lead", today: TODAY }).ok).toBe(false);
    expect(partnershipDates(cfg, "2027-01-17")).toEqual({ partnershipStartedOn: "2027-01-17", partnershipEndsOn: "2029-01-17", exitWindowAt: "2028-01-17" });
  });
  it("revisit sets +6 months", () => {
    expect(stageEffects(cfg, "revisit", TODAY)).toEqual({ revisitOn: "2027-04-19" });
  });
  it("roster → alumni needs a reason, no open deals, payouts settled", () => {
    const r = creator({ stage: "roster" });
    expect(canTransition(cfg, r, "alumni", { ...lead, reason: "" }).ok).toBe(false);
    expect(canTransition(cfg, { ...r, openDealCount: 1 }, "alumni", { ...lead, reason: "Moving on" }).ok).toBe(false);
    expect(canTransition(cfg, { ...r, unsettledPayoutCount: 2 }, "alumni", { ...lead, reason: "Moving on" }).ok).toBe(false);
    expect(canTransition(cfg, r, "alumni", { ...lead, reason: "Moving on" }).ok).toBe(true);
  });
  it("alumni → roster needs the Owner", () => {
    const a = creator({ stage: "alumni" });
    expect(canTransition(cfg, a, "return_roster", lead).ok).toBe(false);
    expect(canTransition(cfg, a, "return_roster", { role: "owner", today: TODAY }).ok).toBe(true);
  });
});

describe("tier and deal eligibility", () => {
  it("Crew lead proposes, Owner approves", () => {
    expect(canProposeTier({ role: "crew_lead" }, 2, "T2").ok).toBe(true);
    expect(canProposeTier({ role: "intern" }, 2, "T2").ok).toBe(false);
    expect(canApproveTier({ role: "crew_lead" }, { tier: "T2", signalCount: 2 }).ok).toBe(false);
    expect(canApproveTier({ role: "owner" }, { tier: "T2", signalCount: 2 }).ok).toBe(true);
  });
  it("a Filter fail blocks deals even on the roster", () => {
    const c = creator({ stage: "roster", filterScores: [{ aesthetics: 3, taste: 3, personality: 3, total: 9, sentence: "s", scoredAt: TODAY, context: "quarterly" }] });
    expect(dealEligibility(cfg, c, true).ok).toBe(false);
  });
  it("Tier 0 only with a tier0_in_deal override", () => {
    const c = creator({ stage: "incubation" });
    expect(dealEligibility(cfg, c, false).ok).toBe(false);
    expect(dealEligibility(cfg, c, true).ok).toBe(true);
  });
});
