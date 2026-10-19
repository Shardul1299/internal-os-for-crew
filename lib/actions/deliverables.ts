"use server";
// Crew-side deliverable actions (BRIEF §5.4, §8): status moves gated by lib/rules/deliverables,
// scheduling writes the sponsored calendar item, disclosure, claims, change requests, metrics.
import { z } from "zod";
import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { canScheduleOrGoLive, canTransitionDeliverable, DELIVERABLE_FLOW } from "@/lib/rules/deliverables";
import { deliverableContext, deliverableFacts, DELIVERABLE_STATUS_LABEL } from "@/lib/queries/campaigns";
import { ok, fail, guard, type ActionResult } from "./result";
import { applyChangeRequest, syncCalendarItem, upsertSponsoredItem } from "./deliverable-writes";
import { formObject, parseWith, zBool, zId, zOptDate, zOptInt, zOptText, zOptUrl } from "./form-fields";

async function load(id: string) {
  const [row] = await db
    .select({ d: s.deliverables, brandName: s.brands.name, brandId: s.campaigns.brandId })
    .from(s.deliverables)
    .innerJoin(s.campaigns, eq(s.campaigns.id, s.deliverables.campaignId))
    .innerJoin(s.brands, eq(s.brands.id, s.campaigns.brandId))
    .where(and(eq(s.deliverables.id, id), isNull(s.deliverables.archivedAt)));
  if (!row) throw new Error("Deliverable not found");
  return row;
}

function done(campaignId: string) {
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/campaigns");
  revalidatePath("/today");
  revalidatePath("/brand", "layout");
}

const STATUSES = [...DELIVERABLE_FLOW, "cancelled"] as const;

/** Status control (MenuPill). Every move goes through canTransitionDeliverable. */
export async function moveDeliverable(id: string, to: string): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(z.object({ id: zId, to: z.enum(STATUSES) }), { id, to });
    const cfg = await getConfig();
    const { d, brandName } = await load(input.id);
    const { ctx, dealId } = await deliverableContext(cfg, d);
    const facts = deliverableFacts(d);
    const g = canTransitionDeliverable(cfg, facts, input.to, ctx);
    if (!g.ok) return fail(g.reasons[0]);
    const label = DELIVERABLE_STATUS_LABEL[input.to];
    if (input.to === "drafting" && (d.status === "in_review" || d.status === "approved")) {
      await withUser(me.id, (tx) => applyChangeRequest(tx, d, facts, { dealId, note: null, by: me.id, byLabel: "Crew" }));
      done(d.campaignId);
      return ok("Sent back to drafting");
    }
    await withUser(me.id, async (tx) => {
      const set: Partial<typeof s.deliverables.$inferInsert> = { status: input.to };
      if (input.to === "live") set.liveAt = new Date();
      await tx.update(s.deliverables).set(set).where(eq(s.deliverables.id, d.id));
      if (input.to === "scheduled" && d.scheduledFor && d.channel !== "frontseat") {
        await upsertSponsoredItem(tx, d, { date: d.scheduledFor, brandName, by: me.id });
      }
      if (input.to === "live") await syncCalendarItem(tx, d.id, { studioStatus: "posted", liveUrl: d.liveUrl });
      if (input.to === "cancelled") await syncCalendarItem(tx, d.id, { archivedAt: new Date() });
    });
    done(d.campaignId);
    const warn = g.warnings?.[0];
    // Calendar writes ride along with scheduled/live/cancelled moves, so only plain moves offer ⌘Z.
    const undoable = !["scheduled", "live", "cancelled"].includes(input.to);
    return ok(`Moved to ${label}${warn ? ` · ${warn}` : ""}`, undoable ? { undo: { entity: "deliverables", id: d.id } } : {});
  });
}

const DetailsSchema = z.object({
  id: zId,
  title: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(1, "Title required").max(200)),
  dueOn: zOptDate,
  disclosureChecked: zBool,
  disclosureStandard: z.enum(["asci", "ftc", "both"]),
  draftMd: zOptText(8000),
  liveUrl: zOptUrl,
});

/** Disclosure checkbox + standard, draft text, live URL, due date. */
export async function saveDeliverable(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(DetailsSchema, formObject(fd));
    const { d } = await load(input.id);
    await withUser(me.id, async (tx) => {
      await tx
        .update(s.deliverables)
        .set({ title: input.title, dueOn: input.dueOn, disclosureChecked: input.disclosureChecked, disclosureStandard: input.disclosureStandard, draftMd: input.draftMd, liveUrl: input.liveUrl })
        .where(eq(s.deliverables.id, d.id));
      if (input.liveUrl !== d.liveUrl && (d.status === "live" || d.status === "reported")) await syncCalendarItem(tx, d.id, { liveUrl: input.liveUrl });
    });
    done(d.campaignId);
    return ok("Saved", { undo: { entity: "deliverables", id: d.id } });
  });
}

/** Scheduled date. Once scheduled, a new date re-runs the §5.4 gate and moves the calendar item. */
export async function setScheduledDate(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(z.object({ id: zId, scheduledFor: zOptDate }), formObject(fd));
    const cfg = await getConfig();
    const { d, brandName } = await load(input.id);
    const locked = d.status === "scheduled" || d.status === "live" || d.status === "reported";
    if (locked && !input.scheduledFor) return fail("A scheduled deliverable needs a date");
    let warning: string | undefined;
    if (input.scheduledFor) {
      const { ctx } = await deliverableContext(cfg, d, input.scheduledFor);
      const g = canScheduleOrGoLive(cfg, deliverableFacts(d, { scheduledFor: input.scheduledFor }), ctx);
      if (d.status === "scheduled" && !g.ok) return fail(g.reasons[0]);
      warning = g.warnings?.[0];
    }
    await withUser(me.id, async (tx) => {
      await tx.update(s.deliverables).set({ scheduledFor: input.scheduledFor }).where(eq(s.deliverables.id, d.id));
      if (d.status === "scheduled" && input.scheduledFor && d.channel !== "frontseat") await upsertSponsoredItem(tx, { ...d, scheduledFor: input.scheduledFor }, { date: input.scheduledFor, brandName, by: me.id });
    });
    done(d.campaignId);
    return ok(`Date saved${warning ? ` · ${warning}` : ""}`, d.status === "scheduled" ? {} : { undo: { entity: "deliverables", id: d.id } });
  });
}

/** Claims status — Crew records a brand approval received outside the portal, naming the contact. */
export async function setClaims(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(z.object({ id: zId, approved: zBool, contactId: z.preprocess((v) => (v ? v : null), zId.nullable()) }), formObject(fd));
    const { d, brandId } = await load(input.id);
    if (input.approved) {
      if (!input.contactId) return fail("Name the brand contact who approved");
      const [c] = await db.select({ id: s.brandContacts.id }).from(s.brandContacts).where(and(eq(s.brandContacts.id, input.contactId), eq(s.brandContacts.brandId, brandId)));
      if (!c) return fail("That contact isn't on this brand");
    }
    if (input.approved && d.status !== "in_review") return fail("Claims are approved on a draft in review");
    if (!input.approved && ["scheduled", "live", "reported"].includes(d.status)) return fail("Claims can't be withdrawn once scheduled");
    await withUser(me.id, (tx) =>
      tx
        .update(s.deliverables)
        .set({
          claimsApprovedByBrand: input.approved,
          approvedByContactId: input.approved ? input.contactId : null,
          // An approved draft without claims approval goes back to review (approved needs the brand's claims sign-off).
          ...(!input.approved && d.status === "approved" ? { status: "in_review" as const } : {}),
        })
        .where(eq(s.deliverables.id, d.id)),
    );
    done(d.campaignId);
    return ok(input.approved ? "Claims approved" : "Claims pending", { undo: { entity: "deliverables", id: d.id } });
  });
}

/** Request changes (Crew side). Beyond round 2 this opens a case-by-case line on the deal. */
export async function requestChangesCrew(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(z.object({ id: zId, note: zOptText(2000) }), formObject(fd));
    const cfg = await getConfig();
    const { d } = await load(input.id);
    const { ctx, dealId } = await deliverableContext(cfg, d);
    const facts = deliverableFacts(d);
    const g = canTransitionDeliverable(cfg, facts, "drafting", ctx);
    if (!g.ok || !(d.status === "in_review" || d.status === "approved")) return fail("Only a draft in review or approved can go back");
    const r = await withUser(me.id, (tx) => applyChangeRequest(tx, d, facts, { dealId, note: input.note, by: me.id, byLabel: "Crew" }));
    done(d.campaignId);
    revalidatePath(`/deals/${dealId}`);
    return ok(r.opensCaseByCaseLine ? `Round ${r.revisionRound} · case-by-case line opened` : `Changes requested · round ${r.revisionRound}`);
  });
}

const MetricsSchema = z.object({
  id: zId,
  saves: zOptInt,
  shares: zOptInt,
  commentsDecisionMaker: zOptInt,
  inboundToBrand: zOptInt,
  trackedSignups: zOptInt,
  impressions: zOptInt,
  notes: zOptText(1000),
});

/** Metrics capture — one record per sponsored post (the same record Studio Results fills). */
export async function saveMetrics(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(MetricsSchema, formObject(fd));
    const { d } = await load(input.id);
    if (!["live", "reported"].includes(d.status)) return fail("Metrics come after the post is live");
    const { id, ...values } = input;
    const [existing] = await db
      .select({ id: s.deliverableMetrics.id })
      .from(s.deliverableMetrics)
      .where(and(eq(s.deliverableMetrics.deliverableId, id), isNull(s.deliverableMetrics.archivedAt)))
      .orderBy(desc(s.deliverableMetrics.capturedAt))
      .limit(1);
    await withUser(me.id, async (tx) => {
      if (existing) await tx.update(s.deliverableMetrics).set({ ...values, capturedAt: new Date() }).where(eq(s.deliverableMetrics.id, existing.id));
      else await tx.insert(s.deliverableMetrics).values({ deliverableId: id, ...values, createdBy: me.id });
    });
    done(d.campaignId);
    return ok("Metrics saved");
  });
}
