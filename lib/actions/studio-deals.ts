"use server";
// Creator Studio — Deals: submit a sponsored draft, insert the disclosure line, mark live
// (BRIEF §19.6.7, §19.14, §8). Alumni have Deals read-only (studioActor("deals") refuses).
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import * as s from "@/lib/db/schema";
import { db } from "@/lib/db";
import { withUser } from "@/lib/db/tx";
import { guard, ok, fail, type ActionResult } from "./result";
import { studioActor, scriptFor, carouselFor, topicFilters, myDeliverables, clearance, type StudioCtx } from "@/lib/queries/studio";
import { canSubmitSponsoredDraft, disclosureLine } from "@/lib/rules/studio";
import { getConfig } from "@/lib/settings";
import { formObject, optUuid, parse, revalidateStudio, uuid } from "./studio-helpers";

async function ownDeliverable(ctx: StudioCtx, id: string) {
  const [d] = await db.select().from(s.deliverables).where(and(eq(s.deliverables.id, id), eq(s.deliverables.creatorId, ctx.creatorId), isNull(s.deliverables.archivedAt)));
  return d ?? null;
}

const Submit = z.object({
  deliverableId: uuid,
  source: z.enum(["script", "carousel", "text"]),
  scriptId: optUuid,
  carouselId: optUuid,
  black: z.string().max(20000).default(""),
  green: z.string().max(20000).default(""),
});

/** Submit a sponsored draft: topic filters and the disclosure line are hard checks (canSubmitSponsoredDraft). */
export async function submitDraft(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor("deals");
    const i = parse(Submit, formObject(fd));
    const d = await ownDeliverable(ctx, i.deliverableId);
    if (!d) return fail("Deliverable not found");
    const filters = await topicFilters(ctx);

    let full = "";
    let green = "";
    let claims = "";
    let scriptId: string | null = null;
    let carouselId: string | null = null;
    if (i.source === "script") {
      const sc = i.scriptId ? await scriptFor(ctx, i.scriptId) : null;
      if (!sc || sc.readOnly) return fail("Pick one of your scripts");
      full = [sc.title, sc.bodyBlack, sc.bodyRed, sc.bodyGreen].join("\n");
      green = sc.bodyGreen;
      claims = sc.bodyBlack;
      scriptId = sc.id;
    } else if (i.source === "carousel") {
      const c = i.carouselId ? await carouselFor(ctx, i.carouselId) : null;
      if (!c || c.readOnly) return fail("Pick one of your carousels");
      const slideText = c.slides.map((x) => `${x.headline}${x.supportingText ? `\n${x.supportingText}` : ""}`).join("\n");
      full = [c.title, slideText, c.designNotes].join("\n");
      green = c.designNotes; // a carousel's editor notes carry the disclosure instruction
      claims = slideText;
      carouselId = c.id;
    } else {
      if (!i.black.trim()) return fail("Write the spoken lines in BLACK");
      full = `${i.black}\n${i.green}`;
      green = i.green;
      claims = i.black;
    }

    const g = canSubmitSponsoredDraft({ text: full, green, topicFilters: filters, disclosureStandard: d.disclosureStandard, deliverableStatus: d.status });
    if (!g.ok) return fail(g.reasons[0]);

    await withUser(ctx.me.id, async (tx) => {
      if (i.source === "text") {
        // A pasted draft is kept as a script in the creator's bank, attached to the deliverable.
        const [row] = await tx
          .insert(s.studioScripts)
          .values({ creatorId: ctx.creatorId, title: d.title, bodyBlack: i.black.trim(), bodyGreen: i.green.trim(), deliverableId: d.id, status: "ready", createdBy: ctx.me.id })
          .returning({ id: s.studioScripts.id });
        scriptId = row.id;
      } else if (scriptId) {
        await tx.update(s.studioScripts).set({ deliverableId: d.id, status: "ready" }).where(and(eq(s.studioScripts.id, scriptId), eq(s.studioScripts.creatorId, ctx.creatorId)));
      } else if (carouselId) {
        await tx.update(s.studioCarousels).set({ deliverableId: d.id, status: "ready" }).where(and(eq(s.studioCarousels.id, carouselId), eq(s.studioCarousels.creatorId, ctx.creatorId)));
      }
      // Claims-only approvals (§19.6.7): draft_md carries only what the brand may see — spoken lines or slide text.
      // BRIEF: clarify — round N is the round under review; the brand's change request opens N+1 (requestChanges), so a first submit sets 1.
      await tx
        .update(s.deliverables)
        .set({ status: "in_review", draftMd: claims.trim(), draftScriptId: scriptId, draftCarouselId: carouselId, revisionRound: Math.max(1, d.revisionRound) })
        .where(and(eq(s.deliverables.id, d.id), eq(s.deliverables.creatorId, ctx.creatorId)));
    });
    revalidateStudio();
    return ok("Draft submitted for review", { undo: { entity: "deliverables", id: d.id } });
  });
}

/** Inserts the disclosure line for the deal's standard into a script's GREEN or a carousel's notes. */
export async function insertDisclosure(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor("deals");
    const d = await ownDeliverable(ctx, parse(uuid, fd.get("deliverableId")));
    if (!d) return fail("Deliverable not found");
    const line = disclosureLine(d.disclosureStandard);
    const scriptId = parse(optUuid, fd.get("scriptId") ?? "");
    const carouselId = parse(optUuid, fd.get("carouselId") ?? "");
    if (scriptId) {
      const sc = await scriptFor(ctx, scriptId);
      if (!sc || sc.readOnly) return fail("Pick one of your scripts");
      if (sc.bodyGreen.includes(line)) return ok("Disclosure line already in GREEN");
      await withUser(ctx.me.id, (tx) => tx.update(s.studioScripts).set({ bodyGreen: `${line}\n${sc.bodyGreen}`.trim() }).where(and(eq(s.studioScripts.id, sc.id), eq(s.studioScripts.creatorId, ctx.creatorId))));
      revalidateStudio();
      return ok("Disclosure line added to GREEN", { undo: { entity: "studio_scripts", id: sc.id } });
    }
    if (carouselId) {
      const c = await carouselFor(ctx, carouselId);
      if (!c || c.readOnly) return fail("Pick one of your carousels");
      if (c.designNotes.includes(line)) return ok("Disclosure line already in the notes");
      await withUser(ctx.me.id, (tx) => tx.update(s.studioCarousels).set({ designNotes: `${line}\n${c.designNotes}`.trim() }).where(and(eq(s.studioCarousels.id, c.id), eq(s.studioCarousels.creatorId, ctx.creatorId))));
      revalidateStudio();
      return ok("Disclosure line added to the notes");
    }
    return fail("Pick a script or carousel");
  });
}

/**
 * Mark live: records the URL on the deliverable and the sponsored calendar item. The status is
 * not changed here — Crew moves the deliverable to live only if no §5.4 block applies (§19.16).
 */
export async function markLive(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor("deals");
    const i = parse(z.object({ deliverableId: uuid, liveUrl: z.string().trim().url("Enter the full post URL").max(500) }), formObject(fd));
    const d = await ownDeliverable(ctx, i.deliverableId);
    if (!d) return fail("Deliverable not found");
    if (d.status === "cancelled") return fail("Deliverable is cancelled");
    await withUser(ctx.me.id, async (tx) => {
      await tx.update(s.deliverables).set({ liveUrl: i.liveUrl }).where(and(eq(s.deliverables.id, d.id), eq(s.deliverables.creatorId, ctx.creatorId)));
      await tx
        .update(s.creatorCalendarItems)
        .set({ liveUrl: i.liveUrl, studioStatus: "posted" })
        .where(and(eq(s.creatorCalendarItems.deliverableId, d.id), eq(s.creatorCalendarItems.creatorId, ctx.creatorId), eq(s.creatorCalendarItems.kind, "sponsored")));
    });
    const [after] = await myDeliverables(ctx, await getConfig(), { id: d.id });
    const block = after ? clearance(after) : null;
    revalidateStudio();
    return ok(block ? `Live URL saved. ${block}` : "Live URL saved", { undo: { entity: "deliverables", id: d.id } });
  });
}
