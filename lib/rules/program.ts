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
