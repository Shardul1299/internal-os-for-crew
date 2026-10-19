// Stepper, Month grid, Sparkline, Markdown — server-safe display components.
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "./primitives";

export type Step = { key: string; label: string; state: "done" | "current" | "todo" | "blocked"; href?: string; caption?: string };

/** Stepper — left rail mirroring stages; only the current step is shown in the main pane. */
export function Stepper({ steps, active }: { steps: Step[]; active?: string }) {
  return (
    <nav aria-label="Steps" className="py-3">
      <ol>
        {steps.map((s, i) => {
          const isActive = active ? s.key === active : s.state === "current";
          const body = (
            <span className="flex items-start gap-3 px-4 py-2">
              <span
                aria-hidden
                className={cx(
                  "mt-0.5 w-5 h-5 shrink-0 inline-flex items-center justify-center text-[10px] font-bold num",
                  s.state === "done" && "bg-head-bg text-head-fg",
                  s.state === "current" && "bg-pink text-on-pink",
                  s.state === "blocked" && "bg-block text-pink-fg",
                  s.state === "todo" && "bg-block text-fg-3",
                )}
              >
                {s.state === "done" ? "✓" : i + 1}
              </span>
              <span className="min-w-0">
                <span className={cx("block", isActive ? "text-fg font-semibold" : s.state === "todo" ? "text-fg-3" : "text-fg-2")}>{s.label}</span>
                {s.caption ? <span className={cx("t-caption block truncate", s.state === "blocked" && "text-pink-fg")}>{s.caption}</span> : null}
              </span>
            </span>
          );
          return (
            <li key={s.key} className={cx(isActive && "bg-raised")} aria-current={isActive ? "step" : undefined}>
              {s.href ? (
                <Link href={s.href} scroll={false} className="block hover:bg-raised">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type GridItem = { date: string; label: string; kind: string; href?: string; caption?: string };

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Month grid — anchors bold, sponsored dotted, shoots marked, blackouts shaded. */
export function MonthGrid({
  month,
  items,
  blackouts = [],
  today,
  renderDay,
}: {
  month: string; // YYYY-MM
  items: GridItem[];
  blackouts?: { startsOn: string; endsOn: string }[];
  today?: string;
  renderDay?: (date: string) => ReactNode;
}) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [...Array(lead).fill(null)];
  for (let d = 1; d <= days; d++) cells.push(`${month}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  const shaded = (d: string) => blackouts.some((b) => d >= b.startsOn && d <= b.endsOn);
  return (
    <div className="border-t border-l border-rule">
      <div className="grid grid-cols-7">
        {DOW.map((d) => (
          <div key={d} className="h-7 px-2 flex items-center bg-head-bg text-head-fg text-[10px] font-bold uppercase tracking-[0.18em] border-r border-rule">
            {d}
          </div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={cx(
              "min-h-[96px] border-r border-b border-rule p-1.5 align-top",
              !d && "bg-raised/40",
              d && shaded(d) && "bg-[repeating-linear-gradient(135deg,var(--block)_0_6px,transparent_6px_12px)]",
            )}
          >
            {d ? (
              <>
                <div className={cx("text-[11px] num mb-1", d === today ? "text-pink-fg font-bold" : "text-fg-3")}>{Number(d.slice(8))}</div>
                <ul className="space-y-0.5">
                  {items
                    .filter((it) => it.date === d)
                    .map((it, j) => {
                      const cls = cx(
                        "block truncate text-[11px] leading-[14px] px-1",
                        it.kind === "anchor" && "font-bold text-fg",
                        it.kind === "sponsored" && "border border-dotted border-fg-2 text-fg",
                        it.kind === "shoot" && "bg-head-bg text-head-fg",
                        it.kind === "blackout" && "text-fg-3 italic",
                        (it.kind === "organic" || it.kind === "derivative") && "text-fg-2",
                      );
                      return (
                        <li key={j} title={it.caption ?? it.label}>
                          {it.href ? (
                            <Link href={it.href} className={cx(cls, "hover:bg-pink-soft")}>
                              {it.kind === "shoot" ? "◼ " : ""}
                              {it.label}
                            </Link>
                          ) : (
                            <span className={cls}>{it.label}</span>
                          )}
                        </li>
                      );
                    })}
                </ul>
                {renderDay ? renderDay(d) : null}
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Sparkline — one line, no axes. */
export function Sparkline({ values, width = 96, height = 24, emphasis }: { values: number[]; width?: number; height?: number; emphasis?: boolean }) {
  if (values.length < 2) return <span className="t-caption">—</span>;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * (width - 2) + 1},${height - 1 - ((v - min) / span) * (height - 2)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className={emphasis ? "text-pink" : "text-fg-2"}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Meter — a flat bar with the target as a hairline (Studio ratio meters). */
export function Meter({ value, target, max = 100, alert }: { value: number; target?: number; max?: number; alert?: boolean }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="relative h-1.5 bg-block w-full" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={cx("h-full", alert ? "bg-pink" : "bg-fg-2")} style={{ width: `${pct}%` }} />
      {target != null ? <div className="absolute -top-1 h-3.5 w-px bg-fg" style={{ left: `${Math.min(100, (target / max) * 100)}%` }} /> : null}
    </div>
  );
}

// ---------- Markdown (small, safe: headings, lists, bold, italic, links, tables, code) ----------
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\{\{[^}]+\}\})/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${key}-${i++}`;
    if (t.startsWith("**")) out.push(<strong key={k}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={k} className="bg-block px-1">{t.slice(1, -1)}</code>);
    else if (t.startsWith("[")) {
      const mm = t.match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      const safe = /^(https?:|mailto:|\/)/.test(mm[2]) ? mm[2] : "#";
      out.push(
        <a key={k} href={safe} className="underline underline-offset-2" target={safe.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
          {mm[1]}
        </a>,
      );
    } else if (t.startsWith("{{")) out.push(<span key={k} className="bg-pink-soft px-0.5">{t}</span>);
    else out.push(<em key={k}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source, className }: { source: string | null | undefined; className?: string }) {
  if (!source?.trim()) return <p className="t-caption">Nothing written yet.</p>;
  const lines = source.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      blocks.push(
        lvl === 1 ? (
          <h3 key={k++} className="t-title mt-4 mb-2">{inline(h[2], `h${k}`)}</h3>
        ) : (
          <h4 key={k++} className={cx("mt-4 mb-1", lvl === 2 ? "t-headline" : "font-semibold")}>{inline(h[2], `h${k}`)}</h4>
        ),
      );
      i++;
      continue;
    }
    if (/^\|.*\|$/.test(line.trim())) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
        if (!/^\|[\s\-:|]+\|$/.test(lines[i].trim())) rows.push(lines[i].trim().slice(1, -1).split("|").map((c) => c.trim()));
        i++;
      }
      const [head, ...body] = rows;
      blocks.push(
        <table key={k++} className="w-full my-2 border-collapse">
          <thead>
            <tr className="bg-head-bg text-head-fg">{head?.map((c, j) => <th key={j} className="px-2 h-7 text-left text-[10px] uppercase tracking-[0.18em]">{c}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} className="border-b border-rule">
                {r.map((c, j) => (
                  <td key={j} className="px-2 py-1">{inline(c, `t${k}${ri}${j}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""));
        i++;
      }
      const L = ordered ? "ol" : "ul";
      blocks.push(
        <L key={k++} className={cx("my-1.5 pl-5", ordered ? "list-decimal" : "list-[square]")}>
          {items.map((it, j) => (
            <li key={j} className="py-0.5">{inline(it, `l${k}${j}`)}</li>
          ))}
        </L>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|\s*([-*]|\d+\.)\s|\|)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={k++} className="my-1.5 max-w-[72ch]">
        {para.flatMap((p, j) => (j ? [<br key={`b${j}`} />, ...inline(p, `p${k}${j}`)] : inline(p, `p${k}${j}`)))}
      </p>,
    );
  }
  return <div className={cx("leading-[20px]", className)}>{blocks}</div>;
}
