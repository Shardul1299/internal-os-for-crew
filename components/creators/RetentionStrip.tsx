// §9 retention metrics strip (Creators → All). Reported signals; no minimum guarantees anywhere.
import { Stat } from "@/components/ui";
import { pct } from "@/lib/format";
import type { retentionMetrics } from "@/lib/queries/creators";

export function RetentionStrip({ m }: { m: Awaited<ReturnType<typeof retentionMetrics>> }) {
  return (
    <div className="px-5 py-4 border-b border-rule grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-x-6 gap-y-4" aria-label="Retention">
      <Stat label="Check-in adherence" value={pct(m.checkinAdherence)} caption="Held within 14 days of due" />
      <Stat label="12-month churn" value={pct(m.churn)} caption="Roster to Alumni" />
      <Stat label="Deal renewal" value={pct(m.renewal)} caption="Finished recurring deals renewed" />
      <Stat label="Recurring" value={pct(m.mix?.recurring)} caption={m.mix ? `One-off ${pct(m.mix.oneOff)} · ${m.mix.total} signed` : "No signed deals"} />
      <Stat label="Brand repeat" value={pct(m.brandRepeat)} caption="Brands with 2+ signed deals" />
      <Stat label="Feedback" value={m.feedback != null ? `${m.feedback}/5` : "—"} caption="Five-question survey average" />
    </div>
  );
}
