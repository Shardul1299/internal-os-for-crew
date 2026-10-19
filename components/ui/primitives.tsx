// Crew design system primitives — BRIEF §13. Square, flat, text-minimal.
// Pink is a scalpel: the primary action, one number per screen, overdue/blocked words, the active rung.
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** One title, one primary action, optionally the screen's one pink number. */
export function ScreenHeader({
  title,
  number,
  numberCaption,
  action,
  children,
}: {
  title: string;
  number?: ReactNode;
  numberCaption?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="px-5 pt-6 pb-4 border-b border-rule">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          <h1 className="t-display title-in text-[clamp(30px,4.2vw,52px)] leading-[0.9] text-fg">{title}</h1>
          {children ? <div className="mt-2 text-fg-2">{children}</div> : null}
        </div>
        <div className="flex items-end gap-6">
          {number != null ? (
            <div className="text-right">
              <div className="t-big text-pink-fg num">{number}</div>
              {numberCaption ? <div className="t-caption mt-1">{numberCaption}</div> : null}
            </div>
          ) : null}
          {action ? <div className="no-print pb-1">{action}</div> : null}
        </div>
      </div>
    </header>
  );
}

/** A titled region. `flush` lets lists and tables run edge to edge under an inset title. */
export function Section({ title, aside, children, className, flush }: { title?: string; aside?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={cx(flush ? "py-4" : "px-5 py-4", className)}>
      {title ? (
        <div className={cx("flex items-baseline justify-between mb-2 gap-4", flush && "px-5")}>
          <h2 className="t-label">{title}</h2>
          {aside ? <div className="t-caption">{aside}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Block — square flat fill, ink-3 or beige. */
export function Block({ tone = "ink", className, children, ...rest }: { tone?: "ink" | "beige" } & ComponentProps<"div">) {
  return (
    <div {...rest} className={cx(tone === "beige" ? "bg-head-bg text-head-fg" : "bg-block text-fg", "p-4", className)}>
      {children}
    </div>
  );
}

type BtnVariant = "primary" | "plain" | "quiet" | "danger";
const btn: Record<BtnVariant, string> = {
  primary: "bg-pink text-on-pink font-semibold hover:brightness-110",
  plain: "bg-block text-fg hover:bg-raised",
  quiet: "text-fg-2 hover:text-fg hover:bg-block",
  danger: "bg-block text-pink-fg font-semibold hover:bg-raised",
};

export function Button({ variant = "plain", className, size = "md", ...rest }: { variant?: BtnVariant; size?: "sm" | "md" } & ComponentProps<"button">) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none disabled:opacity-40 disabled:cursor-not-allowed",
        size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-9 px-3.5",
        btn[variant],
        className,
      )}
    />
  );
}

export function ButtonLink({ variant = "plain", className, size = "md", ...rest }: { variant?: BtnVariant; size?: "sm" | "md" } & ComponentProps<typeof Link>) {
  return (
    <Link
      {...rest}
      className={cx("inline-flex items-center justify-center gap-2 whitespace-nowrap", size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-9 px-3.5", btn[variant], className)}
    />
  );
}

/** Inline caption — one grey line (blockers, gates, consequences). `tone="alert"` turns the leading word pink. */
export function Caption({ children, tone = "plain", className }: { children: ReactNode; tone?: "plain" | "alert" | "warn"; className?: string }) {
  return (
    <p className={cx("t-caption", tone === "alert" && "text-pink-fg", tone === "warn" && "text-fg-2", className)} role={tone === "alert" ? "alert" : undefined}>
      {children}
    </p>
  );
}

/** Empty-state sentence. */
export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="px-5 py-12">
      <p className="t-headline text-fg-2">{children}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

/** Pink emphasis word — overdue, blocked. */
export function Alert({ children }: { children: ReactNode }) {
  return <span className="text-pink-fg font-semibold">{children}</span>;
}

export function Label({ children, pink }: { children: ReactNode; pink?: boolean }) {
  return <span className={cx("t-label", pink && "text-pink-fg")}>{children}</span>;
}

export function Kv({ k, v, className }: { k: string; v: ReactNode; className?: string }) {
  return (
    <div className={cx("grid grid-cols-[132px_1fr] gap-3 py-1.5 border-b border-rule last:border-0", className)}>
      <dt className="text-fg-3">{k}</dt>
      <dd className="min-w-0 break-words">{v ?? "—"}</dd>
    </div>
  );
}

export function Kvs({ children }: { children: ReactNode }) {
  return <dl>{children}</dl>;
}

/** Grey metadata (e.g. follower counts — never used in pricing or tiering). */
export function Meta({ children }: { children: ReactNode }) {
  return <span className="text-fg-3 num">{children}</span>;
}

export function Stat({ label, value, caption, emphasis }: { label: string; value: ReactNode; caption?: ReactNode; emphasis?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="t-label">{label}</div>
      <div className={cx("t-display text-[28px] leading-[1.05] mt-1 num", emphasis ? "text-pink-fg" : "text-fg")}>{value}</div>
      {caption ? <div className="t-caption mt-1">{caption}</div> : null}
    </div>
  );
}

export function Divider() {
  return <hr className="border-0 border-t border-rule my-0" />;
}
