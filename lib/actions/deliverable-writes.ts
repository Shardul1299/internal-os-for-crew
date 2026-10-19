// Shared deliverable writes used by Crew-side and brand-side server actions (not an action module).
import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import * as s from "@/lib/db/schema";
import type { Tx } from "@/lib/db/tx";
import { requestChanges, type DeliverableFacts } from "@/lib/rules/deliverables";

type Deliverable = typeof s.deliverables.$inferSelect;

/**
 * Claims-only approvals, two rounds (§8.3): the draft goes back to drafting with the note; a request
 * beyond round 2 opens a "Revision — case by case" line on the deal for Crew to price or waive.
 */
export async function applyChangeRequest(tx: Tx, d: Deliverable, facts: DeliverableFacts, args: { dealId: string; note: string | null; by: string; byLabel: string }) {
  const r = requestChanges(facts);
  await tx
    .update(s.deliverables)
    .set({ status: "drafting", revisionRound: r.revisionRound, brandChangeRequestMd: args.note, claimsApprovedByBrand: false, approvedByContactId: null })
    .where(eq(s.deliverables.id, d.id));
  if (r.opensCaseByCaseLine) {
    await tx.insert(s.dealQuoteLines).values({
      dealId: args.dealId,
      creatorId: d.creatorId,
      deliverableKey: "revisions_r3",
      qty: 1,
      standardPaise: 0,
      rung: "standard",
      addons: [],
      lineTotalPaise: 0,
      isCaseByCase: true,
      note: `Revision — case by case: ${d.title}, round ${r.revisionRound}`,
      createdBy: args.by,
    });
  }
  await tx.insert(s.dealActivity).values({
    dealId: args.dealId,
    by: args.by,
    kind: "note",
    bodyMd: `${args.byLabel} requested changes on ${d.title} (round ${r.revisionRound})${args.note ? `: ${args.note}` : ""}${r.opensCaseByCaseLine ? " — opened a case-by-case revision line" : ""}`,
    createdBy: args.by,
  });
  return r;
}

/** `scheduled` writes the sponsored item on the creator's calendar (§8.2) — one item per deliverable. */
export async function upsertSponsoredItem(tx: Tx, d: Deliverable, args: { date: string; brandName: string; by: string }) {
  const [item] = await tx
    .select({ id: s.creatorCalendarItems.id })
    .from(s.creatorCalendarItems)
    .where(and(eq(s.creatorCalendarItems.deliverableId, d.id), isNull(s.creatorCalendarItems.archivedAt)))
    .limit(1);
  if (item) {
    await tx.update(s.creatorCalendarItems).set({ date: args.date, kind: "sponsored", platform: d.platform }).where(eq(s.creatorCalendarItems.id, item.id));
    return item.id;
  }
  const [row] = await tx
    .insert(s.creatorCalendarItems)
    .values({
      creatorId: d.creatorId,
      date: args.date,
      kind: "sponsored",
      title: `${args.brandName} · ${d.title}`,
      platform: d.platform,
      deliverableId: d.id,
      campaignId: d.campaignId,
      studioStatus: "scripted",
      createdBy: args.by,
    })
    .returning({ id: s.creatorCalendarItems.id });
  return row.id;
}

export async function syncCalendarItem(tx: Tx, deliverableId: string, set: Partial<typeof s.creatorCalendarItems.$inferInsert>) {
  await tx
    .update(s.creatorCalendarItems)
    .set(set)
    .where(and(eq(s.creatorCalendarItems.deliverableId, deliverableId), isNull(s.creatorCalendarItems.archivedAt)));
}
