"use client";
// Generator panel — BRIEF §19.0 S1. Shows the exact prompt built from the creator's Profile,
// offers Generate (org AI key) and Copy prompt, and puts the answer in an editable output box
// (an answer pasted from any LLM works the same) with the Save actions that fit the generator.
// Justification (CLAUDE.md): one composite of closed-set parts reused by every generator.
import { useMemo, useState, useTransition } from "react";
import { Button, Caption, Field, FormGrid, Input, Select, Textarea } from "@/components/ui";
import { ActionForm, CopyButton, SubmitButton, useResultFeedback } from "@/components/ui/client";
import type { BrandConfig } from "@/lib/studio/brand";
import { buildGeneratorPrompt, type GenDefaults, type GeneratorKey } from "@/lib/studio/generators";
import { parseHookStacks, parseIdeationTable, parseDoubleDownVariants, firstMeaningfulLine, parseCarouselSlides, parseScriptSections } from "@/lib/studio/parse";
import { runGenerator } from "@/lib/actions/studio-ai";
import { saveHookStacks, saveScriptFromOutput, saveTemplate, applyImprovement } from "@/lib/actions/studio-write";
import { addIdeasToCalendar } from "@/lib/actions/studio-calendar";
import { saveCarouselFromOutput } from "@/lib/actions/studio-carousels";
import { addDays } from "@/lib/dates";

export type GenField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
  rows?: number;
  /** Picking an option fills other fields (e.g. a saved hook stack or script). */
  fill?: Record<string, Record<string, string>>;
};

export type SaveKind = "hooks" | "script" | "ideas" | "double_down" | "carousel" | "template" | "improve";

export function Generator({
  gen,
  brand,
  defaults,
  fields = [],
  initial = {},
  save,
  meta = {},
  today,
  step = 2,
}: {
  gen: GeneratorKey;
  brand: BrandConfig;
  defaults: GenDefaults;
  fields?: GenField[];
  initial?: Record<string, string>;
  save?: SaveKind;
  /** Fixed metadata for saves (e.g. pillar, contentType). */
  meta?: Record<string, string>;
  today: string;
  step?: number;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of fields) v[f.name] = initial[f.name] ?? (f.type === "select" && f.options?.length && !f.fill ? f.options[0].value : "");
    return { ...initial, ...v };
  });
  const [output, setOutput] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const prompt = useMemo(() => buildGeneratorPrompt(gen, brand, values, defaults), [gen, brand, values, defaults]);

  const set = (name: string, value: string) => {
    setValues((cur) => {
      const f = fields.find((x) => x.name === name);
      return { ...cur, [name]: value, ...(f?.fill?.[value] ?? {}) };
    });
  };

  const generate = () =>
    start(async () => {
      setErr(null);
      const r = await runGenerator(gen, values);
      if (!r.ok) setErr(r.error);
      else setOutput(String((r.data as { text?: string })?.text ?? ""));
    });

  return (
    <div className="space-y-4">
      {fields.length ? (
        <FormGrid>
          {fields.map((f) => (
            <Field key={f.name} label={f.label}>
              {f.type === "select" ? (
                <Select value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}>
                  {f.fill ? <option value="">—</option> : null}
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              ) : f.type === "textarea" ? (
                <Textarea rows={f.rows ?? 4} value={values[f.name] ?? ""} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
              ) : (
                <Input type={f.type === "number" ? "number" : "text"} value={values[f.name] ?? ""} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
              )}
            </Field>
          ))}
        </FormGrid>
      ) : null}

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="t-label">Prompt</span>
          <span className="t-caption num">{prompt.length.toLocaleString("en-IN")} chars</span>
        </div>
        <pre className="bg-block p-3 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-[16px] text-fg-2">{prompt}</pre>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Button type="button" onClick={generate} disabled={pending}>
            {pending ? "Generating…" : "Generate"}
          </Button>
          <CopyButton text={prompt} />
        </div>
        {err ? (
          <p className="t-caption text-pink-fg mt-2" role="alert">
            {err}
          </p>
        ) : null}
      </div>

      <div>
        <span className="t-label block mb-1">Output</span>
        <Textarea rows={output ? 14 : 4} value={output} onChange={(e) => setOutput(e.target.value)} placeholder="Generate, or paste the answer from any AI here." />
      </div>

      {save && output.trim() ? <SaveActions kind={save} output={output} values={values} meta={meta} today={today} step={step} /> : null}
    </div>
  );
}

function Hidden({ data }: { data: Record<string, string | undefined | null> }) {
  return (
    <>
      {Object.entries(data).map(([k, v]) => (v == null ? null : <input key={k} type="hidden" name={k} value={v} />))}
    </>
  );
}

function SaveActions({ kind, output, values, meta, today, step }: { kind: SaveKind; output: string; values: Record<string, string>; meta: Record<string, string>; today: string; step: number }) {
  if (kind === "hooks") {
    const stacks = parseHookStacks(output);
    return (
      <ActionForm action={saveHookStacks} className="flex items-center gap-3 flex-wrap">
        <Hidden data={{ stacks: JSON.stringify(stacks), topic: values.topic, angle: values.angle }} />
        <SubmitButton variant="plain">{`Save ${stacks.length || ""} hook ${stacks.length === 1 ? "stack" : "stacks"}`.replace("  ", " ")}</SubmitButton>
        <Caption>{stacks.length ? `${stacks.length} found` : "No Written / Verbal / Visual lines found"}</Caption>
      </ActionForm>
    );
  }
  if (kind === "script") {
    const b = parseScriptSections(output);
    return (
      <ActionForm action={saveScriptFromOutput} className="flex items-center gap-3 flex-wrap">
        <Hidden
          data={{
            output,
            title: values.title || values.topic || values.seriesName || "",
            pillar: meta.pillar ?? "authority",
            contentType: meta.contentType ?? "educational",
            angleOrStoryType: values.angle || values.storyType || "",
            format: values.format,
            ctaType: values.ctaType,
            funnelStage: values.funnelStage,
            seriesName: values.series,
            outlierId: values.outlierId,
          }}
        />
        <SubmitButton variant="plain">Save script</SubmitButton>
        <Caption>{b.black ? `BLACK ${b.black.split("\n").length} · RED ${b.red ? b.red.split("\n").length : 0} · GREEN ${b.green ? b.green.split("\n").length : 0} lines` : "No BLACK section found"}</Caption>
      </ActionForm>
    );
  }
  if (kind === "improve") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {values.scriptId ? (
          <ActionForm action={applyImprovement}>
            <Hidden data={{ output, scriptId: values.scriptId, mode: "replace" }} />
            <SubmitButton variant="plain">Replace script</SubmitButton>
          </ActionForm>
        ) : null}
        <ActionForm action={applyImprovement}>
          <Hidden data={{ output, scriptId: values.scriptId ?? "", mode: "new", title: "Improved script" }} />
          <SubmitButton variant="plain">Save as new script</SubmitButton>
        </ActionForm>
      </div>
    );
  }
  if (kind === "template") {
    return (
      <ActionForm action={saveTemplate} className="flex items-center gap-2 flex-wrap" resetOnSuccess>
        <Hidden data={{ templateText: output, sourceNote: "Transcript → template", pillar: values.pillar || "authority" }} />
        <Input name="name" placeholder="Template name" className="max-w-xs" required />
        <SubmitButton variant="plain">Save template</SubmitButton>
      </ActionForm>
    );
  }
  if (kind === "carousel") {
    const slides = parseCarouselSlides(output);
    return (
      <ActionForm action={saveCarouselFromOutput} className="flex items-center gap-3 flex-wrap">
        <Hidden
          data={{
            output,
            title: values.topic,
            archetype: values.archetype,
            funnelStage: values.funnelStage,
            ctaType: values.ctaType,
            backgroundStyle: values.backgroundStyle,
            backgroundCategory: values.backgroundCategory,
            designNotes: values.designNotes,
          }}
        />
        <SubmitButton variant="plain">Save carousel</SubmitButton>
        <Caption>{slides.length ? `${slides.length} slides found` : "No HOOK / BODY / CTA slides found"}</Caption>
      </ActionForm>
    );
  }
  if (kind === "ideas") {
    const rows = parseIdeationTable(output).map((r) => ({ ...r, format: "" }));
    return <IdeaRows rows={rows} today={today} step={step} />;
  }
  // double_down
  const variants = parseDoubleDownVariants(output);
  const rows = (variants.length ? variants : (["A", "B", "C"] as const).map((m) => ({ method: m, text: "" }))).map((v) => ({
    topic: firstMeaningfulLine(v.text) || `${values.topic ?? "Variant"} — ${v.method}`,
    pillar: (meta.pillar as "authority" | "journey") ?? "authority",
    conceptBucket: "double_down" as const,
    angle: `Double down ${v.method}`,
    hook: "",
    format: v.method === "C" ? "" : (values.format ?? ""),
  }));
  return <IdeaRows rows={rows} today={today} step={step} />;
}

type Idea = { topic: string; pillar: "authority" | "journey"; conceptBucket: "proven" | "double_down" | "experimental"; angle: string; hook: string; format: string };

/** Ideation / double-down rows, each with a date and Add to calendar. */
export function IdeaRows({ rows, today, step }: { rows: Idea[]; today: string; step: number }) {
  const [items, setItems] = useState(() => rows.map((r, i) => ({ ...r, date: addDays(today, (i + 1) * step), added: false })));
  const feedback = useResultFeedback();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  if (!items.length) return <Caption>No table rows found — ask for a markdown table, or add items by hand.</Caption>;
  const add = (idx: number[]) =>
    start(async () => {
      setErr(null);
      const fd = new FormData();
      fd.set("rows", JSON.stringify(idx.map((i) => items[i])));
      const r = await addIdeasToCalendar(null, fd);
      if (!r.ok) return setErr(r.error);
      feedback(r);
      setItems((cur) => cur.map((x, i) => (idx.includes(i) ? { ...x, added: true } : x)));
    });
  const open = items.map((x, i) => (x.added ? -1 : i)).filter((i) => i >= 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-3">
        <span className="t-label">{items.length} ideas</span>
        <Button type="button" size="sm" disabled={pending || !open.length} onClick={() => add(open)}>
          Add all to calendar
        </Button>
      </div>
      <ul className="border-t border-rule">
        {items.map((it, i) => (
          <li key={i} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] items-center gap-2 py-2 border-b border-rule">
            <Input value={it.topic} onChange={(e) => setItems((cur) => cur.map((x, j) => (j === i ? { ...x, topic: e.target.value } : x)))} aria-label="Topic" />
            <span className="t-caption whitespace-nowrap">
              {it.pillar} · {it.conceptBucket.replace("_", " ")}
              {it.angle ? ` · ${it.angle}` : ""}
            </span>
            <Input type="date" value={it.date} onChange={(e) => setItems((cur) => cur.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))} className="w-40" aria-label="Date" />
            <Button type="button" size="sm" variant="quiet" disabled={pending || it.added} onClick={() => add([i])}>
              {it.added ? "Added" : "Add to calendar"}
            </Button>
          </li>
        ))}
      </ul>
      {err ? (
        <p className="t-caption text-pink-fg mt-2" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}
