// Carousel rulebook, distilled from a 2024-2025 research pass on what makes
// Instagram carousels get saved/shared/swiped-to-completion (see agent
// research, Oct 2026). Mirrors the structure of SCRIPT_ANGLES/
// SCRIPT_CRAFT_RULES in reference.ts so Carousel Studio and the Carousel
// Library follow the same conventions as Script Studio.

export type CarouselArchetype = {
  id: string;
  name: string;
  description: string;
  slideCount: string;
  fillInTemplate: string;
};

export const CAROUSEL_ARCHETYPES: CarouselArchetype[] = [
  {
    id: "listicle",
    name: "Listicle / Framework",
    description: "One numbered item/tool/step per slide, promise stated on slide 1.",
    slideCount: "7-10",
    fillInTemplate:
      "Slide 1 (hook): [Number] [things] that [outcome] -- save this.\nSlides 2-N: [Item N] -- [one-line why it matters]\nLast slide: Save this for [specific future use case].",
  },
  {
    id: "single_concept",
    name: "Single Concept Per Slide",
    description: "One idea per slide, no numbering, more editorial/essay feel.",
    slideCount: "6-9",
    fillInTemplate:
      "Slide 1 (hook): [Bold claim about one idea].\nSlides 2-N: [One idea, one line, builds on the previous slide].\nLast slide: [Payoff line] -- Save this for [use case].",
  },
  {
    id: "before_after",
    name: "Before / After",
    description: "Slide 1 sets the 'before' state, final slides land the 'after' -- the gap is the reason to swipe.",
    slideCount: "6-8",
    fillInTemplate:
      "Slide 1 (hook): [Before state] to [after state] in [timeframe].\nMiddle slides: [the 2-4 moves that bridged the gap, one per slide].\nLast slide: Save this before you [relevant action].",
  },
  {
    id: "myth_bust",
    name: "Myth Bust",
    description: "Cover names the myth, each middle slide busts one misconception.",
    slideCount: "6-9",
    fillInTemplate:
      "Slide 1 (hook): [X] is a myth -- here's why.\nMiddle slides: Myth: [belief]. Truth: [correction].\nLast slide: Share this with someone who still believes [myth].",
  },
  {
    id: "story_arc",
    name: "Story Arc",
    description: "Challenge -> struggle -> turning point -> lesson, personal/founder narrative.",
    slideCount: "7-10",
    fillInTemplate:
      "Slide 1 (hook): [Timeframe] ago I [challenge/setback].\nMiddle slides: [struggle] -> [turning point] -> [what changed].\nLast slide: [lesson line] -- Follow for more of the journey.",
  },
  {
    id: "comparison",
    name: "Comparison",
    description: "A vs B, side-by-side tradeoffs -- good for positioning/decision content.",
    slideCount: "6-8",
    fillInTemplate:
      "Slide 1 (hook): [Option A] vs [Option B] -- which one actually [outcome]?\nMiddle slides: [A] -- pros/cons. [B] -- pros/cons.\nLast slide: Comment [A/B] -- which one are you running?",
  },
  {
    id: "tutorial",
    name: "Step-by-Step Tutorial",
    description: "One actionable step per slide, reads as a mini-SOP.",
    slideCount: "7-10",
    fillInTemplate:
      "Slide 1 (hook): How to [outcome] in [N] steps.\nMiddle slides: Step [N]: [action] -- [why it matters].\nLast slide: Save this and come back when you're on step [N].",
  },
  {
    id: "quote_chain",
    name: "Quote / Mindset Chain",
    description: "Sequential short statements building one argument -- lower text density, higher typographic weight.",
    slideCount: "5-7",
    fillInTemplate:
      "Slide 1 (hook): [Provocative one-line belief].\nMiddle slides: [One short statement per slide, each building the argument].\nLast slide: Save this for the next time you [relevant moment].",
  },
];

export type CarouselHookPattern = { id: string; template: string };

export const CAROUSEL_HOOK_PATTERNS: CarouselHookPattern[] = [
  { id: "stop_action", template: "Stop [common action] -- do [specific alternative] instead" },
  { id: "numbered_secrets", template: "[Number] [things] about [topic] no one tells you" },
  { id: "framework", template: "The [X]-step framework I used to [outcome]" },
  { id: "why_not_working", template: "Why your [thing] isn't [working/growing] (it's not what you think)" },
  { id: "unexpected_result", template: "I [did unexpected thing] and here's what happened" },
  { id: "bold_save", template: "[Bold claim]. Save this before you [relevant action]." },
  { id: "one_mistake", template: "The one [mistake/thing] killing your [outcome]" },
  { id: "wish_i_knew", template: "What I wish I knew before [milestone/decision]" },
  { id: "audience_callout", template: "[Audience], read this before you [action]" },
  { id: "contrarian", template: "Everyone says [common belief]. Here's why they're wrong." },
];

export const CAROUSEL_CTA_TYPES = ["save", "share", "comment", "follow", "link"] as const;
export type CarouselCtaType = (typeof CAROUSEL_CTA_TYPES)[number];

export const CAROUSEL_CTA_GUIDANCE: Record<CarouselCtaType, string> = {
  save: "Highest-value ask (strongest algo signal, implies evergreen value): \"Save this for [specific future use case].\"",
  share: "Best for reach expansion: \"Tag/send this to someone who [needs it].\"",
  comment: "Works only with a tight, specific question: \"Which step are you on -- comment [A/B/C].\"",
  follow: "Reach-play CTA for pure awareness content, no deeper ask: \"Follow for more [topic] breakdowns.\"",
  link: "Direct conversion ask for warm/BOFU audiences: \"Link in bio for [specific next step].\"",
};

export const CAROUSEL_BACKGROUND_STYLES = ["solid", "gradient", "photo", "screenshot", "whiteboard", "minimalist"] as const;
export type CarouselBackgroundStyle = (typeof CAROUSEL_BACKGROUND_STYLES)[number];

export type CarouselBackgroundCategory = { id: string; name: string; description: string };

// Generic, stock-friendly photo background moods -- not tied to one real
// location so they're reusable across many carousels. Captures design
// *intent* even before actual photos are sourced (see CLAUDE.md/session
// notes: image sourcing is deferred, these labels drive that future work).
export const CAROUSEL_BACKGROUND_CATEGORIES: CarouselBackgroundCategory[] = [
  { id: "desk_laptop", name: "Desk / laptop overhead", description: "Notebook, coffee cup, laptop edge visible, soft natural light, uncluttered." },
  { id: "pov_hands", name: "POV hand shots", description: "Hand writing in a notebook, gesturing near a laptop, holding a phone -- intimate, 'in the work' feel." },
  { id: "meeting_blur", name: "Blurred meeting room", description: "Soft backdrop behind a text block, subjects out of focus so it doesn't compete." },
  { id: "coffee_shop", name: "Coffee-shop ambience", description: "Warm tone, wide aperture, suggests independence/flexibility." },
  { id: "workspace_flatlay", name: "Minimalist workspace flatlay", description: "Neutral tones, negative space reserved for text." },
  { id: "skyline", name: "City skyline / window view", description: "Ambition/scale signal, generic enough to be any city." },
  { id: "bookshelf", name: "Bookshelf / reading nook", description: "Expertise/credibility signal, soft focus." },
  { id: "walking_commute", name: "Walking / commuting POV", description: "Momentum/hustle signal, good for story-arc or mindset content." },
  { id: "textured_neutral", name: "Neutral textured backdrop", description: "Linen, concrete, paper texture -- visual breathing room between photo-heavy slides." },
  { id: "window_light", name: "Soft window light", description: "Silhouette or side-lit, aspirational/calm mood, good for mindset/quote-chain carousels." },
];

export const CAROUSEL_CRAFT_RULES = {
  slideCount: [
    "Sweet spot is 8-10 slides for most posts. 6-7 minimum, 12-20 only for deep guides/dense frameworks.",
    "Fewer slides = higher completion rate but less engagement surface. More slides = more save-worthy but every slide must earn the next swipe or completion rate collapses.",
  ],
  hook: [
    "Slide 1's promise must be legible in under 1 second -- treat it as a headline, not a warm-up. No logo-first opens.",
    "Combine at least 2 of: specific numbers, bold/contrarian claim, curiosity gap (withhold the 'what'), direct address ('you'), pattern interrupt.",
  ],
  body: [
    "One idea per slide. If a slide needs more than ~10 words at body size to make its point, split it into two slides rather than shrinking the font.",
    "Every middle slide's job is to earn the next swipe (open-loop pacing) -- sagging middle slides kill completion rate the same way a flat beat kills a video.",
    "Max 2 font families (one display/headline, one body/sans). Bold weight for headline, regular/medium for body.",
  ],
  design: [
    "Dark-on-light or light-on-dark only. Any text-over-photo needs a 40-60% scrim/overlay for legibility.",
    "Font sizing on a 1080x1350 canvas: headline 60-90px, section header 40-55px, body 28-36px (never below 28px -- cut text instead of shrinking), labels 20-26px.",
    "Solid brand color or gradient is the best-practice default: highest legibility, lowest production cost. Photo backgrounds are a secondary/supplementary treatment, not the default.",
  ],
  cta: [
    "One CTA per carousel -- never stack asks (save + share + comment + follow dilutes all of them).",
    "Tie the CTA to the content's goal: awareness -> share, trust/reference -> save, conversation -> tight comment prompt, conversion -> explicit next step.",
  ],
  mistakes: [
    "Weak/vague slide 1 -- payoff not legible in 1 second.",
    "Information overload per slide -- multiple ideas crammed together.",
    "Inconsistent branding -- too many fonts/colors, mixed image quality.",
    "Missing or stacked CTA.",
    "Sagging middle slides that don't each re-earn the next swipe.",
    "Low-legibility text-over-photo with no scrim/overlay.",
  ],
};
