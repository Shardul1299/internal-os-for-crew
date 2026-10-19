import { requireCrew } from "@/lib/session";
import { getCommissionRules, getNumericSettings } from "@/lib/queries/settings";
import { saveCommission } from "@/lib/actions/settings";
import { canEditSettings } from "@/lib/rules/settings";
import { DEFAULT_CONFIG } from "@/lib/rules/config";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { Field, FormGrid, NumberField, Section, Kvs, Kv } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { humanize } from "@/lib/format";

export const metadata = { title: "Settings · Commission" };
export const dynamic = "force-dynamic";

export default async function CommissionSettings() {
  const me = await requireCrew("settings");
  const edit = canEditSettings(me.role, "commission").ok;
  const [rules, nums] = await Promise.all([getCommissionRules(), getNumericSettings()]);
  const pct = Object.fromEntries(rules.map((r) => [r.origin, r.pct])) as Record<string, number>;
  const n = Object.fromEntries(nums.map((r) => [r.key, r.value])) as Record<string, number>;
  const origins = Object.keys(DEFAULT_CONFIG.commission);
  const shares = [
    { key: "upsell_share_pct", label: "Upsell share", unit: "% of deal", v: n.upsell_share_pct ?? DEFAULT_CONFIG.upsellSharePct },
    { key: "referral_share_pct", label: "Referral share", unit: "% of deal", v: n.referral_share_pct ?? DEFAULT_CONFIG.referralSharePct },
    { key: "referral_deal_count", label: "Referral on first", unit: "deals", v: n.referral_deal_count ?? DEFAULT_CONFIG.referralDealCount },
  ];
  return (
    <>
      <SettingsHeader readOnly={!edit} caption="Computed from origin. Shares come out of Crew's commission." />
      {edit ? (
        <ActionForm action={saveCommission} className="max-w-[640px]">
          <Section title="Commission by origin">
            <FormGrid>
              {origins.map((o) => (
                <Field key={o} label={humanize(o)}>
                  <NumberField name={`origin_${o}`} step="0.5" min="0" max="99" required defaultValue={pct[o] ?? DEFAULT_CONFIG.commission[o as keyof typeof DEFAULT_CONFIG.commission]} unit="%" />
                </Field>
              ))}
            </FormGrid>
          </Section>
          <Section title="Shares">
            <FormGrid>
              {shares.map((s) => (
                <Field key={s.key} label={s.label}>
                  <NumberField name={s.key} step={s.key === "referral_deal_count" ? "1" : "0.5"} min="0" required defaultValue={s.v} unit={s.unit} />
                </Field>
              ))}
            </FormGrid>
            <div className="mt-4">
              <SubmitButton>Save</SubmitButton>
            </div>
          </Section>
        </ActionForm>
      ) : (
        <div className="max-w-[640px]">
          <Section title="Commission by origin">
            <Kvs>
              {origins.map((o) => (
                <Kv key={o} k={humanize(o)} v={`${pct[o] ?? "—"}%`} />
              ))}
            </Kvs>
          </Section>
          <Section title="Shares">
            <Kvs>
              {shares.map((s) => (
                <Kv key={s.key} k={s.label} v={`${s.v} ${s.unit}`} />
              ))}
            </Kvs>
          </Section>
        </div>
      )}
    </>
  );
}
