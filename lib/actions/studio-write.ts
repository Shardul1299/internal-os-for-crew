"use server";
// Creator Studio — Hook Lab, Script Studio, Improver, script bank and templates (BRIEF §19.5–§19.7).
// Global starter rows are read-only; editing one means cloning it into the creator's bank first.
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import * as s from "@/lib/db/schema";
import { db } from "@/lib/db";
import { withUser } from "@/lib/db/tx";
import { guard, ok, fail, type ActionResult } from "./result";
import { studioActor, scriptFor, draftLockFor, type StudioCtx } from "@/lib/queries/studio";
import { parseScriptSections } from "@/lib/studio/parse";
import { splitScriptBlocks, classifyScriptBlocks } from "@/lib/studio/bulk-import";
import { getConfig } from "@/lib/settings";
import { canTransitionDeliverable } from "@/lib/rules/deliverables";
import { bucket, cloneScriptRow, contentType, ctaType, effort, formObject, funnel, optUuid, parse, pillar, revalidateStudio, scriptStatus, text, uuid } from "./studio-helpers";

// ---------- Hook stacks ----------
const Stacks = z.array(z.object({ written: z.string().max(300).default(""), verbal: z.string().max(300).default(""), visual: z.string().max(300).default("") })).min(1).max(20);

export async function saveHookStacks(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    let data: unknown;
    try {
      data = JSON.parse(String(fd.get("stacks") ?? "[]"));
    } catch {
      return fail("Couldn't read the hook stacks");
    }
    const stacks = parse(Stacks, data).filter((x) => x.written || x.verbal || x.visual);
    if (!stacks.length) return fail("No hook stacks found");
    const topic = String(fd.get("topic") ?? "").slice(0, 300);
    const angle = String(fd.get("angle") ?? "").slice(0, 200);
    await withUser(ctx.me.id, (tx) => tx.insert(s.studioHookStacks).values(stacks.map((x) => ({ ...x, topic, angle, creatorId: ctx.creatorId, createdBy: ctx.me.id }))));
    revalidateStudio();
    return ok(stacks.length === 1 ? "Hook stack saved" : `${stacks.length} hook stacks saved`);
  });
}

export async function removeHookStack(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const id = parse(uuid, fd.get("id"));
    const done = await withUser(ctx.me.id, (tx) =>
      tx.update(s.studioHookStacks).set({ archivedAt: new Date() }).where(and(eq(s.studioHookStacks.id, id), eq(s.studioHookStacks.creatorId, ctx.creatorId))).returning({ id: s.studioHookStacks.id }),
    );
    if (!done.length) return fail("Hook stack not found");
    revalidateStudio();
    return ok("Removed", { undo: { entity: "studio_hook_stacks", id } });
  });
}

// ---------- Scripts ----------
const ScriptMeta = z.object({
  title: z.string().trim().max(200).default(""),
  pillar: pillar.default("authority"),
  contentType: contentType.default("educational"),
  angleOrStoryType: text(200),
  format: text(80),
  ctaType: ctaType.default("follow"),
  funnelStage: funnel.default("tofu"),
  status: scriptStatus.default("draft"),
  seriesName: text(200),
  effort: effort.default("default"),
  topicTag: text(120),
  segment: text(120),
  conceptBucket: z.union([bucket, z.literal("")]).default(""),
});

const ScriptBody = ScriptMeta.extend({ bodyBlack: text(20000), bodyRed: text(20000), bodyGreen: text(20000) });

async function markOutlierUsed(ctx: StudioCtx, outlierId: string) {
  if (!outlierId) return;
  await withUser(ctx.me.id, (tx) => tx.update(s.studioOutliers).set({ used: true }).where(and(eq(s.studioOutliers.id, outlierId), eq(s.studioOutliers.creatorId, ctx.creatorId))));
}

/** Manual BLACK / RED / GREEN editor and the script record form. */
export async function saveScript(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const raw = formObject(fd);
    const i = parse(ScriptBody, raw);
    const values = { ...i, title: i.title || "Untitled script", conceptBucket: i.conceptBucket || null, sharedWithCrew: raw.sharedWithCrew === "on" };
    if (raw.id) {
      const sc = await scriptFor(ctx, parse(uuid, raw.id));
      if (!sc) return fail("Script not found");
      if (sc.readOnly) return fail("Starter scripts are read-only; clone it first");
      const lock = await draftLockFor(ctx, "script", sc.id);
      if (!lock.ok) return fail(lock.reasons[0]);
      await withUser(ctx.me.id, (tx) => tx.update(s.studioScripts).set(values).where(and(eq(s.studioScripts.id, sc.id), eq(s.studioScripts.creatorId, ctx.creatorId))));
      revalidateStudio();
      return ok("Script saved", { undo: { entity: "studio_scripts", id: sc.id } });
    }
    if (!i.bodyBlack) return fail("Write the spoken lines in BLACK");
    const [row] = await withUser(ctx.me.id, (tx) => tx.insert(s.studioScripts).values({ ...values, creatorId: ctx.creatorId, createdBy: ctx.me.id }).returning({ id: s.studioScripts.id }));
    revalidateStudio();
    return ok("Script saved", { undo: { entity: "studio_scripts", id: row.id }, redirect: `/studio/write/scripts/${row.id}` });
  });
}

/** Save a generated script: BLACK / RED / GREEN parsed from the model output. */
export async function saveScriptFromOutput(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const raw = formObject(fd);
    const meta = parse(ScriptMeta, raw);
    const output = parse(z.string().min(1, "Nothing to save").max(60000), raw.output);
    const outlierId = parse(optUuid, raw.outlierId ?? "");
    const b = parseScriptSections(output);
    if (!b.black) return fail("No BLACK section found in the output");
    const [row] = await withUser(ctx.me.id, (tx) =>
      tx
        .insert(s.studioScripts)
        .values({ ...meta, title: meta.title || "Untitled script", conceptBucket: meta.conceptBucket || (outlierId ? "proven" : null), bodyBlack: b.black, bodyRed: b.red, bodyGreen: b.green, creatorId: ctx.creatorId, createdBy: ctx.me.id })
        .returning({ id: s.studioScripts.id }),
    );
    await markOutlierUsed(ctx, outlierId);
    revalidateStudio();
    return ok("Script saved to bank", { undo: { entity: "studio_scripts", id: row.id } });
  });
}

/** Improver: replace the bodies of a script with the revised version, or save it as a new script. */
export async function applyImprovement(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const raw = formObject(fd);
    const output = parse(z.string().min(1, "Nothing to save").max(60000), raw.output);
    const b = parseScriptSections(output);
    if (!b.black) return fail("No BLACK section found in the revised script");
    const scriptId = parse(optUuid, raw.scriptId ?? "");
    const sc = scriptId ? await scriptFor(ctx, scriptId) : null;
    if (raw.mode === "replace" && sc && !sc.readOnly) {
      const lock = await draftLockFor(ctx, "script", sc.id);
      if (!lock.ok) return fail(lock.reasons[0]);
      await withUser(ctx.me.id, (tx) => tx.update(s.studioScripts).set({ bodyBlack: b.black, bodyRed: b.red, bodyGreen: b.green }).where(and(eq(s.studioScripts.id, sc.id), eq(s.studioScripts.creatorId, ctx.creatorId))));
      revalidateStudio();
      return ok("Script updated", { undo: { entity: "studio_scripts", id: sc.id } });
    }
    const base = sc ?? null;
    const [row] = await withUser(ctx.me.id, (tx) =>
      tx
        .insert(s.studioScripts)
        .values({
          creatorId: ctx.creatorId,
          title: `${base?.title ?? String(raw.title || "Improved script")}${base ? " (improved)" : ""}`.slice(0, 200),
          pillar: base?.pillar ?? "authority",
          contentType: base?.contentType ?? "educational",
          angleOrStoryType: base?.angleOrStoryType ?? "",
          format: base?.format ?? "",
          ctaType: base?.ctaType ?? "follow",
          funnelStage: base?.funnelStage ?? "tofu",
          effort: base?.effort ?? "default",
          topicTag: base?.topicTag ?? "",
          segment: base?.segment ?? "",
          clonedFromId: base?.id ?? null,
          bodyBlack: b.black,
          bodyRed: b.red,
          bodyGreen: b.green,
          createdBy: ctx.me.id,
        })
        .returning({ id: s.studioScripts.id }),
    );
    revalidateStudio();
    return ok("Saved as a new script", { undo: { entity: "studio_scripts", id: row.id } });
  });
}

export async function cloneScript(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const src = await scriptFor(ctx, parse(uuid, fd.get("id")));
    if (!src) return fail("Script not found");
    const row = await withUser(ctx.me.id, (tx) => cloneScriptRow(tx, ctx, src));
    revalidateStudio();
    return ok("Cloned to your bank", { undo: { entity: "studio_scripts", id: row.id }, redirect: `/studio/write/scripts/${row.id}` });
  });
}

export async function removeScript(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const id = parse(uuid, fd.get("id"));
    const lock = await draftLockFor(ctx, "script", id);
    if (!lock.ok) return fail(lock.reasons[0]);
    const done = await withUser(ctx.me.id, (tx) =>
      tx.update(s.studioScripts).set({ archivedAt: new Date() }).where(and(eq(s.studioScripts.id, id), eq(s.studioScripts.creatorId, ctx.creatorId))).returning({ id: s.studioScripts.id }),
    );
    if (!done.length) return fail("Script not found");
    revalidateStudio();
    return ok("Script removed", { undo: { entity: "studio_scripts", id }, redirect: "/studio/write?tab=scripts&gen=bank" });
  });
}

/** Attach a script to one of the creator's own sponsored deliverables (§19.6.7). Empty detaches. */
export async function attachScript(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor("deals");
    const scriptId = parse(uuid, fd.get("scriptId"));
    const deliverableId = parse(optUuid, fd.get("deliverableId") ?? "");
    const sc = await scriptFor(ctx, scriptId);
    if (!sc || sc.readOnly) return fail("Clone the script before attaching it");
    if (!deliverableId) {
      await withUser(ctx.me.id, (tx) => tx.update(s.studioScripts).set({ deliverableId: null }).where(and(eq(s.studioScripts.id, sc.id), eq(s.studioScripts.creatorId, ctx.creatorId))));
      revalidateStudio();
      return ok("Detached", { undo: { entity: "studio_scripts", id: sc.id } });
    }
    const moved = await attachToDeliverable(ctx, deliverableId);
    if (typeof moved === "string") return fail(moved);
    await withUser(ctx.me.id, (tx) => tx.update(s.studioScripts).set({ deliverableId }).where(and(eq(s.studioScripts.id, sc.id), eq(s.studioScripts.creatorId, ctx.creatorId))));
    revalidateStudio();
    return ok("Attached to deliverable", { undo: { entity: "studio_scripts", id: sc.id } });
  });
}

/** Shared by scripts and carousels: the deliverable must be the creator's own and still open; briefed → drafting. */
async function attachToDeliverable(ctx: StudioCtx, deliverableId: string): Promise<true | string> {
  const [d] = await db.select().from(s.deliverables).where(and(eq(s.deliverables.id, deliverableId), eq(s.deliverables.creatorId, ctx.creatorId), isNull(s.deliverables.archivedAt)));
  if (!d) return "Deliverable not found";
  if (["live", "reported", "cancelled"].includes(d.status)) return "That deliverable is closed";
  if (d.status === "briefed") {
    const cfg = await getConfig();
    const g = canTransitionDeliverable(
      cfg,
      { status: d.status, scheduledFor: d.scheduledFor, disclosureChecked: d.disclosureChecked, claimsApprovedByBrand: d.claimsApprovedByBrand, briefTags: d.briefTags, revisionRound: d.revisionRound },
      "drafting",
      { dealStage: "in_production", hasAdvanceOverride: false, hasPoOverride: false, poOrConfirmation: false, topicFilters: [], blackouts: [], monthItems: [], sponsoredRatioMax: cfg.n.sponsored_ratio_max },
    );
    if (g.ok) await withUser(ctx.me.id, (tx) => tx.update(s.deliverables).set({ status: "drafting" }).where(and(eq(s.deliverables.id, d.id), eq(s.deliverables.creatorId, ctx.creatorId))));
  }
  return true;
}

export async function attachCarousel(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor("deals");
    const carouselId = parse(uuid, fd.get("carouselId"));
    const deliverableId = parse(optUuid, fd.get("deliverableId") ?? "");
    const [c] = await db.select({ id: s.studioCarousels.id }).from(s.studioCarousels).where(and(eq(s.studioCarousels.id, carouselId), eq(s.studioCarousels.creatorId, ctx.creatorId), isNull(s.studioCarousels.archivedAt)));
    if (!c) return fail("Clone the carousel before attaching it");
    if (deliverableId) {
      const moved = await attachToDeliverable(ctx, deliverableId);
      if (typeof moved === "string") return fail(moved);
    }
    await withUser(ctx.me.id, (tx) => tx.update(s.studioCarousels).set({ deliverableId: deliverableId || null }).where(and(eq(s.studioCarousels.id, c.id), eq(s.studioCarousels.creatorId, ctx.creatorId))));
    revalidateStudio();
    return ok(deliverableId ? "Attached to deliverable" : "Detached");
  });
}

export async function toggleScriptShared(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const sc = await scriptFor(ctx, parse(uuid, fd.get("id")));
    if (!sc || sc.readOnly) return fail("Script not found");
    await withUser(ctx.me.id, (tx) => tx.update(s.studioScripts).set({ sharedWithCrew: !sc.sharedWithCrew }).where(and(eq(s.studioScripts.id, sc.id), eq(s.studioScripts.creatorId, ctx.creatorId))));
    revalidateStudio();
    return ok(sc.sharedWithCrew ? "No longer shared with Crew" : "Shared with Crew", { undo: { entity: "studio_scripts", id: sc.id } });
  });
}

/** Bulk import: blocks separated by a line of "---"; one AI call classifies them, or defaults without a key. */
export async function bulkImportScripts(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const raw = parse(z.string().max(200_000), fd.get("blocks") ?? "");
    const blocks = splitScriptBlocks(raw).slice(0, 100);
    if (!blocks.length) return fail("Paste scripts separated by a line of ---");
    const classified = await classifyScriptBlocks(ctx.creatorId, blocks);
    const rows = await withUser(ctx.me.id, (tx) =>
      tx
        .insert(s.studioScripts)
        .values(
          classified.map((c) => {
            const b = parseScriptSections(c.bodyBlack);
            return { ...c, bodyBlack: b.black || c.bodyBlack, bodyRed: b.red, bodyGreen: b.green, creatorId: ctx.creatorId, createdBy: ctx.me.id };
          }),
        )
        .returning({ id: s.studioScripts.id }),
    );
    revalidateStudio();
    return ok(`Imported ${rows.length} ${rows.length === 1 ? "script" : "scripts"}`);
  });
}

// ---------- Templates ----------
const Template = z.object({ name: z.string().trim().min(1, "Name the template").max(200), pillar: pillar.default("authority"), angle: text(200), sourceNote: text(500), templateText: z.string().trim().min(1, "Nothing to save").max(40000) });

export async function saveTemplate(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const i = parse(Template, formObject(fd));
    await withUser(ctx.me.id, (tx) => tx.insert(s.studioScriptTemplates).values({ ...i, creatorId: ctx.creatorId, createdBy: ctx.me.id }));
    revalidateStudio();
    return ok("Template saved");
  });
}

export async function removeTemplate(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const id = parse(uuid, fd.get("id"));
    const done = await withUser(ctx.me.id, (tx) =>
      tx.update(s.studioScriptTemplates).set({ archivedAt: new Date() }).where(and(eq(s.studioScriptTemplates.id, id), eq(s.studioScriptTemplates.creatorId, ctx.creatorId))).returning({ id: s.studioScriptTemplates.id }),
    );
    if (!done.length) return fail("Template not found");
    revalidateStudio();
    return ok("Template removed");
  });
}
