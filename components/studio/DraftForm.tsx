"use client";
// Submit a sponsored draft (BRIEF §19.6.7): attach a script or carousel, or paste text.
// The gate (topic filters, disclosure line in GREEN) runs in the server action; the creator can insert the line.
import { useState } from "react";
import { Button, Caption, Field, FormGrid, Select, Textarea } from "@/components/ui";
import { ActionForm, ActionButton, SubmitButton, SegmentedControl } from "@/components/ui/client";
import { submitDraft, insertDisclosure } from "@/lib/actions/studio-deals";

export function DraftForm({
  deliverableId,
  scripts,
  carousels,
  disclosure,
  defaultScriptId,
  defaultCarouselId,
}: {
  deliverableId: string;
  scripts: { id: string; title: string; hasDisclosure: boolean }[];
  carousels: { id: string; title: string; hasDisclosure: boolean }[];
  disclosure: string;
  defaultScriptId?: string | null;
  defaultCarouselId?: string | null;
}) {
  const [source, setSource] = useState<"script" | "carousel" | "text">(defaultCarouselId && !defaultScriptId ? "carousel" : scripts.length ? "script" : "text");
  const [scriptId, setScriptId] = useState(defaultScriptId ?? scripts[0]?.id ?? "");
  const [carouselId, setCarouselId] = useState(defaultCarouselId ?? carousels[0]?.id ?? "");
  const [green, setGreen] = useState("");
  const pickedScript = scripts.find((s) => s.id === scriptId);
  const pickedCarousel = carousels.find((c) => c.id === carouselId);
  return (
    <div className="space-y-3 max-w-3xl">
      <SegmentedControl
        size="sm"
        value={source}
        onChange={(v) => setSource(v as typeof source)}
        options={[
          { value: "script", label: "Script" },
          { value: "carousel", label: "Carousel" },
          { value: "text", label: "Paste" },
        ]}
      />
      {source === "script" ? (
        scripts.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={scriptId} onChange={(e) => setScriptId(e.target.value)} className="max-w-md" aria-label="Script">
              {scripts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </Select>
            {pickedScript && !pickedScript.hasDisclosure ? (
              <ActionButton action={insertDisclosure} fields={{ deliverableId, scriptId }}>
                Insert disclosure line
              </ActionButton>
            ) : pickedScript ? (
              <Caption>Disclosure line in GREEN.</Caption>
            ) : null}
          </div>
        ) : (
          <Caption>No scripts yet — write one, or paste the draft.</Caption>
        )
      ) : source === "carousel" ? (
        carousels.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={carouselId} onChange={(e) => setCarouselId(e.target.value)} className="max-w-md" aria-label="Carousel">
              {carousels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
            {pickedCarousel && !pickedCarousel.hasDisclosure ? (
              <ActionButton action={insertDisclosure} fields={{ deliverableId, carouselId }}>
                Insert disclosure line
              </ActionButton>
            ) : pickedCarousel ? (
              <Caption>Disclosure line in the notes.</Caption>
            ) : null}
          </div>
        ) : (
          <Caption>No carousels yet.</Caption>
        )
      ) : null}
      <ActionForm action={submitDraft}>
        <input type="hidden" name="deliverableId" value={deliverableId} />
        <input type="hidden" name="source" value={source} />
        <input type="hidden" name="scriptId" value={source === "script" ? scriptId : ""} />
        <input type="hidden" name="carouselId" value={source === "carousel" ? carouselId : ""} />
        {source === "text" ? (
          <FormGrid>
            <Field label="BLACK · spoken" hint="What the brand reviews for claims">
              <Textarea name="black" rows={8} />
            </Field>
            <Field label="GREEN · editing">
              <Textarea name="green" rows={4} value={green} onChange={(e) => setGreen(e.target.value)} />
              {!green.includes(disclosure) ? (
                <Button type="button" size="sm" className="mt-2" onClick={() => setGreen((g) => `${disclosure}\n${g}`.trim())}>
                  Insert disclosure line
                </Button>
              ) : null}
            </Field>
          </FormGrid>
        ) : null}
        <div className="mt-3">
          <SubmitButton>Submit draft</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}
