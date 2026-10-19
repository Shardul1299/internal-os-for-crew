"use server";
// Brand portal actions (BRIEF §8.3, §8.6): claims approval, change requests (two rounds; round 3 opens the
// case-by-case line), five-question survey and quarterly NPS. Scoped to the signed-in user's brandId.
import { z } from "zod";
import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { canTransitionDeliverable } from "@/lib/rules/deliverables";
import { canSubmitCampaignFeedback, canSubmitNps } from "@/lib/rules/campaigns";
import { deliverableContext, deliverableFacts } from "@/lib/queries/campaigns";
import { today } from "@/lib/dates";
import { ok, fail, guard, type ActionResult } from "./result";
import { applyChangeRequest } from "./deliverable-writes";
import { formObject, parseWith, zId, zOptText } from "./form-fields";

async function brandActor() {
  const me = await actor();
  if (me.role !== "brand_user" || !me.brandId) throw new Error("Your role can't do that");
  return me as typeof me & { brandId: string };
}

/** Loads a deliverable only if it belongs to one of this brand's campaigns. */
async function ownDeliverable(brandId: string, id: string) {
  const [row] = await db
    .select({ d: s.deliverables })
    .from(s.deliverables)
    .innerJoin(s.campaigns, eq(s.campaigns.id, s.deliverables.campaignId))
    .where(and(eq(s.deliverables.id, id), eq(s.campaigns.brandId, brandId), isNull(s.deliverables.archivedAt)));
  if (!row) throw new Error("Not found");
  return row.d;
}

function done(campaignId: string) {
  revalidatePath("/brand", "layout");
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/today");
}

/** Approve claims → the draft is approved (the brand approves claims and facts only). */
export async function approveClaims(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await brandActor();
    const input = parseWith(z.object({ id: zId }), formObject(fd));
    const d = await ownDeliverable(me.brandId, input.id);
    if (d.status !== "in_review") return fail("This draft isn't awaiting approval");
    const cfg = await getConfig();
    const { ctx } = await deliverableContext(cfg, d);
    const g = canTransitionDeliverable(cfg, deliverableFacts(d, { claimsApprovedByBrand: true }), "approved", ctx);
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, (tx) =>
      tx.update(s.deliverables).set({ claimsApprovedByBrand: true, approvedByContactId: me.brandContactId, status: "approved", brandChangeRequestMd: null }).where(eq(s.deliverables.id, d.id)),
    );
    done(d.campaignId);
    return ok("Claims approved");
  });
}

/** Request changes with a note. Two rounds; a third request opens a case-by-case line for Crew to price or waive. */
export async function requestChangesBrand(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await brandActor();
    const input = parseWith(z.object({ id: zId, note: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(1, "Say which claim to change").max(2000)) }), formObject(fd));
    const d = await ownDeliverable(me.brandId, input.id);
    if (d.status !== "in_review") return fail("This draft isn't awaiting approval");
    const cfg = await getConfig();
    const { ctx, dealId } = await deliverableContext(cfg, d);
    const facts = deliverableFacts(d);
    const g = canTransitionDeliverable(cfg, facts, "drafting", ctx);
    if (!g.ok) return fail(g.reasons[0]);
    const r = await withUser(me.id, (tx) => applyChangeRequest(tx, d, facts, { dealId, note: input.note, by: me.id, byLabel: "Brand" }));
    done(d.campaignId);
    revalidatePath(`/deals/${dealId}`);
    return ok(r.opensCaseByCaseLine ? "Changes requested · round 3+ is priced case by case" : "Changes requested");
  });
}

const score = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().min(1).max(5).nullable());

/** Five-question survey after a campaign; shared with the creator by default. */
export async function submitCampaignFeedback(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await brandActor();
    const input = parseWith(z.object({ campaignId: zId, q1: score, q2: score, q3: score, q4: score, q5: score, comment: zOptText(2000) }), formObject(fd));
    const [c] = await db.select().from(s.campaigns).where(and(eq(s.campaigns.id, input.campaignId), eq(s.campaigns.brandId, me.brandId)));
    if (!c) return fail("Not found");
    const [prior] = await db
      .select({ id: s.brandFeedback.id })
      .from(s.brandFeedback)
      .where(and(eq(s.brandFeedback.campaignId, c.id), eq(s.brandFeedback.kind, "campaign_5q"), isNull(s.brandFeedback.archivedAt)));
    const answers = [input.q1, input.q2, input.q3, input.q4, input.q5];
    const g = canSubmitCampaignFeedback(answers, c, !!prior);
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, (tx) =>
      tx.insert(s.brandFeedback).values({
        brandId: me.brandId,
        campaignId: c.id,
        kind: "campaign_5q",
        submittedOn: today(),
        q1: input.q1,
        q2: input.q2,
        q3: input.q3,
        q4: input.q4,
        q5: input.q5,
        comment: input.comment,
        sharedWithCreator: true,
        createdBy: me.id,
      }),
    );
    done(c.id);
    revalidatePath("/brands", "layout");
    return ok("Thanks — feedback sent");
  });
}

/** Quarterly NPS, 0–10; updates the brand's latest NPS. */
export async function submitNps(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await brandActor();
    const input = parseWith(z.object({ nps: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int("Pick a score").nullable()), comment: zOptText(2000) }), formObject(fd));
    if (input.nps == null) return fail("Pick a score");
    const [last] = await db
      .select({ on: s.brandFeedback.submittedOn })
      .from(s.brandFeedback)
      .where(and(eq(s.brandFeedback.brandId, me.brandId), eq(s.brandFeedback.kind, "nps"), isNull(s.brandFeedback.archivedAt)))
      .orderBy(desc(s.brandFeedback.submittedOn))
      .limit(1);
    const t = today();
    const g = canSubmitNps(input.nps, last?.on ?? null, t);
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, async (tx) => {
      await tx.insert(s.brandFeedback).values({ brandId: me.brandId, kind: "nps", submittedOn: t, nps: input.nps, comment: input.comment, sharedWithCreator: true, createdBy: me.id });
      await tx.update(s.brands).set({ npsLatest: input.nps, npsAsOf: t }).where(eq(s.brands.id, me.brandId));
    });
    revalidatePath("/brand", "layout");
    revalidatePath("/brands", "layout");
    return ok("Thanks — score sent");
  });
}
