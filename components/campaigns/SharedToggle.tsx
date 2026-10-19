"use client";
// shared_with_creator toggle — submits on change (reversible, no confirmation).
import { ActionForm } from "@/components/ui/client";
import { Toggle } from "@/components/ui";
import { setFeedbackShared } from "@/lib/actions/campaigns";

export function SharedToggle({ id, shared, disabled }: { id: string; shared: boolean; disabled?: boolean }) {
  return (
    <ActionForm action={setFeedbackShared}>
      <div>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="shared" value={shared ? "0" : "1"} />
        <Toggle
          label="Shared with creator"
          checked={shared}
          disabled={disabled}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />
      </div>
    </ActionForm>
  );
}
