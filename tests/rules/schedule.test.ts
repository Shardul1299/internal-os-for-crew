import { describe, it, expect } from "vitest";
import { suggestDueDates, cadenceGapDays, sponsoredHeadroom, BLACKOUT_WARNING, AFTER_TERM_WARNING } from "@/lib/rules/schedule";
import { sponsoredRatioWith } from "@/lib/rules/deliverables";

describe("next free slot §8.1", () => {
  it("cadence gap from pieces per month", () => {
    expect(cadenceGapDays(2)).toBe(15);
    expect(cadenceGapDays(4)).toBe(7);
    expect(cadenceGapDays(null)).toBe(7);
    expect(cadenceGapDays(60)).toBe(1);
  });
  it("takes the next free day, skipping busy dates, on the cadence", () => {
    const s = suggestDueDates({ start: "2026-11-01", end: "2026-12-31", count: 2, gapDays: 7, busy: ["2026-11-01", "2026-11-02"], blackouts: [] });
    expect(s).toEqual([
      { date: "2026-11-03", warnings: [] },
      { date: "2026-11-10", warnings: [] },
    ]);
  });
  it("avoids blackout weeks when another slot exists", () => {
    const s = suggestDueDates({ start: "2026-11-01", end: "2026-12-31", count: 1, gapDays: 7, busy: [], blackouts: [{ startsOn: "2026-11-01", endsOn: "2026-11-07" }] });
    expect(s[0]).toEqual({ date: "2026-11-08", warnings: [] });
  });
  it("blackout overlap only warns when the term leaves no other day", () => {
    const s = suggestDueDates({ start: "2026-11-01", end: "2026-11-03", count: 1, gapDays: 7, busy: ["2026-11-01"], blackouts: [{ startsOn: "2026-11-02", endsOn: "2026-11-08" }] });
    expect(s[0]).toEqual({ date: "2026-11-02", warnings: [BLACKOUT_WARNING] });
  });
  it("falls back inside the term before running past it, then warns after the term", () => {
    const s = suggestDueDates({ start: "2026-11-01", end: "2026-11-05", count: 3, gapDays: 7, busy: [], blackouts: [] });
    expect(s.map((x) => x.date)).toEqual(["2026-11-01", "2026-11-02", "2026-11-03"]);
    const t = suggestDueDates({ start: "2026-11-01", end: "2026-11-02", count: 3, gapDays: 1, busy: [], blackouts: [] });
    expect(t[2]).toEqual({ date: "2026-11-03", warnings: [AFTER_TERM_WARNING] });
  });
  it("without a term end it keeps walking the cadence", () => {
    const s = suggestDueDates({ start: "2026-11-01", end: null, count: 3, gapDays: 10, busy: ["2026-11-11"], blackouts: [] });
    expect(s.map((x) => x.date)).toEqual(["2026-11-01", "2026-11-12", "2026-11-22"]);
  });
});

describe("sponsored headroom §0.1 #11", () => {
  const items = (organic: number, sponsored: number, extra: string[] = []) => [
    ...Array(organic).fill({ kind: "organic" }),
    ...Array(sponsored).fill({ kind: "sponsored" }),
    ...extra.map((kind) => ({ kind })),
  ];
  it("1 in 4: three organic leave room for one sponsored", () => {
    expect(sponsoredHeadroom(items(3, 0), 0.25)).toBe(1);
    expect(sponsoredHeadroom(items(6, 1), 0.25)).toBe(1);
    expect(sponsoredHeadroom(items(0, 0), 0.25)).toBe(0);
    expect(sponsoredHeadroom(items(2, 1), 0.25)).toBe(0);
  });
  it("blackouts and shoots don't count", () => {
    expect(sponsoredHeadroom(items(3, 0, ["blackout", "shoot", "shoot"]), 0.25)).toBe(1);
  });
  it("agrees with the deliverable gate's ratio", () => {
    for (let o = 0; o < 12; o++)
      for (let sp = 0; sp < 4; sp++) {
        const m = items(o, sp);
        const k = sponsoredHeadroom(m, 0.25);
        if (k > 0) expect(sponsoredRatioWith(items(o, sp + k - 1))).toBeLessThanOrEqual(0.25 + 1e-9);
        expect(sponsoredRatioWith(items(o, sp + k))).toBeGreaterThan(0.25);
      }
  });
});
