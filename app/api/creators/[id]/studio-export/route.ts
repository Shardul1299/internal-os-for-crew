// Exports a creator's Studio data (including archived rows) as JSON, for sending to the
// creator when consent is withdrawn (§4 Studio access). Owner and Crew lead only.
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getMe } from "@/lib/session";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getMe();
  if (!me || !["owner", "crew_lead"].includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const [creator] = await db.select({ id: s.creators.id, name: s.creators.displayName }).from(s.creators).where(eq(s.creators.id, id));
  if (!creator) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [profile, calendar, scripts, templates, hooks, outliers, carousels, posts] = await Promise.all([
    db.select().from(s.creatorProfiles).where(eq(s.creatorProfiles.creatorId, id)),
    db.select().from(s.creatorCalendarItems).where(eq(s.creatorCalendarItems.creatorId, id)),
    db.select().from(s.studioScripts).where(eq(s.studioScripts.creatorId, id)),
    db.select().from(s.studioScriptTemplates).where(eq(s.studioScriptTemplates.creatorId, id)),
    db.select().from(s.studioHookStacks).where(eq(s.studioHookStacks.creatorId, id)),
    db.select().from(s.studioOutliers).where(eq(s.studioOutliers.creatorId, id)),
    db.select().from(s.studioCarousels).where(eq(s.studioCarousels.creatorId, id)),
    db.select().from(s.studioPosts).where(eq(s.studioPosts.creatorId, id)),
  ]);
  const slides = carousels.length
    ? (await db.select().from(s.studioCarouselSlides)).filter((sl) => carousels.some((c) => c.id === sl.carouselId))
    : [];
  // Only the creator's own work: no tier, Filter, rates or Crew notes.
  const body = {
    creator: creator.name,
    exportedAt: new Date().toISOString(),
    profile: profile[0] ?? null,
    calendar: calendar.map((row) => ({ ...row, proposedByUserId: undefined })),
    scripts,
    templates,
    hookStacks: hooks,
    outliers,
    carousels: carousels.map((c) => ({ ...c, slides: slides.filter((sl) => sl.carouselId === c.id) })),
    posts,
  };
  const name = creator.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": `attachment; filename="studio-${name}.json"` },
  });
}
