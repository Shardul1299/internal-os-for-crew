import { describe, it, expect } from "vitest";
import { cfg, deal, dealCreator, TODAY } from "./fixtures";
import { canAdvance, nextStage, noListPassed, topicConflicts, canApproveOverride, canRequestOverride, firstBlocker } from "@/lib/rules/deals";

const adv = (d: ReturnType<typeof deal>, to: Parameters<typeof canAdvance>[2]) => canAdvance(cfg, d, to, TODAY);

describe("§5.1 stages", () => {
  it("moves one stage at a time", () => {
    expect(nextStage("lead")).toBe("qualified");
    expect(adv(deal(), "brief_received").ok).toBe(false);
  });
});

describe("lead → qualified", () => {
  it("passes a clean deal", () => expect(adv(deal(), "qualified").ok).toBe(true));
  it("barter on can't pass without Owner override", () => {
    const d = deal({ noListCheck: { ...deal().noListCheck!, barter: true } });
    expect(adv(d, "qualified").ok).toBe(false);
    expect(adv({ ...d, overrides: [{ kind: "no_list", approved: false }] }, "qualified").ok).toBe(false);
    expect(adv({ ...d, overrides: [{ kind: "no_list", approved: true }] }, "qualified").ok).toBe(true);
  });
  it("blocklist category blocks; house clients get no exception", () => {
    const d = deal({ noListCheck: { ...deal().noListCheck!, blocklist_category: "crypto" }, brand: { ownerTeam: "crew", riskReviewedAt: "2026-09-01", isHouseClient: true } });
    expect(adv(d, "qualified").ok).toBe(false);
  });
  it("needs a NO-list check", () => expect(adv(deal({ noListCheck: null }), "qualified").ok).toBe(false));
  it("brand risk reviewed within 180 days", () => {
    expect(adv(deal({ brand: { ownerTeam: "crew", riskReviewedAt: "2026-01-01", isHouseClient: false } }), "qualified").ok).toBe(false);
    expect(adv(deal({ brand: { ownerTeam: "crew", riskReviewedAt: null, isHouseClient: false } }), "qualified").ok).toBe(false);
  });
  it("type set; one-off needs reason", () => {
    expect(adv(deal({ type: null }), "qualified").ok).toBe(false);
    expect(adv(deal({ type: "one_off" }), "qualified").ok).toBe(false);
    expect(adv(deal({ type: "one_off", oneOffReason: "Launch week" }), "qualified").ok).toBe(true);
  });
  it("value ≥ ₹25K or min_deal override", () => {
    expect(adv(deal({ quotedTotalPaise: 20_000_00 }), "qualified").ok).toBe(false);
    expect(adv(deal({ quotedTotalPaise: 20_000_00, overrides: [{ kind: "min_deal", approved: true }] }), "qualified").ok).toBe(true);
  });
  it("OWLED Social brands need a referral note", () => {
    const b = { ownerTeam: "owled_social" as const, riskReviewedAt: "2026-09-01", isHouseClient: false };
    expect(adv(deal({ brand: b }), "qualified").ok).toBe(false);
    expect(adv(deal({ brand: b, referralNote: "Routed by Riya" }), "qualified").ok).toBe(true);
  });
  it("noListPassed is false with any flag and no override", () => {
    expect(noListPassed({ ...deal().noListCheck!, lifetime_rights: true }, false)).toBe(false);
  });
});

describe("qualified → brief_received", () => {
  it("needs a brief", () => {
    expect(adv(deal({ stage: "qualified" }), "brief_received").ok).toBe(false);
    expect(adv(deal({ stage: "qualified", briefMd: "Launch" }), "brief_received").ok).toBe(true);
  });
});

describe("brief_received → creator_matched", () => {
  const d = deal({ stage: "brief_received" });
  it("needs ≥ 1 accepted roster creator", () => {
    expect(adv({ ...d, creators: [dealCreator({ status: "proposed" })] }, "creator_matched").ok).toBe(false);
    expect(adv(d, "creator_matched").ok).toBe(true);
  });
  it("Tier 0 only with override", () => {
    const t0 = dealCreator({ stage: "incubation" });
    expect(adv({ ...d, creators: [t0] }, "creator_matched").ok).toBe(false);
    expect(adv({ ...d, creators: [t0], overrides: [{ kind: "tier0_in_deal", approved: true }] }, "creator_matched").ok).toBe(true);
  });
  it("topic-filter conflicts block with the filter named", () => {
    const c = dealCreator({ topicFilters: [{ kind: "competitor", value: "Acme" }] });
    const g = adv({ ...d, briefTags: ["acme"], creators: [c] }, "creator_matched");
    expect(g.ok).toBe(false);
    expect(g.reasons[0]).toContain("competitor: Acme");
  });
  it("represented elsewhere blocks", () => {
    expect(adv({ ...d, creators: [dealCreator({ representedElsewhere: true })] }, "creator_matched").ok).toBe(false);
  });
  it("creator_inbound prompts the upsell", () => {
    expect(adv({ ...d, origin: "creator_inbound", originatingCreatorId: "c1" }, "creator_matched").warnings).toContain("Upsell with other roster creators in the requirement band?");
  });
});

describe("creator_matched → proposal_sent", () => {
  it("runs the quote gate", () => {
    expect(adv(deal({ stage: "creator_matched" }), "proposal_sent").ok).toBe(true);
    expect(adv(deal({ stage: "creator_matched", lines: [] }), "proposal_sent").ok).toBe(false);
  });
});

describe("negotiation → signed", () => {
  const d = deal({ stage: "negotiation" });
  it("needs signed total, term, pieces and SOW", () => {
    expect(adv(d, "signed").ok).toBe(false);
    expect(adv({ ...d, signedTotalPaise: 100_000_00, termStartsOn: "2026-11-01", termEndsOn: "2027-01-31", piecesPerMonth: 2, sowMd: "SOW" }, "signed").reasons).toContain("Signed SOW link missing");
    expect(adv({ ...d, signedTotalPaise: 100_000_00, termStartsOn: "2026-11-01", termEndsOn: "2027-01-31", piecesPerMonth: 2, sowMd: "SOW", sowUrl: "https://drive/sow-signed.pdf" }, "signed").ok).toBe(true);
  });
});

describe("signed → advance_received", () => {
  const d = deal({ stage: "signed", signedTotalPaise: 100_000_00 });
  it("needs a paid advance ≥ 50% or override", () => {
    expect(adv(d, "advance_received").ok).toBe(false);
    expect(adv({ ...d, advanceInvoice: { status: "paid", paidAmountPaise: 40_000_00, amountPaise: 50_000_00 } }, "advance_received").ok).toBe(false);
    expect(adv({ ...d, advanceInvoice: { status: "paid", paidAmountPaise: 50_000_00, amountPaise: 50_000_00 } }, "advance_received").ok).toBe(true);
    expect(adv({ ...d, overrides: [{ kind: "go_live_without_advance", approved: true }] }, "advance_received").ok).toBe(true);
  });
});

describe("advance_received → in_production", () => {
  const d = deal({ stage: "advance_received" });
  it("needs PO or confirmation or override", () => {
    expect(adv(d, "in_production").ok).toBe(false);
    expect(adv({ ...d, poReference: "PO-1" }, "in_production").ok).toBe(true);
    expect(adv({ ...d, confirmationUrl: "https://mail" }, "in_production").ok).toBe(true);
    expect(adv({ ...d, overrides: [{ kind: "go_live_without_po", approved: true }] }, "in_production").ok).toBe(true);
  });
});

describe("live → reported → paid_in_full", () => {
  it("reported needs all deliverables live/cancelled, report and feedback request", () => {
    const d = deal({ stage: "live", deliverables: [{ status: "live" }, { status: "in_review" }] });
    expect(adv(d, "reported").ok).toBe(false);
    expect(adv({ ...d, deliverables: [{ status: "live" }, { status: "cancelled" }], reportUrl: "r", feedbackRequested: true }, "reported").ok).toBe(true);
  });
  it("paid_in_full needs balance paid and all payouts paid", () => {
    const d = deal({ stage: "reported", balanceInvoice: { status: "paid" }, payouts: [{ status: "paid" }, { status: "due" }] });
    expect(adv(d, "paid_in_full").ok).toBe(false);
    expect(adv({ ...d, payouts: [{ status: "paid" }] }, "paid_in_full").ok).toBe(true);
  });
});

describe("declined and overrides", () => {
  it("declined needs reason and value", () => {
    expect(adv(deal(), "declined").ok).toBe(false);
    expect(adv(deal({ declinedReason: "Barter", declinedValuePaise: 1 }), "declined").ok).toBe(true);
  });
  it("only the Owner approves overrides; requests need a reason", () => {
    expect(canApproveOverride("crew_lead").ok).toBe(false);
    expect(canApproveOverride("owner").ok).toBe(true);
    expect(canRequestOverride("crew_lead", "").ok).toBe(false);
  });
  it("topic conflict helper", () => {
    expect(topicConflicts(["crypto wallets"], [{ kind: "category", value: "crypto" }])).toEqual(["category: crypto"]);
  });
  it("first blocker is the first reason", () => {
    expect(firstBlocker(cfg, deal({ type: null }), TODAY)).toBe("Deal type not set");
  });
});
