// Deliverable scheduling suggestions — BRIEF §8.1, §3.5, §0.1 #11.
// `due_on` is suggested as the creator's next free calendar slot inside the term, avoiding their
// blackout weeks. Blackouts are creator-chosen and not contractual, so when no other slot exists the
// suggestion lands inside one and carries a warning — it never blocks.
import { addDays, daysBetween, inRange, type ISODate } from "../dates";

export type Blackout = { startsOn: ISODate; endsOn: ISODate };
export type Slot = { date: ISODate; warnings: string[] };

export const BLACKOUT_WARNING = "Inside a creator blackout week";
export const AFTER_TERM_WARNING = "After the term ends";

const SEARCH_LIMIT_DAYS = 730;

function inBlackout(d: ISODate, blackouts: Blackout[]) {
  return blackouts.some((b) => inRange(d, b.startsOn, b.endsOn));
}

function findDate(from: ISODate, to: ISODate | null, ok: (d: ISODate) => boolean): ISODate | null {
  const last = to ?? addDays(from, SEARCH_LIMIT_DAYS);
  const span = Math.min(SEARCH_LIMIT_DAYS, daysBetween(from, last));
  for (let i = 0; i <= span; i++) {
    const d = addDays(from, i);
    if (ok(d)) return d;
  }
  return null;
}

/** Days between one creator's sponsored pieces, from the deal's pieces per month (default weekly). */
export function cadenceGapDays(piecesPerMonth: number | null | undefined): number {
  if (!piecesPerMonth || piecesPerMonth <= 0) return 7;
  return Math.max(1, Math.floor(30 / piecesPerMonth));
}

/**
 * Suggests `count` due dates for one creator.
 * Order of preference: a free, non-blackout day on the cadence → any free non-blackout day in the
 * term → a free day inside a blackout (warns) → the first free day after the term (warns).
 * `busy` holds dates already taken on the creator's calendar (sponsored, anchor, organic items).
 */
export function suggestDueDates(args: { start: ISODate; end: ISODate | null; count: number; gapDays: number; busy: ISODate[]; blackouts: Blackout[] }): Slot[] {
  const taken = new Set(args.busy);
  const out: Slot[] = [];
  let cursor = args.start;
  const end = args.end && args.end >= args.start ? args.end : null;
  for (let i = 0; i < args.count; i++) {
    const free = (d: ISODate) => !taken.has(d);
    const clear = (d: ISODate) => free(d) && !inBlackout(d, args.blackouts);
    let date: ISODate | null = null;
    const warnings: string[] = [];
    if (cursor <= (end ?? cursor)) date = findDate(cursor, end, clear);
    if (!date && end) date = findDate(args.start, end, clear);
    if (!date && end) {
      date = findDate(args.start, end, free);
      if (date) warnings.push(BLACKOUT_WARNING);
    }
    if (!date) {
      const from = end && cursor <= end ? addDays(end, 1) : cursor;
      date = findDate(from, null, clear) ?? findDate(from, null, free) ?? from;
      if (end) warnings.push(AFTER_TERM_WARNING);
      if (inBlackout(date, args.blackouts)) warnings.push(BLACKOUT_WARNING);
    }
    taken.add(date);
    out.push({ date, warnings });
    cursor = addDays(date, Math.max(1, args.gapDays));
  }
  return out;
}

/**
 * How many more sponsored items fit this month under the sponsored ratio max (§0.1 #11: 1 in 4).
 * Same counting as lib/rules/deliverables sponsoredRatioWith: blackouts and shoots don't count.
 */
export function sponsoredHeadroom(monthItems: { kind: string }[], max: number): number {
  const items = monthItems.filter((i) => i.kind !== "blackout" && i.kind !== "shoot");
  const sponsored = items.filter((i) => i.kind === "sponsored").length;
  if (max >= 1) return Number.POSITIVE_INFINITY;
  const k = Math.floor((max * items.length - sponsored) / (1 - max) + 1e-9);
  return Math.max(0, k);
}
