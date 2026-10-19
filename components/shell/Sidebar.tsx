"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cx } from "@/components/ui/primitives";
import { ThemeToggle } from "@/components/ui/interactive";

export type SideItem = { href: string; label: string; count?: number; alert?: boolean };

export function Sidebar({ items, user, role, brand = "Snoball OS", footer, theme }: { items: SideItem[]; user: string; role: string; brand?: string; footer?: React.ReactNode; theme?: "dark" | "light" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="lg:hidden sticky top-0 z-30 h-12 flex items-center justify-between px-4 bg-bg border-b border-rule no-print">
        <Link href="/" className="t-display text-[15px]">{brand}</Link>
        <button type="button" onClick={() => setOpen((o) => !o)} className="h-8 px-3 bg-block" aria-expanded={open} aria-controls="sidebar">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <aside
        id="sidebar"
        className={cx(
          "no-print w-full lg:w-[220px] shrink-0 border-r border-rule bg-bg flex-col lg:sticky lg:top-0 lg:h-screen",
          open ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="hidden lg:flex items-center gap-2 h-14 px-5 border-b border-rule">
          <span className="w-3 h-3 bg-pink" aria-hidden />
          <Link href="/" className="t-display text-[15px] tracking-tight">{brand}</Link>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("open-palette"))}
          className="mx-3 mt-3 h-8 px-2.5 bg-block text-fg-3 text-left flex items-center justify-between hover:text-fg"
        >
          <span>Go to…</span>
          <kbd className="text-[11px]">⌘K</kbd>
        </button>
        <nav className="flex-1 overflow-y-auto py-3" aria-label="Main">
          <ul>
            {items.map((it) => {
              const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cx("h-8 px-5 flex items-center justify-between", active ? "bg-head-bg text-head-fg font-semibold" : "text-fg-2 hover:text-fg hover:bg-raised")}
                  >
                    <span>{it.label}</span>
                    {it.count ? <span className={cx("num text-[11px]", it.alert && !active ? "text-pink-fg font-bold" : active ? "opacity-70" : "text-fg-3")}>{it.count}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-rule px-5 py-3 space-y-1">
          <div className="truncate">{user}</div>
          <div className="t-caption">{role.replace("_", " ")}</div>
          <div className="flex items-center justify-between -ml-2">
            <ThemeToggle initial={theme} />
            {footer}
          </div>
        </div>
      </aside>
    </>
  );
}
