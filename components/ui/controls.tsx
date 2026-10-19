"use client";
// Interactive controls: segmented control, rung control (five segments, active one pink),
// score control (1–5), search field with tokens, stage pill / status menu.
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, useRef, useEffect, type ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cx } from "./primitives";

export function SegmentedControl({
  options,
  value,
  param = "seg",
  onChange,
  size = "md",
}: {
  options: { value: string; label: string; count?: number }[];
  value: string;
  param?: string;
  onChange?: (v: string) => void;
  size?: "sm" | "md";
}) {
  const pathname = usePathname();
  const sp = useSearchParams();
  return (
    <div role="tablist" className="inline-flex bg-block p-0.5 gap-0.5 max-w-full overflow-x-auto">
      {options.map((o) => {
        const active = o.value === value;
        const cls = cx(
          "px-3 whitespace-nowrap inline-flex items-center gap-1.5",
          size === "sm" ? "h-6 text-[12px]" : "h-7",
          active ? "bg-head-bg text-head-fg font-semibold" : "text-fg-2 hover:text-fg",
        );
        const inner = (
          <>
            {o.label}
            {o.count != null ? <span className={cx("num text-[11px]", active ? "opacity-70" : "text-fg-3")}>{o.count}</span> : null}
          </>
        );
        if (onChange)
          return (
            <button key={o.value} type="button" role="tab" aria-selected={active} className={cls} onClick={() => onChange(o.value)}>
              {inner}
            </button>
          );
        const next = new URLSearchParams(sp.toString());
        if (o.value === "all" || o.value === "") next.delete(param);
        else next.set(param, o.value);
        next.delete("sel");
        const qs = next.toString();
        return (
          <Link key={o.value} role="tab" aria-selected={active} href={qs ? `${pathname}?${qs}` : pathname} className={cls} scroll={false}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

export type RungOption = { key: string; label: string; pct: number };

/** Rung control — five segments, the active one pink. */
export function RungControl({ rungs, value, onChange, name, disabled }: { rungs: RungOption[]; value: string; onChange?: (v: string) => void; name?: string; disabled?: boolean }) {
  const [v, setV] = useState(value);
  return (
    <div className="inline-flex gap-px bg-rule" role="radiogroup" aria-label="Rung">
      {name ? <input type="hidden" name={name} value={v} /> : null}
      {rungs.map((r) => {
        const active = r.key === v;
        return (
          <button
            key={r.key}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => {
              setV(r.key);
              onChange?.(r.key);
            }}
            className={cx("h-8 px-2.5 text-[12px] leading-tight text-left min-w-[68px]", active ? "bg-pink text-on-pink font-semibold" : "bg-block text-fg-2 hover:text-fg")}
          >
            <span className="block">{r.label}</span>
            <span className={cx("block text-[10px] num", active ? "opacity-80" : "text-fg-3")}>{r.pct === 0 ? "0" : `${r.pct > 0 ? "+" : "−"}${Math.abs(r.pct)}%`}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Score control — 1–5, three per Filter. */
export function ScoreControl({ label, name, value, onChange }: { label: string; name?: string; value: number | null; onChange?: (v: number) => void }) {
  const [v, setV] = useState<number | null>(value);
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-fg-2">{label}</span>
      {name ? <input type="hidden" name={name} value={v ?? ""} /> : null}
      <div className="inline-flex gap-px bg-rule" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={v === n}
            onClick={() => {
              setV(n);
              onChange?.(n);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" && n < 5) (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
              if (e.key === "ArrowLeft" && n > 1) (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
            }}
            className={cx("w-8 h-8 num", v === n ? "bg-head-bg text-head-fg font-bold" : v != null && n <= v ? "bg-raised text-fg" : "bg-block text-fg-3 hover:text-fg")}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Search field with tokens: `sub:ai_educator tier:T1 src:program lang:hinglish`. */
export function SearchField({ placeholder = "Search", param = "q", tokens = [] }: { placeholder?: string; param?: string; tokens?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get(param) ?? "");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <form
      role="search"
      className="relative w-full max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        const next = new URLSearchParams(sp.toString());
        if (q.trim()) next.set(param, q.trim());
        else next.delete(param);
        next.delete("sel");
        router.push(`${pathname}?${next.toString()}`);
      }}
    >
      <input
        ref={ref}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-8 pl-8 pr-2 bg-block text-fg outline-none placeholder:text-fg-3"
      />
      <svg aria-hidden className="absolute left-2.5 top-2.5 text-fg-3" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l3.5 3.5" />
      </svg>
      {tokens.length ? <span className="sr-only">Tokens: {tokens.join(", ")}</span> : null}
    </form>
  );
}

export type MenuOption = { value: string; label: string; disabledReason?: string | null; hint?: string };

/**
 * Stage pill / status menu. Shows the current value; the menu lists allowed moves.
 * A blocked move shows its one-line reason and can't be picked.
 */
export function MenuPill({
  value,
  label,
  options,
  onSelect,
  tone = "plain",
  caption,
}: {
  value: string;
  label: string;
  options: MenuOption[];
  onSelect: (v: string) => Promise<{ ok: boolean; error?: string } | void>;
  tone?: "plain" | "alert";
  caption?: ReactNode;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            disabled={pending}
            className={cx("h-7 px-2.5 inline-flex items-center gap-2 bg-block hover:bg-raised", tone === "alert" ? "text-pink-fg font-semibold" : "text-fg")}
            aria-label={`${label}: change`}
          >
            {pending ? "Saving…" : label}
            <svg aria-hidden width="8" height="8" viewBox="0 0 8 8" className="text-fg-3">
              <path d="M1 2.5l3 3 3-3" stroke="currentColor" fill="none" strokeWidth="1.4" />
            </svg>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" sideOffset={4} className="z-50 min-w-[220px] max-w-[340px] bg-raised border border-rule py-1">
            {options.length === 0 ? <div className="px-3 py-2 t-caption">No moves from here.</div> : null}
            {options.map((o) => (
              <DropdownMenu.Item
                key={o.value}
                disabled={!!o.disabledReason || o.value === value}
                onSelect={() =>
                  start(async () => {
                    setErr(null);
                    const r = await onSelect(o.value);
                    if (r && !r.ok) setErr(r.error ?? "Couldn't save");
                  })
                }
                className="px-3 py-1.5 outline-none cursor-pointer data-[highlighted]:bg-pink-soft data-[disabled]:cursor-not-allowed"
              >
                <div className={cx(o.disabledReason ? "text-fg-3" : "text-fg")}>{o.label}</div>
                {o.disabledReason ? <div className="t-caption">{o.disabledReason}</div> : o.hint ? <div className="t-caption">{o.hint}</div> : null}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {err ? <span className="t-caption text-pink-fg" role="alert">{err}</span> : caption ? <span className="t-caption">{caption}</span> : null}
    </span>
  );
}
