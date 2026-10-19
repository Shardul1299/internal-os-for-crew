"use server";
// Creator Studio — Carousels (BRIEF §19.8). Global starter carousels are read-only; clone first.
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import * as s from "@/lib/db/schema";
import { db } from "@/lib/db";
import { withUser, type Tx } from "@/lib/db/tx";
import { guard, ok, fail, type ActionResult } from "./result";
import { studioActor, carouselFor, type StudioCtx } from "@/lib/queries/studio";
import { parseCarouselSlides } from "@/lib/studio/parse";
import { CAROUSEL_ARCHETYPES, CAROUSEL_BACKGROUND_STYLES, CAROUSEL_CTA_TYPES } from "@/lib/studio/carousel-reference";
import { formObject, funnel, parse, pillar, contentType, revalidateStudio, scriptStatus, text, uuid } from "./studio-helpers";

const Meta = z.object({
  title: z.string().trim().max(200).default(""),
  pillar: pillar.default("authority"),
  contentType: contentType.default("educational"),
  archetype: z.enum(CAROUSEL_ARCHETYPES.map((a) => a.id) as [string, ...string[]]).default("listicle"),
  ctaType: z.enum(CAROUSEL_CTA_TYPES).default("save"),
  funnelStage: funnel.default("tofu"),
  status: scriptStatus.default("draft"),
  topicTag: text(120),
  segment: text(120),
  backgroundStyle: z.enum(CAROUSEL_BACKGROUND_STYLES).default("solid"),
  backgroundCategory: text(60),
  designNotes: text(4000),
});

const Slides = z
  .array(z.object({ role: z.enum(["hook", "body", "cta"]), headline: z.string().trim().max(300), supportingText: z.string().max(1000).default("") }))
  .max(30);

async function writeSlides(tx: Tx, carouselId: string, slides: z.infer<typeof Slides>) {
  await tx.delete(s.studioCarouselSlides).where(eq(s.studioCarouselSlides.carouselId, carouselId));
  const kept = slides.filter((x) => x.headline);
  if (kept.length) await tx.insert(s.studioCarouselSlides).values(kept.map((x, i) => ({ carouselId, slideNumber: i + 1, slideRole: x.role, headline: x.headline, supportingText: x.supportingText })));
  await tx.update(s.studioCarousels).set({ slideCount: kept.length }).where(eq(s.studioCarousels.id, carouselId));
}

async function ownCarousel(ctx: StudioCtx, id: string) {
  const c = await carouselFor(ctx, id);
  return c && !c.readOnly ? c : null;
}

/** Save a generated carousel: slides parsed from HOOK / BODY / CTA blocks. */
export async function saveCarouselFromOutput(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const raw = formObject(fd);
    const meta = parse(Meta, raw);
    const slides = parseCarouselSlides(parse(z.string().min(1, "Nothing to save").max(60000), raw.output));
    if (!slides.length) return fail("No slides found — each slide starts with HOOK:, BODY: or CTA:");
    const id = await withUser(ctx.me.id, async (tx) => {
      const [row] = await tx.insert(s.studioCarousels).values({ ...meta, title: meta.title || slides[0].headline, creatorId: ctx.creatorId, createdBy: ctx.me.id }).returning({ id: s.studioCarousels.id });
      await writeSlides(tx, row.id, slides);
      return row.id;
    });
    revalidateStudio();
    return ok("Carousel saved", { redirect: `/studio/carousels/${id}` });
  });
}

export async function createCarousel(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const meta = parse(Meta, formObject(fd));
    const [row] = await withUser(ctx.me.id, (tx) => tx.insert(s.studioCarousels).values({ ...meta, title: meta.title || "Untitled carousel", creatorId: ctx.creatorId, createdBy: ctx.me.id }).returning({ id: s.studioCarousels.id }));
    revalidateStudio();
    return ok("Carousel created", { redirect: `/studio/carousels/${row.id}` });
  });
}

export async function updateCarousel(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const raw = formObject(fd);
    const c = await ownCarousel(ctx, parse(uuid, raw.id));
    if (!c) return fail("Starter carousels are read-only; clone it first");
    const meta = parse(Meta, raw);
    await withUser(ctx.me.id, (tx) => tx.update(s.studioCarousels).set({ ...meta, title: meta.title || c.title }).where(and(eq(s.studioCarousels.id, c.id), eq(s.studioCarousels.creatorId, ctx.creatorId))));
    revalidateStudio();
    return ok("Carousel saved");
  });
}

export async function saveSlides(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const c = await ownCarousel(ctx, parse(uuid, fd.get("id")));
    if (!c) return fail("Starter carousels are read-only; clone it first");
    let data: unknown;
    try {
      data = JSON.parse(String(fd.get("slides") ?? "[]"));
    } catch {
      return fail("Couldn't read the slides");
    }
    const slides = parse(Slides, data);
    await withUser(ctx.me.id, (tx) => writeSlides(tx, c.id, slides));
    revalidateStudio();
    return ok("Slides saved");
  });
}

export async function cloneCarousel(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const src = await carouselFor(ctx, parse(uuid, fd.get("id")));
    if (!src) return fail("Carousel not found");
    const id = await withUser(ctx.me.id, async (tx) => {
      const [row] = await tx
        .insert(s.studioCarousels)
        .values({
          creatorId: ctx.creatorId,
          title: src.title,
          pillar: src.pillar,
          contentType: src.contentType,
          archetype: src.archetype,
          ctaType: src.ctaType,
          funnelStage: src.funnelStage,
          topicTag: src.topicTag,
          segment: src.segment,
          slideCount: src.slideCount,
          backgroundStyle: src.backgroundStyle,
          backgroundCategory: src.backgroundCategory,
          designNotes: src.designNotes,
          clonedFromId: src.id,
          createdBy: ctx.me.id,
        })
        .returning({ id: s.studioCarousels.id });
      await writeSlides(tx, row.id, src.slides.map((x) => ({ role: x.slideRole, headline: x.headline, supportingText: x.supportingText })));
      return row.id;
    });
    revalidateStudio();
    return ok("Cloned to your carousels", { redirect: `/studio/carousels/${id}` });
  });
}

export async function removeCarousel(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const id = parse(uuid, fd.get("id"));
    const [c] = await db.select({ id: s.studioCarousels.id }).from(s.studioCarousels).where(and(eq(s.studioCarousels.id, id), eq(s.studioCarousels.creatorId, ctx.creatorId), isNull(s.studioCarousels.archivedAt)));
    if (!c) return fail("Carousel not found");
    await withUser(ctx.me.id, (tx) => tx.update(s.studioCarousels).set({ archivedAt: new Date() }).where(and(eq(s.studioCarousels.id, id), eq(s.studioCarousels.creatorId, ctx.creatorId))));
    revalidateStudio();
    return ok("Carousel removed", { redirect: "/studio/carousels?tab=library&src=mine" });
  });
}
