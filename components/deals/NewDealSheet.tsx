"use client";
// New deal sheet (⌘N, ?new=1): brand (existing or quick-create), title, type, origin, originating creator,
// expected value. Below the minimum the sheet offers the self-serve template instead of a deal.
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Sheet, ActionForm, SubmitButton, CopyButton } from "@/components/ui/client";
import { Button, Field, Input, Select, NumberField, Toggle, Textarea, Caption, Block, Alert } from "@/components/ui";
import { createDeal } from "@/lib/actions/deals";

const TYPES = [
  ["pilot", "Pilot"],
  ["retainer", "Retainer"],
  ["quarterly", "Quarterly"],
  ["annual", "Annual"],
  ["one_off", "One-off"],
] as const;
const ORIGINS = [
  ["crew_originated", "Crew originated"],
  ["creator_inbound", "Creator inbound"],
  ["frontseat_lead", "Frontseat lead"],
  ["snoball_referral", "Snoball referral"],
  ["owled_referral", "OWLED referral"],
] as const;
const CATEGORIES = ["ai_tool", "dev_tool", "saas", "fintech", "edtech", "vc", "consumer", "enterprise", "other"];
const TEAMS = [
  ["crew", "Crew"],
  ["owled_social", "OWLED Social"],
  ["snoball", "Snoball"],
  ["shared", "Shared"],
] as const;

export function NewDealSheet({
  brands,
  creators,
  minDealRupees,
  selfServe,
}: {
  brands: { id: string; name: string }[];
  creators: { id: string; name: string }[];
  minDealRupees: number;
  selfServe: string;
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [userOpen, setOpen] = useState(false);
  const open = userOpen || sp.get("new") === "1";
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "new");
  const [type, setType] = useState("pilot");
  const [origin, setOrigin] = useState("crew_originated");
  const [value, setValue] = useState("");
  const [override, setOverride] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const below = value !== "" && Number(value) < minDealRupees;

  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o && sp.get("new")) {
      const next = new URLSearchParams(sp.toString());
      next.delete("new");
      router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="New deal"
      trigger={
        <Button variant="primary" data-new type="button">
          New deal
        </Button>
      }
    >
      <ActionForm action={createDeal} className="px-5 py-4">
        <Field label="Brand">
          <Select name="brandId" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
            <option value="new">New brand…</option>
          </Select>
        </Field>
        {brandId === "new" ? (
          <>
            <Field label="Brand name">
              <Input name="brandName" required autoFocus />
            </Field>
            <Field label="Category">
              <Select name="brandCategory" defaultValue="ai_tool">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Owner team">
              <Select name="brandOwnerTeam" defaultValue="crew">
                {TEAMS.map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        ) : null}
        <Field label="Title">
          <Input name="title" required placeholder="e.g. Agent launch — 3-month pilot" />
        </Field>
        <Field label="Type" hint={type === "one_off" ? "Opens at Pitch. Prefer a 3-month pilot." : undefined}>
          <Select name="type" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        {type === "one_off" ? (
          <Field label="One-off reason">
            <Input name="oneOffReason" required />
          </Field>
        ) : null}
        <Field label="Origin">
          <Select name="origin" value={origin} onChange={(e) => setOrigin(e.target.value)}>
            {ORIGINS.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        {origin === "creator_inbound" ? (
          <Field label="Brought by">
            <Select name="originatingCreatorId" required defaultValue="">
              <option value="" disabled>
                Pick a creator
              </option>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        <Field label="Expected value">
          <NumberField name="expectedRupees" unit="₹" min={0} step="1000" required value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        {below ? (
          <div className="py-3 space-y-2">
            <Caption tone="alert">
              <Alert>Below the ₹{minDealRupees.toLocaleString("en-IN")} minimum.</Alert>
            </Caption>
            <Button type="button" variant="plain" size="sm" onClick={() => setShowTemplate((x) => !x)}>
              Send creator the self-serve template
            </Button>
            {showTemplate ? (
              <Block className="space-y-2">
                <p className="whitespace-pre-wrap">{selfServe}</p>
                <CopyButton text={selfServe} label="Copy template" />
              </Block>
            ) : null}
            <Toggle label="Request a min_deal override" description="Owner approves before Qualify." name="minDealOverride" checked={override} onChange={(e) => setOverride(e.target.checked)} />
            {override ? <Textarea name="minDealReason" rows={2} required placeholder="Reason" /> : null}
          </div>
        ) : null}
        <div className="mt-4">
          <SubmitButton>Create deal</SubmitButton>
        </div>
      </ActionForm>
    </Sheet>
  );
}
