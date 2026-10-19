import { describe, it, expect } from "vitest";
import {
  canEditSettings,
  validateLadder,
  validateAddon,
  validateRubric,
  validateCommission,
  validateNumber,
  canAssignRole,
  canDeactivate,
  validateScope,
  validateDeliverable,
  CREATOR_EXPORT_COLUMNS,
} from "@/lib/rules/settings";

describe("settings §3.7 §10", () => {
  it("money and gate rules are Owner-only; Crew lead reads; others can't open Settings", () => {
    for (const s of ["ladder", "commission", "numbers", "nolist", "addons", "deliverables", "filter", "ai"] as const) {
      expect(canEditSettings("owner", s).ok).toBe(true);
      expect(canEditSettings("crew_lead", s).ok).toBe(false);
    }
    expect(canEditSettings("crew_lead", "templates").ok).toBe(true);
    expect(canEditSettings("crew_lead", "users").ok).toBe(true);
    expect(canEditSettings("ops", "templates").ok).toBe(false);
    expect(canEditSettings("owner", "audit").ok).toBe(false);
  });

  it("ladder: five rising rungs with Standard at 0", () => {
    expect(validateLadder({ lucrative: -30, semi: -15, standard: 0, pitch: 20, premium: 50 }).ok).toBe(true);
    expect(validateLadder({ lucrative: -30, semi: -15, standard: 5, pitch: 20, premium: 50 }).ok).toBe(false);
    expect(validateLadder({ lucrative: -10, semi: -15, standard: 0, pitch: 20, premium: 50 }).ok).toBe(false);
    expect(validateLadder({ lucrative: -30, semi: -15, standard: 0, pitch: 20 }).ok).toBe(false);
  });

  it("add-ons: lifetime stays blocked; usage within the maximum", () => {
    expect(validateAddon({ key: "lifetime", kind: "usage", pct: 100, days: null }, 365).ok).toBe(false);
    expect(validateAddon({ key: "lifetime", kind: "blocked", pct: null, days: null }, 365).ok).toBe(true);
    expect(validateAddon({ key: "usage_web_730", kind: "usage", pct: 30, days: 730 }, 365).ok).toBe(false);
    expect(validateAddon({ key: "usage_organic_90", kind: "usage", pct: 20, days: 90 }, 365).ok).toBe(true);
    expect(validateAddon({ key: "rush_7d", kind: "rush", pct: -5, days: 7 }, 365).ok).toBe(false);
  });

  it("deliverables need a key, label and positive multiple", () => {
    expect(validateDeliverable({ key: "ig_reel_dedicated", label: "Reel", multiple: 1 }).ok).toBe(true);
    expect(validateDeliverable({ key: "IG Reel", label: "Reel", multiple: 1 }).ok).toBe(false);
    expect(validateDeliverable({ key: "x", label: "", multiple: 0 }).ok).toBe(false);
  });

  it("Filter rubric thresholds stay on the 3–15 scale with the revisit band below watchlist", () => {
    expect(validateRubric({ watchlist: 12, roster: 12, challenge_top_n: 7, revisit_min: 10, revisit_max: 11 }).ok).toBe(true);
    expect(validateRubric({ watchlist: 12, roster: 16, challenge_top_n: 7, revisit_min: 10, revisit_max: 11 }).ok).toBe(false);
    expect(validateRubric({ watchlist: 12, roster: 12, challenge_top_n: 0, revisit_min: 10, revisit_max: 11 }).ok).toBe(false);
    expect(validateRubric({ watchlist: 11, roster: 12, challenge_top_n: 7, revisit_min: 10, revisit_max: 11 }).ok).toBe(false);
  });

  it("commission: shares fit inside Crew's commission", () => {
    const origins = { crew_originated: 20, creator_inbound: 15 };
    expect(validateCommission({ origins, upsellSharePct: 3, referralSharePct: 1.5, referralDealCount: 10 }).ok).toBe(true);
    expect(validateCommission({ origins, upsellSharePct: 10, referralSharePct: 6, referralDealCount: 10 }).ok).toBe(false);
    expect(validateCommission({ origins: { crew_originated: 0, creator_inbound: 15 }, upsellSharePct: 3, referralSharePct: 1.5, referralDealCount: 10 }).ok).toBe(false);
  });

  it("numbers: usage never beyond 365 days; ratios 0–1; no negatives", () => {
    expect(validateNumber("usage_max_days", 365).ok).toBe(true);
    expect(validateNumber("usage_max_days", 400).ok).toBe(false);
    expect(validateNumber("sponsored_ratio_max", 0.25).ok).toBe(true);
    expect(validateNumber("sponsored_ratio_max", 1.5).ok).toBe(false);
    expect(validateNumber("advance_pct", -1).ok).toBe(false);
    expect(validateNumber("pilot_days", 90.5).ok).toBe(false);
  });

  it("roles: only the Owner grants Owner; nobody changes their own role", () => {
    const lead = { actorRole: "crew_lead", actorId: "u2" };
    const owner = { actorRole: "owner", actorId: "u1" };
    expect(canAssignRole(lead, { id: null, currentRole: null }, "intern").ok).toBe(true);
    expect(canAssignRole(lead, { id: null, currentRole: null }, "owner").ok).toBe(false);
    expect(canAssignRole(lead, { id: "u1", currentRole: "owner" }, "intern").ok).toBe(false);
    expect(canAssignRole(owner, { id: "u1", currentRole: "owner" }, "intern").ok).toBe(false);
    expect(canAssignRole(owner, { id: "u3", currentRole: "intern" }, "owner").ok).toBe(true);
    expect(canDeactivate(owner, { id: "u1", role: "owner" }).ok).toBe(false);
    expect(canDeactivate(lead, { id: "u1", role: "owner" }).ok).toBe(false);
    expect(canDeactivate(lead, { id: "u5", role: "intern" }).ok).toBe(true);
  });

  it("portal users carry a scope", () => {
    expect(validateScope("brand_user", { brandId: null, creatorId: null, cohortIds: [] }).ok).toBe(false);
    expect(validateScope("creator_user", { brandId: null, creatorId: "c1", cohortIds: [] }).ok).toBe(true);
    expect(validateScope("program_counterpart", { brandId: null, creatorId: null, cohortIds: [] }).ok).toBe(false);
    expect(validateScope("intern", { brandId: null, creatorId: null, cohortIds: [] }).ok).toBe(true);
  });

  it("creator export never carries tier or internal fields", () => {
    const cols = CREATOR_EXPORT_COLUMNS as readonly string[];
    for (const banned of ["tier", "tier_proposed", "notes", "stage_reason", "representation_note"]) expect(cols).not.toContain(banned);
  });
});
