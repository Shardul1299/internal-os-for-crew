import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCrew } from "@/lib/session";
import { can } from "@/lib/rules/visibility";
import { getConfig } from "@/lib/settings";
import { getCampaign, addCreatorCandidates, DELIVERABLE_STATUS_LABEL, PLATFORM_LABEL, type TrackerRow } from "@/lib/queries/campaigns";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, EmptyState, Meta, Alert, Caption, WithInspector, selHref } from "@/components/ui";
import { KeyRows, SegmentedControl, ActionButton } from "@/components/ui/client";
import { date, humanize, DEAL_STAGE_LABEL, label } from "@/lib/format";
import { addDays, today as todayISO } from "@/lib/dates";
import { AddCreatorsSheet } from "@/components/campaigns/AddCreatorsSheet";
import { CampaignStatusPill } from "@/components/campaigns/pills";
import { DeliverableInspector } from "@/components/campaigns/DeliverableInspector";
import { ReportTab } from "@/components/campaigns/ReportTab";
import { FeedbackTab } from "@/components/campaigns/FeedbackTab";
import { trackFrontseat } from "@/lib/actions/campaigns";
import { PhoneInspector } from "@/components/campaigns/fields";
import { FRONTSEAT_POSTS } from "@/lib/rules/campaigns";

export const metadata = { title: "Campaign" };
export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

function mondayOf(d: string) {
  const day = new Date(`${d}T00:00:00Z`).getUTCDay();
  return addDays(d, -((day + 6) % 7));
}

function groupRows(rows: TrackerRow[], by: "creator" | "week") {
  const groups = new Map<string, { label: string; rows: TrackerRow[] }>();
  for (const r of rows) {
    const when = r.scheduledFor ?? r.dueOn;
    const key = by === "creator" ? r.creatorId : when ? mondayOf(when) : "none";
    const lbl = by === "creator" ? r.creatorName : when ? `Week of ${date(mondayOf(when), "d MMM")}` : "No date";
    const g = groups.get(key) ?? { label: lbl, rows: [] };
    g.rows.push(r);
    groups.set(key, g);
  }
  const arr = [...groups.entries()];
  if (by === "week") arr.sort(([a], [b]) => (a === "none" ? 1 : b === "none" ? -1 : a < b ? -1 : 1));
  return arr.map(([key, g]) => ({ key, ...g }));
}

function blockerLine(r: TrackerRow) {
  const parts = [r.blockers[0], r.warnings[0]].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export default async function CampaignPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const me = await requireCrew("calendars");
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const cfg = await getConfig();
  const data = await getCampaign(cfg, id);
  if (!data) notFound();
  const { campaign, brand, deal, tracker, metrics, credibility, feedback, contacts } = data;
  const canWrite = can(me.role, "writeDeals");
  const dealOpen = !["reported", "paid_in_full", "declined", "lost"].includes(deal.stage);
  const tab = sp.tab === "report" || sp.tab === "feedback" ? sp.tab : "tracker";
  const group = sp.group === "week" ? "week" : "creator";
  const selId = typeof sp.sel === "string" ? sp.sel : null;
  const content = tracker.filter((d) => d.channel !== "frontseat");
  const frontseat = tracker.filter((d) => d.channel === "frontseat");
  const counted = content.filter((d) => d.status !== "cancelled");
  const liveCount = counted.filter((d) => d.status === "live" || d.status === "reported").length;
  const sel = tab === "tracker" && selId ? tracker.find((d) => d.id === selId) ?? null : null;
  const path = `/campaigns/${id}`;
  const t = todayISO();
  const candidates = canWrite && dealOpen ? await addCreatorCandidates(cfg, id) : [];

  const row = (r: TrackerRow) => {
    const overdue = r.dueOn && r.dueOn < t && !["live", "reported", "cancelled"].includes(r.status);
    const line = blockerLine(r);
    return (
      <TR key={r.id} href={selHref(path, sp, r.id)} selected={r.id === selId}>
        <TD className={group === "creator" ? "whitespace-nowrap hidden sm:table-cell" : "whitespace-nowrap"}>{r.creatorName}</TD>
        <TD className="max-w-[240px]">
          <div className="truncate">{r.label}</div>
          <div className="t-caption truncate">{r.title}</div>
        </TD>
        <TD className="hidden md:table-cell">{PLATFORM_LABEL[r.platform] ?? r.platform}</TD>
        <TD className="whitespace-nowrap">{overdue ? <Alert>{date(r.dueOn, "d MMM")}</Alert> : date(r.dueOn, "d MMM")}</TD>
        <TD className="whitespace-nowrap">{DELIVERABLE_STATUS_LABEL[r.status]}</TD>
        <TD className="max-w-[300px]">{line ? <span className="t-caption block truncate" title={line}>{line}</span> : <Meta>—</Meta>}</TD>
      </TR>
    );
  };

  const trackerMain = (
    <>
      <Section>
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <SegmentedControl param="group" value={group} size="sm" options={[{ value: "creator", label: "By creator" }, { value: "week", label: "By week" }]} />
          <Caption>{counted.length} deliverables · {liveCount} live</Caption>
        </div>
      </Section>
      {content.length === 0 ? (
        <EmptyState>No deliverables yet. Add creators to brief one.</EmptyState>
      ) : (
        <KeyRows>
          <Table>
            <THead>
              <TH className={group === "creator" ? "hidden sm:table-cell" : undefined}>Creator</TH>
              <TH>Deliverable</TH>
              <TH className="hidden md:table-cell">Platform</TH>
              <TH>Due</TH>
              <TH>Status</TH>
              <TH>Blocker / warning</TH>
            </THead>
            <tbody>
              {groupRows(content, group).map((g) => [
                <tr key={`g-${g.key}`} className="border-b border-rule">
                  <td colSpan={6} className="px-3 pt-4 pb-1 t-label">
                    {g.label} <span className="text-fg-3">· {g.rows.length}</span>
                  </td>
                </tr>,
                ...g.rows.map(row),
              ])}
            </tbody>
          </Table>
        </KeyRows>
      )}
      {deal.frontseatAmplification || frontseat.length ? (
        <Section title="Frontseat amplification" aside={frontseat.length ? `${frontseat.filter((f) => f.status === "live" || f.status === "reported").length}/${frontseat.length} live` : undefined} flush className="pt-6">
          {frontseat.length ? (
            <KeyRows>
              <Table>
                <THead>
                  <TH>Item</TH>
                  <TH>Due</TH>
                  <TH>Status</TH>
                  <TH>Blocker / warning</TH>
                </THead>
                <tbody>
                  {frontseat.map((r) => (
                    <TR key={r.id} href={selHref(path, sp, r.id)} selected={r.id === selId}>
                      <TD>{r.title}</TD>
                      <TD>{date(r.dueOn, "d MMM")}</TD>
                      <TD>{DELIVERABLE_STATUS_LABEL[r.status]}</TD>
                      <TD>{blockerLine(r) ? <span className="t-caption">{blockerLine(r)}</span> : <Meta>—</Meta>}</TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </KeyRows>
          ) : canWrite ? (
            <div className="px-5">
              <ActionButton action={trackFrontseat} fields={{ campaignId: id }} size="md">
                Track {FRONTSEAT_POSTS} posts
              </ActionButton>
            </div>
          ) : (
            <Caption className="px-5">Not tracked yet.</Caption>
          )}
        </Section>
      ) : null}
    </>
  );

  const inspector = sel ? <DeliverableInspector d={sel} contacts={contacts} metrics={metrics.get(sel.id) ?? null} canWrite={canWrite} /> : undefined;
  return (
    <WithInspector
      closeHref={selHref(path, sp, null)}
      inspector={inspector}
      main={
        <>
          <ScreenHeader
            title={campaign.name.split(" — ")[0]}
            number={counted.length ? `${liveCount}/${counted.length}` : undefined}
            numberCaption={counted.length ? "live" : undefined}
            action={canWrite && dealOpen ? <AddCreatorsSheet campaignId={id} candidates={candidates} deliverables={cfg.deliverables.map((d) => ({ key: d.key, label: d.label }))} defaultOpen={sp.add === "1"} /> : undefined}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {canWrite ? <CampaignStatusPill id={id} value={campaign.status} /> : <span>{humanize(campaign.status)}</span>}
              <Link href={`/brands/${brand.id}`} className="hover:underline underline-offset-2">{brand.name}</Link>
              <Link href={`/deals/${deal.id}`} className="hover:underline underline-offset-2 text-fg-2">
                {deal.title} · {label(DEAL_STAGE_LABEL, deal.stage)}
              </Link>
              <Meta>
                {date(campaign.startsOn, "d MMM")} – {date(campaign.endsOn, "d MMM yyyy")}
              </Meta>
            </div>
          </ScreenHeader>
          <Section className="pb-0">
            <SegmentedControl
              param="tab"
              value={tab}
              options={[
                { value: "tracker", label: "Tracker" },
                { value: "report", label: "Report" },
                { value: "feedback", label: "Feedback", count: feedback.filter((f) => f.kind === "campaign_5q").length || undefined },
              ]}
            />
          </Section>
          {tab === "tracker" ? trackerMain : null}
          {tab === "report" ? <ReportTab campaign={campaign} credibility={credibility} tracker={content} metrics={metrics} canWrite={canWrite} /> : null}
          {tab === "feedback" ? <FeedbackTab campaign={campaign} brand={brand} feedback={feedback} canWrite={canWrite} /> : null}
          <PhoneInspector>{inspector}</PhoneInspector>
        </>
      }
    />
  );
}
