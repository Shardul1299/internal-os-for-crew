"use client";
// A Sheet holding one server-action form; closes itself on success. Built only from components/ui.
import { useState, type ReactNode } from "react";
import { Sheet, ActionForm, SubmitButton } from "@/components/ui/client";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";

export function FormSheet({
  title,
  trigger,
  action,
  fields = {},
  submit,
  children,
  triggerVariant = "plain",
  size = "sm",
  consequence,
}: {
  title: string;
  trigger: string;
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  fields?: Record<string, string | number | null | undefined>;
  submit: string;
  children?: ReactNode;
  triggerVariant?: "primary" | "plain" | "quiet" | "danger";
  size?: "sm" | "md";
  consequence?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={title}
      trigger={
        <Button type="button" variant={triggerVariant} size={size}>
          {trigger}
        </Button>
      }
    >
      <ActionForm action={action} onDone={() => setOpen(false)} className="px-5 py-4">
        {Object.entries(fields).map(([k, v]) => (v == null ? null : <input key={k} type="hidden" name={k} value={String(v)} />))}
        {children}
        {consequence ? <p className="t-caption mt-3">{consequence}</p> : null}
        <div className="mt-4">
          <SubmitButton>{submit}</SubmitButton>
        </div>
      </ActionForm>
    </Sheet>
  );
}

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <Button type="button" variant="primary" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
