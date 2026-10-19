import { describe, it, expect } from "vitest";
import { cfg, TODAY } from "./fixtures";
import { slaDueAt, isPastSla, conversionDefaults, canConvert } from "@/lib/rules/inbox";
import { closesAt, canSubmit, brandVisible, rankEntries, outcomeFor, brandShortlist } from "@/lib/rules/program";
import { rosterCheckins, nextCheckin } from "@/lib/rules/retention";
import { assertNoInternal, creatorForPortal, creatorFeeView, can } from "@/lib/rules/visibility";
import { ratioMeters, outlierMultiple, isOutlier, doubleDownCandidates, canSubmitSponsoredDraft, calendarAdherence, studioAccess, conceptDefaults, creatorCanEditCalendarField } from "@/lib/rules/studio";

describe("inbox §6", () => {
  it("SLA 24h and past-SLA threads", () => {
    const at = new Date("2026-10-19T10:00:00Z");
    expect(slaDueAt(cfg, at).toISOString()).toBe("2026-10-20T10:00:00.000Z");
    expect(isPastSla({ slaDueAt: slaDueAt(cfg, at), status: "new" }, new Date("2026-10-20T11:00:00Z"))).toBe(true);
    expect(isPastSla({ slaDueAt: slaDueAt(cfg, at), status: "replied" }, new Date("2026-10-20T11:00:00Z"))).toBe(false);
  });
  it("convert → creator_inbound lead with originating creator", () => {
    expect(conversionDefaults({ creatorId: "c" })).toEqual({ origin: "creator_inbound", originatingCreatorId: "c" });
    expect(canConvert({ brandId: null, status: "new", noListPrescreen: null }).ok).toBe(false);
  });
});

describe("program §7", () => {
  it("48-hour window, late not accepted, consent required", () => {
    const opens = new Date("2026-10-19T00:00:00Z");
    const ch = { status: "open", opensAt: opens, closesAt: closesAt(opens) };
    expect(closesAt(opens).toISOString()).toBe("2026-10-21T00:00:00.000Z");
    expect(canSubmit({ consentStatus: "opted_in" }, ch, new Date("2026-10-20T00:00:00Z"), "note").ok).toBe(true);
    expect(canSubmit({ consentStatus: "opted_in" }, ch, new Date("2026-10-21T00:00:01Z"), "note").ok).toBe(false);
    expect(canSubmit({ consentStatus: "none" }, ch, new Date("2026-10-20T00:00:00Z"), "note").ok).toBe(false);
  });
  it("brand hidden until judging closes", () => {
    expect(brandVisible({ status: "judging" })).toBe(false);
    expect(brandVisible({ status: "closed" })).toBe(true);
  });
  it("ranks by Filter total and routes outcomes", () => {
    const ranked = rankEntries([{ id: "a", total: 14 }, { id: "b", total: 11 }, { id: "c", total: 8 }, { id: "d", total: null }]);
    expect(ranked.map((e) => e.rank)).toEqual([1, 2, 3, null]);
    expect(outcomeFor(cfg, ranked[0], 1)).toBe("tier0");
    expect(outcomeFor(cfg, ranked[1], 1)).toBe("revisit");
    expect(outcomeFor(cfg, ranked[2], 1)).toBe("pass");
    expect(brandShortlist(ranked).length).toBe(3);
  });
});

describe("retention §9", () => {
  it("roster entry schedules four quarterly check-ins, a strategy refresh and the pilot-end review", () => {
    const plan = rosterCheckins(cfg, TODAY, "2027-01-17");
    expect(plan.filter((p) => p.type === "quarterly").length).toBe(4);
    expect(plan).toContainEqual({ type: "strategy_refresh", dueOn: "2027-04-19" });
    expect(plan).toContainEqual({ type: "pilot_end", dueOn: "2027-01-17" });
    expect(nextCheckin(cfg, TODAY)).toEqual({ type: "quarterly", dueOn: "2027-01-17" });
  });
});

describe("visibility wall §0.1 #16", () => {
  it("strips tier and internal notes for portals", () => {
    const c = creatorForPortal({ displayName: "A", tier: "T2", notes: "x" });
    expect(c).toEqual({ displayName: "A" });
    expect(() => assertNoInternal({ deal: { lines: [{ rung: "pitch" }] } })).toThrow();
    expect(() => assertNoInternal(c)).not.toThrow();
  });
  it("a creator sees only their own fee", () => {
    expect(creatorFeeView([{ creatorId: "a", lineTotalPaise: 100 }, { creatorId: "b", lineTotalPaise: 900 }], "a", 20)).toEqual({ feePaise: 80 });
  });
  it("interns have no money fields; only the Owner approves", () => {
    expect(can("intern", "money")).toBe(false);
    expect(can("crew_lead", "approve")).toBe(false);
    expect(can("owner", "approve")).toBe(true);
  });
});

describe("studio §19", () => {
  it("outlier multiple and the 5× rule", () => {
    expect(outlierMultiple(50_000, 10_000)).toBe(5);
    expect(isOutlier(cfg, 49_000, 10_000)).toBe(false);
    expect(isOutlier(cfg, 50_000, 10_000)).toBe(true);
  });
  it("concept defaults 90/0/10 new, 70/20/10 established", () => {
    expect(conceptDefaults("new")).toEqual({ proven: 90, double_down: 0, experimental: 10 });
    expect(conceptDefaults("established")).toEqual({ proven: 70, double_down: 20, experimental: 10 });
  });
  it("ratio meters warn past 10 points and compute sponsored headroom", () => {
    const items = [
      ...Array.from({ length: 6 }, () => ({ date: TODAY, kind: "organic", pillar: "authority", conceptBucket: "proven", studioStatus: "idea" })),
      { date: TODAY, kind: "sponsored", pillar: "authority", conceptBucket: "proven", studioStatus: "idea" },
    ];
    const m = ratioMeters(cfg, items, { pillarRatio: { authority: 70, journey: 30 }, conceptRatio: { proven: 90, double_down: 0, experimental: 10 } }, 0.25);
    expect(m.pillar[0]).toMatchObject({ actual: 100, off: true });
    expect(m.sponsored.headroom).toBe(1);
  });
  it("double-down candidates beat the average or hit 5×", () => {
    const s = doubleDownCandidates(cfg, [{ id: "a", views: 100, followersAtPost: 1000 }, { id: "b", views: 900, followersAtPost: 1000 }, { id: "c", views: 50, followersAtPost: 5 }]);
    expect([...s].sort()).toEqual(["b", "c"]);
  });
  it("sponsored drafts: topic filter and disclosure are hard checks", () => {
    const base = { text: "Try the new tool", green: "Paid partnership label, #ad", topicFilters: [], disclosureStandard: "asci" as const, deliverableStatus: "drafting" };
    expect(canSubmitSponsoredDraft(base).ok).toBe(true);
    expect(canSubmitSponsoredDraft({ ...base, green: "Cut to b-roll" }).ok).toBe(false);
    expect(canSubmitSponsoredDraft({ ...base, text: "Better than Acme Labs", topicFilters: [{ kind: "competitor", value: "Acme Labs" }] }).ok).toBe(false);
  });
  it("calendar adherence and access", () => {
    expect(calendarAdherence([{ date: "2026-10-10", kind: "organic", pillar: null, conceptBucket: null, studioStatus: "posted" }, { date: "2026-10-12", kind: "organic", pillar: null, conceptBucket: null, studioStatus: "idea" }], TODAY)).toBe(0.5);
    expect(studioAccess("scout", "opted_in").content).toBe(false);
    expect(studioAccess("incubation", "opted_in")).toEqual({ content: true, deals: "write" });
    expect(studioAccess("alumni", "opted_in")).toEqual({ content: true, deals: "read" });
    expect(studioAccess("roster", "withdrawn").content).toBe(false);
  });
  it("sponsored item dates are Crew-only", () => {
    expect(creatorCanEditCalendarField("sponsored", "date")).toBe(false);
    expect(creatorCanEditCalendarField("sponsored", "liveUrl")).toBe(true);
    expect(creatorCanEditCalendarField("organic", "date")).toBe(true);
  });
});

import { draftLocked } from "@/lib/rules/studio";
describe("sponsored draft lock §19.6.7", () => {
  it("freezes a draft under review or approved; a change request unlocks it", () => {
    expect(draftLocked(["in_review"]).ok).toBe(false);
    expect(draftLocked(["approved"]).ok).toBe(false);
    expect(draftLocked(["drafting"]).ok).toBe(true);
    expect(draftLocked([]).ok).toBe(true);
  });
});
