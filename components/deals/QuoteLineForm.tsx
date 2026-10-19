"use client";
// One quote line on the ladder calculator (§5.3): creator → Standard for the deliverable (flagged "default"
// when it falls back to the ladder default), qty, rung (five segments), add-ons as toggles, optional hand price.
// Totals preview through lib/rules/ladder; the server action re-checks every gate. No follower, impression,
// CPV or CPM input exists here.
import { useMemo, useState } from "react";
import { ActionForm, SubmitButton, RungControl } from "@/components/ui/client";
import { Field, Select, NumberField, Toggle, Input, Caption, Kv, Kvs, Alert } from "@/components/ui";
import { computeLine } from "@/lib/rules/ladder";
import { RUNG_ORDER, type RulesConfig, type RungKey } from "@/lib/rules/config";
import { saveQuoteLine } from "@/lib/actions/quotes";
import { FieldGroup } from "./FieldGroup";
import { money, RUNG_LABEL } from "@/lib/format";

export type StandardsTable = Record<string, Record<string, { standardPaise: number; isDefault: boolean }>>;

export type LineDraft = {
  lineId?: string;
  creatorId: string;
  deliverableKey: string;
  qty: number;
  rung: RungKey;
  addons: string[];
  manualRupees: number | null;
  note: string | null;
};

function addonLine(a: RulesConfig["addons"][number]) {
  if (a.kind === "blocked") return "Not offered";
  const pct = a.pct != null ? `+${a.pct}%` : "";
  const days = a.days ? (a.kind === "rush" ? ` · delivery under ${a.days} days` : ` · ${a.days} days`) : "";
  return `${pct}${days}`;
}

export function QuoteLineForm({
  cfg,
  dealId,
  creators,
  standards,
  defaultRungs,
  draft,
  belowLucrativeOverride,
  onDone,
}: {
  cfg: RulesConfig;
  dealId: string;
  creators: { id: string; name: string }[];
  standards: StandardsTable;
  defaultRungs: Record<string, RungKey>;
  draft?: LineDraft;
  belowLucrativeOverride: boolean;
  onDone?: () => void;
}) {
  const [creatorId, setCreatorId] = useState(draft?.creatorId ?? creators[0]?.id ?? "");
  const [deliverableKey, setDeliverableKey] = useState(draft?.deliverableKey ?? cfg.deliverables[0]?.key ?? "");
  const [qty, setQty] = useState(draft?.qty ?? 1);
  const [rung, setRung] = useState<RungKey>(draft?.rung ?? defaultRungs[creatorId] ?? "standard");
  const [rungTouched, setRungTouched] = useState(!!draft);
  const [addons, setAddons] = useState<string[]>(draft?.addons ?? []);
  const [manual, setManual] = useState<string>(draft?.manualRupees != null ? String(draft.manualRupees) : "");

  const std = standards[creatorId]?.[deliverableKey];
  const rungs = RUNG_ORDER.map((k) => ({ key: k, label: RUNG_LABEL[k], pct: cfg.rungs[k] }));
  const priced = cfg.addons.filter((a) => a.pct != null && a.kind !== "blocked");
  const usage = priced.filter((a) => a.kind === "usage");
  const rush = priced.filter((a) => a.kind === "rush");
  const lifetime = cfg.addons.filter((a) => a.kind === "blocked");

  const total = useMemo(() => (std ? computeLine(cfg, { standardPaise: std.standardPaise, qty, rung, addons }) : 0), [cfg, std, qty, rung, addons]);
  const floor = useMemo(() => (std ? computeLine(cfg, { standardPaise: std.standardPaise, qty, rung: "lucrative", addons }) : 0), [cfg, std, qty, addons]);
  const manualPaise = manual === "" ? null : Math.round(Number(manual) * 100);
  const belowFloor = manualPaise != null && manualPaise < floor;

  const toggle = (key: string, on: boolean, kind: string) => {
    setAddons((cur) => {
      let next = cur.filter((k) => k !== key);
      if (on) {
        if (kind === "rush") next = next.filter((k) => !rush.some((r) => r.key === k));
        next.push(key);
      }
      return next;
    });
  };

  return (
    <ActionForm action={saveQuoteLine} onDone={onDone} resetOnSuccess={!draft} className="space-y-1">
      <input type="hidden" name="dealId" value={dealId} />
      {draft?.lineId ? <input type="hidden" name="lineId" value={draft.lineId} /> : null}
      {addons.map((k) => (
        <input key={k} type="hidden" name="addons" value={k} />
      ))}
      <Field label="Creator">
        <Select
          name="creatorId"
          value={creatorId}
          onChange={(e) => {
            setCreatorId(e.target.value);
            if (!rungTouched) setRung(defaultRungs[e.target.value] ?? "standard");
          }}
        >
          {creators.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Deliverable" hint={std ? `Standard ${money(std.standardPaise)}${std.isDefault ? " · default" : ""}` : undefined}>
        <Select name="deliverableKey" value={deliverableKey} onChange={(e) => setDeliverableKey(e.target.value)}>
          {cfg.deliverables.map((d) => (
            <option key={d.key} value={d.key}>
              {d.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Quantity">
        <NumberField name="qty" min={1} max={100} step={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="max-w-[140px]" />
      </Field>
      <FieldGroup label="Rung">
        <div className="overflow-x-auto">
          <RungControl
            key={`${creatorId}-${rungTouched}`}
            rungs={rungs}
            value={rung}
            name="rung"
            onChange={(r) => {
              setRung(r as RungKey);
              setRungTouched(true);
            }}
          />
        </div>
      </FieldGroup>
      <FieldGroup label="Usage">
        <div>
          {usage.map((a) => (
            <Toggle key={a.key} label={a.label} description={addonLine(a)} checked={addons.includes(a.key)} onChange={(e) => toggle(a.key, e.target.checked, a.kind)} />
          ))}
          {lifetime.map((a) => (
            <Toggle key={a.key} label={a.label} description="Not offered" disabled checked={false} onChange={() => {}} className="opacity-50 cursor-not-allowed" />
          ))}
        </div>
      </FieldGroup>
      <FieldGroup label="Rush">
        <div>
          {rush.map((a) => (
            <Toggle key={a.key} label={a.label} description={addonLine(a)} checked={addons.includes(a.key)} onChange={(e) => toggle(a.key, e.target.checked, a.kind)} />
          ))}
        </div>
      </FieldGroup>
      <Field label="Hand price" hint={belowFloor ? (belowLucrativeOverride ? "Below Lucrative · override approved" : "Below Lucrative · needs Owner override") : "Optional. Leave empty to use the ladder."}>
        <NumberField name="manualRupees" unit="₹" min={0} step={1} value={manual} onChange={(e) => setManual(e.target.value)} className="max-w-[220px]" />
      </Field>
      <Field label="Note">
        <Input name="note" defaultValue={draft?.note ?? ""} />
      </Field>
      <div className="pt-3">
        <Kvs>
          <Kv k="Line total" v={<span className="num font-semibold">{money(manualPaise ?? total)}</span>} />
          <Kv k="Lucrative floor" v={<span className="num text-fg-3">{money(floor)}</span>} />
        </Kvs>
        {belowFloor && !belowLucrativeOverride ? <Caption tone="alert">
            <Alert>Below Lucrative</Alert> needs an Owner override.
          </Caption> : null}
      </div>
      <div className="pt-3">
        <SubmitButton>{draft?.lineId ? "Save line" : "Add line"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
