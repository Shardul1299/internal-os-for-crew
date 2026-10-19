"use client";
// Header primary action that submits a form further down the page (ActionForm takes no id).
import { Button } from "@/components/ui";

export function SubmitForm({ target, children }: { target: string; children: React.ReactNode }) {
  return (
    <Button
      type="button"
      variant="primary"
      onClick={() => {
        const form = document.getElementById(target)?.closest("form");
        form?.requestSubmit();
      }}
    >
      {children}
    </Button>
  );
}
