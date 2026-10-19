// Small read-only pieces for the month-end one-pager. Built from Block, Stat and Table only.
import type { ReactNode } from "react";
import { Block, Table, THead, TH, TR, TD, cx } from "@/components/ui";

export function CountTable({ title, rows, labels, className }: { title: string; rows: { key: string; n: number }[]; labels?: Record<string, string>; className?: string }) {
  const total = rows.reduce((t, r) => t + r.n, 0);
  return (
    <Block className={cx("p-0", className)}>
      <div className="px-3 pt-3 pb-2 t-label">{title}</div>
      <Table>
        <tbody>
          {rows.length === 0 ? (
            <TR>
              <TD className="text-fg-3">None</TD>
            </TR>
          ) : (
            rows.map((r) => (
              <TR key={r.key}>
                <TD>{labels?.[r.key] ?? r.key.replace(/_/g, " ")}</TD>
                <TD align="right" className="w-16">{r.n}</TD>
              </TR>
            ))
          )}
          <TR>
            <TD className="text-fg-3">Total</TD>
            <TD align="right" className="w-16 font-semibold">{total}</TD>
          </TR>
        </tbody>
      </Table>
    </Block>
  );
}

export function SimpleTable({ head, rows, empty = "None this month." }: { head: { label: string; right?: boolean }[]; rows: ReactNode[][]; empty?: string }) {
  if (!rows.length) return <p className="t-caption px-5 py-2">{empty}</p>;
  return (
    <Table>
      <THead>
        {head.map((h, i) => (
          <TH key={i} align={h.right ? "right" : "left"}>
            {h.label}
          </TH>
        ))}
      </THead>
      <tbody>
        {rows.map((r, i) => (
          <TR key={i}>
            {r.map((c, j) => (
              <TD key={j} align={head[j]?.right ? "right" : "left"}>
                {c}
              </TD>
            ))}
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
