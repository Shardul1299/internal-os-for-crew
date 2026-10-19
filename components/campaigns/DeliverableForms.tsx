"use client";
// Deliverable Inspector forms (Crew side): scheduled date, claims, change requests, details, metrics.
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { Input, Select, Textarea, Toggle, NumberField } from "@/components/ui";
import { saveDeliverable, setScheduledDate, setClaims, requestChangesCrew, saveMetrics } from "@/lib/actions/deliverables";
import { StackField } from "./fields";

export function ScheduleForm({ id, scheduledFor }: { id: string; scheduledFor: string | null }) {
  return (
    <ActionForm action={setScheduledDate} className="flex items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <StackField label="Scheduled for" className="flex-1">
        <Input type="date" name="scheduledFor" defaultValue={scheduledFor ?? ""} />
      </StackField>
      <div className="pb-1">
        <SubmitButton variant="plain">Save</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function ClaimsForm({ id, approved, contactId, contacts }: { id: string; approved: boolean; contactId: string | null; contacts: { id: string; name: string }[] }) {
  return approved ? (
    <ActionForm action={setClaims}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="approved" value="0" />
      <SubmitButton variant="quiet" size="sm">
        Mark pending
      </SubmitButton>
    </ActionForm>
  ) : (
    <ActionForm action={setClaims} className="flex items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="approved" value="1" />
      <StackField label="Approved by" className="flex-1" small>
        <Select name="contactId" defaultValue={contactId ?? contacts[0]?.id ?? ""}>
          {contacts.length === 0 ? <option value="">No contacts</option> : null}
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </StackField>
      <div className="pb-1">
        <SubmitButton variant="plain">Approve</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function RequestChangesForm({ id, round }: { id: string; round: number }) {
  return (
    <ActionForm action={requestChangesCrew} resetOnSuccess>
      <input type="hidden" name="id" value={id} />
      <StackField label={round >= 2 ? "Note · next round is case by case" : "Note"} small>
        <Textarea name="note" rows={2} placeholder="Which claim changes" />
      </StackField>
      <SubmitButton variant="plain" size="sm">
        Request changes
      </SubmitButton>
    </ActionForm>
  );
}

export function DetailsForm({
  d,
}: {
  d: { id: string; title: string; dueOn: string | null; disclosureChecked: boolean; disclosureStandard: string; draftMd: string | null; liveUrl: string | null };
}) {
  return (
    <ActionForm action={saveDeliverable} className="space-y-1">
      <input type="hidden" name="id" value={d.id} />
      <StackField label="Title">
        <Input name="title" defaultValue={d.title} required />
      </StackField>
      <StackField label="Due">
        <Input type="date" name="dueOn" defaultValue={d.dueOn ?? ""} />
      </StackField>
      <Toggle name="disclosureChecked" label="Disclosure checked" defaultChecked={d.disclosureChecked} />
      <StackField label="Disclosure standard">
        <Select name="disclosureStandard" defaultValue={d.disclosureStandard}>
          <option value="asci">ASCI</option>
          <option value="ftc">FTC</option>
          <option value="both">ASCI and FTC</option>
        </Select>
      </StackField>
      <StackField label="Draft text">
        <Textarea name="draftMd" rows={4} defaultValue={d.draftMd ?? ""} />
      </StackField>
      <StackField label="Live URL">
        <Input type="url" name="liveUrl" defaultValue={d.liveUrl ?? ""} placeholder="https://" />
      </StackField>
      <div className="pt-1">
        <SubmitButton variant="plain">Save</SubmitButton>
      </div>
    </ActionForm>
  );
}

type M = { saves: number | null; shares: number | null; commentsDecisionMaker: number | null; inboundToBrand: number | null; trackedSignups: number | null; impressions: number | null; notes: string | null } | null;

/** Credibility metrics first; impressions stored but shown last and smaller. */
export function MetricsForm({ id, m }: { id: string; m: M }) {
  const f = (name: keyof NonNullable<M>, label: string) => (
    <StackField label={label}>
      <NumberField name={name} min={0} step={1} defaultValue={m?.[name] ?? ""} />
    </StackField>
  );
  return (
    <ActionForm action={saveMetrics} className="space-y-0.5">
      <input type="hidden" name="id" value={id} />
      {f("commentsDecisionMaker", "Decision-maker comments")}
      <div className="grid grid-cols-2 gap-2">
        {f("saves", "Saves")}
        {f("shares", "Shares")}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {f("inboundToBrand", "Inbound to brand")}
        {f("trackedSignups", "Tracked sign-ups")}
      </div>
      <StackField label="Impressions" small>
        <NumberField name="impressions" min={0} step={1} defaultValue={m?.impressions ?? ""} className="opacity-80" />
      </StackField>
      <StackField label="Notes" small>
        <Input name="notes" defaultValue={m?.notes ?? ""} />
      </StackField>
      <div className="pt-1">
        <SubmitButton variant="plain">Save metrics</SubmitButton>
      </div>
    </ActionForm>
  );
}
