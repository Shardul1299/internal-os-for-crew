// Owled Creator Program — BRIEF §7.
import { type RulesConfig, gate, type GateResult } from "./config";
import { addMonths, type ISODate } from "../dates";

export const CHALLENGE_HOURS = 48;

export function closesAt(opensAt: Date): Date {
  return new Date(opensAt.getTime() + CHALLENGE_HOURS * 3600_000);
}

/** Late submissions are not accepted; consent must be captured. */
export function canSubmit(entry: { consentStatus: string }, challenge: { status: string; opensAt: Date; closesAt: Date }, now: Date, note: string): GateResult {
  const r: string[] = [];
  if (entry.consentStatus !== "opted_in") r.push("Consent not captured");
  if (challenge.status !== "open") r.push("Challenge isn't open");
  if (now < challenge.opensAt) r.push("Challenge hasn't opened");
  if (now > challenge.closesAt) r.push("Late — the 48-hour window has closed");
  if (note.trim().split(/\s+/).filter(Boolean).length > 100) r.push("Note is over 100 words");
  return gate(r);
}

/** The brand stays hidden from students until judging closes. */
export function brandVisible(challenge: { status: string }): boolean {
  return challenge.status === "closed";
}

export type ScoredEntry = { id: string; total: number | null };

export function rankEntries<T extends ScoredEntry>(entries: T[]): (T & { rank: number | null })[] {
  const scored = entries.filter((e) => e.total != null).sort((a, b) => (b.total! - a.total!));
  const ranks = new Map<string, number>();
  scored.forEach((e, i) => {
    const prev = scored[i - 1];
    ranks.set(e.id, prev && prev.total === e.total ? ranks.get(prev.id)! : i + 1);
  });
  return entries.map((e) => ({ ...e, rank: ranks.get(e.id) ?? null }));
}

/** Top N → tier0; totals in the revisit band → revisit (+1 quarter); below → pass. */
export function outcomeFor(cfg: RulesConfig, e: { rank: number | null; total: number | null }, topN: number): "tier0" | "revisit" | "pass" | null {
  if (e.total == null || e.rank == null) return null;
  if (e.rank <= topN) return "tier0";
  if (e.total >= cfg.filter.revisitMin && e.total <= cfg.filter.revisitMax) return "revisit";
  // BRIEF: clarify — totals above the revisit band but outside the top N are not covered; read as revisit.
  if (e.total > cfg.filter.revisitMax) return "revisit";
  return "pass";
}

export function revisitDate(cfg: RulesConfig, today: ISODate) {
  return addMonths(today, cfg.n.program_revisit_months);
}

/** The brand sees the top ten and may commission one entry. */
export function brandShortlist<T extends { rank: number | null }>(entries: T[]): T[] {
  return entries.filter((e) => e.rank != null && e.rank <= 10).sort((a, b) => a.rank! - b.rank!);
}

export function canBrandCommission(entries: { outcome: string | null }[]): GateResult {
  return gate(entries.some((e) => e.outcome === "brand_commission") ? ["The brand already commissioned one entry"] : []);
}

// ---------- Additions for the Program screens (§7, §10). Existing semantics above are unchanged. ----------

export type ChallengeStatus = "draft" | "open" | "judging" | "closed";
export type ProgramAction = "cohort" | "cost" | "challenge" | "entry" | "score" | "route" | "commission" | "shoot" | "intern";

const PROGRAM_ROLES: Record<ProgramAction, readonly string[]> = {
  cohort: ["owner", "crew_lead"],
  cost: ["owner", "crew_lead"], // money field: interns never touch it (§1)
  challenge: ["owner", "crew_lead"],
  entry: ["owner", "crew_lead", "intern"], // data entry
  score: ["owner", "crew_lead", "intern"], // interns score as scribes (§1)
  route: ["owner", "crew_lead"],
  commission: ["owner", "crew_lead"],
  shoot: ["owner", "crew_lead", "intern"],
  intern: ["owner", "crew_lead"],
};

export function programCan(role: string, action: ProgramAction): GateResult {
  return gate(PROGRAM_ROLES[action].includes(role) ? [] : ["Your role can't do that in the Program"]);
}

/**
 * Who sees the challenge brand. Students, interns (LIT students themselves) and the LIT counterpart see it
 * only once the challenge is closed; the rest of Crew sees it always.
 */
// BRIEF: clarify — §1 lists interns as LIT students; read restrictively, they see the brand only after closing.
export function brandVisibleTo(role: string, challenge: { status: string }): boolean {
  if (["owner", "crew_lead", "ops", "strategist", "sales_viewer", "finance_viewer"].includes(role)) return true;
  return brandVisible(challenge);
}

export function maskedBrand(role: string, challenge: { status: string }, brandName: string | null | undefined): string {
  if (!brandName) return "—";
  return brandVisibleTo(role, challenge) ? brandName : "Hidden brand";
}

/** draft → open → judging → closed, one step at a time. */
export function canMoveChallenge(
  challenge: { status: ChallengeStatus; title: string; briefMd: string; opensAt: Date; closesAt: Date },
  to: ChallengeStatus,
  ctx: { now: Date; entries: { submitted: boolean; scored: boolean; outcome: string | null }[] },
): GateResult {
  const order: ChallengeStatus[] = ["draft", "open", "judging", "closed"];
  const r: string[] = [];
  if (order.indexOf(to) !== order.indexOf(challenge.status) + 1) r.push(`Can't move from ${challenge.status} to ${to}`);
  if (to === "open") {
    if (!challenge.title.trim()) r.push("Title missing");
    if (!challenge.briefMd.trim()) r.push("Brief missing");
  }
  if (to === "judging" && ctx.now < challenge.closesAt) r.push("The 48-hour window is still open");
  if (to === "closed") {
    if (ctx.entries.some((e) => e.submitted && !e.scored)) r.push("Score every submitted entry first");
    if (ctx.entries.some((e) => e.submitted && !e.outcome)) r.push("Route outcomes first");
  }
  return gate(r);
}

/** An entrant joins only with opt-in consent captured (§7.3). */
export function canEnter(e: { consentStatus: string; challengeStatus: string }): GateResult {
  const r: string[] = [];
  if (e.consentStatus !== "opted_in") r.push("Consent not captured");
  if (e.challengeStatus === "judging" || e.challengeStatus === "closed") r.push("Entries are closed");
  return gate(r);
}

/** Scores are entered while the challenge is in judging. */
export function canScore(challenge: { status: string }): GateResult {
  return gate(challenge.status === "judging" ? [] : ["Scoring opens when the challenge moves to judging"]);
}

/**
 * The routed outcome for an entry. Wraps outcomeFor; a top-N rank never overrides a Filter fail (§0.1 #2),
 * so a top-N entry below the watchlist threshold falls back to the band rules.
 */
// BRIEF: clarify — §7.5 routes the top N to tier0 without naming a floor; read restrictively, the Filter threshold still applies.
export function routeOutcome(cfg: RulesConfig, e: { rank: number | null; total: number | null }, topN: number): "tier0" | "revisit" | "pass" | null {
  const o = outcomeFor(cfg, e, topN);
  if (o !== "tier0") return o;
  if ((e.total ?? 0) >= cfg.filter.watchlist) return "tier0";
  if (e.total! >= cfg.filter.revisitMin && e.total! <= cfg.filter.revisitMax) return "revisit";
  return "pass";
}

export function canRouteOutcomes(challenge: { status: string }, entries: { submitted: boolean; scored: boolean }[]): GateResult {
  const r: string[] = [];
  if (challenge.status !== "judging") r.push("Route outcomes during judging");
  const submitted = entries.filter((e) => e.submitted);
  if (!submitted.length) r.push("No submitted entries");
  const unscored = submitted.filter((e) => !e.scored).length;
  if (unscored) r.push(`${unscored} submitted ${unscored === 1 ? "entry is" : "entries are"} unscored`);
  return gate(r);
}

/** The kind note sent with a pass. */
export const PASS_NOTE = "Thank you for entering. Not this time — keep making, and enter the next challenge.";
export const NO_SUBMISSION_NOTE = "No submission before the window closed.";

/** The brand commissions one entry from its top-ten view, once outcomes are routed. */
export function canCommissionEntry(
  entry: { rank: number | null; outcome: string | null },
  all: { rank: number | null; outcome: string | null }[],
  challenge: { status: string; brandId: string | null },
): GateResult {
  const r: string[] = [];
  if (!challenge.brandId) r.push("Challenge has no brand");
  if (challenge.status !== "judging" && challenge.status !== "closed") r.push("Commission after judging");
  if (!all.some((e) => e.outcome)) r.push("Route outcomes first");
  if (!brandShortlist([entry]).length) r.push("Only the top ten can be commissioned");
  r.push(...canBrandCommission(all).reasons);
  return gate(r);
}

/** Sunday attendance — "cadence" on the creator record: shoots attended out of shoots invited to (past only). */
export function sundayCadence(shoots: { date: ISODate; creators: string[]; attended: string[] }[], creatorId: string, today: ISODate) {
  const past = shoots.filter((s) => s.date <= today && s.creators.includes(creatorId));
  return { invited: past.length, attended: past.filter((s) => s.attended.includes(creatorId)).length };
}

/** Attendance can be marked only for invited creators on or after the shoot date. */
export function canMarkAttendance(shoot: { date: ISODate; creators: string[] }, creatorId: string, today: ISODate): GateResult {
  const r: string[] = [];
  if (!shoot.creators.includes(creatorId)) r.push("Not on this shoot");
  if (shoot.date > today) r.push("Shoot hasn't happened yet");
  return gate(r);
}

export function noteWordCount(note: string) {
  return note.trim().split(/\s+/).filter(Boolean).length;
}

/** Two interns per cohort: one research, one deal desk (§7.7). */
export function canAddIntern(existing: { function: string; id?: string }[], fn: string, editingId?: string | null): GateResult {
  const others = editingId ? existing.filter((i) => i.id !== editingId) : existing;
  const r: string[] = [];
  if (others.some((i) => i.function === fn)) r.push(`This cohort already has a ${fn.replace("_", " ")} intern`);
  if (others.length >= 2) r.push("Two interns per cohort");
  return gate(r);
}
