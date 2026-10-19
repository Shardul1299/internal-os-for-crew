import { requireBrand } from "@/lib/session";
import { portalInvoices } from "@/lib/queries/brand-portal";
import { ScreenHeader, Table, THead, TH, TR, TD, EmptyState, Meta, Alert } from "@/components/ui";
import { date, money, moneyShort, humanize } from "@/lib/format";

export const metadata = { title: "Invoices" };
export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const me = await requireBrand();
  const rows = await portalInvoices(me.brandId);
  const outstanding = rows.filter((r) => r.status !== "paid").reduce((t, r) => t + r.amountPaise, 0);
  const currency = rows[0]?.currency ?? "INR";
  return (
    <>
      <ScreenHeader title="Invoices" number={outstanding ? moneyShort(outstanding, currency) : undefined} numberCaption={outstanding ? "outstanding before GST" : undefined} />
      {rows.length === 0 ? (
        <EmptyState>No invoices yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <TH>Invoice</TH>
            <TH className="hidden md:table-cell">For</TH>
            <TH>Due</TH>
            <TH align="right">Amount</TH>
            <TH>Status</TH>
            <TH className="hidden md:table-cell">Paid</TH>
          </THead>
          <tbody>
            {rows.map((r) => (
              <TR key={r.id}>
                <TD>
                  <span className="num">{r.number}</span>
                  <span className="t-caption ml-2">{humanize(r.kind)}</span>
                </TD>
                <TD className="hidden md:table-cell max-w-[280px] truncate">{r.dealTitle}</TD>
                <TD className="whitespace-nowrap">{date(r.dueOn)}</TD>
                <TD align="right">
                  {money(r.amountPaise, r.currency)}
                  <span className="t-caption block">+{r.gstPct}% GST</span>
                </TD>
                <TD>{r.status === "overdue" ? <Alert>Overdue</Alert> : humanize(r.status)}</TD>
                <TD className="hidden md:table-cell">{r.paidOn ? date(r.paidOn) : <Meta>—</Meta>}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
