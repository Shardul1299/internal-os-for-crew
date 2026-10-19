// Compact stacked field for the 320-wide Inspector and sheets (label above control). Presentational only.
import type { ReactNode } from "react";
import { cx } from "@/components/ui";

export function StackField({ label, children, className, small }: { label: string; children: ReactNode; className?: string; small?: boolean }) {
  return (
    <label className={cx("block py-1", className)}>
      <span className={cx("block mb-1", small ? "t-caption" : "text-fg-2 text-[12px]")}>{label}</span>
      {children}
    </label>
  );
}

/** A hairline-separated group inside the Inspector with a small caps label. */
export function InspectorGroup({ label, children, aside }: { label: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="border-t border-rule pt-3 mt-3">
      <div className="flex items-baseline justify-between mb-1.5 gap-2">
        <span className="t-label">{label}</span>
        {aside ? <span className="t-caption">{aside}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** The Inspector is a right pane from lg up; below that the same content stacks under the list. */
export function PhoneInspector({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <div className="lg:hidden border-t border-rule bg-raised px-4 py-5">{children}</div>;
}
