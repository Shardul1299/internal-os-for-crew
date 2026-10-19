"use server";
// Creator server actions (BRIEF §3.1, §4, §9, §10, §15 M1). Every write:
// Zod → actor(role) → lib/rules gate → withUser(tx) → revalidatePath.
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { and, eq, ilike, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { creatorFacts } from "@/lib/queries/facts";
import { existingHandles } from "@/lib/queries/creators";
import { ok, fail, guard, type ActionResult } from "./result";
import { canTransition, validateFilterScore, scoreTotal, stageEffects, canProposeTier, canApproveTier, canStartPartnership, partnershipDates, type Role } from "@/lib/rules/creators";
import {
  stageMoves,
  alumniEffects,
  canEditCreator,
  canCreateCreator,
  canScoreFilter,
  canEditSignals,
  canSetStandards,
  canEditContentPlan,
  canEditBlackouts,
  canProposeCalendarItem,
  canEditAgreement,
  canInviteToStudio,
  validateAnchorPlan,
  validateBlackout,
  filterContextFor,
  canStartPartnershipNow,
} from "@/lib/rules/creator-flow";
import { rosterCheckins, exitWindowCheckin } from "@/lib/rules/retention";
import { prepareImport, parseCsv, validateMapping, IMPORT_FIELDS, type Mapping } from "@/lib/rules/creator-import";
import { rupeesToPaise } from "@/lib/format";
import { addDays, today as todayISO } from "@/lib/dates";

// ---------- input helpers ----------
const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);
const text = z.preprocess(blank, z.string().trim().max(2000).nullable().optional());
const req = (label: string, max = 200) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);
const box = z.preprocess((v) => v === "on" || v === "true" || v === true || v === "1", z.boolean());
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const optDate = z.preprocess(blank, isoDate.nullable().optional());
const url = z.preprocess(
  blank,
  z
    .string()
    .trim()
    .max(500)
    .regex(/^https?:\/\//i, "Links start with http")
    .nullable()
    .optional(),
);
const uuid = z.string().uuid("Missing record");
const sub = z.enum(s.subCategoryEnum.enumValues, { error: "Pick a sub-category" });
const source = z.enum(s.creatorSourceEnum.enumValues, { error: "Pick a source" });
const platform = z.enum(s.platformEnum.enumValues, { error: "Pick a platform" });
const langs = z.preprocess(
  (v) =>
    typeof v === "string"
      ? v
          .split(/[,\s]+/)
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean)
      : v,
  z.array(z.string().max(24)).max(12),
);
const email = z.preprocess(
  blank,
  z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email looks wrong")
    .nullable()
    .optional(),
);

function form(fd: FormData) {
  return Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
}

function first(e: unknown): string {
  if (e instanceof z.ZodError) return e.issues[0]?.message ?? "Check the form";
  return e instanceof Error ? e.message : "Something went wrong";
}

function parse<T extends z.ZodType>(schema: T, fd: FormData): z.infer<T> {
  const r = schema.safeParse(form(fd));
  if (!r.success) throw new Error(first(r.error));
  return r.data;
}

function touch(id?: string) {
  revalidatePath("/creators");
  if (id) revalidatePath(`/creators/${id}`);
  revalidatePath("/today");
}

async function load(id: string) {
  const f = await creatorFacts(id);
  if (!f || f.creator.archivedAt) throw new Error("Creator not found");
  return f;
}

async function editable(id: string, role: string) {
  const f = await load(id);
  const g = canEditCreator(role, f.creator.stage);
  if (!g.ok) throw new Error(g.reasons[0]);
  return f;
}

// ---------- create / edit ----------
const NewCreator = z.object({
  displayName: req("Name", 120),
  subCategory: sub,
  source,
  sourceDetail: text,
  primaryPlatform: platform,
  handle: text,
  languages: langs,
  city: text,
  email,
  referredByCreatorId: z.preprocess(blank, uuid.nullable().optional()),
  consentStatus: z.enum(["none", "opted_in"]).default("none"),
});

export async function createCreator(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeCreators");
    const g = canCreateCreator(me.role);
    if (!g.ok) return fail(g.reasons[0]);
    const input = parse(NewCreator, fd);
    const handle = input.handle?.replace(/^@/, "").trim() || null;
    if (handle) {
      const dup = await db
        .select({ id: s.creatorPlatforms.creatorId })
        .from(s.creatorPlatforms)
        .where(and(eq(s.creatorPlatforms.platform, input.primaryPlatform), ilike(s.creatorPlatforms.handle, handle), isNull(s.creatorPlatforms.archivedAt)))
        .limit(1);
      if (dup.length) return fail("That handle is already on file");
    }
    if (input.source === "referral" && !input.referredByCreatorId) return fail("Pick who referred them");
    const id = await withUser(me.id, async (tx) => {
      const [row] = await tx
        .insert(s.creators)
        .values({
          displayName: input.displayName,
          subCategory: input.subCategory,
          source: input.source,
          sourceDetail: input.sourceDetail ?? null,
          primaryPlatform: input.primaryPlatform,
          languages: input.languages.length ? input.languages : ["en"],
          city: input.city ?? null,
          email: input.email ?? null,
          referredByCreatorId: input.referredByCreatorId ?? null,
          consentStatus: input.consentStatus,
          stage: "scout",
          stageChangedAt: new Date(),
          createdBy: me.id,
        })
        .returning({ id: s.creators.id });
      if (handle) await tx.insert(s.creatorPlatforms).values({ creatorId: row.id, platform: input.primaryPlatform, handle, isPrimary: true, createdBy: me.id });
      return row.id;
    });
    touch(id);
    return ok("Added to Scout", { undo: { entity: "creators", id }, redirect: `/creators/${id}` });
  });
}

const EditCreator = z.object({
  id: uuid,
  displayName: req("Name", 120),
  legalName: text,
  email,
  phone: text,
  city: text,
  country: text,
  subCategory: sub,
  secondarySubCategory: z.preprocess(blank, sub.nullable().optional()),
  primaryPlatform: platform,
  languages: langs,
  source,
  sourceDetail: text,
  referredByCreatorId: z.preprocess(blank, uuid.nullable().optional()),
  isEmployedElsewhere: box,
  employerDisclosureUrl: url,
  isFounder: box,
  ownProductContentPct: z.preprocess(blank, z.coerce.number().min(0, "0–100").max(100, "0–100").nullable().optional()),
  isPseudonymous: box,
  identityVerifiedPrivately: box,
  representedElsewhere: z.enum(["unknown", "yes", "no"]),
  representationNote: text,
  notes: text,
  ownerNote: text,
});

export async function updateCreator(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeCreators");
    const input = parse(EditCreator, fd);
    const { creator } = await editable(input.id, me.role);
    if (input.secondarySubCategory && input.secondarySubCategory === input.subCategory) return fail("Secondary sub-category repeats the first");
    await withUser(me.id, (tx) =>
      tx
        .update(s.creators)
        .set({
          displayName: input.displayName,
          legalName: input.legalName ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
          city: input.city ?? null,
          country: input.country ?? creator.country,
          subCategory: input.subCategory,
          secondarySubCategory: input.secondarySubCategory ?? null,
          primaryPlatform: input.primaryPlatform,
          languages: input.languages.length ? input.languages : creator.languages,
          source: input.source,
          sourceDetail: input.sourceDetail ?? null,
          referredByCreatorId: input.referredByCreatorId && input.referredByCreatorId !== input.id ? input.referredByCreatorId : null,
          isEmployedElsewhere: input.isEmployedElsewhere,
          employerDisclosureUrl: input.employerDisclosureUrl ?? null,
          isFounder: input.isFounder,
          ownProductContentPct: input.isFounder ? (input.ownProductContentPct ?? null) : null,
          isPseudonymous: input.isPseudonymous,
          identityVerifiedPrivately: input.isPseudonymous ? input.identityVerifiedPrivately : false,
          representedElsewhere: input.representedElsewhere === "unknown" ? null : input.representedElsewhere === "yes",
          representationNote: input.representationNote ?? null,
          notes: input.notes ?? null,
          // The Owner note satisfies the Program top-N gate (§4); only the Owner writes it.
          ...(me.role === "owner" && fd.has("ownerNote") ? { stageReason: input.ownerNote ?? null } : {}),
        })
        .where(eq(s.creators.id, input.id)),
    );
    touch(input.id);
    return ok("Saved", { undo: { entity: "creators", id: input.id } });
  });
}

const Consent = z.object({ id: uuid, consentStatus: z.enum(s.consentEnum.enumValues) });

/** Consent withdrawn → Studio access ends (§4 Studio access). */
export async function setConsent(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeCreators");
    const input = parse(Consent, fd);
    await editable(input.id, me.role);
    await withUser(me.id, async (tx) => {
      await tx.update(s.creators).set({ consentStatus: input.consentStatus }).where(eq(s.creators.id, input.id));
      if (input.consentStatus === "withdrawn") {
        // BRIEF: clarify — §4 also exports the creator's Studio data to them before archiving; the export lives with Studio.
        await tx
          .update(s.users)
          .set({ active: false })
          .where(and(eq(s.users.creatorId, input.id), eq(s.users.role, "creator_user")));
      }
    });
    touch(input.id);
    return ok(input.consentStatus === "withdrawn" ? "Consent withdrawn · Studio access ended" : "Consent saved");
  });
}

// ---------- stage machine (§4) ----------
const Move = z.object({
  id: uuid,
  move: z.enum(["watchlist", "incubation", "propose_roster", "approve_roster", "reject_roster", "revisit", "declined", "alumni", "return_roster"]),
  reason: text,
});

export async function moveStage(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    const input = parse(Move, fd);
    return runMove(me, input.id, input.move, input.reason ?? null);
  });
}

/** For the stage pill (MenuPill passes a value, not a form). */
export async function moveStageTo(id: string, move: string, reason?: string | null): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    const input = Move.parse({ id, move, reason: reason ?? "" });
    return runMove(me, input.id, input.move, input.reason ?? null);
  });
}

async function runMove(me: { id: string; role: string }, id: string, key: z.infer<typeof Move>["move"], reason: string | null): Promise<ActionResult> {
  const cfg = await getConfig();
  const today = todayISO();
  const { creator, facts } = await load(id);
  const rosterProposed = !!creator.rosterProposedAt && !creator.rosterApprovedBy;
  const move = stageMoves(cfg, facts, { role: me.role as Role, today, rosterProposed }).find((m) => m.key === key);
  if (!move) return fail("Not a move from this stage");
  if (move.reasons.length) return fail(move.reasons[0]);
  if (move.needsReason && !reason?.trim()) return fail("Reason required");

  const now = new Date();
  const stageSet = (stage: (typeof s.creatorStageEnum.enumValues)[number]) => ({ stage, previousStage: creator.stage, stageChangedAt: now, stageReason: reason ?? null });

  switch (key) {
    case "watchlist": {
      // Keep an Owner note (the Program top-N gate) unless a new reason is given.
      await withUser(me.id, (tx) =>
        tx
          .update(s.creators)
          .set({ ...stageSet("watchlist"), stageReason: reason ?? creator.stageReason })
          .where(eq(s.creators.id, id)),
      );
      touch(id);
      return ok("Moved to Watchlist", { undo: { entity: "creators", id } });
    }
    case "incubation": {
      const fx = stageEffects(cfg, "incubation", today) as { tier: "T0"; firstLookUntil: string };
      await withUser(me.id, (tx) =>
        tx
          .update(s.creators)
          .set({ ...stageSet("incubation"), tier: fx.tier, firstLookUntil: fx.firstLookUntil, tierReviewedAt: now, tierApprovedBy: me.id, tierProposed: null, tierProposedBy: null })
          .where(eq(s.creators.id, id)),
      );
      touch(id);
      return ok("Moved to Incubation · Tier 0", { undo: { entity: "creators", id } });
    }
    case "propose_roster": {
      await withUser(me.id, (tx) => tx.update(s.creators).set({ rosterProposedAt: now, rosterProposedBy: me.id }).where(eq(s.creators.id, id)));
      touch(id);
      return ok("Proposed to roster · awaiting the Owner", { undo: { entity: "creators", id } });
    }
    case "reject_roster": {
      await withUser(me.id, (tx) => tx.update(s.creators).set({ rosterProposedAt: null, rosterProposedBy: null, stageReason: reason }).where(eq(s.creators.id, id)));
      touch(id);
      return ok("Roster proposal rejected", { undo: { entity: "creators", id } });
    }
    case "approve_roster":
    case "return_roster": {
      // Re-check through the §4 gate with the Owner's approval (approve) or the alumni return gate.
      const g =
        key === "approve_roster"
          ? canTransition(cfg, facts, "roster", { role: me.role as Role, today, ownerApproval: true })
          : canTransition(cfg, facts, "return_roster", { role: me.role as Role, today });
      if (!g.ok) return fail(g.reasons[0]);
      const fx = stageEffects(cfg, "roster", today) as { agreement: { status: "pilot"; pilotStartedOn: string; pilotEndsOn: string; exclusive: boolean } };
      const plan = rosterCheckins(cfg, today, fx.agreement.pilotEndsOn);
      await withUser(me.id, async (tx) => {
        await tx
          .update(s.creators)
          .set({ ...stageSet("roster"), rosterApprovedBy: me.id, rosterProposedAt: creator.rosterProposedAt ?? now, rosterProposedBy: creator.rosterProposedBy ?? me.id, alumniReason: null })
          .where(eq(s.creators.id, id));
        // BRIEF: clarify — a returning alumnus starts a fresh 90-day pilot (same effects as first roster entry).
        await tx
          .insert(s.creatorAgreements)
          .values({ creatorId: id, ...fx.agreement, createdBy: me.id })
          .onConflictDoUpdate({
            target: s.creatorAgreements.creatorId,
            set: { ...fx.agreement, partnershipStartedOn: null, partnershipEndsOn: null, exitWindowAt: null, archivedAt: null },
          });
        // Clear stale unheld check-ins, then schedule four quarterlies, the strategy refresh and the pilot-end review (§9).
        await tx
          .update(s.creatorCheckins)
          .set({ archivedAt: now })
          .where(and(eq(s.creatorCheckins.creatorId, id), isNull(s.creatorCheckins.heldOn), isNull(s.creatorCheckins.archivedAt)));
        await tx.insert(s.creatorCheckins).values(plan.map((p) => ({ creatorId: id, type: p.type, dueOn: p.dueOn, createdBy: me.id })));
      });
      touch(id);
      return ok(key === "approve_roster" ? "Approved to Roster · pilot started" : "Returned to Roster · pilot started");
    }
    case "revisit": {
      const fx = stageEffects(cfg, "revisit", today) as { revisitOn: string };
      await withUser(me.id, (tx) =>
        tx
          .update(s.creators)
          .set({ ...stageSet("revisit"), revisitOn: fx.revisitOn, rosterProposedAt: null, rosterProposedBy: null })
          .where(eq(s.creators.id, id)),
      );
      touch(id);
      return ok(`Revisit on ${fx.revisitOn}`, { undo: { entity: "creators", id } });
    }
    case "declined": {
      await withUser(me.id, (tx) =>
        tx
          .update(s.creators)
          .set({ ...stageSet("declined"), rosterProposedAt: null, rosterProposedBy: null })
          .where(eq(s.creators.id, id)),
      );
      touch(id);
      return ok("Declined", { undo: { entity: "creators", id } });
    }
    case "alumni": {
      const fx = alumniEffects();
      await withUser(me.id, async (tx) => {
        await tx
          .update(s.creators)
          .set({ ...stageSet("alumni"), alumniReason: reason })
          .where(eq(s.creators.id, id));
        await tx.update(s.creatorAgreements).set(fx.agreement).where(eq(s.creatorAgreements.creatorId, id));
        await tx
          .update(s.creatorCheckins)
          .set({ archivedAt: now })
          .where(and(eq(s.creatorCheckins.creatorId, id), isNull(s.creatorCheckins.heldOn), isNull(s.creatorCheckins.archivedAt)));
      });
      touch(id);
      return ok("Moved to Alumni · exclusivity ended");
    }
  }
}

// ---------- the Filter (§0.1 #2, §12.5) ----------
const Score = z.object({
  id: uuid,
  aesthetics: z.coerce.number({ error: "Score aesthetics" }),
  taste: z.coerce.number({ error: "Score taste" }),
  personality: z.coerce.number({ error: "Score personality" }),
  sentence: z.string().default(""),
  context: z.preprocess(blank, z.enum(s.filterContextEnum.enumValues).nullable().optional()),
});

export async function addFilterScore(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeCreators");
    const g0 = canScoreFilter(me.role);
    if (!g0.ok) return fail(g0.reasons[0]);
    const input = parse(Score, fd);
    const { creator } = await editable(input.id, me.role);
    const v = validateFilterScore(input);
    if (!v.ok) return fail(v.reasons[0]);
    const total = scoreTotal(input.aesthetics, input.taste, input.personality);
    await withUser(me.id, (tx) =>
      tx.insert(s.creatorFilterScores).values({
        creatorId: input.id,
        aesthetics: input.aesthetics,
        taste: input.taste,
        personality: input.personality,
        total,
        sentence: input.sentence.trim(),
        context: input.context ?? filterContextFor(creator.stage),
        scoredBy: me.id,
        createdBy: me.id,
      }),
    );
    touch(input.id);
    return ok(`Scored ${total}/15`);
  });
}

// ---------- tier (§0.1 #6): Crew lead proposes with signals, Owner approves ----------
const ProposeTier = z.object({ id: uuid, tier: z.enum(s.tierEnum.enumValues, { error: "Pick a tier" }) });

export async function proposeTier(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("tier");
    const input = parse(ProposeTier, fd);
    const { facts } = await load(input.id);
    const g = canProposeTier({ role: me.role as Role }, facts.tierSignalCount, input.tier);
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, (tx) => tx.update(s.creators).set({ tierProposed: input.tier, tierProposedBy: me.id }).where(eq(s.creators.id, input.id)));
    touch(input.id);
    return ok(`Proposed ${input.tier} · awaiting the Owner`, { undo: { entity: "creators", id: input.id } });
  });
}

const Decide = z.object({ id: uuid, decision: z.enum(["approve", "reject"]) });

export async function decideTier(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("tier");
    const input = parse(Decide, fd);
    const cfg = await getConfig();
    const { creator, facts } = await load(input.id);
    const g = canApproveTier({ role: me.role as Role }, { tier: creator.tierProposed, signalCount: facts.tierSignalCount });
    if (input.decision === "reject") {
      if (me.role !== "owner") return fail("Only the Owner approves tier changes");
      if (!creator.tierProposed) return fail("No tier proposed");
      await withUser(me.id, (tx) => tx.update(s.creators).set({ tierProposed: null, tierProposedBy: null }).where(eq(s.creators.id, input.id)));
      touch(input.id);
      return ok("Tier proposal rejected", { undo: { entity: "creators", id: input.id } });
    }
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, (tx) =>
      tx
        .update(s.creators)
        .set({ tier: creator.tierProposed, tierApprovedBy: me.id, tierReviewedAt: new Date(), tierNextReviewAt: addDays(todayISO(), cfg.n.checkin_cadence_days), tierProposed: null })
        .where(eq(s.creators.id, input.id)),
    );
    touch(input.id);
    return ok(`Tier set to ${creator.tierProposed}`, { undo: { entity: "creators", id: input.id } });
  });
}

// ---------- signals and evidence ----------
const Signal = z.object({
  id: uuid,
  kind: z.enum(s.tierSignalKindEnum.enumValues, { error: "Pick a kind" }),
  description: req("Description", 300),
  url,
  date: optDate,
  weight: z.coerce.number().int().min(1).max(3).default(1),
});

export async function addSignal(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("tier");
    const g = canEditSignals(me.role);
    if (!g.ok) return fail(g.reasons[0]);
    const input = parse(Signal, fd);
    await load(input.id);
    await withUser(me.id, (tx) =>
      tx
        .insert(s.creatorTierSignals)
        .values({ creatorId: input.id, kind: input.kind, description: input.description, url: input.url ?? null, date: input.date ?? todayISO(), weight: input.weight, createdBy: me.id }),
    );
    touch(input.id);
    return ok("Signal recorded");
  });
}

const RowRef = z.object({ id: uuid, rowId: uuid });

export async function removeSignal(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("tier");
    const g = canEditSignals(me.role);
    if (!g.ok) return fail(g.reasons[0]);
    const input = parse(RowRef, fd);
    await withUser(me.id, (tx) =>
      tx
        .update(s.creatorTierSignals)
        .set({ archivedAt: new Date() })
        .where(and(eq(s.creatorTierSignals.id, input.rowId), eq(s.creatorTierSignals.creatorId, input.id))),
    );
    touch(input.id);
    return ok("Signal removed");
  });
}

const Evidence = z.object({ id: uuid, kind: z.enum(s.evidenceKindEnum.enumValues, { error: "Pick a kind" }), title: req("Title", 200), url, date: optDate });

export async function addEvidence(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeCreators");
    const input = parse(Evidence, fd);
    await editable(input.id, me.role);
    await withUser(me.id, (tx) =>
      tx.insert(s.creatorEvidence).values({ creatorId: input.id, kind: input.kind, title: input.title, url: input.url ?? null, date: input.date ?? null, createdBy: me.id }),
    );
    touch(input.id);
    return ok("Evidence added");
  });
}

export async function removeEvidence(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeCreators");
    const input = parse(RowRef, fd);
    await editable(input.id, me.role);
    await withUser(me.id, (tx) =>
      tx
        .update(s.creatorEvidence)
        .set({ archivedAt: new Date() })
        .where(and(eq(s.creatorEvidence.id, input.rowId), eq(s.creatorEvidence.creatorId, input.id))),
    );
    touch(input.id);
    return ok("Evidence removed");
  });
}

// ---------- Standards (§3.1, §5.3) ----------
const Standard = z.object({
  id: uuid,
  deliverableKey: req("Deliverable"),
  rupees: z.preprocess(blank, z.string({ error: "Enter a Standard in rupees" })),
  note: text,
});

export async function upsertStandard(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeMoney");
    const g = canSetStandards(me.role);
    if (!g.ok) return fail(g.reasons[0]);
    const input = parse(Standard, fd);
    const cfg = await getConfig();
    if (!cfg.deliverables.some((d) => d.key === input.deliverableKey)) return fail("Unknown deliverable");
    const paise = rupeesToPaise(input.rupees);
    if (paise <= 0) return fail("Standard must be more than ₹0");
    await load(input.id);
    await withUser(me.id, (tx) =>
      tx
        .insert(s.creatorStandardRates)
        .values({ creatorId: input.id, deliverableKey: input.deliverableKey, standardPaise: paise, currency: "INR", setBy: me.id, note: input.note ?? null, createdBy: me.id })
        .onConflictDoUpdate({
          target: [s.creatorStandardRates.creatorId, s.creatorStandardRates.deliverableKey, s.creatorStandardRates.currency],
          set: { standardPaise: paise, setAt: new Date(), setBy: me.id, note: input.note ?? null, archivedAt: null },
        }),
    );
    touch(input.id);
    return ok("Standard saved");
  });
}

const StdRef = z.object({ id: uuid, deliverableKey: req("Deliverable") });

export async function clearStandard(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeMoney");
    const g = canSetStandards(me.role);
    if (!g.ok) return fail(g.reasons[0]);
    const input = parse(StdRef, fd);
    await withUser(me.id, (tx) =>
      tx
        .update(s.creatorStandardRates)
        .set({ archivedAt: new Date() })
        .where(and(eq(s.creatorStandardRates.creatorId, input.id), eq(s.creatorStandardRates.deliverableKey, input.deliverableKey))),
    );
    touch(input.id);
    return ok("Standard cleared · default applies");
  });
}

// ---------- content plan: topic filters, anchor plan, blackouts, proposed items ----------
const Topic = z.object({ id: uuid, kind: z.enum(s.topicFilterKindEnum.enumValues), value: req("Value", 120), reason: text });

export async function addTopicFilter(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    const g = canEditContentPlan(me.role);
    if (!g.ok) return fail(g.reasons[0]);
    const input = parse(Topic, fd);
    await load(input.id);
    const [row] = await withUser(me.id, (tx) =>
      tx
        .insert(s.creatorTopicFilters)
        .values({ creatorId: input.id, kind: input.kind, value: input.value, reason: input.reason ?? null, active: true, createdBy: me.id })
        .returning({ id: s.creatorTopicFilters.id }),
    );
    touch(input.id);
    return ok("Topic filter added", { undo: { entity: "creator_topic_filters", id: row.id } });
  });
}

const TopicToggle = z.object({ id: uuid, rowId: uuid, active: box });

export async function setTopicFilterActive(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    const g = canEditContentPlan(me.role);
    if (!g.ok) return fail(g.reasons[0]);
    const input = parse(TopicToggle, fd);
    await withUser(me.id, (tx) =>
      tx
        .update(s.creatorTopicFilters)
        .set({ active: input.active })
        .where(and(eq(s.creatorTopicFilters.id, input.rowId), eq(s.creatorTopicFilters.creatorId, input.id))),
    );
    touch(input.id);
    return ok(input.active ? "Topic filter on" : "Topic filter off", { undo: { entity: "creator_topic_filters", id: input.rowId } });
  });
}

const Anchor = z.object({ id: uuid, anchorFormat: z.string().trim().max(200).default(""), cadenceNote: text, sponsoredPct: z.coerce.number({ error: "Enter a percentage" }) });

export async function saveAnchorPlan(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    const g0 = canEditContentPlan(me.role);
    if (!g0.ok) return fail(g0.reasons[0]);
    const input = parse(Anchor, fd);
    const cfg = await getConfig();
    const ratio = Math.round(input.sponsoredPct * 100) / 10000;
    const g = validateAnchorPlan(cfg, { anchorFormat: input.anchorFormat, sponsoredRatioMax: ratio });
    if (!g.ok) return fail(g.reasons[0]);
    await load(input.id);
    await withUser(me.id, (tx) =>
      tx
        .insert(s.creatorAnchorPlans)
        .values({ creatorId: input.id, anchorFormat: input.anchorFormat, cadenceNote: input.cadenceNote ?? null, sponsoredRatioMax: ratio, createdBy: me.id })
        .onConflictDoUpdate({ target: s.creatorAnchorPlans.creatorId, set: { anchorFormat: input.anchorFormat, cadenceNote: input.cadenceNote ?? null, sponsoredRatioMax: ratio } }),
    );
    touch(input.id);
    return ok("Anchor plan saved");
  });
}

const Blackout = z.object({ id: uuid, startsOn: isoDate, endsOn: isoDate, note: text });

export async function addBlackout(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    const g0 = canEditBlackouts(me.role);
    if (!g0.ok) return fail(g0.reasons[0]);
    const input = parse(Blackout, fd);
    const g = validateBlackout(input);
    if (!g.ok) return fail(g.reasons[0]);
    await load(input.id);
    const [row] = await withUser(me.id, (tx) =>
      tx
        .insert(s.creatorBlackouts)
        .values({ creatorId: input.id, startsOn: input.startsOn, endsOn: input.endsOn, note: input.note ?? null, createdBy: me.id })
        .returning({ id: s.creatorBlackouts.id }),
    );
    touch(input.id);
    return ok("Blackout added", { undo: { entity: "creator_blackouts", id: row.id } });
  });
}

export async function removeBlackout(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    const g0 = canEditBlackouts(me.role);
    if (!g0.ok) return fail(g0.reasons[0]);
    const input = parse(RowRef, fd);
    await withUser(me.id, (tx) =>
      tx
        .update(s.creatorBlackouts)
        .set({ archivedAt: new Date() })
        .where(and(eq(s.creatorBlackouts.id, input.rowId), eq(s.creatorBlackouts.creatorId, input.id))),
    );
    touch(input.id);
    return ok("Blackout removed", { undo: { entity: "creator_blackouts", id: input.rowId } });
  });
}

const Proposed = z.object({
  id: uuid,
  date: isoDate,
  kind: z.enum(["anchor", "derivative", "organic", "shoot"]),
  title: req("Title", 160),
  pillar: z.enum(s.pillarEnum.enumValues).default("authority"),
  platform: platform.default("instagram"),
  notes: text,
});

/** Crew proposes; the creator keeps or removes it in Studio (§19.3). */
export async function proposeCalendarItem(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("calendars");
    const input = parse(Proposed, fd);
    const g = canProposeCalendarItem(me.role, input.kind);
    if (!g.ok) return fail(g.reasons[0]);
    await load(input.id);
    const [row] = await withUser(me.id, (tx) =>
      tx
        .insert(s.creatorCalendarItems)
        .values({
          creatorId: input.id,
          date: input.date,
          kind: input.kind,
          title: input.title,
          pillar: input.pillar,
          platform: input.platform,
          notes: input.notes ?? null,
          studioStatus: "idea",
          proposedByUserId: me.id,
          createdBy: me.id,
        })
        .returning({ id: s.creatorCalendarItems.id }),
    );
    touch(input.id);
    return ok("Proposed · the creator decides", { undo: { entity: "creator_calendar_items", id: row.id } });
  });
}

export async function withdrawCalendarItem(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("calendars");
    const input = parse(RowRef, fd);
    const [item] = await db
      .select()
      .from(s.creatorCalendarItems)
      .where(and(eq(s.creatorCalendarItems.id, input.rowId), eq(s.creatorCalendarItems.creatorId, input.id)));
    if (!item) return fail("Item not found");
    const g = canProposeCalendarItem(me.role, item.kind);
    if (!g.ok) return fail(g.reasons[0]);
    if (!item.proposedByUserId) return fail("Only Crew proposals can be withdrawn");
    if (item.studioStatus !== "idea") return fail("The creator has started this item");
    await withUser(me.id, (tx) => tx.update(s.creatorCalendarItems).set({ archivedAt: new Date() }).where(eq(s.creatorCalendarItems.id, item.id)));
    touch(input.id);
    return ok("Proposal withdrawn", { undo: { entity: "creator_calendar_items", id: item.id } });
  });
}

// ---------- platforms (followers are grey metadata only) ----------
const Platform = z.object({
  id: uuid,
  platform,
  handle: req("Handle", 120),
  url,
  followers: z.preprocess(blank, z.coerce.number().int().min(0).nullable().optional()),
  isPrimary: box,
});

export async function addPlatform(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeCreators");
    const input = parse(Platform, fd);
    await editable(input.id, me.role);
    const handle = input.handle.replace(/^@/, "");
    const dup = await db
      .select({ c: s.creatorPlatforms.creatorId })
      .from(s.creatorPlatforms)
      .where(and(eq(s.creatorPlatforms.platform, input.platform), ilike(s.creatorPlatforms.handle, handle), isNull(s.creatorPlatforms.archivedAt)))
      .limit(1);
    if (dup.length) return fail(dup[0].c === input.id ? "Already listed" : "That handle belongs to another creator");
    await withUser(me.id, async (tx) => {
      if (input.isPrimary) {
        await tx.update(s.creatorPlatforms).set({ isPrimary: false }).where(eq(s.creatorPlatforms.creatorId, input.id));
        await tx.update(s.creators).set({ primaryPlatform: input.platform }).where(eq(s.creators.id, input.id));
      }
      await tx.insert(s.creatorPlatforms).values({
        creatorId: input.id,
        platform: input.platform,
        handle,
        url: input.url ?? null,
        followers: input.followers ?? null,
        followersAsOf: input.followers != null ? todayISO() : null,
        isPrimary: input.isPrimary,
        createdBy: me.id,
      });
    });
    touch(input.id);
    return ok("Platform added");
  });
}

const PlatformRef = z.object({ id: uuid, rowId: uuid, op: z.enum(["primary", "remove"]) });

export async function editPlatform(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeCreators");
    const input = parse(PlatformRef, fd);
    await editable(input.id, me.role);
    const [p] = await db
      .select()
      .from(s.creatorPlatforms)
      .where(and(eq(s.creatorPlatforms.id, input.rowId), eq(s.creatorPlatforms.creatorId, input.id)));
    if (!p) return fail("Platform not found");
    await withUser(me.id, async (tx) => {
      if (input.op === "primary") {
        await tx.update(s.creatorPlatforms).set({ isPrimary: false }).where(eq(s.creatorPlatforms.creatorId, input.id));
        await tx.update(s.creatorPlatforms).set({ isPrimary: true }).where(eq(s.creatorPlatforms.id, p.id));
        await tx.update(s.creators).set({ primaryPlatform: p.platform }).where(eq(s.creators.id, input.id));
      } else {
        await tx.update(s.creatorPlatforms).set({ archivedAt: new Date(), isPrimary: false }).where(eq(s.creatorPlatforms.id, p.id));
      }
    });
    touch(input.id);
    return ok(input.op === "primary" ? "Primary platform set" : "Platform removed");
  });
}

// ---------- agreement (§3.1, §4 roster pilot → partnership) ----------
const Agreement = z.object({
  id: uuid,
  pilotStartedOn: optDate,
  pilotEndsOn: optDate,
  partnershipStartedOn: optDate,
  partnershipEndsOn: optDate,
  exitWindowAt: optDate,
  exitThresholdMd: text,
  exclusive: box,
  agreementUrl: url,
  status: z.enum(s.agreementStatusEnum.enumValues),
});

export async function saveAgreement(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor();
    const g = canEditAgreement(me.role);
    if (!g.ok) return fail(g.reasons[0]);
    const input = parse(Agreement, fd);
    const { creator } = await load(input.id);
    if (creator.stage !== "roster" && creator.stage !== "alumni") return fail("Agreements start at Roster");
    // Crew is the exclusive seller for roster creators (§0.1 #4): exclusivity stays on while on the roster.
    if (creator.stage === "roster" && !input.exclusive) return fail("Roster agreements are exclusive");
    if (input.pilotStartedOn && input.pilotEndsOn && input.pilotEndsOn < input.pilotStartedOn) return fail("Pilot ends before it starts");
    if (input.partnershipStartedOn && input.partnershipEndsOn && input.partnershipEndsOn < input.partnershipStartedOn) return fail("Partnership ends before it starts");
    // Only the Owner moves an agreement into partnership (§4).
    const [current] = await db.select().from(s.creatorAgreements).where(eq(s.creatorAgreements.creatorId, input.id));
    if ((current?.status ?? "pilot") === "pilot" && input.status === "active") return fail("Use Start partnership: it needs the Filter re-score and the Owner");
    const { id, ...vals } = input;
    const row = {
      pilotStartedOn: vals.pilotStartedOn ?? null,
      pilotEndsOn: vals.pilotEndsOn ?? null,
      partnershipStartedOn: vals.partnershipStartedOn ?? null,
      partnershipEndsOn: vals.partnershipEndsOn ?? null,
      exitWindowAt: vals.exitWindowAt ?? null,
      exitThresholdMd: vals.exitThresholdMd ?? null,
      exclusive: vals.exclusive,
      agreementUrl: vals.agreementUrl ?? null,
      status: vals.status,
    };
    await withUser(me.id, (tx) =>
      tx
        .insert(s.creatorAgreements)
        .values({ creatorId: id, ...row, createdBy: me.id })
        .onConflictDoUpdate({ target: s.creatorAgreements.creatorId, set: row }),
    );
    touch(id);
    return ok("Agreement saved");
  });
}

const IdOnly = z.object({ id: uuid });

/** roster pilot → partnership: Filter re-score + Owner approval → 24 months, exit window at +12 (§4). */
export async function startPartnership(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("approve");
    const input = parse(IdOnly, fd);
    const cfg = await getConfig();
    const today = todayISO();
    const { facts } = await load(input.id);
    const g = canStartPartnershipNow(canStartPartnership(cfg, facts, { role: me.role as Role, today }), facts.pilotEndsOn ?? null, today);
    if (!g.ok) return fail(g.reasons[0]);
    const dates = partnershipDates(cfg, today);
    const review = exitWindowCheckin(dates.exitWindowAt);
    await withUser(me.id, async (tx) => {
      await tx
        .update(s.creatorAgreements)
        .set({ ...dates, status: "active", exclusive: true })
        .where(eq(s.creatorAgreements.creatorId, input.id));
      await tx.insert(s.creatorCheckins).values({ creatorId: input.id, type: review.type, dueOn: review.dueOn, createdBy: me.id });
    });
    touch(input.id);
    return ok(`Partnership started · exit window ${dates.exitWindowAt}`);
  });
}

// ---------- Studio invitation (§4 Studio access) ----------
export async function inviteToStudio(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeCreators");
    const input = parse(IdOnly, fd);
    const { creator } = await load(input.id);
    const [existing] = await db.select().from(s.users).where(eq(s.users.creatorId, input.id)).limit(1);
    const g = canInviteToStudio({ role: me.role, stage: creator.stage, consentStatus: creator.consentStatus, email: creator.email, hasActiveUser: !!existing?.active });
    if (!g.ok) return fail(g.reasons[0]);
    const emailAddr = creator.email!.trim().toLowerCase();
    const [byEmail] = await db.select().from(s.users).where(eq(s.users.email, emailAddr)).limit(1);
    if (byEmail && byEmail.creatorId !== input.id) return fail("That email belongs to another account");
    await withUser(me.id, async (tx) => {
      if (existing) await tx.update(s.users).set({ active: true, email: emailAddr, role: "creator_user" }).where(eq(s.users.id, existing.id));
      else await tx.insert(s.users).values({ email: emailAddr, name: creator.displayName, role: "creator_user", creatorId: input.id, active: true });
    });
    touch(input.id);
    return ok(`Invited ${emailAddr} to Studio`);
  });
}

// ---------- CSV import of the pipeline document (§15 M1) ----------
const Import = z.object({
  csv: z.string().min(1, "Paste or upload a CSV").max(2_000_000, "File is too large"),
  mapping: z.string(),
  defaultSource: z.preprocess(blank, source.nullable().optional()),
  defaultSubCategory: z.preprocess(blank, sub.nullable().optional()),
  defaultPlatform: platform.default("instagram"),
});

export async function importCreatorsCsv(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeCreators");
    const g0 = canCreateCreator(me.role);
    if (!g0.ok) return fail(g0.reasons[0]);
    const input = parse(Import, fd);
    let mapping: Mapping;
    try {
      const raw = JSON.parse(input.mapping) as Record<string, unknown>;
      mapping = Object.fromEntries(Object.entries(raw).filter(([k, v]) => (IMPORT_FIELDS as readonly string[]).includes(k) && Number.isInteger(v))) as Mapping;
    } catch {
      return fail("Column mapping is unreadable");
    }
    const [header, ...rows] = parseCsv(input.csv);
    if (!header || !rows.length) return fail("No rows under the header");
    const mErr = validateMapping(mapping, header.length);
    if (mErr.length) return fail(mErr[0]);
    const cfg = await getConfig();
    const today = todayISO();
    const prepared = prepareImport(rows, mapping, { source: input.defaultSource ?? null, subCategory: input.defaultSubCategory ?? null, platform: input.defaultPlatform }, await existingHandles());
    const fresh = prepared.filter((r) => r.status === "new");
    let watchlisted = 0;
    let keptScout = 0;
    await withUser(me.id, async (tx) => {
      for (const r of fresh) {
        const scores = r.score ? [{ ...r.score, total: scoreTotal(r.score.aesthetics, r.score.taste, r.score.personality), scoredAt: today, context: "scout" }] : [];
        // Watchlist rows still pass the §4 gate: Filter ≥ threshold, consent, Crew lead.
        const toWatchlist =
          r.wantsWatchlist &&
          canTransition(
            cfg,
            {
              stage: "scout",
              source: r.source!,
              subCategory: r.subCategory,
              consentStatus: r.consent,
              representedElsewhere: null,
              isEmployedElsewhere: false,
              employerDisclosureUrl: null,
              isFounder: false,
              ownProductContentPct: null,
              filterScores: scores,
              tierSignalCount: 0,
              topicFilterCount: 0,
              hasAnchorPlan: false,
              programEntry: null,
            },
            "watchlist",
            { role: me.role as Role, today },
          ).ok;
        if (r.wantsWatchlist && !toWatchlist) keptScout++;
        if (toWatchlist) watchlisted++;
        const [row] = await tx
          .insert(s.creators)
          .values({
            displayName: r.name,
            subCategory: r.subCategory!,
            source: r.source!,
            sourceDetail: "CSV import",
            primaryPlatform: r.platform,
            city: r.city,
            notes: r.notes,
            consentStatus: r.consent,
            stage: toWatchlist ? "watchlist" : "scout",
            previousStage: toWatchlist ? "scout" : null,
            stageChangedAt: new Date(),
            createdBy: me.id,
          })
          .returning({ id: s.creators.id });
        await tx.insert(s.creatorPlatforms).values({ creatorId: row.id, platform: r.platform, handle: r.handle, isPrimary: true, createdBy: me.id });
        if (r.score && scores[0]) {
          await tx.insert(s.creatorFilterScores).values({
            creatorId: row.id,
            aesthetics: r.score.aesthetics,
            taste: r.score.taste,
            personality: r.score.personality,
            total: scores[0].total,
            sentence: r.score.sentence.trim(),
            context: "scout",
            scoredBy: me.id,
            createdBy: me.id,
          });
        }
      }
    });
    touch();
    const dup = prepared.filter((r) => r.status === "duplicate").length;
    const bad = prepared.filter((r) => r.status === "invalid").length;
    const parts = [`Imported ${fresh.length}`];
    if (watchlisted) parts.push(`${watchlisted} to Watchlist`);
    if (keptScout) parts.push(`${keptScout} held at Scout by the gate`);
    if (dup) parts.push(`${dup} duplicates skipped`);
    if (bad) parts.push(`${bad} invalid`);
    return ok(parts.join(" · "), { redirect: "/creators?seg=scout" });
  });
}
