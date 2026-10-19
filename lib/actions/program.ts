"use server";
// Owled Creator Program — server actions (§3.2, §7). Zod → actor() → lib/rules → withUser() → revalidatePath.
import { z } from "zod";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { ok, fail, guard, type ActionResult } from "./result";
import { parseInput } from "./parse";
import { today as todayISO } from "@/lib/dates";
import { rupeesToPaise } from "@/lib/format";
import {
  closesAt,
  canSubmit,
  rankEntries,
  revisitDate,
  programCan,
  canMoveChallenge,
  canEnter,
  canScore,
  routeOutcome,
  canRouteOutcomes,
  canCommissionEntry,
  canMarkAttendance,
  canAddIntern,
  PASS_NOTE,
  NO_SUBMISSION_NOTE,
  type ChallengeStatus,
  type ProgramAction,
} from "@/lib/rules/program";
import { stageEffects, validateFilterScore, scoreTotal } from "@/lib/rules/creators";
import { resolveStandard, computeLine, commissionPct } from "@/lib/rules/ladder";

const uuid = z.uuid();
const optText = z.string().trim().optional().transform((v) => (v ? v : null));
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const SUBS = s.subCategoryEnum.enumValues;
const PLATFORMS = s.platformEnum.enumValues;

async function programActor(action: ProgramAction) {
  const me = await actor();
  const g = programCan(me.role, action);
  if (!g.ok) throw new Error(g.reasons[0]);
  return me;
}

function done(path = "/program") {
  revalidatePath(path);
  revalidatePath("/program", "layout");
}

/** datetime-local values are read in Asia/Kolkata. */
function istDateTime(v: string): Date {
  const d = new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(v) ? v : `${v.length === 16 ? `${v}:00` : v}+05:30`);
  if (Number.isNaN(d.getTime())) throw new Error("Pick a date and time");
  return d;
}

// ---------- Cohorts ----------

const CohortSchema = z.object({
  id: uuid.optional().or(z.literal("").transform(() => undefined)),
  programme: z.enum(s.programmeEnum.enumValues),
  batchLabel: z.string().trim().min(1, "Batch label missing"),
  startsOn: isoDate,
  endsOn: isoDate,
  counterpartName: optText,
  counterpartEmail: z.union([z.literal(""), z.email("Counterpart email looks wrong")]).optional().transform((v) => (v ? v : null)),
  cost: z.string().optional(),
});

export async function saveCohort(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("cohort");
    const input = parseInput(CohortSchema, Object.fromEntries(fd));
    if (input.endsOn < input.startsOn) return fail("Ends before it starts");
    const values = {
      programme: input.programme,
      batchLabel: input.batchLabel,
      startsOn: input.startsOn,
      endsOn: input.endsOn,
      counterpartName: input.counterpartName,
      counterpartEmail: input.counterpartEmail,
      ...(input.cost != null && input.cost !== "" ? { costPaise: rupeesToPaise(input.cost) } : {}),
    };
    const id = await withUser(me.id, async (tx) => {
      if (input.id) {
        await tx.update(s.programCohorts).set(values).where(eq(s.programCohorts.id, input.id));
        return input.id;
      }
      const [row] = await tx.insert(s.programCohorts).values({ ...values, createdBy: me.id }).returning({ id: s.programCohorts.id });
      return row.id;
    });
    done();
    return ok(input.id ? "Cohort saved" : "Cohort created", { redirect: input.id ? undefined : `/program?cohort=${id}` });
  });
}

// ---------- Challenges ----------

const ChallengeSchema = z.object({
  id: uuid.optional().or(z.literal("").transform(() => undefined)),
  cohortId: uuid,
  title: z.string().trim().min(1, "Title missing"),
  brandId: uuid.optional().or(z.literal("").transform(() => undefined)),
  briefMd: z.string().default(""),
  opensAt: z.string().min(1, "Pick when it opens"),
  topN: z.coerce.number().int().min(1, "Top N must be at least 1").max(50),
  capacityNote: optText,
});

export async function saveChallenge(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("challenge");
    const input = parseInput(ChallengeSchema, Object.fromEntries(fd));
    const judges = fd.getAll("judges").map(String).filter(Boolean);
    const opensAt = istDateTime(input.opensAt);
    if (input.id) {
      const [cur] = await db.select().from(s.programChallenges).where(eq(s.programChallenges.id, input.id));
      if (!cur) return fail("Challenge not found");
      if (cur.status === "judging" || cur.status === "closed") return fail("A challenge in judging can't be edited");
      const timing = cur.status === "draft" ? { opensAt, closesAt: closesAt(opensAt) } : {};
      if (cur.status !== "draft" && opensAt.getTime() !== cur.opensAt.getTime()) return fail("The window can't move once the challenge is open");
      await withUser(me.id, (tx) =>
        tx
          .update(s.programChallenges)
          .set({ title: input.title, brandId: input.brandId ?? null, briefMd: input.briefMd, topN: input.topN, capacityNote: input.capacityNote, judges, ...timing })
          .where(eq(s.programChallenges.id, input.id!)),
      );
      done();
      return ok("Challenge saved");
    }
    const cfg = await getConfig();
    const id = await withUser(me.id, async (tx) => {
      const [row] = await tx
        .insert(s.programChallenges)
        .values({
          cohortId: input.cohortId,
          title: input.title,
          brandId: input.brandId ?? null,
          briefMd: input.briefMd,
          opensAt,
          closesAt: closesAt(opensAt),
          status: "draft",
          judges,
          topN: input.topN || cfg.filter.challengeTopN,
          capacityNote: input.capacityNote ?? "Runs when Crew has capacity",
          createdBy: me.id,
        })
        .returning({ id: s.programChallenges.id });
      return row.id;
    });
    done();
    return ok("Challenge drafted", { redirect: `/program?cohort=${input.cohortId}&challenge=${id}` });
  });
}

const MoveSchema = z.object({ id: uuid, to: z.enum(s.challengeStatusEnum.enumValues) });

export async function moveChallenge(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("challenge");
    const { id, to } = parseInput(MoveSchema, Object.fromEntries(fd));
    const [ch] = await db.select().from(s.programChallenges).where(eq(s.programChallenges.id, id));
    if (!ch) return fail("Challenge not found");
    const entries = await db.select().from(s.programEntries).where(and(eq(s.programEntries.challengeId, id), isNull(s.programEntries.archivedAt)));
    const g = canMoveChallenge({ ...ch, status: ch.status as ChallengeStatus }, to, {
      now: new Date(),
      entries: entries.map((e) => ({ submitted: !!e.submittedAt, scored: !!e.filterScoreId, outcome: e.outcome })),
    });
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, (tx) => tx.update(s.programChallenges).set({ status: to }).where(eq(s.programChallenges.id, id)));
    done();
    return ok(to === "open" ? "Challenge opened" : to === "judging" ? "Moved to judging" : "Challenge closed — brand revealed");
  });
}

// ---------- Entries ----------

const EntrantSchema = z.object({
  challengeId: uuid,
  creatorId: uuid.optional().or(z.literal("").transform(() => undefined)),
  displayName: optText,
  email: z.union([z.literal(""), z.email("Email looks wrong")]).optional().transform((v) => (v ? v : null)),
  city: optText,
  declaredSubCategory: z.enum(SUBS),
  declaredPlatform: z.enum(PLATFORMS),
  consent: z.literal("on", { message: "Capture opt-in consent first" }).optional(),
});

export async function addEntrant(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("entry");
    const input = parseInput(EntrantSchema, Object.fromEntries(fd));
    const [ch] = await db.select().from(s.programChallenges).where(eq(s.programChallenges.id, input.challengeId));
    if (!ch) return fail("Challenge not found");
    const consentStatus = input.consent === "on" ? "opted_in" : "none";
    const g = canEnter({ consentStatus, challengeStatus: ch.status });
    if (!g.ok) return fail(g.reasons[0]);
    if (!input.creatorId && !input.displayName) return fail("Name missing");
    if (input.creatorId) {
      const [dup] = await db
        .select({ id: s.programEntries.id })
        .from(s.programEntries)
        .where(and(eq(s.programEntries.challengeId, ch.id), eq(s.programEntries.creatorId, input.creatorId), isNull(s.programEntries.archivedAt)));
      if (dup) return fail("Already entered in this challenge");
    }
    const entryId = await withUser(me.id, async (tx) => {
      let creatorId = input.creatorId;
      if (!creatorId) {
        const [c] = await tx
          .insert(s.creators)
          .values({
            displayName: input.displayName!,
            email: input.email,
            city: input.city,
            stage: "scout",
            source: "program",
            sourceDetail: `Program challenge: ${ch.title}`,
            subCategory: input.declaredSubCategory,
            primaryPlatform: input.declaredPlatform,
            consentStatus: "opted_in",
            createdBy: me.id,
          })
          .returning({ id: s.creators.id });
        creatorId = c.id;
      } else {
        await tx.update(s.creators).set({ consentStatus: "opted_in" }).where(and(eq(s.creators.id, creatorId), eq(s.creators.consentStatus, "none")));
      }
      const [e] = await tx
        .insert(s.programEntries)
        .values({ challengeId: ch.id, creatorId, consentStatus, declaredSubCategory: input.declaredSubCategory, declaredPlatform: input.declaredPlatform, createdBy: me.id })
        .returning({ id: s.programEntries.id });
      return e.id;
    });
    done();
    return ok("Entrant added", { undo: { entity: "program_entries", id: entryId } });
  });
}

const SubmitSchema = z.object({
  entryId: uuid,
  submissionUrl: z.url("Submission link looks wrong"),
  noteMd: z.string().default(""),
});

export async function submitEntry(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("entry");
    const input = parseInput(SubmitSchema, Object.fromEntries(fd));
    const [row] = await db
      .select({ e: s.programEntries, c: s.programChallenges })
      .from(s.programEntries)
      .innerJoin(s.programChallenges, eq(s.programChallenges.id, s.programEntries.challengeId))
      .where(eq(s.programEntries.id, input.entryId));
    if (!row) return fail("Entry not found");
    const g = canSubmit(row.e, row.c, new Date(), input.noteMd);
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, (tx) =>
      tx.update(s.programEntries).set({ submissionUrl: input.submissionUrl, noteMd: input.noteMd.trim() || null, submittedAt: new Date() }).where(eq(s.programEntries.id, input.entryId)),
    );
    done();
    return ok("Submission recorded", { undo: { entity: "program_entries", id: input.entryId } });
  });
}

// ---------- Judging ----------

const ScoreRow = z.object({
  entryId: uuid,
  aesthetics: z.number().int().nullable(),
  taste: z.number().int().nullable(),
  personality: z.number().int().nullable(),
  sentence: z.string().default(""),
});
const ScoresSchema = z.object({ challengeId: uuid, rows: z.string() });

export async function saveScores(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("score");
    const input = parseInput(ScoresSchema, Object.fromEntries(fd));
    const rows = parseInput(z.array(ScoreRow), JSON.parse(input.rows));
    const [ch] = await db.select().from(s.programChallenges).where(eq(s.programChallenges.id, input.challengeId));
    if (!ch) return fail("Challenge not found");
    const g = canScore(ch);
    if (!g.ok) return fail(g.reasons[0]);
    const entries = await db
      .select({ e: s.programEntries, name: s.creators.displayName })
      .from(s.programEntries)
      .innerJoin(s.creators, eq(s.creators.id, s.programEntries.creatorId))
      .where(and(eq(s.programEntries.challengeId, ch.id), isNull(s.programEntries.archivedAt)));
    const byId = new Map(entries.map((x) => [x.e.id, x]));
    const toSave: { entry: (typeof entries)[number]; a: number; t: number; p: number; sentence: string }[] = [];
    for (const r of rows) {
      const x = byId.get(r.entryId);
      if (!x) continue;
      const blank = r.aesthetics == null && r.taste == null && r.personality == null && !r.sentence.trim();
      if (blank) continue;
      if (!x.e.submittedAt) return fail(`${x.name} has no submission to score`);
      const v = validateFilterScore({ aesthetics: r.aesthetics ?? 0, taste: r.taste ?? 0, personality: r.personality ?? 0, sentence: r.sentence });
      if (!v.ok) return fail(`${x.name}: ${v.reasons[0]}`);
      toSave.push({ entry: x, a: r.aesthetics!, t: r.taste!, p: r.personality!, sentence: r.sentence.trim() });
    }
    if (!toSave.length) return fail("Nothing to save");
    await withUser(me.id, async (tx) => {
      const totals = new Map<string, number | null>();
      for (const x of entries) totals.set(x.e.id, null);
      // Existing linked scores keep their totals for ranking.
      const linked = entries.map((x) => x.e.filterScoreId).filter((v): v is string => !!v);
      if (linked.length) {
        const cur = await tx.select({ id: s.creatorFilterScores.id, total: s.creatorFilterScores.total }).from(s.creatorFilterScores).where(inArray(s.creatorFilterScores.id, linked));
        const t = new Map(cur.map((c) => [c.id, c.total]));
        for (const x of entries) if (x.e.filterScoreId) totals.set(x.e.id, t.get(x.e.filterScoreId) ?? null);
      }
      for (const r of toSave) {
        const total = scoreTotal(r.a, r.t, r.p);
        const vals = { aesthetics: r.a, taste: r.t, personality: r.p, total, sentence: r.sentence, scoredBy: me.id, scoredAt: new Date() };
        if (r.entry.e.filterScoreId) {
          await tx.update(s.creatorFilterScores).set(vals).where(eq(s.creatorFilterScores.id, r.entry.e.filterScoreId));
        } else {
          const [f] = await tx
            .insert(s.creatorFilterScores)
            .values({ ...vals, creatorId: r.entry.e.creatorId, context: "challenge", createdBy: me.id })
            .returning({ id: s.creatorFilterScores.id });
          await tx.update(s.programEntries).set({ filterScoreId: f.id }).where(eq(s.programEntries.id, r.entry.e.id));
        }
        totals.set(r.entry.e.id, total);
      }
      const ranked = rankEntries([...totals.entries()].map(([id, total]) => ({ id, total })));
      for (const r of ranked) {
        const cur = byId.get(r.id)!;
        if (cur.e.rank !== r.rank) await tx.update(s.programEntries).set({ rank: r.rank }).where(eq(s.programEntries.id, r.id));
      }
    });
    done();
    return ok(`${toSave.length} ${toSave.length === 1 ? "score" : "scores"} saved`);
  });
}

// ---------- Outcomes ----------

const IdSchema = z.object({ challengeId: uuid });

export async function routeOutcomes(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("route");
    const { challengeId } = parseInput(IdSchema, Object.fromEntries(fd));
    const cfg = await getConfig();
    const [ch] = await db.select().from(s.programChallenges).where(eq(s.programChallenges.id, challengeId));
    if (!ch) return fail("Challenge not found");
    const rows = await db
      .select({ e: s.programEntries, c: s.creators, total: s.creatorFilterScores.total })
      .from(s.programEntries)
      .innerJoin(s.creators, eq(s.creators.id, s.programEntries.creatorId))
      .leftJoin(s.creatorFilterScores, eq(s.creatorFilterScores.id, s.programEntries.filterScoreId))
      .where(and(eq(s.programEntries.challengeId, challengeId), isNull(s.programEntries.archivedAt)));
    if (rows.some((r) => r.e.outcome)) return fail("Outcomes are already routed");
    const g = canRouteOutcomes(ch, rows.map((r) => ({ submitted: !!r.e.submittedAt, scored: r.total != null })));
    if (!g.ok) return fail(g.reasons[0]);
    const scored = rankEntries(rows.filter((r) => r.e.submittedAt).map((r) => ({ id: r.e.id, total: r.total })));
    const rankOf = new Map(scored.map((r) => [r.id, r.rank]));
    const today = todayISO();
    const count = { tier0: 0, revisit: 0, pass: 0 };
    await withUser(me.id, async (tx) => {
      for (const r of rows) {
        const rank = rankOf.get(r.e.id) ?? null;
        if (!r.e.submittedAt) {
          await tx.update(s.programEntries).set({ outcome: "pass", outcomeNote: NO_SUBMISSION_NOTE, rank: null }).where(eq(s.programEntries.id, r.e.id));
          count.pass++;
          continue;
        }
        const outcome = routeOutcome(cfg, { rank, total: r.total }, ch.topN) ?? "pass";
        count[outcome]++;
        if (outcome === "tier0") {
          const fx = stageEffects(cfg, "incubation", today) as { tier: "T0"; firstLookUntil: string };
          await tx.update(s.programEntries).set({ outcome, rank, outcomeNote: `Top ${ch.topN} — Tier 0, first look until ${fx.firstLookUntil}` }).where(eq(s.programEntries.id, r.e.id));
          if (["scout", "revisit", "watchlist"].includes(r.c.stage)) {
            await tx
              .update(s.creators)
              .set({
                previousStage: r.c.stage,
                stage: "incubation",
                stageChangedAt: new Date(),
                stageReason: `Program: top ${ch.topN} in “${ch.title}”`,
                tier: fx.tier,
                firstLookUntil: fx.firstLookUntil,
                consentStatus: "opted_in",
                revisitOn: null,
              })
              .where(eq(s.creators.id, r.c.id));
          }
        } else if (outcome === "revisit") {
          const on = revisitDate(cfg, today);
          await tx.update(s.programEntries).set({ outcome, rank, outcomeNote: `Revisit on ${on}` }).where(eq(s.programEntries.id, r.e.id));
          if (r.c.stage === "scout") {
            await tx
              .update(s.creators)
              .set({ previousStage: r.c.stage, stage: "revisit", stageChangedAt: new Date(), revisitOn: on, stageReason: `Program: revisit band in “${ch.title}”` })
              .where(eq(s.creators.id, r.c.id));
          }
        } else {
          await tx.update(s.programEntries).set({ outcome: "pass", rank, outcomeNote: PASS_NOTE }).where(eq(s.programEntries.id, r.e.id));
        }
      }
    });
    done();
    revalidatePath("/creators");
    return ok(`Routed: ${count.tier0} to Tier 0 · ${count.revisit} revisit · ${count.pass} pass`);
  });
}

const PLATFORM_DELIVERABLE: Record<string, string> = { instagram: "ig_reel_dedicated", youtube: "yt_integration", x: "x_thread", linkedin: "linkedin_post" };
const CommissionSchema = z.object({ entryId: uuid, note: optText });

/** The brand picks one entry from its top ten: a paid lead at the T0 rung, through Crew. */
export async function brandCommission(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("commission");
    const input = parseInput(CommissionSchema, Object.fromEntries(fd));
    const cfg = await getConfig();
    const [row] = await db
      .select({ e: s.programEntries, ch: s.programChallenges, c: s.creators })
      .from(s.programEntries)
      .innerJoin(s.programChallenges, eq(s.programChallenges.id, s.programEntries.challengeId))
      .innerJoin(s.creators, eq(s.creators.id, s.programEntries.creatorId))
      .where(eq(s.programEntries.id, input.entryId));
    if (!row) return fail("Entry not found");
    const all = await db.select({ rank: s.programEntries.rank, outcome: s.programEntries.outcome }).from(s.programEntries).where(and(eq(s.programEntries.challengeId, row.ch.id), isNull(s.programEntries.archivedAt)));
    const g = canCommissionEntry(row.e, all, row.ch);
    if (!g.ok) return fail(g.reasons[0]);
    const deliverableKey = PLATFORM_DELIVERABLE[row.e.declaredPlatform ?? row.c.primaryPlatform] ?? "ig_reel_dedicated";
    const [own] = await db
      .select()
      .from(s.creatorStandardRates)
      .where(and(eq(s.creatorStandardRates.creatorId, row.c.id), eq(s.creatorStandardRates.deliverableKey, deliverableKey), isNull(s.creatorStandardRates.archivedAt)));
    const std = resolveStandard(cfg, { ownStandardPaise: own?.standardPaise ?? null, deliverableKey, tier: "T0" });
    const total = computeLine(cfg, { standardPaise: std.standardPaise, qty: 1, rung: "standard", addons: [] });
    const dealId = await withUser(me.id, async (tx) => {
      const [deal] = await tx
        .insert(s.deals)
        .values({
          brandId: row.ch.brandId!,
          title: `${row.c.displayName} — ${row.ch.title}`,
          ownerUserId: me.id,
          stage: "lead",
          origin: "crew_originated",
          commissionPct: commissionPct(cfg, "crew_originated"),
          quotedTotalPaise: total,
          ladderVersionId: cfg.ladderVersionId,
          briefMd: row.ch.briefMd,
          createdBy: me.id,
        })
        .returning({ id: s.deals.id });
      await tx.insert(s.dealCreators).values({ dealId: deal.id, creatorId: row.c.id, role: "primary", status: "proposed", createdBy: me.id });
      await tx.insert(s.dealQuoteLines).values({
        dealId: deal.id,
        creatorId: row.c.id,
        deliverableKey,
        qty: 1,
        standardPaise: std.standardPaise,
        standardIsDefault: std.isDefault,
        rung: "standard",
        lineTotalPaise: total,
        note: "Program brand commission at the T0 rung",
        createdBy: me.id,
      });
      await tx.insert(s.dealActivity).values({ dealId: deal.id, by: me.id, kind: "note", bodyMd: `Commissioned from the 48-hour challenge “${row.ch.title}”.${input.note ? ` ${input.note}` : ""}` });
      if (row.c.stage !== "roster") {
        await tx.insert(s.dealOverrides).values({ dealId: deal.id, kind: "tier0_in_deal", requestedBy: me.id, reason: "Program brand commission — Tier 0 creator at the T0 rung", createdBy: me.id });
      }
      await tx
        .update(s.programEntries)
        .set({ outcome: "brand_commission", dealId: deal.id, outcomeNote: `Commissioned by the brand${row.e.outcome ? ` · routed ${row.e.outcome}` : ""}${input.note ? ` · ${input.note}` : ""}` })
        .where(eq(s.programEntries.id, row.e.id));
      return deal.id;
    });
    done();
    revalidatePath("/deals");
    return ok("Lead created at the T0 rung", { redirect: `/deals/${dealId}` });
  });
}

// ---------- Sunday shoots ----------

const ShootSchema = z.object({
  id: uuid.optional().or(z.literal("").transform(() => undefined)),
  cohortId: uuid,
  date: isoDate,
  location: z.string().trim().min(1, "Location missing"),
  crewLeadUserId: z.string().optional().transform((v) => (v ? v : null)),
  notesMd: optText,
});

export async function saveShoot(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("shoot");
    const input = parseInput(ShootSchema, Object.fromEntries(fd));
    const creatorIds = [...new Set(fd.getAll("creators").map(String).filter(Boolean))];
    parseInput(z.array(uuid), creatorIds);
    if (!creatorIds.length) return fail("Pick at least one creator");
    const title = `Sunday shoot · ${input.location}`;
    await withUser(me.id, async (tx) => {
      let shootId = input.id;
      if (shootId) {
        const [cur] = await tx.select().from(s.programSundayShoots).where(eq(s.programSundayShoots.id, shootId));
        if (!cur) throw new Error("Shoot not found");
        await tx
          .update(s.programSundayShoots)
          .set({ date: input.date, location: input.location, creators: creatorIds, attended: cur.attended.filter((a) => creatorIds.includes(a)), crewLeadUserId: input.crewLeadUserId, notesMd: input.notesMd, cohortId: cur.cohortId ?? input.cohortId })
          .where(eq(s.programSundayShoots.id, shootId));
      } else {
        const [row] = await tx
          .insert(s.programSundayShoots)
          .values({ cohortId: input.cohortId, date: input.date, location: input.location, creators: creatorIds, crewLeadUserId: input.crewLeadUserId, notesMd: input.notesMd, createdBy: me.id })
          .returning({ id: s.programSundayShoots.id });
        shootId = row.id;
      }
      // One calendar (§0.1 #17): each attendee gets a `shoot` item; removed attendees lose theirs.
      const items = await tx.select().from(s.creatorCalendarItems).where(and(eq(s.creatorCalendarItems.shootId, shootId), isNull(s.creatorCalendarItems.archivedAt)));
      for (const it of items) {
        if (!creatorIds.includes(it.creatorId)) await tx.update(s.creatorCalendarItems).set({ archivedAt: new Date() }).where(eq(s.creatorCalendarItems.id, it.id));
        else if (it.date !== input.date || it.title !== title) await tx.update(s.creatorCalendarItems).set({ date: input.date, title }).where(eq(s.creatorCalendarItems.id, it.id));
      }
      const have = new Set(items.map((i) => i.creatorId));
      const add = creatorIds.filter((c) => !have.has(c));
      if (add.length) {
        await tx.insert(s.creatorCalendarItems).values(
          add.map((creatorId) => ({ creatorId, date: input.date, kind: "shoot" as const, title, shootId, notes: input.notesMd, proposedByUserId: me.id, createdBy: me.id })),
        );
      }
    });
    done();
    revalidatePath("/creators", "layout");
    return ok(input.id ? "Shoot saved" : `Shoot scheduled for ${creatorIds.length}`);
  });
}

const AttendSchema = z.object({ shootId: uuid, creatorId: uuid, attended: z.enum(["1", "0"]) });

export async function setAttendance(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("shoot");
    const input = parseInput(AttendSchema, Object.fromEntries(fd));
    const [sh] = await db.select().from(s.programSundayShoots).where(eq(s.programSundayShoots.id, input.shootId));
    if (!sh) return fail("Shoot not found");
    const g = canMarkAttendance(sh, input.creatorId, todayISO());
    if (!g.ok) return fail(g.reasons[0]);
    const attended = input.attended === "1" ? [...new Set([...sh.attended, input.creatorId])] : sh.attended.filter((a) => a !== input.creatorId);
    await withUser(me.id, (tx) => tx.update(s.programSundayShoots).set({ attended }).where(eq(s.programSundayShoots.id, sh.id)));
    done();
    return ok(input.attended === "1" ? "Marked attended" : "Marked absent");
  });
}

// ---------- Interns ----------

const InternSchema = z.object({
  id: uuid.optional().or(z.literal("").transform(() => undefined)),
  cohortId: uuid,
  personName: z.string().trim().min(1, "Name missing"),
  email: z.union([z.literal(""), z.email("Email looks wrong")]).optional().transform((v) => (v ? v : null)),
  function: z.enum(s.internFunctionEnum.enumValues),
  startsOn: z.union([z.literal(""), isoDate]).optional().transform((v) => (v ? v : null)),
  endsOn: z.union([z.literal(""), isoDate]).optional().transform((v) => (v ? v : null)),
});

export async function saveIntern(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("intern");
    const input = parseInput(InternSchema, Object.fromEntries(fd));
    const existing = await db.select({ id: s.programInterns.id, function: s.programInterns.function }).from(s.programInterns).where(and(eq(s.programInterns.cohortId, input.cohortId), isNull(s.programInterns.archivedAt)));
    const g = canAddIntern(existing, input.function, input.id);
    if (!g.ok) return fail(g.reasons[0]);
    const values = { cohortId: input.cohortId, personName: input.personName, email: input.email, function: input.function, startsOn: input.startsOn, endsOn: input.endsOn };
    await withUser(me.id, async (tx) => {
      if (input.id) await tx.update(s.programInterns).set(values).where(eq(s.programInterns.id, input.id));
      else await tx.insert(s.programInterns).values({ ...values, createdBy: me.id });
    });
    done();
    return ok(input.id ? "Intern saved" : "Intern added");
  });
}

const ConvertSchema = z.object({
  internId: uuid,
  subCategory: z.enum(SUBS),
  platform: z.enum(PLATFORMS),
  consent: z.literal("on").optional(),
});

/** An intern who starts creating becomes a scout creator (source program). */
export async function convertIntern(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await programActor("intern");
    const input = parseInput(ConvertSchema, Object.fromEntries(fd));
    const [intern] = await db.select().from(s.programInterns).where(eq(s.programInterns.id, input.internId));
    if (!intern) return fail("Intern not found");
    if (intern.convertedToCreatorId) return fail("Already a creator");
    const creatorId = await withUser(me.id, async (tx) => {
      const [c] = await tx
        .insert(s.creators)
        .values({
          displayName: intern.personName,
          email: intern.email,
          stage: "scout",
          source: "program",
          sourceDetail: `Program intern (${intern.function.replace("_", " ")})`,
          subCategory: input.subCategory,
          primaryPlatform: input.platform,
          consentStatus: input.consent === "on" ? "opted_in" : "none",
          createdBy: me.id,
        })
        .returning({ id: s.creators.id });
      await tx.update(s.programInterns).set({ convertedToCreatorId: c.id }).where(eq(s.programInterns.id, intern.id));
      return c.id;
    });
    done();
    revalidatePath("/creators");
    void creatorId;
    return ok("Converted to a scout creator");
  });
}
