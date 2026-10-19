// CSV import of the current pipeline document as Scout / Watchlist records (BRIEF §15 Milestone 1).
// Pure: parsing, column mapping, value normalisation, validation and duplicate detection by handle.
// Watchlist rows still go through canTransition (Filter ≥ threshold + consent) in the action layer.
// Follower counts are never imported as an input to anything.
import { validateFilterScore } from "./creators";

export const IMPORT_FIELDS = ["name", "handle", "platform", "sub_category", "source", "notes", "city", "stage", "consent", "aesthetics", "taste", "personality", "sentence"] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];
export const REQUIRED_FIELDS: ImportField[] = ["name", "handle"];

export type Mapping = Partial<Record<ImportField, number>>; // field → column index

const SUBS = ["ai_educator", "builder_engineer", "founder_operator", "vc_analyst", "enterprise_tech"] as const;
const SOURCES = ["program", "frontseat", "ayush_network", "referral", "inbound", "outbound", "event"] as const;
export type SubCategory = (typeof SUBS)[number];
export type Source = (typeof SOURCES)[number];
export type Platform = "instagram" | "youtube" | "x" | "linkedin" | "newsletter" | "other";

/** RFC 4180-ish CSV: quoted fields, doubled quotes, CRLF/LF, commas or tabs (first line decides). */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const delim = (firstLine.match(/\t/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"' && field === "") quoted = true;
    else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row.map((c) => c.trim()));
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row.map((c) => c.trim()));
  return rows;
}

const ALIASES: Record<ImportField, string[]> = {
  name: ["name", "creator", "creator name", "display name", "full name"],
  handle: ["handle", "username", "ig handle", "instagram handle", "account", "@"],
  platform: ["platform", "primary platform", "channel"],
  sub_category: ["sub_category", "sub category", "subcategory", "category", "niche", "sub-category"],
  source: ["source", "found via", "origin", "lead source"],
  notes: ["notes", "note", "comments", "comment", "why"],
  city: ["city", "location", "based in"],
  stage: ["stage", "status", "pipeline stage"],
  consent: ["consent", "opted in", "opt in", "consent status"],
  aesthetics: ["aesthetics", "aesthetic", "a"],
  taste: ["taste", "t"],
  personality: ["personality", "p"],
  sentence: ["sentence", "filter sentence", "one sentence", "verdict"],
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Guesses the column for each field from the header row. */
export function guessMapping(headers: string[]): Mapping {
  const m: Mapping = {};
  const used = new Set<number>();
  for (const f of IMPORT_FIELDS) {
    const idx = headers.findIndex((h, i) => !used.has(i) && ALIASES[f].map(norm).includes(norm(h)));
    if (idx >= 0) {
      m[f] = idx;
      used.add(idx);
    }
  }
  return m;
}

export function normalizeHandle(h: string): string {
  return h
    .trim()
    .replace(/^https?:\/\/(www\.)?[^/]+\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@/, "")
    .toLowerCase();
}

export function normalizeSubCategory(v: string): SubCategory | null {
  const n = norm(v).replace(/\s*\/\s*/g, " ");
  if (!n) return null;
  const direct = SUBS.find((s) => norm(s) === n);
  if (direct) return direct;
  if (/educat|teach/.test(n)) return "ai_educator";
  if (/build|engineer|dev/.test(n)) return "builder_engineer";
  if (/founder|operator/.test(n)) return "founder_operator";
  if (/vc|analyst|invest/.test(n)) return "vc_analyst";
  if (/enterprise/.test(n)) return "enterprise_tech";
  return null;
}

export function normalizeSource(v: string): Source | null {
  const n = norm(v);
  if (!n) return null;
  const direct = SOURCES.find((s) => norm(s) === n);
  if (direct) return direct;
  if (/lit|program|challenge/.test(n)) return "program";
  if (/front ?seat/.test(n)) return "frontseat";
  if (/ayush|network/.test(n)) return "ayush_network";
  if (/refer/.test(n)) return "referral";
  if (/inbound|dm|applied/.test(n)) return "inbound";
  if (/outbound|scout|cold/.test(n)) return "outbound";
  if (/event|meetup|conference/.test(n)) return "event";
  return null;
}

export function normalizePlatform(v: string): Platform | null {
  const n = norm(v);
  if (!n) return null;
  if (/^(ig|insta|instagram)$/.test(n)) return "instagram";
  if (/^(yt|youtube)$/.test(n)) return "youtube";
  if (/^(x|twitter)$/.test(n)) return "x";
  if (/^(li|linkedin)$/.test(n)) return "linkedin";
  if (/newsletter|substack|beehiiv/.test(n)) return "newsletter";
  if (n === "other") return "other";
  return null;
}

export type ImportDefaults = { source: Source | null; subCategory: SubCategory | null; platform: Platform };

export type PreparedRow = {
  line: number; // 1-based line in the file, header = 1
  name: string;
  handle: string;
  platform: Platform;
  subCategory: SubCategory | null;
  source: Source | null;
  notes: string | null;
  city: string | null;
  wantsWatchlist: boolean;
  consent: "none" | "opted_in";
  score: { aesthetics: number; taste: number; personality: number; sentence: string } | null;
  status: "new" | "duplicate" | "invalid";
  reason: string | null;
};

/** Maps, normalises and validates each data row. Duplicates by handle (in the DB or earlier in the file) are skipped. */
export function prepareImport(rows: string[][], mapping: Mapping, defaults: ImportDefaults, existingHandles: Iterable<string>): PreparedRow[] {
  const seen = new Set<string>([...existingHandles].map(normalizeHandle));
  const cell = (r: string[], f: ImportField) => (mapping[f] != null ? (r[mapping[f]!] ?? "").trim() : "");
  return rows.map((r, i) => {
    const name = cell(r, "name");
    const handle = normalizeHandle(cell(r, "handle"));
    const platformRaw = cell(r, "platform");
    const subRaw = cell(r, "sub_category");
    const srcRaw = cell(r, "source");
    const platform = (platformRaw ? normalizePlatform(platformRaw) : null) ?? defaults.platform;
    const subCategory = subRaw ? normalizeSubCategory(subRaw) : defaults.subCategory;
    const source = srcRaw ? normalizeSource(srcRaw) : defaults.source;
    const stageRaw = norm(cell(r, "stage"));
    const consentRaw = norm(cell(r, "consent"));
    const consent: "none" | "opted_in" = /^(yes|y|true|1|opted in|opted_in)$/.test(consentRaw) ? "opted_in" : "none";
    const a = cell(r, "aesthetics");
    const t = cell(r, "taste");
    const p = cell(r, "personality");
    const sentence = cell(r, "sentence");
    const anyScore = !!(a || t || p || sentence);
    const score = anyScore ? { aesthetics: Number(a), taste: Number(t), personality: Number(p), sentence } : null;
    const base = {
      line: i + 2,
      name,
      handle,
      platform,
      subCategory,
      source,
      notes: cell(r, "notes") || null,
      city: cell(r, "city") || null,
      wantsWatchlist: stageRaw === "watchlist",
      consent,
      score,
    };
    const problems: string[] = [];
    if (!name) problems.push("Name missing");
    if (!handle) problems.push("Handle missing");
    if (subRaw && !subCategory) problems.push(`Unknown sub-category "${subRaw}"`);
    else if (!subCategory) problems.push("Sub-category missing");
    if (srcRaw && !source) problems.push(`Unknown source "${srcRaw}"`);
    else if (!source) problems.push("Source missing");
    if (platformRaw && !normalizePlatform(platformRaw)) problems.push(`Unknown platform "${platformRaw}"`);
    if (stageRaw && stageRaw !== "scout" && stageRaw !== "watchlist") problems.push(`Stage "${cell(r, "stage")}" can't be imported`);
    if (score) {
      const v = validateFilterScore(score);
      if (!v.ok) problems.push(`Filter: ${v.reasons[0]}`);
    }
    if (problems.length) return { ...base, status: "invalid" as const, reason: problems[0] };
    if (seen.has(handle)) return { ...base, status: "duplicate" as const, reason: "Handle already on file" };
    seen.add(handle);
    return { ...base, status: "new" as const, reason: null };
  });
}

/** The mapping must cover the required fields and point at real columns. */
export function validateMapping(mapping: Mapping, columnCount: number): string[] {
  const r: string[] = [];
  for (const f of REQUIRED_FIELDS) if (mapping[f] == null) r.push(`Map a column to ${f}`);
  for (const [f, idx] of Object.entries(mapping)) if (idx != null && (idx < 0 || idx >= columnCount)) r.push(`Column for ${f} doesn't exist`);
  const idxs = Object.values(mapping).filter((v) => v != null);
  if (new Set(idxs).size !== idxs.length) r.push("Two fields share a column");
  return r;
}
