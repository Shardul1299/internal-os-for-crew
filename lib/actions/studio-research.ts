"use server";
// Creator Studio — Outlier Research Hub (BRIEF §19.4). Follower and view numbers here are the
// creator's own craft data: they never leave Studio and never feed pricing, tier or any gate.
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import * as s from "@/lib/db/schema";
import { db } from "@/lib/db";
import { withUser } from "@/lib/db/tx";
import { guard, ok, fail, type ActionResult } from "./result";
import { studioActor } from "@/lib/queries/studio";
import { count, formObject, parse, revalidateStudio, text, uuid } from "./studio-helpers";

const Outlier = z.object({
  sourceType: z.enum(["keyword", "creator", "recommendation"]).default("keyword"),
  creatorHandle: text(120),
  link: text(500),
  nicheKeyword: text(200),
  followerCount: count,
  views: count,
  hookWritten: text(300),
  hookVerbal: text(300),
  hookVisual: text(300),
  angle: text(200),
  notes: text(4000),
});

export async function saveOutlier(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const raw = formObject(fd);
    const i = parse(Outlier, raw);
    if (!i.creatorHandle && !i.link) return fail("Add a handle or a link");
    if (raw.id) {
      const id = parse(uuid, raw.id);
      const done = await withUser(ctx.me.id, (tx) =>
        tx.update(s.studioOutliers).set(i).where(and(eq(s.studioOutliers.id, id), eq(s.studioOutliers.creatorId, ctx.creatorId))).returning({ id: s.studioOutliers.id }),
      );
      if (!done.length) return fail("Outlier not found");
      revalidateStudio();
      return ok("Saved", { undo: { entity: "studio_outliers", id }, redirect: "/studio/research" });
    }
    const [row] = await withUser(ctx.me.id, (tx) => tx.insert(s.studioOutliers).values({ ...i, creatorId: ctx.creatorId, createdBy: ctx.me.id }).returning({ id: s.studioOutliers.id }));
    revalidateStudio();
    return ok("Outlier logged", { undo: { entity: "studio_outliers", id: row.id }, redirect: "/studio/research" });
  });
}

export async function toggleOutlierUsed(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const id = parse(uuid, fd.get("id"));
    const [cur] = await db.select({ used: s.studioOutliers.used }).from(s.studioOutliers).where(and(eq(s.studioOutliers.id, id), eq(s.studioOutliers.creatorId, ctx.creatorId)));
    if (!cur) return fail("Outlier not found");
    await withUser(ctx.me.id, (tx) => tx.update(s.studioOutliers).set({ used: !cur.used }).where(and(eq(s.studioOutliers.id, id), eq(s.studioOutliers.creatorId, ctx.creatorId))));
    revalidateStudio();
    return ok(cur.used ? "Marked unused" : "Marked used", { undo: { entity: "studio_outliers", id } });
  });
}

export async function removeOutlier(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const id = parse(uuid, fd.get("id"));
    const done = await withUser(ctx.me.id, (tx) =>
      tx.update(s.studioOutliers).set({ archivedAt: new Date() }).where(and(eq(s.studioOutliers.id, id), eq(s.studioOutliers.creatorId, ctx.creatorId))).returning({ id: s.studioOutliers.id }),
    );
    if (!done.length) return fail("Outlier not found");
    revalidateStudio();
    return ok("Removed", { undo: { entity: "studio_outliers", id } });
  });
}

const ImportRows = z
  .array(
    z.object({
      creatorHandle: z.string().max(120).default(""),
      link: z.string().max(500).default(""),
      followerCount: z.number().int().min(0).max(2_000_000_000),
      views: z.number().int().min(0).max(2_000_000_000),
      notes: z.string().max(400).default(""),
    }),
  )
  .min(1, "Select at least one row")
  .max(500);

/** Bulk save from the CSV/TSV paste import. */
export async function importOutliers(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const niche = String(fd.get("nicheKeyword") ?? "").slice(0, 200);
    let data: unknown;
    try {
      data = JSON.parse(String(fd.get("rows") ?? "[]"));
    } catch {
      return fail("Couldn't read the rows");
    }
    const rows = parse(ImportRows, data);
    await withUser(ctx.me.id, (tx) =>
      tx.insert(s.studioOutliers).values(
        rows.map((r) => ({ creatorId: ctx.creatorId, sourceType: "creator" as const, creatorHandle: r.creatorHandle, link: r.link, nicheKeyword: niche, followerCount: r.followerCount, views: r.views, notes: r.notes || "Imported from CSV", createdBy: ctx.me.id })),
      ),
    );
    revalidateStudio();
    return ok(`Imported ${rows.length} ${rows.length === 1 ? "row" : "rows"}`, { redirect: "/studio/research" });
  });
}
