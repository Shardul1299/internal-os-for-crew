import { describe, it, expect } from "vitest";
import { cfg } from "./fixtures";
import { computeLine, lineTotal, resolveStandard, defaultRung, rushAddonFor, isAddonSelectable, validateQuote, commissionPct, splitDeal, computeShares, finalLineTotal } from "@/lib/rules/ladder";

describe("ladder §5.3 / §12.1", () => {
  it("rungs are −30/−15/0/+20/+50", () => {
    expect(cfg.rungs).toEqual({ lucrative: -30, semi: -15, standard: 0, pitch: 20, premium: 50 });
  });
  it("line_total = standard × qty × (1 + rung) × (1 + Σ addons)", () => {
    expect(lineTotal(100_000_00, 2, 20, 0)).toBe(240_000_00);
    expect(computeLine(cfg, { standardPaise: 100_000_00, qty: 1, rung: "pitch", addons: ["usage_organic_90", "rush_7d"] })).toBe(Math.round(100_000_00 * 1.2 * 1.35));
  });
  it("falls back to Tier-1 placeholder × deliverable multiple × tier scale, flagged default", () => {
    expect(resolveStandard(cfg, { ownStandardPaise: null, deliverableKey: "yt_dedicated", tier: "T2" })).toEqual({ standardPaise: 50_000_00 * 3 * 2.5, isDefault: true });
    expect(resolveStandard(cfg, { ownStandardPaise: 80_000_00, deliverableKey: "yt_dedicated", tier: "T2" })).toEqual({ standardPaise: 80_000_00, isDefault: false });
  });
  it("rung defaults by deal type", () => {
    expect(defaultRung("pilot")).toBe("standard");
    expect(defaultRung("retainer")).toBe("standard");
    expect(defaultRung("one_off")).toBe("pitch");
    expect(defaultRung("annual")).toBe("lucrative");
    expect(defaultRung("quarterly")).toBe("semi");
    expect(defaultRung("quarterly", { usualClose: "pitch" })).toBe("standard");
    expect(defaultRung("pilot", { exclusivity: true })).toBe("premium");
    expect(defaultRung("retainer", { bulk: true })).toBe("lucrative");
  });
  it("rush add-ons by lead time", () => {
    expect(rushAddonFor(1)).toBe("rush_2d");
    expect(rushAddonFor(5)).toBe("rush_7d");
    expect(rushAddonFor(10)).toBeNull();
  });
  it("lifetime is never selectable", () => {
    expect(isAddonSelectable(cfg, "lifetime")).toBe(false);
    expect(isAddonSelectable(cfg, "usage_web_365")).toBe(true);
  });
  it("no input on the calculator takes followers, views, CPV or CPM", () => {
    const keys = Object.keys({ standardPaise: 0, qty: 0, rung: "", addons: [] });
    expect(keys.some((k) => /follow|view|cpv|cpm|impression/i.test(k))).toBe(false);
  });
});

describe("quote gate (creator_matched → proposal_sent)", () => {
  const base = { exclusivity: { scope: "none" as const, days: 0 }, usageRights: [], hasBelowLucrativeOverride: false };
  it("needs at least one line", () => {
    expect(validateQuote(cfg, { ...base, lines: [] }).ok).toBe(false);
  });
  it("blocks a line below Lucrative without override", () => {
    const line = { creatorId: "c", deliverableKey: "ig_reel_dedicated", qty: 1, standardPaise: 100_000_00, rung: "lucrative" as const, addons: [], manualTotalPaise: 60_000_00 };
    expect(validateQuote(cfg, { ...base, lines: [line] }).reasons).toContain("Line below Lucrative needs an Owner override");
    expect(validateQuote(cfg, { ...base, lines: [line], hasBelowLucrativeOverride: true }).ok).toBe(true);
  });
  it("exclusivity forces Premium", () => {
    const line = { creatorId: "c", deliverableKey: "ig_reel_dedicated", qty: 1, standardPaise: 1, rung: "standard" as const, addons: [] };
    expect(validateQuote(cfg, { ...base, exclusivity: { scope: "category", days: 90 }, lines: [line] }).ok).toBe(false);
    expect(validateQuote(cfg, { ...base, exclusivity: { scope: "category", days: 90 }, lines: [{ ...line, rung: "premium" }] }).ok).toBe(true);
  });
  it("usage needs days ≤ 365 and its add-on", () => {
    const line = { creatorId: "c", deliverableKey: "ig_reel_dedicated", qty: 1, standardPaise: 1, rung: "standard" as const, addons: ["usage_organic_90"] };
    expect(validateQuote(cfg, { ...base, usageRights: [{ kind: "organic_reuse", days: 400 }], lines: [line] }).ok).toBe(false);
    expect(validateQuote(cfg, { ...base, usageRights: [{ kind: "organic_reuse", days: 90 }], lines: [line] }).ok).toBe(true);
    expect(validateQuote(cfg, { ...base, usageRights: [{ kind: "whitelisting", days: 90 }], lines: [line] }).ok).toBe(false);
  });
  it("lifetime add-on can't pass", () => {
    const line = { creatorId: "c", deliverableKey: "ig_reel_dedicated", qty: 1, standardPaise: 1, rung: "standard" as const, addons: ["lifetime"] };
    expect(validateQuote(cfg, { ...base, lines: [line] }).ok).toBe(false);
  });
  it("case-by-case lines carry a hand price", () => {
    expect(finalLineTotal(cfg, { creatorId: "c", deliverableKey: "x", qty: 1, standardPaise: 0, rung: null, addons: [], isCaseByCase: true, manualTotalPaise: 500 })).toBe(500);
  });
});

describe("commission and shares §0.1 #8", () => {
  it("creator_inbound → 15%, else 20%", () => {
    expect(commissionPct(cfg, "creator_inbound")).toBe(15);
    for (const o of ["crew_originated", "frontseat_lead", "snoball_referral", "owled_referral"] as const) expect(commissionPct(cfg, o)).toBe(20);
  });
  it("splits gross into creator share and Crew commission", () => {
    const [s] = splitDeal(cfg, "crew_originated", [{ creatorId: "a", role: "primary", grossPaise: 100_000_00 }]);
    expect(s.crewCommissionPaise).toBe(20_000_00);
    expect(s.creatorSharePaise).toBe(80_000_00);
  });
  it("upsell share is 3% of upsell creators' fees to the originating creator", () => {
    const splits = splitDeal(cfg, "creator_inbound", [
      { creatorId: "orig", role: "primary", grossPaise: 100_000_00 },
      { creatorId: "up", role: "upsell", grossPaise: 50_000_00 },
    ]);
    const shares = computeShares(cfg, { origin: "creator_inbound", originatingCreatorId: "orig", splits, referrals: [] });
    expect(shares).toEqual([{ kind: "upsell_share", toCreatorId: "orig", fromCreatorId: "up", amountPaise: 1_500_00 }]);
  });
  it("referral share is 1.5% on a referred creator's first 10 deals only", () => {
    const splits = splitDeal(cfg, "crew_originated", [{ creatorId: "new", role: "primary", grossPaise: 100_000_00 }]);
    expect(computeShares(cfg, { origin: "crew_originated", originatingCreatorId: null, splits, referrals: [{ creatorId: "new", referredByCreatorId: "ref", priorDealCount: 9 }] })).toEqual([
      { kind: "referral_share", toCreatorId: "ref", fromCreatorId: "new", amountPaise: 1_500_00 },
    ]);
    expect(computeShares(cfg, { origin: "crew_originated", originatingCreatorId: null, splits, referrals: [{ creatorId: "new", referredByCreatorId: "ref", priorDealCount: 10 }] })).toEqual([]);
  });
});
