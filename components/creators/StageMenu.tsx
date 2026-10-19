"use client";
// Stage pill: every §4 move with its blocked reason (from lib/rules via stageMoves).
// Reversible moves run at once (⌘Z line); reason-collecting or irreversible moves open a sheet.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Caption, Field, Textarea } from "@/components/ui";
import { MenuPill, Sheet, ActionForm, SubmitButton, useResultFeedback } from "@/components/ui/client";
import { moveStage, moveStageTo } from "@/lib/actions/creators";
import type { StageMove } from "@/lib/rules/creator-flow";

const CONSEQUENCE: Partial<Record<StageMove["key"], string>> = {
  approve_roster: "Starts the exclusive pilot and schedules check-ins. This can't be undone.",
  return_roster: "Starts a fresh exclusive pilot and schedules check-ins. This can't be undone.",
  alumni: "Ends the agreement and exclusivity and cancels pending check-ins.",
};

export function StageMenu({ creatorId, label, moves, caption }: { creatorId: string; label: string; moves: StageMove[]; caption?: string }) {
  const router = useRouter();
  const feedback = useResultFeedback();
  const [sheet, setSheet] = useState<StageMove | null>(null);
  return (
    <>
      <MenuPill
        value=""
        label={label}
        caption={caption}
        options={moves.map((m) => ({ value: m.key, label: m.label, disabledReason: m.reasons[0] ?? null }))}
        onSelect={async (v) => {
          const m = moves.find((x) => x.key === v);
          if (!m) return;
          if (m.needsReason || m.irreversible) {
            setSheet(m);
            return;
          }
          const r = await moveStageTo(creatorId, m.key);
          if (r.ok) {
            feedback(r);
            router.refresh();
            return { ok: true };
          }
          return { ok: false, error: r.error };
        }}
      />
      <Sheet open={!!sheet} onOpenChange={(o) => !o && setSheet(null)} title={sheet?.label ?? ""} width={460}>
        {sheet ? (
          <ActionForm
            action={moveStage}
            onDone={() => {
              setSheet(null);
              router.refresh();
            }}
            className="px-5 py-4"
          >
            <input type="hidden" name="id" value={creatorId} />
            <input type="hidden" name="move" value={sheet.key} />
            {sheet.needsReason ? (
              <Field label="Reason">
                <Textarea name="reason" rows={3} required maxLength={500} autoFocus />
              </Field>
            ) : null}
            {CONSEQUENCE[sheet.key] ? <Caption className="mt-2">{CONSEQUENCE[sheet.key]}</Caption> : null}
            <div className="mt-4">
              <SubmitButton>{sheet.label}</SubmitButton>
            </div>
          </ActionForm>
        ) : null}
      </Sheet>
    </>
  );
}
