// Credibility first (decision-maker comments, saves, shares, inbound, tracked sign-ups); impressions last and smaller (§8.5).
import { Stat } from "@/components/ui";
import { int } from "@/lib/format";
import type { Credibility } from "@/lib/rules/campaigns";

export function CredibilityStats({ c }: { c: Credibility }) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
        <Stat label="Decision-maker comments" value={int(c.decisionMakerComments)} />
        <Stat label="Saves" value={int(c.saves)} />
        <Stat label="Shares" value={int(c.shares)} />
        <Stat label="Inbound to brand" value={int(c.inbound)} />
        <Stat label="Tracked sign-ups" value={int(c.signups)} />
      </div>
      <p className="t-caption mt-4">
        Impressions <span className="num">{int(c.impressions)}</span> · {c.reporting} {c.reporting === 1 ? "post" : "posts"} reporting
      </p>
    </div>
  );
}
