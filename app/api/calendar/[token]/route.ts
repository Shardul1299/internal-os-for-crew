// ICS feed for Google Calendar (§11): check-ins, Sunday shoots and the weekly Monday pipeline review.
// The token is the only credential (no session cookie): /api/calendar must be listed in proxy.ts PUBLIC.
import { and, eq, gte, isNull, lte, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { verifyCalendarToken, buildIcs, type IcsEvent } from "@/lib/calendar";
import { addDays, today as todayISO } from "@/lib/dates";
import { CREW_ROLES } from "@/lib/session";

export const dynamic = "force-dynamic";

const CHECKIN_LABEL: Record<string, string> = {
  quarterly: "Quarterly check-in",
  strategy_refresh: "Strategy refresh",
  roadmap: "Roadmap check-in",
  adhoc: "Check-in",
  pilot_end: "Pilot-end review",
  exit_window: "Exit-window review",
};

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const userId = verifyCalendarToken(token);
  if (!userId) return new Response("Not found", { status: 404 });
  const [user] = await db.select().from(s.users).where(eq(s.users.id, userId));
  if (!user || !user.active) return new Response("Not found", { status: 404 });

  const t = todayISO();
  const from = addDays(t, -30);
  const to = addDays(t, 180);
  const isCrew = CREW_ROLES.includes(user.role);
  const events: IcsEvent[] = [];

  // Check-ins: Crew sees all; a creator user sees their own.
  if (isCrew || (user.role === "creator_user" && user.creatorId)) {
    const rows = await db
      .select({ k: s.creatorCheckins, name: s.creators.displayName })
      .from(s.creatorCheckins)
      .innerJoin(s.creators, eq(s.creators.id, s.creatorCheckins.creatorId))
      .where(
        and(
          isNull(s.creatorCheckins.archivedAt),
          isNull(s.creatorCheckins.heldOn),
          gte(s.creatorCheckins.dueOn, from),
          lte(s.creatorCheckins.dueOn, to),
          ...(isCrew ? [] : [eq(s.creatorCheckins.creatorId, user.creatorId!)]),
        ),
      );
    for (const { k, name } of rows) {
      events.push({ uid: `checkin-${k.id}`, title: `${CHECKIN_LABEL[k.type] ?? "Check-in"} · ${name}`, date: k.dueOn, description: "60 minutes. Template in Snoball OS." });
    }
  }

  // Sunday shoots: Crew sees all; creators their own; the counterpart their cohorts' shoots.
  if (isCrew || user.role === "creator_user" || user.role === "program_counterpart") {
    const shoots = await db.select().from(s.programSundayShoots).where(and(isNull(s.programSundayShoots.archivedAt), gte(s.programSundayShoots.date, from), lte(s.programSundayShoots.date, to)));
    let visible = shoots;
    if (user.role === "creator_user") visible = shoots.filter((sh) => user.creatorId && sh.creators.includes(user.creatorId));
    if (user.role === "program_counterpart") {
      const cohorts = user.cohortIds ?? [];
      const members = cohorts.length
        ? new Set(
            (
              await db
                .selectDistinct({ id: s.programEntries.creatorId })
                .from(s.programEntries)
                .innerJoin(s.programChallenges, eq(s.programChallenges.id, s.programEntries.challengeId))
                .where(and(inArray(s.programChallenges.cohortId, cohorts), eq(s.programEntries.consentStatus, "opted_in")))
            ).map((r) => r.id),
          )
        : new Set<string>();
      visible = shoots.filter((sh) => (sh.cohortId && cohorts.includes(sh.cohortId)) || sh.creators.some((c) => members.has(c)));
    }
    for (const sh of visible) {
      events.push({ uid: `shoot-${sh.id}`, title: "Sunday shoot", date: sh.date, location: sh.location, description: `${sh.creators.length} creators` });
    }
  }

  // Weekly pipeline review: Monday 10:00 IST, 30 minutes, for the Crew Desk.
  if (isCrew && user.role !== "intern") {
    const d = new Date(`${t}T00:00:00Z`);
    const dow = d.getUTCDay();
    const monday = addDays(t, dow === 1 ? 0 : (8 - dow) % 7);
    events.push({ uid: "pipeline-review-weekly", title: "Pipeline review", start: `${monday}T10:00`, minutes: 30, rrule: "FREQ=WEEKLY;BYDAY=MO", description: "30 minutes. Deals board, Today, blockers." });
  }

  const body = buildIcs(`Snoball OS · ${user.name ?? user.email ?? ""}`, events);
  return new Response(body, { headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "private, max-age=900" } });
}
