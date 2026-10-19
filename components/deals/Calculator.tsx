"use client";
// Scratch quote (§5.3): creator (or a tier for the default Standard), deliverable, qty, rung, add-ons → price.
// Computed by lib/rules/ladder. No follower, impression, CPV or CPM input exists.
import { useMemo, useState } from "react";
import { SegmentedControl, RungControl } from "@/components/ui/client";
import { Field, Select, NumberField, Toggle, Kv, Kvs, Caption } from "@/components/ui";
import { computeLine, commissionPct, defaultRung, type DealType } from "@/lib/rules/ladder";
import { RUNG_ORDER, type RulesConfig, type RungKey, type DealOrigin } from "@/lib/rules/config";
import { money, RUNG_LABEL } from "@/lib/format";
import { FieldGroup } from "./FieldGroup";

type Cell = { standardPaise: number; isDefault: boolean };

export function Calculator({
  cfg,
  creators,
  standards,
  tierDefaults,
}: {
  cfg: RulesConfig;
  creators: { id: string; name: string }[];
  standards: Record<string, Record<string, Cell>>;
  tierDefaults: Record<string, Record<string, Cell>>;
}) {
  const [mode, setMode] = useState<"creator" | "tier">(creators.length ? "creator" : "tier");
  const [creatorId, setCreatorId] = useState(creators[0]?.id ?? "");
  const [tier, setTier] = useState("T1");
  const [deliverableKey, setDeliverableKey] = useState(cfg.deliverables[0]?.key ?? "");
  const [qty, setQty] = useState(1);
  const [type, setType] = useState<DealType>("pilot");
  const [rung, setRung] = useState<RungKey>("standard");
  const [addons, setAddons] = useState<string[]>([]);
  const [origin, setOrigin] = useState<DealOrigin>("crew_originated");

  const std = mode === "creator" ? standards[creatorId]?.[deliverableKey] : tierDefaults[tier]?.[deliverableKey];
  const total = useMemo(() => (std ? computeLine(cfg, { standardPaise: std.standardPaise, qty, rung, addons }) : 0), [cfg, std, qty, rung, addons]);
  const comm = commissionPct(cfg, origin);
  const crew = Math.round((total * comm) / 100);
  const rungs = RUNG_ORDER.map((k) => ({ key: k, label: RUNG_LABEL[k], pct: cfg.rungs[k] }));
  const priced = cfg.addons.filter((a) => a.pct != null && a.kind !== "blocked");
  const rushKeys = priced.filter((a) => a.kind === "rush").map((a) => a.key);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
      <div>
        <div className="mb-3">
          <SegmentedControl
            options={[
              { value: "creator", label: "Creator" },
              { value: "tier", label: "Default by tier" },
            ]}
            value={mode}
            onChange={(v) => setMode(v as "creator" | "tier")}
          />
        </div>
        {mode === "creator" ? (
          <Field label="Creator">
            <Select value={creatorId} onChange={(e) => setCreatorId(e.target.value)}>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <Field label="Tier">
            <Select value={tier} onChange={(e) => setTier(e.target.value)}>
              {["T0", "T1", "T2", "T3"].map((t) => (
                <option key={t} value={t}>
                  {t} × {cfg.tierScale[t as keyof typeof cfg.tierScale]}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Deliverable">
          <Select value={deliverableKey} onChange={(e) => setDeliverableKey(e.target.value)}>
            {cfg.deliverables.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Quantity">
          <NumberField min={1} step={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="max-w-[140px]" />
        </Field>
        <Field label="Deal type" hint="Sets the default rung.">
          <Select
            value={type}
            onChange={(e) => {
              const t = e.target.value as DealType;
              setType(t);
              setRung(defaultRung(t));
            }}
          >
            <option value="pilot">Pilot</option>
            <option value="retainer">Retainer</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
            <option value="one_off">One-off</option>
          </Select>
        </Field>
        <FieldGroup label="Rung">
          <div className="overflow-x-auto">
            <RungControl key={rung + type} rungs={rungs} value={rung} onChange={(r) => setRung(r as RungKey)} />
          </div>
        </FieldGroup>
        <FieldGroup label="Add-ons">
          <div>
            {priced.map((a) => (
              <Toggle
                key={a.key}
                label={a.label}
                description={`+${a.pct}%${a.days ? (a.kind === "rush" ? ` · under ${a.days} days` : ` · ${a.days} days`) : ""}`}
                checked={addons.includes(a.key)}
                onChange={(e) =>
                  setAddons((cur) => {
                    let next = cur.filter((k) => k !== a.key);
                    if (e.target.checked) {
                      if (a.kind === "rush") next = next.filter((k) => !rushKeys.includes(k));
                      next.push(a.key);
                    }
                    return next;
                  })
                }
              />
            ))}
            {cfg.addons
              .filter((a) => a.kind === "blocked")
              .map((a) => (
                <Toggle key={a.key} label={a.label} description="Not offered" disabled checked={false} onChange={() => {}} className="opacity-50 cursor-not-allowed" />
              ))}
          </div>
        </FieldGroup>
        <Field label="Origin" hint="Sets Crew's commission.">
          <Select value={origin} onChange={(e) => setOrigin(e.target.value as DealOrigin)}>
            <option value="crew_originated">Crew originated</option>
            <option value="creator_inbound">Creator inbound</option>
            <option value="frontseat_lead">Frontseat lead</option>
            <option value="snoball_referral">Snoball referral</option>
            <option value="owled_referral">OWLED referral</option>
          </Select>
        </Field>
      </div>
      <aside className="xl:border-l xl:border-rule xl:pl-6">
        <div className="t-label">Price</div>
        <div className="t-big text-pink-fg num mt-2">{money(total)}</div>
        <div className="mt-4">
          <Kvs>
            <Kv k="Standard" v={std ? `${money(std.standardPaise)}${std.isDefault ? " · default" : ""}` : "—"} />
            <Kv k="Rung" v={`${RUNG_LABEL[rung]} ${cfg.rungs[rung] === 0 ? "0" : `${cfg.rungs[rung] > 0 ? "+" : "−"}${Math.abs(cfg.rungs[rung])}%`}`} />
            <Kv k="Add-ons" v={addons.length ? `+${addons.reduce((t, k) => t + (cfg.addons.find((a) => a.key === k)?.pct ?? 0), 0)}%` : "None"} />
            <Kv k={`Crew ${comm}%`} v={money(crew)} />
            <Kv k="Creator share" v={money(total - crew)} />
          </Kvs>
        </div>
        <Caption className="mt-3">Each creator at their own rung. No bundle discount.</Caption>
      </aside>
    </div>
  );
}
