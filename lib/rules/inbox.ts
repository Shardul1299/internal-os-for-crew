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
