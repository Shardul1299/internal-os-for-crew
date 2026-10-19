import { requireCrew } from "@/lib/session";
import { getNoList, getBlocklist } from "@/lib/queries/settings";
import { saveListItem } from "@/lib/actions/settings";
import { canEditSettings } from "@/lib/rules/settings";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { ListItemFields } from "@/components/settings/forms";
import { FormSheet } from "@/components/program/FormSheet";
import { Table, THead, TH, TR, TD, Section, WithInspector, InspectorTitle, Kvs, Kv, selHref } from "@/components/ui";
import { ActionForm, SubmitButton, KeyRows } from "@/components/ui/client";

export const metadata = { title: "Settings · NO list" };
export const dynamic = "force-dynamic";

export default async function NoListSettings({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireCrew("settings");
  const sp = await searchParams;
  const edit = canEditSettings(me.role, "nolist").ok;
  const [no, block] = await Promise.all([getNoList(), getBlocklist()]);
  const base = "/settings/nolist";
  const selNo = sp.sel?.startsWith("no:") ? no.find((x) => `no:${x.key}` === sp.sel) : undefined;
  const selBlock = sp.sel?.startsWith("block:") ? block.find((x) => `block:${x.key}` === sp.sel) : undefined;
  return (
    <>
      <SettingsHeader
        readOnly={!edit}
        caption="Any active item blocks a deal unless the Owner overrides with a reason."
        action={
          edit ? (
            <span className="inline-flex gap-2">
              <FormSheet label="Add blocklist category" title="Blocklist category" action={saveListItem} submitLabel="Add">
                <ListItemFields list="block" />
              </FormSheet>
              <FormSheet label="Add NO item" title="NO list item" action={saveListItem} variant="primary" dataNew submitLabel="Add">
                <ListItemFields list="no" />
              </FormSheet>
            </span>
          ) : undefined
        }
      />
      <WithInspector
        closeHref={base}
        main={
          <KeyRows>
            <Section title="NO list" flush>
              <Table>
                <THead>
                  <TH>Item</TH>
                  <TH>Key</TH>
                  <TH>Description</TH>
                  <TH>Status</TH>
                </THead>
                <tbody>
                  {no.map((x) => {
                    const href = selHref(base, sp, `no:${x.key}`);
                    return (
                      <TR key={x.key} href={href} selected={selNo?.key === x.key}>
                        <TD href={href}>{x.label}</TD>
                        <TD className="text-fg-3">{x.key}</TD>
                        <TD className="text-fg-2 max-w-[420px] truncate">{x.description}</TD>
                        <TD className={x.active ? undefined : "text-fg-3"}>{x.active ? "Active" : "Off"}</TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </Section>
            <Section title="Blocklist" flush>
              <Table>
                <THead>
                  <TH>Category</TH>
                  <TH>Key</TH>
                  <TH>Status</TH>
                </THead>
                <tbody>
                  {block.map((x) => {
                    const href = selHref(base, sp, `block:${x.key}`);
                    return (
                      <TR key={x.key} href={href} selected={selBlock?.key === x.key}>
                        <TD href={href}>{x.label}</TD>
                        <TD className="text-fg-3">{x.key}</TD>
                        <TD className={x.active ? undefined : "text-fg-3"}>{x.active ? "Active" : "Off"}</TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </Section>
          </KeyRows>
        }
        inspector={
          selNo || selBlock ? (
            <>
              <InspectorTitle sub={(selNo ?? selBlock)!.key}>{(selNo ?? selBlock)!.label}</InspectorTitle>
              {edit ? (
                <ActionForm action={saveListItem}>
                  <ListItemFields list={selNo ? "no" : "block"} item={selNo ?? selBlock} />
                  <div className="mt-3">
                    <SubmitButton>Save</SubmitButton>
                  </div>
                </ActionForm>
              ) : (
                <Kvs>
                  {selNo ? <Kv k="Description" v={selNo.description} /> : null}
                  <Kv k="Active" v={(selNo ?? selBlock)!.active ? "Yes" : "No"} />
                </Kvs>
              )}
            </>
          ) : undefined
        }
      />
    </>
  );
}
