// Inbox — brand inbound handled on the creator's behalf (BRIEF §6). Communication only.
import { type RulesConfig, gate, type GateResult } from "./config";

export function slaDueAt(cfg: RulesConfig, receivedAt: Date): Date {
  return new Date(receivedAt.getTime() + cfg.n.inbox_sla_hours * 3600_000);
}

export function isPastSla(t: { slaDueAt: Date; status: string }, now: Date = new Date()): boolean {
  return t.status !== "replied" && t.status !== "converted" && t.status !== "declined" && t.status !== "spam" && now > t.slaDueAt;
}

/** Stays in Today until replied. */
export function needsReply(t: { status: string }): boolean {
  return t.status === "new" || t.status === "triaged";
}

export function conversionDefaults(t: { creatorId: string | null }) {
  return t.creatorId
    ? { origin: "creator_inbound" as const, originatingCreatorId: t.creatorId }
    : { origin: "crew_originated" as const, originatingCreatorId: null };
}

export function canConvert(t: { brandId: string | null; status: string; noListPrescreen: Record<string, boolean> | null }): GateResult {
  const r: string[] = [];
  if (!t.brandId) r.push("Identify the brand first");
  if (!t.noListPrescreen) r.push("Pre-screen the NO list first");
  if (t.status === "converted") r.push("Already converted");
  return gate(r);
}

export function canForward(t: { creatorId: string | null }): GateResult {
  return gate(t.creatorId ? [] : ["Thread isn't addressed to a creator"]);
}

// ---------- Gmail capture by forwarding address (§6.1, §11) ----------
// Each creator has a forwarding address `<handle>@<domain>`; Gmail forwards brand mail to it and
// the inbound webhook routes the thread to that creator. Anything else is addressed to Crew.

export function normaliseHandle(handle: string): string {
  return handle.trim().replace(/^@+/, "").toLowerCase();
}

export function forwardingAddress(handle: string, domain: string): string {
  return `${normaliseHandle(handle)}@${domain.toLowerCase()}`;
}

/** Pulls the bare address out of `Name <a@b>` or a comma-separated list; first match on our domain wins. */
export function forwardedHandle(to: string, domain: string): string | null {
  const addrs = to.match(/[^\s<>,;"]+@[^\s<>,;"]+/g) ?? [];
  for (const a of addrs) {
    const [local, host] = a.toLowerCase().split("@");
    if (host === domain.toLowerCase() && local) return local;
  }
  return null;
}

/** Matches a forwarded handle to one creator; ambiguous or unknown handles route to Crew. */
export function routeInbound(to: string, domain: string, creators: { id: string; handles: string[] }[]): string | null {
  const h = forwardedHandle(to, domain);
  if (!h) return null;
  const hits = creators.filter((c) => c.handles.some((x) => normaliseHandle(x) === h));
  return hits.length === 1 ? hits[0].id : null;
}

export const NO_LIST_KEYS = ["rev_share_only", "no_budget_educational", "barter", "lifetime_rights", "shady_tool"] as const;

/** Pre-screen (§6.3): five NO-list toggles + blocklist. Any flag means the deal won't qualify without an Owner override. */
export function prescreenFlags(p: Record<string, boolean | string | null> | null): string[] {
  if (!p) return [];
  const flags = NO_LIST_KEYS.filter((k) => p[k] === true).map((k) => k.replace(/_/g, " "));
  const bl = p.blocklist_category;
  if (typeof bl === "string" && bl) flags.push(`blocklist ${bl.replace(/_/g, " ")}`);
  return flags;
}
