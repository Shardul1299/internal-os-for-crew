// The ladder calculator — BRIEF §5.3, §12.1–12.4.
// line_total = standard × qty × (1 + rung_pct) × (1 + Σ addon_pct)
// There is no follower, impression, CPV or CPM input anywhere in this module (§0.1 #1).
import { type RulesConfig, type RungKey, type Tier, type DealOrigin, RUNG_ORDER, gate, type GateResult } from "./config";

export type DealType = "pilot" | "retainer" | "quarterly" | "annual" | "one_off";

export type StandardSource = { standardPaise: number; isDefault: boolean };

/** The creator's own Standard for the deliverable, or the ladder default × tier scale (flagged "default"). */
export function resolveStandard(
  cfg: RulesConfig,
  args: { ownStandardPaise?: number | null; deliverableKey: string; tier: Tier | null },
): StandardSource {
  if (args.ownStandardPaise != null && args.ownStandardPaise > 0) return { standardPaise: args.ownStandardPaise, isDefault: false };
  const d = cfg.deliverables.find((x) => x.key === args.deliverableKey);
  const multiple = d?.multiple ?? 1;
  const scale = cfg.tierScale[args.tier ?? "T1"] ?? 1;
  return { standardPaise: Math.round(cfg.n.tier1_reel_standard_placeholder * multiple * scale), isDefault: true };
}

export function rungPct(cfg: RulesConfig, rung: RungKey): number {
  return cfg.rungs[rung];
}

export function addonPct(cfg: RulesConfig, keys: string[]): number {
  return keys.reduce((sum, k) => {
    const a = cfg.addons.find((x) => x.key === k);
    return sum + (a && a.pct != null && a.kind !== "blocked" ? a.pct : 0);
  }, 0);
}

export function lineTotal(standardPaise: number, qty: number, rungPctValue: number, addonPctSum: number): number {
  return Math.round(standardPaise * qty * (1 + rungPctValue / 100) * (1 + addonPctSum / 100));
}

export function computeLine(cfg: RulesConfig, line: { standardPaise: number; qty: number; rung: RungKey; addons: string[] }): number {
  return lineTotal(line.standardPaise, line.qty, rungPct(cfg, line.rung), addonPct(cfg, line.addons));
}

/** Rung defaults by deal type (§5.3). */
export function defaultRung(
  type: DealType | null,
  opts: { exclusivity?: boolean; bulk?: boolean; usualClose?: RungKey } = {},
): RungKey {
  if (opts.exclusivity) return "premium";
  switch (type) {
    case "one_off":
      return "pitch";
    case "annual":
      return "lucrative";
    case "quarterly": {
      const usual = opts.usualClose ?? "standard";
      const i = RUNG_ORDER.indexOf(usual);
      return RUNG_ORDER[Math.max(0, i - 1)];
    }
    case "pilot":
    case "retainer":
    default:
      return opts.bulk ? "lucrative" : "standard";
  }
}

/** Rush add-on from lead time (§5.3): +15% under 7 days, +25% under 2 days. */
export function rushAddonFor(leadDays: number): string | null {
  if (leadDays < 2) return "rush_2d";
  if (leadDays < 7) return "rush_7d";
  return null;
}

export function isAddonSelectable(cfg: RulesConfig, key: string): boolean {
  const a = cfg.addons.find((x) => x.key === key);
  return !!a && a.kind !== "blocked";
}

export type QuoteLineInput = {
  creatorId: string;
  deliverableKey: string;
  qty: number;
  standardPaise: number;
  rung: RungKey | null;
  addons: string[];
  manualTotalPaise?: number | null;
  isCaseByCase?: boolean;
};

/** creator_matched → proposal_sent gate (§5.2). */
export function validateQuote(
  cfg: RulesConfig,
  args: {
    lines: QuoteLineInput[];
    exclusivity: { scope: "none" | "product" | "category"; days: number };
    usageRights: { kind: string; days: number }[];
    hasBelowLucrativeOverride: boolean;
  },
): GateResult {
  const reasons: string[] = [];
  const priced = args.lines.filter((l) => !l.isCaseByCase);
  if (priced.length === 0) reasons.push("Quote needs at least one line");
  for (const l of priced) {
    if (!l.rung) {
      reasons.push(`Line ${l.deliverableKey} has no rung`);
      continue;
    }
    for (const a of l.addons) {
      if (!isAddonSelectable(cfg, a)) reasons.push(`Add-on ${a} is not offered`);
    }
    if (l.manualTotalPaise != null) {
      const lucrativeFloor = computeLine(cfg, { standardPaise: l.standardPaise, qty: l.qty, rung: "lucrative", addons: l.addons });
      if (l.manualTotalPaise < lucrativeFloor && !args.hasBelowLucrativeOverride) reasons.push("Line below Lucrative needs an Owner override");
    }
  }
  if (args.exclusivity.scope !== "none" && priced.some((l) => l.rung !== "premium")) {
    reasons.push("Exclusivity requested: affected lines must be at Premium");
  }
  for (const u of args.usageRights) {
    if (!u.days || u.days <= 0) reasons.push("Usage term needs days");
    else if (u.days > cfg.n.usage_max_days) reasons.push(`Usage term over ${cfg.n.usage_max_days} days`);
    const addonKey = u.kind === "organic_reuse" ? "usage_organic_90" : u.kind === "whitelisting" ? "usage_whitelist_90" : "usage_web_365";
    if (!priced.some((l) => l.addons.includes(addonKey))) reasons.push(`Usage ${u.kind.replace("_", " ")} needs its add-on on a line`);
  }
  return gate(reasons);
}

export function finalLineTotal(cfg: RulesConfig, l: QuoteLineInput): number {
  if (l.isCaseByCase) return l.manualTotalPaise ?? 0;
  if (l.manualTotalPaise != null) return l.manualTotalPaise;
  return computeLine(cfg, { standardPaise: l.standardPaise, qty: l.qty, rung: l.rung ?? "standard", addons: l.addons });
}

// ---------- Commission and shares (§0.1 #8, §5.3, §12.4) ----------

export function commissionPct(cfg: RulesConfig, origin: DealOrigin): number {
  return cfg.commission[origin];
}

export type Split = {
  creatorId: string;
  role: "primary" | "upsell";
  grossPaise: number;
  creatorSharePaise: number;
  crewCommissionPaise: number;
};

/** Splits each creator's gross fee into creator share and Crew commission. */
export function splitDeal(cfg: RulesConfig, origin: DealOrigin, perCreator: { creatorId: string; role: "primary" | "upsell"; grossPaise: number }[]): Split[] {
  const c = commissionPct(cfg, origin);
  return perCreator.map((p) => {
    const crew = Math.round((p.grossPaise * c) / 100);
    return { ...p, crewCommissionPaise: crew, creatorSharePaise: p.grossPaise - crew };
  });
}

export type ShareLine = { kind: "upsell_share" | "referral_share"; toCreatorId: string; fromCreatorId: string; amountPaise: number };

/**
 * Upsell share: 3% of role=upsell creators' fees to the originating creator.
 * Referral share: 1.5% of a referred creator's fee on their first 10 deals to the referrer.
 * Both are paid from Crew's commission and never typed by hand.
 */
export function computeShares(
  cfg: RulesConfig,
  args: {
    origin: DealOrigin;
    originatingCreatorId: string | null;
    splits: Split[];
    referrals: { creatorId: string; referredByCreatorId: string | null; priorDealCount: number }[];
  },
): ShareLine[] {
  const out: ShareLine[] = [];
  if (args.origin === "creator_inbound" && args.originatingCreatorId) {
    for (const s of args.splits.filter((x) => x.role === "upsell" && x.creatorId !== args.originatingCreatorId)) {
      out.push({
        kind: "upsell_share",
        toCreatorId: args.originatingCreatorId,
        fromCreatorId: s.creatorId,
        amountPaise: Math.round((s.grossPaise * cfg.upsellSharePct) / 100),
      });
    }
  }
  for (const s of args.splits) {
    const r = args.referrals.find((x) => x.creatorId === s.creatorId);
    if (r?.referredByCreatorId && r.priorDealCount < cfg.referralDealCount) {
      out.push({
        kind: "referral_share",
        toCreatorId: r.referredByCreatorId,
        fromCreatorId: s.creatorId,
        amountPaise: Math.round((s.grossPaise * cfg.referralSharePct) / 100),
      });
    }
  }
  return out;
}

export function rungMix(lines: { rung: RungKey | null }[]): string {
  const counts = new Map<RungKey, number>();
  for (const l of lines) if (l.rung) counts.set(l.rung, (counts.get(l.rung) ?? 0) + 1);
  return RUNG_ORDER.filter((r) => counts.has(r))
    .map((r) => `${counts.get(r)} ${r === "semi" ? "semi" : r}`)
    .join(", ");
}
