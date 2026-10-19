// Settings gates — BRIEF §3.7, §10, §12, §19.15. Thresholds, percentages and cadences are settings;
// these rules keep the edits inside the product rules that must never weaken (CLAUDE.md).
import { gate, type GateResult, RUNG_ORDER, type RungKey } from "./config";

export type SettingsSection =
  | "ladder"
  | "deliverables"
  | "addons"
  | "filter"
  | "nolist"
  | "commission"
  | "numbers"
  | "templates"
  | "users"
  | "ai"
  | "audit"
  | "data";

/**
 * Sections whose edits change money or gate rules: Owner only, Crew lead reads.
 * Deliverable multiples, add-on percentages and Filter thresholds change prices and gates, so they sit here too.
 */
// BRIEF: clarify — the assignment names ladder, commission, numbers, NO list/blocklist; deliverables, add-ons and
// Filter thresholds also change prices or gates, so they are read restrictively as Owner-only.
export const OWNER_ONLY_SECTIONS: SettingsSection[] = ["ladder", "deliverables", "addons", "filter", "nolist", "commission", "numbers", "ai"];

export function canReadSettings(role: string): boolean {
  return role === "owner" || role === "crew_lead";
}

export function canEditSettings(role: string, section: SettingsSection): GateResult {
  if (!canReadSettings(role)) return gate(["Only the Owner and Crew lead open Settings"]);
  if (section === "audit") return gate(["The audit log is read-only"]);
  if (OWNER_ONLY_SECTIONS.includes(section) && role !== "owner") return gate(["Only the Owner changes this"]);
  return gate([]);
}

/** A ladder version has exactly five rungs, strictly rising, with Standard at 0 (§0.1 #7, §12.1). */
export function validateLadder(rungs: Partial<Record<RungKey, number>>): GateResult {
  const r: string[] = [];
  const vals = RUNG_ORDER.map((k) => rungs[k]);
  if (vals.some((v) => v == null || !Number.isFinite(v))) r.push("All five rungs need a percentage");
  else {
    const v = vals as number[];
    if (rungs.standard !== 0) r.push("Standard stays at 0");
    for (let i = 1; i < v.length; i++) if (v[i] <= v[i - 1]) r.push("Rungs must rise from Lucrative to Premium");
    if (v[0] <= -100) r.push("Lucrative can't be −100% or lower");
  }
  return gate([...new Set(r)]);
}

/** Lifetime usage is never selectable; usage terms stay within the usage maximum (§0.1 #7). */
export function validateAddon(
  a: { key: string; kind: string; pct: number | null; days: number | null },
  usageMaxDays: number,
): GateResult {
  const r: string[] = [];
  const isLifetime = a.key === "lifetime" || a.key.includes("lifetime");
  if (isLifetime && a.kind !== "blocked") r.push("Lifetime usage stays blocked");
  if (a.pct != null && (a.pct < 0 || a.pct > 200)) r.push("Percentage must be 0–200");
  if (a.kind === "blocked" && a.pct != null) r.push("A blocked add-on has no percentage");
  if (a.kind === "usage") {
    if (a.days == null && a.pct != null) r.push("A usage add-on needs a term in days");
    if (a.days != null && a.days > usageMaxDays) r.push(`Usage term over ${usageMaxDays} days`);
  }
  if (a.days != null && a.days <= 0) r.push("Days must be positive");
  return gate(r);
}

export function validateDeliverable(d: { key: string; label: string; multiple: number }): GateResult {
  const r: string[] = [];
  if (!/^[a-z0-9_]+$/.test(d.key)) r.push("Key uses lowercase letters, digits and underscores");
  if (!d.label.trim()) r.push("Label missing");
  if (!(d.multiple > 0) || d.multiple > 20) r.push("Multiple must be above 0 and at most 20");
  return gate(r);
}

/** Filter rubric thresholds on the 3–15 scale (three 1–5 scores). */
export function validateRubric(t: { watchlist: number; roster: number; challenge_top_n: number; revisit_min: number; revisit_max: number }): GateResult {
  const r: string[] = [];
  for (const [k, v] of Object.entries({ watchlist: t.watchlist, roster: t.roster, revisit_min: t.revisit_min, revisit_max: t.revisit_max })) {
    if (!Number.isInteger(v) || v < 3 || v > 15) r.push(`${k.replace("_", " ")} must be 3–15`);
  }
  if (!Number.isInteger(t.challenge_top_n) || t.challenge_top_n < 1) r.push("Top N must be at least 1");
  if (t.revisit_min > t.revisit_max) r.push("Revisit band is upside down");
  if (t.revisit_max >= t.watchlist) r.push("Revisit band must sit below the watchlist threshold");
  return gate([...new Set(r)]);
}

/** Commission from origin; shares come out of Crew's commission (§0.1 #8). */
export function validateCommission(c: { origins: Record<string, number>; upsellSharePct: number; referralSharePct: number; referralDealCount: number }): GateResult {
  const r: string[] = [];
  for (const [o, p] of Object.entries(c.origins)) if (!(p > 0) || p >= 100) r.push(`${o.replace(/_/g, " ")} must be above 0 and below 100`);
  const minCommission = Math.min(...Object.values(c.origins));
  if (c.upsellSharePct < 0 || c.referralSharePct < 0) r.push("Shares can't be negative");
  if (c.upsellSharePct + c.referralSharePct >= minCommission) r.push("Shares must fit inside Crew's commission");
  if (!Number.isInteger(c.referralDealCount) || c.referralDealCount < 0) r.push("Referral deal count must be a whole number");
  return gate(r);
}

/** Numeric settings: non-negative; ratios within 0–1; usage never beyond 365 days (CLAUDE.md). */
export function validateNumber(key: string, value: number): GateResult {
  const r: string[] = [];
  if (!Number.isFinite(value)) r.push("Enter a number");
  else {
    if (value < 0) r.push("Can't be negative");
    if (key === "sponsored_ratio_max" && (value <= 0 || value > 1)) r.push("Ratio must be above 0 and at most 1");
    if (key === "usage_max_days" && value > 365) r.push("Usage terms stay at or under 365 days");
    if (key.endsWith("_pct") && value > 100) r.push("Percentage over 100");
    if ((key.endsWith("_days") || key.endsWith("_months") || key.endsWith("_hours")) && !Number.isInteger(value)) r.push("Whole numbers only");
  }
  return gate(r);
}

/** Only the Owner grants or removes the Owner role; nobody changes their own role or deactivates themself. */
export function canAssignRole(ctx: { actorRole: string; actorId: string }, target: { id: string | null; currentRole: string | null }, newRole: string): GateResult {
  const r: string[] = [];
  if (ctx.actorRole !== "owner" && ctx.actorRole !== "crew_lead") r.push("Only the Owner and Crew lead manage users");
  if (newRole === "owner" && ctx.actorRole !== "owner") r.push("Only the Owner grants the Owner role");
  if (target.currentRole === "owner" && ctx.actorRole !== "owner") r.push("Only the Owner changes an Owner");
  if (target.id && target.id === ctx.actorId && target.currentRole !== newRole) r.push("You can't change your own role");
  return gate(r);
}

export function canDeactivate(ctx: { actorRole: string; actorId: string }, target: { id: string; role: string }): GateResult {
  const r: string[] = [];
  if (ctx.actorRole !== "owner" && ctx.actorRole !== "crew_lead") r.push("Only the Owner and Crew lead manage users");
  if (target.id === ctx.actorId) r.push("You can't deactivate yourself");
  if (target.role === "owner" && ctx.actorRole !== "owner") r.push("Only the Owner changes an Owner");
  return gate(r);
}

/** Portal users carry a scope: brand users a brand, creator users a creator, counterparts at least one cohort. */
export function validateScope(role: string, scope: { brandId: string | null; creatorId: string | null; cohortIds: string[] }): GateResult {
  const r: string[] = [];
  if (role === "brand_user" && !scope.brandId) r.push("Brand users need a brand");
  if (role === "creator_user" && !scope.creatorId) r.push("Creator users need a creator");
  if (role === "program_counterpart" && !scope.cohortIds.length) r.push("Counterparts need at least one cohort");
  return gate(r);
}

/** Exports never carry tier or other internal creator fields (§0.1 #6). */
export const CREATOR_EXPORT_COLUMNS = [
  "id",
  "display_name",
  "stage",
  "sub_category",
  "primary_platform",
  "city",
  "country",
  "languages",
  "source",
  "consent_status",
  "first_look_until",
  "revisit_on",
  "email",
  "created_at",
] as const;
