// New creator sheet (§4 → scout): record with source and sub-category. Interns can create Scouts.
import { Field, Input, Select } from "@/components/ui";
import { SUB_CATEGORY_LABEL } from "@/lib/format";
import { createCreator } from "@/lib/actions/creators";
import { SheetForm } from "./SheetForm";
import { SOURCE_LABEL, PLATFORM_LABEL } from "./labels";

export function NewCreator({ open, referrers }: { open: boolean; referrers: { id: string; name: string }[] }) {
  return (
    <SheetForm title="New creator" trigger="New creator" triggerVariant="primary" triggerSize="md" action={createCreator} submitLabel="Add to Scout" defaultOpen={open} dataNew>
      <Field label="Name">
        <Input name="displayName" required maxLength={120} autoFocus />
      </Field>
      <Field label="Sub-category">
        <Select name="subCategory" required defaultValue="">
          <option value="" disabled>
            Pick one
          </option>
          {Object.entries(SUB_CATEGORY_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Source">
        <Select name="source" required defaultValue="">
          <option value="" disabled>
            Pick one
          </option>
          {Object.entries(SOURCE_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Source detail">
        <Input name="sourceDetail" maxLength={200} placeholder="Where, who, when" />
      </Field>
      <Field label="Referred by">
        <Select name="referredByCreatorId" defaultValue="">
          <option value="">—</option>
          {referrers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Primary platform">
        <Select name="primaryPlatform" defaultValue="instagram">
          {Object.entries(PLATFORM_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Handle">
        <Input name="handle" maxLength={120} placeholder="@handle" />
      </Field>
      <Field label="Languages">
        <Input name="languages" defaultValue="en" placeholder="en, hinglish" />
      </Field>
      <Field label="City">
        <Input name="city" maxLength={80} />
      </Field>
      <Field label="Email">
        <Input name="email" type="email" maxLength={200} />
      </Field>
      <Field label="Consent">
        <Select name="consentStatus" defaultValue="none">
          <option value="none">Not yet</option>
          <option value="opted_in">Opted in</option>
        </Select>
      </Field>
    </SheetForm>
  );
}
