// Loads the rules configuration from the settings tables (§3.7). Thresholds are settings, not constants.
import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "./db";
import * as s from "./db/schema";
import { DEFAULT_CONFIG, type RulesConfig, type DealOrigin, type Tier } from "./rules/config";

export const getConfig = cache(async (): Promise<RulesConfig> => {
  const [ladder] = await db.select().from(s.ladders).where(eq(s.ladders.active, true)).orderBy(s.ladders.version).limit(1);
  const [rubric] = await db.select().from(s.filterRubrics).where(eq(s.filterRubrics.active, true)).limit(1);
  const [tiers, deliverables, addons, noList, blocklist, commission, settings] = await Promise.all([
    db.select().from(s.tierScale),
    db.select().from(s.deliverableTypes).where(eq(s.deliverableTypes.active, true)).orderBy(s.deliverableTypes.sortOrder),
    db.select().from(s.addons),
    db.select().from(s.noListItems).where(eq(s.noListItems.active, true)),
    db.select().from(s.blocklistCategories).where(eq(s.blocklistCategories.active, true)),
    db.select().from(s.commissionRules),
    db.select().from(s.settings),
  ]);
  const n = { ...DEFAULT_CONFIG.n } as Record<string, number>;
  for (const row of settings) n[row.key] = row.value;
  const cfg: RulesConfig = {
    ladderVersionId: ladder?.id ?? null,
    rungs: ladder ? (Object.fromEntries(ladder.rungs.map((r) => [r.key, r.pct])) as RulesConfig["rungs"]) : DEFAULT_CONFIG.rungs,
    tierScale: tiers.length ? (Object.fromEntries(tiers.map((t) => [t.tier, t.multiple])) as Record<Tier, number>) : DEFAULT_CONFIG.tierScale,
    deliverables: deliverables.length ? deliverables.map((d) => ({ key: d.key, label: d.label, platform: d.platform, multiple: d.defaultMultipleOfReel })) : DEFAULT_CONFIG.deliverables,
    addons: addons.length ? addons.filter((a) => a.active).map((a) => ({ key: a.key, label: a.label, pct: a.pct, kind: a.kind, days: a.days, note: a.note ?? undefined })) : DEFAULT_CONFIG.addons,
    filter: rubric
      ? { watchlist: rubric.thresholds.watchlist, roster: rubric.thresholds.roster, challengeTopN: rubric.thresholds.challenge_top_n, revisitMin: rubric.thresholds.revisit_min, revisitMax: rubric.thresholds.revisit_max }
      : DEFAULT_CONFIG.filter,
    commission: commission.length ? (Object.fromEntries(commission.map((c) => [c.origin, c.pct])) as Record<DealOrigin, number>) : DEFAULT_CONFIG.commission,
    upsellSharePct: n.upsell_share_pct ?? DEFAULT_CONFIG.upsellSharePct,
    referralSharePct: n.referral_share_pct ?? DEFAULT_CONFIG.referralSharePct,
    referralDealCount: n.referral_deal_count ?? DEFAULT_CONFIG.referralDealCount,
    noList: noList.length ? noList.map((x) => ({ key: x.key, label: x.label })) : DEFAULT_CONFIG.noList,
    blocklist: blocklist.length ? blocklist.map((x) => ({ key: x.key, label: x.label })) : DEFAULT_CONFIG.blocklist,
    n: n as RulesConfig["n"],
  };
  return cfg;
});
