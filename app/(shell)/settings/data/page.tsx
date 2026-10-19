import { requireCrew } from "@/lib/session";
import { importCsv } from "@/lib/actions/settings";
import { canEditSettings } from "@/lib/rules/settings";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { Section, List, Field, FormGrid, Select, Textarea, Caption } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/ui/client";

export const metadata = { title: "Settings · Import / export" };
export const dynamic = "force-dynamic";

const EXPORTS = [
  { href: "/api/export/creators", title: "Creators", meta: "No tier, no Filter scores" },
  { href: "/api/export/brands", title: "Brands", meta: "Owner team, category, risk flags" },
  { href: "/api/export/deals", title: "Deals", meta: "Stage, origin, totals" },
  { href: "/api/export/payments", title: "Payments", meta: "Invoices and payouts" },
];

export default async function DataSettings() {
  const me = await requireCrew("settings");
  const edit = canEditSettings(me.role, "data").ok;
  return (
    <>
      <SettingsHeader caption="CSV. Tier never appears in any export." />
      <Section title="Export" flush>
        <List>
          {EXPORTS.map((e) => (
            <li key={e.href} className="flex items-center gap-3 h-9 px-5 border-b border-rule hover:bg-raised">
              <a href={e.href} download className="flex-1 min-w-0 flex items-center gap-3">
                <span className="truncate">{e.title}</span>
                <span className="ml-auto t-callout text-fg-3">{e.meta}</span>
              </a>
              <a href={e.href} download className="t-callout underline underline-offset-2">
                Download
              </a>
            </li>
          ))}
        </List>
      </Section>
      {edit ? (
        <Section title="Import" className="max-w-[760px]">
          <ActionForm action={importCsv} resetOnSuccess>
            <FormGrid>
              <Field label="Kind">
                <Select name="kind" defaultValue="creators">
                  <option value="creators">Creators → Scout</option>
                  <option value="brands">Brands</option>
                </Select>
              </Field>
              <Field label="CSV" hint="Header row first. Tier columns are ignored.">
                <Textarea name="csv" rows={10} className="font-mono text-[12px]" placeholder={"display_name,sub_category,primary_platform,source,city,email\nAsha Rao,ai_educator,instagram,outbound,Pune,asha@example.com"} />
              </Field>
            </FormGrid>
            <div className="mt-3">
              <SubmitButton>Import</SubmitButton>
            </div>
          </ActionForm>
          <Caption className="mt-2">Creators: display_name, sub_category required. Brands: name required.</Caption>
        </Section>
      ) : null}
    </>
  );
}
