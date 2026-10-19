// Money — invoices and creator payouts (BRIEF §3.6, §10). Ops writes; Finance viewer reads and exports.
import Link from "next/link";
import { requireCrew } from "@/lib/session";
import { listInvoices, listPayouts, moneyTotals, type InvoiceFilter, type PayoutFilter } from "@/lib/queries/money";
import { can } from "@/lib/rules/visibility";
import { ScreenHeader, Table, THead, TH, TR, TD, EmptyState, Alert, Kv, Kvs, InspectorTitle, WithInspector, selHref, Caption, Input, Button } from "@/components/ui";
import { SegmentedControl, KeyRows } from "@/components/ui/client";
import { InvoiceActions, PayoutActions } from "@/components/money/MoneyActions";
import { money, moneyShort, date, humanize } from "@/lib/format";
import { today as todayISO } from "@/lib/dates";

export const metadata = { title: "Money" };
export const dynamic = "force-dynamic";

const PAYOUT_LABEL: Record<string, string> = { fee_advance: "Fee · advance", fee_balance: "Fee · balance", upsell_share: "Upsell share", referral_share: "Referral share" };

export default async function MoneyPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireCrew("money");
  const sp = await searchParams;
  // Links from Today carry only ?sel=<payout id>; open the Payouts view for them.
  const selIsPayout = !sp.view && !!sp.sel && (await listPayouts("all")).some((p) => p.id === sp.sel);
  const view = sp.view === "payouts" || selIsPayout ? "payouts" : "invoices";
  const canWrite = can(me.role, "writeMoney");
  const t = todayISO();
  const month = t.slice(0, 7);
  const invFilter = (["open", "overdue", "paid", "all"].includes(sp.f ?? "") ? sp.f : "open") as InvoiceFilter;
  const payFilter = (["due", "overdue", "paid", "all"].includes(sp.f ?? "") ? sp.f : selIsPayout ? "all" : "due") as PayoutFilter;
  const [invoices, payouts, totals] = await Promise.all([view === "invoices" ? listInvoices(invFilter) : [], view === "payouts" ? listPayouts(payFilter) : [], moneyTotals()]);
  const base = "/money";
  const spPlain = Object.fromEntries(Object.entries(sp).filter(([, v]) => typeof v === "string")) as Record<string, string>;

  const selInv = view === "invoices" ? invoices.find((i) => i.id === sp.sel) : undefined;
  const selPay = view === "payouts" ? payouts.find((p) => p.id === sp.sel) : undefined;

  const inspector = selInv ? (
    <>
      <InspectorTitle sub={`${selInv.brand} · ${selInv.dealTitle}`}>{selInv.number}</InspectorTitle>
      <Kvs>
        <Kv k="Kind" v={humanize(selInv.kind)} />
        <Kv k="Amount" v={money(selInv.amountPaise, selInv.currency)} />
        <Kv k="GST" v={`${selInv.gstPct}%`} />
        <Kv k="Issued by" v={selInv.issuedByEntity} />
        <Kv k="Issued" v={date(selInv.issuedOn)} />
        <Kv k="Due" v={selInv.overdueDays ? <Alert>{date(selInv.dueOn)} · {selInv.overdueDays}d late</Alert> : date(selInv.dueOn)} />
        {selInv.lateFeePaise ? <Kv k="Late fee" v={money(selInv.lateFeePaise, selInv.currency)} /> : null}
        <Kv k="Status" v={humanize(selInv.displayStatus)} />
        <Kv k="Paid" v={selInv.paidOn ? `${date(selInv.paidOn)} · ${money(selInv.paidAmountPaise, selInv.currency)}` : "—"} />
        <Kv k="Reference" v={selInv.reference ?? "—"} />
      </Kvs>
      <div className="mt-3 flex gap-2 flex-wrap">
        {canWrite ? <InvoiceActions inv={selInv} today={t} /> : null}
        <Link href={`/deals/${selInv.dealId}?step=money`} className="h-7 px-2.5 text-[12px] inline-flex items-center text-fg-2 hover:text-fg hover:bg-block">
          Open deal
        </Link>
      </div>
    </>
  ) : selPay ? (
    <>
      <InspectorTitle sub={`${selPay.brand} · ${selPay.dealTitle}`}>{selPay.creator}</InspectorTitle>
      <Kvs>
        <Kv k="Kind" v={PAYOUT_LABEL[selPay.kind]} />
        <Kv k="Amount" v={money(selPay.amountPaise, selPay.currency)} />
        <Kv k="TDS" v={`${selPay.tdsPct}%`} />
        <Kv k="From receipt" v={selPay.invoiceNumber ?? "—"} />
        <Kv k="Due" v={selPay.overdueDays ? <Alert>{date(selPay.dueOn)} · {selPay.overdueDays}d late</Alert> : date(selPay.dueOn)} />
        <Kv k="Status" v={humanize(selPay.status)} />
        <Kv k="Paid" v={selPay.paidOn ? date(selPay.paidOn) : "—"} />
        <Kv k="Reference" v={selPay.reference ?? "—"} />
      </Kvs>
      <div className="mt-3 flex gap-2 flex-wrap">
        {canWrite ? <PayoutActions p={{ id: selPay.id, status: selPay.status, creatorName: selPay.creator }} today={t} /> : null}
        <Link href={`/deals/${selPay.dealId}?step=money`} className="h-7 px-2.5 text-[12px] inline-flex items-center text-fg-2 hover:text-fg hover:bg-block">
          Open deal
        </Link>
      </div>
    </>
  ) : undefined;

  const main = (
    <div className="flex flex-col min-h-screen">
      <ScreenHeader
        title="Money"
        number={totals.overduePaise ? moneyShort(totals.overduePaise) : undefined}
        numberCaption={totals.overduePaise ? `${totals.overdueCount} overdue` : undefined}
        action={
          <form action="/api/money/export" method="get" className="flex gap-1 items-center">
            <Input type="month" name="month" defaultValue={month} aria-label="Month" className="w-[150px]" />
            <Button type="submit" variant="primary">
              Export CSV
            </Button>
          </form>
        }
      >
        <span className="t-caption">{canWrite ? "Invoices by OWLED · payouts from receipts" : "Read only"}</span>
      </ScreenHeader>
      <div className="px-5 py-3 flex items-center gap-3 flex-wrap border-b border-rule">
        <SegmentedControl
          param="view"
          value={view}
          options={[
            { value: "invoices", label: "Invoices" },
            { value: "payouts", label: "Payouts" },
          ]}
        />
        <SegmentedControl
          param="f"
          size="sm"
          value={view === "invoices" ? invFilter : payFilter}
          options={
            view === "invoices"
              ? [
                  { value: "open", label: "Open" },
                  { value: "overdue", label: "Overdue" },
                  { value: "paid", label: "Paid" },
                  { value: "all", label: "All" },
                ]
              : [
                  { value: "due", label: "Due" },
                  { value: "overdue", label: "Overdue" },
                  { value: "paid", label: "Paid" },
                  { value: "all", label: "All" },
                ]
          }
        />
      </div>
      <KeyRows className="flex-1">
        {view === "invoices" ? (
          invoices.length ? (
            <Table>
              <THead>
                <TH>Number</TH>
                <TH>Brand</TH>
                <TH>Deal</TH>
                <TH>Kind</TH>
                <TH align="right">Amount</TH>
                <TH>Due</TH>
                <TH align="right">Overdue</TH>
                <TH>Status</TH>
              </THead>
              <tbody>
                {invoices.map((i) => (
                  <TR key={i.id} href={selHref(base, spPlain, i.id)} selected={i.id === sp.sel}>
                    <TD>{i.number}</TD>
                    <TD>{i.brand}</TD>
                    <TD className="max-w-[260px] truncate">{i.dealTitle}</TD>
                    <TD>{humanize(i.kind)}</TD>
                    <TD align="right">{money(i.amountPaise, i.currency)}</TD>
                    <TD className="whitespace-nowrap">{date(i.dueOn)}</TD>
                    <TD align="right">{i.overdueDays ? <Alert>{i.overdueDays}d</Alert> : "—"}</TD>
                    <TD>{humanize(i.displayStatus)}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState>No invoices here.</EmptyState>
          )
        ) : payouts.length ? (
          <Table>
            <THead>
              <TH>Creator</TH>
              <TH>Deal</TH>
              <TH>Kind</TH>
              <TH align="right">Amount</TH>
              <TH>Due</TH>
              <TH align="right">Overdue</TH>
              <TH>Status</TH>
            </THead>
            <tbody>
              {payouts.map((p) => (
                <TR key={p.id} href={selHref(base, spPlain, p.id)} selected={p.id === sp.sel}>
                  <TD>{p.creator}</TD>
                  <TD className="max-w-[260px] truncate">{p.dealTitle}</TD>
                  <TD>{PAYOUT_LABEL[p.kind]}</TD>
                  <TD align="right">{money(p.amountPaise, p.currency)}</TD>
                  <TD className="whitespace-nowrap">{date(p.dueOn)}</TD>
                  <TD align="right">{p.overdueDays ? <Alert>{p.overdueDays}d</Alert> : "—"}</TD>
                  <TD>{humanize(p.status)}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>No payouts here.</EmptyState>
        )}
      </KeyRows>
      <footer className="px-5 py-3 border-t border-rule mt-auto">
        <Caption>
          Outstanding <span className="text-fg num">{moneyShort(totals.outstandingPaise)}</span> · Collected <span className="text-fg num">{moneyShort(totals.collectedPaise)}</span> · Payouts due{" "}
          <span className="text-fg num">{moneyShort(totals.payoutsDuePaise)}</span> · Paid out <span className="text-fg num">{moneyShort(totals.payoutsPaidPaise)}</span>
        </Caption>
      </footer>
    </div>
  );

  return <WithInspector main={main} inspector={inspector} closeHref={selHref(base, spPlain, null)} />;
}
