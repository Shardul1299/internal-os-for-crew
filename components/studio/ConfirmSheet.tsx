"use client";
// Irreversible action in a Sheet with a one-sentence consequence (BRIEF §13.6).
import { useState } from "react";
import { Button, Caption, Input } from "@/components/ui";
import { ActionForm, Sheet, SubmitButton } from "@/components/ui/client";
import type { ActionResult } from "@/lib/actions/result";

export function ConfirmSheet({
  label,
  title,
  consequence,
  word,
  action,
}: {
  label: string;
  title: string;
  consequence: string;
  word: string;
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={title}
      side="center"
      width={440}
      trigger={
        <Button type="button" variant="danger">
          {label}
        </Button>
      }
    >
      <div className="p-5">
        <p className="mb-3">{consequence}</p>
        <ActionForm action={action} onDone={() => setOpen(false)}>
          <Caption>Type {word} to confirm.</Caption>
          <Input name="confirm" autoComplete="off" className="mt-1 mb-3" />
          <SubmitButton variant="danger">{label}</SubmitButton>
        </ActionForm>
      </div>
    </Sheet>
  );
}
