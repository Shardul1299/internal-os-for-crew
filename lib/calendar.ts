// Google Calendar subscription (§11): an ICS feed per user, addressed by an HMAC token.
// token = <userId>.<hex HMAC-SHA256(userId, AUTH_SECRET)> — revoking a user (inactive) stops the feed.
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

export function calendarToken(userId: string): string {
  const mac = createHmac("sha256", secret()).update(`calendar:${userId}`).digest("hex").slice(0, 40);
  return `${userId}.${mac}`;
}

/** Returns the user id when the token is genuine, else null. */
export function verifyCalendarToken(token: string): string | null {
  const t = token.replace(/\.ics$/, "");
  const i = t.lastIndexOf(".");
  if (i <= 0) return null;
  const userId = t.slice(0, i);
  const expected = calendarToken(userId);
  const a = Buffer.from(t);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}

export function calendarUrl(userId: string): string {
  const base = (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/api/calendar/${calendarToken(userId)}.ics`;
}

// ---------- ICS (RFC 5545) ----------

export type IcsEvent = {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  /** All-day event on an ISO date. */
  date?: string;
  /** Timed event: local Asia/Kolkata start "YYYY-MM-DDTHH:mm" and duration in minutes. */
  start?: string;
  minutes?: number;
  rrule?: string;
};

function esc(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold lines at 75 octets (RFC 5545 §3.1). */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let n = 75;
    while (Buffer.byteLength(rest.slice(0, n)) > 75) n--;
    out.push(rest.slice(0, n));
    rest = ` ${rest.slice(n)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

const compact = (iso: string) => iso.replace(/[-:]/g, "");

function addMinutesLocal(start: string, minutes: number) {
  const d = new Date(`${start}:00Z`);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return d.toISOString().slice(0, 16);
}

export function buildIcs(name: string, events: IcsEvent[], now = new Date()): string {
  const stamp = `${now.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Crew by OWLED//Snoball OS//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(name)}`,
    "X-WR-TIMEZONE:Asia/Kolkata",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
  for (const e of events) {
    lines.push("BEGIN:VEVENT", `UID:${e.uid}@snoball-os`, `DTSTAMP:${stamp}`, `SUMMARY:${esc(e.title)}`);
    if (e.date) {
      const next = new Date(`${e.date}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      lines.push(`DTSTART;VALUE=DATE:${compact(e.date)}`, `DTEND;VALUE=DATE:${compact(next.toISOString().slice(0, 10))}`);
    } else if (e.start) {
      lines.push(`DTSTART;TZID=Asia/Kolkata:${compact(e.start)}00`, `DTEND;TZID=Asia/Kolkata:${compact(addMinutesLocal(e.start, e.minutes ?? 30))}00`);
    }
    if (e.rrule) lines.push(`RRULE:${e.rrule}`);
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
