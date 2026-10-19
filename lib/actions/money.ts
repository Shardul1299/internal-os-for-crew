"use server";
// Money server actions — BRIEF §0.1 #12, §3.6, §5.2. Payouts are generated from receipts, never ahead of them.
import { z } from "zod";
import { and, eq, isNull, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { advanceInvoice, balanceInvoice, canIssueAdvance, canIssueBalance, canMarkPayoutPaid, canRecordPayment } from "@/lib/rules/money";
import { stageIndex } from "@/lib/rules/deals";
import { money, rupeesToPaise, humanize } from "@/lib/format";
import { today } from "@/lib/dates";
import { ok, fail, guard, type ActionResult } from "./result";
import { generateAdvancePayouts, generateBalancePayouts, logActivity, nextInvoiceNumber, issueBalanceInvoice } from "./deal-ops";

const id = z.string().uuid();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function paths(dealId: string) {
  revalidatePath("/money");
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/deals");
  revalidatePath("/today");
}

export async function createAdvanceInvoice(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeMoney");
    const v = z.object({ dealId: id }).parse(Object.fromEntries(fd));
    const cfg = await getConfig();
    const [deal] = await db.select().from(s.deals).where(eq(s.deals.id, v.dealId));
    if (!deal) return fail("Deal not found");
    const existing = await db
      .select({ id: s.invoices.id })
      .from(s.invoices)
      .where(and(eq(s.invoices.dealId, deal.id), eq(s.invoices.kind, "advance"), ne(s.invoices.status, "void"), isNull(s.invoices.archivedAt)));
    const g = canIssueAdvance({ stageIndex: stageIndex(deal.stage), signedIndex: stageIndex("signed"), signedTotalPaise: deal.signedTotalPaise, hasAdvance: existing.length > 0 });
    if (!g.ok) return fail(g.reasons[0]);
    const t = today();
    const inv = advanceInvoice(cfg, deal.signedTotalPaise!, t);
    const number = await withUser(me.id, async (tx) => {
      const n = await nextInvoiceNumber(tx, "advance", Number(t.slice(0, 4)));
      await tx.insert(s.invoices).values({ dealId: deal.id, kind: "advance", number: n, issuedOn: inv.issuedOn, dueOn: inv.dueOn, amountPaise: inv.amountPaise, currency: deal.currency, gstPct: cfg.n.gst_pct, status: "draft", createdBy: me.id });
      await logActivity(tx, deal.id, me.id, "note", `Advance invoice ${n} drafted · ${money(inv.amountPaise, deal.currency)}`);
      return n;
    });
    paths(deal.id);
    return ok(`Advance invoice ${number} drafted`);
  });
}

export async function createBalanceInvoice(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeMoney");
    const v = z.object({ dealId: id }).parse(Object.fromEntries(fd));
    const cfg = await getConfig();
    const [deal] = await db.select().from(s.deals).where(eq(s.deals.id, v.dealId));
    if (!deal) return fail("Deal not found");
    const [camp] = await db.select().from(s.campaigns).where(eq(s.campaigns.dealId, deal.id));
    const bal = await db
      .select({ id: s.invoices.id })
      .from(s.invoices)
      .where(and(eq(s.invoices.dealId, deal.id), eq(s.invoices.kind, "balance"), ne(s.invoices.status, "void"), isNull(s.invoices.archivedAt)));
    const g = canIssueBalance({ completed: !!camp?.completedAt, signedTotalPaise: deal.signedTotalPaise, hasBalance: bal.length > 0 });
    if (!g.ok) return fail(g.reasons[0]);
    const inv = await withUser(me.id, (tx) => issueBalanceInvoice(tx, cfg, deal, today(), me.id));
    if (!inv) return fail("Nothing left to invoice");
    paths(deal.id);
    return ok(`Balance invoice ${inv.number} issued`);
  });
}

export async function markInvoiceSent(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeMoney");
    const v = z.object({ invoiceId: id }).parse(Object.fromEntries(fd));
    const cfg = await getConfig();
    const [inv] = await db.select().from(s.invoices).where(eq(s.invoices.id, v.invoiceId));
    if (!inv) return fail("Not found");
    if (inv.status !== "draft") return fail("Only drafts can be sent");
    const t = today();
    // Issued on the day it goes out; due date from the settings (advance +7d, balance +7d).
    const dueOn = inv.kind === "advance" ? advanceInvoice(cfg, inv.amountPaise, t).dueOn : balanceInvoice(cfg, inv.amountPaise, 0, t).dueOn;
    await withUser(me.id, async (tx) => {
      await tx.update(s.invoices).set({ status: "sent", issuedOn: t, dueOn }).where(eq(s.invoices.id, inv.id));
      await logActivity(tx, inv.dealId, me.id, "email", `Invoice ${inv.number} sent`);
    });
    paths(inv.dealId);
    return ok(`Invoice ${inv.number} sent`);
  });
}

export async function recordPayment(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeMoney");
    const parsed = z
      .object({ invoiceId: id, amountRupees: z.coerce.number().positive("Amount required"), paidOn: isoDate, reference: z.string().trim().min(1, "Reference required") })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const v = parsed.data;
    const cfg = await getConfig();
    const [inv] = await db.select().from(s.invoices).where(eq(s.invoices.id, v.invoiceId));
    if (!inv) return fail("Not found");
    const amount = rupeesToPaise(v.amountRupees);
    const g = canRecordPayment(inv, amount);
    if (!g.ok) return fail(g.reasons[0]);
    if (v.paidOn > today()) return fail("Payment date is in the future");
    const [deal] = await db.select().from(s.deals).where(eq(s.deals.id, inv.dealId));
    let generated = 0;
    await withUser(me.id, async (tx) => {
      await tx.update(s.invoices).set({ status: "paid", paidOn: v.paidOn, paidAmountPaise: amount, reference: v.reference }).where(eq(s.invoices.id, inv.id));
      await logActivity(tx, inv.dealId, me.id, "note", `Payment recorded on ${inv.number} · ${money(amount, inv.currency)} · ${v.reference}`);
      // Payouts generated from the receipt: advance → fee_advance; balance → fee_balance + upsell/referral shares.
      if (inv.kind === "advance") generated = await generateAdvancePayouts(tx, cfg, deal, inv.id, v.paidOn, me.id);
      if (inv.kind === "balance") generated = await generateBalancePayouts(tx, cfg, deal, inv.id, v.paidOn, me.id);
      if (generated) await logActivity(tx, inv.dealId, me.id, "note", `${generated} creator payout${generated === 1 ? "" : "s"} generated from the ${inv.kind} receipt`);
    });
    paths(inv.dealId);
    return ok(`Payment recorded${generated ? ` · ${generated} payout${generated === 1 ? "" : "s"} generated` : ""}`);
  });
}

export async function markPayoutPaid(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeMoney");
    const parsed = z.object({ payoutId: id, reference: z.string().default(""), paidOn: isoDate }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const v = parsed.data;
    const [p] = await db.select().from(s.creatorPayouts).where(eq(s.creatorPayouts.id, v.payoutId));
    if (!p) return fail("Not found");
    const g = canMarkPayoutPaid(p, v.reference);
    if (!g.ok) return fail(g.reasons[0]);
    if (v.paidOn > today()) return fail("Payment date is in the future");
    await withUser(me.id, async (tx) => {
      await tx.update(s.creatorPayouts).set({ status: "paid", paidOn: v.paidOn, reference: v.reference.trim() }).where(eq(s.creatorPayouts.id, p.id));
      await logActivity(tx, p.dealId, me.id, "note", `Payout paid · ${humanize(p.kind)} · ${money(p.amountPaise, p.currency)} · ${v.reference.trim()}`);
    });
    paths(p.dealId);
    return ok("Payout marked paid");
  });
}
