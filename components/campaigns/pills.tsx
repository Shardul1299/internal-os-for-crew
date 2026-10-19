"use client";
// Status controls for deliverables and campaigns: MenuPill → server action. Blocked moves show their reason.
import { MenuPill, useResultFeedback, type MenuOption } from "@/components/ui/client";
import { moveDeliverable } from "@/lib/actions/deliverables";
import { setCampaignStatus } from "@/lib/actions/campaigns";
import type { ReactNode } from "react";

export function DeliverableStatusPill({ id, value, label, options, caption, alert }: { id: string; value: string; label: string; options: MenuOption[]; caption?: ReactNode; alert?: boolean }) {
  const feedback = useResultFeedback();
  return (
    <MenuPill
      value={value}
      label={label}
      options={options}
      caption={caption}
      tone={alert ? "alert" : "plain"}
      onSelect={async (to) => {
        const r = await moveDeliverable(id, to);
        feedback(r);
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      }}
    />
  );
}

const CAMPAIGN = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "reporting", label: "Reporting" },
  { value: "closed", label: "Closed" },
];

export function CampaignStatusPill({ id, value }: { id: string; value: string }) {
  const feedback = useResultFeedback();
  return (
    <MenuPill
      value={value}
      label={CAMPAIGN.find((c) => c.value === value)?.label ?? value}
      options={CAMPAIGN}
      onSelect={async (to) => {
        const r = await setCampaignStatus(id, to);
        feedback(r);
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      }}
    />
  );
}
