import { redirect } from "next/navigation";
import { requireCrew } from "@/lib/session";
import { getMonthEnd, previousMonth, monthsWithData } from "@/lib/queries/reports";
import { can } from "@/lib/rules/visibility";
import { ScreenHeader, Section, Block, Stat, Caption, Alert, ButtonLink } from "@/components/ui";
import { SegmentedControl } from "@/components/ui/client";
import { PrintButton } from "@/components/program/PrintButton";
import { CountTable, SimpleTable } from "@/components/reports/blocks";
import { money, moneyShort, date, pct, int, STAGE_LABEL, DEAL_STAGE_LABEL, SUB_CATEGORY_LABEL, humanize } from "@/lib/format";

export const metadata = { title: "Month-end" };
export const dynamic = "force-dynamic";

const PAYOUT_LABEL: Record<string, string> = { fee_advance: "Fee — advance", fee_balance: "Fee — balance", upsell_share: "Upsell share", referral_share: "Referral share" };

export default async function MonthEndPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const me = await requireCrew();
  if (!["owner", "crew_lead", "finance_viewer"].includes(me.role)) redirect("/today");
  const sp = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? "") ? sp.month! : previousMonth();
  const [r, months] = await Promise.all([getMonthEnd(month), monthsWithData()]);
  const showTier = can(me.role, "tier");
  const label = date(`${month}-01`, "MMMM yyyy");
  const m = r.money;
  return (
    <>
      <ScreenHeader title="Month-end" number={moneyShort(m.collectedPaise)} numberCaption={`collected in ${date(`${month}-01`, "MMMM")}`} action={<PrintButton label="Print" />}>
        <Caption>
          {label} · generated {date(new Date())} · balances as of {date(r.asOf)}
        </Caption>
      </ScreenHeader>
      <div className="px-5 pt-3 no-print flex items-center justify-between gap-3 flex-wrap">
        <SegmentedControl param="month" value={month} size="sm" options={months.slice(0, 7).reverse().map((k) => ({ value: k, label: date(`${k}-01`, "MMM") }))} />
        <ButtonLink href={`/api/export/payments?month=${month}`} size="sm" variant="quiet" prefetch={false}>
          Payments CSV
        </ButtonLink>
      </div>

      <Section title="Money">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule">
          <Block>
            <Stat label="Signed" value={moneyShort(m.signedPaise)} caption={`${m.signedN} ${m.signedN === 1 ? "deal" : "deals"}`} />
          </Block>
          <Block>
            <Stat label="Collected" value={moneyShort(m.collectedPaise)} caption={`${m.collectedN} ${m.collectedN === 1 ? "invoice" : "invoices"}`} />
          </Block>
          <Block>
            <Stat label="Outstanding" value={moneyShort(m.outstandingPaise)} caption={`${m.outstandingN} ${m.outstandingN === 1 ? "invoice" : "invoices"}`} />
          </Block>
          <Block>
            <Stat label="Overdue" value={moneyShort(m.overduePaise)} caption={m.overdueN ? <Alert>{m.overdueN} overdue</Alert> : "None"} />
          </Block>
        </div>
      </Section>

      <Section title="Roster" aside="As of today">
        <div className={`grid grid-cols-1 ${showTier ? "md:grid-cols-3 print:grid-cols-2" : "md:grid-cols-2"} gap-px bg-rule`}>
          <CountTable title="By stage" rows={r.roster.byStage} labels={STAGE_LABEL} />
          {/* BRIEF: clarify — §10 asks for roster by tier, but tier never appears in a PDF (§0.1 #6): shown on screen to tier roles, omitted from print. */}
          {showTier ? <CountTable title="By tier · roster + incubation" rows={r.roster.byTier} className="no-print" /> : null}
          <CountTable title="Roster by sub-category" rows={r.roster.bySub} labels={SUB_CATEGORY_LABEL} />
        </div>
      </Section>

      <Section title="Pipeline" aside="Open deals today" flush>
        <SimpleTable
          head={[{ label: "Stage" }, { label: "Deals", right: true }, { label: "Value", right: true }]}
          rows={[
            ...r.pipeline.map((p) => [DEAL_STAGE_LABEL[p.stage] ?? p.stage, p.n, money(p.value)]),
            ...(r.pipeline.length ? [[<span key="t" className="text-fg-3">Total</span>, r.pipeline.reduce((t, p) => t + p.n, 0), <strong key="v">{money(r.pipeline.reduce((t, p) => t + p.value, 0))}</strong>]] : []),
          ]}
          empty="No open deals."
        />
      </Section>

      <Section title="Payouts and shares" flush>
        <SimpleTable
          head={[{ label: "Kind" }, { label: "Paid", right: true }, { label: "Paid ₹", right: true }, { label: "Due", right: true }, { label: "Due ₹", right: true }]}
          rows={r.payouts.map((p) => [PAYOUT_LABEL[p.kind], p.paidN, money(p.paidPaise), p.dueN, money(p.duePaise)])}
        />
      </Section>

      <Section title="Declined deals" aside={`${r.declined.length} · ${moneyShort(r.declined.reduce((t, d) => t + (d.valuePaise ?? 0), 0))}`} flush>
        <SimpleTable
          head={[{ label: "Date" }, { label: "Brand" }, { label: "Deal" }, { label: "Reason" }, { label: "Value", right: true }]}
          rows={r.declined.map((d) => [date(d.on), d.brand, d.title, d.reason ?? "—", money(d.valuePaise)])}
          empty="Nothing declined this month."
        />
      </Section>

      <Section title="Framework exceptions" aside={`${r.exceptions.reduce((t, e) => t + e.requested, 0)} overrides`} flush>
        <SimpleTable
          head={[{ label: "Kind" }, { label: "Requested", right: true }, { label: "Approved", right: true }, { label: "Rejected", right: true }, { label: "Pending", right: true }]}
          rows={r.exceptions.map((e) => [humanize(e.kind), e.requested, e.approved, e.rejected, e.pending ? <Alert key="p">{e.pending}</Alert> : 0])}
          empty="No overrides this month."
        />
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Section title="Retention">
          <div className="grid grid-cols-2 gap-px bg-rule">
            <Block>
              <Stat label="Check-in adherence" value={pct(r.retention.adherence)} caption="Held within 14 days of due" />
            </Block>
            <Block>
              <Stat label="12-month churn" value={pct(r.retention.churn)} caption={`${r.retention.churnedN} to alumni · ${r.retention.rosterNow} on roster`} />
            </Block>
            <Block>
              <Stat label="Brand renewals" value={pct(r.retention.renewal)} caption="Brands back after a completed deal" />
            </Block>
            <Block>
              <Stat label="Recurring share" value={pct(r.retention.recurringShare)} caption="Retainer, quarterly, annual vs one-off" />
            </Block>
          </div>
        </Section>
        <Section title="Program">
          <div className="grid grid-cols-3 gap-px bg-rule">
            <Block>
              <Stat label="Cohorts" value={r.program.activeCohorts} caption="Active" />
            </Block>
            <Block>
              <Stat label="Challenges" value={r.program.challenges} caption={`${r.program.entries} entries`} />
            </Block>
            <Block>
              <Stat label="To Tier 0" value={r.program.tier0} caption={`${r.program.revisit} revisit · ${r.program.commissions} commissioned`} />
            </Block>
            <Block className="col-span-3">
              <Stat label="Sunday shoots" value={r.program.shoots} caption={`${r.program.attended} of ${r.program.invited} attended`} />
            </Block>
          </div>
        </Section>
      </div>

      <Section title="AI usage" aside={`${int(r.aiUsage.reduce((t, a) => t + a.tokens, 0))} tokens`} flush>
        <SimpleTable
          head={[{ label: "Creator" }, { label: "Generations", right: true }, { label: "Tokens (est.)", right: true }]}
          rows={r.aiUsage.map((a) => [a.name, a.calls, int(a.tokens)])}
          empty="No AI generations this month."
        />
      </Section>
    </>
  );
}
