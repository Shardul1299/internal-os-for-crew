// CSV / TSV paste import for the Outlier Research Hub (BRIEF §19.4) — ported from Upcreate's
// CsvImportClient. Pure and client-safe; the multiple comes from lib/rules/studio.
import { outlierMultiple } from "../rules/studio";

export const VIEWS_ALIASES = ["views", "view count", "view_count", "video_view_count", "play_count", "plays", "video views"];
export const LINK_ALIASES = ["link", "url", "permalink", "post url", "shortcode", "video url"];
export const FOLLOWER_ALIASES = ["followers", "follower count", "follower_count", "followers_count"];
export const HANDLE_ALIASES = ["handle", "username", "owner", "owner_username", "creator", "account"];
export const CAPTION_ALIASES = ["caption", "title", "description", "text"];

export function detectDelimiter(text: string): "," | "\t" {
  const firstLine = text.split("\n")[0] ?? "";
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return tabs > commas ? "\t" : ",";
}

/** Minimal RFC 4180 parser: quoted fields with "" as an escaped quote. */
export function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function findColumn(headers: string[], aliases: string[]): number | null {
  const i = headers.findIndex((h) => aliases.includes(h.trim().toLowerCase()));
  return i >= 0 ? i : null;
}

export function toNumber(v: string | undefined): number {
  if (!v) return 0;
  const s = v.trim().toLowerCase().replace(/[,\s]/g, "");
  const m = s.match(/^([\d.]+)([km])?$/);
  if (!m) return Number(s) || 0;
  const n = Number(m[1]) || 0;
  return Math.round(m[2] === "k" ? n * 1_000 : m[2] === "m" ? n * 1_000_000 : n);
}

export type ParsedSheet = { headers: string[]; rows: string[][] };

/** First row is headers. */
export function parseSheet(raw: string): ParsedSheet {
  if (!raw.trim()) return { headers: [], rows: [] };
  const all = parseDelimited(raw.trim(), detectDelimiter(raw));
  if (!all.length) return { headers: [], rows: [] };
  return { headers: all[0].map((h) => h.trim()), rows: all.slice(1) };
}

export type Mapping = { views: number | null; link: number | null; followers: number | null; handle: number | null; caption: number | null };

export function autoMap(headers: string[]): Mapping {
  return {
    views: findColumn(headers, VIEWS_ALIASES),
    link: findColumn(headers, LINK_ALIASES),
    followers: findColumn(headers, FOLLOWER_ALIASES),
    handle: findColumn(headers, HANDLE_ALIASES),
    caption: findColumn(headers, CAPTION_ALIASES),
  };
}

export type PreviewRow = { i: number; handle: string; link: string; views: number; followers: number; multiple: number; caption: string; outlier: boolean };

/** One preview row per data row with views; followers per row or the one count typed for the creator. */
export function previewRows(sheet: ParsedSheet, map: Mapping, opts: { followers: number; handle: string; threshold: number }): PreviewRow[] {
  if (map.views === null) return [];
  return sheet.rows
    .map((r, i) => {
      const views = toNumber(r[map.views!]);
      const followers = map.followers !== null ? toNumber(r[map.followers]) || opts.followers : opts.followers;
      const multiple = outlierMultiple(views, followers);
      return {
        i,
        handle: (map.handle !== null ? r[map.handle]?.trim() : "") || opts.handle,
        link: map.link !== null ? (r[map.link] ?? "").trim() : "",
        views,
        followers,
        multiple,
        caption: map.caption !== null ? (r[map.caption] ?? "").trim().slice(0, 200) : "",
        outlier: followers > 0 && multiple >= opts.threshold,
      };
    })
    .filter((r) => r.views > 0);
}
