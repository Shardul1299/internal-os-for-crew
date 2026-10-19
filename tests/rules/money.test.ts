import { describe, it, expect } from "vitest";
import { cfg } from "./fixtures";
import { advanceInvoice, balanceInvoice, advancePayouts, balancePayouts, lateFee, ledger, killFee } from "@/lib/rules/money";

describe("money §0.1 #12", () => {
  it("50% advance due in 7 days", () => {
    expect(advanceInvoice(cfg, 200_000_00, "2026-10-19")).toEqual({ kind: "advance", amountPaise: 100_000_00, issuedOn: "2026-10-19", dueOn: "2026-10-26" });
  });
  it("balance issued at completion, due in 7 days", () => {
    expect(balanceInvoice(cfg, 200_000_00, 100_000_00, "2026-12-01")).toEqual({ kind: "balance", amountPaise: 100_000_00, issuedOn: "2026-12-01", dueOn: "2026-12-08" });
  });
  it("advance paid → fee_advance payouts (50% of share) due in 5 business days", () => {
    const p = advancePayouts(cfg, "crew_originated", [{ creatorId: "a", role: "primary", grossPaise: 100_000_00 }], "2026-10-23"); // Friday
    expect(p).toEqual([{ creatorId: "a", kind: "fee_advance", amountPaise: 40_000_00, dueOn: "2026-10-30" }]);
  });
  it("balance paid → balance, upsell and referral payouts", () => {
    const p = balancePayouts(cfg, {
      origin: "creator_inbound",
      originatingCreatorId: "orig",
      fees: [
        { creatorId: "orig", role: "primary", grossPaise: 100_000_00 },
        { creatorId: "up", role: "upsell", grossPaise: 100_000_00 },
      ],
      advancePaid: [
        { creatorId: "orig", amountPaise: 42_500_00 },
        { creatorId: "up", amountPaise: 42_500_00 },
      ],
      referrals: [{ creatorId: "up", referredByCreatorId: "ref", priorDealCount: 0 }],
      receivedOn: "2026-12-08",
    });
    expect(p.map((x) => [x.creatorId, x.kind, x.amountPaise])).toEqual([
      ["orig", "fee_balance", 42_500_00],
      ["up", "fee_balance", 42_500_00],
      ["orig", "upsell_share", 3_000_00],
      ["ref", "referral_share", 1_500_00],
    ]);
  });
  it("late fee 1.5% per month, kill fees 50/100", () => {
    expect(lateFee(cfg, 100_000_00, "2026-10-01", "2026-10-31")).toBe(1_500_00);
    expect(killFee(cfg, 100_000_00, "after_script")).toBe(50_000_00);
    expect(killFee(cfg, 100_000_00, "after_production")).toBe(100_000_00);
  });
  it("ledger", () => {
    const l = ledger(
      [{ kind: "advance", amountPaise: 100, paidAmountPaise: 100, status: "paid", dueOn: "2026-10-01" }, { kind: "balance", amountPaise: 100, paidAmountPaise: null, status: "sent", dueOn: "2026-10-10" }],
      [{ kind: "fee_advance", amountPaise: 40, status: "paid" }, { kind: "upsell_share", amountPaise: 3, status: "due" }],
      40,
      "2026-10-19",
    );
    expect(l).toMatchObject({ advanceReceived: 100, balanceDue: 100, balanceReceived: 0, payoutsPaid: 40, payoutsDue: 3, overdueDays: 9 });
  });
});
