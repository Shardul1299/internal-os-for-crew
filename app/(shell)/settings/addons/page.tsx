import { requireCrew } from "@/lib/session";
import { getAddons } from "@/lib/queries/settings";
import { saveAddon } from "@/lib/actions/settings";
import { canEditSettings } from "@/lib/rules/settings";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { AddonFields } from "@/components/settings/forms";
import { FormSheet } from "@/components/program/FormSheet";
import { Table, THead, TH, TR, TD, WithInspector, InspectorTitle, Kvs, Kv, selHref } from "@/components/ui";
import { ActionForm, SubmitButton, KeyRows } from "@/components/ui/client";
import { humanize } from "@/lib/format";

export const metadata = { title: "Settings · Add-ons" };
export const dynamic = "force-dynamic";

export default async function AddonSettings({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireCrew("settings");
  const sp = await searchParams;
  const edit = canEditSettings(me.role, "addons").ok;
  const rows = await getAddons();
  const sel = rows.find((r) => r.key === sp.sel);
  const base = "/settings/addons";
  return (
    <>
      <SettingsHeader
        readOnly={!edit}
        caption="Usage terms stay within the usage maximum. Lifetime is never offered."
        action={
          edit ? (
            <FormSheet label="Add add-on" title="Add-on" action={saveAddon} variant="primary" dataNew submitLabel="Add">
              <AddonFields />
            </FormSheet>
          ) : undefined
        }
      />
      <WithInspector
        closeHref={base}
        main={
          <KeyRows>
            <Table>
              <THead>
                <TH>Add-on</TH>
                <TH>Key</TH>
                <TH>Kind</TH>
                <TH align="right">%</TH>
                <TH align="right">Days</TH>
                <TH>Note</TH>
                <TH>Status</TH>
              </THead>
              <tbody>
                {rows.map((a) => {
                  const href = selHref(base, sp, a.key);
                  return (
                    <TR key={a.key} href={href} selected={sel?.key === a.key}>
                      <TD href={href}>{a.label}</TD>
                      <TD className="text-fg-3">{a.key}</TD>
                      <TD className={a.kind === "blocked" ? "text-pink-fg font-semibold" : "text-fg-2"}>{humanize(a.kind)}</TD>
                      <TD align="right">{a.pct == null ? "—" : `+${a.pct}`}</TD>
                      <TD align="right">{a.days ?? "—"}</TD>
                      <TD className="text-fg-2">{a.note ?? ""}</TD>
                      <TD className={a.active ? undefined : "text-fg-3"}>{a.active ? "Active" : "Off"}</TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
          </KeyRows>
        }
        inspector={
          sel ? (
            <>
              <InspectorTitle sub={sel.key}>{sel.label}</InspectorTitle>
              {edit ? (
                <ActionForm action={saveAddon}>
                  <AddonFields a={sel} />
                  <div className="mt-3">
                    <SubmitButton>Save</SubmitButton>
                  </div>
                </ActionForm>
              ) : (
                <Kvs>
                  <Kv k="Kind" v={humanize(sel.kind)} />
                  <Kv k="Percentage" v={sel.pct == null ? "Case by case" : `+${sel.pct}%`} />
                  <Kv k="Days" v={sel.days} />
                </Kvs>
              )}
            </>
          ) : undefined
        }
      />
    </>
  );
}
