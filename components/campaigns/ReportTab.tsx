// Report tab (§8.5): credibility metrics first (decision-maker comments, saves/shares, inbound,
// tracked sign-ups), impressions last and smaller; report markdown + URL; request brand feedback.
import { Section, Caption, Table, THead, TH, TR, TD, Meta, Input, Markdown } from "@/components/ui";
import { ActionForm, SubmitButton, ActionButton, MarkdownEditor } from "@/components/ui/client";
import { int, dateTime } from "@/lib/format";
import { saveReport, requestBrandFeedback } from "@/lib/actions/campaigns";
import type { Credibility } from "@/lib/rules/campaigns";
import type { TrackerRow } from "@/lib/queries/campaigns";
import type * as s from "@/lib/db/schema";
import { StackField } from "./fields";
import { CredibilityStats } from "./CredibilityStats";

export function ReportTab({
  campaign,
  credibility,
  tracker,
  metrics,
  canWrite,
}: {
  campaign: typeof s.campaigns.$inferSelect;
  credibility: Credibility;
  tracker: TrackerRow[];
  metrics: Map<string, typeof s.deliverableMetrics.$inferSelect>;
  canWrite: boolean;
}) {
  const live = tracker.filter((d) => d.status === "live" || d.status === "reported");
  return (
    <>
      <Section title="Credibility">
        <CredibilityStats c={credibility} />
      </Section>
      {live.length ? (
        <Section title="By post" flush>
          <Table>
            <THead>
              <TH>Post</TH>
              <TH align="right">Decision-makers</TH>
              <TH align="right">Saves</TH>
              <TH align="right">Shares</TH>
              <TH align="right">Inbound</TH>
              <TH align="right">Sign-ups</TH>
              <TH align="right" className="hidden md:table-cell">Impressions</TH>
            </THead>
            <tbody>
              {live.map((d) => {
                const m = metrics.get(d.id);
                return (
                  <TR key={d.id}>
                    <TD className="max-w-[260px] truncate">
                      {d.creatorName} · {d.title}
                    </TD>
                    <TD align="right">{int(m?.commentsDecisionMaker)}</TD>
                    <TD align="right">{int(m?.saves)}</TD>
                    <TD align="right">{int(m?.shares)}</TD>
                    <TD align="right">{int(m?.inboundToBrand)}</TD>
                    <TD align="right">{int(m?.trackedSignups)}</TD>
                    <TD align="right" className="hidden md:table-cell">
                      <Meta>{int(m?.impressions)}</Meta>
                    </TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        </Section>
      ) : null}
      <Section title="Report" aside={campaign.reportedAt ? `Saved ${dateTime(campaign.reportedAt)}` : undefined}>
        {canWrite ? (
          <ActionForm action={saveReport} className="max-w-3xl space-y-2">
            <input type="hidden" name="campaignId" value={campaign.id} />
            <MarkdownEditor name="reportMd" defaultValue={campaign.reportMd ?? ""} rows={10} placeholder="## Results" />
            <StackField label="Report URL">
              <Input type="url" name="reportUrl" defaultValue={campaign.reportUrl ?? ""} placeholder="https://" />
            </StackField>
            <SubmitButton variant="plain">Save report</SubmitButton>
          </ActionForm>
        ) : (
          <div className="max-w-3xl">
            <Markdown source={campaign.reportMd} />
            {campaign.reportUrl ? (
              <a href={campaign.reportUrl} className="underline" target="_blank" rel="noreferrer">
                Open report
              </a>
            ) : null}
          </div>
        )}
      </Section>
      <Section title="Brand feedback">
        {campaign.feedbackRequestedAt ? <Caption>Requested {dateTime(campaign.feedbackRequestedAt)}</Caption> : <Caption>Not requested yet.</Caption>}
        {canWrite ? (
          <div className="mt-2">
            <ActionButton action={requestBrandFeedback} fields={{ campaignId: campaign.id }} size="md">
              {campaign.feedbackRequestedAt ? "Request again" : "Request brand feedback"}
            </ActionButton>
          </div>
        ) : null}
      </Section>
    </>
  );
}
