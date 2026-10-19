"use client";
// New brand sheet (⌘N / ?new=1) and the brand details form.
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sheet, ActionForm, SubmitButton } from "@/components/ui/client";
import { Button, Input, Select, Toggle, Field, FormGrid } from "@/components/ui";
import { createBrand, updateBrand } from "@/lib/actions/brands";

export const CATEGORY_OPTIONS = [
  ["ai_tool", "AI tool"],
  ["dev_tool", "Dev tool"],
  ["saas", "SaaS"],
  ["fintech", "Fintech"],
  ["edtech", "Edtech"],
  ["vc", "VC"],
  ["consumer", "Consumer"],
  ["enterprise", "Enterprise"],
  ["other", "Other"],
] as const;

export const OWNER_OPTIONS = [
  ["crew", "Crew"],
  ["owled_social", "OWLED Social"],
  ["snoball", "Snoball"],
  ["shared", "Shared"],
] as const;

type B = { id: string; name: string; website: string | null; category: string; ownerTeam: string; isHouseClient: boolean };

function Fields({ b }: { b?: B }) {
  return (
    <FormGrid>
      <Field label="Name">
        <Input name="name" defaultValue={b?.name} required autoFocus={!b} />
      </Field>
      <Field label="Website">
        <Input name="website" defaultValue={b?.website ?? ""} placeholder="lumen.ai" />
      </Field>
      <Field label="Category">
        <Select name="category" defaultValue={b?.category ?? "ai_tool"}>
          {CATEGORY_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Owner team">
        <Select name="ownerTeam" defaultValue={b?.ownerTeam ?? "crew"}>
          {OWNER_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <div className="py-1">
        <Toggle name="isHouseClient" label="House client" description="No NO-list exception by default." defaultChecked={b?.isHouseClient} />
      </div>
    </FormGrid>
  );
}

export function NewBrandSheet({ defaultOpen }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o && sp.get("new")) router.replace(pathname, { scroll: false });
      }}
      title="New brand"
      trigger={
        <Button variant="primary" data-new>
          New brand
        </Button>
      }
    >
      <ActionForm action={createBrand} className="px-5 py-4" onDone={() => setOpen(false)}>
        <Fields />
        <div className="pt-4">
          <SubmitButton>Create brand</SubmitButton>
        </div>
      </ActionForm>
    </Sheet>
  );
}

export function BrandDetailsForm({ b }: { b: B }) {
  return (
    <ActionForm action={updateBrand} className="max-w-2xl">
      <input type="hidden" name="id" value={b.id} />
      <Fields b={b} />
      <div className="pt-3">
        <SubmitButton variant="plain">Save</SubmitButton>
      </div>
    </ActionForm>
  );
}
