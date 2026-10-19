// Content expansion Phase 5: 7 more new sub-categories, 4 scripts each = 28
// scripts. Same contained pattern as Phases 1-4. Continues the weekly
// cadence right after Phase 4 (28 items at NEW_CATEGORIES_4_START_WEEK=479,
// weekOffset 0-27 -> occupies weeks 479-506), starting at week 507.

import type { BatchScript } from "./octBatch";
import { BASE_DATE } from "./octBatch";

export { BASE_DATE };
export const NEW_CATEGORIES_5_START_WEEK = 507;
export const NEW_CATEGORIES_5_BATCH_TAG = "new_categories_5_28_batch_v1";

export type NewCategoryScript = BatchScript & { topicTag: string };

const T = "follow" as const;
const M = "engagement" as const;
const B = "manychat" as const;

export const NEW_CATEGORIES_5_BATCH: NewCategoryScript[] = [
  // ---------- Go-to-Market Strategy Design (4) ----------
  {
    weekOffset: 0, topicTag: "Go-to-Market Strategy Design",
    title: "3 Levels of Launching a New Offer",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: building it, then announcing it once and hoping people notice.\nLevel 2: a launch week with a few posts and an email.\nLevel 3: a sequenced plan that warms up the audience for weeks before the offer ever goes live.\nMost launches fail quietly at Level 1 or 2, long before the offer itself gets a fair test.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I structure a Level 3 launch sequence.",
  },
  {
    weekOffset: 1, topicTag: "Go-to-Market Strategy Design",
    title: "Myth Bust: A Bigger Launch Day Doesn't Mean a Better Launch",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A flood of activity on launch day looks impressive. What actually predicts results is the warm-up done in the weeks before it.\nBy the time the offer opens, the people ready to buy should already know exactly what it is and why they need it.\nLaunch day reveals the work that was or wasn't done beforehand -- it rarely creates demand on its own.",
    bodyRed: "React with visible skepticism to a \"big launch day\" clip.", bodyGreen: "On-screen text: \"the warm-up decides the launch, not launch day\".",
    ctaLine: "Follow for the warm-up sequence I run before every launch.",
  },
  {
    weekOffset: 2, topicTag: "Go-to-Market Strategy Design",
    title: "The 3 Questions I Ask Before Planning a Go-to-Market Sequence",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Who already knows they need this, before I say a word?\" That's the first audience to reach, not the coldest one.\n\"What's the one objection that kills this deal most often?\" Handle it in the sequence before it comes up live.\n\"What does someone need to believe before they'll buy?\" Build the warm-up around proving exactly that.\nComment \"LAUNCH\" and I'll send you the full go-to-market checklist.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment LAUNCH\".",
    ctaLine: "Comment LAUNCH and I'll send you the go-to-market checklist.",
  },
  {
    weekOffset: 3, topicTag: "Go-to-Market Strategy Design",
    title: "The Framework for Designing a Go-to-Market Plan From Scratch",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "A real go-to-market plan is built weeks before launch, not the week of it. Here's the structure I use.\nStep 1: name the single audience segment most ready to buy first, and build the whole plan around reaching them.\nStep 2: map the 3 biggest objections and address each one publicly before the offer opens.\nStep 3: build anticipation with a specific countdown -- what's coming, when, and why it matters to them.\nStep 4: open with a clear, time-bound reason to act now, not a soft \"available whenever.\"\nComment \"GTM\" and I'll DM you the full go-to-market template.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment GTM\".",
    ctaLine: "Comment GTM and I'll DM you the go-to-market template.",
  },

  // ---------- Content Marketing for B2B (4) ----------
  {
    weekOffset: 4, topicTag: "Content Marketing for B2B",
    title: "3 Levels of B2B Content",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: posting generic industry tips anyone could write.\nLevel 2: sharing your own opinions on trends in the space.\nLevel 3: publishing the specific process or framework you actually use with clients, in enough detail to be useful on its own.\nMost B2B content stays at Level 1 or 2, where it blends into everyone else's feed.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I turn a client process into Level 3 content.",
  },
  {
    weekOffset: 5, topicTag: "Content Marketing for B2B",
    title: "Myth Bust: Posting More Often Isn't What Grows a B2B Audience",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Daily posting feels like the growth lever. For a B2B audience, one sharp, specific piece a week usually outperforms five generic ones.\nThe decision-makers you're trying to reach have limited attention -- specificity earns it, frequency alone doesn't.\nFewer, better posts consistently beat a high volume of forgettable ones.",
    bodyRed: "React with visible skepticism to a \"post daily no matter what\" clip.", bodyGreen: "On-screen text: \"specific and rare beats frequent and generic\".",
    ctaLine: "Follow for how I decide what's worth posting.",
  },
  {
    weekOffset: 6, topicTag: "Content Marketing for B2B",
    title: "The 3 Questions I Ask Before Publishing Any B2B Content",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Would a specific decision-maker in my niche actually save this?\" That's a sharper bar than \"is this true.\"\n\"Does this prove I've actually done the work, or does it only sound smart?\" Proof beats opinion for B2B trust.\n\"Could a competitor have written this exact post?\" If yes, it's not specific enough yet.\nComment \"B2B\" and I'll send you my content-planning checklist.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment B2B\".",
    ctaLine: "Comment B2B and I'll send you the content-planning checklist.",
  },
  {
    weekOffset: 7, topicTag: "Content Marketing for B2B",
    title: "The Framework for Turning Client Work Into a B2B Content Engine",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "The best B2B content usually already exists inside your client work -- it hasn't been written down yet. Here's how I extract it.\nStep 1: after every project, write down the one non-obvious decision that made the biggest difference.\nStep 2: turn that decision into a short, standalone post explaining the reasoning, not only the result.\nStep 3: anonymize any client-specific detail while keeping the actual mechanics intact.\nStep 4: batch a month of these at once so publishing never depends on remembering to write.\nComment \"CONTENT\" and I'll DM you the extraction template.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment CONTENT\".",
    ctaLine: "Comment CONTENT and I'll DM you the extraction template.",
  },

  // ---------- Referral & Word-of-Mouth Systems (4) ----------
  {
    weekOffset: 8, topicTag: "Referral & Word-of-Mouth Systems",
    title: "3 Levels of Getting Referrals",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: hoping happy clients mention you to someone eventually.\nLevel 2: asking for a referral once, right after a project ends.\nLevel 3: a repeatable ask built into a specific moment -- right after a client sees the result land.\nMost referrals that do happen at Level 1 or 2 are luck. Level 3 makes them a system.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for the exact moment I ask for a referral.",
  },
  {
    weekOffset: 9, topicTag: "Referral & Word-of-Mouth Systems",
    title: "Myth Bust: Doing Great Work Doesn't Automatically Generate Referrals",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Great work feels like it should sell itself. Most happy clients simply don't think to refer you unless it's made easy and obvious.\nA specific ask, at the right moment, turns satisfaction into an actual introduction.\nWord of mouth needs a nudge more often than it needs a reason.",
    bodyRed: "React with visible skepticism to a \"good work markets itself\" clip.", bodyGreen: "On-screen text: \"satisfaction needs a nudge to become a referral\".",
    ctaLine: "Follow for how I make the ask feel easy, not awkward.",
  },
  {
    weekOffset: 10, topicTag: "Referral & Word-of-Mouth Systems",
    title: "The 3 Questions I Ask to Build a Referral System, Not Just Hope for Referrals",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What's the specific moment a client is most excited about the result?\" That's the moment to ask, not three months later.\n\"Have I made it easy to know exactly who to refer me to?\" Vague asks get vague results.\n\"Am I following up on referrals I've already received?\" Untracked referrals quietly disappear.\nComment \"REFER\" and I'll send you the referral-ask script I actually use.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment REFER\".",
    ctaLine: "Comment REFER and I'll send you the referral-ask script.",
  },
  {
    weekOffset: 11, topicTag: "Referral & Word-of-Mouth Systems",
    title: "The Framework for Building a Referral System That Runs Without You Remembering",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Referrals that depend on you remembering to ask eventually stop happening. Here's the system I built instead.\nStep 1: identify the exact milestone in every project that marks peak client satisfaction.\nStep 2: build the referral ask directly into that milestone as a standard step, not an afterthought.\nStep 3: make it specific -- ask who they know that fits a named profile, not a generic \"know anyone.\"\nStep 4: track every referral that comes in and close the loop by thanking the person who sent it.\nComment \"REFSYSTEM\" and I'll DM you the full system template.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment REFSYSTEM\".",
    ctaLine: "Comment REFSYSTEM and I'll DM you the system template.",
  },

  // ---------- Regulatory & Compliance Navigation (4) ----------
  {
    weekOffset: 12, topicTag: "Regulatory & Compliance Navigation",
    title: "3 Levels of Handling Regulatory Requirements in a New Market",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: launching first and figuring out compliance if someone raises it.\nLevel 2: a quick search of the basic requirements.\nLevel 3: a local expert review before launch, covering licensing, taxes, and any sector-specific rules.\nMost costly compliance mistakes trace back to skipping straight from Level 1 to launch.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I find a reliable local compliance expert.",
  },
  {
    weekOffset: 13, topicTag: "Regulatory & Compliance Navigation",
    title: "Myth Bust: The Rules in Your Home Market Don't Automatically Apply Elsewhere",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Assuming the same rules apply in a new market feels reasonable until it costs real money in fines or delays.\nLicensing, labor law, and tax treatment can differ completely between markets that otherwise look similar on the surface.\nA short local compliance review before launch is far cheaper than fixing a violation after the fact.",
    bodyRed: "React with visible skepticism to an \"assume it's the same everywhere\" clip.", bodyGreen: "On-screen text: \"different market, different rules -- check first\".",
    ctaLine: "Follow for the compliance checklist I run per market.",
  },
  {
    weekOffset: 14, topicTag: "Regulatory & Compliance Navigation",
    title: "The 3 Questions I Ask Before Entering a Regulated Market",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What licenses or registrations are actually required to operate here legally?\" Get this answer from a local expert, not a forum post.\n\"What's the realistic timeline to get compliant, not the optimistic one?\" Compliance delays derail more launches than product issues do.\n\"What's the cost of getting this wrong versus the cost of doing it right upfront?\" That comparison usually settles the decision fast.\nComment \"COMPLIANCE\" and I'll send you the market-entry compliance checklist.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment COMPLIANCE\".",
    ctaLine: "Comment COMPLIANCE and I'll send you the checklist.",
  },
  {
    weekOffset: 15, topicTag: "Regulatory & Compliance Navigation",
    title: "If I Were Guiding a Founder Through Compliance in a Brand-New Market",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "If a founder came to me about to enter a new, regulated market, here's exactly how I'd guide the process.\nStep 1: hire a local expert for a paid consultation before writing a single line of the go-to-market plan.\nStep 2: list every license, registration, and tax obligation specific to that market and sector.\nStep 3: build the realistic compliance timeline into the launch plan, not as an afterthought bolted on later.\nStep 4: budget for compliance costs upfront, so they never become the reason a launch stalls mid-process.\nComment \"COMPLY\" and I'll DM you the full pre-entry compliance plan.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment COMPLY\".",
    ctaLine: "Comment COMPLY and I'll DM you the full compliance plan.",
  },

  // ---------- Remote Team Culture & Communication (4) ----------
  {
    weekOffset: 16, topicTag: "Remote Team Culture & Communication",
    title: "3 Levels of Running a Remote Team",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: scattered messages across whatever tool feels convenient in the moment.\nLevel 2: a weekly meeting to sync up on everything.\nLevel 3: clear async documentation for anything that doesn't need a live conversation, and meetings reserved for what actually does.\nMost remote teams stay stuck at Level 1 or 2 and wonder why alignment feels constantly behind.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I decide what's async versus a live meeting.",
  },
  {
    weekOffset: 17, topicTag: "Remote Team Culture & Communication",
    title: "Myth Bust: More Meetings Don't Build a Stronger Remote Culture",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Adding meetings feels like the fix for a disconnected remote team. Past a point, it only fragments everyone's focused work time further.\nWhat actually builds culture remotely: clear written expectations, visible recognition, and a few well-run touchpoints, not constant calls.\nCulture is built in how work actually gets done day to day, not in how many calls are on the calendar.",
    bodyRed: "React with visible skepticism to an overcrowded meeting calendar.", bodyGreen: "On-screen text: \"more meetings isn't more culture\".",
    ctaLine: "Follow for how I built culture with fewer meetings, not more.",
  },
  {
    weekOffset: 18, topicTag: "Remote Team Culture & Communication",
    title: "The 3 Questions I Ask to Fix a Struggling Remote Team's Communication",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Does everyone know where to find the answer without asking someone directly?\" If not, documentation is the gap, not communication effort.\n\"Is feedback happening in the open, or only in private messages?\" Private-only feedback quietly erodes trust over time.\n\"When did the team last celebrate a specific win together?\" Recognition remotely needs to be deliberate -- it doesn't happen by accident.\nComment \"REMOTE\" and I'll send you the remote-culture checklist I use.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment REMOTE\".",
    ctaLine: "Comment REMOTE and I'll send you the remote-culture checklist.",
  },
  {
    weekOffset: 19, topicTag: "Remote Team Culture & Communication",
    title: "The Framework for Building Remote Team Culture on Purpose",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Remote culture doesn't happen by accident the way office culture sometimes does. It has to be built deliberately.\nStep 1: write down decisions and reasoning in a shared, searchable place, so context never lives only in one person's head.\nStep 2: separate async updates from live meetings -- reserve calls for actual discussion and decisions.\nStep 3: build a specific, recurring moment for recognizing wins publicly, not only privately.\nStep 4: run a quarterly pulse check on how connected the team actually feels, and act on what it shows.\nComment \"CULTURE\" and I'll DM you the full remote-culture playbook.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment CULTURE\".",
    ctaLine: "Comment CULTURE and I'll DM you the full playbook.",
  },

  // ---------- Strategic Partnerships & Joint Ventures (4) ----------
  {
    weekOffset: 20, topicTag: "Strategic Partnerships & Joint Ventures",
    title: "3 Levels of Business Partnerships",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: a handshake agreement based on good chemistry.\nLevel 2: a loose informal understanding of who does what.\nLevel 3: a written agreement covering roles, revenue split, and an exit plan, signed before any real work starts.\nMost partnership disputes trace back to skipping Level 3 because the relationship felt too good to need it.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for the 3 things I always put in writing first.",
  },
  {
    weekOffset: 21, topicTag: "Strategic Partnerships & Joint Ventures",
    title: "Myth Bust: A Great Personal Relationship Isn't Enough to Skip a Partnership Agreement",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Trusting a friend feels like reason enough to skip the paperwork. The partnerships that damage friendships most are usually the ones without clear terms.\nA written agreement isn't a sign of distrust -- it's what protects the relationship when the business gets stressful.\nThe best time to write it is when everyone still likes each other, not after a disagreement starts.",
    bodyRed: "React with visible skepticism to a \"we don't need a contract, we're friends\" clip.", bodyGreen: "On-screen text: \"the agreement protects the friendship\".",
    ctaLine: "Follow for how I bring up the agreement without it feeling awkward.",
  },
  {
    weekOffset: 22, topicTag: "Strategic Partnerships & Joint Ventures",
    title: "The 3 Questions I Ask Before Entering Any Strategic Partnership",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What does each side actually bring that the other can't easily get elsewhere?\" If the answer is unclear, the partnership isn't necessary yet.\n\"How exactly does revenue or value get split, in writing?\" Vague splits become disputes the moment real money is involved.\n\"What's the process if one side wants out?\" Define this before you need it, not during a disagreement.\nComment \"PARTNER\" and I'll send you the partnership evaluation checklist.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment PARTNER\".",
    ctaLine: "Comment PARTNER and I'll send you the evaluation checklist.",
  },
  {
    weekOffset: 23, topicTag: "Strategic Partnerships & Joint Ventures",
    title: "The Framework for Structuring a Joint Venture That Survives Real Pressure",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most joint ventures collapse under pressure that a stronger structure would have prevented. Here's how I build one to last.\nStep 1: name each side's specific, non-overlapping contribution in writing, so accountability is never ambiguous.\nStep 2: define the revenue or value split with an actual formula, not a rough verbal understanding.\nStep 3: build in a scheduled review point every quarter to renegotiate if the original terms stop reflecting reality.\nStep 4: agree on the exit process upfront -- what happens to shared assets, clients, and IP if it ends.\nComment \"JV\" and I'll DM you the joint venture structuring template.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment JV\".",
    ctaLine: "Comment JV and I'll DM you the structuring template.",
  },

  // ---------- Managing Scope Creep (4) ----------
  {
    weekOffset: 24, topicTag: "Managing Scope Creep",
    title: "3 Levels of Handling Scope Creep",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: saying yes to every extra request to keep the client happy.\nLevel 2: noticing scope has crept, but not addressing it until the project is over budget.\nLevel 3: flagging the first out-of-scope request in real time, before it becomes a pattern.\nMost projects go over budget because Level 1 quietly continues for weeks before anyone names it.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I flag scope creep without souring the relationship.",
  },
  {
    weekOffset: 25, topicTag: "Managing Scope Creep",
    title: "Myth Bust: Saying Yes to Every Extra Request Doesn't Make You a Better Partner",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Saying yes to everything feels generous in the moment. It usually trains the client to keep asking, and it quietly erodes your margin project after project.\nA clear, respectful \"that's outside scope, here's what it would take to add it\" protects the relationship more than silent overdelivery does.\nBoundaries stated calmly read as professionalism, not as difficulty.",
    bodyRed: "React with visible skepticism to a \"always say yes to keep clients happy\" clip.", bodyGreen: "On-screen text: \"boundaries read as professional, not difficult\".",
    ctaLine: "Follow for the exact line I use to flag an out-of-scope ask.",
  },
  {
    weekOffset: 26, topicTag: "Managing Scope Creep",
    title: "The 3 Questions I Ask When a Request Might Be Outside Scope",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Was this named specifically in the original agreement?\" If not, it's a new request, not an obligation.\n\"Is this a one-time exception or the start of a pattern?\" A single small favor is different from a recurring expectation.\n\"Have I actually said anything, or have I only been absorbing it silently?\" Silence is usually what lets scope creep continue.\nComment \"SCOPE\" and I'll send you the change-order template I use.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment SCOPE\".",
    ctaLine: "Comment SCOPE and I'll send you the change-order template.",
  },
  {
    weekOffset: 27, topicTag: "Managing Scope Creep",
    title: "The Framework for Handling Scope Creep Without Damaging the Client Relationship",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Scope creep isn't usually bad faith from the client -- it's a boundary that was never clearly drawn. Here's how I hold it.\nStep 1: define exactly what's included in the original scope, in writing, before work begins.\nStep 2: flag the first out-of-scope request immediately, calmly, and without apology.\nStep 3: offer a clear path to add it -- a change order with a specific price and timeline impact.\nStep 4: track every accepted change order so the final invoice reflects the real scope delivered, not the original quote.\nComment \"CREEP\" and I'll DM you the change-order process I use.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment CREEP\".",
    ctaLine: "Comment CREEP and I'll DM you the change-order process.",
  },
];
