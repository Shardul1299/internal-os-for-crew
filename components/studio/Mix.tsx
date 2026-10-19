// Ratio meters (BRIEF §19.2, §13.8): Sparkline-weight bars with the target as a hairline.
import { Meter, Caption } from "@/components/ui";
import type { RatioMeter } from "@/lib/rules/studio";

export function MeterRow({ m }: { m: RatioMeter }) {
  return (
    <div className="grid grid-cols-[110px_1fr_92px] items-center gap-3 py-1">
      <span className="text-fg-2">{m.label}</span>
      <Meter value={m.actual} target={m.target} alert={m.off} />
      <span className={`num text-right ${m.off ? "text-pink-fg font-semibold" : ""}`}>
        {m.actual}% <span className="text-fg-3">/ {m.target}</span>
      </span>
    </div>
  );
}

export type Mix = {
  pillar: RatioMeter[];
  concept: RatioMeter[];
  sponsored: { actual: number; max: number; headroom: number; total: number };
  planned: number;
  tolerance: number;
};

export function MixPanel({ mix, compact }: { mix: Mix; compact?: boolean }) {
  const off = [...mix.pillar, ...mix.concept].filter((m) => m.off);
  return (
    <div className={compact ? "grid md:grid-cols-2 gap-x-10" : "grid lg:grid-cols-3 gap-x-10 gap-y-4"}>
      <div>
        <div className="t-label mb-1">Pillar</div>
        {mix.pillar.map((m) => (
          <MeterRow key={m.key} m={m} />
        ))}
      </div>
      <div>
        <div className="t-label mb-1">Concept</div>
        {mix.concept.map((m) => (
          <MeterRow key={m.key} m={m} />
        ))}
      </div>
      <div>
        <div className="t-label mb-1">Sponsored this month</div>
        <div className="grid grid-cols-[110px_1fr_92px] items-center gap-3 py-1">
          <span className="text-fg-2">Share</span>
          <Meter value={Math.round(mix.sponsored.actual * 100)} target={Math.round(mix.sponsored.max * 100)} />
          <span className="num text-right">
            {Math.round(mix.sponsored.actual * 100)}% <span className="text-fg-3">/ {Math.round(mix.sponsored.max * 100)}</span>
          </span>
        </div>
        <Caption>{mix.sponsored.headroom === 0 ? "No sponsored headroom left this month" : `Room for ${mix.sponsored.headroom} more sponsored this month`}</Caption>
      </div>
      {off.length ? (
        <div className={compact ? "md:col-span-2 mt-2" : "lg:col-span-3"}>
          {off.map((m) => (
            <Caption key={m.key} tone="warn">
              {m.label} is {m.actual}% against {m.target}% — more than {mix.tolerance} points off.
            </Caption>
          ))}
        </div>
      ) : null}
    </div>
  );
}
