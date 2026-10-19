"use server";
// Check-ins and roadmap (BRIEF §3.1, §9). Quarterly 60-minute check-ins with the template;
// each completed quarterly schedules the next. Pilot-end and exit-window reviews have their own templates.
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { ok, fail, guard, type ActionResult } from "./result";
import { nextCheckin } from "@/lib/rules/retention";
import { canRunCheckins, needsNextQuarterly } from "@/lib/rules/creator-flow";
import { can } from "@/lib/rules/visibility";
import { today as todayISO } from "@/lib/dates";

const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);
const text = z.preprocess(blank, z.string().trim().max(20000).nullable().optional());
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const uuid = z.string().uuid("Missing record");
const box = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

function parse<T extends z.ZodType>(schema: T, fd: FormData): z.infer<T> {
  const r = schema.safeParse(Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")));
  if (!r.success) throw new Error(r.error.issues[0]?.message ?? "Check the form");
  return r.data;
}

function touch(id: string) {
  revalidatePath(`/creators/${id}`);
  revalidatePath("/creators");
  revalidatePath("/today");
}

async function crew() {
  const me = await actor();
  const g = canRunCheckins(me.role);
  if (!g.ok) throw new Error(g.reasons[0]);
  return me;
}

async function creatorExists(id: string) {
  const [c] = await db
    .select({ id: s.creators.id })
    .from(s.creators)
    .where(and(eq(s.creators.id, id), isNull(s.creators.archivedAt)));
  if (!c) throw new Error("Creator not found");
}

const Schedule = z.object({ id: uuid, type: z.enum(s.checkinTypeEnum.enumValues), dueOn: isoDate });

export async function scheduleCheckin(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await crew();
    const input = parse(Schedule, fd);
    await creatorExists(input.id);
    await withUser(me.id, (tx) => tx.insert(s.creatorCheckins).values({ creatorId: input.id, type: input.type, dueOn: input.dueOn, createdBy: me.id }));
    touch(input.id);
    return ok(`Check-in scheduled for ${input.dueOn}`);
  });
}

const Reschedule = z.object({ id: uuid, checkinId: uuid, dueOn: isoDate });

export async function rescheduleCheckin(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await crew();
    const input = parse(Reschedule, fd);
    const [k] = await db
      .select()
      .from(s.creatorCheckins)
      .where(and(eq(s.creatorCheckins.id, input.checkinId), eq(s.creatorCheckins.creatorId, input.id)));
    if (!k) return fail("Check-in not found");
    if (k.heldOn) return fail("Already held");
    await withUser(me.id, (tx) => tx.update(s.creatorCheckins).set({ dueOn: input.dueOn }).where(eq(s.creatorCheckins.id, k.id)));
    touch(input.id);
    return ok(`Moved to ${input.dueOn}`);
  });
}

const AREAS = s.roadmapAreaEnum.enumValues;

const Hold = z.object({
  id: uuid,
  checkinId: z.preprocess(blank, uuid.nullable().optional()),
  type: z.enum(s.checkinTypeEnum.enumValues),
  heldOn: isoDate,
  notesMd: text,
  filterRescoreId: z.preprocess(blank, uuid.nullable().optional()),
  tierRecommendation: z.preprocess(
    blank,
    z
      .enum([...s.tierEnum.enumValues, "no_change"])
      .nullable()
      .optional(),
  ),
  calendarUpdated: box,
  introductions: text,
  goal_platform_audience: text,
  goal_own_product: text,
  goal_speaking_press: text,
  goal_advisory_fund_board: text,
});

/** Hold a check-in: notes from the template, outcomes, roadmap items; a quarterly schedules the next. */
export async function holdCheckin(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await crew();
    const input = parse(Hold, fd);
    await creatorExists(input.id);
    if (input.heldOn > todayISO()) return fail("Held date is in the future");
    if (!input.notesMd?.trim()) return fail("Notes are required");
    if (input.filterRescoreId) {
      const [sc] = await db
        .select({ id: s.creatorFilterScores.id })
        .from(s.creatorFilterScores)
        .where(and(eq(s.creatorFilterScores.id, input.filterRescoreId), eq(s.creatorFilterScores.creatorId, input.id)));
      if (!sc) return fail("That Filter score isn't this creator's");
    }
    // Tier is internal: only roles that may see tier record a recommendation (§0.1 #6).
    const tierRec = can(me.role, "tier") ? (input.tierRecommendation ?? undefined) : undefined;
    let existing: typeof s.creatorCheckins.$inferSelect | undefined;
    if (input.checkinId) {
      [existing] = await db
        .select()
        .from(s.creatorCheckins)
        .where(and(eq(s.creatorCheckins.id, input.checkinId), eq(s.creatorCheckins.creatorId, input.id)));
      if (!existing) return fail("Check-in not found");
      if (existing.heldOn) return fail("Already held");
    }
    const cfg = await getConfig();
    const type = existing?.type ?? input.type;
    const pending = await db
      .select({ dueOn: s.creatorCheckins.dueOn, id: s.creatorCheckins.id })
      .from(s.creatorCheckins)
      .where(and(eq(s.creatorCheckins.creatorId, input.id), eq(s.creatorCheckins.type, "quarterly"), isNull(s.creatorCheckins.heldOn), isNull(s.creatorCheckins.archivedAt)));
    const scheduleNext = needsNextQuarterly(
      type,
      pending.filter((p) => p.id !== existing?.id).map((p) => p.dueOn),
      input.heldOn,
    );
    const goals = AREAS.map((area) => ({ area, goal: (input[`goal_${area}` as const] ?? "").trim() })).filter((g) => g.goal);
    const introductions = (input.introductions ?? "")
      .split("\n")
      .map((l) => l.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
    let next: string | null = null;
    await withUser(me.id, async (tx) => {
      const roadmapIds: string[] = [];
      for (const g of goals) {
        const [r] = await tx.insert(s.creatorRoadmapItems).values({ creatorId: input.id, area: g.area, goal: g.goal, status: "open", createdBy: me.id }).returning({ id: s.creatorRoadmapItems.id });
        roadmapIds.push(r.id);
      }
      const outcomes = {
        ...(tierRec ? { tier_recommendation: tierRec } : {}),
        ...(input.filterRescoreId ? { filter_rescore_id: input.filterRescoreId } : {}),
        calendar_updated: input.calendarUpdated,
        roadmap_items: roadmapIds,
        introductions,
      };
      if (existing) {
        await tx.update(s.creatorCheckins).set({ heldOn: input.heldOn, heldBy: me.id, notesMd: input.notesMd, outcomes }).where(eq(s.creatorCheckins.id, existing.id));
      } else {
        await tx.insert(s.creatorCheckins).values({ creatorId: input.id, type, dueOn: input.heldOn, heldOn: input.heldOn, heldBy: me.id, notesMd: input.notesMd, outcomes, createdBy: me.id });
      }
      if (scheduleNext) {
        const n = nextCheckin(cfg, input.heldOn);
        next = n.dueOn;
        await tx.insert(s.creatorCheckins).values({ creatorId: input.id, type: n.type, dueOn: n.dueOn, createdBy: me.id });
      }
    });
    touch(input.id);
    return ok(next ? `Check-in held · next ${next}` : "Check-in held", { redirect: `/creators/${input.id}?tab=checkins` });
  });
}

const CheckinRef = z.object({ id: uuid, checkinId: uuid });

export async function cancelCheckin(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await crew();
    const input = parse(CheckinRef, fd);
    const [k] = await db
      .select()
      .from(s.creatorCheckins)
      .where(and(eq(s.creatorCheckins.id, input.checkinId), eq(s.creatorCheckins.creatorId, input.id)));
    if (!k) return fail("Check-in not found");
    if (k.heldOn) return fail("Held check-ins stay on record");
    await withUser(me.id, (tx) => tx.update(s.creatorCheckins).set({ archivedAt: new Date() }).where(eq(s.creatorCheckins.id, k.id)));
    touch(input.id);
    return ok("Check-in cancelled");
  });
}

// ---------- roadmap (four areas) ----------
const Roadmap = z.object({ id: uuid, area: z.enum(AREAS), goal: z.string().trim().min(1, "Goal is required").max(300), crewContribution: text });

export async function addRoadmapItem(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await crew();
    const input = parse(Roadmap, fd);
    await creatorExists(input.id);
    await withUser(me.id, (tx) =>
      tx.insert(s.creatorRoadmapItems).values({ creatorId: input.id, area: input.area, goal: input.goal, crewContribution: input.crewContribution ?? null, status: "open", createdBy: me.id }),
    );
    touch(input.id);
    return ok("Roadmap item added");
  });
}

const RoadmapEdit = z.object({
  id: uuid,
  rowId: uuid,
  goal: z.string().trim().min(1, "Goal is required").max(300),
  crewContribution: text,
  status: z.enum(["open", "in_progress", "done", "dropped"]),
});

export async function updateRoadmapItem(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await crew();
    const input = parse(RoadmapEdit, fd);
    await withUser(me.id, (tx) =>
      tx
        .update(s.creatorRoadmapItems)
        .set({ goal: input.goal, crewContribution: input.crewContribution ?? null, status: input.status })
        .where(and(eq(s.creatorRoadmapItems.id, input.rowId), eq(s.creatorRoadmapItems.creatorId, input.id))),
    );
    touch(input.id);
    return ok("Roadmap saved");
  });
}

const RowRef = z.object({ id: uuid, rowId: uuid });

export async function removeRoadmapItem(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await crew();
    const input = parse(RowRef, fd);
    await withUser(me.id, (tx) =>
      tx
        .update(s.creatorRoadmapItems)
        .set({ archivedAt: new Date() })
        .where(and(eq(s.creatorRoadmapItems.id, input.rowId), eq(s.creatorRoadmapItems.creatorId, input.id))),
    );
    touch(input.id);
    return ok("Roadmap item removed");
  });
}
