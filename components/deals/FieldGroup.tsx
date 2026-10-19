// A form row like components/ui Field, but a <div> + group label: for rows holding several controls
// (toggle lists, ranges) where a wrapping <label> would nest labels.
import type { ReactNode } from "react";

export function FieldGroup({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-x-4 gap-y-1 min-h-11 py-1">
      <span className="text-fg-2 pt-2">{label}</span>
      <div className="min-w-0">
        {children}
        {hint ? <span className="t-caption block mt-1">{hint}</span> : null}
      </div>
    </div>
  );
}
