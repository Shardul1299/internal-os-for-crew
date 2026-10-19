// Indian number formatting (₹1,20,000; ₹ L / ₹ Cr in summaries). Money is integer paise.
import { formatInTimeZone } from "date-fns-tz";

export const TZ = "Asia/Kolkata";
export type Currency = "INR" | "USD";

function groupIndian(n: number): string {
  const s = Math.trunc(Math.abs(n)).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
}

/** ₹1,20,000 — full rupees, Indian grouping. */
export function money(paise: number | null | undefined, currency: Currency = "INR"): string {
  if (paise == null) return "—";
  const units = paise / 100;
  const sign = units < 0 ? "−" : "";
  if (currency === "USD") return `${sign}$${Math.abs(Math.round(units)).toLocaleString("en-US")}`;
  return `${sign}₹${groupIndian(Math.round(units))}`;
}

/** ₹12.5 L / ₹1.2 Cr — summaries. */
export function moneyShort(paise: number | null | undefined, currency: Currency = "INR"): string {
  if (paise == null) return "—";
  if (currency === "USD") {
    const u = paise / 100;
    if (Math.abs(u) >= 1_000_000) return `$${(u / 1_000_000).toFixed(1)}M`;
    if (Math.abs(u) >= 1000) return `$${(u / 1000).toFixed(1)}K`;
    return money(paise, "USD");
  }
  const r = paise / 100;
  const sign = r < 0 ? "−" : "";
  const a = Math.abs(r);
  if (a >= 1_00_00_000) return `${sign}₹${trim(a / 1_00_00_000)} Cr`;
  if (a >= 1_00_000) return `${sign}₹${trim(a / 1_00_000)} L`;
  if (a >= 1000) return `${sign}₹${trim(a / 1000)}K`;
  return `${sign}₹${Math.round(a)}`;
}

function trim(n: number) {
  return (Math.round(n * 10) / 10).toString();
}

export function rupeesToPaise(rupees: number | string): number {
  const n = typeof rupees === "string" ? Number(rupees.replace(/[₹,\s]/g, "")) : rupees;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function int(n: number | null | undefined): string {
  if (n == null) return "—";
  return groupIndian(n);
}

export function pct(n: number | null | undefined, digits = 0): string {
  if (n == null) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

export function signedPct(p: number): string {
  if (p === 0) return "0";
  return `${p > 0 ? "+" : "−"}${Math.abs(p)}%`;
}

/** Dates are stored in UTC and shown in Asia/Kolkata. */
export function date(d: Date | string | null | undefined, fmt = "d MMM yyyy"): string {
  if (!d) return "—";
  const v = typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T00:00:00+05:30`) : new Date(d);
  return formatInTimeZone(v, TZ, fmt);
}

export function dateTime(d: Date | string | null | undefined): string {
  return date(d, "d MMM, HH:mm");
}

export function relDays(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days}d` : `${-days}d ago`;
}

export const SUB_CATEGORY_LABEL: Record<string, string> = {
  ai_educator: "AI educator",
  builder_engineer: "Builder / engineer",
  founder_operator: "Founder / operator",
  vc_analyst: "VC / analyst",
  enterprise_tech: "Enterprise tech",
};

export const STAGE_LABEL: Record<string, string> = {
  scout: "Scout",
  watchlist: "Watchlist",
  incubation: "Incubation",
  roster: "Roster",
  alumni: "Alumni",
  revisit: "Revisit",
  declined: "Declined",
};

export const DEAL_STAGE_LABEL: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  brief_received: "Brief",
  creator_matched: "Matched",
  proposal_sent: "Proposal",
  negotiation: "Negotiation",
  signed: "Signed",
  advance_received: "Advance",
  in_production: "Production",
  live: "Live",
  reported: "Reported",
  paid_in_full: "Paid",
  declined: "Declined",
  lost: "Lost",
};

export const RUNG_LABEL: Record<string, string> = {
  lucrative: "Lucrative",
  semi: "Semi",
  standard: "Standard",
  pitch: "Pitch",
  premium: "Premium",
};

export function label(map: Record<string, string>, key: string | null | undefined) {
  if (!key) return "—";
  return map[key] ?? key.replace(/_/g, " ");
}

export function humanize(key: string | null | undefined): string {
  if (!key) return "—";
  const s = key.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
