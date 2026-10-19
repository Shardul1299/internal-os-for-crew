// Today — what needs doing (§2, §10): blocked deliverables, deals awaiting PO/advance, inbox
// awaiting reply, check-ins, payouts, revisit dates, pipeline moves, approvals for the Owner.
import "server-only";
import { and, asc, eq, inArray, isNull, lte, notInArray, isNotNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getConfig } from "@/lib/settings";
import { withBlockers } from "./deliverables";
import { addDays, today as todayISO, daysBetween, toISO } from "@/lib/dates";
import { isPastSla } from "@/lib/rules/inbox";
import { isOverdue } from "@/lib/rules/money";
import { can } from "@/lib/rules/visibility";

export type TodayRow = { id: string; title: string; lead: string; meta?: string; href: string; alert?: boolean };
export type TodaySection = { key: string; title: string; rows: TodayRow[] };

export async function getToday(role: string): Promise<TodaySection[]> {
  const cfg = await getConfig();
  const today = todayISO();
  const soon = addDays(today, 7);
  const now = new Date();

  const [threads, checkins, payouts, revisits, dealsOpen, invoices, overrides, rosterProposals, delivRows] = await Promise.all([
    db.select({ t: s.inboxThreads, c: s.creators.displayName }).from(s.inboxThreads).leftJoin(s.creators, eq(s.creators.id, s.inboxThreads.creatorId)).where(and(inArray(s.inboxThreads.status, ["new", "triaged"]), isNull(s.inboxThreads.archivedAt))).orderBy(asc(s.inboxThreads.slaDueAt)),
    db.select({ k: s.creatorCheckins, c: s.creators.displayName }).from(s.creatorCheckins).innerJoin(s.creators, eq(s.creators.id, s.creatorCheckins.creatorId)).where(and(isNull(s.creatorCheckins.heldOn), lte(s.creatorCheckins.dueOn, soon), isNull(s.creatorCheckins.archivedAt))).orderBy(asc(s.creatorCheckins.dueOn)),
    db.select({ p: s.creatorPayouts, c: s.creators.displayName }).from(s.creatorPayouts).innerJoin(s.creators, eq(s.creators.id, s.creatorPayouts.creatorId)).where(and(eq(s.creatorPayouts.status, "due"), lte(s.creatorPayouts.dueOn, soon), isNull(s.creatorPayouts.archivedAt))).orderBy(asc(s.creatorPayouts.dueOn)),
    db.select().from(s.creators).where(and(isNotNull(s.creators.revisitOn), lte(s.creators.revisitOn, soon), eq(s.creators.stage, "revisit"), isNull(s.creators.archivedAt))).orderBy(asc(s.creators.revisitOn)),
    db.select({ d: s.deals, b: s.brands.name }).from(s.deals).innerJoin(s.brands, eq(s.brands.id, s.deals.brandId)).where(and(notInArray(s.deals.stage, ["paid_in_full", "declined", "lost"]), isNull(s.deals.archivedAt))),
    db.select({ i: s.invoices, b: s.brands.name, title: s.deals.title }).from(s.invoices).innerJoin(s.deals, eq(s.deals.id, s.invoices.dealId)).innerJoin(s.brands, eq(s.brands.id, s.deals.brandId)).where(and(inArray(s.invoices.status, ["sent", "overdue"]), isNull(s.invoices.archivedAt))),
    db.select({ o: s.dealOverrides, title: s.deals.title }).from(s.dealOverrides).innerJoin(s.deals, eq(s.deals.id, s.dealOverrides.dealId)).where(and(isNull(s.dealOverrides.approvedAt), isNull(s.dealOverrides.rejectedAt))),
    db.select().from(s.creators).where(and(isNotNull(s.creators.rosterProposedAt), isNull(s.creators.rosterApprovedBy), inArray(s.creators.stage, ["incubation", "watchlist"]))),
    db.select().from(s.deliverables).where(and(notInArray(s.deliverables.status, ["live", "reported", "cancelled"]), isNull(s.deliverables.archivedAt), or(lte(s.deliverables.dueOn, addDays(today, 14)), inArray(s.deliverables.status, ["approved", "scheduled"])))),
  ]);

  const deliverables = await withBlockers(cfg, delivRows);
  const creatorNames = new Map(
    (deliverables.length ? await db.select({ id: s.creators.id, n: s.creators.displayName }).from(s.creators).where(inArray(s.creators.id, deliverables.map((d) => d.creatorId))) : []).map((r) => [r.id, r.n]),
  );

  const sections: TodaySection[] = [];

  if (role === "owner") {
    sections.push({
      key: "approvals",
      title: "Approvals",
      rows: [
        ...overrides.map(({ o, title }) => ({ id: o.id, title: `${o.kind.replace(/_/g, " ")} override — ${title}`, lead: "Override", meta: o.reason.slice(0, 48), href: `/deals/${o.dealId}?step=overrides` })),
        ...rosterProposals.map((c) => ({ id: c.id, title: `${c.displayName} to Roster`, lead: "Roster", href: `/creators/${c.id}?tab=filter` })),
      ],
    });
  }

  sections.push({
    key: "blocked",
    title: "Blocked",
    rows: deliverables
      .filter((d) => d.blockers.length && (d.status === "approved" || (d.dueOn && d.dueOn <= addDays(today, 7))))
      .map((d) => ({ id: d.id, title: `${creatorNames.get(d.creatorId) ?? ""} · ${d.title}`, lead: "Blocked", meta: d.blockers[0], href: `/campaigns/${d.campaignId}?sel=${d.id}`, alert: true })),
  });

  const awaiting: TodayRow[] = [];
  for (const { d, b } of dealsOpen) {
    if (d.stage === "signed") awaiting.push({ id: d.id, title: `${b} · ${d.title}`, lead: "Advance", meta: `${daysBetween(toISO(d.stageChangedAt)!, today)}d since signature`, href: `/deals/${d.id}` });
    if (d.stage === "advance_received" && !d.poReference && !d.confirmationUrl) awaiting.push({ id: `${d.id}-po`, title: `${b} · ${d.title}`, lead: "PO", meta: "PO or confirmation missing", href: `/deals/${d.id}` });
  }
  for (const { i, b, title } of invoices) {
    if (isOverdue(i.dueOn, i.status, today)) awaiting.push({ id: i.id, title: `${b} · ${title}`, lead: "Overdue", meta: `${i.kind} ${daysBetween(i.dueOn, today)}d late`, href: `/deals/${i.dealId}?step=money`, alert: true });
  }
  sections.push({ key: "money", title: "Awaiting money", rows: awaiting });

  sections.push({
    key: "inbox",
    title: "Inbox due",
    rows: threads.map(({ t, c }) => {
      const late = isPastSla({ slaDueAt: t.slaDueAt, status: t.status }, now);
      const hrs = Math.round((t.slaDueAt.getTime() - now.getTime()) / 3600_000);
      return { id: t.id, title: `${t.subject || t.firstMessageMd.slice(0, 60)}${c ? ` · for ${c}` : ""}`, lead: late ? "Past SLA" : `${hrs}h left`, meta: t.channel.replace("_", " "), href: `/inbox?sel=${t.id}`, alert: late };
    }),
  });

  sections.push({
    key: "checkins",
    title: "Check-ins",
    rows: checkins.map(({ k, c }) => ({ id: k.id, title: `${c} · ${k.type.replace("_", " ")}`, lead: k.dueOn < today ? "Overdue" : k.dueOn, meta: undefined, href: `/creators/${k.creatorId}?tab=checkins`, alert: k.dueOn < today })),
  });

  if (can(role, "money")) {
    sections.push({
      key: "payouts",
      title: "Payouts due",
      rows: payouts.map(({ p, c }) => ({ id: p.id, title: `${c} · ${p.kind.replace("_", " ")}`, lead: p.dueOn < today ? "Overdue" : p.dueOn, meta: `₹${Math.round(p.amountPaise / 100).toLocaleString("en-IN")}`, href: `/money?sel=${p.id}`, alert: p.dueOn < today })),
    });
  }

  sections.push({ key: "revisits", title: "Revisits", rows: revisits.map((c) => ({ id: c.id, title: c.displayName, lead: c.revisitOn!, href: `/creators/${c.id}` })) });

  const stale = dealsOpen.filter(({ d }) => daysBetween(toISO(d.stageChangedAt)!, today) >= 7).sort((a, b) => (a.d.stageChangedAt < b.d.stageChangedAt ? -1 : 1));
  sections.push({
    key: "pipeline",
    title: "Pipeline moves",
    rows: stale.slice(0, 12).map(({ d, b }) => ({ id: d.id, title: `${b} · ${d.title}`, lead: d.stage.replace(/_/g, " "), meta: `${daysBetween(toISO(d.stageChangedAt)!, today)}d in stage`, href: `/deals/${d.id}` })),
  });

  return sections;
}

export async function getNavCounts() {
  const now = new Date();
  const threads = await db.select({ sla: s.inboxThreads.slaDueAt, status: s.inboxThreads.status }).from(s.inboxThreads).where(and(inArray(s.inboxThreads.status, ["new", "triaged"]), isNull(s.inboxThreads.archivedAt)));
  return { inbox: threads.length, inboxLate: threads.some((t) => isPastSla({ slaDueAt: t.sla, status: t.status }, now)) };
}
