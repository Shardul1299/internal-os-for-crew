"use client";
// Judging screen (§7.4): one row per entry; three 1–5 cells + one sentence; arrow keys move between cells;
// totals rank live. Ranks and projected outcomes come from lib/rules/program — never re-implemented here.
import { useMemo, useRef, useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { Table, THead, TH, TR, TD, Input, Caption, cx } from "@/components/ui";
import { rankEntries, routeOutcome } from "@/lib/rules/program";
import type { RulesConfig } from "@/lib/rules/config";
import type { ActionResult } from "@/lib/actions/result";

export type ScoreRowInput = {
  id: string;
  name: string;
  submissionUrl: string | null;
  submitted: boolean;
  aesthetics: number | null;
  taste: number | null;
  personality: number | null;
  sentence: string | null;
};

type Row = { id: string; aesthetics: number | null; taste: number | null; personality: number | null; sentence: string };
const DIMS = ["aesthetics", "taste", "personality"] as const;
const OUTCOME: Record<string, string> = { tier0: "Tier 0", revisit: "Revisit", pass: "Pass" };

export function ScoreSheet({
  challengeId,
  entries,
  topN,
  filter,
  canEdit,
  action,
}: {
  challengeId: string;
  entries: ScoreRowInput[];
  topN: number;
  filter: RulesConfig["filter"];
  canEdit: boolean;
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    entries.map((e) => ({ id: e.id, aesthetics: e.aesthetics, taste: e.taste, personality: e.personality, sentence: e.sentence ?? "" })),
  );
  const grid = useRef<HTMLTableSectionElement>(null);
  const meta = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);

  const totals = rows.map((r) => ({ id: r.id, total: r.aesthetics && r.taste && r.personality ? r.aesthetics + r.taste + r.personality : null }));
  const ranked = rankEntries(totals.filter((t) => meta.get(t.id)?.submitted));
  const rankOf = new Map(ranked.map((r) => [r.id, r]));
  const cfg = { filter } as RulesConfig;
  const order = [...rows].sort((a, b) => {
    const ra = rankOf.get(a.id)?.rank ?? 999;
    const rb = rankOf.get(b.id)?.rank ?? 999;
    return ra - rb;
  });
  // Keep the visual order stable while typing; re-sort only on blur of a row.
  const [visual, setVisual] = useState<string[]>(() => order.map((r) => r.id));

  const set = (id: string, k: keyof Row, v: number | string | null) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: v } : r)));

  const focusCell = (row: number, col: number) => {
    const el = grid.current?.querySelector<HTMLInputElement>(`[data-cell="${row}-${col}"]`);
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    const t = e.currentTarget;
    const atStart = t.selectionStart === 0 && t.selectionEnd === 0;
    if (e.key === "ArrowDown" || (e.key === "Enter" && !e.metaKey && !e.ctrlKey)) {
      e.preventDefault();
      focusCell(row + 1, col);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusCell(row - 1, col);
    } else if (e.key === "ArrowRight" && col < 3) {
      e.preventDefault();
      focusCell(row, col + 1);
    } else if (e.key === "ArrowLeft" && col > 0 && (col < 3 || atStart)) {
      e.preventDefault();
      focusCell(row, col - 1);
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      t.form?.requestSubmit();
    }
  };

  const scored = totals.filter((t) => t.total != null).length;
  const submitted = entries.filter((e) => e.submitted).length;

  return (
    <ActionForm action={action} onDone={() => setVisual(order.map((r) => r.id))}>
      <input type="hidden" name="challengeId" value={challengeId} />
      <input type="hidden" name="rows" value={JSON.stringify(rows.map(({ id, ...r }) => ({ entryId: id, ...r })))} />
      <div className="flex items-center justify-between gap-4 px-5 py-3 flex-wrap">
        <Caption>
          {scored} of {submitted} scored · arrows move · ⌘↵ saves
        </Caption>
        {canEdit ? <SubmitButton variant="plain">Save scores</SubmitButton> : <Caption>Scoring opens at judging.</Caption>}
      </div>
      <Table>
        <THead>
          <TH align="right">Rank</TH>
          <TH>Entrant</TH>
          <TH align="center">Aesthetics</TH>
          <TH align="center">Taste</TH>
          <TH align="center">Personality</TH>
          <TH align="right">Total</TH>
          <TH>One sentence</TH>
          <TH>Outcome</TH>
        </THead>
        <tbody ref={grid}>
          {visual.map((id, ri) => {
            const r = rows.find((x) => x.id === id)!;
            const m = meta.get(id)!;
            const rk = rankOf.get(id);
            const total = totals.find((t) => t.id === id)!.total;
            const projected = m.submitted && rk ? routeOutcome(cfg, { rank: rk.rank, total }, topN) : null;
            const disabled = !canEdit || !m.submitted;
            return (
              <TR key={id} className={cx(rk?.rank != null && rk.rank <= topN && "font-semibold")}>
                <TD align="right" className="w-14 num">{rk?.rank ?? "—"}</TD>
                <TD className="min-w-[160px]">
                  <span className="block truncate">{m.name}</span>
                  {m.submissionUrl ? (
                    <a href={m.submissionUrl} target="_blank" rel="noreferrer" className="t-caption underline underline-offset-2">
                      Submission
                    </a>
                  ) : (
                    <span className="t-caption">No submission</span>
                  )}
                </TD>
                {DIMS.map((k, ci) => (
                  <TD key={k} align="center" className="w-[92px]">
                    <Input
                      data-cell={`${ri}-${ci}`}
                      aria-label={`${m.name} ${k}`}
                      inputMode="numeric"
                      maxLength={1}
                      disabled={disabled}
                      value={r[k] ?? ""}
                      onKeyDown={(e) => onKey(e, ri, ci)}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^1-5]/g, "").slice(-1);
                        set(id, k, v ? Number(v) : null);
                        if (v) focusCell(ri, ci + 1);
                      }}
                      className="!w-14 text-center num font-semibold"
                    />
                  </TD>
                ))}
                <TD align="right" className="w-16 num t-headline">{total ?? "—"}</TD>
                <TD className="min-w-[260px]">
                  <Input
                    data-cell={`${ri}-3`}
                    aria-label={`${m.name} sentence`}
                    disabled={disabled}
                    value={r.sentence}
                    maxLength={200}
                    placeholder={m.submitted ? "One sentence" : ""}
                    onKeyDown={(e) => onKey(e, ri, 3)}
                    onChange={(e) => set(id, "sentence", e.target.value)}
                  />
                </TD>
                <TD className="w-24 text-fg-2">{projected ? OUTCOME[projected] : "—"}</TD>
              </TR>
            );
          })}
        </tbody>
      </Table>
    </ActionForm>
  );
}
