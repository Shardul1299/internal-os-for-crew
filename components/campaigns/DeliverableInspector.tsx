// Deliverable Inspector (Crew side): status gated by canTransitionDeliverable with reasons shown,
// scheduled date, disclosure, claims, revision round, draft, live URL, metrics.
import { InspectorTitle, Kvs, Kv, Caption, Alert, Markdown } from "@/components/ui";
import { date, int } from "@/lib/format";
import { getConfig } from "@/lib/settings";
import { statusMoves, DELIVERABLE_STATUS_LABEL, PLATFORM_LABEL, type TrackerRow } from "@/lib/queries/campaigns";
import type * as s from "@/lib/db/schema";
import { DeliverableStatusPill } from "./pills";
import { ScheduleForm, ClaimsForm, RequestChangesForm, DetailsForm, MetricsForm } from "./DeliverableForms";
import { InspectorGroup } from "./fields";

const DISCLOSURE: Record<string, string> = { asci: "ASCI", ftc: "FTC", both: "ASCI and FTC" };

export async function DeliverableInspector({
  d,
  contacts,
  metrics,
  canWrite,
}: {
  d: TrackerRow;
  contacts: (typeof s.brandContacts.$inferSelect)[];
  metrics: typeof s.deliverableMetrics.$inferSelect | null;
  canWrite: boolean;
}) {
  const cfg = await getConfig();
  const moves = canWrite ? await statusMoves(cfg, d) : [];
  const reason = d.blockers[0] ?? null;
  const warning = d.warnings[0] ?? null;
  const approver = contacts.find((c) => c.id === d.approvedByContactId)?.name;
  const live = d.status === "live" || d.status === "reported";
  return (
    <div>
      <InspectorTitle sub={`${d.creatorName} · ${d.label} · ${PLATFORM_LABEL[d.platform] ?? d.platform}${d.channel === "frontseat" ? " · Frontseat" : ""}`}>{d.title}</InspectorTitle>
      <div className="space-y-1">
        {canWrite ? (
          <DeliverableStatusPill id={d.id} value={d.status} label={DELIVERABLE_STATUS_LABEL[d.status]} options={moves} caption={reason ?? undefined} />
        ) : (
          <div className="font-semibold">{DELIVERABLE_STATUS_LABEL[d.status]}</div>
        )}
        {!canWrite && reason ? <Caption>{reason}</Caption> : null}
        {warning ? <Caption tone="warn">{warning} — warning only</Caption> : null}
      </div>

      <InspectorGroup label="Schedule">
        {canWrite ? <ScheduleForm id={d.id} scheduledFor={d.scheduledFor} /> : <Kvs><Kv k="Scheduled for" v={date(d.scheduledFor)} /></Kvs>}
        {d.status === "scheduled" ? <Caption>On the creator&apos;s calendar as sponsored.</Caption> : null}
      </InspectorGroup>

      <InspectorGroup label="Claims" aside={d.revisionRound > 2 ? `Round ${d.revisionRound}` : `Round ${d.revisionRound} of 2`}>
        <Kvs>
          <Kv k="Status" v={d.claimsApprovedByBrand ? `Approved${approver ? ` · ${approver}` : ""}` : d.status === "in_review" ? "Awaiting brand" : "Pending"} />
          <Kv k="Disclosure" v={`${d.disclosureChecked ? "Checked" : "Not checked"} · ${DISCLOSURE[d.disclosureStandard]}`} />
        </Kvs>
        {d.brandChangeRequestMd ? (
          <div className="mt-2">
            <div className="t-caption mb-1">Last change request</div>
            <div className="bg-block p-2">
              <Markdown source={d.brandChangeRequestMd} />
            </div>
          </div>
        ) : null}
        {d.revisionRound > 2 ? (
          <p className="t-caption mt-1">
            <Alert>Case by case</Alert> — revision line open on the deal.
          </p>
        ) : null}
        {canWrite ? (
          <div className="mt-2 space-y-2">
            {d.status === "in_review" || (d.status === "approved" && d.claimsApprovedByBrand) || (d.claimsApprovedByBrand && ["briefed", "drafting"].includes(d.status)) ? <ClaimsForm id={d.id} approved={d.claimsApprovedByBrand} contactId={d.approvedByContactId} contacts={contacts.map((c) => ({ id: c.id, name: c.name }))} /> : null}
            {d.status === "in_review" || d.status === "approved" ? <RequestChangesForm id={d.id} round={d.revisionRound} /> : null}
          </div>
        ) : null}
      </InspectorGroup>

      {live ? (
        <InspectorGroup label="Metrics" aside={metrics ? `Captured ${date(metrics.capturedAt)}` : undefined}>
          {canWrite ? (
            <MetricsForm id={d.id} m={metrics} />
          ) : metrics ? (
            <Kvs>
              <Kv k="Decision-makers" v={int(metrics.commentsDecisionMaker)} />
              <Kv k="Saves · shares" v={`${int(metrics.saves)} · ${int(metrics.shares)}`} />
              <Kv k="Inbound" v={int(metrics.inboundToBrand)} />
              <Kv k="Sign-ups" v={int(metrics.trackedSignups)} />
              <Kv k="Impressions" v={<span className="text-fg-3">{int(metrics.impressions)}</span>} />
            </Kvs>
          ) : (
            <Caption>No metrics yet.</Caption>
          )}
        </InspectorGroup>
      ) : null}

      <InspectorGroup label="Details">
        {canWrite ? (
          <DetailsForm d={d} />
        ) : (
          <>
            <Kvs>
              <Kv k="Due" v={date(d.dueOn)} />
              <Kv k="Live URL" v={d.liveUrl ? <a href={d.liveUrl} className="underline" target="_blank" rel="noreferrer">Open</a> : "—"} />
            </Kvs>
            <div className="mt-2 bg-block p-2">
              <Markdown source={d.draftMd} />
            </div>
          </>
        )}
      </InspectorGroup>
    </div>
  );
}
