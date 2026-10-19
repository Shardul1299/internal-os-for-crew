import Link from "next/link";
import { requireCrew } from "@/lib/session";
import { getTemplates } from "@/lib/queries/settings";
import { saveTemplate } from "@/lib/actions/settings";
import { canEditSettings } from "@/lib/rules/settings";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { Field, Input, Markdown, EmptyState, cx } from "@/components/ui";
import { ActionForm, SubmitButton, MarkdownEditor } from "@/components/ui/client";
import { date } from "@/lib/format";

export const metadata = { title: "Settings · Templates" };
export const dynamic = "force-dynamic";

export default async function TemplateSettings({ searchParams }: { searchParams: Promise<{ sel?: string }> }) {
  const me = await requireCrew("settings");
  const { sel } = await searchParams;
  const edit = canEditSettings(me.role, "templates").ok;
  const rows = await getTemplates();
  const t = rows.find((r) => r.key === sel) ?? rows[0];
  return (
    <>
      <SettingsHeader caption="Placeholders in {{braces}} are filled when used." />
      {!t ? (
        <EmptyState>No templates.</EmptyState>
      ) : (
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          <nav aria-label="Templates" className="lg:w-[260px] shrink-0 border-b lg:border-b-0 lg:border-r border-rule max-h-[40vh] lg:max-h-none overflow-y-auto">
            <ul>
              {rows.map((r) => (
                <li key={r.key}>
                  <Link href={`/settings/templates?sel=${r.key}`} className={cx("block px-5 py-2 border-b border-rule", r.key === t.key ? "bg-raised font-semibold" : "hover:bg-raised")}>
                    <span className="block truncate">{r.label}</span>
                    <span className="t-caption block">{r.key}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex-1 min-w-0 px-5 py-4">
            {edit ? (
              <ActionForm action={saveTemplate} key={t.key}>
                <input type="hidden" name="key" value={t.key} />
                <Field label="Label">
                  <Input name="label" required defaultValue={t.label} />
                </Field>
                <div className="mt-2">
                  <MarkdownEditor name="bodyMd" defaultValue={t.bodyMd} rows={22} />
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <SubmitButton>Save template</SubmitButton>
                  <span className="t-caption">Updated {date(t.updatedAt)}</span>
                </div>
              </ActionForm>
            ) : (
              <Markdown source={t.bodyMd} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
