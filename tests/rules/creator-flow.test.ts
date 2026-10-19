import { describe, it, expect } from "vitest";
import { cfg, creator, TODAY } from "./fixtures";
import {
  canProposeRoster,
  canRejectRoster,
  stageMoves,
  alumniEffects,
  filterContextFor,
  canEditCreator,
  canCreateCreator,
  canScoreFilter,
  canEditSignals,
  canSetStandards,
  canEditContentPlan,
  canEditBlackouts,
  canProposeCalendarItem,
  canRunCheckins,
  canEditAgreement,
  canInviteToStudio,
  agreementDisplayStatus,
  validateAnchorPlan,
  needsNextQuarterly,
  validateBlackout,
  canStartPartnershipNow,
} from "@/lib/rules/creator-flow";
import { canStartPartnership, latestFilter, canTransition } from "@/lib/rules/creators";

const lead = { role: "crew_lead" as const, today: TODAY };

describe("roster as two steps: Crew lead proposes, Owner approves (§4)", () => {
  const inc = creator({ stage: "incubation" });
  it("Crew lead proposes when the roster gate is met", () => {
    expect(canProposeRoster(cfg, inc, { ...lead, alreadyProposed: false }).ok).toBe(true);
  });
  it("proposal is blocked by each missing gate item", () => {
    const g = canProposeRoster(cfg, { ...inc, representedElsewhere: true, tierSignalCount: 1 }, { ...lead, alreadyProposed: false });
    expect(g.reasons).toContain("Represented elsewhere (must be exclusive)");
    expect(g.reasons).toContain("1 of 2 tier signals");
  });
  it("a stale Filter blocks the proposal", () => {
    const stale = { ...inc, filterScores: [{ aesthetics: 5, taste: 5, personality: 5, total: 15, sentence: "s", scoredAt: "2026-01-01", context: "scout" }] };
    expect(canProposeRoster(cfg, stale, { ...lead, alreadyProposed: false }).ok).toBe(false);
  });
  it("interns and duplicates can't propose", () => {
    expect(canProposeRoster(cfg, inc, { role: "intern", today: TODAY, alreadyProposed: false }).ok).toBe(false);
    expect(canProposeRoster(cfg, inc, { ...lead, alreadyProposed: true }).reasons).toContain("Already proposed; awaiting the Owner");
  });
  it("only scout-less stages may be proposed", () => {
    expect(canProposeRoster(cfg, creator({ stage: "scout" }), { ...lead, alreadyProposed: false }).ok).toBe(false);
  });
  it("only the Owner rejects a proposal", () => {
    expect(canRejectRoster({ role: "owner", proposed: true }).ok).toBe(true);
    expect(canRejectRoster({ role: "crew_lead", proposed: true }).ok).toBe(false);
    expect(canRejectRoster({ role: "owner", proposed: false }).ok).toBe(false);
  });
});

describe("stage menu lists every §4 move with its blocked reason", () => {
  const keys = (m: ReturnType<typeof stageMoves>) => m.map((x) => x.key);
  it("scout: watchlist, revisit, declined", () => {
    const m = stageMoves(cfg, creator(), { ...lead, rosterProposed: false });
    expect(keys(m)).toEqual(["watchlist", "revisit", "declined"]);
    expect(m.every((x) => x.reasons.length === 0)).toBe(true);
  });
  it("scout without a Filter score shows the reason", () => {
    const m = stageMoves(cfg, creator({ filterScores: [] }), { ...lead, rosterProposed: false });
    expect(m.find((x) => x.key === "watchlist")!.reasons).toContain("No Filter score");
  });
  it("declined collects a reason in a sheet", () => {
    const m = stageMoves(cfg, creator(), { ...lead, rosterProposed: false });
    expect(m.find((x) => x.key === "declined")!.needsReason).toBe(true);
  });
  it("incubation: propose to roster until proposed, then approve / reject", () => {
    const inc = creator({ stage: "incubation" });
    expect(keys(stageMoves(cfg, inc, { ...lead, rosterProposed: false }))).toContain("propose_roster");
    const after = stageMoves(cfg, inc, { ...lead, rosterProposed: true });
    expect(keys(after)).toEqual(expect.arrayContaining(["approve_roster", "reject_roster"]));
    expect(after.find((x) => x.key === "approve_roster")!.reasons).toContain("Only the Owner approves roster promotions");
    const owner = stageMoves(cfg, inc, { role: "owner", today: TODAY, rosterProposed: true });
    expect(owner.find((x) => x.key === "approve_roster")!.reasons).toEqual([]);
    expect(owner.find((x) => x.key === "approve_roster")!.irreversible).toBe(true);
  });
  it("Owner approval still can't pass a Filter fail", () => {
    const low = creator({ stage: "incubation", filterScores: [{ aesthetics: 3, taste: 3, personality: 3, total: 9, sentence: "s", scoredAt: "2026-10-10", context: "incubation_review" }] });
    const owner = stageMoves(cfg, low, { role: "owner", today: TODAY, rosterProposed: true });
    expect(owner.find((x) => x.key === "approve_roster")!.reasons.length).toBeGreaterThan(0);
  });
  it("roster: alumni blocked by open deals and payouts; revisit and declined blocked", () => {
    const r = creator({ stage: "roster", openDealCount: 2, unsettledPayoutCount: 1 });
    const m = stageMoves(cfg, r, { ...lead, rosterProposed: false });
    expect(m.find((x) => x.key === "alumni")!.reasons).toEqual(["2 open deals to close or reassign", "1 payouts unsettled"]);
    expect(m.find((x) => x.key === "revisit")!.reasons).toContain("Roster creators move to Alumni, not Revisit");
    expect(m.find((x) => x.key === "declined")!.reasons).toContain("Roster creators move to Alumni, not Declined");
  });
  it("alumni return to roster needs the Owner", () => {
    const a = creator({ stage: "alumni" });
    expect(stageMoves(cfg, a, { ...lead, rosterProposed: false }).find((x) => x.key === "return_roster")!.reasons).toContain("Needs Owner approval");
    expect(stageMoves(cfg, a, { role: "owner", today: TODAY, rosterProposed: false }).find((x) => x.key === "return_roster")!.reasons).toEqual([]);
  });
  it("interns see moves blocked", () => {
    const m = stageMoves(cfg, creator(), { role: "intern", today: TODAY, rosterProposed: false });
    expect(m.every((x) => x.reasons.length > 0)).toBe(true);
  });
});

describe("side effects and defaults", () => {
  it("alumni exits the agreement and ends exclusivity", () => {
    expect(alumniEffects()).toEqual({ agreement: { status: "exited", exclusive: false } });
  });
  it("filter context follows the stage", () => {
    expect(filterContextFor("scout")).toBe("scout");
    expect(filterContextFor("watchlist")).toBe("watchlist_review");
    expect(filterContextFor("incubation")).toBe("incubation_review");
    expect(filterContextFor("roster")).toBe("roster_review");
  });
  it("exit window opens on its date", () => {
    expect(agreementDisplayStatus({ status: "active", exitWindowAt: "2026-10-01" }, TODAY)).toBe("exit_window_open");
    expect(agreementDisplayStatus({ status: "active", exitWindowAt: "2027-10-01" }, TODAY)).toBe("active");
    expect(agreementDisplayStatus({ status: "pilot", exitWindowAt: null }, TODAY)).toBe("pilot");
  });
});

describe("who edits what (§1)", () => {
  it("interns create Scouts and edit Scout / Watchlist only", () => {
    expect(canCreateCreator("intern").ok).toBe(true);
    expect(canCreateCreator("ops").ok).toBe(false);
    expect(canEditCreator("intern", "scout").ok).toBe(true);
    expect(canEditCreator("intern", "roster").ok).toBe(false);
    expect(canEditCreator("crew_lead", "roster").ok).toBe(true);
    expect(canEditCreator("strategist", "scout").ok).toBe(false);
  });
  it("interns score the Filter as scribes; viewers don't", () => {
    expect(canScoreFilter("intern").ok).toBe(true);
    expect(canScoreFilter("sales_viewer").ok).toBe(false);
  });
  it("signals and Standards are Crew lead work", () => {
    expect(canEditSignals("intern").ok).toBe(false);
    expect(canSetStandards("intern").ok).toBe(false);
    expect(canSetStandards("ops").ok).toBe(false);
    expect(canSetStandards("crew_lead").ok).toBe(true);
  });
  it("Strategist edits the content plan and proposes calendar items", () => {
    expect(canEditContentPlan("strategist").ok).toBe(true);
    expect(canEditContentPlan("ops").ok).toBe(false);
    expect(canEditBlackouts("ops").ok).toBe(true);
    expect(canProposeCalendarItem("strategist", "anchor").ok).toBe(true);
    expect(canProposeCalendarItem("ops", "anchor").ok).toBe(false);
    expect(canProposeCalendarItem("crew_lead", "sponsored").ok).toBe(false);
  });
  it("check-ins and agreements are Crew lead work", () => {
    expect(canRunCheckins("strategist").ok).toBe(false);
    expect(canRunCheckins("crew_lead").ok).toBe(true);
    expect(canEditAgreement("owner").ok).toBe(true);
    expect(canEditAgreement("ops").ok).toBe(false);
  });
});

describe("Studio invitation (§4 Studio access)", () => {
  const base = { role: "crew_lead", stage: "incubation" as const, consentStatus: "opted_in", email: "a@b.c", hasActiveUser: false };
  it("opens at incubation and roster with consent and an email", () => {
    expect(canInviteToStudio(base).ok).toBe(true);
    expect(canInviteToStudio({ ...base, stage: "roster" }).ok).toBe(true);
  });
  it("blocks earlier stages, missing consent, missing email, duplicates", () => {
    expect(canInviteToStudio({ ...base, stage: "watchlist" }).reasons).toContain("Studio opens at Incubation");
    expect(canInviteToStudio({ ...base, consentStatus: "withdrawn" }).reasons).toContain("Consent not opted in");
    expect(canInviteToStudio({ ...base, email: " " }).reasons).toContain("Add an email first");
    expect(canInviteToStudio({ ...base, hasActiveUser: true }).reasons).toContain("Already invited");
    expect(canInviteToStudio({ ...base, role: "intern" }).ok).toBe(false);
  });
});

describe("content plan gates", () => {
  it("anchor plan sponsored ratio can't exceed the setting", () => {
    expect(validateAnchorPlan(cfg, { anchorFormat: "Whiteboard", sponsoredRatioMax: 0.25 }).ok).toBe(true);
    expect(validateAnchorPlan(cfg, { anchorFormat: "Whiteboard", sponsoredRatioMax: 0.2 }).ok).toBe(true);
    expect(validateAnchorPlan(cfg, { anchorFormat: "Whiteboard", sponsoredRatioMax: 0.3 }).reasons).toContain("Sponsored ratio can't exceed 25%");
    expect(validateAnchorPlan(cfg, { anchorFormat: " ", sponsoredRatioMax: 0.2 }).reasons).toContain("Anchor format is required");
  });
  it("blackout end can't precede start", () => {
    expect(validateBlackout({ startsOn: "2026-11-01", endsOn: "2026-11-07" }).ok).toBe(true);
    expect(validateBlackout({ startsOn: "2026-11-07", endsOn: "2026-11-01" }).ok).toBe(false);
  });
});

describe("§9 each completed quarterly schedules the next", () => {
  it("schedules when no later quarterly is pending", () => {
    expect(needsNextQuarterly("quarterly", [], TODAY)).toBe(true);
    expect(needsNextQuarterly("quarterly", ["2026-12-01"], TODAY)).toBe(false);
    expect(needsNextQuarterly("quarterly", ["2026-09-01"], TODAY)).toBe(true);
  });
  it("other check-in types don't", () => {
    expect(needsNextQuarterly("adhoc", [], TODAY)).toBe(false);
    expect(needsNextQuarterly("pilot_end", [], TODAY)).toBe(false);
  });
});

describe("roster pilot → partnership happens at pilot end (§4)", () => {
  const r = creator({
    stage: "roster",
    agreementStatus: "pilot",
    filterScores: [{ aesthetics: 5, taste: 4, personality: 4, total: 13, sentence: "s", scoredAt: "2026-10-10", context: "roster_review" }],
  });
  const owner = { role: "owner" as const, today: TODAY };
  it("passes for the Owner after the pilot ends with a fresh Filter", () => {
    expect(canStartPartnershipNow(canStartPartnership(cfg, r, owner), "2026-10-19", TODAY).ok).toBe(true);
  });
  it("blocks mid-pilot", () => {
    expect(canStartPartnershipNow(canStartPartnership(cfg, r, owner), "2026-11-18", TODAY).reasons).toContain("Pilot ends 2026-11-18");
  });
  it("keeps the base gate's reasons", () => {
    expect(canStartPartnershipNow(canStartPartnership(cfg, r, { role: "crew_lead", today: TODAY }), "2026-10-01", TODAY).reasons).toContain("Needs Owner approval");
  });
});

describe("same-day re-score (latestFilter)", () => {
  const fail = { aesthetics: 4, taste: 4, personality: 3, total: 11, sentence: "s", scoredAt: TODAY, context: "scout" };
  const pass = { aesthetics: 5, taste: 4, personality: 4, total: 13, sentence: "s", scoredAt: TODAY, context: "scout" };
  it("the newest of two same-day scores counts (scores arrive newest-first)", () => {
    expect(latestFilter([pass, fail])!.total).toBe(13);
    expect(latestFilter([fail, pass])!.total).toBe(11);
    expect(canTransition(cfg, creator({ filterScores: [pass, fail] }), "watchlist", { role: "crew_lead", today: TODAY }).ok).toBe(true);
  });
});
