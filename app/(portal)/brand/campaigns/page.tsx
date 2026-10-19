import { requireMe } from "@/lib/session";
import { portalCampaigns } from "@/lib/queries/brand-portal";
import { ScreenHeader, Table, THead, TH, TR, TD, EmptyState, Meta, Alert } from "@/components/ui";
import { KeyRows } from "@/components/ui/client";
import { date, humanize } from "@/lib/format";

export const metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";

export default async function BrandCampaignsPage() {
  const me = await requireMe();
  const rows = await portalCampaigns(me.brandId!);
  const awaiting = rows.reduce((t, r) => t + r.awaitingApproval, 0);
  return (
    <>
      <ScreenHeader title="Campaigns" number={awaiting || undefined} numberCaption={awaiting ? "drafts await your approval" : undefined} />
      {rows.length === 0 ? (
        <EmptyState>No campaigns yet.</EmptyState>
      ) : (
        <KeyRows>
          <Table>
            <THead>
              <TH>Campaign</TH>
              <TH>Status</TH>
              <TH className="hidden md:table-cell">Dates</TH>
              <TH align="right">Live</TH>
              <TH>Approvals</TH>
            </THead>
            <tbody>
              {rows.map((c) => (
                <TR key={c.id} href={`/brand/campaigns/${c.id}`}>
                  <TD className="font-semibold">{c.name}</TD>
                  <TD>{humanize(c.status)}</TD>
                  <TD className="hidden md:table-cell">
                    <Meta>
                      {date(c.startsOn, "d MMM")} – {date(c.endsOn, "d MMM yyyy")}
                    </Meta>
                  </TD>
                  <TD align="right">
                    {c.liveCount}/{c.deliverableCount}
                  </TD>
                  <TD>{c.awaitingApproval ? <Alert>{c.awaitingApproval} waiting</Alert> : <Meta>—</Meta>}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </KeyRows>
      )}
    </>
  );
}
