// Payments: this creator's payout lines — generated from receipts, never ahead of them (§3.6).
import Link from "next/link";
import { Section, Table, THead, TH, TR, TD, EmptyState, Alert } from "@/components/ui";
import { money, moneyShort, date } from "@/lib/format";
import { PAYOUT_KIND_LABEL } from "../labels";
import type { creatorPayments } from "@/lib/queries/creators";

export function PaymentsTab({ rows, today }: { rows: Awaited<ReturnType<typeof creatorPayments>>; today: string }) {
  if (!rows.length) return <EmptyState>No payouts yet.</EmptyState>;
  const due = rows.filter((r) => r.p.status !== "paid").reduce((t, r) => t + r.p.amountPaise, 0);
  const paid = rows.filter((r) => r.p.status === "paid").reduce((t, r) => t + r.p.amountPaise, 0);
  return (
    <Section title="Payouts" aside={`Due ${moneyShort(due)} · Paid ${moneyShort(paid)}`} flush>
      <Table>
        <THead>
          <TH>Due</TH>
          <TH>Deal</TH>
          <TH>Kind</TH>
          <TH align="right">Amount</TH>
          <TH align="right">TDS</TH>
          <TH>Status</TH>
          <TH>Paid</TH>
        </THead>
        <tbody>
          {rows.map(({ p, title, brand }) => (
            <TR key={p.id}>
              <TD className="whitespace-nowrap">{date(p.dueOn, "d MMM yy")}</TD>
              <TD>
                <Link href={`/deals/${p.dealId}?step=money`} className="hover:underline underline-offset-2">
                  {brand} · {title}
                </Link>
              </TD>
              <TD className="text-fg-2">{PAYOUT_KIND_LABEL[p.kind]}</TD>
              <TD align="right">{money(p.amountPaise, p.currency)}</TD>
              <TD align="right" className="text-fg-3">
                {p.tdsPct ? `${p.tdsPct}%` : "—"}
              </TD>
              <TD>{p.status === "paid" ? "Paid" : p.status === "held" ? "Held" : p.dueOn < today ? <Alert>Overdue</Alert> : "Due"}</TD>
              <TD className="whitespace-nowrap text-fg-2">{p.paidOn ? date(p.paidOn, "d MMM yy") : "—"}</TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </Section>
  );
}
