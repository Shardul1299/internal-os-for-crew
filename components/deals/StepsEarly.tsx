// Deal record steps: Qualify → Brief → Match (BRIEF §5.2, §10). Server components; forms are server actions.
import Link from "next/link";
import { Section, Field, Input, Select, Textarea, Toggle, NumberField, Caption, Kv, Kvs, Table, THead, TH, TR, TD, EmptyState, Alert } from "@/components/ui";
import { ActionForm, ActionButton, SubmitButton, MarkdownEditor } from "@/components/ui/client";
import { saveQualify, markRiskReviewed, saveBrief, addDealCreator } from "@/lib/actions/deals";
import { CreatorMenu } from "./CreatorMenu";
import { noListFlags, hasOverride } from "@/lib/rules/deals";
import { daysBetween, toISO } from "@/lib/dates";
import { date, money, humanize, SUB_CATEGORY_LABEL, label } from "@/lib/format";
import type { DealRecord } from "@/lib/queries/deals";

const NO_LIST_DESC: Record<string, string> = {
  rev_share_only: "Paid only as a share of revenue.",
  no_budget_educational: "Educational content with no pricing.",
  barter: "Product or access instead of a fee.",
  lifetime_rights: "Usage with no end date.",
  shady_tool: "Misleading claims, data risk or crypto-adjacent.",
};

export function QualifyStep({ rec, canWrite }: { rec: DealRecord; canWrite: boolean }) {
  const { deal, brand, cfg, facts } = rec;
  const nl = deal.noListCheck;
  const flags = nl ? noListFlags(nl) : [];
  const override = hasOverride(facts, "no_list");
  const riskAt = toISO(brand.riskReviewedAt);
  const riskAge = riskAt ? daysBetween(riskAt, rec.today) : null;
  const riskOk = riskAge != null && riskAge <= cfg.n.risk_review_days;
  const locked = deal.stage !== "lead" && deal.stage !== "qualified";
  return (
    <>
      <Section title="Brand risk">
        <Kvs>
          <Kv k="Brand" v={<Link href={`/brands/${brand.id}`} className="underline underline-offset-2">{brand.name}</Link>} />
          <Kv k="Owner team" v={humanize(brand.ownerTeam)} />
          <Kv k="Risk flags" v={brand.riskFlags.length ? brand.riskFlags.join(", ") : "None"} />
          <Kv
            k="Reviewed"
            v={riskAt ? <span>{riskOk ? date(riskAt) : <Alert>Review due · {date(riskAt)}</Alert>}{rec.names.get(brand.riskReviewedBy ?? "") ? ` · ${rec.names.get(brand.riskReviewedBy ?? "")}` : ""}</span> : <Alert>Never reviewed</Alert>}
          />
        </Kvs>
        {canWrite && !locked ? (
          <div className="mt-2">
            <ActionButton action={markRiskReviewed} fields={{ dealId: deal.id, brandId: brand.id }}>
              Mark risk reviewed
            </ActionButton>
          </div>
        ) : null}
      </Section>
      <Section title="NO list" aside={nl ? `Checked ${date(nl.checked_at)}${rec.names.get(nl.checked_by) ? ` · ${rec.names.get(nl.checked_by)}` : ""}` : "Not checked"}>
        <ActionForm action={saveQualify}>
          <fieldset disabled={!canWrite || locked} className="contents">
            <input type="hidden" name="dealId" value={deal.id} />
            <div className="grid sm:grid-cols-2 gap-x-6">
              {cfg.noList.map((n) => (
                <Toggle key={n.key} name={n.key} label={n.label} description={NO_LIST_DESC[n.key]} defaultChecked={!!nl?.[n.key as keyof typeof nl]} />
              ))}
            </div>
            <Field label="Blocklist category">
              <Select name="blocklist_category" defaultValue={nl?.blocklist_category ?? ""}>
                <option value="">None</option>
                {cfg.blocklist.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </Select>
            </Field>
            {nl ? (
              <div className="py-2">
                {flags.length ? (
                  <Caption tone="alert">
                    <Alert>Flagged: {flags.join(", ")}</Alert> — {override ? "Owner override approved." : <Link href={`/deals/${deal.id}?step=overrides`} className="underline underline-offset-2">needs Owner override</Link>}
                  </Caption>
                ) : (
                  <Caption>Passed.</Caption>
                )}
              </div>
            ) : null}
            <div className="pt-4">
              <div className="t-label mb-1">Deal</div>
              <Field label="Type" hint="One-off opens at Pitch. Push a 3-month pilot.">
                <Select name="type" defaultValue={deal.type ?? "pilot"}>
                  <option value="pilot">Pilot</option>
                  <option value="retainer">Retainer</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="one_off">One-off</option>
                </Select>
              </Field>
              <Field label="One-off reason">
                <Input name="oneOffReason" defaultValue={deal.oneOffReason ?? ""} placeholder="Required for one-off" />
              </Field>
              {rec.lines.length ? (
                <Field label="Quoted value">
                  <span className="h-9 flex items-center num">{money(rec.quoteTotal, deal.currency)}</span>
                </Field>
              ) : (
                <Field label="Expected value" hint={deal.quotedTotalPaise < cfg.n.min_deal_paise ? "Below the ₹25K minimum." : undefined}>
                  <NumberField name="expectedRupees" unit="₹" min={0} step={1000} defaultValue={deal.quotedTotalPaise / 100} className="max-w-[240px]" />
                </Field>
              )}
              {brand.ownerTeam === "owled_social" ? (
                <Field label="Referral note" hint="OWLED Social brand routes through Crew.">
                  <Textarea name="referralNote" rows={2} defaultValue={deal.referralNote ?? ""} />
                </Field>
              ) : null}
            </div>
            {canWrite && !locked ? (
              <div className="pt-3">
                <SubmitButton variant="plain">Save check</SubmitButton>
              </div>
            ) : null}
          </fieldset>
        </ActionForm>
      </Section>
    </>
  );
}

export function BriefStep({ rec, canWrite }: { rec: DealRecord; canWrite: boolean }) {
  const { deal } = rec;
  return (
    <Section title="Brief">
      <ActionForm action={saveBrief}>
        <fieldset disabled={!canWrite} className="contents">
          <input type="hidden" name="dealId" value={deal.id} />
          <div className="py-1">
            <MarkdownEditor name="briefMd" defaultValue={deal.briefMd ?? ""} rows={10} placeholder="What the brand wants, in their words." />
          </div>
          <Field label="Brief URL">
            <Input name="briefUrl" type="url" defaultValue={deal.briefUrl ?? ""} placeholder="https://" />
          </Field>
          <Field label="Brief tags" hint="Checked against each creator's topic filter.">
            <Input name="briefTags" defaultValue={deal.briefTags.join(", ")} placeholder="agents, productivity" />
          </Field>
          {canWrite ? (
            <div className="pt-3">
              <SubmitButton variant="plain">Save brief</SubmitButton>
            </div>
          ) : null}
        </fieldset>
      </ActionForm>
    </Section>
  );
}


export function MatchStep({ rec, canWrite }: { rec: DealRecord; canWrite: boolean }) {
  const { deal, creators, candidates } = rec;
  const inbound = deal.origin === "creator_inbound";
  const hasUpsell = creators.some((c) => c.role === "upsell");
  return (
    <>
      <Section title="On this deal" flush aside={`${creators.filter((c) => c.status === "accepted").length} accepted`}>
        {creators.length ? (
          <Table>
            <THead>
              <TH>Creator</TH>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH align="right">Filter</TH>
              <TH>Topic filter</TH>
            </THead>
            <tbody>
              {creators.map((c) => (
                <TR key={c.linkId}>
                  <TD>
                    <Link href={`/creators/${c.id}`} className="hover:underline underline-offset-2">{c.name}</Link>
                    {c.stage !== "roster" ? <span className="t-caption"> · Tier 0</span> : null}
                    {c.id === deal.originatingCreatorId ? <span className="t-caption"> · brought it</span> : null}
                  </TD>
                  <TD>{humanize(c.role)}</TD>
                  <TD>
                    {canWrite ? (
                      <CreatorMenu linkId={c.linkId} status={c.status} role={c.role} canSwapRole={!inbound || c.id !== deal.originatingCreatorId} />
                    ) : c.status === "declined_by_creator" ? (
                      "Declined"
                    ) : (
                      humanize(c.status)
                    )}
                  </TD>
                  <TD align="right">{c.filterTotal ?? "—"}</TD>
                  <TD>{c.conflicts.length ? <Alert>{c.conflicts.join(", ")}</Alert> : <span className="text-fg-3">Clear</span>}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>No creators yet.</EmptyState>
        )}
      </Section>
      {inbound && !hasUpsell ? (
        <Section>
          <Caption tone="warn">Upsell with other roster creators in the requirement band?</Caption>
        </Section>
      ) : null}
      {canWrite ? (
        <Section title="Roster" flush aside={rec.t0Override ? "Tier 0 allowed by override" : "Roster only"}>
          {candidates.length ? (
            <Table>
              <THead>
                <TH>Creator</TH>
                <TH>Sub-category</TH>
                <TH align="right">Filter</TH>
                <TH>Topic filter</TH>
                <TH align="right">Sponsored room</TH>
                <TH> </TH>
              </THead>
              <tbody>
                {candidates.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      {c.name}
                      {c.stage === "incubation" ? <span className="t-caption"> · Tier 0</span> : null}
                      {inbound && c.inBand ? <span className="t-caption"> · in band</span> : null}
                    </TD>
                    <TD>{label(SUB_CATEGORY_LABEL, c.subCategory)}</TD>
                    <TD align="right">{c.filterTotal ?? "—"}</TD>
                    <TD>{c.conflicts.length ? <Alert>{c.conflicts[0]}</Alert> : <span className="text-fg-3">Clear</span>}</TD>
                    <TD align="right">{c.headroom === 0 ? <Alert>0 this month</Alert> : Number.isFinite(c.headroom) ? `${c.headroom} this month` : "Open"}</TD>
                    <TD align="right">
                      <ActionButton action={addDealCreator} fields={{ dealId: deal.id, creatorId: c.id, role: inbound ? "upsell" : "primary" }}>
                        {inbound ? "Add as upsell" : "Propose"}
                      </ActionButton>
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState>No other roster creators.</EmptyState>
          )}
        </Section>
      ) : null}
    </>
  );
}

