import { requireMe } from "@/lib/session";
import { getCounterpartRows } from "@/lib/queries/program";
import { ScreenHeader, Table, THead, TH, TR, TD, EmptyState, Caption } from "@/components/ui";
import { date, label, STAGE_LABEL } from "@/lib/format";

export const metadata = { title: "Students" };
export const dynamic = "force-dynamic";

// Read-only: opted-in students with stage, Filter total and next shoot. No money, no tier (§7.8).
export default async function CounterpartPage() {
  const me = await requireMe();
  const rows = me.role === "program_counterpart" ? await getCounterpartRows(me.cohortIds) : [];
  const cohorts = [...new Set(rows.map((r) => r.cohort))];
  return (
    <>
      <ScreenHeader title="Students">
        <Caption>{cohorts.length ? cohorts.join(" · ") : "No cohorts shared yet"}</Caption>
      </ScreenHeader>
      {rows.length === 0 ? (
        <EmptyState>No opted-in students yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <TH>Student</TH>
            <TH>Challenge</TH>
            <TH>Brand</TH>
            <TH>Stage</TH>
            <TH align="right">Filter</TH>
            <TH>Next shoot</TH>
          </THead>
          <tbody>
            {rows.map((r) => (
              <TR key={r.entryId}>
                <TD>{r.name}</TD>
                <TD className="text-fg-2">{r.challenge}</TD>
                <TD className="text-fg-2">{r.brand}</TD>
                <TD>{label(STAGE_LABEL, r.stage)}</TD>
                <TD align="right">{r.filterTotal != null ? `${r.filterTotal}/15` : "—"}</TD>
                <TD>{r.nextShoot ? date(r.nextShoot, "EEE d MMM") : "—"}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
