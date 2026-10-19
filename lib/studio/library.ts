// The Starter library (BRIEF §12.8, §19.7): every Upcreate seed batch as global read-only rows.
import { OCT_2026_BATCH, OCT_2026_BATCH_EXT, BATCH_TAG, type BatchScript } from "./seed-data/octBatch";
import { GROWTH_BATCH, GROWTH_BATCH_TAG } from "./seed-data/growthBatch";
import { COMMENTARY_BATCH, COMMENTARY_BATCH_TAG } from "./seed-data/commentaryBatch";
import { SEGMENTS_BATCH, SEGMENTS_BATCH_TAG } from "./seed-data/segmentsBatch";
import { NEW_CATEGORIES_BATCH, NEW_CATEGORIES_BATCH_TAG } from "./seed-data/newCategoriesBatch";
import { NEW_CATEGORIES_2_BATCH, NEW_CATEGORIES_2_BATCH_TAG } from "./seed-data/newCategoriesBatch2";
import { NEW_CATEGORIES_3_BATCH, NEW_CATEGORIES_3_BATCH_TAG } from "./seed-data/newCategoriesBatch3";
import { NEW_CATEGORIES_4_BATCH, NEW_CATEGORIES_4_BATCH_TAG } from "./seed-data/newCategoriesBatch4";
import { NEW_CATEGORIES_5_BATCH, NEW_CATEGORIES_5_BATCH_TAG } from "./seed-data/newCategoriesBatch5";
import { NEW_CATEGORIES_6_BATCH, NEW_CATEGORIES_6_BATCH_TAG } from "./seed-data/newCategoriesBatch6";
import { JOURNEY_BATCH, JOURNEY_BATCH_TAG } from "./seed-data/journeyBatch";
import { CATEGORIES_7_BATCH, CATEGORIES_7_BATCH_TAG } from "./seed-data/categoriesBatch7";
import { CATEGORIES_8_BATCH, CATEGORIES_8_BATCH_TAG } from "./seed-data/categoriesBatch8";
import { CATEGORIES_9_BATCH, CATEGORIES_9_BATCH_TAG } from "./seed-data/categoriesBatch9";
import { CAROUSEL_BATCH_1, CAROUSEL_BATCH_1_TAG } from "./seed-data/carouselBatch1";
import { CAROUSEL_BATCH_2, CAROUSEL_BATCH_2_TAG } from "./seed-data/carouselBatch2";
import { CAROUSEL_BATCH_3, CAROUSEL_BATCH_3_TAG } from "./seed-data/carouselBatch3";
import type { CarouselSeed } from "./seed-data/carouselTypes";

export type StarterScript = {
  seedBatch: string;
  title: string;
  pillar: "authority" | "journey";
  contentType: "educational" | "storytelling" | "authority" | "other";
  angleOrStoryType: string;
  format: string;
  bodyBlack: string;
  bodyRed: string;
  bodyGreen: string;
  ctaType: "follow" | "engagement" | "manychat" | "none";
  funnelStage: "tofu" | "mofu" | "bofu";
  conceptBucket: "proven" | "double_down" | "experimental";
  effort: "low" | "default" | "high";
  seriesName: string;
  topicTag: string;
  segment: string;
};

type AnyBatch = BatchScript & { topicTag?: string; subniche?: string; segment?: string; sourceType?: string };

function toStarter(tag: string, s: AnyBatch, fallbackTopic: string): StarterScript {
  const black = s.ctaLine && !s.bodyBlack.includes(s.ctaLine) ? `${s.bodyBlack}\n${s.ctaLine}` : s.bodyBlack;
  return {
    seedBatch: tag,
    title: s.title,
    pillar: s.pillar,
    contentType: s.contentType,
    angleOrStoryType: s.angle,
    format: s.format,
    bodyBlack: black,
    bodyRed: s.bodyRed,
    bodyGreen: s.bodyGreen,
    ctaType: s.ctaType,
    funnelStage: s.funnelStage,
    conceptBucket: s.conceptBucket,
    effort: s.effort,
    seriesName: s.seriesName ?? "",
    topicTag: s.topicTag ?? s.subniche ?? fallbackTopic,
    segment: s.segment ?? "",
  };
}

export function starterScripts(): StarterScript[] {
  const D = "Market Entry & Business Consulting";
  const batches: [string, AnyBatch[], string][] = [
    [BATCH_TAG, [...OCT_2026_BATCH, ...OCT_2026_BATCH_EXT], D],
    [GROWTH_BATCH_TAG, GROWTH_BATCH as AnyBatch[], D],
    [COMMENTARY_BATCH_TAG, COMMENTARY_BATCH as AnyBatch[], "Commentary"],
    [SEGMENTS_BATCH_TAG, SEGMENTS_BATCH as AnyBatch[], D],
    [NEW_CATEGORIES_BATCH_TAG, NEW_CATEGORIES_BATCH, D],
    [NEW_CATEGORIES_2_BATCH_TAG, NEW_CATEGORIES_2_BATCH, D],
    [NEW_CATEGORIES_3_BATCH_TAG, NEW_CATEGORIES_3_BATCH, D],
    [NEW_CATEGORIES_4_BATCH_TAG, NEW_CATEGORIES_4_BATCH, D],
    [NEW_CATEGORIES_5_BATCH_TAG, NEW_CATEGORIES_5_BATCH, D],
    [NEW_CATEGORIES_6_BATCH_TAG, NEW_CATEGORIES_6_BATCH, D],
    [JOURNEY_BATCH_TAG, JOURNEY_BATCH, "Founder Journey"],
    [CATEGORIES_7_BATCH_TAG, CATEGORIES_7_BATCH, D],
    [CATEGORIES_8_BATCH_TAG, CATEGORIES_8_BATCH, D],
    [CATEGORIES_9_BATCH_TAG, CATEGORIES_9_BATCH, D],
  ];
  return batches.flatMap(([tag, rows, fb]) => rows.map((s) => toStarter(tag, s, fb)));
}

export function starterCarousels(): (CarouselSeed & { seedBatch: string })[] {
  return [
    ...CAROUSEL_BATCH_1.map((c) => ({ ...c, seedBatch: CAROUSEL_BATCH_1_TAG })),
    ...CAROUSEL_BATCH_2.map((c) => ({ ...c, seedBatch: CAROUSEL_BATCH_2_TAG })),
    ...CAROUSEL_BATCH_3.map((c) => ({ ...c, seedBatch: CAROUSEL_BATCH_3_TAG })),
  ];
}
