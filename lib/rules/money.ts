// Money — BRIEF §0.1 #12, §3.6, §5.2. Payouts are generated from receipts, never ahead of them.
import { type RulesConfig, type DealOrigin, gate, type GateResult } from "./config";
import { splitDeal, computeShares, type Split } from "./ladder";
import { addDays, addBusinessDays, daysBetween, type ISODate } from "../dates";

export function advanceAmount(cfg: RulesConfig, signedTotalPaise: number) {
  return Math.round((signedTotalPaise * cfg.n.advance_pct) / 100);
}

export function advanceInvoice(cfg: RulesConfig, signedTotalPaise: number, issuedOn: ISODate) {
  return { kind: "advance" as const, amountPaise: advanceAmount(cfg, signedTotalPaise), issuedOn, dueOn: addDays(issuedOn, cfg.n.advance_due_days) };
}

/** Balance invoice issued at campaign completion, due 7 days later. */
export function balanceInvoice(cfg: RulesConfig, signedTotalPaise: number, advanceInvoicedPaise: number, completedOn: ISODate) {
  return {
    kind: "balance" as const,
    amountPaise: Math.max(0, signedTotalPaise - advanceInvoicedPaise),
    issuedOn: completedOn,
    dueOn: addDays(completedOn, cfg.n.balance_due_days),
  };
}

export type PayoutLine = {
  creatorId: string;
  kind: "fee_advance" | "fee_balance" | "upsell_share" | "referral_share";
  amountPaise: number;
  dueOn: ISODate;
};

export type CreatorFee = { creatorId: string; role: "primary" | "upsell"; grossPaise: number };

/** On advance receipt: 50% of each creator's share, due receipt + 5 business days. */
export function advancePayouts(cfg: RulesConfig, origin: DealOrigin, fees: CreatorFee[], receivedOn: ISODate): PayoutLine[] {
  const due = addBusinessDays(receivedOn, cfg.n.payout_days);
  return splitDeal(cfg, origin, fees)
    .filter((s) => s.creatorSharePaise > 0)
    .map((s) => ({ creatorId: s.creatorId, kind: "fee_advance" as const, amountPaise: Math.round((s.creatorSharePaise * cfg.n.advance_pct) / 100), dueOn: due }));
}

/** On balance receipt: the rest of each share, plus upsell and referral shares from Crew's commission. */
export function balancePayouts(
  cfg: RulesConfig,
  args: {
    origin: DealOrigin;
    originatingCreatorId: string | null;
    fees: CreatorFee[];
    advancePaid: { creatorId: string; amountPaise: number }[];
    referrals: { creatorId: string; referredByCreatorId: string | null; priorDealCount: number }[];
    receivedOn: ISODate;
  },
): PayoutLine[] {
  const due = addBusinessDays(args.receivedOn, cfg.n.payout_days);
  const splits: Split[] = splitDeal(cfg, args.origin, args.fees);
  const out: PayoutLine[] = [];
  for (const s of splits) {
    const already = args.advancePaid.filter((a) => a.creatorId === s.creatorId).reduce((t, a) => t + a.amountPaise, 0);
    const rest = s.creatorSharePaise - already;
    if (rest > 0) out.push({ creatorId: s.creatorId, kind: "fee_balance", amountPaise: rest, dueOn: due });
  }
  for (const sh of computeShares(cfg, { origin: args.origin, originatingCreatorId: args.originatingCreatorId, splits, referrals: args.referrals })) {
    out.push({ creatorId: sh.toCreatorId, kind: sh.kind, amountPaise: sh.amountPaise, dueOn: due });
  }
  return out;
}

export function isOverdue(dueOn: ISODate, status: string, today: ISODate) {
  return status !== "paid" && status !== "void" && daysBetween(dueOn, today) > 0;
}

/** Late fee at 1.5% per month, pro-rated by day. */
export function lateFee(cfg: RulesConfig, amountPaise: number, dueOn: ISODate, today: ISODate): number {
  const days = daysBetween(dueOn, today);
  if (days <= 0) return 0;
  return Math.round(amountPaise * (cfg.n.late_fee_pct_month / 100) * (days / 30));
}

export function killFee(cfg: RulesConfig, valuePaise: number, phase: "after_script" | "after_production") {
  const p = phase === "after_script" ? cfg.n.kill_fee_after_script : cfg.n.kill_fee_after_production;
  return Math.round((valuePaise * p) / 100);
}

export type Ledger = {
  advanceDue: number;
  advanceReceived: number;
  balanceDue: number;
  balanceReceived: number;
  payoutsDue: number;
  payoutsPaid: number;
  overdueDays: number;
  commissionEarned: number;
  sharesPaid: number;
};

export function ledger(
  invoices: { kind: string; amountPaise: number; paidAmountPaise: number | null; status: string; dueOn: ISODate }[],
  payouts: { kind: string; amountPaise: number; status: string }[],
  commissionPaise: number,
  today: ISODate,
): Ledger {
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const adv = invoices.filter((i) => i.kind === "advance" && i.status !== "void");
  const bal = invoices.filter((i) => i.kind === "balance" && i.status !== "void");
  const overdue = invoices.filter((i) => isOverdue(i.dueOn, i.status, today)).map((i) => daysBetween(i.dueOn, today));
  return {
    advanceDue: sum(adv.map((i) => i.amountPaise)),
    advanceReceived: sum(adv.filter((i) => i.status === "paid").map((i) => i.paidAmountPaise ?? i.amountPaise)),
    balanceDue: sum(bal.map((i) => i.amountPaise)),
    balanceReceived: sum(bal.filter((i) => i.status === "paid").map((i) => i.paidAmountPaise ?? i.amountPaise)),
    payoutsDue: sum(payouts.filter((p) => p.status !== "paid").map((p) => p.amountPaise)),
    payoutsPaid: sum(payouts.filter((p) => p.status === "paid").map((p) => p.amountPaise)),
    overdueDays: overdue.length ? Math.max(...overdue) : 0,
    commissionEarned: commissionPaise,
    sharesPaid: sum(payouts.filter((p) => (p.kind === "upsell_share" || p.kind === "referral_share") && p.status === "paid").map((p) => p.amountPaise)),
  };
}

export function invoiceNumber(kind: string, seq: number, year: number) {
  return `OWLED/${year}/${kind === "advance" ? "A" : kind === "balance" ? "B" : "X"}${String(seq).padStart(4, "0")}`;
}

// ---------- Fees, invoices and payout gates (deal record Money step, /money) ----------

/**
 * Each creator's gross fee on a deal: the sum of their quote lines (case-by-case lines included at
 * their hand price), scaled pro rata to the signed total when the signed total differs from the quote.
 * Rounding is absorbed by the last creator so the fees always sum to the signed total.
 */
export function creatorFees(
  lines: { creatorId: string; totalPaise: number }[],
  creators: { id: string; role: "primary" | "upsell" }[],
  signedTotalPaise: number | null,
): CreatorFee[] {
  const byCreator = new Map<string, number>();
  for (const l of lines) byCreator.set(l.creatorId, (byCreator.get(l.creatorId) ?? 0) + l.totalPaise);
  const quoted = [...byCreator.values()].reduce((a, b) => a + b, 0);
  const ids = [...byCreator.keys()];
  if (!ids.length) return [];
  const target = signedTotalPaise && signedTotalPaise > 0 ? signedTotalPaise : quoted;
  let assigned = 0;
  return ids.map((id, i) => {
    const raw = byCreator.get(id)!;
    const gross = i === ids.length - 1 ? target - assigned : quoted > 0 ? Math.round((raw * target) / quoted) : 0;
    assigned += gross;
    return { creatorId: id, role: creators.find((c) => c.id === id)?.role ?? "primary", grossPaise: gross };
  });
}

/** The advance invoice is raised once, after signature, on the signed total. */
export function canIssueAdvance(d: { stageIndex: number; signedIndex: number; signedTotalPaise: number | null; hasAdvance: boolean }): GateResult {
  const r: string[] = [];
  if (d.hasAdvance) r.push("Advance invoice already raised");
  if (d.stageIndex < d.signedIndex) r.push("Deal not signed yet");
  if (!d.signedTotalPaise || d.signedTotalPaise <= 0) r.push("Signed total missing");
  return gate(r);
}

/** The balance invoice follows campaign completion (§5.2 live → reported). */
export function canIssueBalance(d: { completed: boolean; signedTotalPaise: number | null; hasBalance: boolean }): GateResult {
  const r: string[] = [];
  if (d.hasBalance) r.push("Balance invoice already raised");
  if (!d.completed) r.push("Campaign not completed");
  if (!d.signedTotalPaise || d.signedTotalPaise <= 0) r.push("Signed total missing");
  return gate(r);
}

/** A receipt against an invoice. Partial receipts accumulate; nothing over the amount due. */
export function canRecordPayment(inv: { status: string; amountPaise: number; paidAmountPaise: number | null }, amountPaise: number): GateResult {
  const r: string[] = [];
  if (inv.status === "paid") r.push("Invoice already paid");
  if (inv.status === "void") r.push("Invoice is void");
  if (inv.status === "draft") r.push("Mark the invoice sent first");
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) r.push("Amount required");
  else if ((inv.paidAmountPaise ?? 0) + amountPaise > inv.amountPaise) r.push("More than the amount still due");
  return gate(r);
}

/** After a receipt: the invoice is paid only once receipts cover the full amount (§0.1 #12). */
export function afterReceipt(inv: { amountPaise: number; paidAmountPaise: number | null }, amountPaise: number) {
  const received = (inv.paidAmountPaise ?? 0) + amountPaise;
  return { received, fullyPaid: received >= inv.amountPaise };
}

/** Payouts exist only after a receipt; paying one needs it due and a reference. */
export function canMarkPayoutPaid(p: { status: string }, reference: string): GateResult {
  const r: string[] = [];
  if (p.status === "paid") r.push("Payout already paid");
  if (p.status === "held") r.push("Payout is held");
  if (!reference.trim()) r.push("Reference required");
  return gate(r);
}

/** A referred creator's prior completed deals, for the referral share (first N deals only). */
export function referralFacts(
  creators: { id: string; referredByCreatorId: string | null }[],
  priorCompleted: Map<string, number>,
): { creatorId: string; referredByCreatorId: string | null; priorDealCount: number }[] {
  return creators.map((c) => ({ creatorId: c.id, referredByCreatorId: c.referredByCreatorId, priorDealCount: priorCompleted.get(c.id) ?? 0 }));
}
