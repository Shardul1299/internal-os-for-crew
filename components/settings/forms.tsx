// Settings form bodies (server-safe). Rendered in Sheets and the Inspector.
import { Field, FormGrid, Input, Select, NumberField, Toggle, Textarea } from "@/components/ui";
import { PLATFORM_LABEL } from "@/components/program/fields";

export function DeliverableFields({ d }: { d?: { key: string; label: string; platform: string; defaultMultipleOfReel: number; sortOrder: number; active: boolean } | null }) {
  return (
    <FormGrid>
      {d ? (
        <input type="hidden" name="key" value={d.key} />
      ) : (
        <>
          <input type="hidden" name="isNew" value="1" />
          <Field label="Key">
            <Input name="key" required placeholder="ig_reel_collab" pattern="[a-z0-9_]+" />
          </Field>
        </>
      )}
      <Field label="Label">
        <Input name="label" required defaultValue={d?.label ?? ""} />
      </Field>
      <Field label="Platform">
        <Select name="platform" defaultValue={d?.platform ?? "instagram"}>
          {Object.entries(PLATFORM_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Multiple of Reel">
        <NumberField name="multiple" step="0.05" min="0.05" required defaultValue={d?.defaultMultipleOfReel ?? 1} unit="×" />
      </Field>
      <Field label="Order">
        <NumberField name="sortOrder" step="1" defaultValue={d?.sortOrder ?? 0} />
      </Field>
      <Toggle name="active" label="Active" description="Inactive deliverables can't be quoted." defaultChecked={d?.active ?? true} />
    </FormGrid>
  );
}

export function AddonFields({ a }: { a?: { key: string; label: string; pct: number | null; kind: string; days: number | null; note: string | null; active: boolean } | null }) {
  const lifetime = a?.key === "lifetime";
  return (
    <FormGrid>
      {a ? (
        <input type="hidden" name="key" value={a.key} />
      ) : (
        <>
          <input type="hidden" name="isNew" value="1" />
          <Field label="Key">
            <Input name="key" required placeholder="usage_organic_180" pattern="[a-z0-9_]+" />
          </Field>
        </>
      )}
      <Field label="Label">
        <Input name="label" required defaultValue={a?.label ?? ""} />
      </Field>
      <Field label="Kind" hint={lifetime ? "Lifetime usage stays blocked." : undefined}>
        {lifetime ? (
          <>
            <input type="hidden" name="kind" value="blocked" />
            <Input value="Blocked" disabled readOnly />
          </>
        ) : (
          <Select name="kind" defaultValue={a?.kind ?? "usage"}>
            <option value="usage">Usage</option>
            <option value="rush">Rush</option>
            <option value="revision">Revision</option>
            <option value="blocked">Blocked</option>
          </Select>
        )}
      </Field>
      <Field label="Percentage" hint="Blank for case by case.">
        <NumberField name="pct" step="1" min="0" unit="%" defaultValue={a?.pct ?? ""} disabled={lifetime} />
      </Field>
      <Field label="Days">
        <NumberField name="days" step="1" min="1" unit="days" defaultValue={a?.days ?? ""} disabled={lifetime} />
      </Field>
      <Field label="Note">
        <Input name="note" defaultValue={a?.note ?? ""} />
      </Field>
      <Toggle name="active" label="Active" defaultChecked={a?.active ?? true} />
    </FormGrid>
  );
}

export function ListItemFields({ list, item }: { list: "no" | "block"; item?: { key: string; label: string; description?: string; active: boolean } | null }) {
  return (
    <FormGrid>
      <input type="hidden" name="list" value={list} />
      {item ? (
        <input type="hidden" name="key" value={item.key} />
      ) : (
        <>
          <input type="hidden" name="isNew" value="1" />
          <Field label="Key">
            <Input name="key" required pattern="[a-z0-9_]+" placeholder={list === "no" ? "exclusivity_no_fee" : "adult_content"} />
          </Field>
        </>
      )}
      <Field label="Label">
        <Input name="label" required defaultValue={item?.label ?? ""} />
      </Field>
      {list === "no" ? (
        <Field label="Description">
          <Textarea name="description" rows={3} defaultValue={item?.description ?? ""} />
        </Field>
      ) : null}
      <Toggle name="active" label="Active" description="Active items block deals at Qualify." defaultChecked={item?.active ?? true} />
    </FormGrid>
  );
}
