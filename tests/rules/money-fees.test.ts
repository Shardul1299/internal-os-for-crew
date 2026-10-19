import { describe, it, expect } from "vitest";
import { creatorFees, canIssueAdvance, canIssueBalance, canRecordPayment, canMarkPayoutPaid, referralFacts, advancePayouts } from "@/lib/rules/money";
import { cfg } from "./fixtures";

describe("creator fees from quote lines", () => {
  it("sums each creator's lines and keeps roles", () => {
    const f = creatorFees(
      [
        { creatorId: "a", totalPaise: 60_000_00 },
        { creatorId: "a", totalPaise: 40_000_00 },
        { creatorId: "b", totalPaise: 50_000_00 },
      ],
      [
        { id: "a", role: "primary" },
        { id: "b", role: "upsell" },
      ],
      null,
    );
    expect(f).toEqual([
      { creatorId: "a", role: "primary", grossPaise: 100_000_00 },
      { creatorId: "b", role: "upsell", grossPaise: 50_000_00 },
    ]);
  });
  it("scales pro rata to the signed total and sums exactly", () => {
    const f = creatorFees(
      [
        { creatorId: "a", totalPaise: 1 },
        { creatorId: "b", totalPaise: 2 },
      ],
      [],
      100_000_01,
    );
    expect(f.reduce((t, x) => t + x.grossPaise, 0)).toBe(100_000_01);
    expect(f[0].grossPaise).toBe(Math.round(100_000_01 / 3));
  });
  it("feeds advance payouts: 50% of each share", () => {
    const fees = creatorFees([{ creatorId: "a", totalPaise: 100_000_00 }], [{ id: "a", role: "primary" }], 100_000_00);
    expect(advancePayouts(cfg, "creator_inbound", fees, "2026-10-19")[0].amountPaise).toBe(42_500_00);
  });
});

describe("invoice and payout gates", () => {
  it("advance invoice once, after signature, on a signed total", () => {
    expect(canIssueAdvance({ stageIndex: 6, signedIndex: 6, signedTotalPaise: 1, hasAdvance: false }).ok).toBe(true);
    expect(canIssueAdvance({ stageIndex: 5, signedIndex: 6, signedTotalPaise: 1, hasAdvance: false }).reasons).toContain("Deal not signed yet");
    expect(canIssueAdvance({ stageIndex: 6, signedIndex: 6, signedTotalPaise: null, hasAdvance: false }).ok).toBe(false);
    expect(canIssueAdvance({ stageIndex: 6, signedIndex: 6, signedTotalPaise: 1, hasAdvance: true }).ok).toBe(false);
  });
  it("balance invoice only after completion", () => {
    expect(canIssueBalance({ completed: false, signedTotalPaise: 1, hasBalance: false }).ok).toBe(false);
    expect(canIssueBalance({ completed: true, signedTotalPaise: 1, hasBalance: false }).ok).toBe(true);
  });
  it("payments only on sent invoices with an amount", () => {
    expect(canRecordPayment({ status: "sent" }, 100).ok).toBe(true);
    expect(canRecordPayment({ status: "overdue" }, 100).ok).toBe(true);
    expect(canRecordPayment({ status: "draft" }, 100).ok).toBe(false);
    expect(canRecordPayment({ status: "paid" }, 100).ok).toBe(false);
    expect(canRecordPayment({ status: "sent" }, 0).ok).toBe(false);
  });
  it("payouts paid with a reference, never twice", () => {
    expect(canMarkPayoutPaid({ status: "due" }, "UTR123").ok).toBe(true);
    expect(canMarkPayoutPaid({ status: "due" }, " ").ok).toBe(false);
    expect(canMarkPayoutPaid({ status: "paid" }, "x").ok).toBe(false);
  });
  it("referral facts carry prior completed deals", () => {
    expect(referralFacts([{ id: "a", referredByCreatorId: "r" }], new Map([["a", 3]]))).toEqual([{ creatorId: "a", referredByCreatorId: "r", priorDealCount: 3 }]);
  });
});
