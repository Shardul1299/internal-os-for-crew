// Default inputs for each generator when run from the Prompt Library (BRIEF §19.11).
import type { GenField, SaveKind } from "./Generator";
import type { GeneratorKey } from "@/lib/studio/generators";
import { SCRIPT_ANGLES, STORY_TYPES, JOURNEY_SERIES_FORMATS, FILMING_FORMATS, CTA_TYPES } from "@/lib/studio/reference";
import { CAROUSEL_ARCHETYPES, CAROUSEL_CTA_TYPES, CAROUSEL_BACKGROUND_STYLES } from "@/lib/studio/carousel-reference";

const funnel = { name: "funnelStage", label: "Funnel stage", type: "select" as const, options: ["tofu", "mofu", "bofu"].map((v) => ({ value: v, label: v.toUpperCase() })) };
const cta = { name: "ctaType", label: "CTA", type: "select" as const, options: CTA_TYPES.map((v) => ({ value: v, label: v === "manychat" ? "ManyChat" : v[0].toUpperCase() + v.slice(1) })) };
const format = { name: "format", label: "Format", type: "select" as const, options: [{ value: "", label: "—" }, ...FILMING_FORMATS.map((f) => ({ value: f.name, label: f.name }))] };

export function genFields(key: GeneratorKey, subniches: string[]): { fields: GenField[]; save?: SaveKind; meta?: Record<string, string>; initial?: Record<string, string> } {
  const sub = { name: "subniche", label: "Sub-niche", type: "select" as const, options: (subniches.length ? subniches : ["Your niche"]).map((s) => ({ value: s, label: s })) };
  switch (key) {
    case "bio":
    case "keyword_bank":
    case "calendar_ideation":
      return { fields: [], save: key === "calendar_ideation" ? "ideas" : undefined };
    case "topic_research":
    case "problem_research":
      return { fields: [sub] };
    case "raw_idea":
      return { fields: [{ name: "rawIdea", label: "Raw idea", type: "textarea", rows: 4 }] };
    case "outlier_deconstruction":
      return { fields: [{ name: "transcript", label: "Transcript or description", type: "textarea", rows: 5 }] };
    case "transcript_template":
      return { fields: [{ name: "transcript", label: "Transcript", type: "textarea", rows: 6 }], save: "template" };
    case "hook_stack":
      return { fields: [{ name: "topic", label: "Topic" }, { name: "angle", label: "Angle", type: "select", options: [{ value: "", label: "Any angle" }, ...SCRIPT_ANGLES.map((a) => ({ value: a.name, label: a.name }))] }], save: "hooks" };
    case "script_authority":
      return {
        fields: [{ name: "topic", label: "Topic" }, { name: "angle", label: "Angle", type: "select", options: SCRIPT_ANGLES.map((a) => ({ value: a.name, label: a.name })) }, format, { name: "depth", label: "Depth", type: "select", options: [{ value: "complex", label: "Complex — conversion" }, { value: "easy", label: "Easy — reach" }] }, funnel, cta],
        save: "script",
        meta: { pillar: "authority", contentType: "educational" },
      };
    case "script_story":
      return {
        fields: [{ name: "topic", label: "What happened" }, { name: "storyType", label: "Story type", type: "select", options: STORY_TYPES.map((s) => ({ value: s.name, label: s.name })) }, { name: "series", label: "Journey series", type: "select", options: [{ value: "", label: "—" }, ...JOURNEY_SERIES_FORMATS.map((f) => ({ value: f.name, label: f.name }))] }, format, funnel, cta],
        save: "script",
        meta: { pillar: "journey", contentType: "storytelling" },
      };
    case "signature_series":
      return { fields: [{ name: "seriesName", label: "Series name" }, { name: "subject", label: "Subject" }, { name: "episodes", label: "Episodes", type: "number" }], initial: { episodes: "5" } };
    case "improver":
      return { fields: [{ name: "bodyBlack", label: "BLACK · spoken", type: "textarea", rows: 5 }, { name: "bodyRed", label: "RED · actions", type: "textarea", rows: 2 }, { name: "bodyGreen", label: "GREEN · editing", type: "textarea", rows: 2 }, { name: "focus", label: "Focus" }], save: "improve" };
    case "caption":
      return { fields: [{ name: "hook", label: "Written hook" }, { name: "topic", label: "Topic" }, cta] };
    case "manychat":
      return { fields: [{ name: "triggerWord", label: "Trigger word" }, { name: "offer", label: "Offer" }] };
    case "double_down":
      return { fields: [{ name: "topic", label: "Past video" }, { name: "hook", label: "Its hook" }, format], save: "double_down" };
    case "carousel":
      return {
        fields: [
          { name: "topic", label: "Topic" },
          { name: "archetype", label: "Archetype", type: "select", options: CAROUSEL_ARCHETYPES.map((a) => ({ value: a.id, label: a.name })) },
          { name: "slides", label: "Slides", type: "number" },
          funnel,
          { name: "ctaType", label: "CTA", type: "select", options: CAROUSEL_CTA_TYPES.map((c) => ({ value: c, label: c })) },
          { name: "backgroundStyle", label: "Background", type: "select", options: CAROUSEL_BACKGROUND_STYLES.map((b) => ({ value: b, label: b })) },
          { name: "designNotes", label: "Design notes", type: "textarea", rows: 2 },
        ],
        save: "carousel",
      };
  }
}
