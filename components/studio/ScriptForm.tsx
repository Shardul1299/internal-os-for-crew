// Manual BLACK / RED / GREEN editor (BRIEF §19.6.2, §13.8): three labelled bodies, no colour coding.
import { Field, FormGrid, Input, Select, Textarea } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { Toggle } from "@/components/ui";
import { saveScript } from "@/lib/actions/studio-write";
import { FILMING_FORMATS, SCRIPT_ANGLES, STORY_TYPES } from "@/lib/studio/reference";
import { BODY_LABEL } from "./ScriptBlocks";
import type { ScriptRow } from "@/lib/queries/studio";

export function ScriptForm({ script }: { script?: ScriptRow }) {
  const s = script;
  return (
    <ActionForm action={saveScript}>
      {s ? <input type="hidden" name="id" value={s.id} /> : null}
      <FormGrid>
        <Field label="Title">
          <Input name="title" defaultValue={s?.title} required />
        </Field>
        <Field label="Pillar · type">
          <div className="grid grid-cols-2 gap-2">
            <Select name="pillar" defaultValue={s?.pillar ?? "authority"} aria-label="Pillar">
              <option value="authority">Authority</option>
              <option value="journey">Journey</option>
            </Select>
            <Select name="contentType" defaultValue={s?.contentType ?? "educational"} aria-label="Content type">
              <option value="educational">Educational</option>
              <option value="storytelling">Storytelling</option>
              <option value="authority">Authority</option>
              <option value="other">Other</option>
            </Select>
          </div>
        </Field>
        <Field label="Angle or story type">
          <Input name="angleOrStoryType" defaultValue={s?.angleOrStoryType} list="script-angles" />
          <datalist id="script-angles">
            {[...SCRIPT_ANGLES.map((a) => a.name), ...STORY_TYPES.map((x) => x.name)].map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </Field>
        <Field label="Filming format">
          <Select name="format" defaultValue={s?.format ?? ""}>
            <option value="">—</option>
            {FILMING_FORMATS.map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="CTA · funnel">
          <div className="grid grid-cols-2 gap-2">
            <Select name="ctaType" defaultValue={s?.ctaType ?? "follow"} aria-label="CTA">
              <option value="follow">Follow</option>
              <option value="engagement">Engagement</option>
              <option value="manychat">ManyChat</option>
              <option value="none">None</option>
            </Select>
            <Select name="funnelStage" defaultValue={s?.funnelStage ?? "tofu"} aria-label="Funnel stage">
              <option value="tofu">TOFU</option>
              <option value="mofu">MOFU</option>
              <option value="bofu">BOFU</option>
            </Select>
          </div>
        </Field>
        <Field label="Status · effort">
          <div className="grid grid-cols-2 gap-2">
            <Select name="status" defaultValue={s?.status ?? "draft"} aria-label="Status">
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="filmed">Filmed</option>
              <option value="posted">Posted</option>
            </Select>
            <Select name="effort" defaultValue={s?.effort ?? "default"} aria-label="Effort">
              <option value="low">Low effort</option>
              <option value="default">Default effort</option>
              <option value="high">High effort</option>
            </Select>
          </div>
        </Field>
        <Field label="Concept · series">
          <div className="grid grid-cols-2 gap-2">
            <Select name="conceptBucket" defaultValue={s?.conceptBucket ?? ""} aria-label="Concept bucket">
              <option value="">—</option>
              <option value="proven">Proven</option>
              <option value="double_down">Double down</option>
              <option value="experimental">Experimental</option>
            </Select>
            <Input name="seriesName" defaultValue={s?.seriesName} placeholder="Series" aria-label="Series name" />
          </div>
        </Field>
        <Field label="Topic tag · segment">
          <div className="grid grid-cols-2 gap-2">
            <Input name="topicTag" defaultValue={s?.topicTag} placeholder="Topic tag" aria-label="Topic tag" />
            <Input name="segment" defaultValue={s?.segment} placeholder="Segment" aria-label="Segment" />
          </div>
        </Field>
        {(["black", "red", "green"] as const).map((k) => (
          <Field key={k} label={`${BODY_LABEL[k].label} · ${BODY_LABEL[k].sub}`} hint="One line per beat">
            <Textarea name={k === "black" ? "bodyBlack" : k === "red" ? "bodyRed" : "bodyGreen"} rows={k === "black" ? 8 : 5} defaultValue={k === "black" ? s?.bodyBlack : k === "red" ? s?.bodyRed : s?.bodyGreen} />
          </Field>
        ))}
        <Field label="Crew">
          <Toggle name="sharedWithCrew" label="Share with Crew" defaultChecked={s?.sharedWithCrew ?? false} />
        </Field>
      </FormGrid>
      <div className="mt-4">
        <SubmitButton>Save script</SubmitButton>
      </div>
    </ActionForm>
  );
}
