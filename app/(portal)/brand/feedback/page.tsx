import { requireBrand } from "@/lib/session";
import { portalFeedback } from "@/lib/queries/brand-portal";
import { canSubmitNps, feedbackAverage, quarterOf } from "@/lib/rules/campaigns";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, Caption, Meta } from "@/components/ui";
import { SurveyForm, NpsForm } from "@/components/brand-portal/FeedbackForms";
import { date } from "@/lib/format";
import { today } from "@/lib/dates";

export const metadata = { title: "Feedback" };
export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const me = await requireBrand();
  const f = await portalFeedback(me.brandId);
  const t = today();
  const npsOpen = canSubmitNps(10, f.lastNpsOn, t).ok;
  return (
    <>
      <ScreenHeader title="Feedback" number={f.awaiting.length || undefined} numberCaption={f.awaiting.length ? (f.awaiting.length === 1 ? "survey waiting" : "surveys waiting") : undefined} />
      {f.awaiting.map((c, i) => (
        <Section key={c.id} title={`${c.name} · five questions`} aside={c.requestedOn ? `Requested ${date(c.requestedOn)}` : undefined} className="border-b border-rule pb-6">
          <SurveyForm campaignId={c.id} questions={f.questions} primary={i === 0} />
        </Section>
      ))}
      <Section title={`Quarterly score · ${quarterOf(t).replace("-", " ")}`} className="border-b border-rule pb-6">
        {npsOpen ? <NpsForm /> : <Caption>Answered this quarter. Thank you.</Caption>}
      </Section>
      {f.surveys.length || f.npsHistory.length ? (
        <Section title="Sent" flush>
          <Table>
            <THead>
              <TH>Date</TH>
              <TH>For</TH>
              <TH align="right">Score</TH>
              <TH>Comment</TH>
            </THead>
            <tbody>
              {[...f.surveys.map((x) => ({ id: x.id, on: x.submittedOn, label: x.campaignName, score: `${feedbackAverage(x) ?? "—"}/5`, comment: x.comment })), ...f.npsHistory.map((x) => ({ id: x.id, on: x.submittedOn, label: "Quarterly score", score: `${x.nps ?? "—"}/10`, comment: x.comment }))]
                .sort((a, b) => (a.on < b.on ? 1 : -1))
                .map((r) => (
                  <TR key={r.id}>
                    <TD className="whitespace-nowrap">{date(r.on)}</TD>
                    <TD>{r.label}</TD>
                    <TD align="right">{r.score}</TD>
                    <TD className="max-w-[360px] truncate">{r.comment ?? <Meta>—</Meta>}</TD>
                  </TR>
                ))}
            </tbody>
          </Table>
        </Section>
      ) : null}
    </>
  );
}
