// Static reference content distilled from the source playbook.
// This is the "rulebook" every generator and checklist in the app pulls from.

export type ScriptAngle = {
  id: string;
  name: string;
  description: string;
  fillInTemplate: string;
};

export const SCRIPT_ANGLES: ScriptAngle[] = [
  {
    id: "framework",
    name: "Framework / Formula / Acronym",
    description: "Teach a repeatable step-by-step process, formula, or acronym.",
    fillInTemplate:
      "Hook: [Bold claim/result] using my [X]-step framework.\n1. [Step 1] -- [one-line why it matters]\n2. [Step 2] -- [one-line why it matters]\n3. [Step 3] -- [one-line why it matters]\nCTA: [Follow/Save] for [promise of more frameworks like this].",
  },
  {
    id: "comparison",
    name: "Comparison",
    description: "Side-by-side evaluation of two methods, products, or actions.",
    fillInTemplate:
      "Hook: [Option A] vs [Option B] -- which one actually [desired outcome]?\nOption A: [A] -- pros: [x], cons: [y]\nOption B: [B] -- pros: [x], cons: [y]\nVerdict: [which one wins and why, tied to your experience]\nCTA: [Comment A or B / Follow for more comparisons]",
  },
  {
    id: "myth_bust",
    name: "Myth Bust / Common Mistake",
    description: "Disprove a widespread niche misconception or correct a frequent error.",
    fillInTemplate:
      "Hook: Stop believing [common myth] -- it's costing you [consequence].\nWhy it's wrong: [explanation with proof/experience]\nWhat to do instead: [correct approach]\nCTA: [Follow to unlearn more myths in X]",
  },
  {
    id: "do_dont",
    name: "Do vs Don't (Right vs Wrong)",
    description: "Clear visual/verbal contrast of correct vs incorrect approaches.",
    fillInTemplate:
      "Hook: [Topic] -- here's the right way vs the wrong way.\nWrong: [mistake] -- why it fails: [reason]\nRight: [correct move] -- why it works: [reason]\nCTA: [Follow for more do's and don'ts in X]",
  },
  {
    id: "tip_hack",
    name: "Educational Tip / Hack",
    description: "One highly specific, actionable tactical tip or rule of thumb.",
    fillInTemplate:
      "Hook: One [niche] tip that [specific outcome] in [timeframe].\nThe tip: [exact tactic]\nWhy it works: [mechanism/reasoning]\nHow to apply it: [concrete next step]\nCTA: [Save this / Follow for more tips]",
  },
  {
    id: "transformation",
    name: "Transformation",
    description: "Before/after breakdown for you or a client/customer.",
    fillInTemplate:
      "Hook: [Before state] to [after state] in [timeframe] -- here's exactly how.\nBefore: [starting point, specific numbers if possible]\nWhat changed: [the 2-3 key moves]\nAfter: [result, specific numbers]\nCTA: [Follow if you want the same result / DM keyword for the process]",
  },
  {
    id: "challenge",
    name: "Challenge",
    description: "Complete or document a niche-relevant challenge on camera.",
    fillInTemplate:
      "Hook: I'm going to [challenge] in [timeframe] -- here's day/attempt 1.\nThe rules: [constraints]\nWhat happened: [progress/result]\nWhat I learned: [takeaway]\nCTA: [Follow to see how this ends]",
  },
];

// The doc's "7 Viral Hook Angles" map 1:1 onto the script angles above (Tutorial=Framework),
// so we reuse SCRIPT_ANGLES for hook-angle selection too.

export type StoryType = {
  id: string;
  name: string;
  description: string;
  fillInTemplate: string;
};

export const STORY_TYPES: StoryType[] = [
  {
    id: "my_story",
    name: "My Story",
    description: "Your personal background or founder origin story.",
    fillInTemplate:
      "Hook: How I went from [starting point] to [current identity/role].\nBeat 1: [origin moment / spark]\nBeat 2: [struggle or turning point]\nBeat 3: [where it led / current state]\nCTA: [Follow to see the rest of the build]",
  },
  {
    id: "win",
    name: "Win Story",
    description: "A major or minor achievement, milestone, or opportunity.",
    fillInTemplate:
      "Hook: We just [win] -- here's what it took.\nContext: [what the goal was]\nThe work: [what you actually did]\nThe win: [specific result]\nCTA: [Follow for more of the journey]",
  },
  {
    id: "loss",
    name: "Loss Story",
    description: "A mistake, failure, or setback in business or life.",
    fillInTemplate:
      "Hook: [Timeframe] ago I [failure/setback] -- and it nearly ended [thing].\nWhat happened: [the setback, be specific]\nHow it felt: [honest emotional beat]\nWhat I did next: [the recovery move]\nCTA: [Follow if you're in the middle of your own setback]",
  },
  {
    id: "lesson",
    name: "Lesson Story",
    description: "One specific lesson learned from a past win or loss.",
    fillInTemplate:
      "Hook: The one lesson [past experience] taught me about [topic].\nSetup: [brief context of the experience]\nThe lesson: [the specific insight]\nHow I apply it now: [current behavior change]\nCTA: [Follow for more lessons from the build]",
  },
  {
    id: "transformation_story",
    name: "Transformation Story",
    description: "Before-and-after journey for yourself or a client.",
    fillInTemplate:
      "Hook: [Before] to [after] -- this is the [timeframe] transformation.\nBefore: [specific starting details]\nThe turning point: [what changed]\nAfter: [specific current details]\nCTA: [Follow / DM keyword for how]",
  },
  {
    id: "challenge_story",
    name: "Challenge Story",
    description: "A personal challenge and the step-by-step journey to complete it.",
    fillInTemplate:
      "Hook: I'm committing to [challenge] -- documenting every step.\nWhy: [the reason behind the challenge]\nThe plan: [how you'll do it]\nProgress so far: [current status]\nCTA: [Follow to watch this play out]",
  },
  {
    id: "big_goal",
    name: "Big Goal / Dream Journey",
    description: "A major long-term objective plus the actionable game plan.",
    fillInTemplate:
      "Hook: My goal is [big goal] by [date] -- here's the exact plan.\nWhy this goal: [motivation]\nThe plan: [milestones/steps]\nWhere I am now: [current progress]\nCTA: [Follow to watch me build toward this]",
  },
];

export const JOURNEY_SERIES_FORMATS = [
  { id: "daily", name: "Daily Series", description: "Daily progress updates tracking a specific goal (\"Day 1 of completing X\")." },
  { id: "progress", name: "Progress Update Series", description: "Sporadic updates on ongoing projects or long-term goals." },
  { id: "lessons", name: "Lessons Series", description: "One specific lesson learned per episode." },
  { id: "step_by_step", name: "Step-by-Step Series", description: "Breaking down one stage of a multi-step project per episode." },
  { id: "metrics", name: "Number & Metric Updates", description: "Transparent income/revenue/performance figures." },
  { id: "cost_breakdown", name: "Cost Breakdowns", description: "Exact financial spend for building a product, business, or project." },
  { id: "retrospect", name: "What I Would Do Differently", description: "Reflecting on mistakes and takeaways after a business phase." },
];

export const AUTHORITY_CONTENT_FORMATS = [
  "Step-by-step tutorials (frameworks, formulas, actionable processes)",
  "Comparisons (side-by-side methods, actions, products, services)",
  "Myth busting & common mistakes",
  "Do vs Don't (right vs wrong)",
  "Educational tips & hacks",
  "Q&A, rankings & tier lists",
  "Transformations (before/after for you or clients)",
  "Celebrity / brand fake case studies (\"if I were hired by X\")",
  "\"Starting from scratch\" fake case studies (\"if I reset to zero\")",
];

export const FILMING_FORMATS = [
  { id: "talking_back_forth", name: "Talking Back & Forth", description: "Smart character vs naive character dialogue." },
  { id: "visual_format", name: "Visual Format", description: "Teaching using props or physical visuals." },
  { id: "voiceover_broll", name: "Voiceover Format", description: "Narrating over B-roll/images." },
  { id: "multitasking", name: "Multitasking Format", description: "Teaching while cooking, cleaning, doing another activity." },
  { id: "setting_changes", name: "Setting Changes", description: "Switching locations across cuts." },
  { id: "shot_angle_changes", name: "Shot / Angle Changes", description: "Changing camera angle every ~2 seconds." },
  { id: "clone", name: "Clone Format", description: "Doubling yourself on screen for comparison." },
  { id: "whiteboard", name: "Whiteboard Format", description: "Explaining concepts visually on a whiteboard." },
  { id: "qa", name: "Q&A Format", description: "Off-camera interviewer asking questions." },
  { id: "green_screen", name: "Green Screen Format", description: "Speaking with relevant background media." },
  { id: "reaction", name: "Reaction Format", description: "Reacting to niche viral clips with expert commentary." },
  { id: "audio_broll_text", name: "Audio B-Roll + Text", description: "Line-by-line images/videos changing every 1-3 seconds, paired with on-screen text and emotional background music -- no voiceover." },
];

// The playbook calls out these 3 (of the 12 above) as the ones that perform
// exceptionally well specifically for storytelling/journey content.
export const STORYTELLING_RECOMMENDED_FORMAT_IDS = ["voiceover_broll", "shot_angle_changes", "audio_broll_text"];

export const HISTORICAL_MEDIA_TIP =
  "Whenever it exists, use the actual photo or video from the time period you're talking about -- not a generic stand-in. Real historical media is what makes a storytelling video feel authentic instead of staged.";

export const UNIVERSAL_HOOK_TEMPLATES = [
  "Is it possible to [outcome]...",
  "[X] days/years ago vs today...",
  "Did you know if you [action]...",
  "3 levels of [topic]...",
  "Smart [role] vs dumb [role] when it comes to [topic]",
  "This is a picture of my first [experience] with [topic]",
];

export const PROFILE_RIGHT_WRONG = [
  { field: "Link in bio", wrong: "Linktree with multiple links (kills conversion up to 50%)", right: "1 single destination link (landing page or freebie)" },
  { field: "Username", wrong: "Random or confusing handle", right: "Your full personal name or business name" },
  { field: "Tagline / name field", wrong: "Only your name", right: "[Name] | [Searchable keyword / niche / occupation]" },
  { field: "Profile picture", wrong: "Far-away shot, multiple people, busy background", right: "Clear close-up headshot, solid background" },
  { field: "Bio structure", wrong: "Messy, unstructured, ambiguous text", right: "4-line structured framework -- clear in 5 seconds" },
];

// Real numbers from the playbook, used to calibrate the easy/reach vs
// complex/conversion choice with something concrete instead of abstract advice.
export const REACH_VS_CONVERSION_EXAMPLE = {
  easy: {
    label: "Easy / low-effort (e.g. a rating reel)",
    views: "1,000,000 views",
    result: "~200 new followers",
    verdict: "High reach, close to zero conversion.",
  },
  complex: {
    label: "Complex / high-effort (raw storytelling / hyper-educational breakdown)",
    views: "1,000,000+ views",
    result: "30,000+ new followers",
    verdict: "Same reach ballpark, 150x the conversion.",
  },
};

export type HookStackExample = { written: string; verbal: string; visual: string; niche: string };

// Real hook stack examples from the playbook (styling niche) -- used as concrete
// few-shot calibration so "hyper-specific" has a real bar to hit, not just a rule.
export const HOOK_STACK_EXAMPLES: HookStackExample[] = [
  {
    niche: "styling / fashion",
    written: "Hairstyle neckline guide",
    verbal: "This is the best hairstyle for different tops",
    visual: "Clone visual effect (multiple versions of yourself side by side)",
  },
  {
    niche: "styling / fashion",
    written: "How to dress for your proportions",
    verbal: "How to dress for your body type",
    visual: "Drawn-on visuals and body-type labels over the frame",
  },
  {
    niche: "styling / fashion",
    written: "Jeans for different body types",
    verbal: "Try on jeans based on your body shape",
    visual: "Three clones on screen, each in a different jean cut, labeled",
  },
];

export type ToolEntry = {
  name: string;
  purpose: string;
  status: "connected" | "manual" | "planned";
  note: string;
};

export const TOOLS: ToolEntry[] = [
  {
    name: "gettranscribe.ai",
    purpose: "Transcribe a viral reel's audio to text",
    status: "manual",
    note: "Paste the reel link there, copy the transcript, paste it into Script Studio's Transcript → Template tool.",
  },
  {
    name: "Sort Feed (Chrome extension)",
    purpose: "Sort a specific creator's Reels by view count and export as CSV",
    status: "connected",
    note: "Export the CSV from the extension, then paste it into the Outlier Research Hub's CSV import -- it auto-computes the 5x multiple for every row and bulk-saves the outliers.",
  },
  {
    name: "Instagram Explore / Reels tab",
    purpose: "Keyword search and reels-recommendation-feed research methods",
    status: "manual",
    note: "Native Instagram -- no export tool exists for these two methods, so log finds one at a time in the Research page.",
  },
  {
    name: "Dummy account + algorithm reset",
    purpose: "Reset a research account's suggested content before a research session",
    status: "manual",
    note: "Profile → Menu → Content Preferences → Reset Suggested Content → Reset. Checklist is on the Research page.",
  },
  {
    name: "Instagram's Edits app",
    purpose: "Deeper analytics tracking once you're past 1,000 followers (Level 2 audit)",
    status: "manual",
    note: "External app -- log the numbers you find into Analytics & Levels manually; no public API exists to pull them automatically.",
  },
  {
    name: "ManyChat",
    purpose: "Comment-trigger automation → automated DM with your bio link",
    status: "manual",
    note: "Set up the automation in ManyChat directly (checklist on the CTA & Funnel Mapper page); this app writes the DM message copy for you.",
  },
  {
    name: "CapCut",
    purpose: "Editing your filmed footage",
    status: "manual",
    note: "External editor. Shot lists from Production Planner are built to hand straight to an editor if you're not cutting it yourself.",
  },
  {
    name: "PFPMaker",
    purpose: "Generate a profile picture with a background matched to your brand colors",
    status: "manual",
    note: "External tool -- feed it your brand colors from the Brand Foundation page.",
  },
  {
    name: "Basic tripod + microphone",
    purpose: "Filming setup",
    status: "connected",
    note: "Tracked as your equipment checklist on the Production Planner page.",
  },
  {
    name: "Gemini API",
    purpose: "Live AI generation for every prompt in this app",
    status: "connected",
    note: "Add GEMINI_API_KEY in your environment to enable \"Generate\" buttons everywhere.",
  },
  {
    name: "Claude / ChatGPT (or any LLM)",
    purpose: "Manual fallback for every generator",
    status: "connected",
    note: "Every prompt has a \"Copy prompt\" option that works with any chat AI, no API key required.",
  },
  {
    name: "Direct Instagram analytics API",
    purpose: "Auto-pull view/follower counts instead of manual entry",
    status: "planned",
    note: "Instagram has no public API for this use case -- not currently buildable. Logged here so it isn't forgotten if that changes.",
  },
  {
    name: "ManyChat API integration",
    purpose: "Create/update trigger-word automations directly from this app",
    status: "planned",
    note: "Possible future build -- ManyChat does have an API. Not built yet.",
  },
];

// Distilled from a 2026 research pass on what separates crisp, high-retention
// short-form scripts from bloated/fluffy ones (see agent research, Sep 2026).
// Used to tighten every script-generation prompt and as the checklist applied
// when hand-writing scripts directly.
export const SCRIPT_CRAFT_RULES = {
  hook: [
    "Verbal hook must land by 1.0s -- no logo, no \"hey guys,\" no brand name, no setup sentence before it.",
    "Hook sentence is one clause, one claim, ≤10 words.",
    "Use the specific-outcome pattern where possible: [bad number] → [good number] in [timeframe] using [thing]. Numbers beat vague claims.",
    "Combine at least 2 of: pattern interrupt, emotional spike, curiosity gap, self-relevance callout (\"If you're a [specific audience]...\").",
    "Never state that a topic will be discussed -- state the payoff or tension itself.",
  ],
  body: [
    "One idea per video. Every example/beat must serve the single hook's promise -- no digressions.",
    "Pattern-interrupt cadence every 7-10s for educational/consulting content (every 3-5s only for fast/punchy formats).",
    "Place a reinforcement beat (mid-video re-hook/reframe) at roughly 25-40% and 60-75% of runtime.",
    "Each body segment should close the prior open loop and immediately open a new one -- no flat beats.",
    "Cut on sight: throat-clearing openers (\"So,\" \"Okay so,\" \"Today I want to talk about\"), hedges (\"just,\" \"really,\" \"very,\" \"kind of,\" \"I think,\" \"basically\"), redundant connectives (\"in order to\" → \"to\"), restated setup (\"as I mentioned\").",
    "Target 130-145 wpm baseline (slower end for consulting/educational density -- ideas need processing time).",
  ],
  cta: [
    "TOFU: no hard CTA, or one soft low-friction CTA at the very end only, tied to the video's specific topic (not generic \"follow me\"). Never interrupt pacing for a mid-video CTA on TOFU content.",
    "MOFU: one CTA, can land mid- or end-video, framed as a value exchange (\"comment X and I'll send you the checklist\") -- not a sales ask.",
    "BOFU: one explicit, specific CTA near the end naming the exact next step (link in bio, DM keyword, book a call). Never repeat/nag a CTA.",
    "Never reuse the same CTA wording across all three funnel stages -- mismatched CTA-to-intent reads as fluff and kills trust.",
  ],
  length: [
    "Runtime multiplier on script word count: talking-head/no b-roll ×0.95, mixed voiceover+b-roll ×0.85, visual-heavy/whiteboard/demo ×0.75 (at 130-145 wpm baseline).",
    "~140-150 words for a tight 60s explainer; scale roughly linearly down to 35-75 words for a 15-30s reel.",
    "Narrow the idea before shortening artificially -- a fully-resolved narrow claim beats a padded vague one at any length.",
  ],
};

export const FIVE_X_OUTLIER_RULE =
  "An outlier is a reel from a small-to-midsize creator that got at least 5x more views than their total follower count. That's the bar for 'proven' before you model it.";

export const TRANSCRIPT_TEMPLATIZE_PROMPT =
  "This is a transcript from a viral video. Please make it into a script template that can be used for any niche. Keep the overall format/structure of the video and just make it the fill-in-the-blank version.";

export const FUNNEL_GUIDANCE: Record<"tofu" | "mofu" | "bofu", { label: string; goal: string; instruction: string }> = {
  tofu: {
    label: "TOFU (Top of funnel)",
    goal: "Reach a cold audience that doesn't know you yet.",
    instruction:
      "Open with your strongest, broadest-appeal hook. No hard ask -- the only job of this video is to earn a follow or a save. Don't reference your business/offer directly; let value speak for itself.",
  },
  mofu: {
    label: "MOFU (Middle of funnel)",
    goal: "Deepen trust with people who already follow or have seen you before.",
    instruction:
      "Go one layer deeper than a TOFU video -- more specific, more personal, or more advanced. Use a soft engagement CTA (ask a question, \"comment X\") to generate signal before pitching anything.",
  },
  bofu: {
    label: "BOFU (Bottom of funnel)",
    goal: "Convert a warm, ready audience into a lead or client.",
    instruction:
      "Speak directly to someone who already trusts you and is close to a decision. Use a strong, specific CTA (ManyChat trigger word, DM keyword, or a direct pitch) -- this is the video allowed to ask for something.",
  },
};

export const CTA_GUIDANCE: Record<"follow" | "engagement" | "manychat" | "none", string> = {
  follow: "Default for TOFU reach plays and proven-concept videos -- ask for a follow, nothing else.",
  engagement: "\"Comment X\" plays -- good for MOFU when you want signal/interaction before a pitch.",
  manychat: "Trigger-word → automated DM with your one bio link. Best for BOFU lead generation.",
  none: "Pure value/brand exposure, no ask at all.",
};

export const CONTENT_TYPES = ["educational", "storytelling", "authority", "other"] as const;
export const PILLARS = ["authority", "journey"] as const;
export const FUNNEL_STAGES = ["tofu", "mofu", "bofu"] as const;
export const CTA_TYPES = ["follow", "engagement", "manychat", "none"] as const;
export const CALENDAR_STATUSES = ["idea", "researched", "scripted", "filmed", "edited", "posted"] as const;
export const CONCEPT_BUCKETS = ["proven", "double_down", "experimental"] as const;
