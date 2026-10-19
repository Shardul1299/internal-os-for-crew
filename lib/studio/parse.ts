// Parsers for generator output and pasted text (BRIEF §19.4–§19.12). Pure and client-safe.
// Each one is forgiving: model output varies, so a parser that finds nothing returns an
// empty result and the creator can still enter the content by hand.

export type ScriptSections = { black: string; red: string; green: string };

const BULLET = /^\s*(?:[-*•]|\d+[.)])\s+/;

function cleanLines(lines: string[]): string {
  return lines
    .map((l) => l.replace(BULLET, "").trimEnd())
    .filter((l) => l.trim() && !/^```/.test(l.trim()) && !/^<\/?[a-z_]+>$/i.test(l.trim()))
    .join("\n")
    .trim();
}

/** The final deliverable of a phased prompt: <final_script> or <revised_script> if present. */
export function finalSection(text: string): string {
  for (const tag of ["final_script", "revised_script"]) {
    const open = text.lastIndexOf(`<${tag}>`);
    if (open >= 0) {
      const rest = text.slice(open + tag.length + 2);
      const close = rest.indexOf(`</${tag}>`);
      return close >= 0 ? rest.slice(0, close) : rest;
    }
  }
  return text;
}

const HEADER = /^\s*(?:#{1,4}\s*)?(?:\*\*)?\s*(BLACK|RED|GREEN)\b[^\n]*$/i;

/** Splits a BLACK / RED / GREEN script into its three bodies. Uses the last BLACK block found. */
export function parseScriptSections(text: string): ScriptSections {
  const lines = finalSection(text).replace(/\r/g, "").split("\n");
  let lastBlack = -1;
  lines.forEach((l, i) => {
    const m = l.match(HEADER);
    if (m && m[1].toUpperCase() === "BLACK") lastBlack = i;
  });
  if (lastBlack < 0) return { black: cleanLines(lines), red: "", green: "" };
  const out: Record<"BLACK" | "RED" | "GREEN", string[]> = { BLACK: [], RED: [], GREEN: [] };
  let cur: "BLACK" | "RED" | "GREEN" | null = null;
  for (const l of lines.slice(lastBlack)) {
    const m = l.match(HEADER);
    if (m) {
      cur = m[1].toUpperCase() as "BLACK" | "RED" | "GREEN";
      // "BLACK: first line" — keep anything after the colon that isn't the header description.
      const after = l.split(/:\s*/).slice(1).join(": ").replace(/\*\*/g, "").trim();
      if (after && !/^\(?(spoken|physical|editing)/i.test(after) && !/\)$/.test(after)) out[cur].push(after);
      continue;
    }
    if (cur) out[cur].push(l);
  }
  return { black: cleanLines(out.BLACK), red: cleanLines(out.RED), green: cleanLines(out.GREEN) };
}

export type HookStack = { written: string; verbal: string; visual: string };

function unquote(s: string) {
  return s.replace(/\*\*/g, "").trim().replace(/^["“'](.*)["”']$/, "$1").trim();
}

/** Finds Written / Verbal / Visual triples in a hook-stack answer. */
export function parseHookStacks(text: string): HookStack[] {
  const stacks: HookStack[] = [];
  let cur: HookStack = { written: "", verbal: "", visual: "" };
  const push = () => {
    if (cur.written || cur.verbal || cur.visual) stacks.push(cur);
    cur = { written: "", verbal: "", visual: "" };
  };
  const re = /(written|verbal|visual)(?:\s+hook)?[^:|\n]{0,30}:\s*([^|\n]+)/gi;
  for (const line of text.replace(/\r/g, "").split("\n")) {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(line))) {
      const k = m[1].toLowerCase() as keyof HookStack;
      const v = unquote(m[2]);
      if (!v) continue;
      if (cur[k]) push();
      cur[k] = v;
    }
  }
  push();
  return stacks.filter((s) => s.written || s.verbal);
}

export type IdeationRow = { topic: string; pillar: "authority" | "journey"; conceptBucket: "proven" | "double_down" | "experimental"; angle: string; hook: string };

export function normalizePillar(v: string): "authority" | "journey" {
  return /journey|document|story/i.test(v) ? "journey" : "authority";
}

export function normalizeBucket(v: string): "proven" | "double_down" | "experimental" {
  if (/double|down/i.test(v)) return "double_down";
  if (/experiment|original/i.test(v)) return "experimental";
  return "proven";
}

function cells(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.replace(/\*\*/g, "").trim());
}

/** Reads the markdown table returned by the batch-ideation prompt (Topic | Pillar | Concept | Angle | Hook). */
export function parseIdeationTable(text: string): IdeationRow[] {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => /^\s*\|.*\|\s*$/.test(l));
  if (!lines.length) return [];
  let header: string[] | null = null;
  const rows: IdeationRow[] = [];
  for (const l of lines) {
    if (/^\s*\|[\s\-:|]+\|\s*$/.test(l)) continue;
    const c = cells(l);
    if (!header && c.some((x) => /topic/i.test(x)) && c.some((x) => /pillar/i.test(x))) {
      header = c.map((x) => x.toLowerCase());
      continue;
    }
    const idx = (re: RegExp, fallback: number) => {
      const i = header ? header.findIndex((h) => re.test(h)) : -1;
      return i >= 0 ? i : fallback;
    };
    const iTopic = idx(/topic/, 0);
    const iPillar = idx(/pillar/, 1);
    const iBucket = idx(/concept|bucket/, 2);
    const iAngle = idx(/angle/, 3);
    const iHook = idx(/hook/, 4);
    const topic = (c[iTopic] ?? "").replace(/^\d+[.)]\s*/, "");
    if (!topic || /^#$/.test(topic)) continue;
    // A leading "#" column shifts everything right.
    if (/^\d+$/.test(topic) && c.length > 5) {
      rows.push({ topic: c[1], pillar: normalizePillar(c[2] ?? ""), conceptBucket: normalizeBucket(c[3] ?? ""), angle: c[4] ?? "", hook: c[5] ?? "" });
      continue;
    }
    rows.push({ topic, pillar: normalizePillar(c[iPillar] ?? ""), conceptBucket: normalizeBucket(c[iBucket] ?? ""), angle: c[iAngle] ?? "", hook: c[iHook] ?? "" });
  }
  return rows;
}

export type DoubleDownVariant = { method: "A" | "B" | "C"; text: string };

/** Splits the double-down answer into its A / B / C variants. */
export function parseDoubleDownVariants(text: string): DoubleDownVariant[] {
  const lines = text.replace(/\r/g, "").split("\n");
  const out: DoubleDownVariant[] = [];
  let cur: DoubleDownVariant | null = null;
  const start = /^\s*(?:#{1,4}\s*)?(?:\*\*)?\s*(?:Variant\s+|Method\s+)?\(?([ABC])\s*[).:\-—]/;
  for (const l of lines) {
    const m = l.match(start);
    if (m && (!cur || cur.method !== m[1])) {
      if (cur) out.push(cur);
      cur = { method: m[1] as "A" | "B" | "C", text: l.replace(start, "").replace(/\*\*/g, "").trim() };
      continue;
    }
    if (cur && l.trim()) cur.text = `${cur.text}\n${l.replace(/\*\*/g, "").trim()}`.trim();
  }
  if (cur) out.push(cur);
  return out;
}

/** The first meaningful line of a variant, used as the calendar topic. */
export function firstMeaningfulLine(text: string): string {
  const l = text
    .split("\n")
    .map((x) => x.replace(BULLET, "").replace(/^(new\s+)?(topic|angle)[^:]*:\s*/i, "").trim())
    .find((x) => x.length > 2);
  return (l ?? "").slice(0, 160);
}

export type CarouselSlide = { role: "hook" | "body" | "cta"; headline: string; supportingText: string };

/** Ported from Upcreate: slides separated by "---", each starting with HOOK: / BODY: / CTA:. */
export function parseCarouselSlides(raw: string): CarouselSlide[] {
  return raw
    .replace(/\r/g, "")
    .split(/\n\s*---\s*\n/g)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      const first = lines[0] || "";
      const m = first.match(/^(?:\*\*)?(HOOK|BODY|CTA)(?:\*\*)?\s*:\s*(.*)$/i);
      const role = m ? (m[1].toLowerCase() as CarouselSlide["role"]) : "body";
      return { role, headline: (m ? m[2] : first).replace(/\*\*/g, "").trim(), supportingText: lines.slice(1).join("\n").trim() };
    })
    .filter((s) => s.headline);
}

/** RED and GREEN lines become an ordered shot list an editor can follow (§19.9). */
export function buildShotList(red: string, green: string): { n: number; action: string; edit: string }[] {
  const r = red.split("\n").map((l) => l.replace(BULLET, "").trim()).filter(Boolean);
  const g = green.split("\n").map((l) => l.replace(BULLET, "").trim()).filter(Boolean);
  const n = Math.max(r.length, g.length);
  return Array.from({ length: n }, (_, i) => ({ n: i + 1, action: r[i] ?? "", edit: g[i] ?? "" }));
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Batch folder namer: YYYY-MM-DD_topic-slug/ */
export function folderName(date: string, topic: string): string {
  return `${date}_${slugify(topic) || "untitled"}/`;
}
