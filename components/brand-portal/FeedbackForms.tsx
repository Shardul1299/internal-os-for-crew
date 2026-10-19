"use client";
// Brand feedback (§8.6): five-question survey (1–5 each) and the quarterly NPS (0–10).
import { useState } from "react";
import { ActionForm, SubmitButton, ScoreControl, SegmentedControl } from "@/components/ui/client";
import { Textarea } from "@/components/ui";
import { submitCampaignFeedback, submitNps } from "@/lib/actions/brand-portal";

export function SurveyForm({ campaignId, questions, primary }: { campaignId: string; questions: string[]; primary?: boolean }) {
  return (
    <ActionForm action={submitCampaignFeedback} className="space-y-3 max-w-3xl">
      <input type="hidden" name="campaignId" value={campaignId} />
      <ol className="space-y-3">
        {questions.map((q, i) => (
          <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between border-b border-rule pb-3">
            <span className="max-w-[52ch]">
              {i + 1}. {q}
            </span>
            <ScoreControl label="" name={`q${i + 1}`} value={null} />
          </li>
        ))}
      </ol>
      <Textarea name="comment" rows={2} placeholder="Anything else (optional)" aria-label="Comment" />
      <SubmitButton variant={primary ? "primary" : "plain"}>Send feedback</SubmitButton>
    </ActionForm>
  );
}

export function NpsForm() {
  const [v, setV] = useState("");
  return (
    <ActionForm action={submitNps} className="space-y-3 max-w-3xl">
      <p>How likely are you to recommend Crew to a peer?</p>
      <input type="hidden" name="nps" value={v} />
      <div className="inline-flex flex-col gap-1 max-w-full">
        <SegmentedControl value={v} onChange={setV} options={Array.from({ length: 11 }, (_, i) => ({ value: String(i), label: String(i) }))} />
        <div className="flex justify-between t-caption">
          <span>Not likely</span>
          <span>Very likely</span>
        </div>
      </div>
      <Textarea name="comment" rows={2} placeholder="Why that score (optional)" aria-label="Comment" />
      <SubmitButton variant="plain">Send score</SubmitButton>
    </ActionForm>
  );
}
