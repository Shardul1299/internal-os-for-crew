"use client";
// Carousel slides editor (BRIEF §19.8): role (hook / body / CTA), headline, supporting text.
import { useState } from "react";
import { Button, Input, Select, Textarea, Caption } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { saveSlides } from "@/lib/actions/studio-carousels";
import { parseCarouselSlides } from "@/lib/studio/parse";

type Slide = { role: "hook" | "body" | "cta"; headline: string; supportingText: string };

export function SlidesEditor({ id, initial }: { id: string; initial: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initial.length ? initial : [{ role: "hook", headline: "", supportingText: "" }]);
  const [paste, setPaste] = useState("");
  const set = (i: number, patch: Partial<Slide>) => setSlides((cur) => cur.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, d: number) =>
    setSlides((cur) => {
      const next = [...cur];
      const j = i + d;
      if (j < 0 || j >= next.length) return cur;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className="space-y-3">
      <ol className="border-t border-rule">
        {slides.map((s, i) => (
          <li key={i} className="grid grid-cols-[28px_1fr] gap-3 py-3 border-b border-rule">
            <span className="t-display text-[18px] num text-fg-3 pt-1">{i + 1}</span>
            <div className="space-y-2">
              <div className="grid grid-cols-[110px_1fr] gap-2">
                <Select value={s.role} onChange={(e) => set(i, { role: e.target.value as Slide["role"] })} aria-label="Role">
                  <option value="hook">Hook</option>
                  <option value="body">Body</option>
                  <option value="cta">CTA</option>
                </Select>
                <Input value={s.headline} onChange={(e) => set(i, { headline: e.target.value })} placeholder="Headline" aria-label="Headline" />
              </div>
              <Textarea rows={2} value={s.supportingText} onChange={(e) => set(i, { supportingText: e.target.value })} placeholder="Supporting text" aria-label="Supporting text" />
              <div className="flex items-center gap-1">
                <Button type="button" size="sm" variant="quiet" onClick={() => move(i, -1)} disabled={i === 0}>
                  Up
                </Button>
                <Button type="button" size="sm" variant="quiet" onClick={() => move(i, 1)} disabled={i === slides.length - 1}>
                  Down
                </Button>
                <Button type="button" size="sm" variant="quiet" onClick={() => setSlides((cur) => cur.filter((_, j) => j !== i))}>
                  Remove
                </Button>
                {words(s.headline) > 10 ? <Caption className="ml-2">Headline over 10 words — split it.</Caption> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={() => setSlides((cur) => [...cur, { role: "body", headline: "", supportingText: "" }])}>
          Add slide
        </Button>
        <ActionForm action={saveSlides}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="slides" value={JSON.stringify(slides)} />
          <SubmitButton variant="plain" size="sm">
            Save slides
          </SubmitButton>
        </ActionForm>
      </div>
      <details className="mt-2">
        <summary className="t-caption cursor-pointer">Paste slides (HOOK: / BODY: / CTA:, separated by ---)</summary>
        <Textarea rows={6} value={paste} onChange={(e) => setPaste(e.target.value)} className="mt-2 font-mono text-[12px]" />
        <Button type="button" size="sm" className="mt-2" disabled={!paste.trim()} onClick={() => setSlides(parseCarouselSlides(paste))}>
          Replace with pasted slides
        </Button>
      </details>
    </div>
  );
}
