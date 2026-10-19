// The visibility wall — BRIEF §0.1 #6, #16, §10, §20.
// Tier, Filter scores, rungs, Standards, commission, Crew notes and other creators
// never reach a brand- or creator-facing view, export, email or prompt.

export const INTERNAL_CREATOR_FIELDS = [
  "tier",
  "tierProposed",
  "tierProposedBy",
  "tierApprovedBy",
  "tierReviewedAt",
  "tierNextReviewAt",
  "notes",
  "stageReason",
  "rosterProposedBy",
  "rosterApprovedBy",
  "representationNote",
] as const;

export const INTERNAL_DEAL_FIELDS = ["commissionPct", "noListCheck", "ladderVersionId", "declinedReason", "declinedValuePaise", "lostReason", "referralNote"] as const;
export const INTERNAL_LINE_FIELDS = ["rung", "standardPaise", "standardIsDefault", "manualTotalPaise", "addons"] as const;

export function omit<T extends Record<string, unknown>, K extends readonly string[]>(obj: T, keys: K): Omit<T, K[number]> {
  const out: Record<string, unknown> = { ...obj };
  for (const k of keys) delete out[k];
  return out as Omit<T, K[number]>;
}

export function creatorForPortal<T extends Record<string, unknown>>(c: T) {
  return omit(c, INTERNAL_CREATOR_FIELDS);
}

export function dealForPortal<T extends Record<string, unknown>>(d: T) {
  return omit(d, INTERNAL_DEAL_FIELDS);
}

/** A creator sees only their own fee: the sum of their own line totals less Crew commission. */
export function creatorFeeView(lines: { creatorId: string; lineTotalPaise: number }[], creatorId: string, commissionPct: number) {
  const gross = lines.filter((l) => l.creatorId === creatorId).reduce((t, l) => t + l.lineTotalPaise, 0);
  return { feePaise: gross - Math.round((gross * commissionPct) / 100) };
}

/** Throws if an object about to leave for a portal still carries an internal field. Used in tests and in dev. */
export function assertNoInternal(value: unknown, path = "root"): void {
  const banned = new Set<string>([...INTERNAL_CREATOR_FIELDS, ...INTERNAL_DEAL_FIELDS, "rung", "standardPaise", "filterScores", "total", "aesthetics", "taste", "personality"]);
  if (Array.isArray(value)) return value.forEach((v, i) => assertNoInternal(v, `${path}[${i}]`));
  if (value && typeof value === "object" && !(value instanceof Date)) {
    for (const [k, v] of Object.entries(value)) {
      if (banned.has(k)) throw new Error(`Internal field "${k}" at ${path}`);
      assertNoInternal(v, `${path}.${k}`);
    }
  }
}

export type Viewer =
  | { kind: "crew"; role: string; userId: string }
  | { kind: "brand"; brandId: string; contactId: string | null; userId: string }
  | { kind: "creator"; creatorId: string; userId: string }
  | { kind: "counterpart"; cohortIds: string[]; userId: string };

export const ROLE_CAN = {
  money: ["owner", "crew_lead", "ops", "finance_viewer"],
  writeMoney: ["owner", "crew_lead", "ops"],
  writeCreators: ["owner", "crew_lead", "intern"],
  writeDeals: ["owner", "crew_lead"],
  readDeals: ["owner", "crew_lead", "ops", "strategist", "sales_viewer"],
  readBrands: ["owner", "crew_lead", "ops", "strategist", "sales_viewer"],
  writeBrands: ["owner", "crew_lead"],
  calendars: ["owner", "crew_lead", "strategist", "ops"],
  inbox: ["owner", "crew_lead", "intern"],
  program: ["owner", "crew_lead", "intern"],
  settings: ["owner", "crew_lead"],
  approve: ["owner"],
  tier: ["owner", "crew_lead", "strategist", "ops", "sales_viewer"], // roles that may *see* tier
} as const;

export function can(role: string, what: keyof typeof ROLE_CAN): boolean {
  return (ROLE_CAN[what] as readonly string[]).includes(role);
}
