// Content expansion Phase 2: 7 more new sub-categories, 4 scripts each = 28
// scripts. Same contained pattern as Phase 1 (lib/seed-data/newCategoriesBatch.ts).
// Continues the weekly cadence right after Phase 1 (28 items at
// NEW_CATEGORIES_START_WEEK=395, weekOffset 0-27 -> occupies weeks 395-422),
// starting at week 423.

import type { BatchScript } from "./octBatch";
import { BASE_DATE } from "./octBatch";

export { BASE_DATE };
export const NEW_CATEGORIES_2_START_WEEK = 423;
export const NEW_CATEGORIES_2_BATCH_TAG = "new_categories_2_28_batch_v1";

export type NewCategoryScript = BatchScript & { topicTag: string };

const T = "follow" as const;
const M = "engagement" as const;
const B = "manychat" as const;

export const NEW_CATEGORIES_2_BATCH: NewCategoryScript[] = [
  // ---------- Networking & Relationship Building (4) ----------
  {
    weekOffset: 0, topicTag: "Networking & Relationship Building",
    title: "3 Levels of Professional Networking",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: collecting contacts at events and never following up.\nLevel 2: following up once, then letting the relationship go quiet.\nLevel 3: reaching out with something useful before you need anything, on a real cadence.\nMost people network at Level 1 and wonder why their contact list doesn't turn into anything.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I keep Level 3 relationships warm without it feeling forced.",
  },
  {
    weekOffset: 1, topicTag: "Networking & Relationship Building",
    title: "Myth Bust: Networking Events Aren't Where Real Relationships Get Built",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "The event is where you meet someone. It's rarely where the relationship actually forms.\nWhat builds it: one specific, useful follow-up within a week, tied to something you actually discussed.\nMost of my strongest professional relationships trace back to a follow-up message, not the event itself.",
    bodyRed: "React with visible skepticism to a crowded networking event clip.", bodyGreen: "On-screen text: \"the follow-up builds it, not the event\".",
    ctaLine: "Follow for how I write a follow-up that actually gets a reply.",
  },
  {
    weekOffset: 2, topicTag: "Networking & Relationship Building",
    title: "The 3 Questions I Ask to Turn a New Contact Into a Real Relationship",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What are you working on right now that's actually hard?\" Gets past small talk fast.\n\"Is there anyone in my network who could help with that?\" Turns the conversation into value, not networking for its own sake.\n\"What's the best way to stay useful to you going forward?\" Sets up the follow-up before the conversation even ends.\nComment \"NETWORK\" and I'll send you how I track relationships so nothing goes cold.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment NETWORK\".",
    ctaLine: "Comment NETWORK and I'll send you how I track relationships.",
  },
  {
    weekOffset: 3, topicTag: "Networking & Relationship Building",
    title: "The Framework for Building a Referral Network From Scratch",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most referral networks happen by accident. Here's how I built mine deliberately.\nStep 1: list the 10 people whose clients would also need what you offer, but who aren't direct competitors.\nStep 2: send each one a specific, useful piece of value first -- an intro, an insight, a referral of your own -- before asking for anything.\nStep 3: after the relationship is real, ask directly: \"if a client of yours ever needs X, would you be open to sending them my way?\"\nStep 4: keep every referral relationship warm with a quarterly check-in, not only when you need something.\nComment \"REFERRAL\" and I'll DM you the list of 10 adjacent-professional types I'd start with.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment REFERRAL\".",
    ctaLine: "Comment REFERRAL and I'll DM you the list of adjacent-professional types.",
  },

  // ---------- Public Speaking & Presentation Skills (4) ----------
  {
    weekOffset: 4, topicTag: "Public Speaking & Presentation Skills",
    title: "3 Levels of Presentation Preparation",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: building slides the night before.\nLevel 2: building slides, then practicing the talk once out loud.\nLevel 3: knowing the ONE sentence you want the audience to remember before you build a single slide.\nMost presentations fail at Level 1 and get blamed on nerves instead of prep.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I find that one sentence before building slides.",
  },
  {
    weekOffset: 5, topicTag: "Public Speaking & Presentation Skills",
    title: "Myth Bust: More Slides Doesn't Mean a Clearer Presentation",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A 40-slide deck feels thorough. It usually means the core message never got sharpened.\nEvery slide you add is one more thing competing for the same short attention span.\nCut until only what's essential to the one core point survives -- that's harder than adding, and it's what actually lands.",
    bodyRed: "React with visible overwhelm to a dense slide deck.", bodyGreen: "On-screen text: \"cutting is harder than adding, and it works better\".",
    ctaLine: "Follow for how I cut a deck down to its real essentials.",
  },
  {
    weekOffset: 6, topicTag: "Public Speaking & Presentation Skills",
    title: "The 3 Questions I Ask Before Any Talk to Know What the Audience Actually Wants",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What do they already believe about this topic that's wrong?\" Tells you exactly what needs correcting.\n\"What decision are they trying to make after this talk?\" Tells you what the content needs to actually support.\n\"What would make them tell a colleague about this talk afterward?\" Tells you what to make the single memorable point.\nComment \"TALK\" and I'll send you the full pre-talk prep worksheet.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment TALK\".",
    ctaLine: "Comment TALK and I'll send you the full pre-talk prep worksheet.",
  },
  {
    weekOffset: 7, topicTag: "Public Speaking & Presentation Skills",
    title: "If I Were Coaching a Founder Terrified of Their First Big Stage",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "If a founder came to me with a big talk booked and real stage fear, here's the exact plan.\nWeek 1: write the one sentence the talk exists to land, and nothing else until that's locked.\nWeek 2: build the talk backward from that sentence -- every section either supports it or gets cut.\nWeek 3: practice out loud, recorded, at least 5 times -- not silently reading slides.\nWeek 4: deliver it once to a small, honest test audience and revise based on where they actually lost interest.\nThe fear rarely goes away completely. Preparation makes it manageable.\nComment \"STAGE\" and I'll DM you the full 4-week prep plan.",
    bodyRed: "Draw the 4-week timeline on the whiteboard.", bodyGreen: "On-screen text per week. Comment prompt: \"Comment STAGE\".",
    ctaLine: "Comment STAGE and I'll DM you the full 4-week prep plan.",
  },

  // ---------- Legal & Contract Fundamentals (4) ----------
  {
    weekOffset: 8, topicTag: "Legal & Contract Fundamentals",
    title: "3 Levels of Contract Protection for a Service Business",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: a verbal agreement and good faith.\nLevel 2: a written contract, but generic and copy-pasted.\nLevel 3: a contract with a clear scope boundary, a defined change-order process, and a kill clause both sides understand.\nMost disputes trace back to skipping straight from Level 1 to a Level 2 contract that doesn't actually protect anyone.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for the 3 clauses I never skip in a contract.",
  },
  {
    weekOffset: 9, topicTag: "Legal & Contract Fundamentals",
    title: "Myth Bust: A Longer Contract Doesn't Mean More Protection",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A 20-page contract feels thorough. What actually protects you is a handful of specific, enforceable clauses.\nScope boundary, payment terms, IP ownership, and an exit clause do more real work than pages of generic legal filler.\nComplexity for its own sake often only makes disputes harder to resolve, not easier.",
    bodyRed: "React with visible skepticism to a thick contract stack.", bodyGreen: "On-screen text: \"a few specific clauses beat 20 generic pages\".",
    ctaLine: "Follow for the specific clauses that actually matter.",
  },
  {
    weekOffset: 10, topicTag: "Legal & Contract Fundamentals",
    title: "The 3 Questions I Ask Before Signing Any Partnership Agreement",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What exactly happens if either side wants out?\" If the answer is unclear, that's the first thing to fix.\n\"Who owns the work product if this ends early?\" Get this in writing before it's ever a live question.\n\"What's the specific process if we disagree on scope?\" A defined process beats hoping it never comes up.\nComment \"PARTNERSHIP\" and I'll send you the full pre-sign checklist.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment PARTNERSHIP\".",
    ctaLine: "Comment PARTNERSHIP and I'll send you the full pre-sign checklist.",
  },
  {
    weekOffset: 11, topicTag: "Legal & Contract Fundamentals",
    title: "The Framework for Structuring a Scope-Boundary Clause That Actually Prevents Disputes",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most scope disputes happen because the contract described the work vaguely, not because anyone acted in bad faith.\nPart 1: list the specific, named deliverables -- not \"consulting services,\" but exactly what gets handed over.\nPart 2: name what triggers a change order explicitly -- any request outside the named deliverables, in writing, before work starts.\nPart 3: define the change-order process itself -- who approves it, how pricing gets adjusted, how long it takes.\nThis single clause, done properly, has prevented more disputes for me than any amount of goodwill.\nComment \"SCOPE\" and I'll DM you the exact clause language I use.",
    bodyRed: "Draw the 3-part clause structure on the whiteboard.", bodyGreen: "On-screen text per part. Comment prompt: \"Comment SCOPE\".",
    ctaLine: "Comment SCOPE and I'll DM you the exact clause language.",
  },

  // ---------- Fundraising & Investor Relations (4) ----------
  {
    weekOffset: 12, topicTag: "Fundraising & Investor Relations",
    title: "3 Levels of Investor Readiness",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: a pitch deck and a belief in the idea.\nLevel 2: real traction numbers behind the deck.\nLevel 3: a clear, specific answer for exactly what the raised capital unlocks that couldn't happen otherwise.\nMost founders pitch at Level 1 or 2 and wonder why investors hesitate.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I help founders build the Level 3 answer.",
  },
  {
    weekOffset: 13, topicTag: "Fundraising & Investor Relations",
    title: "Myth Bust: Raising More Money Doesn't Mean You're Winning",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A big raise gets celebrated publicly. It's not the milestone that predicts whether the business survives.\nWhat actually predicts it: whether the capital gets deployed against a specific, tested plan, not only held as a cushion.\nI've watched well-funded businesses fail and lean ones outlast them, because the money wasn't the actual constraint.",
    bodyRed: "React with visible skepticism to a \"raised $X million\" headline.", bodyGreen: "On-screen text: \"raising isn't winning -- deploying it well is\".",
    ctaLine: "Follow for more of what actually predicts survival past a raise.",
  },
  {
    weekOffset: 14, topicTag: "Fundraising & Investor Relations",
    title: "The 3 Questions Investors Actually Care About, Underneath the Pitch Deck",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Can this team actually execute, not only plan?\" Track record answers this better than slides do.\n\"Is the market big enough to matter if this works?\" A great idea in a small market still isn't investable.\n\"What specifically does this capital unlock that current capital can't?\" Vague answers here lose the room fast.\nComment \"INVESTOR\" and I'll send you how I help founders answer all 3 with real specificity.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment INVESTOR\".",
    ctaLine: "Comment INVESTOR and I'll send you how to answer all 3 with specificity.",
  },
  {
    weekOffset: 15, topicTag: "Fundraising & Investor Relations",
    title: "If I Were Prepping a Founder for Their First Investor Pitch in 30 Days",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "If a founder had 30 days before their first real investor pitch, here's exactly how I'd use them.\nDays 1-7: nail the one-sentence version of the business, tested on 5 people who've never heard of it.\nDays 8-15: build the traction section first, before the rest of the deck -- if the numbers aren't compelling, the rest doesn't matter yet.\nDays 16-23: pressure-test the deck with 3 tough, specific questions from someone who'll actually push back.\nDays 24-30: rehearse the pitch out loud, recorded, until the answer to \"what does this capital unlock\" comes out instantly, not haltingly.\nComment \"PITCH30\" and I'll DM you the full 30-day prep plan.",
    bodyRed: "Draw the 30-day timeline on the whiteboard.", bodyGreen: "On-screen text per phase. Comment prompt: \"Comment PITCH30\".",
    ctaLine: "Comment PITCH30 and I'll DM you the full 30-day prep plan.",
  },

  // ---------- Operations & Process Systems (4) ----------
  {
    weekOffset: 16, topicTag: "Operations & Process Systems",
    title: "3 Levels of Operational Maturity",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: everything lives in the founder's head.\nLevel 2: some things are written down, inconsistently.\nLevel 3: every repeatable task has a documented process someone else could follow without you.\nGrowth stalls hardest right at the gap between Level 1 and Level 3, not before it.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I document a process for the first time.",
  },
  {
    weekOffset: 17, topicTag: "Operations & Process Systems",
    title: "Myth Bust: More Tools Doesn't Mean Better Operations",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Adding another software tool feels like progress. Often it only adds another system nobody fully adopts.\nWhat actually fixes operations: one clear, written process for the task that's currently breaking, used consistently.\nI've watched teams buy 3 new tools to fix a problem that one documented checklist would have solved for free.",
    bodyRed: "React with visible skepticism to a cluttered tool dashboard.", bodyGreen: "On-screen text: \"one used process beats three unused tools\".",
    ctaLine: "Follow for how I decide when a tool is actually needed.",
  },
  {
    weekOffset: 18, topicTag: "Operations & Process Systems",
    title: "The 3 Questions I Ask to Find Which Process to Document First",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What breaks most often when you're not the one doing it?\" That's the first candidate.\n\"What takes the longest to explain to someone new?\" A long explanation means it needs to be written down, not repeated.\n\"What would stop the business cold if you disappeared for a week?\" Document that one before anything else.\nComment \"PROCESS\" and I'll send you the template I use to document a process for the first time.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment PROCESS\".",
    ctaLine: "Comment PROCESS and I'll send you the documentation template.",
  },
  {
    weekOffset: 19, topicTag: "Operations & Process Systems",
    title: "The Framework for Turning a Founder's Head-Knowledge Into a Real System",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Every founder has processes that only exist in their head. Here's how I extract and systematize them.\nStep 1: record the founder actually doing the task, narrating out loud, instead of asking them to write it from memory -- memory always skips steps.\nStep 2: turn that recording into a written checklist, then have someone unfamiliar with the task try to follow it exactly.\nStep 3: fix every place they got stuck -- that's where the real gaps were, not where the founder assumed they'd be.\nStep 4: assign an owner for the process, so it's someone's job to keep it updated, not a document that goes stale in a month.\nComment \"SYSTEM\" and I'll DM you the exact extraction process for Step 1.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment SYSTEM\".",
    ctaLine: "Comment SYSTEM and I'll DM you the exact extraction process.",
  },

  // ---------- Competitive Strategy & Positioning (4) ----------
  {
    weekOffset: 20, topicTag: "Competitive Strategy & Positioning",
    title: "3 Levels of Competitive Awareness",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: not knowing who your real competitors are.\nLevel 2: knowing their names but not their actual strategy.\nLevel 3: knowing exactly where they're structurally weak, and building your positioning around that gap.\nMost founders operate at Level 1 or 2 and wonder why their positioning feels generic.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I map a competitor's structural weakness.",
  },
  {
    weekOffset: 21, topicTag: "Competitive Strategy & Positioning",
    title: "Myth Bust: You Don't Need to Compete on Everything a Bigger Rival Does",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Trying to match a bigger competitor feature-for-feature is a losing game with someone else's resources.\nThe better move: find the one dimension they're structurally weak on, and own it completely.\nSmaller, faster, more personal, more specific -- pick the real advantage and build the whole positioning around it.",
    bodyRed: "React with visible skepticism to a feature-comparison chart.", bodyGreen: "On-screen text: \"own one real weakness, don't match everything\".",
    ctaLine: "Follow for how I find that one structural weakness to own.",
  },
  {
    weekOffset: 22, topicTag: "Competitive Strategy & Positioning",
    title: "The 3 Questions I Ask to Find a Competitor's Real Weakness",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What do their own customers complain about most in public reviews?\" That's a real, verifiable gap, not a guess.\n\"What can't they do because of how they're structured?\" A big firm can't move as fast as a solo operator, structurally.\n\"What would it cost them to fix that gap?\" If it's expensive or slow for them to close, that's where to position.\nComment \"WEAKNESS\" and I'll send you how I research this for a client.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment WEAKNESS\".",
    ctaLine: "Comment WEAKNESS and I'll send you how I research this for a client.",
  },
  {
    weekOffset: 23, topicTag: "Competitive Strategy & Positioning",
    title: "The Framework for Repositioning When a Bigger Competitor Enters Your Market",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "A bigger competitor entering your market feels like a threat. It's often a positioning opportunity, handled right.\nStep 1: don't panic-match their pricing or feature set -- reacting to their move puts them in control of the game.\nStep 2: find what they can't credibly offer given their scale -- personal service, faster turnaround, narrower specialization.\nStep 3: rebuild your messaging explicitly around that gap, without naming them directly.\nStep 4: use their entry as proof the market is real -- \"even [category] is paying attention now\" is a credibility signal you can borrow.\nComment \"REPOSITION\" and I'll DM you how I helped a client do exactly this.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment REPOSITION\".",
    ctaLine: "Comment REPOSITION and I'll DM you a real example of this.",
  },

  // ---------- Mental Resilience & Performance (4) ----------
  {
    weekOffset: 24, topicTag: "Mental Resilience & Performance",
    title: "3 Levels of Handling Business Setbacks",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: treating every setback as evidence the whole thing is failing.\nLevel 2: separating the setback from your identity, but still reacting emotionally in the moment.\nLevel 3: having a standard process you run every time -- what happened, what it actually means, what's the next specific step.\nLevel 3 isn't about feeling less. It's about not letting the feeling drive the decision.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for the exact process I run after a setback.",
  },
  {
    weekOffset: 25, topicTag: "Mental Resilience & Performance",
    title: "Myth Bust: Working Through Burnout Doesn't Make You Tougher",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Pushing through exhaustion gets treated as discipline. Past a point, it only produces worse decisions, slower.\nThe founders who've actually built for a decade schedule recovery deliberately, the same way they schedule client work.\nRest isn't the reward after the work. It's part of what makes the work sustainable at all.",
    bodyRed: "React with visible skepticism to a \"hustle through it\" clip.", bodyGreen: "On-screen text: \"recovery is part of the system, not a reward\".",
    ctaLine: "Follow for how I actually schedule recovery into a working week.",
  },
  {
    weekOffset: 26, topicTag: "Mental Resilience & Performance",
    title: "The 3 Questions I Ask Myself Before Reacting to a Bad Client Call",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Is this actually as bad as it feels right now, or does it only feel that way in the moment?\" Usually the second.\n\"What's the one specific fact I know, versus the story I'm telling myself about it?\" Separating those changes the whole reaction.\n\"What would I tell a client in this exact situation?\" Usually calmer advice than what I'd default to for myself.\nComment \"REACT\" and I'll send you the full process I run after a hard call.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment REACT\".",
    ctaLine: "Comment REACT and I'll send you the full process I run.",
  },
  {
    weekOffset: 27, topicTag: "Mental Resilience & Performance",
    title: "The Framework I Use to Decide If a Bad Week Means Something Needs to Change",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "One bad week doesn't mean the business or the plan is broken. But some weeks are a real signal. Here's how I tell the difference.\nQuestion 1: is this the first time this specific problem has shown up, or the third? A pattern is a signal. A one-off usually isn't.\nQuestion 2: is the setback about execution, or about the underlying plan itself? Execution problems get fixed. Plan problems get revisited.\nQuestion 3: would I give the same advice to a client in this exact situation, or am I holding myself to a different standard?\nRunning these 3 questions turns a bad week from a spiral into an actual decision.\nComment \"BADWEEK\" and I'll DM you the full worksheet I use for this.",
    bodyRed: "Draw the 3-question framework on the whiteboard.", bodyGreen: "On-screen text per question. Comment prompt: \"Comment BADWEEK\".",
    ctaLine: "Comment BADWEEK and I'll DM you the full worksheet.",
  },
];
