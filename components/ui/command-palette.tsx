"use client";
// ⌘K command palette — go to any screen, create in context, find creators, deals and brands.
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cx } from "./primitives";

export type Command = { id: string; label: string; group: string; href: string; keywords?: string };

export function CommandPalette({ commands, searchUrl }: { commands: Command[]; searchUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Command[]>([]);
  const [idx, setIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        const t = e.target as HTMLElement;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
        const el = document.querySelector<HTMLElement>("[data-new]");
        if (el) {
          e.preventDefault();
          el.click();
        }
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!searchUrl || q.trim().length < 2) return;
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${searchUrl}?q=${encodeURIComponent(q.trim())}`, { signal: ctl.signal });
        if (r.ok) setHits(await r.json());
      } catch {
        /* aborted */
      }
    }, 140);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q, searchUrl]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = needle ? commands.filter((c) => `${c.label} ${c.keywords ?? ""} ${c.group}`.toLowerCase().includes(needle)) : commands;
    return [...base.slice(0, 12), ...(needle.length >= 2 ? hits : [])];
  }, [q, commands, hits]);

  const go = (c: Command | undefined) => {
    if (!c) return;
    setOpen(false);
    setQ("");
    router.push(c.href);
  };

  let lastGroup = "";
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          className="fixed z-50 left-1/2 top-[14vh] -translate-x-1/2 w-[calc(100%-32px)] max-w-[560px] bg-raised border border-rule outline-none"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Dialog.Description className="sr-only">Go to a screen or find a record</Dialog.Description>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(list.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(list[idx]);
              }
            }}
            placeholder="Go to, create or find…"
            className="w-full h-12 px-4 bg-transparent border-b border-rule outline-none text-[15px] placeholder:text-fg-3"
          />
          <ul className="max-h-[50vh] overflow-y-auto py-1" role="listbox">
            {list.length === 0 ? <li className="px-4 py-3 t-caption">No matches.</li> : null}
            {list.map((c, i) => {
              const header = c.group !== lastGroup ? c.group : null;
              lastGroup = c.group;
              return (
                <li key={`${c.group}-${c.id}`} role="option" aria-selected={i === idx}>
                  {header ? <div className="t-label px-4 pt-2 pb-1">{header}</div> : null}
                  <button
                    type="button"
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => go(c)}
                    className={cx("w-full text-left px-4 h-8 flex items-center", i === idx ? "bg-pink-soft text-fg" : "text-fg-2")}
                  >
                    {c.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
