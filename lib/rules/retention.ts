// Retention — BRIEF §9. No minimum guarantees exist anywhere in the system.
import { type RulesConfig } from "./config";
import { addDays, addMonths, daysBetween, type ISODate } from "../dates";

export type CheckinPlan = { type: "quarterly" | "strategy_refresh" | "pilot_end" | "exit_window"; dueOn: ISODate };

/** On roster entry: four quarterly check-ins, a strategy refresh at +6 months, and the pilot-end review. */
export function rosterCheckins(cfg: RulesConfig, rosterOn: ISODate, pilotEndsOn: ISODate): CheckinPlan[] {
  const q = cfg.n.checkin_cadence_days;
  return [
    ...[1, 2, 3, 4].map((i) => ({ type: "quarterly" as const, dueOn: addDays(rosterOn, q * i) })),
    { type: "strategy_refresh", dueOn: addMonths(rosterOn, cfg.n.strategy_refresh_months) },
    { type: "pilot_end", dueOn: pilotEndsOn },
  ];
}

/** Each completed quarterly check-in schedules the next. */
export function nextCheckin(cfg: RulesConfig, heldOn: ISODate): CheckinPlan {
  return { type: "quarterly", dueOn: addDays(heldOn, cfg.n.checkin_cadence_days) };
}

export function exitWindowCheckin(exitWindowAt: ISODate): CheckinPlan {
  return { type: "exit_window", dueOn: exitWindowAt };
}

export function checkinAdherence(checkins: { dueOn: ISODate; heldOn: ISODate | null }[], today: ISODate): number | null {
  const due = checkins.filter((c) => c.dueOn <= today);
  if (!due.length) return null;
  return due.filter((c) => c.heldOn && daysBetween(c.dueOn, c.heldOn) <= 14).length / due.length;
}

export const CHECKIN_TEMPLATE = `## What shipped

## What landed
Credibility metrics, brand feedback.

## Next-quarter calendar

## Topic-filter review

## Filter re-score

## Tier recommendation (with signals)

## Roadmap
- Platform / audience:
- Own product or course:
- Speaking and press:
- Advisory / fund / board:

## Introductions logged
`;
