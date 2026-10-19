// Agreement: pilot and partnership dates, exit window, exclusivity (§3.1); pilot → partnership by the Owner (§4).
import { Section, Kvs, Kv, Caption, Field, Input, Select, Toggle, Textarea, EmptyState, Alert } from "@/components/ui";
import { SheetForm } from "../SheetForm";
import { saveAgreement, startPartnership } from "@/lib/actions/creators";
import { canStartPartnership } from "@/lib/rules/creators";
import { canEditAgreement, agreementDisplayStatus, canStartPartnershipNow } from "@/lib/rules/creator-flow";
import type { RulesConfig } from "@/lib/rules/config";
import { date } from "@/lib/format";
import { AGREEMENT_LABEL } from "../labels";
import type { CreatorSummary, creatorAgreement } from "@/lib/queries/creators";

export function AgreementTab({
  summary,
  agreement: a,
  role,
  cfg,
  today,
}: {
  summary: CreatorSummary;
  agreement: Awaited<ReturnType<typeof creatorAgreement>>;
  role: string;
  cfg: RulesConfig;
  today: string;
}) {
  const c = summary.creator;
  if (!a) return <EmptyState>No agreement. It starts with the roster pilot.</EmptyState>;
  const status = agreementDisplayStatus(a, today);
  const editable = canEditAgreement(role).ok && (c.stage === "roster" || c.stage === "alumni");
  const start = canStartPartnershipNow(canStartPartnership(cfg, summary.facts, { role: role as never, today }), a.pilotEndsOn, today);
  const pilotEnded = !!a.pilotEndsOn && a.pilotEndsOn <= today;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2">
      <Section title="Agreement" className="xl:border-r border-rule" aside={editable ? <EditAgreement id={c.id} a={a} /> : undefined}>
        <Kvs>
          <Kv k="Status" v={status === "exit_window_open" ? <Alert>Exit window open</Alert> : AGREEMENT_LABEL[status]} />
          <Kv k="Pilot" v={a.pilotStartedOn ? `${date(a.pilotStartedOn)} – ${date(a.pilotEndsOn)}` : null} />
          <Kv k="Partnership" v={a.partnershipStartedOn ? `${date(a.partnershipStartedOn)} – ${date(a.partnershipEndsOn)}` : null} />
          <Kv k="Exit window" v={a.exitWindowAt ? date(a.exitWindowAt) : null} />
          <Kv k="Exit threshold" v={a.exitThresholdMd ? <span className="whitespace-pre-wrap">{a.exitThresholdMd}</span> : null} />
          <Kv k="Exclusive" v={a.exclusive ? "Yes · Crew is the exclusive seller" : "No"} />
          <Kv
            k="Document"
            v={
              a.agreementUrl ? (
                <a href={a.agreementUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Open agreement
                </a>
              ) : null
            }
          />
        </Kvs>
      </Section>
      {a.status === "pilot" ? (
        <Section title="Partnership">
          <p className="text-fg-2">
            {pilotEnded ? "The pilot has ended." : `The pilot ends ${date(a.pilotEndsOn)}.`} Partnership runs {cfg.n.partnership_months} months, exit window at {cfg.n.exit_window_months}.
          </p>
          <div className="mt-3">
            {start.ok ? (
              <SheetForm
                title="Start partnership"
                trigger="Start partnership"
                action={startPartnership}
                submitLabel="Start partnership"
                consequence="Starts the partnership and schedules the exit-window review. This can't be undone."
                width={460}
              >
                <input type="hidden" name="id" value={c.id} />
              </SheetForm>
            ) : (
              <Caption>{start.reasons[0]}</Caption>
            )}
          </div>
        </Section>
      ) : null}
    </div>
  );
}

function EditAgreement({ id, a }: { id: string; a: NonNullable<Awaited<ReturnType<typeof creatorAgreement>>> }) {
  return (
    <SheetForm title="Edit agreement" trigger="Edit" action={saveAgreement} submitLabel="Save" width={520}>
      <input type="hidden" name="id" value={id} />
      <Field label="Pilot starts">
        <Input name="pilotStartedOn" type="date" defaultValue={a.pilotStartedOn ?? ""} />
      </Field>
      <Field label="Pilot ends">
        <Input name="pilotEndsOn" type="date" defaultValue={a.pilotEndsOn ?? ""} />
      </Field>
      <Field label="Partnership starts">
        <Input name="partnershipStartedOn" type="date" defaultValue={a.partnershipStartedOn ?? ""} />
      </Field>
      <Field label="Partnership ends">
        <Input name="partnershipEndsOn" type="date" defaultValue={a.partnershipEndsOn ?? ""} />
      </Field>
      <Field label="Exit window">
        <Input name="exitWindowAt" type="date" defaultValue={a.exitWindowAt ?? ""} />
      </Field>
      <Field label="Exit threshold">
        <Textarea name="exitThresholdMd" rows={3} defaultValue={a.exitThresholdMd ?? ""} />
      </Field>
      <Field label="Agreement URL">
        <Input name="agreementUrl" type="url" defaultValue={a.agreementUrl ?? ""} placeholder="https://" />
      </Field>
      <Field label="Status">
        <Select name="status" defaultValue={a.status}>
          {Object.entries(AGREEMENT_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Toggle name="exclusive" label="Exclusive" description="Always on while on the roster" defaultChecked={a.exclusive} />
    </SheetForm>
  );
}
