"use client";
// Capture (⌘N / ?new=1): paste an email or DM — channel, from, the creator it's addressed to, subject, body, received at.
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sheet, ActionForm, SubmitButton } from "@/components/ui/client";
import { Button, Input, Select, Textarea, Field, FormGrid } from "@/components/ui";
import { captureThread } from "@/lib/actions/inbox";

const CHANNELS = [
  ["email", "Email"],
  ["instagram_dm", "Instagram DM"],
  ["linkedin", "LinkedIn"],
  ["x", "X"],
  ["whatsapp", "WhatsApp"],
  ["form", "Contact form"],
] as const;

export function CaptureSheet({ creators, defaultOpen, now }: { creators: { id: string; name: string }[]; defaultOpen?: boolean; now: string }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o && sp.get("new")) {
          const next = new URLSearchParams(sp.toString());
          next.delete("new");
          router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
        }
      }}
      title="Capture"
      width={600}
      trigger={
        <Button variant="primary" data-new>
          Capture
        </Button>
      }
    >
      <ActionForm action={captureThread} className="px-5 py-4" onDone={() => setOpen(false)}>
        <FormGrid>
          <Field label="Channel">
            <Select name="channel" defaultValue="email">
              {CHANNELS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="From">
            <Input name="fromName" required placeholder="Priya @ Vectorly" autoFocus />
          </Field>
          <Field label="Address or handle">
            <Input name="fromAddress" placeholder="priya@vectorly.ai" />
          </Field>
          <Field label="Addressed to">
            <Select name="creatorId" defaultValue="">
              <option value="">Crew</option>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Subject">
            <Input name="subject" />
          </Field>
          <Field label="Message">
            <Textarea name="body" rows={8} required placeholder="Paste the email or DM" />
          </Field>
          <Field label="Received at">
            <Input type="datetime-local" name="receivedAt" defaultValue={now} />
          </Field>
        </FormGrid>
        <div className="pt-4">
          <SubmitButton>Capture</SubmitButton>
        </div>
      </ActionForm>
    </Sheet>
  );
}
