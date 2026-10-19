"use client";
// Stage pill (menu): the next move and the exits. A blocked move shows its canAdvance reason and
// can't be picked; Declined and Lost open a sheet for the reason (and value) the gate needs.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MenuPill, Sheet, ActionForm, SubmitButton, useResultFeedback, type MenuOption } from "@/components/ui/client";
import { Field, Input, NumberField, Textarea } from "@/components/ui";
import { moveDealStage } from "@/lib/actions/deals";

export function StageControl({
  dealId,
  stage,
  stageLabel,
  next,
  nextLabel,
  nextReason,
  warning,
  canWrite,
  closed,
  expectedRupees,
}: {
  dealId: string;
  stage: string;
  stageLabel: string;
  next: string | null;
  nextLabel: string | null;
  nextReason: string | null;
  warning: string | null;
  canWrite: boolean;
  closed: boolean;
  expectedRupees: number;
}) {
  const router = useRouter();
  const feedback = useResultFeedback();
  const [exit, setExit] = useState<null | "declined" | "lost">(null);
  const caption = nextReason ? `Blocked: ${nextReason}` : warning;
  if (!canWrite || closed) {
    return (
      <span className="inline-flex flex-col items-start gap-1">
        <span className="h-7 px-2.5 inline-flex items-center bg-block">{stageLabel}</span>
        {!closed && caption ? <span className="t-caption max-w-[340px]">{caption}</span> : null}
      </span>
    );
  }
  const options: MenuOption[] = [
    ...(next ? [{ value: next, label: `Move to ${nextLabel}`, disabledReason: nextReason, hint: warning ?? "Next stage" }] : []),
    { value: "declined", label: "Declined", hint: "Reason and value, logged" },
    { value: "lost", label: "Lost", hint: "Reason required" },
  ];
  return (
    <>
      <MenuPill
        value={stage}
        label={stageLabel}
        tone={nextReason ? "alert" : "plain"}
        caption={caption ? <span className="block max-w-[340px]">{caption}</span> : undefined}
        options={options}
        onSelect={async (to) => {
          if (to === "declined" || to === "lost") {
            setExit(to);
            return { ok: true };
          }
          const fd = new FormData();
          fd.set("dealId", dealId);
          fd.set("to", to);
          const r = await moveDealStage(null, fd);
          if (r.ok) {
            feedback(r);
            router.refresh();
            return { ok: true };
          }
          return { ok: false, error: r.error };
        }}
      />
      <Sheet open={!!exit} onOpenChange={(o) => !o && setExit(null)} title={exit === "declined" ? "Decline deal" : "Mark lost"}>
        <ActionForm
          action={moveDealStage}
          className="px-5 py-4"
          onDone={() => {
            setExit(null);
            router.refresh();
          }}
        >
          <input type="hidden" name="dealId" value={dealId} />
          <input type="hidden" name="to" value={exit ?? ""} />
          <Field label="Reason">
            {exit === "declined" ? <Input name="reason" required placeholder="e.g. Barter only" /> : <Textarea name="reason" rows={3} required />}
          </Field>
          {exit === "declined" ? (
            <Field label="Value">
              <NumberField name="valueRupees" unit="₹" min={0} step="1" defaultValue={expectedRupees || ""} required />
            </Field>
          ) : null}
          <p className="t-caption mt-3">{exit === "declined" ? "Goes to the declined log and the month-end one-pager." : "Closes the deal."}</p>
          <div className="mt-4">
            <SubmitButton>{exit === "declined" ? "Decline" : "Mark lost"}</SubmitButton>
          </div>
        </ActionForm>
      </Sheet>
    </>
  );
}
