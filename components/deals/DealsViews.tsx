// Deals Board, List and Declined log (§10). Server components built from components/ui.
import Link from "next/link";
import { Table, THead, TH, TR, TD, Block, Caption, EmptyState } from "@/components/ui";
import { DEAL_STAGES } from "@/lib/rules/deals";
import { DEAL_STAGE_LABEL, money, moneyShort, date, humanize, label } from "@/lib/format";
import type { DealRow } from "@/lib/queries/deals";

export function DealsBoard({ rows }: { rows: DealRow[] }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-px min-w-max px-5 pt-4">
        {DEAL_STAGES.map((stage) => {
          const cards = rows.filter((r) => r.stage === stage);
          const sum = cards.reduce((t, r) => t + r.totalPaise, 0);
          return (
            <section key={stage} className="w-[232px] shrink-0" aria-label={label(DEAL_STAGE_LABEL, stage)}>
              <div className="h-8 px-2 flex items-center justify-between bg-head-bg text-head-fg">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]">{label(DEAL_STAGE_LABEL, stage)}</span>
                <span className="text-[11px] num opacity-70">{cards.length ? `${cards.length} · ${moneyShort(sum)}` : ""}</span>
              </div>
              <ul className="space-y-px pt-px min-h-[120px]">
                {cards.map((r) => (
                  <li key={r.id}>
                    <Link href={`/deals/${r.id}`} data-href={`/deals/${r.id}`} className="block focus-visible:outline-offset-[-2px]">
                      <Block className="p-3 hover:bg-raised">
                        <div className="t-caption truncate">{r.brand}</div>
                        <div className="truncate font-semibold">{r.title}</div>
                        <div className="flex items-baseline justify-between gap-2 mt-1">
                          <span className="num">{money(r.totalPaise, r.currency)}</span>
                          <span className="t-caption num">{r.daysInStage}d</span>
                        </div>
                        {r.rungMix ? <div className="t-caption truncate mt-0.5">{r.rungMix}</div> : null}
                        {r.blocker ? <div className="t-caption truncate mt-0.5 text-fg-2" title={r.blocker}>{r.blocker}</div> : null}
                      </Block>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export type SortKey = "brand" | "title" | "stage" | "type" | "total" | "days" | "blocker";

function sortRows(rows: DealRow[], key: SortKey, dir: "asc" | "desc") {
  const v = (r: DealRow): string | number => {
    switch (key) {
      case "brand":
        return r.brand.toLowerCase();
      case "title":
        return r.title.toLowerCase();
      case "stage":
        return DEAL_STAGES.indexOf(r.stage as (typeof DEAL_STAGES)[number]) + (r.stage === "declined" ? 100 : r.stage === "lost" ? 101 : 0);
      case "type":
        return r.type ?? "";
      case "total":
        return r.totalPaise;
      case "days":
        return r.daysInStage;
      case "blocker":
        return r.blocker ?? "~";
    }
  };
  const out = [...rows].sort((a, b) => (v(a) < v(b) ? -1 : v(a) > v(b) ? 1 : 0));
  return dir === "desc" ? out.reverse() : out;
}

function SortTH({ k, children, sort, dir, align }: { k: SortKey; children: string; sort: SortKey; dir: "asc" | "desc"; align?: "right" }) {
  const active = sort === k;
  const nextDir = active && dir === "asc" ? "desc" : "asc";
  return (
    <TH align={align} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}>
      <Link href={`/deals?view=list&sort=${k}&dir=${nextDir}`} scroll={false} className="hover:underline underline-offset-2">
        {children}
        {active ? (dir === "asc" ? " ↑" : " ↓") : ""}
      </Link>
    </TH>
  );
}

export function DealsList({ rows, sort, dir }: { rows: DealRow[]; sort: SortKey; dir: "asc" | "desc" }) {
  const sorted = sortRows(
    rows.filter((r) => r.stage !== "declined"),
    sort,
    dir,
  );
  if (!sorted.length) return <EmptyState>No deals yet.</EmptyState>;
  return (
    <Table>
      <THead>
        <SortTH k="brand" sort={sort} dir={dir}>Brand</SortTH>
        <SortTH k="title" sort={sort} dir={dir}>Title</SortTH>
        <SortTH k="stage" sort={sort} dir={dir}>Stage</SortTH>
        <SortTH k="type" sort={sort} dir={dir}>Type</SortTH>
        <SortTH k="total" sort={sort} dir={dir} align="right">Total</SortTH>
        <TH>Rung mix</TH>
        <SortTH k="days" sort={sort} dir={dir} align="right">Days</SortTH>
        <SortTH k="blocker" sort={sort} dir={dir}>Blocker</SortTH>
      </THead>
      <tbody>
        {sorted.map((r) => (
          <TR key={r.id} href={`/deals/${r.id}`}>
            <TD>{r.brand}</TD>
            <TD className="max-w-[280px] truncate">{r.title}</TD>
            <TD>{label(DEAL_STAGE_LABEL, r.stage)}</TD>
            <TD>{r.type ? humanize(r.type) : "—"}</TD>
            <TD align="right">{money(r.totalPaise, r.currency)}</TD>
            <TD className="text-fg-2">{r.rungMix || "—"}</TD>
            <TD align="right">{r.daysInStage}</TD>
            <TD className="max-w-[300px] truncate text-fg-2" title={r.blocker ?? undefined}>
              {r.stage === "lost" ? <span className="text-fg-3">Lost · {r.lostReason}</span> : (r.blocker ?? "—")}
            </TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}

export function DeclinedLog({ rows }: { rows: DealRow[] }) {
  const declined = rows.filter((r) => r.stage === "declined").sort((a, b) => (a.stageChangedAt < b.stageChangedAt ? 1 : -1));
  if (!declined.length) return <EmptyState>Nothing declined.</EmptyState>;
  return (
    <Table>
      <THead>
        <TH>Brand</TH>
        <TH>Title</TH>
        <TH>Reason</TH>
        <TH align="right">Value</TH>
        <TH align="right">Date</TH>
      </THead>
      <tbody>
        {declined.map((r) => (
          <TR key={r.id} href={`/deals/${r.id}`}>
            <TD>{r.brand}</TD>
            <TD className="max-w-[280px] truncate">{r.title}</TD>
            <TD className="max-w-[360px] truncate">{r.declinedReason ?? "—"}</TD>
            <TD align="right">{money(r.declinedValuePaise, r.currency)}</TD>
            <TD align="right">{date(r.stageChangedAt)}</TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}

export function DealsFooterLine({ pipeline, signed, declined, declinedCount }: { pipeline: number; signed: number; declined: number; declinedCount: number }) {
  return (
    <footer className="px-5 py-3 border-t border-rule mt-auto">
      <Caption>
        Pipeline <span className="text-fg num">{moneyShort(pipeline)}</span> · Signed this quarter <span className="text-fg num">{moneyShort(signed)}</span> · Declined{" "}
        <span className="text-fg num">{moneyShort(declined)}</span> ({declinedCount})
      </Caption>
    </footer>
  );
}

