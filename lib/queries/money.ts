// Money read models — invoices, payouts, totals and the monthly reconciliation export (BRIEF §3.6, §10, §11).
import "server-only";
import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getConfig } from "@/lib/settings";
import { isOverdue, lateFee } from "@/lib/rules/money";
import { today as todayISO, daysBetween, type ISODate } from "@/lib/dates";

export type InvoiceRow = typeof s.invoices.$inferSelect & {
  dealTitle: string;
  brand: string;
  overdueDays: number;
  lateFeePaise: number;
  displayStatus: string;
};

export type PayoutRow = typeof s.creatorPayouts.$inferSelect & {
  dealTitle: string;
  brand: string;
  creator: string;
  overdueDays: number;
  invoiceNumber: string | null;
};

export type InvoiceFilter = "open" | "overdue" | "paid" | "all";
export type PayoutFilter = "due" | "overdue" | "paid" | "all";

export async function listInvoices(filter: InvoiceFilter = "open"): Promise<InvoiceRow[]> {
  const cfg = await getConfig();
  const t = todayISO();
  const rows = await db
    .select({ i: s.invoices, dealTitle: s.deals.title, brand: s.brands.name })
    .from(s.invoices)
    .innerJoin(s.deals, eq(s.deals.id, s.invoices.dealId))
    .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
    .where(isNull(s.invoices.archivedAt))
    .orderBy(asc(s.invoices.dueOn));
  const out = rows.map(({ i, dealTitle, brand }) => {
    const late = isOverdue(i.dueOn, i.status, t) && i.status !== "draft";
    const days = late ? daysBetween(i.dueOn, t) : 0;
    return {
      ...i,
      dealTitle,
      brand,
      overdueDays: days,
      lateFeePaise: late ? lateFee(cfg, i.amountPaise - (i.paidAmountPaise ?? 0), i.dueOn, t) : 0,
      displayStatus: late ? "overdue" : i.status,
    };
  });
  return out.filter((r) =>
    filter === "all" ? true : filter === "paid" ? r.status === "paid" : filter === "overdue" ? r.overdueDays > 0 : r.status !== "paid" && r.status !== "void",
  );
}

export async function listPayouts(filter: PayoutFilter = "due"): Promise<PayoutRow[]> {
  const t = todayISO();
  const rows = await db
    .select({ p: s.creatorPayouts, dealTitle: s.deals.title, brand: s.brands.name, creator: s.creators.displayName, invoiceNumber: s.invoices.number })
    .from(s.creatorPayouts)
    .innerJoin(s.deals, eq(s.deals.id, s.creatorPayouts.dealId))
    .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
    .innerJoin(s.creators, eq(s.creators.id, s.creatorPayouts.creatorId))
    .leftJoin(s.invoices, eq(s.invoices.id, s.creatorPayouts.triggeredByInvoiceId))
    .where(isNull(s.creatorPayouts.archivedAt))
    .orderBy(asc(s.creatorPayouts.dueOn));
  const out = rows.map(({ p, dealTitle, brand, creator, invoiceNumber }) => ({
    ...p,
    dealTitle,
    brand,
    creator,
    invoiceNumber,
    overdueDays: isOverdue(p.dueOn, p.status, t) ? daysBetween(p.dueOn, t) : 0,
  }));
  return out.filter((r) => (filter === "all" ? true : filter === "paid" ? r.status === "paid" : filter === "overdue" ? r.overdueDays > 0 : r.status !== "paid"));
}

export async function moneyTotals() {
  const [inv, pay] = await Promise.all([listInvoices("all"), listPayouts("all")]);
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const open = inv.filter((i) => i.status !== "paid" && i.status !== "void" && i.status !== "draft");
  return {
    outstandingPaise: sum(open.map((i) => i.amountPaise)),
    overduePaise: sum(open.filter((i) => i.overdueDays > 0).map((i) => i.amountPaise)),
    overdueCount: open.filter((i) => i.overdueDays > 0).length,
    collectedPaise: sum(inv.filter((i) => i.status === "paid").map((i) => i.paidAmountPaise ?? i.amountPaise)),
    payoutsDuePaise: sum(pay.filter((p) => p.status !== "paid").map((p) => p.amountPaise)),
    payoutsOverdueCount: pay.filter((p) => p.overdueDays > 0).length,
    payoutsPaidPaise: sum(pay.filter((p) => p.status === "paid").map((p) => p.amountPaise)),
  };
}

/** Monthly finance reconciliation: invoices issued, due or paid in the month and payouts due or paid in it. */
export async function reconciliationRows(month: string) {
  const start: ISODate = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const end: ISODate = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const inMonth = (col: typeof s.invoices.issuedOn | typeof s.invoices.dueOn | typeof s.invoices.paidOn) => and(gte(col, start), lte(col, end));
  const [inv, pay] = await Promise.all([
    db
      .select({ i: s.invoices, deal: s.deals.title, brand: s.brands.name })
      .from(s.invoices)
      .innerJoin(s.deals, eq(s.deals.id, s.invoices.dealId))
      .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
      .where(and(isNull(s.invoices.archivedAt), or(inMonth(s.invoices.issuedOn), inMonth(s.invoices.dueOn), inMonth(s.invoices.paidOn))))
      .orderBy(asc(s.invoices.issuedOn)),
    db
      .select({ p: s.creatorPayouts, deal: s.deals.title, brand: s.brands.name, creator: s.creators.displayName, inv: s.invoices.number })
      .from(s.creatorPayouts)
      .innerJoin(s.deals, eq(s.deals.id, s.creatorPayouts.dealId))
      .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
      .innerJoin(s.creators, eq(s.creators.id, s.creatorPayouts.creatorId))
      .leftJoin(s.invoices, eq(s.invoices.id, s.creatorPayouts.triggeredByInvoiceId))
      .where(and(isNull(s.creatorPayouts.archivedAt), or(and(gte(s.creatorPayouts.dueOn, start), lte(s.creatorPayouts.dueOn, end)), and(gte(s.creatorPayouts.paidOn, start), lte(s.creatorPayouts.paidOn, end)))))
      .orderBy(desc(s.creatorPayouts.dueOn)),
  ]);
  return { inv, pay };
}
