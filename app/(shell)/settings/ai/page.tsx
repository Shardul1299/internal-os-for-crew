import { requireCrew } from "@/lib/session";
import { getMaskedAiSettings, AI_PROVIDERS, PROVIDER_LABELS, DEFAULT_MODELS } from "@/lib/studio/ai";
import { saveAi, clearAi } from "@/lib/actions/settings";
import { canEditSettings } from "@/lib/rules/settings";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { Field, FormGrid, Input, Select, Section, Kvs, Kv } from "@/components/ui";
import { ActionForm, ActionButton, SubmitButton } from "@/components/ui/client";

export const metadata = { title: "Settings · AI" };
export const dynamic = "force-dynamic";

// §19.15: one org-level key, encrypted at rest; only a masked preview ever reaches the page.
export default async function AiSettings() {
  const me = await requireCrew("settings");
  const edit = canEditSettings(me.role, "ai").ok;
  const ai = await getMaskedAiSettings();
  return (
    <>
      <SettingsHeader readOnly={!edit} caption="Without a key, every generator still offers Copy prompt." />
      <Section title="Provider" className="max-w-[640px]">
        {edit ? (
          <>
            <ActionForm action={saveAi}>
              <FormGrid>
                <Field label="Provider">
                  <Select name="provider" defaultValue={ai.provider}>
                    {AI_PROVIDERS.map((p) => (
                      <option key={p} value={p}>
                        {PROVIDER_LABELS[p]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Model" hint="Blank uses the provider default.">
                  <Input name="model" defaultValue={ai.model} placeholder={DEFAULT_MODELS[ai.provider] || "model id"} />
                </Field>
                <Field label="Custom endpoint" hint="OpenAI-compatible; custom provider only.">
                  <Input type="url" name="customEndpoint" defaultValue={ai.customEndpoint} placeholder="https://" />
                </Field>
                <Field label="API key" hint={ai.hasKey ? "Blank keeps the current key." : undefined}>
                  <Input type="password" name="apiKey" autoComplete="off" placeholder={ai.hasKey ? ai.keyPreview : "No key set"} />
                </Field>
              </FormGrid>
              <div className="mt-4">
                <SubmitButton>Save</SubmitButton>
              </div>
            </ActionForm>
            {ai.hasKey ? (
              <div className="mt-6 pt-3 border-t border-rule">
                <ActionButton action={clearAi} fields={{ confirm: "1" }} variant="danger">
                  Clear key
                </ActionButton>
              </div>
            ) : null}
          </>
        ) : (
          <Kvs>
            <Kv k="Provider" v={PROVIDER_LABELS[ai.provider]} />
            <Kv k="Model" v={ai.model || DEFAULT_MODELS[ai.provider]} />
            <Kv k="Key" v={ai.hasKey ? ai.keyPreview : "Not set"} />
          </Kvs>
        )}
      </Section>
    </>
  );
}
