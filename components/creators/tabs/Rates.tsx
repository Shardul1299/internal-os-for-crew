// Rates: the creator's Standard per deliverable (rung 0) and the five-rung ladder preview (§5.3).
// No follower, impression, CPV or CPM input exists here (§0.1 #1).
import { Section, Table, THead, TH, TR, TD, Caption, Field, Input, NumberField } from "@/components/ui";
import { ActionButton } from "@/components/ui/client";
import { SheetForm } from "../SheetForm";
import { upsertStandard, clearStandard } from "@/lib/actions/creators";
import { resolveStandard, computeLine } from "@/lib/rules/ladder";
import { RUNG_ORDER, type RulesConfig, type Tier } from "@/lib/rules/config";
import { canSetStandards } from "@/lib/rules/creator-flow";
import { money, RUNG_LABEL, signedPct, date } from "@/lib/format";
import type { creatorRates } from "@/lib/queries/creators";

export function RatesTab({ creatorId, tier, rates, cfg, role }: { creatorId: string; tier: Tier | null; rates: Awaited<ReturnType<typeof creatorRates>>; cfg: RulesConfig; role: string }) {
  const editable = canSetStandards(role).ok;
  return (
    <Section title="Standards and ladder" aside="Rung 0 is the creator's Standard" flush>
      <Table>
        <THead>
          <TH>Deliverable</TH>
          <TH align="right">Standard</TH>
          {RUNG_ORDER.map((r) => (
            <TH key={r} align="right">
              {RUNG_LABEL[r]} <span className="opacity-60">{signedPct(cfg.rungs[r])}</span>
            </TH>
          ))}
          <TH />
        </THead>
        <tbody>
          {cfg.deliverables.map((d) => {
            const own = rates.find((r) => r.deliverableKey === d.key && r.currency === "INR");
            const std = resolveStandard(cfg, { ownStandardPaise: own?.standardPaise ?? null, deliverableKey: d.key, tier });
            return (
              <TR key={d.key}>
                <TD>
                  {d.label}
                  {own?.note ? <span className="t-caption block">{own.note}</span> : null}
                </TD>
                <TD align="right" className="whitespace-nowrap">
                  <span className={std.isDefault ? "text-fg-3" : "font-semibold"}>{money(std.standardPaise)}</span>
                  {std.isDefault ? <span className="t-caption block">default</span> : own ? <span className="t-caption block">{date(own.setAt, "d MMM yy")}</span> : null}
                </TD>
                {RUNG_ORDER.map((r) => (
                  <TD key={r} align="right" className={std.isDefault ? "text-fg-3" : r === "standard" ? "text-fg" : "text-fg-2"}>
                    {money(computeLine(cfg, { standardPaise: std.standardPaise, qty: 1, rung: r, addons: [] }))}
                  </TD>
                ))}
                <TD align="right" className="whitespace-nowrap">
                  {editable ? (
                    <span className="inline-flex gap-1">
                      <SheetForm title={d.label} trigger={own ? "Edit" : "Set"} action={upsertStandard} submitLabel="Save Standard" width={440}>
                        <input type="hidden" name="id" value={creatorId} />
                        <input type="hidden" name="deliverableKey" value={d.key} />
                        <Field label="Standard">
                          <NumberField unit="₹" name="rupees" min={1} step={1} required defaultValue={own ? Math.round(own.standardPaise / 100) : ""} />
                        </Field>
                        <Field label="Note">
                          <Input name="note" defaultValue={own?.note ?? ""} maxLength={200} />
                        </Field>
                      </SheetForm>
                      {own ? (
                        <ActionButton action={clearStandard} fields={{ id: creatorId, deliverableKey: d.key }} variant="quiet">
                          Clear
                        </ActionButton>
                      ) : null}
                    </span>
                  ) : null}
                </TD>
              </TR>
            );
          })}
        </tbody>
      </Table>
      <Caption className="px-5 mt-2">Default is the ladder placeholder until a Standard is set.</Caption>
    </Section>
  );
}
