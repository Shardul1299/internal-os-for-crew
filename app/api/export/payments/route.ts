// CSV export of payments — invoices and creator payouts — for monthly reconciliation (§1 Finance viewer).
// ?month=YYYY-MM limits rows to those issued, due or paid in that month.
import type { NextRequest } from "next/server";
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getMe } from "@/lib/session";
import { can } from "@/lib/rules/visibility";
import { toCsv } from "@/lib/csv";
import { today } from "@/lib/dates";

export const dynamic = "force-dynamic";
const rupees = (p: number | null) => (p == null ? null : (p / 100).toFixed(2));

export async function GET(req: NextRequest) {
  const me = await getMe();
  if (!me || !can(me.role, "money")) return new Response("Not allowed", { status: 403 });
  const month = req.nextUrl.searchParams.get("month");
  const inMonth = (...ds: (string | null)[]) => !month || !/^\d{4}-\d{2}$/.test(month) || ds.some((d) => d?.startsWith(month));
  const [invoices, payouts] = await Promise.all([
    db
      .select({ i: s.invoices, deal: s.deals.title, brand: s.brands.name })
      .from(s.invoices)
      .innerJoin(s.deals, eq(s.deals.id, s.invoices.dealId))
      .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
      .where(isNull(s.invoices.archivedAt))
      .orderBy(asc(s.invoices.issuedOn)),
    db
      .select({ p: s.creatorPayouts, deal: s.deals.title, creator: s.creators.displayName })
      .from(s.creatorPayouts)
      .innerJoin(s.deals, eq(s.deals.id, s.creatorPayouts.dealId))
      .innerJoin(s.creators, eq(s.creators.id, s.creatorPayouts.creatorId))
      .where(isNull(s.creatorPayouts.archivedAt))
      .orderBy(asc(s.creatorPayouts.dueOn)),
  ]);
  const header = ["ledger", "id", "deal", "party", "kind", "number", "issued_on", "due_on", "currency", "amount", "gst_pct", "tds_pct", "status", "paid_on", "paid_amount", "reference"] as const;
  const rows = [
    ...invoices
      .filter(({ i }) => inMonth(i.issuedOn, i.dueOn, i.paidOn))
      .map(({ i, deal, brand }) => ["invoice", i.id, deal, brand, i.kind, i.number, i.issuedOn, i.dueOn, i.currency, rupees(i.amountPaise), i.gstPct, i.tdsPct, i.status, i.paidOn, rupees(i.paidAmountPaise), i.reference]),
    ...payouts
      .filter(({ p }) => inMonth(p.dueOn, p.paidOn))
      .map(({ p, deal, creator }) => ["payout", p.id, deal, creator, p.kind, null, null, p.dueOn, p.currency, rupees(p.amountPaise), null, p.tdsPct, p.status, p.paidOn, p.status === "paid" ? rupees(p.amountPaise) : null, p.reference]),
  ];
  return new Response(toCsv(header, rows), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="payments-${month ?? today()}.csv"` },
  });
}
