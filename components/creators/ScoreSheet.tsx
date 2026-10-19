"use client";
// Score mode — the scribe sheet (§10, §7): one row per creator, three 1–5 cells + one sentence.
// Arrow keys move between cells, totals rank live, each row saves on its own (creator_filter_scores).
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Table, THead, TH, TR, TD, Button, cx } from "@/components/ui";
import { addFilterScore } from "@/lib/actions/creators";
import { filterContextFor } from "@/lib/rules/creator-flow";
import { validateFilterScore, scoreTotal, type Stage } from "@/lib/rules/creators";
import { STAGE_LABEL, SUB_CATEGORY_LABEL } from "@/lib/format";

type Row = { id: string; name: string; stage: Stage; subCategory: string; latest: { total: number; sentence: string } | null };
type Draft = { a: string; t: string; p: string; sentence: string; state: "idle" | "saving" | "saved" | "error"; msg?: string };

const COLS = 4; // a, t, p, sentence

export function ScoreSheet({ rows, threshold }: { rows: Row[]; threshold: number }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => Object.fromEntries(rows.map((r) => [r.id, { a: "", t: "", p: "", sentence: "", state: "idle" as const }])));
  const [, start] = useTransition();
  const grid = useRef<HTMLTableSectionElement>(null);

  const totals = useMemo(() => {
    const t: Record<string, number | null> = {};
    for (const r of rows) {
      const d = drafts[r.id];
      const [a, b, c] = [Number(d.a), Number(d.t), Number(d.p)];
      t[r.id] = d.a && d.t && d.p && [a, b, c].every((n) => n >= 1 && n <= 5) ? scoreTotal(a, b, c) : null;
    }
    return t;
  }, [drafts, rows]);

  const ranks = useMemo(() => {
    const scored = rows.filter((r) => totals[r.id] != null).sort((x, y) => totals[y.id]! - totals[x.id]!);
    const out: Record<string, number> = {};
    scored.forEach((r, i) => {
      const prev = scored[i - 1];
      out[r.id] = prev && totals[prev.id] === totals[r.id] ? out[prev.id] : i + 1;
    });
    return out;
  }, [rows, totals]);

  const set = (id: string, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch, state: patch.state ?? "idle" } }));

  const focusCell = (row: number, col: number) => {
    const el = grid.current?.querySelector<HTMLInputElement>(`[data-cell="${row}-${col}"]`);
    if (el) {
      el.focus();
      el.select();
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number, id: string) => {
    const el = e.currentTarget;
    const atStart = el.selectionStart === 0 && el.selectionEnd === 0;
    const atEnd = el.selectionStart === el.value.length;
    const isText = col === 3;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusCell(Math.min(rows.length - 1, row + 1), col);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusCell(Math.max(0, row - 1), col);
    } else if (e.key === "ArrowRight" && (!isText || atEnd) && col < COLS - 1) {
      e.preventDefault();
      focusCell(row, col + 1);
    } else if (e.key === "ArrowLeft" && (!isText || atStart) && col > 0) {
      e.preventDefault();
      focusCell(row, col - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      save(id);
    }
  };

  const save = (id: string) => {
    const r = rows.find((x) => x.id === id)!;
    const d = drafts[id];
    const v = validateFilterScore({ aesthetics: Number(d.a), taste: Number(d.t), personality: Number(d.p), sentence: d.sentence });
    if (!v.ok) return set(id, { state: "error", msg: v.reasons[0] });
    set(id, { state: "saving" });
    start(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("aesthetics", d.a);
      fd.set("taste", d.t);
      fd.set("personality", d.p);
      fd.set("sentence", d.sentence);
      fd.set("context", filterContextFor(r.stage));
      const res = await addFilterScore(null, fd);
      if (res.ok) {
        set(id, { state: "saved", msg: res.message });
        router.refresh();
      } else set(id, { state: "error", msg: res.error });
    });
  };

  if (!rows.length) return <p className="px-5 py-12 t-headline text-fg-2">Nobody to score in this view.</p>;

  const cell = "w-11 h-8 bg-block text-center num outline-none focus:bg-pink-soft";
  return (
    <Table aria-label="Score sheet">
      <THead>
        <TH align="right">Rank</TH>
        <TH>Name</TH>
        <TH>Stage</TH>
        <TH align="right">Last</TH>
        <TH align="center">Aes</TH>
        <TH align="center">Taste</TH>
        <TH align="center">Pers</TH>
        <TH align="right">Total</TH>
        <TH className="w-[40%]">One sentence</TH>
        <TH />
      </THead>
      <tbody ref={grid}>
        {rows.map((r, i) => {
          const d = drafts[r.id];
          const total = totals[r.id];
          return (
            <TR key={r.id}>
              <TD align="right" className="text-fg-3 w-12">
                {ranks[r.id] ?? ""}
              </TD>
              <TD>
                <Link href={`/creators/${r.id}?tab=filter`} className="hover:underline underline-offset-2">
                  {r.name}
                </Link>
                <span className="t-caption ml-2">{SUB_CATEGORY_LABEL[r.subCategory]}</span>
              </TD>
              <TD className="text-fg-2">{STAGE_LABEL[r.stage]}</TD>
              <TD align="right" className="text-fg-3" title={r.latest?.sentence}>
                {r.latest ? r.latest.total : "—"}
              </TD>
              {(["a", "t", "p"] as const).map((k, col) => (
                <TD key={k} align="center" className="px-1">
                  <input
                    data-cell={`${i}-${col}`}
                    aria-label={`${r.name} ${k === "a" ? "aesthetics" : k === "t" ? "taste" : "personality"}`}
                    inputMode="numeric"
                    maxLength={1}
                    value={d[k]}
                    className={cell}
                    onFocus={(e) => e.currentTarget.select()}
                    onKeyDown={(e) => onKey(e, i, col, r.id)}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^1-5]/g, "").slice(-1);
                      set(r.id, { [k]: v } as Partial<Draft>);
                      if (v) focusCell(i, col + 1);
                    }}
                  />
                </TD>
              ))}
              <TD align="right" className={cx("font-semibold", total != null && total < threshold && "text-fg-3")}>
                {total ?? ""}
              </TD>
              <TD className="px-1">
                <input
                  data-cell={`${i}-3`}
                  aria-label={`${r.name} sentence`}
                  maxLength={200}
                  value={d.sentence}
                  placeholder="One sentence"
                  className="w-full h-8 px-2 bg-block outline-none focus:bg-pink-soft placeholder:text-fg-3"
                  onKeyDown={(e) => onKey(e, i, 3, r.id)}
                  onChange={(e) => set(r.id, { sentence: e.target.value })}
                />
              </TD>
              <TD className="whitespace-nowrap w-[1%]">
                {d.state === "saved" ? (
                  <span className="t-caption">{d.msg}</span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Button size="sm" type="button" onClick={() => save(r.id)} disabled={d.state === "saving"}>
                      {d.state === "saving" ? "…" : "Save"}
                    </Button>
                    {d.state === "error" ? <span className="t-caption text-pink-fg">{d.msg}</span> : null}
                  </span>
                )}
              </TD>
            </TR>
          );
        })}
      </tbody>
    </Table>
  );
}
