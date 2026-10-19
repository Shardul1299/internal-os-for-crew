// Creator lifecycle — BRIEF §4. Follower counts are not an input anywhere in these rules.
import { type RulesConfig, gate, type GateResult, type Tier } from "./config";
import { addDays, addMonths, daysBetween, type ISODate } from "../dates";

export type Stage = "scout" | "watchlist" | "incubation" | "roster" | "alumni" | "revisit" | "declined";
export type Role =
  | "owner"
  | "crew_lead"
  | "ops"
  | "strategist"
  | "intern"
  | "sales_viewer"
  | "finance_viewer"
  | "program_counterpart"
  | "brand_user"
  | "creator_user";

export type FilterScore = { aesthetics: number; taste: number; personality: number; total: number; sentence: string; scoredAt: ISODate; context: string };

export type CreatorFacts = {
  stage: Stage;
  source: string;
  subCategory: string | null;
  consentStatus: "none" | "opted_in" | "withdrawn";
  representedElsewhere: boolean | null;
  isEmployedElsewhere: boolean;
  employerDisclosureUrl: string | null;
  isFounder: boolean;
  ownProductContentPct: number | null;
  filterScores: FilterScore[]; // any order
  tierSignalCount: number;
  topicFilterCount: number;
  hasAnchorPlan: boolean;
  programEntry?: { rank: number | null; topN: number } | null;
  ownerNote?: string | null;
  openDealCount?: number;
  unsettledPayoutCount?: number;
  agreementStatus?: "pilot" | "active" | "exit_window_open" | "exited" | null;
  pilotEndsOn?: ISODate | null;
};

export function scoreTotal(a: number, t: number, p: number) {
  return a + t + p;
}

export function validateFilterScore(s: { aesthetics: number; taste: number; personality: number; sentence: string }): GateResult {
  const r: string[] = [];
  for (const [k, v] of Object.entries({ aesthetics: s.aesthetics, taste: s.taste, personality: s.personality })) {
    if (!Number.isInteger(v) || v < 1 || v > 5) r.push(`${k} must be 1–5`);
  }
  const sentence = (s.sentence ?? "").trim();
  if (!sentence) r.push("One sentence is required");
  if (sentence.length > 200) r.push("Sentence is over 200 characters");
  return gate(r);
}

export function latestFilter(scores: FilterScore[]): FilterScore | null {
  if (!scores.length) return null;
  return [...scores].sort((a, b) => (a.scoredAt < b.scoredAt ? 1 : -1))[0];
}

/** A Filter fail can't be overridden by any other score or rule (§0.1 #2). */
export function filterPasses(cfg: RulesConfig, scores: FilterScore[], threshold: "watchlist" | "roster" = "roster"): boolean {
  const l = latestFilter(scores);
  return !!l && l.total >= cfg.filter[threshold];
}

function recentFilter(cfg: RulesConfig, scores: FilterScore[], today: ISODate): FilterScore | null {
  const l = latestFilter(scores);
  if (!l) return null;
  return daysBetween(l.scoredAt, today) <= cfg.n.filter_rescore_days ? l : null;
}

const CREW = new Set<Role>(["owner", "crew_lead"]);

export type TransitionTarget = "watchlist" | "incubation" | "roster" | "alumni" | "revisit" | "declined" | "return_roster";

/** Gate for each §4 transition. `approval` is true when the Owner is approving (roster, alumni → roster). */
export function canTransition(
  cfg: RulesConfig,
  c: CreatorFacts,
  to: TransitionTarget,
  ctx: { role: Role; today: ISODate; reason?: string | null; ownerApproval?: boolean },
): GateResult {
  const r: string[] = [];
  const isCrew = CREW.has(ctx.role);

  switch (to) {
    case "watchlist": {
      if (!isCrew) r.push("Only the Crew lead moves creators to Watchlist");
      if (c.stage !== "scout" && c.stage !== "revisit") r.push("Only Scout or Revisit creators move to Watchlist");
      const l = latestFilter(c.filterScores);
      if (!l) r.push("No Filter score");
      else if (l.total < cfg.filter.watchlist) r.push(`Filter ${l.total}/15 is below ${cfg.filter.watchlist}`);
      if (c.consentStatus !== "opted_in") r.push("Consent not opted in");
      if (c.source === "program" && c.programEntry) {
        const inTop = c.programEntry.rank != null && c.programEntry.rank <= c.programEntry.topN;
        if (!inTop && !(c.ownerNote && c.ownerNote.trim())) r.push(`Program entry outside top ${c.programEntry.topN} needs an Owner note`);
      }
      break;
    }
    case "incubation": {
      if (!isCrew) r.push("Only the Crew lead moves creators to Incubation");
      if (c.stage !== "watchlist") r.push("Only Watchlist creators move to Incubation");
      if (!filterPasses(cfg, c.filterScores, "watchlist")) r.push("Filter below threshold");
      if (!c.hasAnchorPlan) r.push("Anchor plan not set");
      if (c.topicFilterCount < 3) r.push(`${c.topicFilterCount} of 3 topic filters`);
      if (c.representedElsewhere == null) r.push("Representation not noted");
      if (c.consentStatus !== "opted_in") r.push("Consent not opted in");
      break;
    }
    case "roster": {
      if (!isCrew) r.push("Only the Crew lead proposes roster promotions");
      if (c.stage !== "incubation" && c.stage !== "watchlist") r.push("Only Incubation or Watchlist creators move to Roster");
      r.push(...rosterGate(cfg, c, ctx.today).missing.map((m) => m.reason));
      if (!ctx.ownerApproval) r.push("Needs Owner approval");
      else if (ctx.role !== "owner") r.push("Only the Owner approves roster promotions");
      break;
    }
    case "revisit": {
      if (!isCrew) r.push("Only the Crew lead sets Revisit");
      if (c.stage === "roster") r.push("Roster creators move to Alumni, not Revisit");
      break;
    }
    case "declined": {
      if (!isCrew) r.push("Only the Crew lead declines creators");
      if (!ctx.reason?.trim()) r.push("Reason required");
      break;
    }
    case "alumni": {
      if (!isCrew) r.push("Only the Crew lead moves creators to Alumni");
      if (c.stage !== "roster") r.push("Only Roster creators move to Alumni");
      if (!ctx.reason?.trim()) r.push("Reason required");
      if ((c.openDealCount ?? 0) > 0) r.push(`${c.openDealCount} open deals to close or reassign`);
      if ((c.unsettledPayoutCount ?? 0) > 0) r.push(`${c.unsettledPayoutCount} payouts unsettled`);
      break;
    }
    case "return_roster": {
      if (c.stage !== "alumni") r.push("Only Alumni return to Roster");
      if (ctx.role !== "owner") r.push("Needs Owner approval");
      break;
    }
  }
  return gate(r);
}

export type RosterGateItem = { key: string; label: string; reason: string };

/** The roster gate as a checklist, for the verdict line "Roster gate: 3 of 4 met · missing: Filter re-score". */
export function rosterGate(cfg: RulesConfig, c: CreatorFacts, today: ISODate): { met: RosterGateItem[]; missing: RosterGateItem[]; total: number } {
  const items: { item: RosterGateItem; ok: boolean }[] = [];
  const recent = recentFilter(cfg, c.filterScores, today);
  items.push({
    item: { key: "filter", label: "Filter re-score", reason: recent ? `Filter ${recent.total}/15 is below ${cfg.filter.roster}` : `Filter not re-scored in the last ${cfg.n.filter_rescore_days} days` },
    ok: !!recent && recent.total >= cfg.filter.roster,
  });
  items.push({ item: { key: "signals", label: "Tier signals", reason: `${c.tierSignalCount} of 2 tier signals` }, ok: c.tierSignalCount >= 2 });
  items.push({ item: { key: "exclusive", label: "Not represented elsewhere", reason: "Represented elsewhere (must be exclusive)" }, ok: c.representedElsewhere === false });
  if (c.isEmployedElsewhere) {
    items.push({ item: { key: "employer", label: "Employer disclosure", reason: "Employer disclosure missing" }, ok: !!c.employerDisclosureUrl });
  }
  if (c.isFounder) {
    items.push({
      item: { key: "founder", label: "Own-product content ≤ 70%", reason: "Own-product content over 70%" },
      ok: c.ownProductContentPct != null && c.ownProductContentPct <= 70,
    });
  }
  return { met: items.filter((i) => i.ok).map((i) => i.item), missing: items.filter((i) => !i.ok).map((i) => i.item), total: items.length };
}

export function rosterVerdict(g: ReturnType<typeof rosterGate>): string {
  if (g.missing.length === 0) return `Roster gate: ${g.total} of ${g.total} met`;
  return `Roster gate: ${g.met.length} of ${g.total} met · missing: ${g.missing.map((m) => m.label).join(", ")}`;
}

/** Side effects of entering a stage, as data. The action layer writes them. */
export function stageEffects(cfg: RulesConfig, to: TransitionTarget, today: ISODate) {
  switch (to) {
    case "incubation":
      return { tier: "T0" as Tier, firstLookUntil: addMonths(today, cfg.n.first_look_months) };
    case "roster":
      return {
        agreement: { status: "pilot" as const, pilotStartedOn: today, pilotEndsOn: addDays(today, cfg.n.pilot_days), exclusive: true },
      };
    case "revisit":
      return { revisitOn: addMonths(today, cfg.n.revisit_months) };
    default:
      return {};
  }
}

/** roster pilot → partnership (§4): Filter re-score + Owner approval → 24-month agreement with exit window at +12 months. */
export function canStartPartnership(cfg: RulesConfig, c: CreatorFacts, ctx: { role: Role; today: ISODate }): GateResult {
  const r: string[] = [];
  if (c.stage !== "roster") r.push("Only Roster creators");
  if (c.agreementStatus !== "pilot") r.push("Agreement is not in pilot");
  if (ctx.role !== "owner") r.push("Needs Owner approval");
  const recent = recentFilter(cfg, c.filterScores, ctx.today);
  if (!recent || recent.total < cfg.filter.roster) r.push("Filter re-score at pilot end missing or below threshold");
  return gate(r);
}

export function partnershipDates(cfg: RulesConfig, start: ISODate) {
  return {
    partnershipStartedOn: start,
    partnershipEndsOn: addMonths(start, cfg.n.partnership_months),
    exitWindowAt: addMonths(start, cfg.n.exit_window_months),
  };
}

/** Tier changes: Crew lead proposes with signals, Owner approves (§4, §0.1 #6). */
export function canApproveTier(ctx: { role: Role }, proposal: { tier: Tier | null; signalCount: number }): GateResult {
  const r: string[] = [];
  if (ctx.role !== "owner") r.push("Only the Owner approves tier changes");
  if (!proposal.tier) r.push("No tier proposed");
  if (proposal.tier && proposal.tier !== "T0" && proposal.signalCount < 1) r.push("Tier needs signal evidence");
  return gate(r);
}

export function canProposeTier(ctx: { role: Role }, signalCount: number, tier: Tier): GateResult {
  const r: string[] = [];
  if (!CREW.has(ctx.role)) r.push("Only the Crew lead proposes tiers");
  if (tier !== "T0" && signalCount < 1) r.push("Record at least one signal first");
  return gate(r);
}

/** Can this creator be put on a brand deal? Filter fail is final (§0.1 #2, #4). */
export function dealEligibility(cfg: RulesConfig, c: Pick<CreatorFacts, "stage" | "filterScores" | "representedElsewhere">, hasTier0Override: boolean): GateResult {
  const r: string[] = [];
  if (c.stage !== "roster") {
    if (c.stage === "incubation" && hasTier0Override) {
      // Tier 0 only with an override, at the T0 rung
    } else r.push(c.stage === "incubation" ? "Tier 0 creator needs a tier0_in_deal override" : "Creator is not on the roster");
  }
  if (!filterPasses(cfg, c.filterScores, "roster")) r.push("Below the Filter threshold");
  if (c.representedElsewhere !== false) r.push("Represented elsewhere");
  return gate(r);
}
