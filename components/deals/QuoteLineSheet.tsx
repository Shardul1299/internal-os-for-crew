"use client";
import { useState } from "react";
import { Sheet } from "@/components/ui/client";
import { Button } from "@/components/ui";
import { QuoteLineForm, type LineDraft, type StandardsTable } from "./QuoteLineForm";
import type { RulesConfig, RungKey } from "@/lib/rules/config";

export function QuoteLineSheet(props: {
  title: string;
  trigger: string;
  triggerVariant?: "primary" | "plain" | "quiet";
  cfg: RulesConfig;
  dealId: string;
  creators: { id: string; name: string }[];
  standards: StandardsTable;
  defaultRungs: Record<string, RungKey>;
  draft?: LineDraft;
  belowLucrativeOverride: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { title, trigger, triggerVariant = "plain", ...form } = props;
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={title}
      width={600}
      trigger={
        <Button type="button" size="sm" variant={triggerVariant}>
          {trigger}
        </Button>
      }
    >
      <div className="px-5 py-4">
        <QuoteLineForm {...form} onDone={() => setOpen(false)} />
      </div>
    </Sheet>
  );
}
