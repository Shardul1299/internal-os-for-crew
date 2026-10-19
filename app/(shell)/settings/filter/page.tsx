import { requireCrew } from "@/lib/session";
import { getRubric } from "@/lib/queries/settings";
import { saveRubric } from "@/lib/actions/settings";
import { canEditSettings } from "@/lib/rules/settings";
import { DEFAULT_CONFIG } from "@/lib/rules/config";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { Field, FormGrid, NumberField, Section, Kvs, Kv } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/ui/client";

export const metadata = { title: "Settings · Filter" };
export const dynamic = "force-dynamic";

const ROWS = [
  { key: "watchlist", label: "Watchlist threshold", unit: "/ 15" },
  { key: "roster", label: "Roster threshold", unit: "/ 15" },
  { key: "challenge_top_n", label: "Challenge top N", unit: "entries" },
  { key: "revisit_min", label: "Revisit band from", unit: "/ 15" },
  { key: "revisit_max", label: "Revisit band to", unit: "/ 15" },
] as const;

export default async function FilterSettings() {
  const me = await requireCrew("settings");
  const edit = canEditSettings(me.role, "filter").ok;
  const r = await getRubric();
  const t = r?.thresholds ?? { watchlist: DEFAULT_CONFIG.filter.watchlist, roster: DEFAULT_CONFIG.filter.roster, challenge_top_n: 7, revisit_min: 10, revisit_max: 11 };
  return (
    <>
      <SettingsHeader readOnly={!edit} caption={`Aesthetics, taste, personality — 1–5 each plus one sentence. Rubric v${r?.version ?? 1}.`} />
      <Section title="Thresholds" className="max-w-[640px]">
        {edit ? (
          <ActionForm action={saveRubric}>
            <FormGrid>
              {ROWS.map((row) => (
                <Field key={row.key} label={row.label}>
                  <NumberField name={row.key} step="1" min={row.key === "challenge_top_n" ? 1 : 3} max={row.key === "challenge_top_n" ? 50 : 15} required defaultValue={t[row.key]} unit={row.unit} />
                </Field>
              ))}
            </FormGrid>
            <div className="mt-4">
              <SubmitButton>Save as new version</SubmitButton>
            </div>
          </ActionForm>
        ) : (
          <Kvs>
            {ROWS.map((row) => (
              <Kv key={row.key} k={row.label} v={`${t[row.key]} ${row.unit}`} />
            ))}
          </Kvs>
        )}
      </Section>
    </>
  );
}
