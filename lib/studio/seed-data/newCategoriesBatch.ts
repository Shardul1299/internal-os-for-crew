// Content expansion Phase 1: 7 new sub-categories (topics/niches) beyond the
// original 9 brand sub-niches + core niche, 4 scripts each = 28 scripts.
// Deliberately small and contained -- the first of several planned phases
// (per explicit instruction to phase this work rather than generate
// everything in one pass). Continues the weekly cadence right after the
// segments batch (200 items at SEGMENTS_START_WEEK=195, weekOffset 0-199 ->
// occupies absolute weeks 195-394), starting at week 395.

import type { BatchScript } from "./octBatch";
import { BASE_DATE } from "./octBatch";

export { BASE_DATE };
export const NEW_CATEGORIES_START_WEEK = 395;
export const NEW_CATEGORIES_BATCH_TAG = "new_categories_28_batch_v1";

export type NewCategoryScript = BatchScript & { topicTag: string };

const T = "follow" as const;
const M = "engagement" as const;
const B = "manychat" as const;

export const NEW_CATEGORIES_BATCH: NewCategoryScript[] = [
  // ---------- Negotiation & Deal-Making (4) ----------
  {
    weekOffset: 0, topicTag: "Negotiation & Deal-Making",
    title: "3 Levels of Negotiation Preparation",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: walking in with a number in mind and hoping it goes well.\nLevel 2: knowing your walk-away point before the call starts.\nLevel 3: knowing the other side's likely walk-away point too, and structuring the offer around it.\nMost people negotiate at Level 1 and call the result \"how negotiations always go.\"",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I research the other side's walk-away point.",
  },
  {
    weekOffset: 1, topicTag: "Negotiation & Deal-Making",
    title: "The Anchoring Mistake That Costs Founders the Most in Deal-Making",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Voiceover Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Letting the other side name a number first feels polite. It's the single most expensive habit in deal-making.\nWhoever speaks first sets the anchor the entire negotiation gets pulled toward, whether or not that number was fair.\nThe fix: state your number first, with the reasoning attached, every time -- let their counter happen from your anchor outward.\nComment \"ANCHOR\" and I'll send you how I introduce a first number without it feeling aggressive.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.", bodyGreen: "On-screen text: \"first number sets the frame\". Comment prompt: \"Comment ANCHOR\".",
    ctaLine: "Comment ANCHOR and I'll send you how to introduce a first number.",
  },
  {
    weekOffset: 2, topicTag: "Negotiation & Deal-Making",
    title: "Do vs Don't: Handling Silence After You State a Price",
    pillar: "authority", contentType: "educational", angle: "Do vs Don't (Right vs Wrong)", format: "Setting Changes",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Don't: fill the silence after naming your price with a discount or a justification nobody asked for.\nDo: say the number, then stop talking -- let the other side respond first, even if it takes a while.\nDon't: read silence as rejection. Do: read it as them doing real math, which is a good sign.\nHolding silence, uncomfortable as it feels, wins more negotiations than any clever follow-up line.",
    bodyRed: "Switch location per Do/Don't pair.", bodyGreen: "On-screen text: \"DON'T\" / \"DO\".",
    ctaLine: "Follow for more of what actually wins a negotiation.",
  },
  {
    weekOffset: 3, topicTag: "Negotiation & Deal-Making",
    title: "The Framework I Use to Decide What to Trade Instead of Dropping Price",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "When a client pushes on price, dropping it isn't the only move -- and it's usually the worst one.\nFirst: identify what costs you little but is worth a lot to them -- a faster timeline, an extra deliverable, priority access.\nSecond: offer that trade instead of a discount, framed as a genuine alternative, not a consolation prize.\nThird: if they still want a lower price specifically, trade scope down to match it -- never drop price and keep scope the same.\nThis single habit has protected more margin than any pricing strategy I've built.\nComment \"TRADE\" and I'll DM you the list of low-cost, high-value trades I keep ready for exactly this moment.",
    bodyRed: "Draw the 3-step trade framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment TRADE\".",
    ctaLine: "Comment TRADE and I'll DM you the list of trades I keep ready.",
  },

  // ---------- Leadership & Team Management (4) ----------
  {
    weekOffset: 4, topicTag: "Leadership & Team Management",
    title: "3 Levels of Delegation",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: \"do exactly what I would do.\" Micromanagement wearing a delegation costume.\nLevel 2: \"here's the goal, figure out the how.\" Real delegation, still needs oversight.\nLevel 3: \"here's the goal, I trust your judgment, tell me if you need me.\" Actual leverage.\nMost founders think they're at Level 3 and are actually still running Level 1.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I actually get to Level 3 with a new hire.",
  },
  {
    weekOffset: 5, topicTag: "Leadership & Team Management",
    title: "Myth Bust: More Meetings Doesn't Mean Better Alignment",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Teams that feel misaligned usually respond by adding meetings. It rarely fixes the actual problem.\nMisalignment almost always traces back to one unclear decision, not a lack of talking.\nFind the specific unclear decision and resolve it directly -- that fixes more than another recurring sync ever will.",
    bodyRed: "React with visible skepticism to a packed calendar.", bodyGreen: "On-screen text: \"find the unclear decision, not more meetings\".",
    ctaLine: "Follow for how I find the actual unclear decision on a team.",
  },
  {
    weekOffset: 6, topicTag: "Leadership & Team Management",
    title: "The Exact 2-Sentence Structure I Use for Direct Feedback",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Green Screen Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Most feedback fails because it's vague, delayed, or buried in compliments.\nSentence 1: the specific behavior and its specific impact, no cushioning -- \"when X happened, Y was the result.\"\nSentence 2: the specific change you want next time, stated plainly.\nGiven within 24 hours, while the context is still fresh, this lands dramatically better than a vague note days later.\nComment \"FEEDBACK\" and I'll send you 3 real examples of this structure in use.",
    bodyRed: "Green screen with a simple 2-sentence template graphic.", bodyGreen: "Comment prompt: \"Comment FEEDBACK\".",
    ctaLine: "Comment FEEDBACK and I'll send you 3 real examples.",
  },
  {
    weekOffset: 7, topicTag: "Leadership & Team Management",
    title: "If I Were Hired to Fix a Team That Stopped Trusting Leadership",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "If a founder hired me to rebuild trust with a team that had quietly stopped believing leadership, here's the plan.\nDays 1-5: individual conversations, same 3 questions, to find the specific broken promise or unclear decision at the root -- there's almost always one specific thing, not a vague \"culture problem.\"\nDays 6-12: fix that one thing publicly and specifically, naming what changed and why.\nDays 13-21: follow through visibly on the next 2-3 commitments made, on time, without exception -- trust rebuilds through repetition, not a single grand gesture.\nComment \"TRUST\" and I'll DM you the 3 diagnostic questions we start with.",
    bodyRed: "Draw the timeline on the whiteboard.", bodyGreen: "On-screen text per phase. Comment prompt: \"Comment TRUST\".",
    ctaLine: "Comment TRUST and I'll DM you the 3 diagnostic questions.",
  },

  // ---------- Client Relationship Management (4) ----------
  {
    weekOffset: 8, topicTag: "Client Relationship Management",
    title: "3 Levels of Client Trust",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: reliable -- you show up, you do what you said. Table stakes.\nLevel 2: transparent -- you tell a client bad news before they find it themselves.\nLevel 3: predictively useful -- you flag a problem they hadn't thought to ask about yet.\nLevel 3 is what turns a client into a referral source, not Level 1.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I build Level 3 into every client relationship.",
  },
  {
    weekOffset: 9, topicTag: "Client Relationship Management",
    title: "Do vs Don't: Delivering Bad News to a Client",
    pillar: "authority", contentType: "educational", angle: "Do vs Don't (Right vs Wrong)", format: "Setting Changes",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Don't: wait until the next scheduled check-in to mention a problem. Do: tell them the moment you know, unprompted.\nDon't: deliver the news without a plan. Do: pair every piece of bad news with your recommended next step.\nDon't: soften it so much the real severity gets lost. Do: be plainly honest about the impact.\nComment \"BADNEWS\" and I'll send you the exact message structure I use.",
    bodyRed: "Switch location per Do/Don't pair.", bodyGreen: "Comment prompt: \"Comment BADNEWS\".",
    ctaLine: "Comment BADNEWS and I'll send you the exact message structure.",
  },
  {
    weekOffset: 10, topicTag: "Client Relationship Management",
    title: "3 Signs a Client Relationship Is About to Sour, Before They Say Anything",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Multitasking Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "low",
    bodyBlack: "Sign 1: replies get shorter and slower, with no explanation.\nSign 2: they stop asking questions about the work -- engaged clients always have more, not fewer.\nSign 3: a scheduled call gets rescheduled once, then again.\nCatch these early and ask directly what's changed -- waiting for them to bring it up usually means it's already too late.",
    bodyRed: "Deliver while doing a real task in frame.", bodyGreen: "On-screen icon per sign.",
    ctaLine: "Follow for the check-in message I send when I see this.",
  },
  {
    weekOffset: 11, topicTag: "Client Relationship Management",
    title: "The Framework for Turning a One-Off Client Into a Repeat One",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most consultants let a great engagement quietly end, and wonder why the client doesn't come back.\nStep 1: at the midpoint, not the end, ask what a second phase of work might look like -- planting the idea early, not pitching it late.\nStep 2: document the specific, measurable result by the end, so a second engagement has real proof behind it, not only a good feeling.\nStep 3: send a structured wrap-up that names 2-3 specific next opportunities, not a vague \"let me know if you need anything.\"\nComment \"REPEAT\" and I'll DM you the exact wrap-up template.",
    bodyRed: "Draw the 3-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment REPEAT\".",
    ctaLine: "Comment REPEAT and I'll DM you the exact wrap-up template.",
  },

  // ---------- Personal Branding for Consultants (4) ----------
  {
    weekOffset: 12, topicTag: "Personal Branding for Consultants",
    title: "3 Levels of Personal Brand Clarity",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: \"I help businesses grow.\" Describes everyone, means nothing.\nLevel 2: \"I help founders enter new markets.\" Clearer, still broad.\nLevel 3: \"I help consulting-adjacent founders price and structure their first market-entry engagement.\" Narrow enough to be memorable.\nMost personal brands stall at Level 1 for years.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I sharpened mine from Level 1 to Level 3.",
  },
  {
    weekOffset: 13, topicTag: "Personal Branding for Consultants",
    title: "Myth Bust: You Don't Need to Post Every Day to Build a Personal Brand",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Daily posting gets treated as the price of entry for a personal brand.\nWhat actually compounds is consistency at a sustainable cadence, plus specificity every time -- 2 sharp posts a week beats 7 generic ones.\nThe founders who burn out on daily posting usually quit entirely within a few months. The ones who pace it keep showing up for years.",
    bodyRed: "React with visible skepticism to a \"post daily\" claim.", bodyGreen: "On-screen text: \"sustainable cadence beats daily burnout\".",
    ctaLine: "Follow for how I pace my own posting cadence.",
  },
  {
    weekOffset: 14, topicTag: "Personal Branding for Consultants",
    title: "The 3 Questions That Reveal If Your Personal Brand Is Actually Differentiated",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Could a competitor say the exact same bio line about themselves?\" If yes, it's not differentiated yet.\n\"Do people describe your work back to you in your own specific language?\" If not, it hasn't landed yet.\n\"Is there one story or result only you can tell?\" If you can't name it fast, that's the gap to close first.\nComment \"BRAND\" and I'll DM you the audit worksheet behind these 3 questions.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment BRAND\".",
    ctaLine: "Comment BRAND and I'll DM you the full audit worksheet.",
  },
  {
    weekOffset: 15, topicTag: "Personal Branding for Consultants",
    title: "If I Were Rebuilding My Personal Brand From Zero Followers Today",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "If I had zero followers and had to rebuild today, here's exactly what I'd do, in order.\nWeek 1: write the one-sentence positioning line and test it on 5 real people -- does it land in one read, or need explaining?\nWeek 2: build one real case study, even unpaid, documented properly.\nWeek 3: post that case study everywhere, framed as a specific result, not a humble brag.\nWeek 4: pick ONE platform and commit to a sustainable weekly cadence, not a daily one.\nComment \"REBUILD\" and I'll DM you the full 4-week plan as a checklist.",
    bodyRed: "Draw the 4-week timeline on the whiteboard.", bodyGreen: "On-screen text per week. Comment prompt: \"Comment REBUILD\".",
    ctaLine: "Comment REBUILD and I'll DM you the full 4-week plan.",
  },

  // ---------- Sales & Closing Technique (4) ----------
  {
    weekOffset: 16, topicTag: "Sales & Closing Technique",
    title: "3 Levels of Closing a Deal",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: \"so, want to move forward?\" Vague, easy to say no to.\nLevel 2: a clear proposal with a deadline attached.\nLevel 3: a proposal, a deadline, AND a specific next step already scheduled before the call ends.\nMost missed closes happen because the ask stayed at Level 1.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I structure a Level 3 close.",
  },
  {
    weekOffset: 17, topicTag: "Sales & Closing Technique",
    title: "\"I Need to Think About It\" -- Watch How I Actually Respond",
    pillar: "authority", contentType: "authority", angle: "Educational Tip / Hack", format: "Talking Back & Forth",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Client: \"This all sounds good, I need some time to think about it.\"\nMe: \"Totally fair -- what specifically are you weighing? If it's the price, the timeline, or the fit, I'd rather solve that now than have you think about it alone.\"\nClient: \"...honestly, I'm not sure if now is the right time.\"\nMe: \"That's useful to know -- what would make it the right time, and is that something we could plan toward together?\"\nNaming the real hesitation usually surfaces it faster than letting \"I'll think about it\" go unchallenged.\nComment \"THINK\" and I'll send you the exact follow-up question I ask.",
    bodyRed: "Two characters, same actor, alternating positions.", bodyGreen: "Lower-third labels: \"CLIENT\" / \"ME\". Comment prompt: \"Comment THINK\".",
    ctaLine: "Comment THINK and I'll send you the exact follow-up question.",
  },
  {
    weekOffset: 18, topicTag: "Sales & Closing Technique",
    title: "3 Signs a Prospect Is Ready to Buy, Before They Say So",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Multitasking Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "low",
    bodyBlack: "Sign 1: they start asking implementation questions, not only \"does this work\" questions.\nSign 2: they mention a specific internal timeline unprompted.\nSign 3: they ask who else needs to be involved in the decision.\nAll three together mean it's time to ask for the close directly, not wait for them to bring it up.",
    bodyRed: "Deliver while doing a real task in frame.", bodyGreen: "On-screen icon per sign.",
    ctaLine: "Follow for the exact closing question I ask when I see this.",
  },
  {
    weekOffset: 19, topicTag: "Sales & Closing Technique",
    title: "The Framework I Use to Structure Any Sales Call",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Every sales call I run follows the same 4-part structure, no exceptions.\nPart 1: diagnose -- ask more than I talk, until I understand the real problem, not the stated one.\nPart 2: reflect it back -- restate their problem in my own words, so they confirm I actually understood it.\nPart 3: propose -- one specific recommendation, not three vague options, tied directly to what they confirmed.\nPart 4: close -- name the exact next step and a deadline, before the call ends, not in a follow-up email.\nComment \"CALL\" and I'll DM you the full call structure as a checklist.",
    bodyRed: "Draw the 4-part structure on the whiteboard.", bodyGreen: "On-screen text per part. Comment prompt: \"Comment CALL\".",
    ctaLine: "Comment CALL and I'll DM you the full call structure checklist.",
  },

  // ---------- Time Management & Productivity Systems (4) ----------
  {
    weekOffset: 20, topicTag: "Time Management & Productivity Systems",
    title: "3 Levels of Calendar Discipline",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: a calendar that fills up with whatever gets booked.\nLevel 2: blocked time for deep work, but it gets bumped for anything urgent.\nLevel 3: blocked time protected like a client meeting -- nothing bumps it without a real reason.\nMost founders think they're at Level 2 and are actually still at Level 1.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I protect Level 3 blocks on my own calendar.",
  },
  {
    weekOffset: 21, topicTag: "Time Management & Productivity Systems",
    title: "Myth Bust: Busy Isn't the Same as Productive",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A packed calendar feels productive. It often only means everyone else's priorities filled your week.\nThe actual measure: did the one metric that matters this week move, or did you only stay busy around it?\nSome of my most productive weeks looked the emptiest on the calendar.",
    bodyRed: "React with visible skepticism to a packed calendar.", bodyGreen: "On-screen text: \"busy ≠ productive\".",
    ctaLine: "Follow for how I measure a week beyond how full it looks.",
  },
  {
    weekOffset: 22, topicTag: "Time Management & Productivity Systems",
    title: "The 3 Questions I Ask Every Sunday to Plan the Week",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What's the ONE thing that would make this week a win, even if nothing else got done?\" Everything else is secondary to that.\n\"What's already on the calendar that doesn't serve that one thing?\" Those get cut or moved first.\n\"What am I avoiding that I already know I need to do?\" That goes first, not last.\nComment \"WEEKLY\" and I'll send you the full weekly planning template.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment WEEKLY\".",
    ctaLine: "Comment WEEKLY and I'll send you the full planning template.",
  },
  {
    weekOffset: 23, topicTag: "Time Management & Productivity Systems",
    title: "If I Were Hired to Fix a Founder's Time Management With Only a Calendar Export",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "If a founder handed me nothing but their last month's calendar export, here's exactly what I'd do with it.\nStep 1: tag every block as either \"only I can do this\" or \"someone else could do this,\" honestly, no exceptions.\nStep 2: total the hours in the second category -- that number is usually shocking the first time it's actually counted.\nStep 3: build a delegation plan for the top 3 time-eating categories, starting with the easiest to hand off.\nStep 4: rebuild the calendar with protected blocks for the \"only I can do this\" work, scheduled first, not squeezed in around everything else.\nComment \"CALENDAR\" and I'll DM you the exact tagging system I use for Step 1.",
    bodyRed: "Draw the 4-step process on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment CALENDAR\".",
    ctaLine: "Comment CALENDAR and I'll DM you the exact tagging system.",
  },

  // ---------- Data-Driven Decision Making (4) ----------
  {
    weekOffset: 24, topicTag: "Data-Driven Decision Making",
    title: "3 Levels of Using Data in a Business Decision",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: deciding on gut feel, then finding a stat afterward to justify it.\nLevel 2: checking the data first, but only the metric that's easiest to pull.\nLevel 3: defining the exact metric that would actually answer the question, before looking at anything.\nMost \"data-driven\" decisions are simply Level 1 wearing a spreadsheet.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I define the right metric before I look at data.",
  },
  {
    weekOffset: 25, topicTag: "Data-Driven Decision Making",
    title: "Myth Bust: More Data Doesn't Mean a Better Decision",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Pulling more dashboards feels rigorous. Past a point it only delays a decision that was already clear.\nThe real skill is knowing which single number actually resolves the question, and stopping there.\nI've watched founders drown a simple decision in 15 metrics when 1 would have answered it.",
    bodyRed: "React with visible skepticism to a cluttered dashboard.", bodyGreen: "On-screen text: \"1 right metric beats 15 dashboards\".",
    ctaLine: "Follow for how I find the 1 metric that actually matters.",
  },
  {
    weekOffset: 26, topicTag: "Data-Driven Decision Making",
    title: "The 3 Questions I Ask Before Trusting Any Metric",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What decision would actually change based on this number?\" If none, it's not worth tracking closely.\n\"Is this number a leading or lagging signal?\" Lagging numbers confirm what already happened -- leading ones let you act in time.\n\"What's the smallest sample size that would still be trustworthy here?\" A trend from 3 data points isn't a trend yet.\nComment \"METRIC\" and I'll DM you the full metric-trust checklist.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment METRIC\".",
    ctaLine: "Comment METRIC and I'll DM you the full metric-trust checklist.",
  },
  {
    weekOffset: 27, topicTag: "Data-Driven Decision Making",
    title: "The Framework for Deciding Which Metric Actually Deserves a Weekly Dashboard",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Every metric competing for a spot on a weekly dashboard gets scored on 3 things, not only \"is it interesting.\"\nFirst: does it actually predict something -- moving this week or moving next month's outcome?\nSecond: can someone on the team act on it within the week, or is it purely informational?\nThird: would a real change in this number actually get noticed and discussed, or would it only sit there?\nAnything that fails 2 of 3 gets cut from the weekly view and checked monthly instead -- dashboards drown decisions when they're too long to actually read.\nComment \"DASHBOARD\" and I'll DM you the exact 3-question scorecard.",
    bodyRed: "Draw the 3-question scorecard on the whiteboard.", bodyGreen: "On-screen text per question. Comment prompt: \"Comment DASHBOARD\".",
    ctaLine: "Comment DASHBOARD and I'll DM you the exact 3-question scorecard.",
  },
];
