// Brand portal read model (BRIEF §1 Brand user, §8.3, §10, §19.6.7). Every query is scoped by the
// signed-in user's brandId. Nothing here carries tier, rung, Standard, commission, Filter, other brands,
// RED/GREEN script bodies or creator internals; payloads pass assertNoInternal in development.
import "server-only";
import { and, asc, desc, eq, inArray, isNull, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getConfig } from "@/lib/settings";
import { assertNoInternal } from "@/lib/rules/visibility";
import { credibilityTotals, type Credibility } from "@/lib/rules/campaigns";
import { isOverdue } from "@/lib/rules/money";
import { withBlockers } from "./deliverables";
import { deliverableLabel, feedbackQuestions } from "./campaigns";
import { today as todayISO, toISO } from "@/lib/dates";

function checked<T>(v: T): T {
  if (process.env.NODE_ENV !== "production") assertNoInternal(v);
  return v;
}

async function brandCampaigns(brandId: string) {
  return db
    .select({ id: s.campaigns.id, name: s.campaigns.name, status: s.campaigns.status, startsOn: s.campaigns.startsOn, endsOn: s.campaigns.endsOn, reportMd: s.campaigns.reportMd, reportUrl: s.campaigns.reportUrl, reportedAt: s.campaigns.reportedAt, feedbackRequestedAt: s.campaigns.feedbackRequestedAt })
    .from(s.campaigns)
    .where(and(eq(s.campaigns.brandId, brandId), isNull(s.campaigns.archivedAt)))
    .orderBy(desc(s.campaigns.startsOn));
}

async function creatorNames(ids: string[]) {
  if (!ids.length) return new Map<string, string>();
  const rows = await db.select({ id: s.creators.id, name: s.creators.displayName }).from(s.creators).where(inArray(s.creators.id, ids));
  return new Map(rows.map((r) => [r.id, r.name]));
}

export async function portalBrand(brandId: string) {
  const [b] = await db.select({ id: s.brands.id, name: s.brands.name }).from(s.brands).where(eq(s.brands.id, brandId));
  return b ?? null;
}

export type PortalDeliverable = {
  id: string;
  creatorName: string;
  deliverable: string;
  platform: string;
  dueOn: string | null;
  scheduledFor: string | null;
  status: string;
  liveUrl: string | null;
  disclosureStandard: string;
  claimsApproved: boolean;
  /** Blackout weeks are shown as a warning — creator-chosen, not contractual. */
  warning: string | null;
};

export async function portalCampaigns(brandId: string) {
  const camps = await brandCampaigns(brandId);
  const delivs = camps.length
    ? await db.select({ campaignId: s.deliverables.campaignId, status: s.deliverables.status }).from(s.deliverables).where(and(inArray(s.deliverables.campaignId, camps.map((c) => c.id)), isNull(s.deliverables.archivedAt)))
    : [];
  return checked(
    camps.map((c) => {
      const mine = delivs.filter((d) => d.campaignId === c.id && d.status !== "cancelled");
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        startsOn: c.startsOn,
        endsOn: c.endsOn,
        liveCount: mine.filter((d) => d.status === "live" || d.status === "reported").length,
        deliverableCount: mine.length,
        awaitingApproval: mine.filter((d) => d.status === "in_review").length,
      };
    }),
  );
}

export async function portalCampaign(brandId: string, campaignId: string) {
  const [c] = await db
    .select({ id: s.campaigns.id, name: s.campaigns.name, status: s.campaigns.status, startsOn: s.campaigns.startsOn, endsOn: s.campaigns.endsOn })
    .from(s.campaigns)
    .where(and(eq(s.campaigns.id, campaignId), eq(s.campaigns.brandId, brandId), isNull(s.campaigns.archivedAt)));
  if (!c) return null;
  const cfg = await getConfig();
  const rows = await db
    .select()
    .from(s.deliverables)
    .where(and(eq(s.deliverables.campaignId, c.id), isNull(s.deliverables.archivedAt), notInArray(s.deliverables.status, ["cancelled"])))
    .orderBy(asc(s.deliverables.dueOn));
  const [withB, names] = await Promise.all([withBlockers(cfg, rows), creatorNames([...new Set(rows.map((r) => r.creatorId))])]);
  const deliverables: PortalDeliverable[] = withB.map((d) => ({
    id: d.id,
    creatorName: d.channel === "frontseat" ? "Frontseat" : (names.get(d.creatorId) ?? "—"),
    deliverable: deliverableLabel(cfg, d.deliverableKey),
    platform: d.platform,
    dueOn: d.dueOn,
    scheduledFor: d.scheduledFor,
    status: d.status,
    liveUrl: d.status === "live" || d.status === "reported" ? d.liveUrl : null,
    disclosureStandard: d.disclosureStandard,
    claimsApproved: d.claimsApprovedByBrand,
    // Only the blackout warning crosses; blockers name creator internals (topic filters, ratio) and stay on Crew Desk.
    warning: d.warnings.find((w) => /blackout/i.test(w)) ?? null,
  }));
  return checked({ campaign: c, deliverables });
}

export type ClaimsView = { kind: "script" | "carousel" | "text"; lines: string[] };

/** Claims only (§19.6.7): spoken lines (BLACK) and on-screen text; never RED/GREEN or other work. */
async function claimsFor(d: typeof s.deliverables.$inferSelect): Promise<ClaimsView> {
  if (d.draftScriptId) {
    const [sc] = await db
      .select({ black: s.studioScripts.bodyBlack })
      .from(s.studioScripts)
      .where(and(eq(s.studioScripts.id, d.draftScriptId), eq(s.studioScripts.creatorId, d.creatorId)));
    if (sc?.black.trim()) return { kind: "script", lines: sc.black.split("\n").map((l) => l.trim()).filter(Boolean) };
  }
  if (d.draftCarouselId) {
    const [car] = await db
      .select({ id: s.studioCarousels.id })
      .from(s.studioCarousels)
      .where(and(eq(s.studioCarousels.id, d.draftCarouselId), eq(s.studioCarousels.creatorId, d.creatorId)));
    if (car) {
      const slides = await db.select().from(s.studioCarouselSlides).where(eq(s.studioCarouselSlides.carouselId, car.id)).orderBy(asc(s.studioCarouselSlides.slideNumber));
      const lines = slides.flatMap((sl) => [sl.headline, sl.supportingText].map((x) => x.trim()).filter(Boolean).map((x, i) => (i === 0 ? `${sl.slideNumber}. ${x}` : x)));
      if (lines.length) return { kind: "carousel", lines };
    }
  }
  return { kind: "text", lines: (d.draftMd ?? "").split("\n").map((l) => l.trim()).filter(Boolean) };
}

export async function portalApprovals(brandId: string) {
  const camps = await brandCampaigns(brandId);
  if (!camps.length) return checked([] as never[]);
  const cfg = await getConfig();
  const rows = await db
    .select()
    .from(s.deliverables)
    .where(and(inArray(s.deliverables.campaignId, camps.map((c) => c.id)), eq(s.deliverables.status, "in_review"), eq(s.deliverables.claimsApprovedByBrand, false), isNull(s.deliverables.archivedAt)))
    .orderBy(asc(s.deliverables.dueOn));
  const names = await creatorNames([...new Set(rows.map((r) => r.creatorId))]);
  const out = [];
  for (const d of rows) {
    out.push({
      id: d.id,
      campaignName: camps.find((c) => c.id === d.campaignId)?.name ?? "",
      title: d.title,
      creatorName: names.get(d.creatorId) ?? "—",
      deliverable: deliverableLabel(cfg, d.deliverableKey),
      dueOn: d.dueOn,
      round: Math.max(1, d.revisionRound),
      disclosureStandard: d.disclosureStandard,
      claims: await claimsFor(d),
      lastRequest: d.brandChangeRequestMd,
    });
  }
  return checked(out);
}

export async function portalReports(brandId: string) {
  const camps = (await brandCampaigns(brandId)).filter((c) => c.reportMd?.trim() || c.reportUrl?.trim());
  if (!camps.length) return checked([] as { id: string; name: string; reportMd: string | null; reportUrl: string | null; reportedAt: string | null; credibility: Credibility; posts: { id: string; title: string; liveUrl: string | null }[] }[]);
  const delivs = await db
    .select({ id: s.deliverables.id, campaignId: s.deliverables.campaignId, title: s.deliverables.title, liveUrl: s.deliverables.liveUrl, status: s.deliverables.status, channel: s.deliverables.channel })
    .from(s.deliverables)
    .where(and(inArray(s.deliverables.campaignId, camps.map((c) => c.id)), inArray(s.deliverables.status, ["live", "reported"]), isNull(s.deliverables.archivedAt)));
  const metrics = delivs.length
    ? await db.select().from(s.deliverableMetrics).where(and(inArray(s.deliverableMetrics.deliverableId, delivs.map((d) => d.id)), isNull(s.deliverableMetrics.archivedAt))).orderBy(desc(s.deliverableMetrics.capturedAt))
    : [];
  const latest = new Map<string, (typeof metrics)[number]>();
  for (const m of metrics) if (!latest.has(m.deliverableId)) latest.set(m.deliverableId, m);
  return checked(
    camps.map((c) => {
      const mine = delivs.filter((d) => d.campaignId === c.id && d.channel !== "frontseat");
      return {
        id: c.id,
        name: c.name,
        reportMd: c.reportMd,
        reportUrl: c.reportUrl,
        reportedAt: toISO(c.reportedAt),
        credibility: credibilityTotals(mine.map((d) => latest.get(d.id)).filter((m): m is NonNullable<typeof m> => !!m)),
        posts: mine.map((d) => ({ id: d.id, title: d.title, liveUrl: d.liveUrl })),
      };
    }),
  );
}

export async function portalInvoices(brandId: string) {
  const t = todayISO();
  const rows = await db
    .select({ i: s.invoices, dealTitle: s.deals.title })
    .from(s.invoices)
    .innerJoin(s.deals, eq(s.deals.id, s.invoices.dealId))
    .where(and(eq(s.deals.brandId, brandId), notInArray(s.invoices.status, ["draft", "void"]), isNull(s.invoices.archivedAt)))
    .orderBy(desc(s.invoices.issuedOn));
  return checked(
    rows.map(({ i, dealTitle }) => ({
      id: i.id,
      number: i.number,
      dealTitle,
      kind: i.kind,
      issuedOn: i.issuedOn,
      dueOn: i.dueOn,
      amountPaise: i.amountPaise,
      gstPct: i.gstPct,
      currency: i.currency,
      status: isOverdue(i.dueOn, i.status, t) ? "overdue" : i.status,
      paidOn: i.paidOn,
    })),
  );
}

export async function portalFeedback(brandId: string) {
  const camps = await brandCampaigns(brandId);
  const rows = await db
    .select({ id: s.brandFeedback.id, campaignId: s.brandFeedback.campaignId, kind: s.brandFeedback.kind, submittedOn: s.brandFeedback.submittedOn, q1: s.brandFeedback.q1, q2: s.brandFeedback.q2, q3: s.brandFeedback.q3, q4: s.brandFeedback.q4, q5: s.brandFeedback.q5, nps: s.brandFeedback.nps, comment: s.brandFeedback.comment })
    .from(s.brandFeedback)
    .where(and(eq(s.brandFeedback.brandId, brandId), isNull(s.brandFeedback.archivedAt)))
    .orderBy(desc(s.brandFeedback.submittedOn));
  const questions = await feedbackQuestions();
  const submittedFor = new Set(rows.filter((r) => r.kind === "campaign_5q" && r.campaignId).map((r) => r.campaignId));
  const lastNps = rows.find((r) => r.kind === "nps");
  return checked({
    questions,
    awaiting: camps.filter((c) => c.feedbackRequestedAt && !submittedFor.has(c.id)).map((c) => ({ id: c.id, name: c.name, requestedOn: toISO(c.feedbackRequestedAt) })),
    surveys: rows.filter((r) => r.kind === "campaign_5q").map((r) => ({ ...r, campaignName: camps.find((c) => c.id === r.campaignId)?.name ?? "—" })),
    npsHistory: rows.filter((r) => r.kind === "nps"),
    lastNpsOn: lastNps?.submittedOn ?? null,
  });
}

export async function portalCounts(brandId: string) {
  const camps = await brandCampaigns(brandId);
  if (!camps.length) return { approvals: 0, feedback: 0 };
  const [pending, fb] = await Promise.all([
    db
      .select({ id: s.deliverables.id })
      .from(s.deliverables)
      .where(and(inArray(s.deliverables.campaignId, camps.map((c) => c.id)), eq(s.deliverables.status, "in_review"), eq(s.deliverables.claimsApprovedByBrand, false), isNull(s.deliverables.archivedAt))),
    db.select({ campaignId: s.brandFeedback.campaignId }).from(s.brandFeedback).where(and(eq(s.brandFeedback.brandId, brandId), eq(s.brandFeedback.kind, "campaign_5q"))),
  ]);
  const done = new Set(fb.map((f) => f.campaignId));
  return { approvals: pending.length, feedback: camps.filter((c) => c.feedbackRequestedAt && !done.has(c.id)).length };
}
