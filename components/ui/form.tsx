// Form rows (44-pt), number field with unit, toggle with one-line description.
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./primitives";

const control = "w-full h-9 px-2.5 bg-block text-fg border-0 outline-none focus-visible:outline-2 placeholder:text-fg-3";

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cx("grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-x-4 gap-y-1 min-h-11 py-1", className)}>
      <span className="text-fg-2 pt-2">{label}</span>
      <span className="min-w-0">
        {children}
        {hint ? <span className="t-caption block mt-1">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input {...rest} className={cx(control, className)} />;
}

export function Textarea({ className, rows = 4, ...rest }: ComponentProps<"textarea">) {
  return <textarea rows={rows} {...rest} className={cx(control, "h-auto py-2 leading-[18px] resize-y", className)} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <select {...rest} className={cx(control, "pr-7 appearance-none bg-no-repeat bg-[right_8px_center]", className)} style={{ backgroundImage: "linear-gradient(45deg, transparent 50%, var(--fg-3) 50%), linear-gradient(135deg, var(--fg-3) 50%, transparent 50%)", backgroundSize: "4px 4px, 4px 4px", backgroundPosition: "calc(100% - 13px) 16px, calc(100% - 9px) 16px" }}>
      {children}
    </select>
  );
}

/** Number field with unit. Money fields take rupees and are stored as paise by the action. */
export function NumberField({ unit, className, ...rest }: { unit?: string } & ComponentProps<"input">) {
  return (
    <span className={cx("flex items-stretch", className)}>
      {unit === "₹" ? <span className="h-9 px-2 bg-block text-fg-3 flex items-center">₹</span> : null}
      <input type="number" inputMode="decimal" {...rest} className={cx(control, "num text-right")} />
      {unit && unit !== "₹" ? <span className="h-9 px-2 bg-block text-fg-3 flex items-center whitespace-nowrap">{unit}</span> : null}
    </span>
  );
}

/** Toggle with one-line description. */
export function Toggle({ label, description, className, ...rest }: { label: string; description?: string } & Omit<ComponentProps<"input">, "type">) {
  return (
    <label className={cx("flex items-start gap-3 py-2 cursor-pointer group", className)}>
      <input type="checkbox" {...rest} className="peer sr-only" />
      <span
        aria-hidden
        className="mt-0.5 shrink-0 w-8 h-4 bg-block relative transition-colors peer-checked:bg-pink peer-focus-visible:outline-2 peer-focus-visible:outline-pink after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-fg-3 after:transition-transform peer-checked:after:translate-x-4 peer-checked:after:bg-on-pink"
      />
      <span>
        <span className="block">{label}</span>
        {description ? <span className="t-caption block">{description}</span> : null}
      </span>
    </label>
  );
}

export function FormGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("divide-y divide-rule", className)}>{children}</div>;
}
