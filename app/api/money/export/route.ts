// Monthly finance reconciliation CSV (BRIEF §1 Finance viewer, §11). Role-checked; no tier, rung or commission.
import { getMe } from "@/lib/session";
import { can } from "@/lib/rules/visibility";
import { reconciliationRows } from "@/lib/queries/money";
import { today } from "@/lib/dates";

function csvCell(v: unknown) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const rupees = (paise: number | null | undefined) => (paise == null ? "" : (paise / 100).toFixed(2));

export async function GET(req: Request) {
  const me = await getMe();
  if (!me) return new Response("Sign in", { status: 401 });
  if (!can(me.role, "money")) return new Response("Your role can't export money", { status: 403 });
  const q = new URL(req.url).searchParams.get("month") ?? "";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(q) ? q : today().slice(0, 7);
  const { inv, pay } = await reconciliationRows(month);
  const header = ["record", "number", "brand", "deal", "creator", "kind", "issued_by", "issued_on", "due_on", "currency", "amount", "gst_pct", "tds_pct", "status", "paid_on", "paid_amount", "reference", "triggered_by_invoice"];
  const rows: unknown[][] = [
    ...inv.map(({ i, deal, brand }) => ["invoice", i.number, brand, deal, "", i.kind, i.issuedByEntity, i.issuedOn, i.dueOn, i.currency, rupees(i.amountPaise), i.gstPct, i.tdsPct, i.status, i.paidOn, rupees(i.paidAmountPaise), i.reference, ""]),
    ...pay.map(({ p, deal, brand, creator, inv: invNo }) => ["payout", "", brand, deal, creator, p.kind, "", "", p.dueOn, p.currency, rupees(p.amountPaise), "", p.tdsPct, p.status, p.paidOn, p.status === "paid" ? rupees(p.amountPaise) : "", p.reference, invNo]),
  ];
  const body = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
  return new Response(body, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="snoball-money-${month}.csv"`, "cache-control": "no-store" },
  });
}
