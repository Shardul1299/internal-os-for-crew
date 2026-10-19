// Brand CRM read model (BRIEF §3.3, §10). Crew Desk only.
import "server-only";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";

export const OWNER_TEAM_LABEL: Record<string, string> = { crew: "Crew", owled_social: "OWLED Social", snoball: "Snoball", shared: "Shared" };
export const CATEGORY_LABEL: Record<string, string> = {
  ai_tool: "AI tool",
  dev_tool: "Dev tool",
  saas: "SaaS",
  fintech: "Fintech",
  edtech: "Edtech",
  vc: "VC",
  consumer: "Consumer",
  enterprise: "Enterprise",
  other: "Other",
};

export type BrandListRow = typeof s.brands.$inferSelect & { lastDeal: { id: string; title: string; stage: string; at: Date } | null; dealCount: number };

export async function listBrands(q?: string): Promise<BrandListRow[]> {
  const brands = await db.select().from(s.brands).where(isNull(s.brands.archivedAt)).orderBy(asc(s.brands.name));
  const filtered = q ? brands.filter((b) => b.name.toLowerCase().includes(q.toLowerCase())) : brands;
  if (!filtered.length) return [];
  const deals = await db
    .select({ id: s.deals.id, brandId: s.deals.brandId, title: s.deals.title, stage: s.deals.stage, at: s.deals.createdAt })
    .from(s.deals)
    .where(and(inArray(s.deals.brandId, filtered.map((b) => b.id)), isNull(s.deals.archivedAt)))
    .orderBy(desc(s.deals.createdAt));
  return filtered.map((b) => {
    const mine = deals.filter((d) => d.brandId === b.id);
    return { ...b, lastDeal: mine[0] ? { id: mine[0].id, title: mine[0].title, stage: mine[0].stage, at: mine[0].at } : null, dealCount: mine.length };
  });
}

export async function getBrand(id: string) {
  const [brand] = await db.select().from(s.brands).where(eq(s.brands.id, id));
  if (!brand) return null;
  const [contacts, deals, feedback, reviewer, campaigns] = await Promise.all([
    db.select().from(s.brandContacts).where(and(eq(s.brandContacts.brandId, id), isNull(s.brandContacts.archivedAt))).orderBy(desc(s.brandContacts.isPrimary), asc(s.brandContacts.name)),
    db.select().from(s.deals).where(and(eq(s.deals.brandId, id), isNull(s.deals.archivedAt))).orderBy(desc(s.deals.createdAt)),
    db.select().from(s.brandFeedback).where(and(eq(s.brandFeedback.brandId, id), isNull(s.brandFeedback.archivedAt))).orderBy(desc(s.brandFeedback.submittedOn)),
    brand.riskReviewedBy ? db.select({ name: s.users.name }).from(s.users).where(eq(s.users.id, brand.riskReviewedBy)) : Promise.resolve([]),
    db.select({ id: s.campaigns.id, name: s.campaigns.name, dealId: s.campaigns.dealId }).from(s.campaigns).where(eq(s.campaigns.brandId, id)),
  ]);
  const portalUserIds = contacts.map((c) => c.portalUserId).filter((x): x is string => !!x);
  const portalUsers = portalUserIds.length ? await db.select({ id: s.users.id, active: s.users.active }).from(s.users).where(inArray(s.users.id, portalUserIds)) : [];
  return { brand, contacts, deals, feedback, reviewerName: reviewer[0]?.name ?? null, campaigns, portalUsers };
}
