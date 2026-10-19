import type { BrandConfig } from "./brand";
import { brandContext } from "./prompts";
import { FUNNEL_GUIDANCE } from "./reference";
import {
  CAROUSEL_ARCHETYPES,
  CAROUSEL_BACKGROUND_CATEGORIES,
  CAROUSEL_CRAFT_RULES,
  CAROUSEL_CTA_GUIDANCE,
  type CarouselCtaType,
} from "./carousel-reference";

function carouselCraftRulesBlock() {
  return `CAROUSEL RULES (no fluff -- violating these is a rewrite, not a nitpick):
Slide count: ${CAROUSEL_CRAFT_RULES.slideCount.join(" ")}
Hook (slide 1): ${CAROUSEL_CRAFT_RULES.hook.join(" ")}
Body/middle slides: ${CAROUSEL_CRAFT_RULES.body.join(" ")}
Design: ${CAROUSEL_CRAFT_RULES.design.join(" ")}
CTA (last slide): ${CAROUSEL_CRAFT_RULES.cta.join(" ")}
Avoid: ${CAROUSEL_CRAFT_RULES.mistakes.join(" ")}`;
}

export function buildCarouselPrompt(
  brand: BrandConfig,
  opts: {
    archetypeId: string;
    topic: string;
    slideCount?: number;
    funnelStage?: "tofu" | "mofu" | "bofu";
    ctaType?: CarouselCtaType;
    backgroundStyle?: string;
    backgroundCategory?: string;
    designNotes?: string;
  }
) {
  const archetype = CAROUSEL_ARCHETYPES.find((a) => a.id === opts.archetypeId) ?? CAROUSEL_ARCHETYPES[0];
  const funnel = opts.funnelStage ? FUNNEL_GUIDANCE[opts.funnelStage] : null;
  const funnelInstruction = funnel ? `Funnel stage: ${funnel.label} -- goal: ${funnel.goal}\n${funnel.instruction}` : "";
  const ctaType = opts.ctaType ?? "save";
  const ctaInstruction = `CTA type: ${ctaType} -- ${CAROUSEL_CTA_GUIDANCE[ctaType]}`;
  const slideCount = opts.slideCount ?? 8;
  const category = CAROUSEL_BACKGROUND_CATEGORIES.find((c) => c.id === opts.backgroundCategory);
  const design = [
    opts.backgroundStyle ? `Background style: ${opts.backgroundStyle}` : "",
    category ? `Background photo category: ${category.name} -- ${category.description}` : "",
    `Brand colours: ${Object.values(brand.colors).join(", ")} · Fonts: ${brand.fonts.heading} (headline) / ${brand.fonts.body} (body)`,
    opts.designNotes?.trim() ? `Art direction: ${opts.designNotes.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `${brandContext(brand)}

TASK: Write a ${slideCount}-slide Instagram carousel for:
Archetype: ${archetype.name} -- ${archetype.description}
Topic: ${opts.topic}
${funnelInstruction}
${ctaInstruction}

DESIGN (for whoever builds the slides -- don't describe it inside the slide text):
${design}

${carouselCraftRulesBlock()}

Archetype slide pattern to follow:
${archetype.fillInTemplate}

OUTPUT FORMAT -- exactly this, nothing before or after. Each slide is a block starting with its role label (HOOK for slide 1, BODY for every middle slide, CTA for the last slide), a colon, then the headline on that same line. An optional one-line supporting-text line can follow on the next line. Slides are separated by a line that is just "---".

HOOK: [slide 1 headline, legible in under 1 second]
[optional one-line supporting text]
---
BODY: [slide 2 headline -- one idea only]
[optional one-line supporting text]
---
BODY: [slide 3 headline]
[optional one-line supporting text]
---
CTA: [final slide headline, single explicit ask matching the CTA type above]
[optional one-line supporting text]

Write exactly ${slideCount} slide blocks total (1 HOOK, ${slideCount - 2} BODY, 1 CTA). Each headline is ≤10 words. No markdown, no slide numbers in the text, no commentary before or after the blocks.`;
}
