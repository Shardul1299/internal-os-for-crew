import { notFound } from "next/navigation";
import { requireBrand } from "@/lib/session";
import { portalCampaign } from "@/lib/queries/brand-portal";
import { PLATFORM_LABEL } from "@/lib/queries/campaigns";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, EmptyState, Meta, ButtonLink } from "@/components/ui";
import { date, humanize } from "@/lib/format";

export const metadata = { title: "Campaign" };
export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = { briefed: "Briefed", drafting: "Drafting", in_review: "Awaiting you", approved: "Approved", scheduled: "Scheduled", live: "Live", reported: "Reported" };

export default async function BrandCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireBrand();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const data = await portalCampaign(me.brandId, id);
  if (!data) notFound();
  const { campaign, deliverables } = data;
  const waiting = deliverables.filter((d) => d.status === "in_review" && !d.claimsApproved).length;
  return (
    <>
      <ScreenHeader title={campaign.name.split(" — ")[0]} action={waiting ? <ButtonLink href="/brand/approvals" variant="primary">Review {waiting}</ButtonLink> : undefined}>
        <span>{campaign.name}</span>
        <span className="t-caption ml-3">
          {humanize(campaign.status)} · {date(campaign.startsOn, "d MMM")} – {date(campaign.endsOn, "d MMM yyyy")}
        </span>
      </ScreenHeader>
      {deliverables.length === 0 ? (
        <EmptyState>Deliverables appear here once briefed.</EmptyState>
      ) : (
        <Section flush>
          <Table>
            <THead>
              <TH>Creator</TH>
              <TH>Deliverable</TH>
              <TH className="hidden md:table-cell">Platform</TH>
              <TH>Due</TH>
              <TH>Status</TH>
              <TH>Note</TH>
            </THead>
            <tbody>
              {deliverables.map((d) => (
                <TR key={d.id}>
                  <TD className="whitespace-nowrap">{d.creatorName}</TD>
                  <TD>{d.deliverable}</TD>
                  <TD className="hidden md:table-cell">{PLATFORM_LABEL[d.platform] ?? d.platform}</TD>
                  <TD className="whitespace-nowrap">{date(d.scheduledFor ?? d.dueOn, "d MMM")}</TD>
                  <TD className="whitespace-nowrap">
                    {d.liveUrl ? (
                      <a href={d.liveUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                        {STATUS[d.status] ?? humanize(d.status)}
                      </a>
                    ) : (
                      (STATUS[d.status] ?? humanize(d.status))
                    )}
                  </TD>
                  <TD className="max-w-[280px]">{d.warning ? <span className="t-caption">{d.warning} — not contractual</span> : <Meta>—</Meta>}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </Section>
      )}
    </>
  );
}
