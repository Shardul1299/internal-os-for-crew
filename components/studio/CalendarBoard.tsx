"use client";
// Calendar board (BRIEF §19.3, §13.8): one column per Studio status, drag to move or use the status menu.
// Justification (CLAUDE.md): the board view replaces Upcreate's Pipeline on real calendar items.
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MenuPill, useResultFeedback } from "@/components/ui/client";
import { cx } from "@/components/ui";
import { moveCalendarItem } from "@/lib/actions/studio-calendar";
import { STUDIO_STATUS, STATUS_LABEL } from "./labels";

export type BoardItem = { id: string; date: string; dateLabel: string; title: string; kind: string; status: string; crew: boolean; clearance: string | null };

export function CalendarBoard({ items }: { items: BoardItem[] }) {
  const router = useRouter();
  const feedback = useResultFeedback();
  const [over, setOver] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [, start] = useTransition();
  const move = async (id: string, to: string) => {
    setErr(null);
    const r = await moveCalendarItem(id, to);
    if (!r.ok) setErr(r.error);
    else feedback(r);
    router.refresh();
    return r.ok ? { ok: true } : { ok: false, error: r.error };
  };
  return (
    <div>
      {err ? (
        <p className="t-caption text-pink-fg px-5 pb-2" role="alert">
          {err}
        </p>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-px bg-rule border-y border-rule">
        {STUDIO_STATUS.map((st) => {
          const col = items.filter((i) => i.status === st);
          return (
            <section
              key={st}
              aria-label={STATUS_LABEL[st]}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(st);
              }}
              onDragLeave={() => setOver((o) => (o === st ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = e.dataTransfer.getData("text/plain");
                if (id && items.find((i) => i.id === id)?.status !== st) start(() => void move(id, st));
              }}
              className={cx("bg-bg min-h-[240px] flex flex-col", over === st && "bg-pink-soft")}
            >
              <header className="h-8 px-3 flex items-center justify-between bg-head-bg text-head-fg">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]">{STATUS_LABEL[st]}</span>
                <span className="num text-[11px] opacity-70">{col.length}</span>
              </header>
              <ul className="flex-1">
                {col.map((i) => (
                  <li
                    key={i.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", i.id)}
                    className={cx("px-3 py-2 border-b border-rule cursor-grab hover:bg-raised", i.kind === "sponsored" && "border-l border-dotted border-l-fg-2", i.kind === "anchor" && "font-semibold")}
                  >
                    <div className="t-caption num">{i.dateLabel}</div>
                    <Link href={`/studio/calendar/${i.id}`} className="block truncate hover:underline underline-offset-2">
                      {i.title}
                    </Link>
                    {i.crew ? <div className="t-caption">Crew</div> : null}
                    {i.clearance ? <div className="t-caption">{i.clearance}</div> : null}
                    <div className="mt-1">
                      <MenuPill value={i.status} label="Move" options={STUDIO_STATUS.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} onSelect={(v) => move(i.id, v)} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
