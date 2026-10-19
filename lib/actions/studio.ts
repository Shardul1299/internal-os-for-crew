"use server";
// Creator Studio — Profile and first-run onboarding (BRIEF §19.1). The creator_id always comes
// from the session (studioActor), never from the form.
import { z } from "zod";
import { and, eq, isNull, ilike, ne } from "drizzle-orm";
import * as s from "@/lib/db/schema";
import { withUser, type Tx } from "@/lib/db/tx";
import { guard, ok, fail, type ActionResult } from "./result";
import { studioActor, ensureProfile } from "@/lib/queries/studio";
import { conceptDefaults } from "@/lib/rules/studio";
import { today } from "@/lib/dates";
import { formObject, list, parse, revalidateStudio, text, url, optCount } from "./studio-helpers";

const hex = z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colours are #RRGGBB")]).default("");

/** Followers live on creator_platforms as grey metadata, never on the Profile (§19.1). */
async function writeFollowers(tx: Tx, creatorId: string, userId: string, handle: string, followers: number | null) {
  if (followers == null && !handle) return;
  const [p] = await tx
    .select({ id: s.creatorPlatforms.id })
    .from(s.creatorPlatforms)
    .where(and(eq(s.creatorPlatforms.creatorId, creatorId), eq(s.creatorPlatforms.platform, "instagram"), isNull(s.creatorPlatforms.archivedAt)));
  const clean = handle.replace(/^@/, "").trim();
  if (clean) {
    // A handle belongs to one creator: inbound mail is routed by it (§6).
    const [taken] = await tx
      .select({ id: s.creatorPlatforms.id })
      .from(s.creatorPlatforms)
      .where(and(eq(s.creatorPlatforms.platform, "instagram"), ilike(s.creatorPlatforms.handle, clean), ne(s.creatorPlatforms.creatorId, creatorId), isNull(s.creatorPlatforms.archivedAt)))
      .limit(1);
    if (taken) throw new Error("That handle is already linked to another creator. Ask Crew to check it.");
  }
  if (p) {
    await tx
      .update(s.creatorPlatforms)
      .set({ ...(clean ? { handle: clean, url: `https://instagram.com/${clean}` } : {}), ...(followers != null ? { followers, followersAsOf: today() } : {}) })
      .where(eq(s.creatorPlatforms.id, p.id));
  } else if (clean) {
    await tx.insert(s.creatorPlatforms).values({ creatorId, platform: "instagram", handle: clean, url: `https://instagram.com/${clean}`, followers, followersAsOf: followers != null ? today() : null, isPrimary: true, createdBy: userId });
  }
}

const Onboarding = z.object({
  handle: text(80),
  nameField: text(160),
  niche: text(160),
  subniches: text(600),
  occupation: text(160),
  bioLink: url,
  founderStory: text(4000),
  followers: optCount,
  accountStatus: z.enum(["new", "established"]).default("new"),
  timesPerWeek: text(20),
});

export async function completeOnboarding(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const i = parse(Onboarding, formObject(fd));
    await ensureProfile(ctx);
    await withUser(ctx.me.id, async (tx) => {
      await tx
        .update(s.creatorProfiles)
        .set({
          handle: i.handle.replace(/^@/, ""),
          nameField: i.nameField,
          niche: i.niche,
          subniches: list(i.subniches),
          occupation: i.occupation,
          bioLink: i.bioLink,
          founderStory: i.founderStory,
          accountStatus: i.accountStatus,
          conceptRatio: conceptDefaults(i.accountStatus),
          postingCadence: { tier: "light", times_per_week: i.timesPerWeek || "1-2", days: [] },
          onboardingComplete: true,
        })
        .where(eq(s.creatorProfiles.creatorId, ctx.creatorId));
      await writeFollowers(tx, ctx.creatorId, ctx.me.id, i.handle, i.followers);
    });
    revalidateStudio();
    return ok("Profile set up", { redirect: "/studio/today" });
  });
}

export async function skipOnboarding(_prev?: ActionResult | null, _fd?: FormData): Promise<ActionResult> {
  void _prev;
  void _fd;
  return guard(async () => {
    const ctx = await studioActor();
    await ensureProfile(ctx);
    await withUser(ctx.me.id, (tx) => tx.update(s.creatorProfiles).set({ onboardingComplete: true }).where(eq(s.creatorProfiles.creatorId, ctx.creatorId)));
    revalidateStudio();
    return ok(undefined, { redirect: "/studio/today" });
  });
}

const pct = z.coerce.number().int().min(0).max(100);

const Profile = z.object({
  handle: text(80),
  nameField: text(160),
  niche: text(160),
  subniches: text(600),
  occupation: text(160),
  founderStory: text(4000),
  bioLink: url,
  c_background: hex,
  c_foreground: hex,
  c_muted: hex,
  c_border: hex,
  c_color4: hex,
  c_color5: hex,
  fontHeading: text(80),
  fontBody: text(80),
  assetTypes: text(600),
  followers: optCount,
  accountStatus: z.enum(["new", "established"]),
  cadenceTier: z.enum(["light", "steady", "heavy"]).default("light"),
  timesPerWeek: text(20),
  days: z.array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])).default([]),
  authority: pct,
  proven: pct,
  doubleDown: pct,
  experimental: pct,
  hookPrefs: z.array(z.enum(["verbal", "written", "visual"])).default([]),
  formatPrefs: z.array(z.string().max(40)).default([]),
  ctaStatus: z.enum(["undecided", "follow", "engagement", "manychat", "none"]).default("undecided"),
  manychatSetup: z.string().optional(),
  proprietaryValue: text(4000),
  journeyAssets: text(4000),
  humanAlpha: text(4000),
  equipment: text(2000),
  aiStack: text(2000),
  automateWorkflows: text(2000),
});

export async function saveProfile(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const i = parse(Profile, formObject(fd, ["days", "hookPrefs", "formatPrefs"]));
    if (i.proven + i.doubleDown + i.experimental !== 100) return fail("Concept ratio must add up to 100");
    const current = await ensureProfile(ctx);
    // Account status sets the concept split (new → 90/0/10, established → 70/20/10) unless the creator typed their own.
    let concept = { proven: i.proven, double_down: i.doubleDown, experimental: i.experimental };
    const untouched = concept.proven === current.conceptRatio.proven && concept.double_down === current.conceptRatio.double_down && concept.experimental === current.conceptRatio.experimental;
    if (i.accountStatus !== current.accountStatus && untouched) concept = conceptDefaults(i.accountStatus);
    const colors = { background: i.c_background, foreground: i.c_foreground, muted: i.c_muted, border: i.c_border, color4: i.c_color4, color5: i.c_color5 };
    await withUser(ctx.me.id, async (tx) => {
      await tx
        .update(s.creatorProfiles)
        .set({
          handle: i.handle.replace(/^@/, ""),
          nameField: i.nameField,
          niche: i.niche,
          subniches: list(i.subniches),
          occupation: i.occupation,
          founderStory: i.founderStory,
          bioLink: i.bioLink,
          colors: Object.values(colors).some(Boolean) ? colors : null,
          fonts: i.fontHeading || i.fontBody ? { heading: i.fontHeading, body: i.fontBody } : null,
          assetTypes: list(i.assetTypes),
          accountStatus: i.accountStatus,
          postingCadence: { tier: i.cadenceTier, times_per_week: i.timesPerWeek, days: i.days },
          pillarRatio: { authority: i.authority, journey: 100 - i.authority },
          conceptRatio: concept,
          hookPrefs: i.hookPrefs,
          formatPrefs: i.formatPrefs,
          ctaStatus: i.ctaStatus,
          manychatSetup: i.manychatSetup === "on",
          proprietaryValue: i.proprietaryValue,
          journeyAssets: i.journeyAssets,
          humanAlpha: i.humanAlpha,
          equipment: list(i.equipment),
          aiStack: list(i.aiStack),
          automateWorkflows: list(i.automateWorkflows),
        })
        .where(eq(s.creatorProfiles.creatorId, ctx.creatorId));
      await writeFollowers(tx, ctx.creatorId, ctx.me.id, i.handle, i.followers);
    });
    revalidateStudio();
    return ok("Profile saved");
  });
}
