import { requireCrew } from "@/lib/session";
import { getNumericSettings } from "@/lib/queries/settings";
import { saveNumbers } from "@/lib/actions/settings";
import { canEditSettings } from "@/lib/rules/settings";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { Field, FormGrid, NumberField, Section, Kvs, Kv } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { money } from "@/lib/format";

export const metadata = { title: "Settings · Numbers" };
export const dynamic = "force-dynamic";

export default async function NumberSettings() {
  const me = await requireCrew("settings");
  const edit = canEditSettings(me.role, "numbers").ok;
  const rows = await getNumericSettings();
  const shown = (r: (typeof rows)[number]) => (r.unit === "paise" ? Math.round(r.value / 100) : r.value);
  const unit = (r: (typeof rows)[number]) => (r.unit === "paise" ? "₹" : (r.unit ?? undefined));
  return (
    <>
      <SettingsHeader readOnly={!edit} caption="Every threshold, percentage and cadence the rules read." />
      <Section className="max-w-[720px]">
        {edit ? (
          <ActionForm action={saveNumbers}>
            <FormGrid>
              {rows.map((r) => (
                <Field key={r.key} label={r.label}>
                  <NumberField name={`n_${r.key}`} step="any" min="0" required defaultValue={shown(r)} unit={unit(r)} />
                </Field>
              ))}
            </FormGrid>
            <div className="mt-4 sticky bottom-0 bg-bg py-3">
              <SubmitButton>Save</SubmitButton>
            </div>
          </ActionForm>
        ) : (
          <Kvs>
            {rows.map((r) => (
              <Kv key={r.key} k={r.label} v={<span className="num">{r.unit === "paise" ? money(r.value) : `${r.value} ${r.unit ?? ""}`}</span>} />
            ))}
          </Kvs>
        )}
      </Section>
    </>
  );
}
