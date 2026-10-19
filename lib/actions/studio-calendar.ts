"use server";
// Creator Studio — Calendar & batching (BRIEF §19.3). One calendar: creator_calendar_items.
// Sponsored items are created by Crew; the creator may only change their status, notes and
// live URL (creatorCanEditCalendarField). The live URL also writes deliverables.live_url —
// Crew moves the deliverable to live only if no §5.4 block applies.
import { z } from "zod";
import { and, eq, isNull, ne } from "drizzle-orm";
import * as s from "@/lib/db/schema";
import { withUser, type Tx } from "@/lib/db/tx";
import { guard, ok, fail, type ActionResult } from "./result";
import { studioActor, calendarItem, scriptFor, type StudioCtx } from "@/lib/queries/studio";
import { creatorCanEditCalendarField } from "@/lib/rules/studio";
import { addDays } from "@/lib/dates";
import { cloneScriptRow } from "./studio-helpers";
import { bucket, contentType, ctaType, effort, formObject, funnel, isoDate, parse, pillar, revalidateStudio, studioStatus, text, url, uuid } from "./studio-helpers";

const CREATOR_KINDS = ["organic", "anchor", "derivative"] as const;

const ItemFields = z.object({
  date: isoDate,
  kind: z.enum(CREATOR_KINDS).default("organic"),
  title: text(200),
  platform: z.enum(["instagram", "youtube", "x", "linkedin", "newsletter", "other"]).default("instagram"),
  pillar: pillar.default("authority"),
  conceptBucket: bucket.default("proven"),
  contentType: contentType.default("educational"),
  topic: text(300),
  angle: text(200),
  format: text(80),
  ctaType: ctaType.default("follow"),
  funnelStage: funnel.default("tofu"),
  effort: effort.default("default"),
  topicTag: text(120),
  segment: text(120),
  studioStatus: studioStatus.default("idea"),
  notes: text(4000),
  liveUrl: url,
});

/** The creator's own script id, or null (a global starter row can't be linked without a clone). */
async function ownScriptId(ctx: StudioCtx, id: string | undefined) {
  if (!id) return null;
  const sc = await scriptFor(ctx, id);
  return sc && !sc.readOnly ? sc.id : null;
}

export async function addCalendarItem(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const raw = formObject(fd);
    const i = parse(ItemFields, raw);
    const scriptId = await ownScriptId(ctx, typeof raw.scriptId === "string" ? raw.scriptId : undefined);
    const [row] = await withUser(ctx.me.id, (tx) =>
      tx
        .insert(s.creatorCalendarItems)
        .values({ creatorId: ctx.creatorId, ...i, title: i.title || i.topic, liveUrl: i.liveUrl || null, scriptId, createdBy: ctx.me.id })
        .returning({ id: s.creatorCalendarItems.id }),
    );
    revalidateStudio();
    const back = typeof raw.back === "string" && raw.back.startsWith("/studio") ? raw.back : undefined;
    return ok("Added to calendar", { undo: { entity: "creator_calendar_items", id: row.id }, redirect: back });
  });
}

/** Writes the live URL to the creator's own deliverable; the §5.4 gate is not touched. */
async function writeDeliverableLiveUrl(tx: Tx, ctx: StudioCtx, deliverableId: string | null, liveUrl: string) {
  if (!deliverableId || !liveUrl) return;
  await tx
    .update(s.deliverables)
    .set({ liveUrl })
    .where(and(eq(s.deliverables.id, deliverableId), eq(s.deliverables.creatorId, ctx.creatorId)));
}

export async function updateCalendarItem(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const raw = formObject(fd);
    const id = parse(uuid, raw.id);
    const item = await calendarItem(ctx, id);
    if (!item) return fail("Item not found");
    if (item.kind === "sponsored" || item.kind === "shoot" || item.kind === "blackout") {
      // Crew-owned kinds: only the fields creatorCanEditCalendarField allows.
      const i = parse(z.object({ studioStatus: studioStatus, notes: text(4000), liveUrl: url }), raw);
      const set: Partial<typeof s.creatorCalendarItems.$inferInsert> = {};
      for (const k of ["studioStatus", "notes", "liveUrl"] as const) {
        if (!creatorCanEditCalendarField(item.kind === "sponsored" ? "sponsored" : item.kind, k)) continue;
        if (item.kind !== "sponsored" && k === "liveUrl") continue;
        (set as Record<string, unknown>)[k] = k === "liveUrl" ? i.liveUrl || null : i[k];
      }
      if (item.kind !== "sponsored") delete set.liveUrl;
      await withUser(ctx.me.id, async (tx) => {
        await tx.update(s.creatorCalendarItems).set(set).where(and(eq(s.creatorCalendarItems.id, id), eq(s.creatorCalendarItems.creatorId, ctx.creatorId)));
        if (item.kind === "sponsored") await writeDeliverableLiveUrl(tx, ctx, item.deliverableId, i.liveUrl);
      });
      revalidateStudio();
      return ok("Saved", { undo: { entity: "creator_calendar_items", id } });
    }
    const i = parse(ItemFields, raw);
    const scriptId = typeof raw.scriptId === "string" ? await ownScriptId(ctx, raw.scriptId || undefined) : item.scriptId;
    await withUser(ctx.me.id, (tx) =>
      tx
        .update(s.creatorCalendarItems)
        .set({ ...i, title: i.title || i.topic, liveUrl: i.liveUrl || null, scriptId })
        .where(and(eq(s.creatorCalendarItems.id, id), eq(s.creatorCalendarItems.creatorId, ctx.creatorId))),
    );
    revalidateStudio();
    return ok("Saved", { undo: { entity: "creator_calendar_items", id } });
  });
}

/** Board view: move an item between Studio status columns. Allowed on sponsored items too. */
export async function moveCalendarItem(id: string, to: string): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const status = parse(studioStatus, to);
    const item = await calendarItem(ctx, parse(uuid, id));
    if (!item) return fail("Item not found");
    if (!creatorCanEditCalendarField(item.kind, "studioStatus")) return fail("Crew owns this item");
    await withUser(ctx.me.id, (tx) => tx.update(s.creatorCalendarItems).set({ studioStatus: status }).where(and(eq(s.creatorCalendarItems.id, item.id), eq(s.creatorCalendarItems.creatorId, ctx.creatorId))));
    revalidateStudio();
    return ok(`Moved to ${status}`, { undo: { entity: "creator_calendar_items", id: item.id } });
  });
}

export async function removeCalendarItem(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const item = await calendarItem(ctx, parse(uuid, fd.get("id")));
    if (!item) return fail("Item not found");
    if (item.kind === "sponsored" || item.kind === "shoot") return fail("Crew owns this item; ask Crew to change it");
    await withUser(ctx.me.id, (tx) => tx.update(s.creatorCalendarItems).set({ archivedAt: new Date() }).where(and(eq(s.creatorCalendarItems.id, item.id), eq(s.creatorCalendarItems.creatorId, ctx.creatorId))));
    revalidateStudio();
    return ok(item.proposedByUserId ? "Removed Crew proposal" : "Removed", { undo: { entity: "creator_calendar_items", id: item.id }, redirect: fd.get("back") ? String(fd.get("back")) : undefined });
  });
}

/** Keep a Crew-proposed item: it becomes the creator's own. */
export async function keepProposal(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const item = await calendarItem(ctx, parse(uuid, fd.get("id")));
    if (!item || !item.proposedByUserId) return fail("Not a Crew proposal");
    // BRIEF: clarify — "keep" clears proposed_by_user_id; the audit log keeps who proposed it.
    await withUser(ctx.me.id, (tx) => tx.update(s.creatorCalendarItems).set({ proposedByUserId: null }).where(and(eq(s.creatorCalendarItems.id, item.id), eq(s.creatorCalendarItems.creatorId, ctx.creatorId))));
    revalidateStudio();
    return ok("Kept", { undo: { entity: "creator_calendar_items", id: item.id } });
  });
}

const Bulk = z.object({
  titles: z.string().max(20000),
  startOn: isoDate,
  everyDays: z.coerce.number().int().min(1).max(30).default(2),
  pillar: pillar.default("authority"),
  conceptBucket: bucket.default("proven"),
  funnelStage: funnel.default("tofu"),
});

export async function bulkAddCalendar(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const i = parse(Bulk, formObject(fd));
    const titles = i.titles.split("\n").map((t) => t.trim()).filter(Boolean).slice(0, 100);
    if (!titles.length) return fail("Add one title per line");
    await withUser(ctx.me.id, (tx) =>
      tx.insert(s.creatorCalendarItems).values(
        titles.map((t, n) => ({ creatorId: ctx.creatorId, date: addDays(i.startOn, n * i.everyDays), kind: "organic" as const, title: t, topic: t, pillar: i.pillar, conceptBucket: i.conceptBucket, funnelStage: i.funnelStage, createdBy: ctx.me.id })),
      ),
    );
    revalidateStudio();
    return ok(`Added ${titles.length} items`);
  });
}

const Rows = z
  .array(
    z.object({
      date: isoDate,
      topic: z.string().trim().min(1).max(300),
      pillar: pillar.default("authority"),
      conceptBucket: bucket.default("proven"),
      angle: z.string().max(200).default(""),
      hook: z.string().max(300).default(""),
      format: z.string().max(80).default(""),
    }),
  )
  .min(1)
  .max(60);

/** "Add to calendar" for ideation rows and double-down variants. */
export async function addIdeasToCalendar(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    let data: unknown;
    try {
      data = JSON.parse(String(fd.get("rows") ?? "[]"));
    } catch {
      return fail("Couldn't read the rows");
    }
    const rows = parse(Rows, data);
    const inserted = await withUser(ctx.me.id, (tx) =>
      tx
        .insert(s.creatorCalendarItems)
        .values(
          rows.map((r) => ({
            creatorId: ctx.creatorId,
            date: r.date,
            kind: "organic" as const,
            title: r.topic,
            topic: r.topic,
            pillar: r.pillar,
            conceptBucket: r.conceptBucket,
            contentType: r.pillar === "journey" ? ("storytelling" as const) : ("educational" as const),
            angle: r.angle,
            format: r.format,
            notes: r.hook ? `Hook: ${r.hook}` : "",
            createdBy: ctx.me.id,
          })),
        )
        .returning({ id: s.creatorCalendarItems.id }),
    );
    revalidateStudio();
    return ok(rows.length === 1 ? "Added to calendar" : `Added ${rows.length} items`, rows.length === 1 ? { undo: { entity: "creator_calendar_items", id: inserted[0].id } } : {});
  });
}

/** Schedule a script to a date: a linked item with the script's metadata copied (§19.3). */
export async function scheduleScript(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const i = parse(z.object({ scriptId: uuid, date: isoDate }), formObject(fd));
    const src = await scriptFor(ctx, i.scriptId);
    if (!src) return fail("Script not found");
    const itemId = await withUser(ctx.me.id, async (tx) => {
      const sc = src.readOnly ? await cloneScriptRow(tx, ctx, src) : src;
      const [row] = await tx
        .insert(s.creatorCalendarItems)
        .values({
          creatorId: ctx.creatorId,
          date: i.date,
          kind: "organic",
          title: sc.title,
          topic: sc.title,
          pillar: sc.pillar,
          contentType: sc.contentType,
          conceptBucket: sc.conceptBucket ?? "proven",
          angle: sc.angleOrStoryType,
          format: sc.format,
          ctaType: sc.ctaType,
          funnelStage: sc.funnelStage,
          effort: sc.effort,
          topicTag: sc.topicTag,
          segment: sc.segment,
          studioStatus: sc.bodyBlack.trim() ? "scripted" : "idea",
          scriptId: sc.id,
          createdBy: ctx.me.id,
        })
        .returning({ id: s.creatorCalendarItems.id });
      return row.id;
    });
    revalidateStudio();
    return ok(src.readOnly ? "Cloned and scheduled" : "Scheduled", { undo: { entity: "creator_calendar_items", id: itemId } });
  });
}

/** Irreversible: removes every unposted organic item. Sponsored, shoot and posted items stay. */
export async function resetCalendar(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    if (fd.get("confirm") !== "reset") return fail("Type reset to confirm");
    const gone = await withUser(ctx.me.id, (tx) =>
      tx
        .update(s.creatorCalendarItems)
        .set({ archivedAt: new Date() })
        .where(and(eq(s.creatorCalendarItems.creatorId, ctx.creatorId), eq(s.creatorCalendarItems.kind, "organic"), ne(s.creatorCalendarItems.studioStatus, "posted"), isNull(s.creatorCalendarItems.archivedAt)))
        .returning({ id: s.creatorCalendarItems.id }),
    );
    revalidateStudio();
    return ok(`Reset — ${gone.length} items removed`);
  });
}

const Blackout = z.object({ startsOn: isoDate, endsOn: isoDate, note: text(200) });

export async function addBlackout(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const i = parse(Blackout, formObject(fd));
    if (i.endsOn < i.startsOn) return fail("End date is before the start");
    const [row] = await withUser(ctx.me.id, (tx) => tx.insert(s.creatorBlackouts).values({ creatorId: ctx.creatorId, ...i, createdBy: ctx.me.id }).returning({ id: s.creatorBlackouts.id }));
    revalidateStudio();
    return ok("Blackout added", { undo: { entity: "creator_blackouts", id: row.id } });
  });
}

export async function removeBlackout(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const id = parse(uuid, fd.get("id"));
    const done = await withUser(ctx.me.id, (tx) =>
      tx
        .update(s.creatorBlackouts)
        .set({ archivedAt: new Date() })
        .where(and(eq(s.creatorBlackouts.id, id), eq(s.creatorBlackouts.creatorId, ctx.creatorId)))
        .returning({ id: s.creatorBlackouts.id }),
    );
    if (!done.length) return fail("Blackout not found");
    revalidateStudio();
    return ok("Blackout removed", { undo: { entity: "creator_blackouts", id } });
  });
}
