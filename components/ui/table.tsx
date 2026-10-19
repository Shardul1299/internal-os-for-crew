// Table and List — hairline separators, header row as a beige block with ink caps labels,
// right-aligned numerals, 36-pt dense rows (§13.4).
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./primitives";

export function Table({ className, children, ...rest }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table {...rest} className={cx("w-full border-collapse text-left num", className)}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="bg-head-bg text-head-fg">{children}</tr>
    </thead>
  );
}

export function TH({ children, align = "left", className, ...rest }: { align?: "left" | "right" | "center" } & ComponentProps<"th">) {
  return (
    <th
      {...rest}
      className={cx("h-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] whitespace-nowrap", align === "right" && "text-right", align === "center" && "text-center", className)}
    >
      {children}
    </th>
  );
}

export function TR({ children, className, href, selected, ...rest }: { href?: string; selected?: boolean } & ComponentProps<"tr">) {
  return (
    <tr
      {...rest}
      data-href={href}
      aria-selected={selected || undefined}
      className={cx("h-9 border-b border-rule group", href && "cursor-pointer hover:bg-raised", selected && "bg-pink-soft", className)}
    >
      {children}
    </tr>
  );
}

export function TD({ children, align = "left", className, href, ...rest }: { align?: "left" | "right" | "center"; href?: string } & ComponentProps<"td">) {
  const inner = href ? (
    <Link href={href} className="block truncate hover:underline underline-offset-2">
      {children}
    </Link>
  ) : (
    children
  );
  return (
    <td {...rest} className={cx("px-3 py-1.5 align-middle", align === "right" && "text-right", align === "center" && "text-center", className)}>
      {inner}
    </td>
  );
}

/** List — one row = one line + one hover action. */
export function List({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cx("border-t border-rule", className)}>{children}</ul>;
}

export function ListRow({
  href,
  title,
  meta,
  action,
  lead,
  tone,
}: {
  href?: string;
  title: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  lead?: ReactNode;
  tone?: "alert";
}) {
  const body = (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {lead ? <span className={cx("shrink-0 w-24 t-callout", tone === "alert" ? "text-pink-fg font-semibold" : "text-fg-3")}>{lead}</span> : null}
      <span className="truncate">{title}</span>
      {meta ? <span className="ml-auto shrink-0 t-callout text-fg-3 num">{meta}</span> : null}
    </div>
  );
  return (
    <li className="group flex items-center gap-3 h-9 px-5 border-b border-rule hover:bg-raised">
      {href ? (
        <Link href={href} className="flex items-center min-w-0 flex-1 focus-visible:outline-offset-[-2px]">
          {body}
        </Link>
      ) : (
        body
      )}
      {action ? <span className="shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">{action}</span> : null}
    </li>
  );
}
