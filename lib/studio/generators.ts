// The generator registry (BRIEF §19.0 S1, §19.11). One function per generator turns the
// creator's own Profile plus the form inputs into the exact prompt. The client shows it,
// and the server rebuilds it from the stored Profile before calling the AI engine — so the
// prompt that runs is the prompt that was shown. Pure and client-safe.
import type { BrandConfig } from "./brand";
import {
  buildBioPrompt,
  buildKeywordBankPrompt,
  buildTopicResearchPrompt,
  buildProblemResearchPrompt,
  buildRawIdeaDeveloperPrompt,
  buildOutlierDeconstructionPrompt,
  buildTranscriptTemplatizePrompt,
  buildHookStackPrompt,
  buildScriptPrompt,
  buildScriptImproverPrompt,
  buildCaptionPrompt,
  buildManyChatMessagePrompt,
  buildCalendarIdeationPrompt,
  buildDoubleDownPrompt,
  buildSignatureSeriesPrompt,
} from "./prompts";
import { buildCarouselPrompt } from "./carousel-prompts";
import { JOURNEY_SERIES_FORMATS, HISTORICAL_MEDIA_TIP, SCRIPT_ANGLES, STORY_TYPES } from "./reference";
import { CAROUSEL_CTA_TYPES, type CarouselCtaType } from "./carousel-reference";

export const GENERATOR_KEYS = [
  "bio",
  "keyword_bank",
  "topic_research",
  "problem_research",
  "raw_idea",
  "outlier_deconstruction",
  "transcript_template",
  "hook_stack",
  "script_authority",
  "script_story",
  "signature_series",
  "improver",
  "caption",
  "manychat",
  "calendar_ideation",
  "double_down",
  "carousel",
] as const;
export type GeneratorKey = (typeof GENERATOR_KEYS)[number];

export const GENERATOR_LABEL: Record<GeneratorKey, string> = {
  bio: "Bio",
  keyword_bank: "Keyword bank",
  topic_research: "Topic research",
  problem_research: "Problem research",
  raw_idea: "Raw idea",
  outlier_deconstruction: "Deconstruct",
  transcript_template: "Transcript → template",
  hook_stack: "Hook stacks",
  script_authority: "Authority script",
  script_story: "Story script",
  signature_series: "Signature series",
  improver: "Improve",
  caption: "Caption",
  manychat: "ManyChat DM",
  calendar_ideation: "Batch ideation",
  double_down: "Double down",
  carousel: "Carousel",
};

export type GenInputs = Record<string, string>;
export type GenDefaults = { ideationCount: number; carouselSlides: number };

const v = (i: GenInputs, k: string, d = "") => (i[k] ?? "").trim() || d;
const funnel = (s: string) => (["tofu", "mofu", "bofu"].includes(s) ? (s as "tofu" | "mofu" | "bofu") : undefined);
const cta = (s: string) => (["follow", "engagement", "manychat", "none"].includes(s) ? (s as "follow" | "engagement" | "manychat" | "none") : undefined);
const int = (s: string, d: number, min: number, max: number) => {
  const n = Math.round(Number(s));
  return Number.isFinite(n) && n >= min && n <= max ? n : d;
};

function storyContext(i: GenInputs) {
  const series = JOURNEY_SERIES_FORMATS.find((f) => f.name === v(i, "series"));
  const story = STORY_TYPES.find((s) => s.name === v(i, "storyType"));
  return [story ? `${story.name}: ${story.description}\nBeat pattern:\n${story.fillInTemplate}` : "", series ? `Journey series format: ${series.name} -- ${series.description}` : "", `Historical media: ${HISTORICAL_MEDIA_TIP}`]
    .filter(Boolean)
    .join("\n");
}

/** Builds the exact prompt for a generator. Missing required inputs show as a bracketed placeholder. */
export function buildGeneratorPrompt(key: GeneratorKey, brand: BrandConfig, i: GenInputs, d: GenDefaults): string {
  switch (key) {
    case "bio":
      return buildBioPrompt(brand);
    case "keyword_bank":
      return buildKeywordBankPrompt(brand);
    case "topic_research":
      return buildTopicResearchPrompt(brand, { subniche: v(i, "subniche", brand.subniches[0] || "[SUB-NICHE]") });
    case "problem_research":
      return buildProblemResearchPrompt(brand, { subniche: v(i, "subniche", brand.subniches[0] || "[SUB-NICHE]") });
    case "raw_idea":
      return buildRawIdeaDeveloperPrompt(brand, { rawIdea: v(i, "rawIdea", "[YOUR RAW IDEA]") });
    case "outlier_deconstruction":
      return buildOutlierDeconstructionPrompt({ transcriptOrDescription: v(i, "transcript", "[PASTE TRANSCRIPT OR DESCRIPTION]") });
    case "transcript_template":
      return buildTranscriptTemplatizePrompt(v(i, "transcript", "[PASTE TRANSCRIPT]"));
    case "hook_stack":
      return buildHookStackPrompt(brand, { topic: v(i, "topic", "[YOUR TOPIC]"), angle: v(i, "angle") || undefined });
    case "script_authority": {
      const stack = v(i, "hookWritten") || v(i, "hookVerbal") ? { written: v(i, "hookWritten"), verbal: v(i, "hookVerbal"), visual: v(i, "hookVisual") } : undefined;
      return buildScriptPrompt(brand, {
        pillar: "authority",
        contentType: "educational / authority",
        angleOrStoryType: v(i, "angle", SCRIPT_ANGLES[0].name),
        topic: v(i, "topic", "[YOUR TOPIC]"),
        hookStack: stack,
        format: v(i, "format") || undefined,
        depth: v(i, "depth") === "easy" ? "easy" : "complex",
        funnelStage: funnel(v(i, "funnelStage", "tofu")),
        ctaType: cta(v(i, "ctaType", "follow")),
      });
    }
    case "script_story": {
      const base = buildScriptPrompt(brand, {
        pillar: "journey",
        contentType: "storytelling",
        angleOrStoryType: v(i, "storyType", STORY_TYPES[0].name),
        topic: v(i, "topic", "[WHAT HAPPENED]"),
        format: v(i, "format") || undefined,
        depth: "complex",
        funnelStage: funnel(v(i, "funnelStage", "tofu")),
        ctaType: cta(v(i, "ctaType", "follow")),
      });
      return `${base}\n\nSTORY CONTEXT:\n${storyContext(i)}`;
    }
    case "signature_series":
      return buildSignatureSeriesPrompt(brand, {
        seriesName: v(i, "seriesName", "[SERIES NAME]"),
        subject: v(i, "subject", "[SUBJECT]"),
        episodes: int(v(i, "episodes"), 5, 2, 20),
      });
    case "improver":
      return buildScriptImproverPrompt(brand, {
        bodyBlack: v(i, "bodyBlack", "[PASTE THE SPOKEN LINES]"),
        bodyRed: v(i, "bodyRed") || undefined,
        bodyGreen: v(i, "bodyGreen") || undefined,
        pillar: v(i, "pillar") || undefined,
        angleOrStoryType: v(i, "angle") || undefined,
        format: v(i, "format") || undefined,
        funnelStage: funnel(v(i, "funnelStage")),
        ctaType: cta(v(i, "ctaType")),
        focusNotes: v(i, "focus") || undefined,
      });
    case "caption":
      return buildCaptionPrompt(brand, { hook: v(i, "hook", "[YOUR HOOK]"), ctaType: v(i, "ctaType", "follow"), topic: v(i, "topic", "[YOUR TOPIC]") });
    case "manychat":
      return buildManyChatMessagePrompt(brand, { triggerWord: v(i, "triggerWord", "[TRIGGER WORD]"), offer: v(i, "offer", "[YOUR OFFER]") });
    case "calendar_ideation":
      return buildCalendarIdeationPrompt(brand, { count: d.ideationCount, pillarRatio: brand.pillarRatio, conceptRatio: brand.conceptRatio });
    case "double_down":
      return buildDoubleDownPrompt(brand, { topic: v(i, "topic", "[YOUR PAST VIDEO]"), hook: v(i, "hook") || undefined, format: v(i, "format") || undefined });
    case "carousel":
      return buildCarouselPrompt(brand, {
        archetypeId: v(i, "archetype", "listicle"),
        topic: v(i, "topic", "[YOUR TOPIC]"),
        slideCount: int(v(i, "slides"), d.carouselSlides, 3, 20),
        funnelStage: funnel(v(i, "funnelStage", "tofu")),
        ctaType: (CAROUSEL_CTA_TYPES as readonly string[]).includes(v(i, "ctaType")) ? (v(i, "ctaType") as CarouselCtaType) : "save",
        backgroundStyle: v(i, "backgroundStyle") || undefined,
        backgroundCategory: v(i, "backgroundCategory") || undefined,
        designNotes: v(i, "designNotes") || undefined,
      });
  }
}
