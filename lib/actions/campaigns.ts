"use server";
// Campaign actions (BRIEF §8): add creators, campaign status, Frontseat items, report, feedback request.
import { z } from "zod";
import { and, eq, gte, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { canAddToCampaign, nextFreeSlot, FRONTSEAT_KEY, FRONTSEAT_POSTS } from "@/lib/rules/campaigns";
import { addDays, today } from "@/lib/dates";
import { filterScoresFor } from "@/lib/queries/facts";
import { deliverableLabel } from "@/lib/queries/campaigns";
import { ok, fail, guard, type ActionResult } from "./result";
import { formObject, parseWith, zBool, zId, zOptDate, zOptText, zOptUrl } from "./form-fields";

async function loadCampaign(id: string) {
  const [row] = await db
    .select({ c: s.campaigns, deal: s.deals })
    .from(s.campaigns)
    .innerJoin(s.deals, eq(s.deals.id, s.campaigns.dealId))
    .where(and(eq(s.campaigns.id, id), isNull(s.campaigns.archivedAt)));
  if (!row) throw new Error("Campaign not found");
  return row;
}

function done(id: string) {
  revalidatePath(`/campaigns/${id}`);
  revalidatePath("/campaigns");
  revalidatePath("/brand", "layout");
}

/** Add creators (§8.7): creates deal_creators (proposed) and one deliverable. Roster only; conflicts block. */
export async function addCreatorToCampaign(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const cfg = await getConfig();
    const input = parseWith(
      z.object({ campaignId: zId, creatorId: zId, deliverableKey: z.string().refine((k) => cfg.deliverables.some((d) => d.key === k), "Pick a deliverable"), dueOn: zOptDate }),
      formObject(fd),
    );
    const { c, deal } = await loadCampaign(input.campaignId);
    if (["reported", "paid_in_full", "declined", "lost"].includes(deal.stage)) return fail("The deal is closed");
    const [creator] = await db.select().from(s.creators).where(eq(s.creators.id, input.creatorId));
    if (!creator) return fail("Creator not found");
    const [scores, topics] = await Promise.all([
      filterScoresFor([creator.id]),
      db.select().from(s.creatorTopicFilters).where(and(eq(s.creatorTopicFilters.creatorId, creator.id), eq(s.creatorTopicFilters.active, true), isNull(s.creatorTopicFilters.archivedAt))),
    ]);
    const g = canAddToCampaign(cfg, { stage: creator.stage, filterScores: scores.get(creator.id) ?? [], representedElsewhere: creator.representedElsewhere }, deal.briefTags, topics.map((t) => ({ kind: t.kind, value: t.value })));
    if (!g.ok) return fail(g.reasons[0]);
    const def = cfg.deliverables.find((d) => d.key === input.deliverableKey)!;
    let dueOn = input.dueOn;
    if (!dueOn) {
      // Suggest the creator's next free calendar day (blackouts skipped; they only warn later).
      const t = today();
      const from = c.startsOn && c.startsOn > addDays(t, 7) ? c.startsOn : addDays(t, 7);
      const [items, blackouts] = await Promise.all([
        db.select({ date: s.creatorCalendarItems.date }).from(s.creatorCalendarItems).where(and(eq(s.creatorCalendarItems.creatorId, creator.id), gte(s.creatorCalendarItems.date, from), isNull(s.creatorCalendarItems.archivedAt))),
        db.select().from(s.creatorBlackouts).where(and(eq(s.creatorBlackouts.creatorId, creator.id), isNull(s.creatorBlackouts.archivedAt))),
      ]);
      dueOn = nextFreeSlot(from, items.map((i) => i.date), blackouts);
    }
    const role = deal.origin === "creator_inbound" && deal.originatingCreatorId && deal.originatingCreatorId !== creator.id ? "upsell" : "primary";
    const id = await withUser(me.id, async (tx) => {
      const [dc] = await tx.select().from(s.dealCreators).where(and(eq(s.dealCreators.dealId, deal.id), eq(s.dealCreators.creatorId, creator.id)));
      if (!dc) await tx.insert(s.dealCreators).values({ dealId: deal.id, creatorId: creator.id, role, status: "proposed", createdBy: me.id });
      else if (dc.archivedAt) await tx.update(s.dealCreators).set({ archivedAt: null, status: "proposed" }).where(eq(s.dealCreators.id, dc.id));
      const [row] = await tx
        .insert(s.deliverables)
        .values({
          campaignId: c.id,
          creatorId: creator.id,
          deliverableKey: def.key,
          platform: def.platform as (typeof s.platformEnum.enumValues)[number],
          title: `${c.name.split(" — ")[0]} · ${deliverableLabel(cfg, def.key)}`,
          briefTags: deal.briefTags,
          dueOn,
          status: "briefed",
          createdBy: me.id,
        })
        .returning({ id: s.deliverables.id });
      return row.id;
    });
    done(c.id);
    revalidatePath(`/deals/${deal.id}`);
    return ok(`Added ${creator.displayName}`, { undo: { entity: "deliverables", id } });
  });
}

const CAMPAIGN_STATUSES = ["planning", "active", "reporting", "closed"] as const;

export async function setCampaignStatus(id: string, status: string): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(z.object({ id: zId, status: z.enum(CAMPAIGN_STATUSES) }), { id, status });
    const { c } = await loadCampaign(input.id);
    if (input.status === "closed" && !c.reportMd?.trim() && !c.reportUrl?.trim()) return fail("Attach the report before closing");
    await withUser(me.id, (tx) => tx.update(s.campaigns).set({ status: input.status }).where(eq(s.campaigns.id, c.id)));
    done(c.id);
    return ok(`Campaign ${input.status}`);
  });
}

/** Frontseat amplification (§8.4): five tracked items with Frontseat as the channel, when the deal is flagged. */
export async function trackFrontseat(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(z.object({ campaignId: zId }), formObject(fd));
    const { c, deal } = await loadCampaign(input.campaignId);
    if (!deal.frontseatAmplification) return fail("The deal has no Frontseat amplification");
    const existing = await db.select({ id: s.deliverables.id }).from(s.deliverables).where(and(eq(s.deliverables.campaignId, c.id), eq(s.deliverables.channel, "frontseat"), isNull(s.deliverables.archivedAt)));
    if (existing.length) return fail("Frontseat items already tracked");
    const [primary] = await db
      .select({ creatorId: s.dealCreators.creatorId })
      .from(s.dealCreators)
      .where(and(eq(s.dealCreators.dealId, deal.id), eq(s.dealCreators.role, "primary"), isNull(s.dealCreators.archivedAt)))
      .limit(1);
    if (!primary) return fail("Add a creator first");
    // BRIEF: clarify — amplification posts are tracked against the primary creator's content and keep the full §5.4 gate.
    await withUser(me.id, (tx) =>
      tx.insert(s.deliverables).values(
        Array.from({ length: FRONTSEAT_POSTS }, (_, i) => ({
          campaignId: c.id,
          creatorId: primary.creatorId,
          deliverableKey: FRONTSEAT_KEY,
          platform: "other" as const,
          channel: "frontseat",
          title: `Frontseat amplification ${i + 1}`,
          briefTags: deal.briefTags,
          status: "briefed" as const,
          createdBy: me.id,
        })),
      ),
    );
    done(c.id);
    return ok(`Tracking ${FRONTSEAT_POSTS} Frontseat posts`);
  });
}

/** Report (§8.5): markdown + URL. */
export async function saveReport(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(z.object({ campaignId: zId, reportMd: zOptText(20000), reportUrl: zOptUrl }), formObject(fd));
    const { c, deal } = await loadCampaign(input.campaignId);
    const has = !!(input.reportMd || input.reportUrl);
    await withUser(me.id, (tx) =>
      tx
        .update(s.campaigns)
        .set({ reportMd: input.reportMd, reportUrl: input.reportUrl, reportedAt: has ? (c.reportedAt ?? new Date()) : null })
        .where(eq(s.campaigns.id, c.id)),
    );
    done(c.id);
    revalidatePath(`/deals/${deal.id}`);
    return ok("Report saved");
  });
}

/** "Request brand feedback" sets feedback_requested_at; the brand portal then shows the five-question form. */
export async function requestBrandFeedback(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(z.object({ campaignId: zId }), formObject(fd));
    const { c, deal } = await loadCampaign(input.campaignId);
    if (!c.reportMd?.trim() && !c.reportUrl?.trim()) return fail("Save the report first");
    await withUser(me.id, (tx) => tx.update(s.campaigns).set({ feedbackRequestedAt: new Date() }).where(eq(s.campaigns.id, c.id)));
    done(c.id);
    revalidatePath(`/deals/${deal.id}`);
    return ok(c.feedbackRequestedAt ? "Feedback requested again" : "Feedback requested");
  });
}

/** shared_with_creator (default on). */
export async function setFeedbackShared(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(z.object({ id: zId, shared: zBool }), formObject(fd));
    const [f] = await db.select().from(s.brandFeedback).where(eq(s.brandFeedback.id, input.id));
    if (!f) return fail("Feedback not found");
    await withUser(me.id, (tx) => tx.update(s.brandFeedback).set({ sharedWithCreator: input.shared }).where(eq(s.brandFeedback.id, f.id)));
    if (f.campaignId) done(f.campaignId);
    return ok(input.shared ? "Shared with creator" : "Hidden from creator");
  });
}
