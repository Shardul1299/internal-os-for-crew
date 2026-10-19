import { generateText } from "./ai";
import { SCRIPT_ANGLES, STORY_TYPES, FILMING_FORMATS, CONTENT_TYPES, PILLARS, FUNNEL_STAGES, CTA_TYPES } from "./reference";

// Splits a pasted blob of scripts into individual raw blocks. Blocks are
// separated by a line that's just "---" (matching the convention already
// used throughout this app's own batch seed files for readability).
export function splitScriptBlocks(raw: string): string[] {
  return raw
    .split(/\n\s*---\s*\n/g)
    .map((b) => b.trim())
    .filter(Boolean);
}

export type ClassifiedScript = {
  title: string;
  pillar: (typeof PILLARS)[number];
  contentType: (typeof CONTENT_TYPES)[number];
  angleOrStoryType: string;
  format: string;
  ctaType: (typeof CTA_TYPES)[number];
  funnelStage: (typeof FUNNEL_STAGES)[number];
  effort: "low" | "default" | "high";
  topicTag: string;
  segment: string;
  bodyBlack: string;
  bodyRed: string;
  bodyGreen: string;
};

const DEFAULT_CLASSIFICATION: Omit<ClassifiedScript, "title" | "bodyBlack" | "bodyRed" | "bodyGreen"> = {
  pillar: "authority",
  contentType: "educational",
  angleOrStoryType: "",
  format: "",
  ctaType: "follow",
  funnelStage: "tofu",
  effort: "default",
  topicTag: "",
  segment: "",
};

function firstLine(block: string) {
  return block.split("\n")[0]?.trim().slice(0, 120) || "Untitled script";
}

// Classifies a batch of raw script blocks in a single AI call (cheaper and
// faster than one call per script) into the same scaffolding fields every
// other script in the library carries -- pillar, content type, angle,
// format, CTA, funnel stage, effort, topic -- so bulk-imported scripts show
// up in the Library's filters exactly like hand-written ones do.
export async function classifyScriptBlocks(creatorId: string, blocks: string[]): Promise<ClassifiedScript[]> {
  if (blocks.length === 0) return [];

  const angleNames = SCRIPT_ANGLES.map((a) => a.name);
  const storyTypeNames = STORY_TYPES.map((s) => s.name);
  const formatNames = FILMING_FORMATS.map((f) => f.name);

  const prompt = `You are classifying short-form video scripts for a content library. For each script below, return a JSON object with these exact fields:
- "title": a short descriptive title (infer one if the script doesn't have an obvious title line)
- "pillar": one of ${JSON.stringify(PILLARS)}
- "contentType": one of ${JSON.stringify(CONTENT_TYPES)}
- "angleOrStoryType": if pillar is "authority", pick the closest match from ${JSON.stringify(angleNames)}; if pillar is "journey", pick the closest match from ${JSON.stringify(storyTypeNames)}
- "format": the closest match from ${JSON.stringify(formatNames)}, or "" if the script gives no filming/editing detail to infer one from
- "ctaType": one of ${JSON.stringify(CTA_TYPES)} -- infer from any call-to-action in the script, default "follow" if none is present
- "funnelStage": one of ${JSON.stringify(FUNNEL_STAGES)} -- "tofu" for broad educational/awareness content, "mofu" for content building trust/engagement, "bofu" for content pushing toward a sale or booked call
- "effort": one of ["low","default","high"] -- how much production effort the script implies
- "topicTag": a short 2-5 word topic category for this script (e.g. "Pricing Strategy", "Client Onboarding")
- "segment": a short format/style label if the script has one (e.g. "Myth Bust", "Case Study"), or "" if not applicable

Return ONLY a JSON array, one object per script, in the same order as the scripts are listed, with no markdown fences or commentary.

${blocks.map((b, i) => `--- SCRIPT ${i + 1} ---\n${b}`).join("\n\n")}`;

  const result = await generateText(prompt, { creatorId, generator: "bulk_import" });

  if (!result.ok) {
    // No AI connected, or the call failed -- fall back to sane defaults so
    // the import still succeeds; the user can refine each script's
    // classification afterward in the Library.
    return blocks.map((block) => ({
      title: firstLine(block),
      ...DEFAULT_CLASSIFICATION,
      bodyBlack: block,
      bodyRed: "",
      bodyGreen: "",
    }));
  }

  try {
    const cleaned = result.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    const parsed = JSON.parse(cleaned) as Partial<ClassifiedScript>[];
    return blocks.map((block, i) => {
      const c = parsed[i] || {};
      return {
        title: c.title || firstLine(block),
        pillar: PILLARS.includes(c.pillar as (typeof PILLARS)[number]) ? (c.pillar as (typeof PILLARS)[number]) : "authority",
        contentType: CONTENT_TYPES.includes(c.contentType as (typeof CONTENT_TYPES)[number])
          ? (c.contentType as (typeof CONTENT_TYPES)[number])
          : "educational",
        angleOrStoryType: c.angleOrStoryType || "",
        format: c.format || "",
        ctaType: CTA_TYPES.includes(c.ctaType as (typeof CTA_TYPES)[number]) ? (c.ctaType as (typeof CTA_TYPES)[number]) : "follow",
        funnelStage: FUNNEL_STAGES.includes(c.funnelStage as (typeof FUNNEL_STAGES)[number])
          ? (c.funnelStage as (typeof FUNNEL_STAGES)[number])
          : "tofu",
        effort: (["low", "default", "high"] as const).includes(c.effort as "low" | "default" | "high") ? (c.effort as "low" | "default" | "high") : "default",
        topicTag: c.topicTag || "",
        segment: c.segment || "",
        bodyBlack: block,
        bodyRed: "",
        bodyGreen: "",
      };
    });
  } catch {
    // Classification response wasn't valid JSON -- same safe fallback.
    return blocks.map((block) => ({
      title: firstLine(block),
      ...DEFAULT_CLASSIFICATION,
      bodyBlack: block,
      bodyRed: "",
      bodyGreen: "",
    }));
  }
}
