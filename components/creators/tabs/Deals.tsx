// Deals this creator is on: role, stage, their line totals (money roles only).
import { Section, Table, THead, TH, TR, TD, EmptyState } from "@/components/ui";
import { KeyRows } from "@/components/ui/client";
import { DEAL_STAGE_LABEL, money } from "@/lib/format";
import { DEAL_TYPE_LABEL } from "../labels";
import type { creatorDeals } from "@/lib/queries/creators";

export function DealsTab({ rows, showMoney }: { rows: Awaited<ReturnType<typeof creatorDeals>>; showMoney: boolean }) {
  if (!rows.length) return <EmptyState>Not on any deal yet.</EmptyState>;
  const open = rows.filter((r) => r.open);
  return (
    <Section title="Deals" aside={`${open.length} open · ${rows.length} total`} flush>
      <KeyRows>
        <Table>
          <THead>
            <TH>Deal</TH>
            <TH>Brand</TH>
            <TH>Type</TH>
            <TH>Stage</TH>
            <TH>Role</TH>
            <TH>Status</TH>
            <TH align="right">Lines</TH>
            {showMoney ? <TH align="right">Their lines</TH> : null}
          </THead>
          <tbody>
            {rows.map((r) => (
              <TR key={r.id} href={`/deals/${r.id}`}>
                <TD href={`/deals/${r.id}`} className="font-semibold">
                  {r.title}
                </TD>
                <TD className="text-fg-2">{r.brand}</TD>
                <TD className="text-fg-2">{r.type ? DEAL_TYPE_LABEL[r.type] : "—"}</TD>
                <TD className={r.open ? "" : "text-fg-3"}>{DEAL_STAGE_LABEL[r.stage]}</TD>
                <TD>{r.role === "upsell" ? "Upsell" : "Primary"}</TD>
                <TD className="text-fg-2">{r.status === "declined_by_creator" ? "Declined" : r.status === "accepted" ? "Accepted" : "Proposed"}</TD>
                <TD align="right">{r.lineCount}</TD>
                {showMoney ? <TD align="right">{r.lineCount ? money(r.totalPaise, r.currency) : "—"}</TD> : null}
              </TR>
            ))}
          </tbody>
        </Table>
      </KeyRows>
    </Section>
  );
}
