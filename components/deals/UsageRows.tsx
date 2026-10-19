"use client";
// Usage rights on the deal terms: kind + days (≤ the usage maximum) + channels. Lifetime is not a kind.
import { useState } from "react";
import { Button, Select, NumberField, Input } from "@/components/ui";

type Row = { kind: "organic_reuse" | "whitelisting" | "web_print"; days: number; channels: string[] };
const KINDS: [Row["kind"], string, number][] = [
  ["organic_reuse", "Organic reuse", 90],
  ["whitelisting", "Whitelisting", 90],
  ["web_print", "Web / print", 365],
];

export function UsageRows({ name, initial, maxDays, disabled }: { name: string; initial: Row[]; maxDays: number; disabled?: boolean }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const set = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-1">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-[150px_120px_1fr_auto] gap-1">
          <Select value={r.kind} disabled={disabled} onChange={(e) => set(i, { kind: e.target.value as Row["kind"] })} aria-label="Usage kind">
            {KINDS.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
          <NumberField unit="days" min={1} max={maxDays} value={r.days} disabled={disabled} onChange={(e) => set(i, { days: Number(e.target.value) })} aria-label="Days" />
          <Input
            placeholder="Channels, comma separated"
            disabled={disabled}
            value={r.channels.join(", ")}
            onChange={(e) => set(i, { channels: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
            aria-label="Channels"
          />
          <Button type="button" variant="quiet" size="sm" disabled={disabled} onClick={() => setRows((x) => x.filter((_, j) => j !== i))}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" disabled={disabled} onClick={() => setRows((x) => [...x, { kind: "organic_reuse", days: 90, channels: [] }])}>
        Add usage
      </Button>
      <p className="t-caption">Up to {maxDays} days. Lifetime is not offered.</p>
    </div>
  );
}
