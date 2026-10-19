"use client";
// Brand contacts: add sheet and the edit form shown in the Inspector.
import { useState } from "react";
import { Sheet, ActionForm, SubmitButton } from "@/components/ui/client";
import { Button, Input, Toggle } from "@/components/ui";
import { saveContact } from "@/lib/actions/brands";
import { StackField } from "@/components/campaigns/fields";

type C = { id: string; name: string; role: string | null; email: string | null; phone: string | null; isPrimary: boolean; portalUserId: string | null };

function ContactFields({ c }: { c?: C }) {
  return (
    <div className="space-y-1">
      <StackField label="Name">
        <Input name="name" defaultValue={c?.name} required autoFocus={!c} />
      </StackField>
      <StackField label="Role">
        <Input name="role" defaultValue={c?.role ?? ""} placeholder="Head of Growth" />
      </StackField>
      <StackField label="Email">
        <Input type="email" name="email" defaultValue={c?.email ?? ""} readOnly={!!c?.portalUserId} />
      </StackField>
      <StackField label="Phone">
        <Input name="phone" defaultValue={c?.phone ?? ""} />
      </StackField>
      <Toggle name="isPrimary" label="Primary contact" defaultChecked={c?.isPrimary} />
    </div>
  );
}

export function AddContactSheet({ brandId }: { brandId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="Add contact"
      trigger={
        <Button variant="primary" data-new>
          Add contact
        </Button>
      }
    >
      <ActionForm action={saveContact} className="px-5 py-4" onDone={() => setOpen(false)}>
        <input type="hidden" name="brandId" value={brandId} />
        <ContactFields />
        <div className="pt-4">
          <SubmitButton>Add contact</SubmitButton>
        </div>
      </ActionForm>
    </Sheet>
  );
}

export function EditContactForm({ brandId, c }: { brandId: string; c: C }) {
  return (
    <ActionForm action={saveContact} key={c.id}>
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="id" value={c.id} />
      <ContactFields c={c} />
      <div className="pt-2">
        <SubmitButton variant="plain">Save</SubmitButton>
      </div>
    </ActionForm>
  );
}
