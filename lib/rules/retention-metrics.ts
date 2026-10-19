// Retention metrics on Creators → Overview (BRIEF §9). Pure computations over rows the query layer loads.
// These are reported signals only: no minimum guarantees, no targets, no caps.
import { addMonths, type ISODate } from "../dates";

const SIGNED_STAGES = new Set(["signed", "advance_received", "in_production", "live", "reported", "paid_in_full"]);
const DONE_STAGES = new Set(["live", "reported", "paid_in_full"]);

export type DealRow = { id: string; brandId: string; type: string | null; stage: string; createdOn: ISODate; termEndsOn: ISODate | null; creatorIds: string[] };

/** Roster creators who moved to Alumni in the last 12 months ÷ (current roster + those leavers). */
export function churn12m(creators: { stage: string; previousStage: string | null; stageChangedOn: ISODate | null }[], today: ISODate): number | null {
  const since = addMonths(today, -12);
  const roster = creators.filter((c) => c.stage === "roster").length;
  const left = creators.filter((c) => c.stage === "alumni" && c.stageChangedOn && c.stageChangedOn >= since && (c.previousStage == null || c.previousStage === "roster")).length;
  if (roster + left === 0) return null;
  return left / (roster + left);
}

function signed(deals: DealRow[]) {
  return deals.filter((d) => SIGNED_STAGES.has(d.stage));
}

/**
 * Of recurring deals (pilot, retainer, quarterly, annual) that have finished — delivered or past their term —
 * the share followed by a later signed deal from the same brand with at least one of the same creators.
 */
export function renewalRate(deals: DealRow[], today: ISODate): number | null {
  const s = signed(deals);
  const finished = s.filter((d) => d.type && d.type !== "one_off" && (DONE_STAGES.has(d.stage) || (d.termEndsOn != null && d.termEndsOn <= today)));
  if (!finished.length) return null;
  const renewed = finished.filter((d) => s.some((n) => n.id !== d.id && n.brandId === d.brandId && n.createdOn > d.createdOn && n.creatorIds.some((c) => d.creatorIds.includes(c))));
  return renewed.length / finished.length;
}

/** Share of signed deals that are retainer / quarterly / annual, and the share that are one-off. */
export function dealTypeShare(deals: DealRow[]): { recurring: number; oneOff: number; pilot: number; total: number } | null {
  const s = signed(deals);
  if (!s.length) return null;
  const n = (pred: (d: DealRow) => boolean) => s.filter(pred).length / s.length;
  return {
    recurring: n((d) => d.type === "retainer" || d.type === "quarterly" || d.type === "annual"),
    oneOff: n((d) => d.type === "one_off"),
    pilot: n((d) => d.type === "pilot"),
    total: s.length,
  };
}

/** Brands with two or more signed deals ÷ brands with at least one. */
export function brandRepeatRate(deals: DealRow[]): number | null {
  const counts = new Map<string, number>();
  for (const d of signed(deals)) counts.set(d.brandId, (counts.get(d.brandId) ?? 0) + 1);
  if (!counts.size) return null;
  return [...counts.values()].filter((n) => n >= 2).length / counts.size;
}

/** Mean of the five-question brand survey (1–5 each) across answered surveys. */
export function averageFeedback(rows: { q1: number | null; q2: number | null; q3: number | null; q4: number | null; q5: number | null }[]): number | null {
  const vals = rows.flatMap((r) => [r.q1, r.q2, r.q3, r.q4, r.q5]).filter((v): v is number => v != null);
  if (!vals.length) return null;
  return Math.round((vals.reduce((t, v) => t + v, 0) / vals.length) * 10) / 10;
}
