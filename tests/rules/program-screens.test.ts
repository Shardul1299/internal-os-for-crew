import { describe, it, expect } from "vitest";
import { cfg } from "./fixtures";
import {
  programCan,
  brandVisibleTo,
  maskedBrand,
  canMoveChallenge,
  canEnter,
  canScore,
  routeOutcome,
  canRouteOutcomes,
  canCommissionEntry,
  sundayCadence,
  canMarkAttendance,
  revisitDate,
  rankEntries,
  canAddIntern,
} from "@/lib/rules/program";
import { stageEffects } from "@/lib/rules/creators";

const opens = new Date("2026-10-19T00:00:00Z");
const closes = new Date("2026-10-21T00:00:00Z");
const ch = (status: "draft" | "open" | "judging" | "closed") => ({ status, title: "Explain it", briefMd: "Brief", opensAt: opens, closesAt: closes });

describe("program screens §7", () => {
  it("roles: interns enter and score as scribes but never route, commission or touch cost", () => {
    expect(programCan("intern", "score").ok).toBe(true);
    expect(programCan("intern", "entry").ok).toBe(true);
    expect(programCan("intern", "route").ok).toBe(false);
    expect(programCan("intern", "cost").ok).toBe(false);
    expect(programCan("intern", "commission").ok).toBe(false);
    expect(programCan("ops", "entry").ok).toBe(false);
    expect(programCan("crew_lead", "route").ok).toBe(true);
  });

  it("brand masked for students, interns and the counterpart until closed", () => {
    expect(brandVisibleTo("crew_lead", { status: "judging" })).toBe(true);
    expect(brandVisibleTo("intern", { status: "judging" })).toBe(false);
    expect(brandVisibleTo("program_counterpart", { status: "open" })).toBe(false);
    expect(brandVisibleTo("program_counterpart", { status: "closed" })).toBe(true);
    expect(maskedBrand("program_counterpart", { status: "judging" }, "Quill")).toBe("Hidden brand");
    expect(maskedBrand("owner", { status: "judging" }, "Quill")).toBe("Quill");
  });

  it("challenge moves one step at a time; judging waits for the window; closing needs scores and outcomes", () => {
    const during = new Date("2026-10-20T00:00:00Z");
    const after = new Date("2026-10-21T00:00:01Z");
    expect(canMoveChallenge(ch("draft"), "open", { now: during, entries: [] }).ok).toBe(true);
    expect(canMoveChallenge({ ...ch("draft"), briefMd: " " }, "open", { now: during, entries: [] }).ok).toBe(false);
    expect(canMoveChallenge(ch("draft"), "judging", { now: after, entries: [] }).ok).toBe(false);
    expect(canMoveChallenge(ch("open"), "judging", { now: during, entries: [] }).reasons).toContain("The 48-hour window is still open");
    expect(canMoveChallenge(ch("open"), "judging", { now: after, entries: [] }).ok).toBe(true);
    expect(canMoveChallenge(ch("judging"), "closed", { now: after, entries: [{ submitted: true, scored: false, outcome: null }] }).ok).toBe(false);
    expect(canMoveChallenge(ch("judging"), "closed", { now: after, entries: [{ submitted: true, scored: true, outcome: null }] }).reasons).toContain("Route outcomes first");
    expect(canMoveChallenge(ch("judging"), "closed", { now: after, entries: [{ submitted: true, scored: true, outcome: "tier0" }] }).ok).toBe(true);
  });

  it("entrants need opt-in consent; entries close at judging", () => {
    expect(canEnter({ consentStatus: "opted_in", challengeStatus: "open" }).ok).toBe(true);
    expect(canEnter({ consentStatus: "none", challengeStatus: "open" }).ok).toBe(false);
    expect(canEnter({ consentStatus: "opted_in", challengeStatus: "judging" }).ok).toBe(false);
  });

  it("scoring only during judging", () => {
    expect(canScore({ status: "judging" }).ok).toBe(true);
    expect(canScore({ status: "open" }).ok).toBe(false);
  });

  it("routes top N to tier0, revisit band to revisit, below to pass — never past a Filter fail", () => {
    const ranked = rankEntries([
      { id: "a", total: 14 },
      { id: "b", total: 12 },
      { id: "c", total: 11 },
      { id: "d", total: 10 },
      { id: "e", total: 8 },
    ]);
    const topN = 2;
    expect(ranked.map((e) => routeOutcome(cfg, e, topN))).toEqual(["tier0", "tier0", "revisit", "revisit", "pass"]);
    // A top-N rank with a failing Filter total does not become tier0.
    expect(routeOutcome(cfg, { rank: 1, total: 11 }, 7)).toBe("revisit");
    expect(routeOutcome(cfg, { rank: 2, total: 7 }, 7)).toBe("pass");
    expect(routeOutcome(cfg, { rank: null, total: null }, 7)).toBe(null);
  });

  it("tier0 effects: T0 and first look +18 months; revisit +1 quarter", () => {
    expect(stageEffects(cfg, "incubation", "2026-10-19")).toEqual({ tier: "T0", firstLookUntil: "2028-04-19" });
    expect(revisitDate(cfg, "2026-10-19")).toBe("2027-01-19");
  });

  it("routing needs judging and every submitted entry scored", () => {
    expect(canRouteOutcomes({ status: "judging" }, [{ submitted: true, scored: true }, { submitted: false, scored: false }]).ok).toBe(true);
    expect(canRouteOutcomes({ status: "judging" }, [{ submitted: true, scored: false }]).ok).toBe(false);
    expect(canRouteOutcomes({ status: "open" }, [{ submitted: true, scored: true }]).ok).toBe(false);
  });

  it("the brand commissions one entry from the top ten, after routing", () => {
    const all = [
      { rank: 1, outcome: "tier0" },
      { rank: 11, outcome: "pass" },
    ];
    const c = { status: "judging", brandId: "b1" };
    expect(canCommissionEntry(all[0], all, c).ok).toBe(true);
    expect(canCommissionEntry(all[1], all, c).reasons).toContain("Only the top ten can be commissioned");
    expect(canCommissionEntry(all[0], [...all, { rank: 3, outcome: "brand_commission" }], c).ok).toBe(false);
    expect(canCommissionEntry(all[0], [{ rank: 1, outcome: null }], c).reasons).toContain("Route outcomes first");
    expect(canCommissionEntry(all[0], all, { status: "judging", brandId: null }).ok).toBe(false);
  });

  it("Sunday cadence counts past shoots attended; attendance only for invited creators after the date", () => {
    const shoots = [
      { date: "2026-10-04", creators: ["c1", "c2"], attended: ["c1"] },
      { date: "2026-10-11", creators: ["c1"], attended: [] },
      { date: "2026-10-25", creators: ["c1"], attended: [] },
    ];
    expect(sundayCadence(shoots, "c1", "2026-10-19")).toEqual({ invited: 2, attended: 1 });
    expect(canMarkAttendance(shoots[0], "c2", "2026-10-19").ok).toBe(true);
    expect(canMarkAttendance(shoots[0], "c9", "2026-10-19").ok).toBe(false);
    expect(canMarkAttendance(shoots[2], "c1", "2026-10-19").ok).toBe(false);
  });
});

describe("program interns §7.7", () => {
  it("two per cohort, one per function", () => {
    expect(canAddIntern([], "research").ok).toBe(true);
    expect(canAddIntern([{ function: "research" }], "research").ok).toBe(false);
    expect(canAddIntern([{ function: "research" }], "deal_desk").ok).toBe(true);
    expect(canAddIntern([{ function: "research", id: "i1" }], "research", "i1").ok).toBe(true);
  });
});
