"use client";
// A Sheet that holds one ActionForm and closes on success. Irreversible actions pass a one-sentence consequence.
import { useState, type ReactNode } from "react";
import { Button, Caption } from "@/components/ui";
import { Sheet, ActionForm, SubmitButton } from "@/components/ui/client";
import type { ActionResult } from "@/lib/actions/result";

export function SheetForm({
  title,
  trigger,
  triggerVariant = "plain",
  triggerSize = "sm",
  action,
  submitLabel = "Save",
  submitVariant = "primary",
  consequence,
  children,
  defaultOpen,
  dataNew,
  width,
}: {
  title: string;
  trigger: ReactNode;
  triggerVariant?: "primary" | "plain" | "quiet" | "danger";
  triggerSize?: "sm" | "md";
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  submitLabel?: string;
  submitVariant?: "primary" | "plain" | "quiet" | "danger";
  consequence?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  dataNew?: boolean;
  width?: number;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={title}
      width={width}
      trigger={
        <Button type="button" variant={triggerVariant} size={triggerSize} {...(dataNew ? { "data-new": "" } : {})}>
          {trigger}
        </Button>
      }
    >
      <ActionForm action={action} onDone={() => setOpen(false)} className="px-5 py-4">
        {children}
        {consequence ? <Caption className="mt-3">{consequence}</Caption> : null}
        <div className="mt-4 flex gap-2">
          <SubmitButton variant={submitVariant}>{submitLabel}</SubmitButton>
        </div>
      </ActionForm>
    </Sheet>
  );
}
