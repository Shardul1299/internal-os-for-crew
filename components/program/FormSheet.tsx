"use client";
// A trigger button that opens a Sheet holding one server-action form; closes on success.
// Built from the closed set (Sheet + ActionForm + Button) — no new visual component.
import { useState, type ReactNode } from "react";
import { Sheet, ActionForm, SubmitButton } from "@/components/ui/client";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";

export function FormSheet({
  label,
  title,
  action,
  children,
  submitLabel = "Save",
  variant = "plain",
  size = "md",
  dataNew,
  defaultOpen = false,
  consequence,
  width,
}: {
  label: string;
  title: string;
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel?: string;
  variant?: "primary" | "plain" | "quiet" | "danger";
  size?: "sm" | "md";
  dataNew?: boolean;
  defaultOpen?: boolean;
  consequence?: string;
  width?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={title}
      width={width}
      trigger={
        <Button type="button" variant={variant} size={size} {...(dataNew ? { "data-new": "" } : {})}>
          {label}
        </Button>
      }
    >
      <ActionForm action={action} onDone={() => setOpen(false)} className="px-5 py-4">
        {children}
        {consequence ? <p className="t-caption mt-4">{consequence}</p> : null}
        <div className="mt-4 flex gap-2">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Button type="button" variant="quiet" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </ActionForm>
    </Sheet>
  );
}
