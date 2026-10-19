// Inbox read model — brand inbound handled on the creator's behalf (BRIEF §6, §10). Crew Desk only.
import "server-only";
import { and, asc, desc, eq, inArray, isNull, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { isPastSla } from "@/lib/rules/inbox";

/** Domain of the per-creator forwarding addresses `<handle>@<domain>` (Gmail forwards brand mail there). */
export function inboundDomain(): string {
  return (process.env.INBOUND_EMAIL_DOMAIN || "inbox.crew.example").toLowerCase();
}

export type ThreadRow = typeof s.inboxThreads.$inferSelect & { creatorName: string | null; brandName: string | null; pastSla: boolean };

const OPEN = ["new", "triaged"] as const;

/** Open threads by SLA (soonest first), then handled threads newest first. */
export async function listThreads(view: "open" | "done" | "all"): Promise<ThreadRow[]> {
  const base = db
    .select({ t: s.inboxThreads, creatorName: s.creators.displayName, brandName: s.brands.name })
    .from(s.inboxThreads)
    .leftJoin(s.creators, eq(s.creators.id, s.inboxThreads.creatorId))
    .leftJoin(s.brands, eq(s.brands.id, s.inboxThreads.brandId));
  const now = new Date();
  const map = (r: { t: typeof s.inboxThreads.$inferSelect; creatorName: string | null; brandName: string | null }): ThreadRow => ({
    ...r.t,
    creatorName: r.creatorName,
    brandName: r.brandName,
    pastSla: isPastSla({ slaDueAt: r.t.slaDueAt, status: r.t.status }, now),
  });
  const open = view === "done" ? [] : await base.where(and(inArray(s.inboxThreads.status, [...OPEN]), isNull(s.inboxThreads.archivedAt))).orderBy(asc(s.inboxThreads.slaDueAt));
  const done = view === "open" ? [] : await base.where(and(notInArray(s.inboxThreads.status, [...OPEN]), isNull(s.inboxThreads.archivedAt))).orderBy(desc(s.inboxThreads.receivedAt)).limit(200);
  return [...open, ...done].map(map);
}

export async function threadCounts() {
  const rows = await db.select({ status: s.inboxThreads.status }).from(s.inboxThreads).where(isNull(s.inboxThreads.archivedAt));
  const open = rows.filter((r) => r.status === "new" || r.status === "triaged").length;
  return { open, done: rows.length - open, all: rows.length };
}

export async function getThread(id: string) {
  const [row] = await db
    .select({ t: s.inboxThreads, creatorName: s.creators.displayName, brand: s.brands, dealTitle: s.deals.title, dealStage: s.deals.stage })
    .from(s.inboxThreads)
    .leftJoin(s.creators, eq(s.creators.id, s.inboxThreads.creatorId))
    .leftJoin(s.brands, eq(s.brands.id, s.inboxThreads.brandId))
    .leftJoin(s.deals, eq(s.deals.id, s.inboxThreads.dealId))
    .where(eq(s.inboxThreads.id, id));
  return row ?? null;
}

/** Creators a thread can be addressed to (roster and Tier 0 — the ones Crew represents or incubates). */
export async function inboxCreators() {
  return db
    .select({ id: s.creators.id, name: s.creators.displayName })
    .from(s.creators)
    .where(and(inArray(s.creators.stage, ["roster", "incubation"]), isNull(s.creators.archivedAt)))
    .orderBy(asc(s.creators.displayName));
}

export async function brandOptions() {
  return db.select({ id: s.brands.id, name: s.brands.name }).from(s.brands).where(isNull(s.brands.archivedAt)).orderBy(asc(s.brands.name));
}

/** Handles per creator for forwarding-address routing: platform handles + the Studio profile handle. */
export async function creatorHandles(): Promise<{ id: string; handles: string[] }[]> {
  const creators = await db.select({ id: s.creators.id }).from(s.creators).where(and(inArray(s.creators.stage, ["roster", "incubation"]), isNull(s.creators.archivedAt)));
  if (!creators.length) return [];
  const ids = creators.map((c) => c.id);
  const [platforms, profiles] = await Promise.all([
    db.select({ creatorId: s.creatorPlatforms.creatorId, handle: s.creatorPlatforms.handle }).from(s.creatorPlatforms).where(and(inArray(s.creatorPlatforms.creatorId, ids), isNull(s.creatorPlatforms.archivedAt))),
    db.select({ creatorId: s.creatorProfiles.creatorId, handle: s.creatorProfiles.handle }).from(s.creatorProfiles).where(inArray(s.creatorProfiles.creatorId, ids)),
  ]);
  return ids.map((id) => ({
    id,
    handles: [...platforms.filter((p) => p.creatorId === id).map((p) => p.handle), ...profiles.filter((p) => p.creatorId === id && p.handle).map((p) => p.handle)],
  }));
}

/** The forwarding handle shown for a creator: primary platform handle, else the first one. */
export async function primaryHandle(creatorId: string): Promise<string | null> {
  const rows = await db
    .select({ handle: s.creatorPlatforms.handle, isPrimary: s.creatorPlatforms.isPrimary })
    .from(s.creatorPlatforms)
    .where(and(eq(s.creatorPlatforms.creatorId, creatorId), isNull(s.creatorPlatforms.archivedAt)));
  return (rows.find((r) => r.isPrimary) ?? rows[0])?.handle ?? null;
}

/** Brand guess from the sender's email domain (contacts first, then website). */
export async function brandForSender(from: string): Promise<string | null> {
  const domain = from.match(/@([^\s>]+)/)?.[1]?.toLowerCase();
  if (!domain || /^(gmail|yahoo|outlook|hotmail|icloud|proton(mail)?)\./.test(domain)) return null;
  const contacts = await db.select({ brandId: s.brandContacts.brandId, email: s.brandContacts.email }).from(s.brandContacts).where(isNull(s.brandContacts.archivedAt));
  const hit = contacts.find((c) => c.email?.toLowerCase().endsWith(`@${domain}`));
  if (hit) return hit.brandId;
  const brands = await db.select({ id: s.brands.id, website: s.brands.website }).from(s.brands).where(isNull(s.brands.archivedAt));
  const w = brands.find((b) => b.website && new RegExp(`(^|//|\\.)${domain.replace(/\./g, "\\.")}(/|$)`).test(b.website.toLowerCase()));
  return w?.id ?? null;
}

/** The inbox_decline template with the creator's name filled in. */
export async function declineTemplate(creatorName: string | null): Promise<string> {
  const [tpl] = await db.select({ bodyMd: s.templates.bodyMd }).from(s.templates).where(eq(s.templates.key, "inbox_decline"));
  return (tpl?.bodyMd ?? "").replace(/\{\{creator\}\}/g, creatorName ?? "our creators").trim();
}
