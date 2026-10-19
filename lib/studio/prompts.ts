import type { BrandConfig } from "./brand";
import {
  TRANSCRIPT_TEMPLATIZE_PROMPT,
  FUNNEL_GUIDANCE,
  CTA_GUIDANCE,
  REACH_VS_CONVERSION_EXAMPLE,
  HOOK_STACK_EXAMPLES,
  HISTORICAL_MEDIA_TIP,
  SCRIPT_CRAFT_RULES,
  SCRIPT_ANGLES,
  FILMING_FORMATS,
} from "./reference";

function craftRulesBlock() {
  return `CRISP-SCRIPT RULES (no fluff -- violating these is a rewrite, not a nitpick):
Hook: ${SCRIPT_CRAFT_RULES.hook.join(" ")}
Body/pacing: ${SCRIPT_CRAFT_RULES.body.join(" ")}
CTA: ${SCRIPT_CRAFT_RULES.cta.join(" ")}
Length: ${SCRIPT_CRAFT_RULES.length.join(" ")}`;
}

// Agentic single-prompt scaffold (research-backed: Self-Refine / phase-tagged
// reasoning / grouped constraints with primacy+recency). There's no real
// multi-turn tool loop here -- the user pastes this whole block into
// Claude/ChatGPT/Gemini -- so the only lever for getting research -> draft ->
// self-critique -> revise behavior out of a single-pass model is explicit
// phase tags that forbid skipping ahead, plus a persona-switch on the
// critique step (a model grading its own work in the same voice is a weaker
// critic than one told to switch roles). Constraints are grouped
// (hard/style/format) rather than one flat list, since compositional
// constraint-following degrades non-linearly past ~7-10 flat items, and the
// most important rules are repeated at both the start and the end (primacy +
// recency) rather than stated once in the middle where they're most likely
// to be dropped.
function agenticScriptScaffold(opts: {
  hardConstraints: string[];
  styleGuidelines: string[];
  outputFormatSpec: string;
  retentionPlanFields: string[];
}) {
  const hard = opts.hardConstraints.map((c, i) => `${i + 1}. ${c}`).join("\n");
  return `Work through this in 4 explicit phases, in order. Do not skip ahead to Phase 4 without visibly completing 1-3 -- the phases are your working process, not optional scaffolding.

<hard_constraints>
(Non-negotiable. A script violating any of these needs a rewrite, not a note.)
${hard}
</hard_constraints>

<style_guidelines>
(Soft preferences -- follow unless a hard constraint above overrides them.)
${opts.styleGuidelines.map((g) => `- ${g}`).join("\n")}
</style_guidelines>

PHASE 1 -- <retention_plan>: Before writing a single line of the script, reason through:
${opts.retentionPlanFields.map((f) => `- ${f}`).join("\n")}
Output this reasoning as a short bulleted plan. Every line of the script you write in Phase 2 must map back to something in this plan -- don't write freeform and retrofit a plan afterward.

PHASE 2 -- <draft_v1>: Write a complete first draft following the retention plan and the output format spec below.

PHASE 3 -- <self_critique>: Switch roles. You are now a ruthless short-form video editor reviewing a stranger's draft, not the person who wrote it. Find at least 3 concrete, specific flaws -- quote the exact line and name the failure (weak/slow hook, a hard constraint violated, a dead pacing stretch, a mismatched CTA, generic language that could apply to any creator). Do not praise anything here; this phase only exists to find what's wrong.

PHASE 4 -- <final_script>: Revise draft_v1 to fix every flaw found in Phase 3. Before outputting, re-read the result against every item in hard_constraints above, one by one, and confirm each is satisfied -- fix anything that isn't. Then output ONLY the final script, in this exact format:
${opts.outputFormatSpec}

Only <final_script> is the deliverable. Phases 1-3 are your reasoning, not part of the answer -- but do the work, don't jump straight to Phase 4.`;
}

export function brandContext(brand: BrandConfig) {
  return `You are helping ${brand.nameField}, ${brand.occupation}.
Niche: ${brand.niche}
Sub-niches: ${brand.subniches.join(", ")}
Founder story (for tone/reference, don't repeat verbatim unless asked): ${brand.founderStory}
Proprietary value/credibility to draw on: ${brand.proprietaryValue}
Voice: direct, specific, no fluff, first-person founder voice. Every claim must be hyper-specific and actionable, never vague ("fluffy").`;
}

function hookExamplesBlock() {
  const good = HOOK_STACK_EXAMPLES.map(
    (e) => `  - Written: "${e.written}" | Verbal: "${e.verbal}" | Visual: ${e.visual}`
  ).join("\n");
  return `GOOD hook stacks look like this (real examples, note how specific and visual each line is):
${good}

BAD hook stack (never write like this -- too vague to stop a scroll):
  - Written: "Tips for you" | Verbal: "Here's something you should know" | Visual: just talking to camera`;
}

export function buildHookStackPrompt(brand: BrandConfig, opts: { topic: string; angle?: string }) {
  return `${brandContext(brand)}

TASK: Generate 3 complete Hook Stacks for a short-form video on this topic: "${opts.topic}".
${opts.angle ? `Script angle to use: ${opts.angle}` : ""}
Preferred hook types to lean on: ${brand.hookPrefs.join(" + ")} (visual hook optional but include one idea anyway).

For EACH hook stack, give:
- Written hook (on-screen text, first 3 seconds)
- Verbal hook (first line spoken)
- Visual hook (what's seen in the first 3 seconds)

${hookExamplesBlock()}

Rules: each hook must be hyper-specific (numbers, names, timeframes), not generic. No emojis. Keep each line under 12 words. If you can't make it as specific as the good examples above, keep refining before you output it.`;
}

export function buildScriptPrompt(
  brand: BrandConfig,
  opts: {
    pillar: "authority" | "journey";
    contentType: string;
    angleOrStoryType: string;
    topic: string;
    hookStack?: { written?: string; verbal?: string; visual?: string };
    format?: string;
    depth?: "easy" | "complex";
    funnelStage?: "tofu" | "mofu" | "bofu";
    ctaType?: "follow" | "engagement" | "manychat" | "none";
  }
) {
  const depthInstruction =
    opts.depth === "easy"
      ? `Depth: EASY / LOW-EFFORT. Use an obvious, simple repeating pattern (a rating, a ranked list, a "if you do X, Y happens" structure). Optimize for broad reach and fast comprehension over depth.
Reality check from real results -- ${REACH_VS_CONVERSION_EXAMPLE.easy.label}: ${REACH_VS_CONVERSION_EXAMPLE.easy.views} → ${REACH_VS_CONVERSION_EXAMPLE.easy.result}. ${REACH_VS_CONVERSION_EXAMPLE.easy.verdict} That's the trade-off you're choosing -- fine for occasional reach plays, not for building an audience.`
      : opts.depth === "complex"
        ? `Depth: COMPLEX / HIGH-EFFORT. Use raw storytelling or a hyper-educational breakdown that's harder to recognize as a template (a side-by-side scenario comparison, a "is it possible to..." deep dive). Optimize for conversion into followers/leads, not just views.
Reality check from real results -- ${REACH_VS_CONVERSION_EXAMPLE.complex.label}: ${REACH_VS_CONVERSION_EXAMPLE.complex.views} → ${REACH_VS_CONVERSION_EXAMPLE.complex.result}. ${REACH_VS_CONVERSION_EXAMPLE.complex.verdict} This is the default you should reach for when building a personal brand, not just chasing views.`
        : "";

  const funnel = opts.funnelStage ? FUNNEL_GUIDANCE[opts.funnelStage] : null;
  const funnelInstruction = funnel
    ? `Funnel stage: ${funnel.label} -- goal: ${funnel.goal}\n${funnel.instruction}`
    : "";

  const ctaInstruction = opts.ctaType
    ? `CTA type: ${opts.ctaType} -- ${CTA_GUIDANCE[opts.ctaType]}`
    : "Default to a Follow CTA unless the funnel stage above says otherwise.";

  const historicalMediaNote =
    opts.pillar === "journey" ? `\nIf this touches a past event/period, remind me in the GREEN notes: ${HISTORICAL_MEDIA_TIP}` : "";

  const hookLine = opts.hookStack
    ? `Use this hook stack -- Written: "${opts.hookStack.written}" | Verbal: "${opts.hookStack.verbal}" | Visual: "${opts.hookStack.visual}"`
    : "Open with a strong written + verbal hook you construct yourself.";

  const hardConstraints = [
    "Verbal hook lands by 1.0-1.5s -- no logo, no \"hey guys,\" no setup sentence before it. One clause, ≤10 words, ideally a specific number.",
    `CTA type is "${opts.ctaType ?? "follow"}" and matches the funnel stage (${opts.funnelStage ?? "tofu"}) exactly -- ${ctaInstruction}`,
    "No throat-clearing openers, hedge words (\"just,\" \"really,\" \"very,\" \"kind of,\" \"basically,\" \"I think\"), or restated setup anywhere in BLACK.",
    "Every claim in BLACK is hyper-specific (a number, a name, a timeframe) -- never a generic statement that any creator in any niche could say.",
    opts.hookStack
      ? "The provided hook stack is used as given, not replaced with a new one."
      : "The hook you construct is at least as specific as the GOOD example below, not a generic version of it.",
  ];

  const styleGuidelines = [
    `Speaking pace 130-145 wpm baseline (slower end for consulting/educational density -- ideas need processing time).`,
    `Pattern-interrupt cadence every 7-10s for measured/educational content, every 3-5s for fast/punchy formats.`,
    `First-person founder voice, direct and specific, matching: ${brand.nameField.split("|")[0].trim()}.`,
    depthInstruction || "Match depth to the funnel stage -- broader/simpler for TOFU, deeper for MOFU/BOFU.",
  ];

  const outputFormatSpec = `3 color-coded bullet groups, exactly like this, nothing before or after:
BLACK (spoken dialogue, line by line):
- ...
RED (physical actions / camera movement instructions):
- ...
GREEN (editing / graphic instructions for the editor):
- ...`;

  return `${brandContext(brand)}

TASK: Write a full short-form video script (45-75 seconds spoken) for:
Pillar: ${opts.pillar}
Content type: ${opts.contentType}
Angle / story type: ${opts.angleOrStoryType}
Topic: ${opts.topic}
${hookLine}
${opts.format ? `Filming format: ${opts.format}` : ""}
${funnelInstruction}
${historicalMediaNote}

${agenticScriptScaffold({
    hardConstraints,
    styleGuidelines,
    outputFormatSpec,
    retentionPlanFields: [
      "hook_type -- which mechanism it uses (specific-outcome number, curiosity gap, pattern interrupt, self-relevance callout, or a combination)",
      "hook_line_timed_to_3s -- the exact line, and confirm it's ≤10 words and lands the claim, not the setup",
      "open_loops_and_timestamps -- every ~7-10s beat, what question or tension it opens, and what closes it",
      "pacing_risk_points -- where in the 45-75s a viewer is most likely to drop off, and what specifically prevents it there",
      "payoff_placement -- where the core value/insight actually lands, and why the CTA placement after it makes sense",
    ],
  })}

GOOD script opening (specific, earns attention immediately): "3 years ago I lost my biggest client because I priced a market-entry project wrong by $40,000. Here's the exact pricing framework I built so it never happened again."
BAD script opening (never write like this -- vague, no reason to keep watching): "Today I want to talk about something important in business that a lot of people don't think about enough."`;
}

export function buildTranscriptTemplatizePrompt(transcript: string) {
  return `${TRANSCRIPT_TEMPLATIZE_PROMPT}\n\nTRANSCRIPT:\n${transcript}`;
}

export function buildCaptionPrompt(
  brand: BrandConfig,
  opts: { hook: string; ctaType: string; topic: string }
) {
  return `${brandContext(brand)}

TASK: Write an Instagram caption using this exact 3-line structure:
Line 1: Written hook (reuse or lightly adapt): "${opts.hook}"
(double space)
Line 2: Call to action for a "${opts.ctaType}" goal (${CTA_GUIDANCE[opts.ctaType as keyof typeof CTA_GUIDANCE] ?? "match the CTA type given"})
(double space)
Line 3: 3 to 5 niche/audience/topic keywords or hashtags relevant to "${opts.topic}" and the sub-niches: ${brand.subniches.join(", ")}

GOOD example structure:
"3 years ago I priced a project $40,000 too low. Here's the framework I use now.

Follow for more consulting frameworks.

#marketentry #consultingtips #businessstrategy"

BAD example (never do this -- generic hook, vague CTA, hashtag spam instead of relevant keywords):
"Some thoughts on business 💭

Like and follow!

#business #entrepreneur #success #hustle #motivation #grind #ceo #mindset"

Output only the caption, nothing else.`;
}

export function buildCalendarIdeationPrompt(
  brand: BrandConfig,
  opts: { count: number; pillarRatio: { authority: number; journey: number }; conceptRatio: { proven: number; doubleDown: number; experimental: number } }
) {
  return `${brandContext(brand)}

TASK: Propose ${opts.count} video topics for the next content batch.
Respect this pillar split: ${opts.pillarRatio.authority}% Expert/Authority content, ${opts.pillarRatio.journey}% Documentation/Journey content.
Respect this concept split: ${opts.conceptRatio.proven}% Proven Concepts (topics/hooks modeled on outlier research), ${opts.conceptRatio.doubleDown}% Doubling Down (variants of my own past outliers), ${opts.conceptRatio.experimental}% Original Experiments.
Journey content should draw on: ${brand.journeyAssets}
Signature differentiated angle to weave in occasionally: ${brand.humanAlpha}

For each topic give: Topic | Pillar (authority/journey) | Concept bucket (proven/double_down/experimental) | Suggested script angle | One-line hook idea.
Return as a markdown table.

GOOD batch discipline: the exact ratios above, hit on purpose -- e.g. for a 12-video batch at 70/20/10, that's 8-9 proven, 2-3 double-downs, 1-2 experiments, not "whatever felt inspired."
BAD batch discipline (avoid): 12 topics that are all original experiments because they seemed fun, with no outlier research behind any of them, and no journey content at all.`;
}

export function buildDoubleDownPrompt(
  brand: BrandConfig,
  opts: { topic: string; hook?: string; format?: string }
) {
  return `${brandContext(brand)}

My past video "${opts.topic}" (hook: "${opts.hook ?? "n/a"}", format: "${opts.format ?? "n/a"}") outperformed my average -- it's a proven outlier for my own account.

TASK: Give me 3 "double down" variants, one per method:
A) Keep most elements identical, tweak only the value/details.
B) Keep the structure/format identical, change the topic entirely.
C) Keep the core topic identical, present it in a completely new filming format.

For each variant give: new topic/angle, hook idea, and format to use.

GOOD variant (method B example): original was "3 pricing mistakes I made" (list format) → new: "3 pricing mistakes founders make when entering the US market" (same list format, new topic sliced narrower).
BAD variant (avoid): a "double down" that changes everything at once (new topic, new format, new angle) -- that's not doubling down on what worked, it's a new experiment wearing a disguise.`;
}

export function buildKeywordBankPrompt(brand: BrandConfig) {
  return `${brandContext(brand)}

TASK: Generate a research keyword bank of 25-40 search terms across these 3 categories for finding 5x outlier reels on Instagram:
1. Niche: ${brand.niche}
2. Sub-niches: ${brand.subniches.join(", ")}
3. Occupation/title: ${brand.occupation}

Group the output under those 3 headings. Keywords should be things a real person would type into Instagram's search bar, not hashtags.

GOOD keyword: "how to price a consulting project" (a real search phrase someone in this niche would type).
BAD keyword: "#consultinglife" (a hashtag, not a search phrase -- won't surface outlier research the same way).`;
}

export function buildTopicResearchPrompt(brand: BrandConfig, opts: { subniche: string }) {
  return `${brandContext(brand)}

TASK: I need raw content ideas for the sub-niche "${opts.subniche}" within ${brand.niche}.
Research and list 10 specific, non-obvious frameworks, mental models, statistics, or case-study angles I could turn into short-form videos, drawing on how ${brand.occupation || "an expert in this niche"} would actually think about this. Prioritize measurable, specific value over generic advice. Cite the type of source (study/book/framework name) where relevant.

GOOD idea: "The 'beachhead market' concept from Geoffrey Moore's Crossing the Chasm -- why founders should pick ONE narrow segment to dominate before expanding, with a real cost-of-spreading-too-thin example."
BAD idea (too vague to script, avoid): "Talk about the importance of market research."`;
}

export function buildIndustryEntrySeriesPrompt(
  brand: BrandConfig,
  opts: { industry: string; episodes: number }
) {
  return `${brandContext(brand)}

Signature differentiator: ${brand.humanAlpha}

TASK: Design a ${opts.episodes}-episode short-form series called "How to Enter the ${opts.industry} Industry" -- a fake/real case-study breakdown of how ${brand.occupation} would approach a market-entry engagement in this industry, drawing on real consulting methodology (market sizing, regulatory landmines, local competitor mapping, distribution/channel strategy, pricing, go-to-market sequencing).

For each episode give: Episode title | Hook (written + verbal) | Core value point (hyper-specific, not generic) | Script angle to use | Suggested filming format.
Return as a numbered list, one episode per number. Keep total series watchable as a binge -- each episode must stand alone but reward watching the series in order.

${craftRulesBlock()}

GOOD episode value point: "In [industry], the #1 killer isn't competition -- it's a 6-9 month regulatory approval window most founders don't budget for."
BAD episode value point (avoid): "This industry has a lot of opportunity but also some challenges to consider."`;
}

// Signature series builder (BRIEF §19.6.2): the generalised form of Upcreate's
// "How to Enter the [Industry] Industry" series, built on the creator's human alpha.
export function buildSignatureSeriesPrompt(
  brand: BrandConfig,
  opts: { seriesName: string; subject: string; episodes: number }
) {
  return `${brandContext(brand)}

Signature differentiator (human alpha): ${brand.humanAlpha}

TASK: Design a ${opts.episodes}-episode short-form series called "${opts.seriesName}" about ${opts.subject}, drawing on how ${brand.occupation || "this creator"} actually works -- real methods, real numbers, real examples from the proprietary value above, not generic advice.

For each episode give: Episode title | Hook (written + verbal) | Core value point (hyper-specific, not generic) | Script angle to use | Suggested filming format.
Return as a numbered list, one episode per number. Each episode must stand alone but reward watching the series in order.

${craftRulesBlock()}

GOOD episode value point: one specific, costly, non-obvious insight with a number or a named example.
BAD episode value point (avoid): "There's a lot of opportunity here but also some challenges to consider."`;
}

export function buildProblemResearchPrompt(brand: BrandConfig, opts: { subniche: string }) {
  return `${brandContext(brand)}

TASK: List 10 specific, painful problems that ${brand.occupation}'s ideal audience faces in "${opts.subniche}". For each problem: name it in one line, explain why it's painful/costly, and suggest which script angle (framework, myth bust, comparison, transformation, etc.) would best address it as a short-form video.

GOOD problem: "Founders quote a flat consulting fee without scoping regulatory complexity first, then eat the cost overrun themselves." (specific, costly, scriptable as a myth-bust or transformation video)
BAD problem (avoid): "Business can be hard to figure out sometimes."`;
}

export function buildRawIdeaDeveloperPrompt(brand: BrandConfig, opts: { rawIdea: string }) {
  return `${brandContext(brand)}

RAW IDEA (unfiltered, possibly messy): "${opts.rawIdea}"

TASK: Turn this raw idea into a complete video brief covering all 7 factors of a short:
1. Topic -- the sharpened, specific version of this idea.
2. Hooks -- a full hook stack (written, verbal, visual), hyper-specific.
3. Value -- the actual "meat": what specific, measurable knowledge/story does this deliver (not fluffy/vague)?
4. Script angle -- which of the 7 angles fits best (framework, comparison, myth bust, do/don't, tip/hack, transformation, challenge) and why.
5. CTA -- follow, engagement, ManyChat, or none, matched to a funnel stage (TOFU/MOFU/BOFU). Reference: ${Object.values(CTA_GUIDANCE).join(" ")}
6. Video format -- which of the 12 filming formats suits this idea, prioritizing my preferred formats: ${brand.formatPrefs.join(", ")}.
7. Editing notes -- 2-3 concrete on-screen text/graphic ideas using my visual assets: ${brand.assetTypes.join(", ")}.

If the raw idea is too vague to act on, say exactly what additional detail you need instead of guessing -- don't pad the answer with generic filler to look complete.`;
}

export function buildBioPrompt(brand: BrandConfig) {
  return `${brandContext(brand)}

TASK: Write my Instagram profile using the 4-line bio framework (so a viewer understands who I am and what I offer within 5 seconds):
Line 1: Who I am / role (hook-y, not just a title)
Line 2: Who I help + how (specific outcome, not vague)
Line 3: Proof/credibility (a specific number from my track record: ${brand.proprietaryValue})
Line 4: A single clear next step pointing to my one bio link (${brand.bioLink})

Also give me:
- 3 options for the searchable name field, in the format "[Name] | [Keyword/Niche/Occupation]" using my niche (${brand.niche}) and sub-niches (${brand.subniches.join(", ")}).
- A one-line check on my current handle/name field choice: "${brand.nameField}" -- does it read as spammy, confusing, or unclear? If so, fix it.

GOOD bio line 2 (specific outcome): "I help founders enter new markets without the $40K pricing mistakes."
BAD bio line 2 (avoid -- generic, could describe anyone): "Helping people achieve their business dreams ✨"

Keep every line specific and outcome-focused, no generic "helping people achieve their goals" language, no emojis unless they carry real meaning.`;
}

export function buildManyChatMessagePrompt(
  brand: BrandConfig,
  opts: { triggerWord: string; offer: string }
) {
  return `${brandContext(brand)}

TASK: Write the ManyChat automated DM sequence for this comment-trigger automation:
Trigger word (what viewers comment): "${opts.triggerWord}"
Offer being delivered: "${opts.offer}"

Give me:
1. The public comment-reply ManyChat sends before DMing (short, confirms it's coming).
2. The DM opening message (warm, on-brand, references the video they commented on).
3. The DM's actual delivery message with a single clear link to ${brand.bioLink}.
4. One optional follow-up message to send 24 hours later if they haven't clicked the link.

GOOD DM opener: "Hey! Saw you commented ${opts.triggerWord} on the pricing video -- here's the framework I promised, no fluff."
BAD DM opener (avoid -- reads like a bot, no reference to why they're getting this): "Hello! Thank you for your interest. Please find the link below."

Keep it conversational, first-person, zero corporate tone -- this is a DM from ${brand.nameField.split("|")[0].trim()}, not a bot.`;
}

export function buildOutlierDeconstructionPrompt(
  opts: { transcriptOrDescription: string }
) {
  return `This is the transcript or description of a viral outlier short-form video (a small-to-midsize creator's video that got 5x+ more views than their follower count):

"${opts.transcriptOrDescription}"

TASK: Deconstruct exactly why this video worked. Break it down into:
1. Hook type used (written/verbal/visual) and the specific hook text -- why does it stop the scroll?
2. Script angle (framework, comparison, myth bust, do/don't, tip/hack, transformation, or challenge).
3. Value type -- personal experience/knowledge, or a credible external source?
4. Structure -- map the video beat-by-beat (opening, build, payoff, CTA).
5. What's replicable vs. what's specific to that creator/niche (so I know what to actually copy vs. leave behind).

Be blunt about what's actually doing the work vs. what's incidental -- a good deconstruction says "the hook works because it names a specific dollar amount," not "the hook is engaging."`;
}

// ---------- Script Improver ----------
// Diagnose -> prioritize -> targeted rewrite, per the research pattern for
// editing-existing-content prompts: an LLM told to "just improve this"
// tends to rewrite wholesale, discarding lines that already worked. Forcing
// an explicit severity-tagged diagnosis first, then a fix plan ordered by
// severity, then a rewrite that's instructed to preserve what wasn't
// flagged, keeps the revision targeted instead of a full regeneration.

function allFormatsGuide() {
  return FILMING_FORMATS.map((f) => `- ${f.name}: ${f.description}`).join("\n");
}

function allAnglesGuide() {
  return SCRIPT_ANGLES.map((a) => `- ${a.name}: ${a.description}`).join("\n");
}

function allFunnelGuide() {
  return (Object.keys(FUNNEL_GUIDANCE) as (keyof typeof FUNNEL_GUIDANCE)[])
    .map((k) => `- ${FUNNEL_GUIDANCE[k].label}: ${FUNNEL_GUIDANCE[k].goal} ${FUNNEL_GUIDANCE[k].instruction}`)
    .join("\n");
}

function allCtaGuide() {
  return (Object.keys(CTA_GUIDANCE) as (keyof typeof CTA_GUIDANCE)[])
    .map((k) => `- ${k}: ${CTA_GUIDANCE[k]}`)
    .join("\n");
}

export function buildScriptImproverPrompt(
  brand: BrandConfig,
  opts: {
    bodyBlack: string;
    bodyRed?: string;
    bodyGreen?: string;
    pillar?: string;
    contentType?: string;
    angleOrStoryType?: string;
    format?: string;
    funnelStage?: "tofu" | "mofu" | "bofu";
    ctaType?: "follow" | "engagement" | "manychat" | "none";
    focusNotes?: string;
  }
) {
  const currentContext = [
    opts.pillar ? `Pillar: ${opts.pillar}` : null,
    opts.contentType ? `Content type: ${opts.contentType}` : null,
    opts.angleOrStoryType ? `Angle / story type: ${opts.angleOrStoryType}` : null,
    opts.format ? `Filming format: ${opts.format}` : null,
    opts.funnelStage ? `Funnel stage: ${FUNNEL_GUIDANCE[opts.funnelStage].label} -- ${FUNNEL_GUIDANCE[opts.funnelStage].goal}` : null,
    opts.ctaType ? `CTA type: ${opts.ctaType} -- ${CTA_GUIDANCE[opts.ctaType]}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `${brandContext(brand)}

TASK: You're being handed an EXISTING script to improve, not asked to write a new one from scratch. Diagnose it, prioritize the fixes, then do a targeted rewrite -- don't discard what already works.

${currentContext ? `CURRENT METADATA (may be wrong -- correct it in your diagnosis if the script doesn't actually fit):\n${currentContext}\n` : ""}
EXISTING SCRIPT:
BLACK (spoken):
${opts.bodyBlack}
${opts.bodyRed ? `\nRED (camera/action):\n${opts.bodyRed}` : ""}
${opts.bodyGreen ? `\nGREEN (editing):\n${opts.bodyGreen}` : ""}

${opts.focusNotes ? `SPECIFIC FOCUS FOR THIS PASS (prioritize this over generic cleanup): ${opts.focusNotes}\n` : ""}
REFERENCE -- every format, angle, funnel stage, and CTA type this app tracks, so you can recommend a change of any of these if the script would work better in a different one, not just polish the one it's already in:

Filming formats:
${allFormatsGuide()}

Script angles:
${allAnglesGuide()}

Funnel stages:
${allFunnelGuide()}

CTA types:
${allCtaGuide()}

${craftRulesBlock()}

Work through this in 3 explicit phases, in order. Do not skip ahead.

PHASE 1 -- <diagnosis>: List every weakness in the existing script. For each one, cite the exact line or beat, name the failure category (hook / pacing / specificity / craft-rule violation / CTA-funnel mismatch / format mismatch / persuasion structure), and tag its severity as HIGH, MEDIUM, or LOW. Be adversarial -- you are a ruthless editor reviewing a stranger's draft, not the person who wrote it. Also explicitly note anything that's already strong and should NOT be touched (a real hook, a specific number, a line with real proof) -- name it so it survives the rewrite.

PHASE 2 -- <fix_plan>: Order the HIGH severity issues first, then MEDIUM, then LOW. For each, state the specific fix (not "make it better" -- the actual replacement line, structural change, or format/angle/funnel/CTA swap, citing the reference guide above if a swap is recommended). If everything is already strong, say so explicitly instead of inventing fixes to seem thorough.

PHASE 3 -- <revised_script>: Rewrite the script implementing every fix from the plan, in priority order, while explicitly preserving every line flagged as already-strong in Phase 1 -- don't regenerate what wasn't broken. Before finalizing, re-check the result against the crisp-script rules above, one by one. Then output ONLY the final result in this exact format, nothing before or after:
BLACK (spoken dialogue, line by line):
- ...
RED (physical actions / camera movement instructions):
- ...
GREEN (editing / graphic instructions for the editor):
- ...
(If you recommended a format, angle, funnel stage, or CTA change in Phase 2, state it in one line above the BLACK section, then write the script for the NEW recommendation, not the old one.)`;
}
