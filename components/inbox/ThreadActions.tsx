"use client";
// Inbox triage actions as plain buttons: Identify · Pre-screen · Reply · Convert · Decline · Forward.
// Each opens one small inline form under the button row. Gates come from lib/rules/inbox (passed in).
import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { Button, Input, Select, Textarea, Toggle, Caption, cx } from "@/components/ui";
import { identifyBrand, prescreenThread, replyThread, convertThread, declineThread, forwardThread } from "@/lib/actions/inbox";
import { StackField } from "@/components/campaigns/fields";

type Key = "identify" | "prescreen" | "reply" | "convert" | "decline" | "forward";

export type ThreadActionProps = {
  id: string;
  closed: boolean;
  brandId: string | null;
  brands: { id: string; name: string }[];
  noList: { key: string; label: string }[];
  blocklist: { key: string; label: string }[];
  prescreen: Record<string, boolean | string | null> | null;
  replyMd: string | null;
  declineMd: string;
  convertReason: string | null;
  canConvertRole: boolean;
  convertTitle: string;
  forwardReason: string | null;
  forwarded: boolean;
};

export function ThreadActions(p: ThreadActionProps) {
  const [open, setOpen] = useState<Key | null>(null);
  const btn = (k: Key, label: string, disabled?: boolean) => (
    <Button
      key={k}
      type="button"
      size="sm"
      variant="plain"
      aria-expanded={open === k}
      disabled={disabled}
      onClick={() => setOpen(open === k ? null : k)}
      className={cx(open === k && "bg-head-bg text-head-fg hover:bg-head-bg")}
    >
      {label}
    </Button>
  );
  const close = () => setOpen(null);
  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {btn("identify", "Identify")}
        {btn("prescreen", "Pre-screen")}
        {btn("reply", "Reply", p.closed)}
        {btn("convert", "Convert")}
        {btn("decline", "Decline", p.closed)}
        {btn("forward", "Forward")}
      </div>
      <div className={cx(open && "mt-3 bg-block p-3")}>
        {open === "identify" ? (
          <ActionForm action={identifyBrand} onDone={close} className="space-y-1">
            <input type="hidden" name="id" value={p.id} />
            <StackField label="Link a brand" small>
              <Select name="brandId" defaultValue={p.brandId ?? ""}>
                <option value="">—</option>
                {p.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </StackField>
            <StackField label="Or create one" small>
              <Input name="newBrand" placeholder="Brand name" />
            </StackField>
            <SubmitButton variant="plain" size="sm">
              Identify
            </SubmitButton>
          </ActionForm>
        ) : null}
        {open === "prescreen" ? (
          <ActionForm action={prescreenThread} onDone={close}>
            <input type="hidden" name="id" value={p.id} />
            {p.noList.map((n) => (
              <Toggle key={n.key} name={n.key} label={n.label} defaultChecked={p.prescreen?.[n.key] === true} className="py-1" />
            ))}
            <StackField label="Blocklist" small>
              <Select name="blocklist_category" defaultValue={typeof p.prescreen?.blocklist_category === "string" ? p.prescreen.blocklist_category : ""}>
                <option value="">None</option>
                {p.blocklist.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </Select>
            </StackField>
            <div className="pt-2">
              <SubmitButton variant="plain" size="sm">
                Save pre-screen
              </SubmitButton>
            </div>
          </ActionForm>
        ) : null}
        {open === "reply" ? (
          <ActionForm action={replyThread} onDone={close} className="space-y-1">
            <input type="hidden" name="id" value={p.id} />
            <StackField label="Reply on the creator's behalf" small>
              <Textarea name="replyMd" rows={6} defaultValue={p.replyMd ?? ""} required />
            </StackField>
            <SubmitButton variant="plain" size="sm">
              Mark replied
            </SubmitButton>
          </ActionForm>
        ) : null}
        {open === "convert" ? (
          p.convertReason || !p.canConvertRole ? (
            <Caption>{p.convertReason ?? "Only the Crew lead converts to a deal."}</Caption>
          ) : (
            <ActionForm action={convertThread} onDone={close} className="space-y-1">
              <input type="hidden" name="id" value={p.id} />
              <StackField label="Lead title" small>
                <Input name="title" defaultValue={p.convertTitle} />
              </StackField>
              <SubmitButton variant="plain" size="sm">
                Create lead
              </SubmitButton>
            </ActionForm>
          )
        ) : null}
        {open === "decline" ? (
          <ActionForm action={declineThread} onDone={close} className="space-y-1">
            <input type="hidden" name="id" value={p.id} />
            <StackField label="Decline" small>
              <Textarea name="replyMd" rows={6} defaultValue={p.declineMd} required />
            </StackField>
            <div className="flex gap-1">
              <SubmitButton variant="plain" size="sm">
                Decline
              </SubmitButton>
            </div>
          </ActionForm>
        ) : null}
        {open === "forward" ? (
          p.forwardReason ? (
            <Caption>{p.forwardReason}</Caption>
          ) : (
            <ActionForm action={forwardThread} onDone={close}>
              <input type="hidden" name="id" value={p.id} />
              {p.forwarded ? <input type="hidden" name="unforward" value="1" /> : null}
              <Caption className="mb-2">{p.forwarded ? "Visible in the creator's Studio." : "Shows the thread and Crew's reply in Studio."}</Caption>
              <SubmitButton variant="plain" size="sm">
                {p.forwarded ? "Unforward" : "Forward to creator"}
              </SubmitButton>
            </ActionForm>
          )
        ) : null}
      </div>
    </div>
  );
}
