// Read models for Settings (§3.7, §10, §12) and the Portals overview.
import "server-only";
import { and, asc, count, desc, eq, inArray, isNotNull, isNull, sql as dsql } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { NUMERIC_SETTINGS } from "@/lib/rules/config";

export async function getLadders() {
  const [ladders, uses] = await Promise.all([
    db.select().from(s.ladders).orderBy(desc(s.ladders.version)),
    db.select({ id: s.deals.ladderVersionId, n: count() }).from(s.deals).where(isNotNull(s.deals.ladderVersionId)).groupBy(s.deals.ladderVersionId),
  ]);
  const n = new Map(uses.map((u) => [u.id, u.n]));
  return ladders.map((l) => ({ ...l, dealCount: n.get(l.id) ?? 0 }));
}

export const getDeliverableTypes = () => db.select().from(s.deliverableTypes).orderBy(asc(s.deliverableTypes.sortOrder), asc(s.deliverableTypes.key));
export const getAddons = () => db.select().from(s.addons).orderBy(asc(s.addons.kind), asc(s.addons.key));
export async function getRubric() {
  const [r] = await db.select().from(s.filterRubrics).where(eq(s.filterRubrics.active, true)).orderBy(desc(s.filterRubrics.version)).limit(1);
  return r ?? null;
}
export const getNoList = () => db.select().from(s.noListItems).orderBy(asc(s.noListItems.key));
export const getBlocklist = () => db.select().from(s.blocklistCategories).orderBy(asc(s.blocklistCategories.key));
export const getCommissionRules = () => db.select().from(s.commissionRules).orderBy(asc(s.commissionRules.origin));
/** Every row of the settings table, in the §12.7 order of NUMERIC_SETTINGS; share rules and unknown keys last. */
export async function getNumericSettings() {
  const rows = await db.select().from(s.settings).orderBy(asc(s.settings.key));
  const order = new Map<string, number>([...NUMERIC_SETTINGS.map((n, i) => [n.key, i] as const), ...SHARE_KEYS.map((k, i) => [k, 900 + i] as const)]);
  return rows.sort((a, b) => (order.get(a.key) ?? 999) - (order.get(b.key) ?? 999));
}
export const getTemplates = () => db.select().from(s.templates).orderBy(asc(s.templates.label));

export const SHARE_KEYS = ["upsell_share_pct", "referral_share_pct", "referral_deal_count"] as const;

export type UserRow = typeof s.users.$inferSelect & { brandName: string | null; creatorName: string | null; cohortLabels: string[] };

export async function getUsers(): Promise<UserRow[]> {
  const [users, brands, creators, cohorts] = await Promise.all([
    db.select().from(s.users).orderBy(asc(s.users.role), asc(s.users.name)),
    db.select({ id: s.brands.id, name: s.brands.name }).from(s.brands),
    db.select({ id: s.creators.id, name: s.creators.displayName }).from(s.creators),
    db.select({ id: s.programCohorts.id, label: s.programCohorts.batchLabel }).from(s.programCohorts),
  ]);
  const b = new Map(brands.map((x) => [x.id, x.name]));
  const c = new Map(creators.map((x) => [x.id, x.name]));
  const k = new Map(cohorts.map((x) => [x.id, x.label]));
  return users.map((u) => ({
    ...u,
    brandName: u.brandId ? b.get(u.brandId) ?? null : null,
    creatorName: u.creatorId ? c.get(u.creatorId) ?? null : null,
    cohortLabels: (u.cohortIds ?? []).map((id) => k.get(id) ?? id),
  }));
}

export async function scopeOptions() {
  const [brands, creators, cohorts, contacts] = await Promise.all([
    db.select({ id: s.brands.id, name: s.brands.name }).from(s.brands).where(isNull(s.brands.archivedAt)).orderBy(asc(s.brands.name)),
    db
      .select({ id: s.creators.id, name: s.creators.displayName, stage: s.creators.stage })
      .from(s.creators)
      .where(and(isNull(s.creators.archivedAt), inArray(s.creators.stage, ["incubation", "roster", "alumni"])))
      .orderBy(asc(s.creators.displayName)),
    db.select({ id: s.programCohorts.id, label: s.programCohorts.batchLabel }).from(s.programCohorts).where(isNull(s.programCohorts.archivedAt)).orderBy(desc(s.programCohorts.startsOn)),
    db.select({ id: s.brandContacts.id, name: s.brandContacts.name, brandId: s.brandContacts.brandId }).from(s.brandContacts).where(isNull(s.brandContacts.archivedAt)),
  ]);
  return { brands, creators, cohorts, contacts };
}

export type AuditRow = {
  id: string;
  at: Date;
  userName: string | null;
  entity: string;
  entityId: string | null;
  action: string;
  changes: { field: string; from: string; to: string }[];
};

const SECRET_FIELDS = new Set(["api_key", "access_token", "refresh_token", "id_token"]);

function show(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v.length > 80 ? `${v.slice(0, 77)}…` : v;
  const j = JSON.stringify(v);
  return j.length > 80 ? `${j.slice(0, 77)}…` : j;
}

/** Changed fields old → new from audit_log.detail (`changed` maps column → [old, new]). Secrets are masked. */
export function auditChanges(action: string, detail: unknown): { field: string; from: string; to: string }[] {
  const d = (detail ?? {}) as { changed?: Record<string, [unknown, unknown]>; new?: Record<string, unknown>; old?: Record<string, unknown> };
  const mask = (k: string, v: unknown) => (SECRET_FIELDS.has(k) ? (v ? "••••" : "—") : show(v));
  if (action === "update" && d.changed) return Object.entries(d.changed).map(([k, [a, b]]) => ({ field: k, from: mask(k, a), to: mask(k, b) }));
  const row = action === "insert" ? d.new : d.old;
  if (!row) return [];
  return Object.entries(row)
    .filter(([k, v]) => v !== null && v !== "" && !["id", "created_at", "updated_at", "created_by", "archived_at"].includes(k) && !(Array.isArray(v) && v.length === 0))
    .slice(0, 8)
    .map(([k, v]) => (action === "insert" ? { field: k, from: "—", to: mask(k, v) } : { field: k, from: mask(k, v), to: "—" }));
}

export async function getAuditLog(filter: { entity?: string; userId?: string; limit?: number }): Promise<AuditRow[]> {
  const where = [filter.entity ? eq(s.auditLog.entity, filter.entity) : undefined, filter.userId ? eq(s.auditLog.userId, filter.userId) : undefined].filter(Boolean);
  const rows = await db
    .select({ a: s.auditLog, name: s.users.name })
    .from(s.auditLog)
    .leftJoin(s.users, eq(s.users.id, s.auditLog.userId))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(s.auditLog.at))
    .limit(filter.limit ?? 200);
  return rows.map(({ a, name }) => ({ id: a.id, at: a.at, userName: name, entity: a.entity, entityId: a.entityId, action: a.action, changes: auditChanges(a.action, a.detail) }));
}

export async function auditFacets() {
  const [entities, users] = await Promise.all([
    db.selectDistinct({ entity: s.auditLog.entity }).from(s.auditLog).orderBy(asc(s.auditLog.entity)),
    db
      .select({ id: s.users.id, name: s.users.name })
      .from(s.users)
      .where(inArray(s.users.id, db.selectDistinct({ id: dsql<string>`${s.auditLog.userId}` }).from(s.auditLog).where(isNotNull(s.auditLog.userId))))
      .orderBy(asc(s.users.name)),
  ]);
  return { entities: entities.map((e) => e.entity), users };
}

/** Portals overview: brand, creator and counterpart users with their scope. */
export async function getPortalUsers() {
  const users = await getUsers();
  const creatorIds = users.filter((u) => u.creatorId).map((u) => u.creatorId!);
  const stages = new Map(
    (creatorIds.length ? await db.select({ id: s.creators.id, stage: s.creators.stage }).from(s.creators).where(inArray(s.creators.id, creatorIds)) : []).map((r) => [r.id, r.stage]),
  );
  return {
    brand: users.filter((u) => u.role === "brand_user"),
    creator: users.filter((u) => u.role === "creator_user").map((u) => ({ ...u, creatorStage: u.creatorId ? stages.get(u.creatorId) ?? null : null })),
    counterpart: users.filter((u) => u.role === "program_counterpart"),
  };
}
