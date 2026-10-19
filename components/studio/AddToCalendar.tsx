"use client";
// "Add to calendar" for a script row: pick a date; starter rows are cloned first (scheduleScript).
import { Button, Input } from "@/components/ui";
import { ActionForm, Popover, SubmitButton } from "@/components/ui/client";
import { scheduleScript } from "@/lib/actions/studio-calendar";

export function AddToCalendar({ scriptId, defaultDate, label = "Add to calendar" }: { scriptId: string; defaultDate: string; label?: string }) {
  return (
    <Popover
      align="end"
      trigger={
        <Button type="button" size="sm" variant="quiet">
          {label}
        </Button>
      }
    >
      <ActionForm action={scheduleScript} className="flex items-center gap-2">
        <input type="hidden" name="scriptId" value={scriptId} />
        <Input type="date" name="date" defaultValue={defaultDate} aria-label="Date" className="w-40" />
        <SubmitButton variant="plain" size="sm">
          Add
        </SubmitButton>
      </ActionForm>
    </Popover>
  );
}
