// Feedback tab (§8.6): five-question survey results (template brand_feedback_5q), NPS, shared_with_creator.
import type * as s from "@/lib/db/schema";
import { feedbackQuestions } from "@/lib/queries/campaigns";
import { Section, Table, THead, TH, TR, TD, Caption, Meta, Stat, EmptyState } from "@/components/ui";
import { date } from "@/lib/format";
import { feedbackAverage } from "@/lib/rules/campaigns";
import { SharedToggle } from "./SharedToggle";

export async function FeedbackTab({
  campaign,
  brand,
  feedback,
  canWrite,
}: {
  campaign: typeof s.campaigns.$inferSelect;
  brand: typeof s.brands.$inferSelect;
  feedback: (typeof s.brandFeedback.$inferSelect)[];
  canWrite: boolean;
}) {
  const questions = await feedbackQuestions();
  const surveys = feedback.filter((f) => f.kind === "campaign_5q");
  return (
    <>
      <Section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Stat label="Survey average" value={surveys[0] ? (feedbackAverage(surveys[0]) ?? "—") : "—"} caption={surveys[0] ? `of 5 · ${date(surveys[0].submittedOn)}` : campaign.feedbackRequestedAt ? "Awaiting brand" : "Not requested"} />
          <Stat label="Brand NPS" value={brand.npsLatest ?? "—"} caption={brand.npsAsOf ? `of 10 · ${date(brand.npsAsOf)}` : "No quarterly score yet"} />
        </div>
      </Section>
      {surveys.length === 0 ? (
        <EmptyState>{campaign.feedbackRequestedAt ? "Waiting on the brand's five answers." : "Request feedback from the Report tab."}</EmptyState>
      ) : (
        surveys.map((f) => (
          <Section key={f.id} title={`Survey · ${date(f.submittedOn)}`} flush>
            <Table>
              <THead>
                <TH>Question</TH>
                <TH align="right">Score</TH>
              </THead>
              <tbody>
                {[f.q1, f.q2, f.q3, f.q4, f.q5].map((v, i) => (
                  <TR key={i}>
                    <TD>{questions[i] ?? `Question ${i + 1}`}</TD>
                    <TD align="right">{v ?? <Meta>—</Meta>}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
            <div className="px-5 pt-3 space-y-2">
              {f.comment ? <p className="max-w-[72ch]">“{f.comment}”</p> : <Caption>No comment.</Caption>}
              <SharedToggle id={f.id} shared={f.sharedWithCreator} disabled={!canWrite} />
            </div>
          </Section>
        ))
      )}
    </>
  );
}
