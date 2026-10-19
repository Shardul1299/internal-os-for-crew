"use client";
// Markdown editor, keyboard row navigation (J/K, Enter), copy button, theme toggle.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Markdown } from "./display";
import { cx } from "./primitives";

export function MarkdownEditor({ name, defaultValue = "", rows = 10, placeholder }: { name: string; defaultValue?: string; rows?: number; placeholder?: string }) {
  const [v, setV] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  return (
    <div>
      <div className="flex gap-px mb-px">
        <button type="button" onClick={() => setPreview(false)} className={cx("h-6 px-2 text-[12px]", !preview ? "bg-head-bg text-head-fg" : "bg-block text-fg-2")}>
          Write
        </button>
        <button type="button" onClick={() => setPreview(true)} className={cx("h-6 px-2 text-[12px]", preview ? "bg-head-bg text-head-fg" : "bg-block text-fg-2")}>
          Preview
        </button>
      </div>
      <input type="hidden" name={name} value={v} />
      {preview ? (
        <div className="bg-block p-3 min-h-[120px]">
          <Markdown source={v} />
        </div>
      ) : (
        <textarea
          value={v}
          onChange={(e) => setV(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-block text-fg p-3 outline-none font-mono text-[12px] leading-[18px] resize-y placeholder:text-fg-3"
        />
      )}
    </div>
  );
}

/** J/K moves through rows marked data-href inside; Enter opens the selected row. */
export function KeyRows({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    let idx = -1;
    const rows = () => Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-href]") ?? []);
    const mark = (i: number) => {
      const r = rows();
      r.forEach((el, j) => el.toggleAttribute("data-kb", j === i));
      r[i]?.scrollIntoView({ block: "nearest" });
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const r = rows();
      if (!r.length) return;
      if (e.key === "j") {
        idx = Math.min(r.length - 1, idx + 1);
        mark(idx);
      } else if (e.key === "k") {
        idx = Math.max(0, idx - 1);
        mark(idx);
      } else if (e.key === "Enter" && idx >= 0) {
        const href = r[idx]?.getAttribute("data-href");
        if (href) router.push(href);
      }
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-href]");
      if (!el || (e.target as HTMLElement).closest("a,button,input,select,textarea,label")) return;
      const href = el.getAttribute("data-href");
      if (href) router.push(href);
    };
    window.addEventListener("keydown", onKey);
    const node = ref.current;
    node?.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      node?.removeEventListener("click", onClick);
    };
  }, [router]);
  return (
    <div ref={ref} className={cx("[&_[data-kb]]:bg-pink-soft [&_[data-kb]]:outline [&_[data-kb]]:outline-1 [&_[data-kb]]:outline-pink", className)}>
      {children}
    </div>
  );
}

export function CopyButton({ text, label = "Copy prompt", className }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className={cx("h-9 px-3.5 bg-block text-fg hover:bg-raised", className)}
    >
      {done ? "Copied" : label}
    </button>
  );
}

export function ThemeToggle({ initial = "dark" }: { initial?: "dark" | "light" }) {
  const [theme, setTheme] = useState<"dark" | "light">(initial);
  return (
    <button
      type="button"
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.dataset.theme = next;
        document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
      }}
      className="h-7 px-2 text-fg-3 hover:text-fg text-[12px]"
    >
      {theme === "dark" ? "Light theme" : "Dark theme"}
    </button>
  );
}
