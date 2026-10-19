import { describe, it, expect } from "vitest";
import { TODAY } from "./fixtures";
import { churn12m, renewalRate, dealTypeShare, brandRepeatRate, averageFeedback, type DealRow } from "@/lib/rules/retention-metrics";

const deal = (over: Partial<DealRow>): DealRow => ({ id: "d", brandId: "b1", type: "retainer", stage: "paid_in_full", createdOn: "2026-01-01", termEndsOn: null, creatorIds: ["c1"], ...over });

describe("§9 retention metrics", () => {
  it("12-month churn counts roster → alumni in the last year only", () => {
    const creators = [
      { stage: "roster", previousStage: "incubation", stageChangedOn: "2026-01-01" },
      { stage: "roster", previousStage: "incubation", stageChangedOn: "2026-01-01" },
      { stage: "roster", previousStage: "incubation", stageChangedOn: "2026-01-01" },
      { stage: "alumni", previousStage: "roster", stageChangedOn: "2026-06-01" },
      { stage: "alumni", previousStage: "roster", stageChangedOn: "2025-01-01" },
      { stage: "scout", previousStage: null, stageChangedOn: "2026-06-01" },
    ];
    expect(churn12m(creators, TODAY)).toBe(0.25);
    expect(churn12m([], TODAY)).toBeNull();
  });
  it("renewal rate: finished recurring deals followed by a later deal from the same brand and creator", () => {
    const deals = [
      deal({ id: "a", createdOn: "2026-01-01" }),
      deal({ id: "b", createdOn: "2026-05-01", stage: "in_production" }),
      deal({ id: "c", brandId: "b2", createdOn: "2026-02-01" }),
      deal({ id: "d", brandId: "b3", type: "one_off", createdOn: "2026-02-01" }),
      deal({ id: "e", brandId: "b4", createdOn: "2026-02-01", stage: "lead" }),
    ];
    // finished recurring: a, c (b is in production; d is one-off; e unsigned) → a renewed by b
    expect(renewalRate(deals, TODAY)).toBe(0.5);
  });
  it("a term that has ended counts as finished", () => {
    const deals = [deal({ id: "a", stage: "in_production", termEndsOn: "2026-09-01" }), deal({ id: "b", createdOn: "2026-09-02", stage: "signed" })];
    expect(renewalRate(deals, TODAY)).toBe(1);
  });
  it("deal type share over signed deals", () => {
    const deals = [deal({ type: "retainer" }), deal({ type: "annual" }), deal({ type: "one_off" }), deal({ type: "pilot" }), deal({ type: "one_off", stage: "declined" })];
    expect(dealTypeShare(deals)).toEqual({ recurring: 0.5, oneOff: 0.25, pilot: 0.25, total: 4 });
    expect(dealTypeShare([])).toBeNull();
  });
  it("brand repeat rate", () => {
    const deals = [deal({ id: "1", brandId: "x" }), deal({ id: "2", brandId: "x" }), deal({ id: "3", brandId: "y" }), deal({ id: "4", brandId: "z", stage: "lost" })];
    expect(brandRepeatRate(deals)).toBe(0.5);
  });
  it("average feedback over answered questions", () => {
    expect(
      averageFeedback([
        { q1: 5, q2: 4, q3: null, q4: 4, q5: 5 },
        { q1: 3, q2: null, q3: null, q4: null, q5: null },
      ]),
    ).toBe(4.2);
    expect(averageFeedback([])).toBeNull();
  });
});
