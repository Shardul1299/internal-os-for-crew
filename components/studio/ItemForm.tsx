// Calendar item form (BRIEF §19.3 item fields). Server-rendered; posts to a server action.
import { Field, FormGrid, Input, Select, Textarea } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import type { ActionResult } from "@/lib/actions/result";
import { FILMING_FORMATS, SCRIPT_ANGLES, STORY_TYPES } from "@/lib/studio/reference";
import { STUDIO_STATUS, STATUS_LABEL } from "./labels";

type Item = {
  id?: string;
  date?: string;
  kind?: string;
  title?: string;
  platform?: string | null;
  pillar?: string | null;
  conceptBucket?: string | null;
  contentType?: string | null;
  topic?: string | null;
  angle?: string | null;
  format?: string | null;
  ctaType?: string | null;
  funnelStage?: string | null;
  effort?: string | null;
  topicTag?: string | null;
  segment?: string | null;
  studioStatus?: string;
  notes?: string | null;
  liveUrl?: string | null;
  scriptId?: string | null;
};

function Opt({ v, l }: { v: string; l: string }) {
  return <option value={v}>{l}</option>;
}

export function ItemForm({
  action,
  item = {},
  scripts,
  back,
  submit = "Save",
}: {
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  item?: Item;
  scripts: { id: string; title: string }[];
  back?: string;
  submit?: string;
}) {
  const formats = FILMING_FORMATS.map((f) => f.name);
  const angles = [...SCRIPT_ANGLES.map((a) => a.name), ...STORY_TYPES.map((s) => s.name)];
  return (
    <ActionForm action={action} className="max-w-3xl">
      {item.id ? <input type="hidden" name="id" value={item.id} /> : null}
      {back ? <input type="hidden" name="back" value={back} /> : null}
      <FormGrid>
        <Field label="Date">
          <Input type="date" name="date" defaultValue={item.date} required className="max-w-48" />
        </Field>
        <Field label="Title">
          <Input name="title" defaultValue={item.title ?? ""} placeholder="Working title" />
        </Field>
        <Field label="Topic">
          <Input name="topic" defaultValue={item.topic ?? ""} />
        </Field>
        <Field label="Kind · platform">
          <div className="grid grid-cols-2 gap-2">
            <Select name="kind" defaultValue={item.kind ?? "organic"} aria-label="Kind">
              <Opt v="organic" l="Organic" />
              <Opt v="anchor" l="Anchor" />
              <Opt v="derivative" l="Derivative" />
            </Select>
            <Select name="platform" defaultValue={item.platform ?? "instagram"} aria-label="Platform">
              <Opt v="instagram" l="Instagram" />
              <Opt v="youtube" l="YouTube" />
              <Opt v="linkedin" l="LinkedIn" />
              <Opt v="x" l="X" />
              <Opt v="newsletter" l="Newsletter" />
              <Opt v="other" l="Other" />
            </Select>
          </div>
        </Field>
        <Field label="Pillar · concept">
          <div className="grid grid-cols-2 gap-2">
            <Select name="pillar" defaultValue={item.pillar ?? "authority"} aria-label="Pillar">
              <Opt v="authority" l="Authority" />
              <Opt v="journey" l="Journey" />
            </Select>
            <Select name="conceptBucket" defaultValue={item.conceptBucket ?? "proven"} aria-label="Concept bucket">
              <Opt v="proven" l="Proven" />
              <Opt v="double_down" l="Double down" />
              <Opt v="experimental" l="Experimental" />
            </Select>
          </div>
        </Field>
        <Field label="Content type">
          <Select name="contentType" defaultValue={item.contentType ?? "educational"} className="max-w-60">
            <Opt v="educational" l="Educational" />
            <Opt v="storytelling" l="Storytelling" />
            <Opt v="authority" l="Authority" />
            <Opt v="other" l="Other" />
          </Select>
        </Field>
        <Field label="Angle">
          <Input name="angle" defaultValue={item.angle ?? ""} list="angles" />
          <datalist id="angles">
            {angles.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </Field>
        <Field label="Filming format">
          <Select name="format" defaultValue={item.format ?? ""} className="max-w-72">
            <option value="">—</option>
            {formats.map((f) => (
              <Opt key={f} v={f} l={f} />
            ))}
          </Select>
        </Field>
        <Field label="CTA · funnel">
          <div className="grid grid-cols-2 gap-2">
            <Select name="ctaType" defaultValue={item.ctaType ?? "follow"} aria-label="CTA type">
              <Opt v="follow" l="Follow" />
              <Opt v="engagement" l="Engagement" />
              <Opt v="manychat" l="ManyChat" />
              <Opt v="none" l="None" />
            </Select>
            <Select name="funnelStage" defaultValue={item.funnelStage ?? "tofu"} aria-label="Funnel stage">
              <Opt v="tofu" l="TOFU" />
              <Opt v="mofu" l="MOFU" />
              <Opt v="bofu" l="BOFU" />
            </Select>
          </div>
        </Field>
        <Field label="Status · detail">
          <div className="grid grid-cols-2 gap-2">
            <Select name="studioStatus" defaultValue={item.studioStatus ?? "idea"} aria-label="Status">
              {STUDIO_STATUS.map((s) => (
                <Opt key={s} v={s} l={STATUS_LABEL[s]} />
              ))}
            </Select>
            <Select name="effort" defaultValue={item.effort ?? "default"} aria-label="Detail level">
              <Opt v="low" l="Low effort" />
              <Opt v="default" l="Default effort" />
              <Opt v="high" l="High effort" />
            </Select>
          </div>
        </Field>
        <Field label="Topic tag · segment">
          <div className="grid grid-cols-2 gap-2">
            <Input name="topicTag" defaultValue={item.topicTag ?? ""} aria-label="Topic tag" placeholder="Topic tag" />
            <Input name="segment" defaultValue={item.segment ?? ""} aria-label="Segment" placeholder="Segment" />
          </div>
        </Field>
        <Field label="Script">
          <Select name="scriptId" defaultValue={item.scriptId ?? ""}>
            <option value="">—</option>
            {scripts.map((s) => (
              <Opt key={s.id} v={s.id} l={s.title} />
            ))}
          </Select>
        </Field>
        <Field label="Live URL">
          <Input name="liveUrl" type="url" defaultValue={item.liveUrl ?? ""} placeholder="https://" />
        </Field>
        <Field label="Notes">
          <Textarea name="notes" rows={3} defaultValue={item.notes ?? ""} />
        </Field>
      </FormGrid>
      <div className="mt-4">
        <SubmitButton>{submit}</SubmitButton>
      </div>
    </ActionForm>
  );
}
