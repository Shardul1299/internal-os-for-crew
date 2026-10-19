// Read models for the Owled Creator Program (§3.2, §7, §10) and the LIT counterpart view.
import "server-only";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getConfig } from "@/lib/settings";
import { rankEntries, routeOutcome, maskedBrand, brandVisibleTo, sundayCadence } from "@/lib/rules/program";
import { today as todayISO, toISO } from "@/lib/dates";
import { money, date, SUB_CATEGORY_LABEL, STAGE_LABEL, label } from "@/lib/format";

export type Cohort = typeof s.programCohorts.$inferSelect;
const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export type Challenge = typeof s.programChallenges.$inferSelect;

export async function listCohorts() {
  const cohorts = await db.select().from(s.programCohorts).where(isNull(s.programCohorts.archivedAt)).orderBy(desc(s.programCohorts.startsOn));
  const challenges = cohorts.length
    ? await db
        .select({ id: s.programChallenges.id, cohortId: s.programChallenges.cohortId, status: s.programChallenges.status })
        .from(s.programChallenges)
        .where(and(inArray(s.programChallenges.cohortId, cohorts.map((c) => c.id)), isNull(s.programChallenges.archivedAt)))
    : [];
  return cohorts.map((c) => ({
    ...c,
    challengeCount: challenges.filter((x) => x.cohortId === c.id).length,
    openCount: challenges.filter((x) => x.cohortId === c.id && x.status === "open").length,
  }));
}

export async function listChallenges(cohortId: string) {
  return db
    .select({ c: s.programChallenges, brand: s.brands.name })
    .from(s.programChallenges)
    .leftJoin(s.brands, eq(s.brands.id, s.programChallenges.brandId))
    .where(and(eq(s.programChallenges.cohortId, cohortId), isNull(s.programChallenges.archivedAt)))
    .orderBy(desc(s.programChallenges.opensAt));
}

export type BoardEntry = {
  id: string;
  creatorId: string;
  name: string;
  stage: string;
  consentStatus: string;
  declaredSubCategory: string | null;
  declaredPlatform: string | null;
  submissionUrl: string | null;
  noteMd: string | null;
  submittedAt: Date | null;
  filterScoreId: string | null;
  aesthetics: number | null;
  taste: number | null;
  personality: number | null;
  sentence: string | null;
  total: number | null;
  rank: number | null;
  outcome: string | null;
  outcomeNote: string | null;
  projected: "tier0" | "revisit" | "pass" | null;
  dealId: string | null;
  firstLookUntil: string | null;
  revisitOn: string | null;
};

/** One challenge with its entries, scores, live ranks and projected outcomes. Crew-only (Filter scores). */
export async function getChallengeBoard(challengeId: string, role: string) {
  if (!isUuid(challengeId)) return null;
  const cfg = await getConfig();
  const [row] = await db
    .select({ c: s.programChallenges, brand: s.brands.name })
    .from(s.programChallenges)
    .leftJoin(s.brands, eq(s.brands.id, s.programChallenges.brandId))
    .where(eq(s.programChallenges.id, challengeId));
  if (!row) return null;
  const rows = await db
    .select({ e: s.programEntries, cr: s.creators, f: s.creatorFilterScores })
    .from(s.programEntries)
    .innerJoin(s.creators, eq(s.creators.id, s.programEntries.creatorId))
    .leftJoin(s.creatorFilterScores, eq(s.creatorFilterScores.id, s.programEntries.filterScoreId))
    .where(and(eq(s.programEntries.challengeId, challengeId), isNull(s.programEntries.archivedAt)))
    .orderBy(asc(s.creators.displayName));
  const ranked = rankEntries(rows.map((r) => ({ id: r.e.id, total: r.f?.total ?? null })));
  const rankOf = new Map(ranked.map((r) => [r.id, r.rank]));
  const entries: BoardEntry[] = rows.map(({ e, cr, f }) => {
    const rank = rankOf.get(e.id) ?? null;
    const total = f?.total ?? null;
    return {
      id: e.id,
      creatorId: cr.id,
      name: cr.displayName,
      stage: cr.stage,
      consentStatus: e.consentStatus,
      declaredSubCategory: e.declaredSubCategory,
      declaredPlatform: e.declaredPlatform,
      submissionUrl: e.submissionUrl,
      noteMd: e.noteMd,
      submittedAt: e.submittedAt,
      filterScoreId: e.filterScoreId,
      aesthetics: f?.aesthetics ?? null,
      taste: f?.taste ?? null,
      personality: f?.personality ?? null,
      sentence: f?.sentence ?? null,
      total,
      rank,
      outcome: e.outcome,
      outcomeNote: e.outcomeNote,
      projected: e.submittedAt ? routeOutcome(cfg, { rank, total }, row.c.topN) : null,
      dealId: e.dealId,
      firstLookUntil: cr.firstLookUntil,
      revisitOn: cr.revisitOn,
    };
  });
  entries.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999) || a.name.localeCompare(b.name));
  const judges = row.c.judges.length ? await db.select({ id: s.users.id, name: s.users.name }).from(s.users).where(inArray(s.users.id, row.c.judges)) : [];
  return {
    challenge: row.c,
    brandName: row.brand,
    brandShown: maskedBrand(role, row.c, row.brand),
    brandVisible: brandVisibleTo(role, row.c),
    entries,
    judges,
    cfg,
  };
}

/** Creators linked to a cohort: challenge entrants plus converted interns. */
export async function cohortCreators(cohortId: string) {
  const entrants = await db
    .selectDistinct({ id: s.creators.id, name: s.creators.displayName, stage: s.creators.stage })
    .from(s.programEntries)
    .innerJoin(s.programChallenges, eq(s.programChallenges.id, s.programEntries.challengeId))
    .innerJoin(s.creators, eq(s.creators.id, s.programEntries.creatorId))
    .where(and(eq(s.programChallenges.cohortId, cohortId), isNull(s.programEntries.archivedAt), isNull(s.creators.archivedAt)));
  const interns = await db
    .select({ id: s.creators.id, name: s.creators.displayName, stage: s.creators.stage })
    .from(s.programInterns)
    .innerJoin(s.creators, eq(s.creators.id, s.programInterns.convertedToCreatorId))
    .where(eq(s.programInterns.cohortId, cohortId));
  const map = new Map<string, { id: string; name: string; stage: string }>();
  for (const c of [...entrants, ...interns]) map.set(c.id, c);
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Sunday shoots shown for a cohort. Shoots with no cohort are shown under every cohort they include creators from. */
export async function listShoots(cohortId: string) {
  const members = new Set((await cohortCreators(cohortId)).map((c) => c.id));
  const shoots = await db.select().from(s.programSundayShoots).where(isNull(s.programSundayShoots.archivedAt)).orderBy(desc(s.programSundayShoots.date));
  const mine = shoots.filter((sh) => sh.cohortId === cohortId || (!sh.cohortId && sh.creators.some((c) => members.has(c))));
  const ids = [...new Set(mine.flatMap((sh) => sh.creators))];
  const names = new Map(
    (ids.length ? await db.select({ id: s.creators.id, n: s.creators.displayName }).from(s.creators).where(inArray(s.creators.id, ids)) : []).map((r) => [r.id, r.n]),
  );
  const leads = new Map((await db.select({ id: s.users.id, n: s.users.name }).from(s.users)).map((u) => [u.id, u.n ?? ""]));
  return mine.map((sh) => ({
    ...sh,
    creatorNames: sh.creators.map((c) => ({ id: c, name: names.get(c) ?? "—", attended: sh.attended.includes(c) })),
    leadName: sh.crewLeadUserId ? leads.get(sh.crewLeadUserId) ?? "—" : "—",
  }));
}

export async function listInterns(cohortId: string) {
  return db
    .select({ i: s.programInterns, creator: s.creators.displayName })
    .from(s.programInterns)
    .leftJoin(s.creators, eq(s.creators.id, s.programInterns.convertedToCreatorId))
    .where(and(eq(s.programInterns.cohortId, cohortId), isNull(s.programInterns.archivedAt)))
    .orderBy(asc(s.programInterns.function));
}

/** Program creators from this cohort now in incubation, with their first-look date and Sunday cadence. */
export async function listIncubating(cohortId: string) {
  const ids = (await cohortCreators(cohortId)).map((c) => c.id);
  if (!ids.length) return [];
  const rows = await db
    .select()
    .from(s.creators)
    .where(and(inArray(s.creators.id, ids), eq(s.creators.stage, "incubation"), isNull(s.creators.archivedAt)))
    .orderBy(asc(s.creators.firstLookUntil));
  const shoots = await db.select().from(s.programSundayShoots).where(isNull(s.programSundayShoots.archivedAt));
  const t = todayISO();
  return rows.map((c) => ({ ...c, cadence: sundayCadence(shoots, c.id, t) }));
}

/** Sunday cadence for one creator (attended / invited, past shoots) — for the creator record. */
export async function creatorSundayCadence(creatorId: string) {
  const shoots = await db.select().from(s.programSundayShoots).where(isNull(s.programSundayShoots.archivedAt));
  return sundayCadence(shoots, creatorId, todayISO());
}

export async function crewUsers() {
  return db
    .select({ id: s.users.id, name: s.users.name, role: s.users.role })
    .from(s.users)
    .where(and(eq(s.users.active, true), inArray(s.users.role, ["owner", "crew_lead", "ops", "strategist", "intern"])))
    .orderBy(asc(s.users.name));
}

export async function brandOptions() {
  return db.select({ id: s.brands.id, name: s.brands.name }).from(s.brands).where(isNull(s.brands.archivedAt)).orderBy(asc(s.brands.name));
}

export async function challengeTemplate() {
  const [t] = await db.select().from(s.templates).where(eq(s.templates.key, "challenge_brief"));
  return t?.bodyMd ?? "";
}

// ---------- Counterpart view (§7.8): scoped by cohortIds; no money, no tier, brand masked until closed ----------

export type CounterpartRow = {
  entryId: string;
  name: string;
  cohort: string;
  challenge: string;
  brand: string;
  stage: string;
  filterTotal: number | null;
  nextShoot: string | null;
};

export async function getCounterpartRows(cohortIds: string[]): Promise<CounterpartRow[]> {
  cohortIds = cohortIds.filter(isUuid);
  if (!cohortIds.length) return [];
  const rows = await db
    .select({
      entryId: s.programEntries.id,
      creatorId: s.creators.id,
      name: s.creators.displayName,
      stage: s.creators.stage,
      consent: s.programEntries.consentStatus,
      creatorConsent: s.creators.consentStatus,
      cohort: s.programCohorts.batchLabel,
      challenge: s.programChallenges.title,
      status: s.programChallenges.status,
      brand: s.brands.name,
      filterTotal: s.creatorFilterScores.total,
    })
    .from(s.programEntries)
    .innerJoin(s.programChallenges, eq(s.programChallenges.id, s.programEntries.challengeId))
    .innerJoin(s.programCohorts, eq(s.programCohorts.id, s.programChallenges.cohortId))
    .innerJoin(s.creators, eq(s.creators.id, s.programEntries.creatorId))
    .leftJoin(s.brands, eq(s.brands.id, s.programChallenges.brandId))
    .leftJoin(s.creatorFilterScores, eq(s.creatorFilterScores.id, s.programEntries.filterScoreId))
    .where(and(inArray(s.programChallenges.cohortId, cohortIds), eq(s.programEntries.consentStatus, "opted_in"), isNull(s.programEntries.archivedAt), isNull(s.creators.archivedAt)))
    .orderBy(asc(s.creators.displayName));
  const t = todayISO();
  const shoots = await db.select({ date: s.programSundayShoots.date, creators: s.programSundayShoots.creators }).from(s.programSundayShoots).where(isNull(s.programSundayShoots.archivedAt));
  return rows
    .filter((r) => r.creatorConsent !== "withdrawn")
    .map((r) => {
      const next = shoots.filter((sh) => sh.date >= t && sh.creators.includes(r.creatorId)).sort((a, b) => (a.date < b.date ? -1 : 1))[0];
      // Only these fields leave the query: no money, no tier, no individual scores.
      return {
        entryId: r.entryId,
        name: r.name,
        cohort: r.cohort,
        challenge: r.challenge,
        brand: maskedBrand("program_counterpart", { status: r.status }, r.brand),
        stage: r.stage,
        filterTotal: r.filterTotal ?? null,
        nextShoot: next?.date ?? null,
      };
    });
}

// ---------- Quarterly Program report (§7.9) ----------

export async function getProgramReport(cohortId: string) {
  if (!isUuid(cohortId)) return null;
  const [cohort] = await db.select().from(s.programCohorts).where(eq(s.programCohorts.id, cohortId));
  if (!cohort) return null;
  const challenges = await db.select().from(s.programChallenges).where(and(eq(s.programChallenges.cohortId, cohortId), isNull(s.programChallenges.archivedAt)));
  const chIds = challenges.map((c) => c.id);
  const entries = chIds.length
    ? await db
        .select({ e: s.programEntries, name: s.creators.displayName, stage: s.creators.stage, total: s.creatorFilterScores.total, creatorId: s.creators.id })
        .from(s.programEntries)
        .innerJoin(s.creators, eq(s.creators.id, s.programEntries.creatorId))
        .leftJoin(s.creatorFilterScores, eq(s.creatorFilterScores.id, s.programEntries.filterScoreId))
        .where(and(inArray(s.programEntries.challengeId, chIds), isNull(s.programEntries.archivedAt)))
    : [];
  const shoots = await listShoots(cohortId);
  const t = todayISO();
  const pastShoots = shoots.filter((sh) => sh.date <= t);
  const invited = pastShoots.reduce((n, sh) => n + sh.creators.length, 0);
  const attended = pastShoots.reduce((n, sh) => n + sh.attended.length, 0);
  const entrants = new Set(entries.map((e) => e.creatorId)).size;
  const top = entries.filter((e) => e.e.outcome === "tier0" || (e.e.outcome === "brand_commission" && e.stage === "incubation"));
  const revisit = entries.filter((e) => e.e.outcome === "revisit").length;
  const commissioned = entries.filter((e) => e.e.outcome === "brand_commission");
  const members = await cohortCreators(cohortId);
  const toRoster = members.filter((m) => m.stage === "roster" || m.stage === "alumni").length;

  const md = [
    `# Program report — ${cohort.batchLabel}`,
    `${label({ creatorpreneur: "Creatorpreneur", creator_marketer: "Creator marketer", next_gen_business: "Next-gen business", mixed: "Mixed" }, cohort.programme)} · ${date(cohort.startsOn)} – ${date(cohort.endsOn)} · Counterpart: ${cohort.counterpartName ?? "—"}`,
    "",
    "| Measure | Count |",
    "|---|---|",
    `| Challenges | ${challenges.length} |`,
    `| Entrants | ${entrants} |`,
    `| Top picks to Tier 0 | ${top.length} |`,
    `| Revisit | ${revisit} |`,
    `| Brand commissions | ${commissioned.length} |`,
    `| Sunday shoots held | ${pastShoots.length} |`,
    `| Sunday attendance | ${attended} of ${invited} |`,
    `| Moves to roster | ${toRoster} |`,
    `| Cost to date | ${money(cohort.costPaise)} |`,
    "",
    "## Top picks",
    ...(top.length ? top.sort((a, b) => (a.e.rank ?? 99) - (b.e.rank ?? 99)).map((e) => `- ${e.name}${e.e.rank ? ` — rank ${e.e.rank}` : ""}`) : ["- None routed yet."]),
    "",
    "## Challenges",
    ...(challenges.length
      ? challenges.map((c) => `- ${c.title} — ${c.status}, ${date(c.opensAt)} to ${date(c.closesAt)}, ${plural(entries.filter((e) => e.e.challengeId === c.id).length, "entry", "entries")}`)
      : ["- None yet."]),
  ].join("\n");

  return { cohort, md, generatedOn: toISO(new Date())! };
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export const SUB_LABEL = (k: string | null) => label(SUB_CATEGORY_LABEL, k);
export const STAGE = (k: string | null) => label(STAGE_LABEL, k);
