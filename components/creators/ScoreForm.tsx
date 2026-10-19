"use client";
// The Filter score form: three 1–5 Score controls + one required sentence (≤ 200) + context.
import { useState } from "react";
import { Field, Select, Textarea, Caption } from "@/components/ui";
import { ActionForm, ScoreControl, SubmitButton } from "@/components/ui/client";
import { addFilterScore } from "@/lib/actions/creators";
import { CONTEXT_LABEL } from "./labels";

export function ScoreForm({ creatorId, defaultContext, threshold }: { creatorId: string; defaultContext: string; threshold: number }) {
  const [v, setV] = useState<{ a: number | null; t: number | null; p: number | null }>({ a: null, t: null, p: null });
  const [sentence, setSentence] = useState("");
  const [key, setKey] = useState(0);
  const total = v.a != null && v.t != null && v.p != null ? v.a + v.t + v.p : null;
  return (
    <ActionForm
      key={key}
      action={addFilterScore}
      onDone={() => {
        setV({ a: null, t: null, p: null });
        setSentence("");
        setKey((k) => k + 1);
      }}
    >
      <input type="hidden" name="id" value={creatorId} />
      <div className="space-y-1.5">
        <ScoreControl label="Aesthetics" name="aesthetics" value={v.a} onChange={(n) => setV((x) => ({ ...x, a: n }))} />
        <ScoreControl label="Taste" name="taste" value={v.t} onChange={(n) => setV((x) => ({ ...x, t: n }))} />
        <ScoreControl label="Personality" name="personality" value={v.p} onChange={(n) => setV((x) => ({ ...x, p: n }))} />
      </div>
      <div className="flex items-baseline gap-3 mt-3">
        <span className="t-display text-[28px] num">{total ?? "—"}</span>
        <span className="t-caption">/ 15 · threshold {threshold}</span>
      </div>
      <Field label="One sentence" hint={`${sentence.trim().length}/200`}>
        <Textarea name="sentence" rows={2} maxLength={200} value={sentence} onChange={(e) => setSentence(e.target.value)} required />
      </Field>
      <Field label="Context">
        <Select name="context" defaultValue={defaultContext}>
          {Object.entries(CONTEXT_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <div className="mt-2 flex items-center gap-3">
        <SubmitButton variant="plain">Save score</SubmitButton>
        <Caption>No other score overrides a Filter fail.</Caption>
      </div>
    </ActionForm>
  );
}
