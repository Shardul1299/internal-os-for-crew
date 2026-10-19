// Creator Studio read models (BRIEF §19, §20). Every query here is scoped to the session's
// creator_id: callers pass the StudioCtx from requireStudio()/studioActor(), never an id from
// a form. Global starter rows (creator_id IS NULL) are readable and cloned before editing.
// Tier, Filter scores, rungs, Standards, commission, Crew notes and other creators are never
// selected into anything returned from here (lib/rules/visibility).
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, gte, ilike, inArray, isNotNull, isNull, lte, ne, notInArray, or, sql as dsql, arrayContains, count, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor, getMe, homeFor, requireMe, type Me } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { studioAccess, ratioMeters, outlierMultiple, draftLocked, type CalendarItemLite } from "@/lib/rules/studio";
import { creatorFeeView } from "@/lib/rules/visibility";
import { withBlockers, type DeliverableWithBlock } from "@/lib/queries/deliverables";
import { toBrandConfig, type BrandConfig } from "@/lib/studio/brand";
import { addDays, today as todayISO } from "@/lib/dates";
import type { RulesConfig } from "@/lib/rules/config";

export type StudioAccess = ReturnType<typeof studioAccess>;
export type StudioCtx = { me: Me; creatorId: string; displayName: string; stage: string; access: StudioAccess };
export type ProfileRow = typeof s.creatorProfiles.$inferSelect;

async function loadCreator(creatorId: string) {
  const [c] = await db
    .select({ id: s.creators.id, displayName: s.creators.displayName, stage: s.creators.stage, consent: s.creators.consentStatus })
    .from(s.creators)
    .where(and(eq(s.creators.id, creatorId), isNull(s.creators.archivedAt)));
  return c ?? null;
}

/** Page guard: creator_user with a creatorId and Studio access (§19.16). */
export const studioContext = cache(async (): Promise<StudioCtx> => {
  const me = await requireMe();
  if (me.role !== "creator_user") redirect(homeFor(me.role));
  if (!me.creatorId) redirect("/studio/closed");
  const c = await loadCreator(me.creatorId);
  if (!c) redirect("/studio/closed");
  return { me, creatorId: c.id, displayName: c.displayName, stage: c.stage, access: studioAccess(c.stage, c.consent) };
});

/** The creator's Profile row; created on first visit (§19.1). */
export async function ensureProfile(ctx: Pick<StudioCtx, "creatorId" | "me">): Promise<ProfileRow> {
  const [p] = await db.select().from(s.creatorProfiles).where(eq(s.creatorProfiles.creatorId, ctx.creatorId));
  if (p) return p;
  return withUser(ctx.me.id, async (tx) => {
    const [row] = await tx.insert(s.creatorProfiles).values({ creatorId: ctx.creatorId, createdBy: ctx.me.id }).onConflictDoNothing().returning();
    if (row) return row;
    const [again] = await tx.select().from(s.creatorProfiles).where(eq(s.creatorProfiles.creatorId, ctx.creatorId));
    return again;
  });
}

export type StudioPage = StudioCtx & { profile: ProfileRow; brand: BrandConfig; cfg: RulesConfig };

/** Every Studio page calls this. Redirects to onboarding until it is complete or skipped. */
export async function requireStudio(opts: { allowIncomplete?: boolean } = {}): Promise<StudioPage> {
  const ctx = await studioContext();
  if (!ctx.access.content) redirect("/studio/closed");
  const [profile, cfg] = await Promise.all([ensureProfile(ctx), getConfig()]);
  if (!profile.onboardingComplete && !opts.allowIncomplete) redirect("/studio/onboarding");
  return { ...ctx, profile, brand: toBrandConfig(profile, ctx.displayName), cfg };
}

/** Server-action guard: re-derives creatorId from the session; never from the form. */
export async function studioActor(section: "content" | "deals" = "content"): Promise<StudioCtx> {
  const me = await actor();
  if (me.role !== "creator_user" || !me.creatorId) throw new Error("Only creators can do that");
  const c = await loadCreator(me.creatorId);
  if (!c) throw new Error("Creator not found");
  const access = studioAccess(c.stage, c.consent);
  if (!access.content) throw new Error("Studio is closed for this account");
  if (section === "deals" && access.deals !== "write") throw new Error("Deals are read-only");
  return { me, creatorId: c.id, displayName: c.displayName, stage: c.stage, access };
}

// ---------- Profile ----------
export async function primaryPlatform(ctx: Pick<StudioCtx, "creatorId">) {
  const [p] = await db
    .select({ id: s.creatorPlatforms.id, platform: s.creatorPlatforms.platform, handle: s.creatorPlatforms.handle, followers: s.creatorPlatforms.followers, followersAsOf: s.creatorPlatforms.followersAsOf })
    .from(s.creatorPlatforms)
    .where(and(eq(s.creatorPlatforms.creatorId, ctx.creatorId), isNull(s.creatorPlatforms.archivedAt)))
    .orderBy(desc(s.creatorPlatforms.isPrimary))
    .limit(1);
  return p ?? null;
}

// ---------- Calendar ----------
export type CalendarRow = typeof s.creatorCalendarItems.$inferSelect;

/** The 8-week batch window opens on Monday of the current week (§19.3). */
export function studioWindow(cfg: RulesConfig, from?: string | null) {
  const t = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : todayISO();
  const dow = (new Date(`${t}T00:00:00Z`).getUTCDay() + 6) % 7;
  const start = addDays(t, -dow);
  return { from: start, to: addDays(start, cfg.n.calendar_window_weeks * 7 - 1), weeks: cfg.n.calendar_window_weeks };
}

export async function calendarItems(ctx: Pick<StudioCtx, "creatorId">, from?: string, to?: string): Promise<CalendarRow[]> {
  const w: SQL[] = [eq(s.creatorCalendarItems.creatorId, ctx.creatorId), isNull(s.creatorCalendarItems.archivedAt)];
  if (from) w.push(gte(s.creatorCalendarItems.date, from));
  if (to) w.push(lte(s.creatorCalendarItems.date, to));
  return db.select().from(s.creatorCalendarItems).where(and(...w)).orderBy(asc(s.creatorCalendarItems.date), asc(s.creatorCalendarItems.createdAt));
}

export async function calendarItem(ctx: Pick<StudioCtx, "creatorId">, id: string): Promise<CalendarRow | null> {
  const [r] = await db
    .select()
    .from(s.creatorCalendarItems)
    .where(and(eq(s.creatorCalendarItems.id, id), eq(s.creatorCalendarItems.creatorId, ctx.creatorId), isNull(s.creatorCalendarItems.archivedAt)));
  return r ?? null;
}

export async function blackouts(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select({ id: s.creatorBlackouts.id, startsOn: s.creatorBlackouts.startsOn, endsOn: s.creatorBlackouts.endsOn, note: s.creatorBlackouts.note })
    .from(s.creatorBlackouts)
    .where(and(eq(s.creatorBlackouts.creatorId, ctx.creatorId), isNull(s.creatorBlackouts.archivedAt)))
    .orderBy(asc(s.creatorBlackouts.startsOn));
}

export async function sponsoredMax(ctx: Pick<StudioCtx, "creatorId">, cfg: RulesConfig): Promise<number> {
  const [a] = await db.select({ max: s.creatorAnchorPlans.sponsoredRatioMax }).from(s.creatorAnchorPlans).where(eq(s.creatorAnchorPlans.creatorId, ctx.creatorId));
  return a?.max ?? cfg.n.sponsored_ratio_max;
}

export const lite = (i: CalendarRow): CalendarItemLite => ({ date: i.date, kind: i.kind, pillar: i.pillar, conceptBucket: i.conceptBucket, studioStatus: i.studioStatus, funnelStage: i.funnelStage });

/** Pillar/concept meters over the batch window; sponsored headroom for the current month (§19.2). */
export async function contentMix(ctx: Pick<StudioCtx, "creatorId">, cfg: RulesConfig, profile: ProfileRow, windowItems: CalendarRow[]) {
  const t = todayISO();
  const monthStart = `${t.slice(0, 7)}-01`;
  const [y, m] = t.split("-").map(Number);
  const monthEnd = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const [month, max] = await Promise.all([calendarItems(ctx, monthStart, monthEnd), sponsoredMax(ctx, cfg)]);
  const batch = ratioMeters(cfg, windowItems.map(lite), profile, max);
  const sponsored = ratioMeters(cfg, month.map(lite), profile, max).sponsored;
  const planned = windowItems.filter((i) => i.kind !== "blackout" && i.kind !== "shoot").length;
  return { pillar: batch.pillar, concept: batch.concept, sponsored, planned, tolerance: cfg.n.ratio_warning_points };
}

// ---------- Deliverables (their own) ----------
export type StudioDeliverable = DeliverableWithBlock & { campaignName: string; brandName: string; dealTitle: string; briefMd: string | null; briefUrl: string | null };

export async function myDeliverables(ctx: Pick<StudioCtx, "creatorId">, cfg: RulesConfig, opts: { open?: boolean; id?: string } = {}): Promise<StudioDeliverable[]> {
  const w: SQL[] = [eq(s.deliverables.creatorId, ctx.creatorId), isNull(s.deliverables.archivedAt)];
  if (opts.open) w.push(notInArray(s.deliverables.status, ["live", "reported", "cancelled"]));
  if (opts.id) w.push(eq(s.deliverables.id, opts.id));
  const rows = await db.select().from(s.deliverables).where(and(...w)).orderBy(asc(s.deliverables.dueOn));
  const withB = await withBlockers(cfg, rows);
  if (!withB.length) return [];
  const meta = await db
    .select({ campaignId: s.campaigns.id, campaignName: s.campaigns.name, brandName: s.brands.name, dealTitle: s.deals.title, briefMd: s.deals.briefMd, briefUrl: s.deals.briefUrl })
    .from(s.campaigns)
    .innerJoin(s.deals, eq(s.deals.id, s.campaigns.dealId))
    .innerJoin(s.brands, eq(s.brands.id, s.campaigns.brandId))
    .where(inArray(s.campaigns.id, [...new Set(withB.map((d) => d.campaignId))]));
  return withB.map((d) => {
    const m = meta.find((x) => x.campaignId === d.campaignId);
    return { ...d, campaignName: m?.campaignName ?? "", brandName: m?.brandName ?? "", dealTitle: m?.dealTitle ?? "", briefMd: m?.briefMd ?? null, briefUrl: m?.briefUrl ?? null };
  });
}

/** "Not cleared to post: <reason>" — the creator-side face of §5.4 (§19.3). */
export function clearance(d: Pick<DeliverableWithBlock, "blockers" | "status">): string | null {
  if (["live", "reported", "cancelled"].includes(d.status)) return null;
  return d.blockers[0] ? `Not cleared to post: ${d.blockers[0]}` : null;
}

// ---------- Research ----------
export async function outliers(ctx: Pick<StudioCtx, "creatorId">) {
  const rows = await db
    .select()
    .from(s.studioOutliers)
    .where(and(eq(s.studioOutliers.creatorId, ctx.creatorId), isNull(s.studioOutliers.archivedAt)))
    .orderBy(desc(s.studioOutliers.createdAt));
  return rows.map((r) => ({ ...r, multiple: outlierMultiple(r.views, r.followerCount) })).sort((a, b) => b.multiple - a.multiple);
}

// ---------- Hooks, scripts, templates ----------
export async function hookStacks(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select()
    .from(s.studioHookStacks)
    .where(and(eq(s.studioHookStacks.creatorId, ctx.creatorId), isNull(s.studioHookStacks.archivedAt)))
    .orderBy(desc(s.studioHookStacks.createdAt));
}

export async function hookStack(ctx: Pick<StudioCtx, "creatorId">, id: string) {
  const [r] = await db.select().from(s.studioHookStacks).where(and(eq(s.studioHookStacks.id, id), eq(s.studioHookStacks.creatorId, ctx.creatorId), isNull(s.studioHookStacks.archivedAt)));
  return r ?? null;
}

export type ScriptRow = typeof s.studioScripts.$inferSelect;

export async function myScripts(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select()
    .from(s.studioScripts)
    .where(and(eq(s.studioScripts.creatorId, ctx.creatorId), isNull(s.studioScripts.archivedAt)))
    .orderBy(desc(s.studioScripts.updatedAt));
}

/** A script the creator may open: their own, or a global starter row (read-only). */
export async function scriptFor(ctx: Pick<StudioCtx, "creatorId">, id: string): Promise<(ScriptRow & { readOnly: boolean }) | null> {
  const [r] = await db
    .select()
    .from(s.studioScripts)
    .where(and(eq(s.studioScripts.id, id), or(eq(s.studioScripts.creatorId, ctx.creatorId), isNull(s.studioScripts.creatorId)), isNull(s.studioScripts.archivedAt)));
  return r ? { ...r, readOnly: r.creatorId === null } : null;
}

export type LibraryFilters = { funnel?: string; effort?: string; topic?: string; segment?: string; type?: string; pillar?: string; q?: string; src?: string };

export async function libraryScripts(ctx: Pick<StudioCtx, "creatorId">, f: LibraryFilters, page: number, size = 50) {
  const S = s.studioScripts;
  const w: SQL[] = [isNull(S.archivedAt)];
  if (f.src === "mine") w.push(eq(S.creatorId, ctx.creatorId));
  else if (f.src === "starter") w.push(isNull(S.creatorId));
  else w.push(or(eq(S.creatorId, ctx.creatorId), isNull(S.creatorId))!);
  if (f.funnel) w.push(eq(S.funnelStage, f.funnel as "tofu"));
  if (f.effort) w.push(eq(S.effort, f.effort as "low"));
  if (f.topic) w.push(eq(S.topicTag, f.topic));
  if (f.segment) w.push(eq(S.segment, f.segment));
  if (f.type) w.push(eq(S.contentType, f.type as "educational"));
  if (f.pillar) w.push(eq(S.pillar, f.pillar as "authority"));
  if (f.q) w.push(or(ilike(S.title, `%${f.q}%`), ilike(S.angleOrStoryType, `%${f.q}%`))!);
  const scope = or(eq(S.creatorId, ctx.creatorId), isNull(S.creatorId))!;
  const [rows, total, topics, segments] = await Promise.all([
    db
      .select({ id: S.id, creatorId: S.creatorId, title: S.title, pillar: S.pillar, contentType: S.contentType, angle: S.angleOrStoryType, format: S.format, funnelStage: S.funnelStage, effort: S.effort, topicTag: S.topicTag, segment: S.segment, status: S.status, ctaType: S.ctaType })
      .from(S)
      .where(and(...w))
      .orderBy(dsql`${S.creatorId} is null`, asc(S.title))
      .limit(size)
      .offset(page * size),
    db.select({ n: count() }).from(S).where(and(...w)),
    db.select({ v: S.topicTag, n: count() }).from(S).where(and(scope, isNull(S.archivedAt), ne(S.topicTag, ""))).groupBy(S.topicTag).orderBy(asc(S.topicTag)),
    db.select({ v: S.segment, n: count() }).from(S).where(and(scope, isNull(S.archivedAt), ne(S.segment, ""))).groupBy(S.segment).orderBy(asc(S.segment)),
  ]);
  return { rows, total: total[0]?.n ?? 0, topics: topics.map((t) => t.v), segments: segments.map((t) => t.v) };
}

export async function templates(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select()
    .from(s.studioScriptTemplates)
    .where(and(or(eq(s.studioScriptTemplates.creatorId, ctx.creatorId), isNull(s.studioScriptTemplates.creatorId)), isNull(s.studioScriptTemplates.archivedAt)))
    .orderBy(desc(s.studioScriptTemplates.createdAt));
}

// ---------- Carousels ----------
export type CarouselRow = typeof s.studioCarousels.$inferSelect;
export type CarouselFilters = { archetype?: string; funnel?: string; cta?: string; pillar?: string; status?: string; src?: string; q?: string; topic?: string };

export async function carousels(ctx: Pick<StudioCtx, "creatorId">, f: CarouselFilters, page: number, size = 50) {
  const C = s.studioCarousels;
  const w: SQL[] = [isNull(C.archivedAt)];
  if (f.src === "mine") w.push(eq(C.creatorId, ctx.creatorId));
  else if (f.src === "starter") w.push(isNull(C.creatorId));
  else w.push(or(eq(C.creatorId, ctx.creatorId), isNull(C.creatorId))!);
  if (f.archetype) w.push(eq(C.archetype, f.archetype));
  if (f.funnel) w.push(eq(C.funnelStage, f.funnel as "tofu"));
  if (f.cta) w.push(eq(C.ctaType, f.cta as "save"));
  if (f.pillar) w.push(eq(C.pillar, f.pillar as "authority"));
  if (f.status) w.push(eq(C.status, f.status as "draft"));
  if (f.topic) w.push(eq(C.topicTag, f.topic));
  if (f.q) w.push(ilike(C.title, `%${f.q}%`));
  const [rows, total] = await Promise.all([
    db.select().from(C).where(and(...w)).orderBy(dsql`${C.creatorId} is null`, desc(C.updatedAt)).limit(size).offset(page * size),
    db.select({ n: count() }).from(C).where(and(...w)),
  ]);
  return { rows, total: total[0]?.n ?? 0 };
}

export async function carouselFor(ctx: Pick<StudioCtx, "creatorId">, id: string) {
  const [c] = await db
    .select()
    .from(s.studioCarousels)
    .where(and(eq(s.studioCarousels.id, id), or(eq(s.studioCarousels.creatorId, ctx.creatorId), isNull(s.studioCarousels.creatorId)), isNull(s.studioCarousels.archivedAt)));
  if (!c) return null;
  const slides = await db.select().from(s.studioCarouselSlides).where(eq(s.studioCarouselSlides.carouselId, c.id)).orderBy(asc(s.studioCarouselSlides.slideNumber));
  return { ...c, readOnly: c.creatorId === null, slides };
}

// ---------- Results ----------
export type PostRow = typeof s.studioPosts.$inferSelect;
export async function posts(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select()
    .from(s.studioPosts)
    .where(and(eq(s.studioPosts.creatorId, ctx.creatorId), isNull(s.studioPosts.archivedAt)))
    .orderBy(desc(s.studioPosts.postedOn));
}

// ---------- Crew-facing parts (§19.14) ----------
export async function payouts(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select({ id: s.creatorPayouts.id, kind: s.creatorPayouts.kind, dueOn: s.creatorPayouts.dueOn, amountPaise: s.creatorPayouts.amountPaise, currency: s.creatorPayouts.currency, status: s.creatorPayouts.status, paidOn: s.creatorPayouts.paidOn, dealTitle: s.deals.title, brandName: s.brands.name })
    .from(s.creatorPayouts)
    .innerJoin(s.deals, eq(s.deals.id, s.creatorPayouts.dealId))
    .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
    .where(and(eq(s.creatorPayouts.creatorId, ctx.creatorId), isNull(s.creatorPayouts.archivedAt)))
    .orderBy(desc(s.creatorPayouts.dueOn));
}

/** Threads Crew forwarded, with Crew's reply. The creator never replies to a brand (§6.4). */
export async function forwardedThreads(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select({ id: s.inboxThreads.id, subject: s.inboxThreads.subject, channel: s.inboxThreads.channel, fromName: s.inboxThreads.fromName, firstMessageMd: s.inboxThreads.firstMessageMd, receivedAt: s.inboxThreads.receivedAt, replyMd: s.inboxThreads.replyMd, repliedAt: s.inboxThreads.repliedAt, status: s.inboxThreads.status, brandName: s.brands.name })
    .from(s.inboxThreads)
    .leftJoin(s.brands, eq(s.brands.id, s.inboxThreads.brandId))
    .where(and(eq(s.inboxThreads.creatorId, ctx.creatorId), isNotNull(s.inboxThreads.forwardedToCreatorAt), isNull(s.inboxThreads.archivedAt)))
    .orderBy(desc(s.inboxThreads.receivedAt));
}

/** Check-in dates and notes only — outcomes (tier recommendation, Filter re-score) never leave Crew. */
export async function checkins(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select({ id: s.creatorCheckins.id, type: s.creatorCheckins.type, dueOn: s.creatorCheckins.dueOn, heldOn: s.creatorCheckins.heldOn, notesMd: s.creatorCheckins.notesMd })
    .from(s.creatorCheckins)
    .where(and(eq(s.creatorCheckins.creatorId, ctx.creatorId), isNull(s.creatorCheckins.archivedAt)))
    .orderBy(asc(s.creatorCheckins.dueOn));
}

export async function roadmap(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select({ id: s.creatorRoadmapItems.id, area: s.creatorRoadmapItems.area, goal: s.creatorRoadmapItems.goal, crewContribution: s.creatorRoadmapItems.crewContribution, status: s.creatorRoadmapItems.status })
    .from(s.creatorRoadmapItems)
    .where(and(eq(s.creatorRoadmapItems.creatorId, ctx.creatorId), isNull(s.creatorRoadmapItems.archivedAt)))
    .orderBy(asc(s.creatorRoadmapItems.area));
}

export async function topicFilters(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select({ id: s.creatorTopicFilters.id, kind: s.creatorTopicFilters.kind, value: s.creatorTopicFilters.value })
    .from(s.creatorTopicFilters)
    .where(and(eq(s.creatorTopicFilters.creatorId, ctx.creatorId), eq(s.creatorTopicFilters.active, true), isNull(s.creatorTopicFilters.archivedAt)));
}

export async function anchorPlan(ctx: Pick<StudioCtx, "creatorId">) {
  const [a] = await db
    .select({ anchorFormat: s.creatorAnchorPlans.anchorFormat, cadenceNote: s.creatorAnchorPlans.cadenceNote, sponsoredRatioMax: s.creatorAnchorPlans.sponsoredRatioMax })
    .from(s.creatorAnchorPlans)
    .where(eq(s.creatorAnchorPlans.creatorId, ctx.creatorId));
  return a ?? null;
}

/** Deals and quotes with only the creator's own fee (§10, §19.14): never commission %, rungs or other creators' lines. */
export async function myDeals(ctx: Pick<StudioCtx, "creatorId">) {
  const deals = await db
    .select({ id: s.deals.id, title: s.deals.title, stage: s.deals.stage, type: s.deals.type, currency: s.deals.currency, termStartsOn: s.deals.termStartsOn, termEndsOn: s.deals.termEndsOn, brandName: s.brands.name, role: s.dealCreators.role, status: s.dealCreators.status, commissionPct: s.deals.commissionPct })
    .from(s.dealCreators)
    .innerJoin(s.deals, eq(s.deals.id, s.dealCreators.dealId))
    .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
    .where(and(eq(s.dealCreators.creatorId, ctx.creatorId), isNull(s.dealCreators.archivedAt), isNull(s.deals.archivedAt), notInArray(s.deals.stage, ["declined", "lost"])))
    .orderBy(desc(s.deals.stageChangedAt));
  if (!deals.length) return [];
  const lines = await db
    .select({ dealId: s.dealQuoteLines.dealId, creatorId: s.dealQuoteLines.creatorId, deliverableKey: s.dealQuoteLines.deliverableKey, qty: s.dealQuoteLines.qty, lineTotalPaise: s.dealQuoteLines.lineTotalPaise, manualTotalPaise: s.dealQuoteLines.manualTotalPaise, isCaseByCase: s.dealQuoteLines.isCaseByCase })
    .from(s.dealQuoteLines)
    .where(and(inArray(s.dealQuoteLines.dealId, deals.map((d) => d.id)), eq(s.dealQuoteLines.creatorId, ctx.creatorId), isNull(s.dealQuoteLines.archivedAt)));
  return deals.map(({ commissionPct, ...d }) => {
    const mine = lines.filter((l) => l.dealId === d.id).map((l) => ({ creatorId: l.creatorId, lineTotalPaise: l.isCaseByCase ? (l.manualTotalPaise ?? 0) : (l.manualTotalPaise ?? l.lineTotalPaise) }));
    const fee = creatorFeeView(mine, ctx.creatorId, commissionPct).feePaise;
    const pieces = lines.filter((l) => l.dealId === d.id).map((l) => ({ deliverableKey: l.deliverableKey, qty: l.qty }));
    return { ...d, feePaise: mine.length ? fee : null, pieces };
  });
}

export async function sundayShoots(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select({ id: s.programSundayShoots.id, date: s.programSundayShoots.date, location: s.programSundayShoots.location })
    .from(s.programSundayShoots)
    .where(and(arrayContains(s.programSundayShoots.creators, [ctx.creatorId]), isNull(s.programSundayShoots.archivedAt)))
    .orderBy(asc(s.programSundayShoots.date));
}

export async function deliverableOptions(ctx: Pick<StudioCtx, "creatorId">) {
  return db
    .select({ id: s.deliverables.id, title: s.deliverables.title, status: s.deliverables.status, dueOn: s.deliverables.dueOn, brandName: s.brands.name })
    .from(s.deliverables)
    .innerJoin(s.campaigns, eq(s.campaigns.id, s.deliverables.campaignId))
    .innerJoin(s.brands, eq(s.brands.id, s.campaigns.brandId))
    .where(and(eq(s.deliverables.creatorId, ctx.creatorId), isNull(s.deliverables.archivedAt), ne(s.deliverables.status, "cancelled")))
    .orderBy(asc(s.deliverables.dueOn));
}

// ---------- Generator defaults ----------
export function genDefaults(cfg: RulesConfig) {
  return { ideationCount: cfg.n.ideation_batch_size, carouselSlides: cfg.n.carousel_default_slides };
}

/** Days between suggested dates for new ideas, from the creator's posts-per-week. */
export function cadenceStep(profile: ProfileRow): number {
  const nums = (profile.postingCadence.times_per_week.match(/\d+/g) ?? []).map(Number).filter((n) => n > 0);
  const per = nums.length ? Math.max(...nums) : 2;
  return Math.max(1, Math.round(7 / per));
}

// ---------- Route handlers (exports) ----------
/** Same scoping as requireStudio, but returns null instead of redirecting. */
export async function studioRouteCtx(): Promise<StudioCtx | null> {
  const me = await getMe();
  if (!me || me.role !== "creator_user" || !me.creatorId) return null;
  const [c] = await db
    .select({ id: s.creators.id, displayName: s.creators.displayName, stage: s.creators.stage, consent: s.creators.consentStatus })
    .from(s.creators)
    .where(and(eq(s.creators.id, me.creatorId), isNull(s.creators.archivedAt)));
  if (!c) return null;
  const access = studioAccess(c.stage, c.consent);
  if (!access.content) return null;
  return { me, creatorId: c.id, displayName: c.displayName, stage: c.stage, access };
}

export function docxResponse(buf: Buffer, filename: string) {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename.replace(/[^a-z0-9._-]+/gi, "-")}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Statuses of deliverables that use this script or carousel as their submitted draft. */
export async function draftLockFor(ctx: StudioCtx, kind: "script" | "carousel", id: string) {
  const col = kind === "script" ? s.deliverables.draftScriptId : s.deliverables.draftCarouselId;
  const rows = await db
    .select({ status: s.deliverables.status })
    .from(s.deliverables)
    .where(and(eq(col, id), eq(s.deliverables.creatorId, ctx.creatorId), isNull(s.deliverables.archivedAt)));
  return draftLocked(rows.map((r) => r.status));
}
