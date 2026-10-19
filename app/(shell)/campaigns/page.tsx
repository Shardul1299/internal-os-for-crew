import { requireCrew } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { listCampaigns } from "@/lib/queries/campaigns";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, EmptyState, Meta, Alert } from "@/components/ui";
import { KeyRows, SegmentedControl } from "@/components/ui/client";
import { date, humanize, label, DEAL_STAGE_LABEL } from "@/lib/format";

export const metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";

const STATUSES = ["planning", "active", "reporting", "closed"];

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireCrew("calendars");
  const sp = await searchParams;
  const status = typeof sp.status === "string" && STATUSES.includes(sp.status) ? sp.status : undefined;
  const cfg = await getConfig();
  const [rows, all] = await Promise.all([listCampaigns(cfg, status), status ? listCampaigns(cfg) : null]);
  const every = all ?? rows;
  const blocked = every.reduce((t, r) => t + r.blockedCount, 0);
  return (
    <>
      <ScreenHeader title="Campaigns" number={blocked || undefined} numberCaption={blocked ? "deliverables blocked" : undefined} />
      <Section>
        <SegmentedControl
          param="status"
          value={status ?? "all"}
          options={[{ value: "all", label: "All", count: every.length }, ...STATUSES.map((s) => ({ value: s, label: humanize(s), count: every.filter((r) => r.status === s).length }))]}
        />
      </Section>
      {rows.length === 0 ? (
        <EmptyState>{status ? "No campaigns here." : "No campaigns yet. Deals create them at production."}</EmptyState>
      ) : (
        <KeyRows>
          <Table>
            <THead>
              <TH>Campaign</TH>
              <TH>Brand</TH>
              <TH className="hidden md:table-cell">Deal</TH>
              <TH>Status</TH>
              <TH className="hidden md:table-cell">Dates</TH>
              <TH align="right">Live</TH>
              <TH>Next blocker</TH>
            </THead>
            <tbody>
              {rows.map((r) => (
                <TR key={r.id} href={`/campaigns/${r.id}`}>
                  <TD className="font-semibold max-w-[280px] truncate">{r.name}</TD>
                  <TD>{r.brandName}</TD>
                  <TD className="hidden md:table-cell max-w-[220px] truncate">
                    <span className="text-fg-2">{label(DEAL_STAGE_LABEL, r.dealStage)}</span>
                    {r.dealTitle !== r.name ? <span className="t-caption ml-2">{r.dealTitle}</span> : null}
                  </TD>
                  <TD>{humanize(r.status)}</TD>
                  <TD className="hidden md:table-cell whitespace-nowrap">
                    <Meta>
                      {date(r.startsOn, "d MMM")} – {date(r.endsOn, "d MMM")}
                    </Meta>
                  </TD>
                  <TD align="right">
                    {r.liveCount}/{r.deliverableCount}
                  </TD>
                  <TD className="max-w-[320px] truncate">{r.nextBlocker ? <><Alert>Blocked</Alert> <span className="t-caption">{r.nextBlocker}</span></> : <Meta>—</Meta>}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </KeyRows>
      )}
    </>
  );
}
