import { describe, it, expect } from "vitest";
import { cfg } from "./fixtures";
import { canScheduleOrGoLive, canTransitionDeliverable, requestChanges, sponsoredRatioWith } from "@/lib/rules/deliverables";

const ok = { status: "approved" as const, scheduledFor: "2026-11-10", disclosureChecked: true, claimsApprovedByBrand: true, briefTags: [], revisionRound: 0 };
const ctx = {
  dealStage: "in_production" as const,
  hasAdvanceOverride: false,
  hasPoOverride: false,
  poOrConfirmation: true,
  topicFilters: [],
  blackouts: [],
  monthItems: [{ kind: "organic" }, { kind: "organic" }, { kind: "anchor" }],
  sponsoredRatioMax: 0.25,
};

describe("§5.4 deliverable blocking", () => {
  it("passes when everything is in place", () => expect(canScheduleOrGoLive(cfg, ok, ctx).ok).toBe(true));
  it("blocks before advance_received", () => expect(canScheduleOrGoLive(cfg, ok, { ...ctx, dealStage: "signed" }).reasons).toContain("Advance not received"));
  it("blocks without PO/confirmation", () => expect(canScheduleOrGoLive(cfg, ok, { ...ctx, poOrConfirmation: false }).ok).toBe(false));
  it("blocks without disclosure", () => expect(canScheduleOrGoLive(cfg, { ...ok, disclosureChecked: false }, ctx).ok).toBe(false));
  it("blocks without claims approval", () => expect(canScheduleOrGoLive(cfg, { ...ok, claimsApprovedByBrand: false }, ctx).ok).toBe(false));
  it("blocks over 1 in 4 sponsored", () => {
    expect(sponsoredRatioWith([{ kind: "organic" }, { kind: "organic" }, { kind: "organic" }])).toBe(0.25);
    expect(canScheduleOrGoLive(cfg, ok, { ...ctx, monthItems: [{ kind: "organic" }, { kind: "sponsored" }] }).ok).toBe(false);
  });
  it("blocks on topic-filter intersection", () => {
    expect(canScheduleOrGoLive(cfg, { ...ok, briefTags: ["gambling"] }, { ...ctx, topicFilters: [{ kind: "category", value: "gambling" }] }).ok).toBe(false);
  });
  it("blackout overlap warns, never blocks", () => {
    const g = canScheduleOrGoLive(cfg, ok, { ...ctx, blackouts: [{ startsOn: "2026-11-09", endsOn: "2026-11-15" }] });
    expect(g.ok).toBe(true);
    expect(g.warnings).toContain("Inside a creator blackout week");
  });
  it("status flow and revision rounds", () => {
    expect(canTransitionDeliverable(cfg, { ...ok, status: "briefed" }, "live", ctx).ok).toBe(false);
    expect(canTransitionDeliverable(cfg, ok, "scheduled", ctx).ok).toBe(true);
    expect(requestChanges({ ...ok, revisionRound: 1 })).toEqual({ revisionRound: 2, opensCaseByCaseLine: false });
    expect(requestChanges({ ...ok, revisionRound: 2 })).toEqual({ revisionRound: 3, opensCaseByCaseLine: true });
  });
});
