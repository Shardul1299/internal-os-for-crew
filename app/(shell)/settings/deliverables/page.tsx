import { requireCrew } from "@/lib/session";
import { getDeliverableTypes } from "@/lib/queries/settings";
import { saveDeliverable } from "@/lib/actions/settings";
import { canEditSettings } from "@/lib/rules/settings";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { DeliverableFields } from "@/components/settings/forms";
import { PLATFORM_LABEL } from "@/components/program/fields";
import { FormSheet } from "@/components/program/FormSheet";
import { Table, THead, TH, TR, TD, WithInspector, InspectorTitle, Kvs, Kv, selHref } from "@/components/ui";
import { ActionForm, SubmitButton, KeyRows } from "@/components/ui/client";

export const metadata = { title: "Settings · Deliverables" };
export const dynamic = "force-dynamic";

export default async function DeliverableSettings({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireCrew("settings");
  const sp = await searchParams;
  const edit = canEditSettings(me.role, "deliverables").ok;
  const rows = await getDeliverableTypes();
  const sel = rows.find((r) => r.key === sp.sel);
  const base = "/settings/deliverables";
  return (
    <>
      <SettingsHeader
        readOnly={!edit}
        caption="Priced as a multiple of the creator's dedicated Reel Standard."
        action={
          edit ? (
            <FormSheet label="Add deliverable" title="Deliverable" action={saveDeliverable} variant="primary" dataNew submitLabel="Add">
              <DeliverableFields />
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
                <TH align="right">Order</TH>
                <TH>Deliverable</TH>
                <TH>Key</TH>
                <TH>Platform</TH>
                <TH align="right">× Reel</TH>
                <TH>Status</TH>
              </THead>
              <tbody>
                {rows.map((d) => {
                  const href = selHref(base, sp, d.key);
                  return (
                    <TR key={d.key} href={href} selected={sel?.key === d.key}>
                      <TD align="right" className="w-16 text-fg-3">{d.sortOrder}</TD>
                      <TD href={href}>{d.label}</TD>
                      <TD className="text-fg-3">{d.key}</TD>
                      <TD className="text-fg-2">{PLATFORM_LABEL[d.platform] ?? d.platform}</TD>
                      <TD align="right">{d.defaultMultipleOfReel}</TD>
                      <TD className={d.active ? undefined : "text-fg-3"}>{d.active ? "Active" : "Off"}</TD>
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
                <ActionForm action={saveDeliverable}>
                  <DeliverableFields d={sel} />
                  <div className="mt-3">
                    <SubmitButton>Save</SubmitButton>
                  </div>
                </ActionForm>
              ) : (
                <Kvs>
                  <Kv k="Platform" v={PLATFORM_LABEL[sel.platform]} />
                  <Kv k="Multiple" v={`${sel.defaultMultipleOfReel}×`} />
                  <Kv k="Active" v={sel.active ? "Yes" : "No"} />
                </Kvs>
              )}
            </>
          ) : undefined
        }
      />
    </>
  );
}
