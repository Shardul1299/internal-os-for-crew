// Deal record steps: Quote → Terms → Signature & PO (BRIEF §5.2, §5.3, §10).
import Link from "next/link";
import { Section, Field, Input, Select, Toggle, NumberField, Caption, Kv, Kvs, Table, THead, TH, TR, TD, EmptyState, Markdown, ButtonLink } from "@/components/ui";
import { ActionForm, ActionButton, SubmitButton } from "@/components/ui/client";
import { saveTerms, generateSow, saveSignature } from "@/lib/actions/deals";
import { removeQuoteLine, saveCaseByCaseLine } from "@/lib/actions/quotes";
import { hasOverride, isAtLeast } from "@/lib/rules/deals";
import { defaultRung } from "@/lib/rules/ladder";
import type { RungKey } from "@/lib/rules/config";
import { money, RUNG_LABEL, humanize, date } from "@/lib/format";
import type { DealRecord } from "@/lib/queries/deals";
import { QuoteLineSheet } from "./QuoteLineSheet";
import { UsageRows } from "./UsageRows";
import { FormSheet } from "./FormSheet";
import { FieldGroup } from "./FieldGroup";

export function QuoteStep({ rec, canWrite }: { rec: DealRecord; canWrite: boolean }) {
  const { deal, cfg, lines, creators, facts } = rec;
  const locked = isAtLeast(deal.stage, "signed") || deal.stage === "declined" || deal.stage === "lost";
  const editable = canWrite && !locked;
  const pickable = creators.filter((c) => c.status !== "declined_by_creator").map((c) => ({ id: c.id, name: c.name }));
  const excl = deal.exclusivity.scope !== "none";
  const defaultRungs: Record<string, RungKey> = Object.fromEntries(creators.map((c) => [c.id, defaultRung(deal.type, { exclusivity: excl, usualClose: rec.usualClose[c.id] })]));
  const belowOv = hasOverride(facts, "below_lucrative");
  const addonLabel = (k: string) => cfg.addons.find((a) => a.key === k)?.label ?? k;
  const shared = { cfg, dealId: deal.id, creators: pickable, standards: rec.standards, defaultRungs, belowLucrativeOverride: belowOv };
  return (
    <>
      <Section
        title="Quote"
        flush
        aside={deal.type ? `${humanize(deal.type)} opens at ${RUNG_LABEL[defaultRung(deal.type, { exclusivity: excl })]}${excl ? " · exclusivity" : ""}` : undefined}
      >
        {lines.length ? (
          <Table>
            <THead>
              <TH>Creator</TH>
              <TH>Deliverable</TH>
              <TH align="right">Standard</TH>
              <TH align="right">Qty</TH>
              <TH>Rung</TH>
              <TH>Add-ons</TH>
              <TH align="right">Total</TH>
              <TH> </TH>
            </THead>
            <tbody>
              {lines.map((l) => (
                <TR key={l.id}>
                  <TD>{l.creatorName}</TD>
                  <TD>{l.isCaseByCase ? (l.note ?? "Revision — case by case") : (cfg.deliverables.find((d) => d.key === l.deliverableKey)?.label ?? l.deliverableKey)}</TD>
                  <TD align="right">
                    {l.isCaseByCase ? "—" : money(l.standardPaise)}
                    {l.standardIsDefault && !l.isCaseByCase ? <span className="t-caption"> default</span> : null}
                  </TD>
                  <TD align="right">{l.qty}</TD>
                  <TD>{l.isCaseByCase ? "Case by case" : <span className={l.manualTotalPaise != null ? "text-fg-3" : undefined}>{RUNG_LABEL[l.rung]}</span>}</TD>
                  <TD className="text-fg-2 max-w-[220px] truncate">{l.addons.length ? l.addons.map((a) => addonLabel(a.key)).join(", ") : "—"}</TD>
                  <TD align="right">
                    {money(l.totalPaise, deal.currency)}
                    {l.manualTotalPaise != null && !l.isCaseByCase ? <span className="t-caption block">hand price</span> : null}
                  </TD>
                  <TD align="right">
                    {editable ? (
                      <span className="inline-flex gap-1">
                        {!l.isCaseByCase ? (
                          <QuoteLineSheet
                            {...shared}
                            title="Edit line"
                            trigger="Edit"
                            triggerVariant="quiet"
                            draft={{
                              lineId: l.id,
                              creatorId: l.creatorId,
                              deliverableKey: l.deliverableKey,
                              qty: l.qty,
                              rung: l.rung,
                              addons: l.addons.map((a) => a.key),
                              manualRupees: l.manualTotalPaise != null ? l.manualTotalPaise / 100 : null,
                              note: l.note,
                            }}
                          />
                        ) : null}
                        <ActionButton action={removeQuoteLine} fields={{ lineId: l.id }} variant="quiet">
                          Remove
                        </ActionButton>
                      </span>
                    ) : null}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>No lines yet.</EmptyState>
        )}
        {editable && pickable.length ? (
          <div className="px-5 pt-3 flex gap-2 flex-wrap">
            <QuoteLineSheet {...shared} title="Add line" trigger="Add line" triggerVariant="plain" />
            <FormSheet title="Revision — case by case" trigger="Revision — case by case" action={saveCaseByCaseLine} fields={{ dealId: deal.id }} submit="Add revision line">
              <Field label="Creator">
                <Select name="creatorId">
                  {pickable.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Revision">
                <Input name="note" required placeholder="Round 3 on reel 2" />
              </Field>
              <Field label="Price">
                <NumberField name="priceRupees" unit="₹" min={0} step={1} required />
              </Field>
            </FormSheet>
          </div>
        ) : null}
        {editable && !pickable.length ? (
          <div className="px-5 pt-2">
            <Caption>
              Match a creator first. <Link href={`/deals/${deal.id}?step=match`} className="underline underline-offset-2">Match</Link>
            </Caption>
          </div>
        ) : null}
      </Section>
      {lines.length ? (
        <Section title="Split" aside={`Commission ${rec.commission}% · ${humanize(deal.origin)}`}>
          <Kvs>
            <Kv k="Quote total" v={<span className="num font-semibold">{money(rec.quoteTotal, deal.currency)}</span>} />
            {rec.splits.map((sp) => (
              <Kv
                key={sp.creatorId}
                k={creators.find((c) => c.id === sp.creatorId)?.name ?? "—"}
                v={
                  <span className="num">
                    {money(sp.creatorSharePaise, deal.currency)} creator · {money(sp.crewCommissionPaise, deal.currency)} Crew{sp.role === "upsell" ? " · upsell" : ""}
                  </span>
                }
              />
            ))}
            <Kv k="Exclusivity" v={excl ? `${humanize(deal.exclusivity.scope)} · ${deal.exclusivity.days} days · Premium` : "None"} />
            <Kv k="Usage" v={deal.usageRights.length ? deal.usageRights.map((u) => `${humanize(u.kind)} ${u.days}d`).join(", ") : "None"} />
            <Kv k="Ladder" v={deal.ladderVersionId ? (cfg.ladderVersionId === deal.ladderVersionId ? "Current version" : "Earlier version") : "—"} />
          </Kvs>
          <div className="mt-3 flex gap-2">
            <ButtonLink href={`/deals/${deal.id}/quote`} size="sm" prefetch={false}>
              Quote PDF
            </ButtonLink>
          </div>
          <Caption className="mt-2">No bundle discount. Upsell and referral shares come from Crew&apos;s commission.</Caption>
        </Section>
      ) : null}
    </>
  );
}

export function TermsStep({ rec, canWrite }: { rec: DealRecord; canWrite: boolean }) {
  const { deal, cfg } = rec;
  const locked = isAtLeast(deal.stage, "signed") || deal.stage === "declined" || deal.stage === "lost";
  const editable = canWrite && !locked;
  return (
    <>
      <Section title="Terms">
        <ActionForm action={saveTerms}>
          <fieldset disabled={!editable} className="contents">
            <input type="hidden" name="dealId" value={deal.id} />
            <Field label="Signed total" hint={`Quote ${money(rec.quoteTotal, deal.currency)}`}>
              <NumberField name="signedRupees" unit="₹" min={0} step={1} defaultValue={deal.signedTotalPaise != null ? deal.signedTotalPaise / 100 : rec.quoteTotal / 100 || ""} className="max-w-[240px]" />
            </Field>
            <FieldGroup label="Term">
              <span className="flex gap-1 items-center max-w-[360px]">
                <Input type="date" name="termStartsOn" defaultValue={deal.termStartsOn ?? ""} aria-label="Term starts" />
                <span className="text-fg-3">to</span>
                <Input type="date" name="termEndsOn" defaultValue={deal.termEndsOn ?? ""} aria-label="Term ends" />
              </span>
            </FieldGroup>
            <Field label="Pieces per month">
              <NumberField name="piecesPerMonth" min={1} step={1} defaultValue={deal.piecesPerMonth ?? ""} className="max-w-[140px]" />
            </Field>
            <FieldGroup label="Exclusivity" hint="Priced at the Premium rung.">
              <span className="flex gap-1 max-w-[360px]">
                <Select name="exclusivityScope" defaultValue={deal.exclusivity.scope} aria-label="Scope">
                  <option value="none">None</option>
                  <option value="product">Product</option>
                  <option value="category">Category</option>
                </Select>
                <NumberField name="exclusivityDays" unit="days" min={0} step={1} defaultValue={deal.exclusivity.days || ""} aria-label="Days" />
              </span>
            </FieldGroup>
            <FieldGroup label="Usage rights">
              <UsageRows name="usage" initial={deal.usageRights.map((u) => ({ kind: u.kind, days: u.days, channels: u.channels ?? [] }))} maxDays={cfg.n.usage_max_days} disabled={!editable} />
            </FieldGroup>
            <FieldGroup label="Amplification">
              <Toggle name="frontseat" label="Frontseat amplification" description="Five tracked posts with Frontseat as the channel." defaultChecked={deal.frontseatAmplification} />
            </FieldGroup>
            {deal.type === "retainer" ? (
              <FieldGroup label="Pause">
                <Toggle name="pauseUsed" label="Retainer pause used" description={`One ${cfg.n.retainer_pause_days}-day pause a year; exclusivity continues.`} defaultChecked={deal.pauseUsed} />
              </FieldGroup>
            ) : null}
            {editable ? (
              <div className="pt-3">
                <SubmitButton variant="plain">Save terms</SubmitButton>
              </div>
            ) : null}
          </fieldset>
        </ActionForm>
      </Section>
      <Section title="SOW" aside={deal.sowMd ? "Generated" : "Not generated"}>
        <div className="flex gap-2 flex-wrap mb-3">
          {editable ? (
            <ActionButton action={generateSow} fields={{ dealId: deal.id }} size="md">
              Generate SOW
            </ActionButton>
          ) : null}
          {deal.sowMd ? (
            <ButtonLink href={`/deals/${deal.id}/sow`} prefetch={false}>
              Print SOW
            </ButtonLink>
          ) : null}
        </div>
        {deal.sowMd ? (
          <div className="bg-block p-4 max-h-[420px] overflow-y-auto">
            <Markdown source={deal.sowMd} />
          </div>
        ) : null}
      </Section>
    </>
  );
}

export function SignatureStep({ rec, canWrite }: { rec: DealRecord; canWrite: boolean }) {
  const { deal } = rec;
  return (
    <Section title="Signature & PO">
      <ActionForm action={saveSignature}>
        <fieldset disabled={!canWrite} className="contents">
          <input type="hidden" name="dealId" value={deal.id} />
          <Field label="Signed SOW" hint={deal.sowMd ? "Generated from the template." : "Generate the SOW in Terms."}>
            <Input name="sowUrl" type="url" defaultValue={deal.sowUrl ?? ""} placeholder="https://" />
          </Field>
          <Field label="PO reference">
            <Input name="poReference" defaultValue={deal.poReference ?? ""} />
          </Field>
          <Field label="Email confirmation">
            <Input name="confirmationUrl" type="url" defaultValue={deal.confirmationUrl ?? ""} placeholder="https://" />
          </Field>
          <Field label="Confirmation received">
            <Input name="confirmationReceivedOn" type="date" defaultValue={deal.confirmationReceivedAt ? date(deal.confirmationReceivedAt, "yyyy-MM-dd") : ""} className="max-w-[200px]" />
          </Field>
          {canWrite ? (
            <div className="pt-3">
              <SubmitButton variant="plain">Save</SubmitButton>
            </div>
          ) : null}
        </fieldset>
      </ActionForm>
      <Caption className="mt-3">Nothing goes live without signed SOW, PO or confirmation, and the advance.</Caption>
    </Section>
  );
}
