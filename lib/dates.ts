// Calendar arithmetic on ISO dates (YYYY-MM-DD), evaluated in Asia/Kolkata.
import { addDays as fnsAddDays, addMonths as fnsAddMonths, differenceInCalendarDays, isWeekend, parseISO, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { TZ } from "./format";

export type ISODate = string;

export function today(now: Date = new Date()): ISODate {
  return formatInTimeZone(now, TZ, "yyyy-MM-dd");
}

function d(iso: ISODate) {
  return parseISO(iso);
}

export function iso(date: Date): ISODate {
  return format(date, "yyyy-MM-dd");
}

export function addDays(date: ISODate, n: number): ISODate {
  return iso(fnsAddDays(d(date), n));
}

export function addMonths(date: ISODate, n: number): ISODate {
  return iso(fnsAddMonths(d(date), n));
}

export function addBusinessDays(date: ISODate, n: number): ISODate {
  let cur = d(date);
  let left = n;
  while (left > 0) {
    cur = fnsAddDays(cur, 1);
    if (!isWeekend(cur)) left--;
  }
  return iso(cur);
}

export function daysBetween(from: ISODate, to: ISODate): number {
  return differenceInCalendarDays(d(to), d(from));
}

export function monthKey(date: ISODate): string {
  return date.slice(0, 7);
}

export function inRange(date: ISODate, start: ISODate, end: ISODate): boolean {
  return date >= start && date <= end;
}

export function toISO(v: Date | string | null | undefined): ISODate | null {
  if (!v) return null;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return formatInTimeZone(new Date(v), TZ, "yyyy-MM-dd");
}
