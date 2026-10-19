// Creator Studio rules — BRIEF §19.2, §19.3, §19.4, §19.6.7, §19.12, §19.16, §20.
import { type RulesConfig, gate, type GateResult } from "./config";
import { addDays, type ISODate } from "../dates";

export type CalendarItemLite = { date: ISODate; kind: string; pillar: string | null; conceptBucket: string | null; studioStatus: string; funnelStage?: string | null };

export type RatioMeter = { key: string; label: string; actual: number; target: number; off: boolean };

function share(n: number, total: number) {
  return total ? Math.round((n / total) * 100) : 0;
}

/** Pillar and concept meters (warnings only) and the sponsored meter for the month (§19.2). */
export function ratioMeters(
  cfg: RulesConfig,
  items: CalendarItemLite[],
  profile: { pillarRatio: { authority: number; journey: number }; conceptRatio: { proven: number; double_down: number; experimental: number } },
  sponsoredMax: number,
): { pillar: RatioMeter[]; concept: RatioMeter[]; sponsored: { actual: number; max: number; headroom: number; total: number } } {
  const content = items.filter((i) => i.kind !== "blackout" && i.kind !== "shoot");
  const organicish = content.filter((i) => i.kind !== "sponsored");
  const tol = cfg.n.ratio_warning_points;
  const pillar = (["authority", "journey"] as const).map((k) => {
    const actual = share(organicish.filter((i) => (i.pillar ?? "authority") === k).length, organicish.length);
    const target = profile.pillarRatio[k];
    return { key: k, label: k === "authority" ? "Authority" : "Journey", actual, target, off: organicish.length > 0 && Math.abs(actual - target) > tol };
  });
  const concept = (["proven", "double_down", "experimental"] as const).map((k) => {
    const actual = share(organicish.filter((i) => (i.conceptBucket ?? "proven") === k).length, organicish.length);
    const target = profile.conceptRatio[k];
    return { key: k, label: k === "double_down" ? "Double down" : k === "proven" ? "Proven" : "Experimental", actual, target, off: organicish.length > 0 && Math.abs(actual - target) > tol };
  });
  const sponsoredCount = content.filter((i) => i.kind === "sponsored").length;
  const total = content.length;
  // How many more sponsored items fit before the share passes the max.
  let headroom = 0;
  while ((sponsoredCount + headroom + 1) / (total + headroom + 1) <= sponsoredMax + 1e-9) headroom++;
  return { pillar, concept, sponsored: { actual: total ? sponsoredCount / total : 0, max: sponsoredMax, headroom, total } };
}

/** Concept split defaults by account status: new → 90/0/10, established → 70/20/10. */
export function conceptDefaults(status: "new" | "established") {
  return status === "new" ? { proven: 90, double_down: 0, experimental: 10 } : { proven: 70, double_down: 20, experimental: 10 };
}

/** An outlier is a reel that got at least 5× more views than the creator's followers (§19.4). */
export function outlierMultiple(views: number, followers: number): number {
  return Math.round((views / Math.max(followers, 1)) * 10) / 10;
}

export function isOutlier(cfg: RulesConfig, views: number, followers: number): boolean {
  return outlierMultiple(views, followers) >= cfg.n.outlier_threshold;
}

/** Own posts above the creator's average, or at 5× their followers, are double-down candidates (§19.12). */
export function doubleDownCandidates<T extends { id: string; views: number; followersAtPost: number }>(cfg: RulesConfig, posts: T[]): Set<string> {
  if (!posts.length) return new Set();
  const avg = posts.reduce((t, p) => t + p.views, 0) / posts.length;
  return new Set(posts.filter((p) => p.views > avg || isOutlier(cfg, p.views, p.followersAtPost)).map((p) => p.id));
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Topic filters matched as whole words or phrases anywhere in a draft. */
export function textTopicConflicts(text: string, filters: { kind: string; value: string }[]): string[] {
  return filters.filter((f) => f.value.trim() && new RegExp(`\\b${esc(f.value.trim())}\\b`, "i").test(text)).map((f) => `${f.kind}: ${f.value}`);
}

const DISCLOSURE: Record<string, RegExp> = {
  asci: /#ad\b|#sponsored|paid partnership|sponsored|collab/i,
  ftc: /#ad\b|#sponsored|paid partnership|sponsored/i,
  both: /#ad\b|#sponsored|paid partnership|sponsored/i,
};

export function disclosureLine(standard: "asci" | "ftc" | "both") {
  return standard === "asci" ? "Disclosure: label as Paid partnership / #ad per ASCI guidelines, visible in the first frame." : standard === "ftc" ? "Disclosure: Paid partnership tag + #ad per FTC guidance, clear and early." : "Disclosure: Paid partnership tag + #ad (ASCI and FTC), visible in the first frame.";
}

/** Submit a sponsored draft (§19.6.7): topic filters and the disclosure line are hard checks. */
export function canSubmitSponsoredDraft(args: {
  text: string;
  green: string;
  topicFilters: { kind: string; value: string }[];
  disclosureStandard: "asci" | "ftc" | "both";
  deliverableStatus: string;
}): GateResult {
  const r: string[] = [];
  if (!["briefed", "drafting"].includes(args.deliverableStatus)) r.push("Draft already submitted");
  if (!args.text.trim()) r.push("Draft is empty");
  const hits = textTopicConflicts(args.text, args.topicFilters);
  if (hits.length) r.push(`Topic filter: ${hits[0]}`);
  if (!DISCLOSURE[args.disclosureStandard].test(args.green)) r.push("Disclosure line missing in GREEN");
  return gate(r);
}

/** Calendar adherence = posted ÷ planned non-blackout items in the last N weeks (§20). */
export function calendarAdherence(items: CalendarItemLite[], today: ISODate, weeks = 8): number | null {
  const start = addDays(today, -weeks * 7);
  const planned = items.filter((i) => i.date >= start && i.date <= today && i.kind !== "blackout" && i.kind !== "shoot");
  if (!planned.length) return null;
  return planned.filter((i) => i.studioStatus === "posted").length / planned.length;
}

/** Studio access starts at incubation and stays at roster; alumni keep content with Deals read-only (§19.16). */
export function studioAccess(stage: string, consent: string): { content: boolean; deals: "write" | "read" | "none" } {
  if (consent === "withdrawn") return { content: false, deals: "none" };
  if (stage === "incubation" || stage === "roster") return { content: true, deals: "write" };
  if (stage === "alumni") return { content: true, deals: "read" };
  return { content: false, deals: "none" };
}

/** Sponsored item dates are Crew-only; the creator may change status and the live URL (§19.3). */
export function creatorCanEditCalendarField(kind: string, field: string): boolean {
  if (kind !== "sponsored") return true;
  return field === "studioStatus" || field === "liveUrl" || field === "notes";
}

export function funnelDistribution(items: { funnelStage?: string | null; kind: string }[]) {
  const c = { tofu: 0, mofu: 0, bofu: 0 };
  for (const i of items) if (i.kind !== "blackout" && i.kind !== "shoot") c[(i.funnelStage as "tofu" | "mofu" | "bofu") ?? "tofu"]++;
  return c;
}
