// Inspector — the right-hand pane for context without leaving the list (§2, §13.4: 320 wide, collapsible).
// Pages render <WithInspector main={...} inspector={...} />; the selection lives in ?sel=.
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "./primitives";

export function WithInspector({ main, inspector, closeHref }: { main: ReactNode; inspector?: ReactNode; closeHref?: string }) {
  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex-1 min-w-0">{main}</div>
      {inspector ? (
        <aside aria-label="Inspector" className="hidden lg:block w-[320px] shrink-0 border-l border-rule bg-raised sticky top-0 h-screen overflow-y-auto">
          {closeHref ? (
            <div className="flex justify-end px-2 pt-2">
              <Link href={closeHref} scroll={false} aria-label="Close inspector" className="w-7 h-7 inline-flex items-center justify-center text-fg-3 hover:text-fg hover:bg-block">
                <svg width="10" height="10" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </Link>
            </div>
          ) : null}
          <div className="px-4 pb-6">{inspector}</div>
        </aside>
      ) : null}
    </div>
  );
}

export function InspectorTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-3">
      <div className={cx("t-title leading-[24px]")}>{children}</div>
      {sub ? <div className="t-caption mt-1">{sub}</div> : null}
    </div>
  );
}

/** Builds the href that selects a row into the Inspector while keeping other params. */
export function selHref(pathname: string, sp: Record<string, string | string[] | undefined>, id: string | null) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== "sel") p.set(k, v);
  if (id) p.set("sel", id);
  const q = p.toString();
  return q ? `${pathname}?${q}` : pathname;
}
