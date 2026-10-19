// Deal record steps: Money → Delivery → Report & close, plus Overrides and Activity (BRIEF §3.6, §5.2, §10).
import Link from "next/link";
import { Section, Field, Input, Select, Textarea, Caption, Kv, Kvs, Table, THead, TH, TR, TD, EmptyState, Alert, Markdown } from "@/components/ui";
import { ActionForm, ActionButton, SubmitButton } from "@/components/ui/client";
import { saveReport, requestFeedback, requestOverride, decideOverride, addNote } from "@/lib/actions/deals";
import { createAdvanceInvoice, createBalanceInvoice } from "@/lib/actions/money";
import { canIssueAdvance, canIssueBalance } from "@/lib/rules/money";
import { canApproveOverride, canRequestOverride, stageIndex } from "@/lib/rules/deals";
import { money, date, dateTime, humanize } from "@/lib/format";
import type { DealRecord } from "@/lib/queries/deals";
import { InvoiceActions, PayoutActions } from "@/components/money/MoneyActions";

const PAYOUT_LABEL: Record<string, string> = { fee_advance: "Fee · advance", fee_balance: "Fee · balance", upsell_share: "Upsell share", referral_share: "Referral share" };

export function MoneyStep({ rec, canWriteMoney, canSeeMoney }: { rec: DealRecord; canWriteMoney: boolean; canSeeMoney: boolean }) {
  const { deal, invoices, payouts, ledger: l, overdue } = rec;
  if (!canSeeMoney) return <EmptyState>Money is visible to Ops, Finance and the leads.</EmptyState>;
  const adv = invoices.filter((i) => i.kind === "advance" && i.status !== "void");
  const bal = invoices.filter((i) => i.kind === "balance" && i.status !== "void");
  const advGate = canIssueAdvance({ stageIndex: stageIndex(deal.stage), signedIndex: stageIndex("signed"), signedTotalPaise: deal.signedTotalPaise, hasAdvance: adv.length > 0 });
  const balGate = canIssueBalance({ completed: !!rec.campaign?.completedAt, signedTotalPaise: deal.signedTotalPaise, hasBalance: bal.length > 0 });
  const cur = deal.currency;
  return (
    <>
      <Section title="Ledger" aside={deal.signedTotalPaise ? `Signed ${money(deal.signedTotalPaise, cur)}` : "Not signed"}>
        <div className="grid sm:grid-cols-2 gap-x-8">
          <Kvs>
            <Kv k="Advance" v={<span className="num">{money(l.advanceReceived, cur)} of {money(l.advanceDue, cur)}</span>} />
            <Kv k="Balance" v={<span className="num">{money(l.balanceReceived, cur)} of {money(l.balanceDue, cur)}</span>} />
            <Kv k="Overdue" v={l.overdueDays ? <Alert>{l.overdueDays} days</Alert> : "None"} />
          </Kvs>
          <Kvs>
            <Kv k="Payouts due" v={<span className="num">{money(l.payoutsDue, cur)}</span>} />
            <Kv k="Payouts paid" v={<span className="num">{money(l.payoutsPaid, cur)}</span>} />
            <Kv k="Crew commission" v={<span className="num">{money(l.commissionEarned, cur)} · {rec.commission}%</span>} />
            <Kv k="Shares paid" v={<span className="num">{money(l.sharesPaid, cur)}</span>} />
          </Kvs>
        </div>
      </Section>
      <Section title="Invoices" flush>
        {invoices.length ? (
          <Table>
            <THead>
              <TH>Number</TH>
              <TH>Kind</TH>
              <TH align="right">Amount</TH>
              <TH>Issued</TH>
              <TH>Due</TH>
              <TH>Status</TH>
              <TH>Paid</TH>
              <TH> </TH>
            </THead>
            <tbody>
              {invoices.map((i) => {
                const od = overdue.find((o) => o.id === i.id);
                return (
                  <TR key={i.id}>
                    <TD>{i.number}</TD>
                    <TD>{humanize(i.kind)}</TD>
                    <TD align="right">{money(i.amountPaise, i.currency)}</TD>
                    <TD className="whitespace-nowrap">{date(i.issuedOn)}</TD>
                    <TD className="whitespace-nowrap">{date(i.dueOn)}</TD>
                    <TD>
                      {od && i.status !== "draft" ? (
                        <span>
                          <Alert>Overdue {od.days}d</Alert>
                          <span className="t-caption block">late fee {money(od.lateFeePaise, i.currency)}</span>
                        </span>
                      ) : (
                        humanize(i.status)
                      )}
                    </TD>
                    <TD className="whitespace-nowrap">{i.paidOn ? `${date(i.paidOn)} · ${money(i.paidAmountPaise, i.currency)}` : "—"}</TD>
                    <TD align="right">{canWriteMoney ? <InvoiceActions inv={i} today={rec.today} /> : null}</TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <EmptyState>No invoices yet.</EmptyState>
        )}
        {canWriteMoney ? (
          <div className="px-5 pt-3 flex gap-2 flex-wrap items-start">
            {!adv.length ? (
              advGate.ok ? (
                <ActionButton action={createAdvanceInvoice} fields={{ dealId: deal.id }} size="md">
                  Create advance invoice
                </ActionButton>
              ) : (
                <Caption>Advance invoice: {advGate.reasons[0]}</Caption>
              )
            ) : null}
            {adv.length && !bal.length ? (
              balGate.ok ? (
                <ActionButton action={createBalanceInvoice} fields={{ dealId: deal.id }} size="md">
                  Issue balance invoice
                </ActionButton>
              ) : (
                <Caption>Balance invoice issues at completion.</Caption>
              )
            ) : null}
          </div>
        ) : null}
      </Section>
      <Section title="Creator payouts" flush aside="From receipts only">
        {payouts.length ? (
          <Table>
            <THead>
              <TH>Creator</TH>
              <TH>Kind</TH>
              <TH align="right">Amount</TH>
              <TH>Due</TH>
              <TH>Status</TH>
              <TH>Reference</TH>
              <TH> </TH>
            </THead>
            <tbody>
              {payouts.map((p) => {
                const late = p.status !== "paid" && p.dueOn < rec.today;
                return (
                  <TR key={p.id}>
                    <TD className="whitespace-nowrap">{p.creatorName}</TD>
                    <TD>{PAYOUT_LABEL[p.kind]}</TD>
                    <TD align="right">{money(p.amountPaise, p.currency)}</TD>
                    <TD className="whitespace-nowrap">{late ? <Alert>{date(p.dueOn)}</Alert> : date(p.dueOn)}</TD>
                    <TD>{humanize(p.status)}</TD>
                    <TD className="text-fg-2">{p.reference ?? "—"}</TD>
                    <TD align="right">{canWriteMoney ? <PayoutActions p={p} today={rec.today} /> : null}</TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <EmptyState>No payouts yet. They follow receipts.</EmptyState>
        )}
      </Section>
    </>
  );
}

export function DeliveryStep({ rec }: { rec: DealRecord }) {
  const { campaign, deliverables } = rec;
  if (!campaign) return <EmptyState>The campaign is created at In production.</EmptyState>;
  return (
    <Section
      title={campaign.name}
      flush
      aside={
        <Link href={`/campaigns/${campaign.id}`} className="underline underline-offset-2">
          Open campaign
        </Link>
      }
    >
      {deliverables.length ? (
        <Table>
          <THead>
            <TH>Creator</TH>
            <TH>Deliverable</TH>
            <TH>Platform</TH>
            <TH>Due</TH>
            <TH>Status</TH>
            <TH>Blocker</TH>
          </THead>
          <tbody>
            {deliverables.map((d) => (
              <TR key={d.id} href={`/campaigns/${campaign.id}?sel=${d.id}`}>
                <TD className="whitespace-nowrap">{d.creatorName}</TD>
                <TD>
                  {d.title}
                  {d.channel === "frontseat" ? <span className="t-caption"> · Frontseat</span> : null}
                </TD>
                <TD>{humanize(d.platform)}</TD>
                <TD className="whitespace-nowrap">{date(d.dueOn)}</TD>
                <TD>{humanize(d.status)}</TD>
                <TD className="max-w-[280px] truncate">
                  {d.blockers[0] ? <span className="text-fg-2">{d.blockers[0]}</span> : <span className="text-fg-3">{d.warnings[0] ?? d.storedWarnings[0] ?? "—"}</span>}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState>No deliverables.</EmptyState>
      )}
    </Section>
  );
}

export function ReportStep({ rec, canWrite }: { rec: DealRecord; canWrite: boolean }) {
  const { deal, campaign, payouts, invoices } = rec;
  const bal = invoices.find((i) => i.kind === "balance" && i.status !== "void");
  const paid = payouts.filter((p) => p.status === "paid").length;
  return (
    <>
      <Section title="Report & close">
        <Kvs>
          <Kv k="Report" v={deal.reportUrl ? <a href={deal.reportUrl} className="underline underline-offset-2" target="_blank" rel="noreferrer">Link</a> : campaign?.reportMd ? "Written in the campaign" : <Alert>Missing</Alert>} />
          <Kv k="Feedback" v={campaign?.feedbackRequestedAt ? `Requested ${date(campaign.feedbackRequestedAt)}` : <Alert>Not requested</Alert>} />
          <Kv k="Completed" v={campaign?.completedAt ? date(campaign.completedAt) : "—"} />
          <Kv k="Balance" v={bal ? `${bal.number} · ${humanize(bal.status)}` : "Issued at Reported"} />
          <Kv k="Payouts" v={payouts.length ? `${paid} of ${payouts.length} paid` : "None yet"} />
        </Kvs>
        {canWrite ? (
          <div className="mt-4 space-y-3">
            <ActionForm action={saveReport} className="flex gap-1 items-start max-w-[560px]">
              <input type="hidden" name="dealId" value={deal.id} />
              <Input name="reportUrl" type="url" defaultValue={deal.reportUrl ?? ""} placeholder="Report link, https://" aria-label="Report link" />
              <SubmitButton variant="plain">Save</SubmitButton>
            </ActionForm>
            {campaign && !campaign.feedbackRequestedAt ? (
              <ActionButton action={requestFeedback} fields={{ dealId: deal.id }} size="md">
                Request feedback
              </ActionButton>
            ) : null}
          </div>
        ) : null}
      </Section>
      {campaign?.reportMd ? (
        <Section title="Report">
          <Markdown source={campaign.reportMd} />
        </Section>
      ) : null}
      {deal.stage === "reported" ? (
        <Section>
          <Caption>{rec.blocker ? `To close: ${rec.blocker}` : "Ready to move to Paid."}</Caption>
        </Section>
      ) : null}
    </>
  );
}

const OVERRIDE_LABEL: Record<string, string> = {
  no_list: "NO list",
  below_lucrative: "Below Lucrative",
  tier0_in_deal: "Tier 0 in deal",
  go_live_without_advance: "Live without advance",
  go_live_without_po: "Live without PO",
  min_deal: "Below minimum",
  other: "Other",
};

export function OverridesStep({ rec, role }: { rec: DealRecord; role: string }) {
  const { deal, overrides, names } = rec;
  const canApprove = canApproveOverride(role).ok;
  const canRequest = canRequestOverride(role, "x").ok;
  return (
    <>
      <Section title="Overrides" flush aside="Owner approves · logged and counted">
        {overrides.length ? (
          <Table>
            <THead>
              <TH>Kind</TH>
              <TH>Reason</TH>
              <TH>Requested</TH>
              <TH>Decision</TH>
              <TH> </TH>
            </THead>
            <tbody>
              {overrides.map((o) => (
                <TR key={o.id}>
                  <TD>{OVERRIDE_LABEL[o.kind]}</TD>
                  <TD className="max-w-[300px]">{o.reason}</TD>
                  <TD className="text-fg-2">
                    {names.get(o.requestedBy) ?? "—"} · {date(o.createdAt)}
                  </TD>
                  <TD>
                    {o.approvedAt ? (
                      `Approved · ${names.get(o.approvedBy ?? "") ?? "—"} · ${date(o.approvedAt)}`
                    ) : o.rejectedAt ? (
                      `Rejected · ${names.get(o.approvedBy ?? "") ?? "—"} · ${date(o.rejectedAt)}`
                    ) : (
                      <Alert>Pending</Alert>
                    )}
                  </TD>
                  <TD align="right">
                    {canApprove && !o.approvedAt && !o.rejectedAt ? (
                      <span className="inline-flex gap-1">
                        <ActionButton action={decideOverride} fields={{ overrideId: o.id, decision: "approve" }} variant="primary">
                          Approve
                        </ActionButton>
                        <ActionButton action={decideOverride} fields={{ overrideId: o.id, decision: "reject" }} variant="quiet">
                          Reject
                        </ActionButton>
                      </span>
                    ) : null}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>No overrides.</EmptyState>
        )}
      </Section>
      {canRequest ? (
        <Section title="Request">
          <ActionForm action={requestOverride} resetOnSuccess>
            <input type="hidden" name="dealId" value={deal.id} />
            <Field label="Kind">
              <Select name="kind" defaultValue="no_list">
                {Object.entries(OVERRIDE_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Reason">
              <Textarea name="reason" rows={3} required />
            </Field>
            <div className="pt-3">
              <SubmitButton variant="plain">Request override</SubmitButton>
            </div>
          </ActionForm>
        </Section>
      ) : null}
    </>
  );
}

export function ActivityPane({ rec, canNote }: { rec: DealRecord; canNote: boolean }) {
  const { activity, names, deal } = rec;
  return (
    <div className="pt-2">
      <div className="t-label mb-2">Activity</div>
      {canNote ? (
        <ActionForm action={addNote} resetOnSuccess className="mb-3 space-y-1">
          <input type="hidden" name="dealId" value={deal.id} />
          <Textarea name="body" rows={2} placeholder="Note, call or email" aria-label="Note" />
          <div className="flex gap-1">
            <Select name="kind" defaultValue="note" aria-label="Kind" className="max-w-[110px]">
              <option value="note">Note</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
            </Select>
            <SubmitButton variant="plain">Add note</SubmitButton>
          </div>
        </ActionForm>
      ) : null}
      <ul className="border-t border-rule">
        {activity.map((a) => (
          <li key={a.id} className="py-2 border-b border-rule">
            <div className="t-caption">
              {dateTime(a.at)} · {humanize(a.kind)}
              {a.by ? ` · ${names.get(a.by) ?? ""}` : ""}
            </div>
            <div className={a.kind === "override" ? "text-fg" : "text-fg-2"}>{a.bodyMd}</div>
          </li>
        ))}
        {!activity.length ? <li className="t-caption py-2">Nothing yet.</li> : null}
      </ul>
    </div>
  );
}
