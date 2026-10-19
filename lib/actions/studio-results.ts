"use server";
// Creator Studio — Results (BRIEF §19.12). A post linked to a deliverable also writes that
// deliverable's metrics (one deliverable_metrics row per post), so the creator logs once and
// Crew's report reads it. Only credibility metrics cross: views and followers stay in Studio.
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import * as s from "@/lib/db/schema";
import { db } from "@/lib/db";
import { withUser, type Tx } from "@/lib/db/tx";
import { guard, ok, fail, type ActionResult } from "./result";
import { studioActor, calendarItem, type StudioCtx } from "@/lib/queries/studio";
import { count, formObject, isoDate, optCount, optUuid, parse, pillar, revalidateStudio, text, url, uuid } from "./studio-helpers";

const Post = z.object({
  title: z.string().trim().min(1, "Give the post a title").max(200),
  postedOn: isoDate,
  platform: z.enum(["instagram", "youtube", "x", "linkedin", "newsletter", "other"]).default("instagram"),
  url,
  pillar: pillar.default("authority"),
  format: text(80),
  hook: text(300),
  views: count,
  followersAtPost: count,
  saves: optCount,
  shares: optCount,
  commentsDecisionMaker: optCount,
  inbound: optCount,
  trackedSignups: optCount,
  notes: text(4000),
  calendarItemId: optUuid,
  deliverableId: optUuid,
});

async function ownDeliverable(ctx: StudioCtx, id: string) {
  if (!id) return null;
  const [d] = await db
    .select({ id: s.deliverables.id, liveUrl: s.deliverables.liveUrl })
    .from(s.deliverables)
    .where(and(eq(s.deliverables.id, id), eq(s.deliverables.creatorId, ctx.creatorId), isNull(s.deliverables.archivedAt)));
  return d ?? null;
}

/** Upserts the one metrics record for this post; unlinking archives it. */
async function syncMetrics(tx: Tx, postId: string, deliverableId: string | null, p: z.infer<typeof Post>, userId: string) {
  const [existing] = await tx.select({ id: s.deliverableMetrics.id, deliverableId: s.deliverableMetrics.deliverableId }).from(s.deliverableMetrics).where(and(eq(s.deliverableMetrics.studioPostId, postId), isNull(s.deliverableMetrics.archivedAt)));
  if (!deliverableId) {
    if (existing) await tx.update(s.deliverableMetrics).set({ archivedAt: new Date() }).where(eq(s.deliverableMetrics.id, existing.id));
    return;
  }
  // BRIEF: clarify — views are not written to impressions: Studio view counts never cross to Crew (§0.1 #16, §20).
  const values = { deliverableId, saves: p.saves, shares: p.shares, commentsDecisionMaker: p.commentsDecisionMaker, inboundToBrand: p.inbound, trackedSignups: p.trackedSignups, capturedAt: new Date() };
  if (existing) await tx.update(s.deliverableMetrics).set(values).where(eq(s.deliverableMetrics.id, existing.id));
  else await tx.insert(s.deliverableMetrics).values({ ...values, studioPostId: postId, createdBy: userId });
}

export async function savePost(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const raw = formObject(fd);
    const p = parse(Post, raw);
    // Linking a deliverable writes Crew-facing metrics, which alumni can't do (Deals read-only).
    const ctx = await studioActor(p.deliverableId ? "deals" : "content");
    const deliv = await ownDeliverable(ctx, p.deliverableId);
    if (p.deliverableId && !deliv) return fail("Deliverable not found");
    const item = p.calendarItemId ? await calendarItem(ctx, p.calendarItemId) : null;
    if (p.calendarItemId && !item) return fail("Calendar item not found");
    const values = { ...p, url: p.url || null, calendarItemId: item?.id ?? null, deliverableId: deliv?.id ?? null };
    const editId = raw.id ? parse(uuid, raw.id) : null;
    const postId = await withUser(ctx.me.id, async (tx) => {
      let id: string;
      if (editId) {
        const done = await tx.update(s.studioPosts).set(values).where(and(eq(s.studioPosts.id, editId), eq(s.studioPosts.creatorId, ctx.creatorId))).returning({ id: s.studioPosts.id });
        if (!done.length) throw new Error("Post not found");
        id = editId;
      } else {
        const [row] = await tx.insert(s.studioPosts).values({ ...values, creatorId: ctx.creatorId, createdBy: ctx.me.id }).returning({ id: s.studioPosts.id });
        id = row.id;
      }
      if (item) await tx.update(s.creatorCalendarItems).set({ studioStatus: "posted", ...(p.url ? { liveUrl: p.url } : {}) }).where(and(eq(s.creatorCalendarItems.id, item.id), eq(s.creatorCalendarItems.creatorId, ctx.creatorId)));
      if (deliv && p.url && !deliv.liveUrl) await tx.update(s.deliverables).set({ liveUrl: p.url }).where(and(eq(s.deliverables.id, deliv.id), eq(s.deliverables.creatorId, ctx.creatorId)));
      await syncMetrics(tx, id, deliv?.id ?? null, p, ctx.me.id);
      return id;
    });
    revalidateStudio();
    return ok(editId ? "Post saved" : deliv ? "Post logged — metrics sent to the campaign report" : "Post logged", { undo: { entity: "studio_posts", id: postId }, redirect: "/studio/results" });
  });
}

export async function removePost(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const id = parse(uuid, fd.get("id"));
    const done = await withUser(ctx.me.id, async (tx) => {
      const rows = await tx.update(s.studioPosts).set({ archivedAt: new Date() }).where(and(eq(s.studioPosts.id, id), eq(s.studioPosts.creatorId, ctx.creatorId))).returning({ id: s.studioPosts.id });
      if (rows.length) await tx.update(s.deliverableMetrics).set({ archivedAt: new Date() }).where(eq(s.deliverableMetrics.studioPostId, id));
      return rows.length;
    });
    if (!done) return fail("Post not found");
    revalidateStudio();
    return ok("Post removed", { undo: { entity: "studio_posts", id } });
  });
}
