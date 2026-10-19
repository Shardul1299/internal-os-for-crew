import { requireCrew } from "@/lib/session";
import { getLadders } from "@/lib/queries/settings";
import { createLadderVersion, activateLadder } from "@/lib/actions/settings";
import { canEditSettings } from "@/lib/rules/settings";
import { RUNG_ORDER } from "@/lib/rules/config";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { FormSheet } from "@/components/program/FormSheet";
import { Table, THead, TH, TR, TD, Field, FormGrid, Input, NumberField, EmptyState } from "@/components/ui";
import { ActionButton } from "@/components/ui/client";
import { date, signedPct, RUNG_LABEL } from "@/lib/format";
import { today } from "@/lib/dates";

export const metadata = { title: "Settings · Ladder" };
export const dynamic = "force-dynamic";

export default async function LadderSettings() {
  const me = await requireCrew("settings");
  const edit = canEditSettings(me.role, "ladder").ok;
  const ladders = await getLadders();
  const active = ladders.find((l) => l.active) ?? ladders[0];
  const pctOf = (l: (typeof ladders)[number], k: string) => l.rungs.find((r) => r.key === k)?.pct;
  return (
    <>
      <SettingsHeader
        readOnly={!edit}
        caption="Quotes store the ladder version they were priced on."
        action={
          edit ? (
            <FormSheet label="New version" title="New ladder version" action={createLadderVersion} variant="primary" dataNew submitLabel="Draft version" consequence="Drafts a new version. Activate it to price new quotes.">
              <FormGrid>
                <Field label="Effective from">
                  <Input type="date" name="effectiveFrom" required defaultValue={today()} />
                </Field>
                {RUNG_ORDER.map((k) => (
                  <Field key={k} label={RUNG_LABEL[k]}>
                    <NumberField name={k} unit="%" step="1" required defaultValue={active ? pctOf(active, k) : undefined} readOnly={k === "standard"} />
                  </Field>
                ))}
              </FormGrid>
            </FormSheet>
          ) : undefined
        }
      />
      {ladders.length === 0 ? (
        <EmptyState>No ladder yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <TH>Version</TH>
            <TH>Effective</TH>
            {RUNG_ORDER.map((k) => (
              <TH key={k} align="right">
                {RUNG_LABEL[k]}
              </TH>
            ))}
            <TH align="right">Deals</TH>
            <TH>Status</TH>
            <TH align="right"> </TH>
          </THead>
          <tbody>
            {ladders.map((l) => (
              <TR key={l.id}>
                <TD className="font-semibold">v{l.version}</TD>
                <TD className="text-fg-2">{date(l.effectiveFrom)}</TD>
                {RUNG_ORDER.map((k) => {
                  const p = pctOf(l, k);
                  return (
                    <TD key={k} align="right">
                      {p == null ? "—" : signedPct(p)}
                    </TD>
                  );
                })}
                <TD align="right">{l.dealCount}</TD>
                <TD>{l.active ? <span className="font-semibold">Active</span> : <span className="text-fg-3">Draft</span>}</TD>
                <TD align="right">
                  {edit && !l.active ? (
                    <ActionButton action={activateLadder} fields={{ id: l.id }}>
                      Activate
                    </ActionButton>
                  ) : null}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
