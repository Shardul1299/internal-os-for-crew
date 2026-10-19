// Content expansion Phase 3: 7 more new sub-categories, 4 scripts each = 28
// scripts. Same contained pattern as Phase 1 & 2
// (lib/seed-data/newCategoriesBatch.ts, newCategoriesBatch2.ts). Continues
// the weekly cadence right after Phase 2 (28 items at
// NEW_CATEGORIES_2_START_WEEK=423, weekOffset 0-27 -> occupies weeks
// 423-450), starting at week 451.

import type { BatchScript } from "./octBatch";
import { BASE_DATE } from "./octBatch";

export { BASE_DATE };
export const NEW_CATEGORIES_3_START_WEEK = 451;
export const NEW_CATEGORIES_3_BATCH_TAG = "new_categories_3_28_batch_v1";

export type NewCategoryScript = BatchScript & { topicTag: string };

const T = "follow" as const;
const M = "engagement" as const;
const B = "manychat" as const;

export const NEW_CATEGORIES_3_BATCH: NewCategoryScript[] = [
  // ---------- Pricing Strategy & Value-Based Fees (4) ----------
  {
    weekOffset: 0, topicTag: "Pricing Strategy & Value-Based Fees",
    title: "3 Levels of Pricing Your Consulting Work",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: charging by the hour and capping your own income at your calendar.\nLevel 2: flat project fees, but still priced off your time estimate.\nLevel 3: pricing off the value the outcome creates for the client, with your time out of the conversation entirely.\nMost consultants stay at Level 1 for years and wonder why growth means working more, not earning more.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I priced my first value-based project.",
  },
  {
    weekOffset: 1, topicTag: "Pricing Strategy & Value-Based Fees",
    title: "Myth Bust: Lower Prices Don't Win You Better Clients",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Undercutting feels like the safe way to win a deal. It usually attracts the clients who fight hardest over scope later.\nA price that matches the value you deliver filters for clients who respect the work and pay on time.\nThe cheapest bid rarely becomes the easiest client -- often it's the opposite.",
    bodyRed: "React with visible skepticism to a rock-bottom quote.", bodyGreen: "On-screen text: \"cheap price, expensive client\".",
    ctaLine: "Follow for how I set a price that filters for good clients.",
  },
  {
    weekOffset: 2, topicTag: "Pricing Strategy & Value-Based Fees",
    title: "The 3 Questions I Ask Before Naming a Price",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What's this outcome actually worth to their business, in real numbers?\" Anchor the price there, not on your hours.\n\"What's the cost of them doing nothing about this problem?\" That gap is often bigger than the fee itself.\n\"Would I be comfortable naming this number out loud, twice, without flinching?\" If not, the number isn't right yet.\nComment \"PRICE\" and I'll send you the worksheet I use to land on a number.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment PRICE\".",
    ctaLine: "Comment PRICE and I'll send you the pricing worksheet.",
  },
  {
    weekOffset: 3, topicTag: "Pricing Strategy & Value-Based Fees",
    title: "The Framework for Moving From Hourly to Value-Based Pricing",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most consultants know hourly billing caps them. Few know the actual steps to leave it behind.\nStep 1: pick one service you deliver a predictable outcome for, and price that outcome first -- not your whole practice at once.\nStep 2: name the specific, measurable result the client gets, so the value is provable, not vague.\nStep 3: quote a flat fee tied to that result on your next 3 deals, even if it feels uncomfortable the first time.\nStep 4: track what you actually earned per hour worked on each -- the number usually settles the debate for good.\nComment \"VALUE\" and I'll DM you the exact script I use to introduce this to an existing hourly client.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment VALUE\".",
    ctaLine: "Comment VALUE and I'll DM you the transition script.",
  },

  // ---------- Market Entry Risk Assessment (4) ----------
  {
    weekOffset: 4, topicTag: "Market Entry Risk Assessment",
    title: "3 Levels of Assessing a New Market Before You Enter",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: reading market-size reports and assuming demand follows the numbers.\nLevel 2: talking to a handful of potential customers about the idea.\nLevel 3: running a small, real test -- an actual offer, to real prospects, before committing serious capital.\nMost failed market entries skip straight from Level 1 to a full launch.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I design a Level 3 test on a small budget.",
  },
  {
    weekOffset: 5, topicTag: "Market Entry Risk Assessment",
    title: "Myth Bust: A Big Market Size Doesn't Mean an Easy Entry",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A huge addressable market looks like an obvious green light. It says nothing about how hard it is to actually reach.\nDistribution difficulty, incumbent loyalty, and regulatory friction kill more entries than market size ever protects against.\nThe real question isn't how big the market is. It's how reachable it is for a business your size, right now.",
    bodyRed: "React with visible skepticism to a huge market-size slide.", bodyGreen: "On-screen text: \"big market, hard entry -- check both\".",
    ctaLine: "Follow for the checklist I run before calling a market winnable.",
  },
  {
    weekOffset: 6, topicTag: "Market Entry Risk Assessment",
    title: "The 3 Questions I Ask to Risk-Test a New Market",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What's the cheapest, fastest way to get a real yes or no from this market?\" Design the test around that, not around certainty.\n\"What would have to be true for this market to actually reject us?\" Naming the failure case in advance sharpens the test.\n\"How much am I willing to lose to get this answer?\" Set that number before you spend a dollar of it.\nComment \"RISK\" and I'll send you the market-entry risk checklist I use with clients.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment RISK\".",
    ctaLine: "Comment RISK and I'll send you the risk checklist.",
  },
  {
    weekOffset: 7, topicTag: "Market Entry Risk Assessment",
    title: "The Framework I Use to Decide If a New Market Is Worth the Risk",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Every new market decision is a risk decision dressed up as an opportunity decision. Here's how I score it.\nFactor 1: reachability -- can this business realistically get in front of buyers there with its current resources?\nFactor 2: reversibility -- if the test fails, how quickly and cheaply can we exit without lasting damage?\nFactor 3: signal quality -- will the small test actually tell us something real, or only confirm what we already hoped?\nScore each factor honestly, and the go/no-go decision usually becomes obvious on its own.\nComment \"ENTRY\" and I'll DM you the full scoring template.",
    bodyRed: "Draw the 3-factor scoring framework on the whiteboard.", bodyGreen: "On-screen text per factor. Comment prompt: \"Comment ENTRY\".",
    ctaLine: "Comment ENTRY and I'll DM you the scoring template.",
  },

  // ---------- Cross-Cultural Business Communication (4) ----------
  {
    weekOffset: 8, topicTag: "Cross-Cultural Business Communication",
    title: "3 Levels of Communicating Across a New Market's Culture",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: translating your pitch word for word and assuming it lands the same way.\nLevel 2: adjusting tone and formality, but keeping the same core structure.\nLevel 3: rebuilding the pitch around what actually builds trust in that specific culture -- which is sometimes a completely different structure.\nMost cross-border pitches fail at Level 1 without anyone realizing that's the reason.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I rebuild a pitch for a new market's culture.",
  },
  {
    weekOffset: 9, topicTag: "Cross-Cultural Business Communication",
    title: "Myth Bust: Being Direct Isn't Universally the Best Business Communication Style",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Directness gets taught as the gold standard in a lot of business training. In plenty of markets, it reads as disrespectful before it reads as efficient.\nWhat actually builds trust varies by culture -- sometimes it's directness, sometimes it's relationship-building before any business talk at all.\nMatching the local communication norm isn't a compromise. It's the actual skill.",
    bodyRed: "React with visible skepticism to a bluntly-worded pitch.", bodyGreen: "On-screen text: \"match the norm, don't override it\".",
    ctaLine: "Follow for how I research a market's communication norms first.",
  },
  {
    weekOffset: 10, topicTag: "Cross-Cultural Business Communication",
    title: "The 3 Questions I Ask Before Pitching in an Unfamiliar Market",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Is relationship-building expected before business talk here, or is that seen as wasting time?\" Get this backward and nothing else lands.\n\"How is disagreement usually expressed in this culture?\" Missing an indirect \"no\" costs deals.\n\"Who actually needs to be in the room for a decision to get made?\" Decision structure varies more than most people assume.\nComment \"CULTURE\" and I'll send you the research checklist I use before entering a new market.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment CULTURE\".",
    ctaLine: "Comment CULTURE and I'll send you the research checklist.",
  },
  {
    weekOffset: 11, topicTag: "Cross-Cultural Business Communication",
    title: "If I Were Coaching a Founder Entering Their First Foreign Market",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "If a founder came to me about to pitch in a market they'd never sold into before, here's exactly what I'd walk them through.\nStep 1: find someone who's actually done business there and ask them directly what nearly went wrong for them.\nStep 2: rewrite the pitch structure, not only the language, around that market's actual decision-making norms.\nStep 3: rehearse the pitch with that local contact and ask them to flag anything that reads wrong before it's ever in front of a real buyer.\nStep 4: go into the first real meeting expecting to learn and adjust, not to close -- the first meeting is usually the research.\nComment \"CROSSBORDER\" and I'll DM you the full market-entry communication checklist.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment CROSSBORDER\".",
    ctaLine: "Comment CROSSBORDER and I'll DM you the full checklist.",
  },

  // ---------- Financial Modeling & Unit Economics (4) ----------
  {
    weekOffset: 12, topicTag: "Financial Modeling & Unit Economics",
    title: "3 Levels of Understanding Your Own Unit Economics",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: knowing your total revenue and total costs, and calling that enough.\nLevel 2: knowing your margin per product line.\nLevel 3: knowing your profit per single customer, after fully-loaded acquisition and delivery cost.\nMost founders manage the business at Level 1 and can't explain why growth isn't turning into cash.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I calculate true per-customer profit.",
  },
  {
    weekOffset: 13, topicTag: "Financial Modeling & Unit Economics",
    title: "Myth Bust: Revenue Growth Doesn't Mean the Business Is Getting Healthier",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A rising revenue chart looks like clear proof things are working. It says nothing about whether each new customer is actually profitable.\nIf acquisition cost is rising faster than customer value, more revenue can mean losing more money, faster.\nThe chart that actually matters is profit per customer over time, not the top-line number everyone shares.",
    bodyRed: "React with visible skepticism to a rising-revenue-only chart.", bodyGreen: "On-screen text: \"revenue up, unit economics down -- watch this\".",
    ctaLine: "Follow for the unit-economics chart I actually track.",
  },
  {
    weekOffset: 14, topicTag: "Financial Modeling & Unit Economics",
    title: "The 3 Questions I Ask to Sanity-Check a Financial Model",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What's the single assumption this whole model falls apart without?\" Every model has one -- find it first.\n\"Does this match what actually happened last quarter, or only what we hope happens next quarter?\" Anchor to real data.\n\"What happens to this model if the growth rate is half of what I assumed?\" If it breaks completely, the plan is too fragile.\nComment \"MODEL\" and I'll send you the sanity-check template I run every model through.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment MODEL\".",
    ctaLine: "Comment MODEL and I'll send you the sanity-check template.",
  },
  {
    weekOffset: 15, topicTag: "Financial Modeling & Unit Economics",
    title: "The Framework for Building a Unit Economics Model From Scratch",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most founders never build a real unit economics model until an investor asks for one. Here's how to build it properly the first time.\nStep 1: calculate fully-loaded acquisition cost per customer -- every dollar spent to win them, not only ad spend.\nStep 2: calculate delivery cost per customer -- what it actually costs to fulfill, support, and retain them.\nStep 3: calculate expected customer lifetime value based on real retention data, not an optimistic guess.\nStep 4: subtract steps 1 and 2 from step 3 -- that single number tells you more about the business than any revenue chart.\nComment \"UNITECON\" and I'll DM you the spreadsheet template I use with clients.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment UNITECON\".",
    ctaLine: "Comment UNITECON and I'll DM you the spreadsheet template.",
  },

  // ---------- Hiring & Team Building for Founders (4) ----------
  {
    weekOffset: 16, topicTag: "Hiring & Team Building for Founders",
    title: "3 Levels of Making Your First Hire",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: hiring the first friend or family member who's available.\nLevel 2: hiring based on a resume and a good interview feeling.\nLevel 3: hiring based on a real paid test of the actual work, before the offer.\nMost first hires happen at Level 1 or 2 and the founder is surprised months later when the fit isn't there.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I structure a paid work test before hiring.",
  },
  {
    weekOffset: 17, topicTag: "Hiring & Team Building for Founders",
    title: "Myth Bust: A Great Interview Doesn't Predict a Great Hire",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A confident, articulate interview feels like proof someone can do the job. Interview skill and job skill are genuinely different things.\nWhat actually predicts performance: a real sample of the work, done under conditions close to the actual job.\nI've hired great interviewers who couldn't do the work, and quiet interviewers who turned out to be the strongest hires.",
    bodyRed: "React with visible skepticism to a polished interview clip.", bodyGreen: "On-screen text: \"interview skill isn't job skill\".",
    ctaLine: "Follow for how I test actual job skill before hiring.",
  },
  {
    weekOffset: 18, topicTag: "Hiring & Team Building for Founders",
    title: "The 3 Questions I Ask Before Making Any Hire",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Can I clearly describe what this role is accountable for in one sentence?\" If not, the role isn't defined enough to hire for yet.\n\"Have I seen this person actually do the work, not only talk about it?\" A paid test beats a reference check.\n\"Am I hiring because I need this role, or because I'm avoiding doing the work myself?\" Those are different reasons, and only one is a good one.\nComment \"HIRE\" and I'll send you the pre-hire checklist I use with founders.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment HIRE\".",
    ctaLine: "Comment HIRE and I'll send you the pre-hire checklist.",
  },
  {
    weekOffset: 19, topicTag: "Hiring & Team Building for Founders",
    title: "If I Were Coaching a Founder Making Their First 3 Hires",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "If a founder came to me about to make their first 3 hires, here's exactly how I'd sequence it.\nHire 1: whatever task is eating the most of your own time that isn't your actual strength -- free yourself first.\nHire 2: whatever role directly touches revenue, so the hire pays for itself quickly and provably.\nHire 3: whoever fills the gap that's now most visible now that hires 1 and 2 are in place -- don't guess this one in advance.\nEach hire gets a paid work test before the offer, no exceptions, even for someone you already know.\nComment \"FIRST3\" and I'll DM you the full hiring sequence plan.",
    bodyRed: "Draw the 3-hire sequence on the whiteboard.", bodyGreen: "On-screen text per hire. Comment prompt: \"Comment FIRST3\".",
    ctaLine: "Comment FIRST3 and I'll DM you the full hiring sequence.",
  },

  // ---------- Crisis Management & Pivoting (4) ----------
  {
    weekOffset: 20, topicTag: "Crisis Management & Pivoting",
    title: "3 Levels of Responding to a Business Crisis",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: reacting immediately to whatever feels most urgent in the moment.\nLevel 2: pausing to assess, but assessing alone under pressure.\nLevel 3: running a set process -- what's the real damage, what's reversible, who needs to know, in that order.\nMost founders operate at Level 1 during a crisis and make the situation worse trying to fix it fast.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for the exact process I run during a crisis.",
  },
  {
    weekOffset: 21, topicTag: "Crisis Management & Pivoting",
    title: "Myth Bust: A Pivot Isn't a Sign the Original Idea Was Wrong",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A pivot gets treated publicly as admitting failure. Most successful businesses pivoted at least once on the way there.\nWhat actually matters is whether the pivot is based on real market signal, not panic or boredom with the original plan.\nThe founders who never adjust the plan when the evidence says to usually fail slower, not better.",
    bodyRed: "React with visible skepticism to a \"never give up on the original idea\" clip.", bodyGreen: "On-screen text: \"most winners pivoted at least once\".",
    ctaLine: "Follow for how I tell a real pivot signal from panic.",
  },
  {
    weekOffset: 22, topicTag: "Crisis Management & Pivoting",
    title: "The 3 Questions I Ask to Decide If a Pivot Is Actually Needed",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Is the core problem I'm solving still real, or has the market actually moved on?\" Answer this before touching anything else.\n\"Have I actually tested the current approach properly, or am I giving up early?\" Under-testing looks like a pivot signal but isn't one.\n\"What specifically would I do differently, and why would that work better?\" A pivot without a specific answer here is only avoidance.\nComment \"PIVOT\" and I'll send you the decision framework I use with clients.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment PIVOT\".",
    ctaLine: "Comment PIVOT and I'll send you the decision framework.",
  },
  {
    weekOffset: 23, topicTag: "Crisis Management & Pivoting",
    title: "The Framework I Use to Run a Business Through Its First Real Crisis",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Every business eventually hits a real crisis -- a lost client, a cash crunch, a failed launch. Here's the process I run every time.\nStep 1: assess the actual, factual damage in the first 24 hours -- no decisions yet, only information.\nStep 2: identify what's reversible versus what's already done -- this splits the problem into what needs action now versus what needs acceptance.\nStep 3: communicate proactively with whoever's affected, before they hear it elsewhere -- silence always makes it worse.\nStep 4: make one decision at a time, in order of what's most time-sensitive, instead of trying to solve everything simultaneously.\nComment \"CRISIS\" and I'll DM you the full crisis-response checklist.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment CRISIS\".",
    ctaLine: "Comment CRISIS and I'll DM you the full checklist.",
  },

  // ---------- Brand Positioning & Messaging Strategy (4) ----------
  {
    weekOffset: 24, topicTag: "Brand Positioning & Messaging Strategy",
    title: "3 Levels of Business Messaging Clarity",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: a tagline that sounds impressive but explains nothing.\nLevel 2: a description that lists what you do.\nLevel 3: one sentence that makes a stranger instantly understand who it's for and why it matters to them.\nMost businesses sit at Level 1 or 2 and wonder why people don't immediately get what they do.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I write a Level 3 one-sentence pitch.",
  },
  {
    weekOffset: 25, topicTag: "Brand Positioning & Messaging Strategy",
    title: "Myth Bust: Clever Branding Doesn't Fix Unclear Messaging",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A clever name or a polished logo feels like the branding win. If a stranger still can't say what you do in one sentence, none of it is working yet.\nClarity beats cleverness every time in the first 3 seconds someone encounters your business.\nGet the one-sentence explanation right first. The polish matters far less than people assume.",
    bodyRed: "React with visible skepticism to a clever-but-unclear tagline.", bodyGreen: "On-screen text: \"clarity beats clever, every time\".",
    ctaLine: "Follow for how I test if messaging is actually clear.",
  },
  {
    weekOffset: 26, topicTag: "Brand Positioning & Messaging Strategy",
    title: "The 3 Questions I Ask to Test If Your Messaging Actually Works",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Could a stranger repeat back what you do after hearing it once?\" If not, it's not clear enough yet.\n\"Does it name who it's for, specifically, or does it try to speak to everyone?\" Specific beats broad, every time.\n\"Does it say what changes for the customer, or only what you technically deliver?\" The outcome is what actually sells.\nComment \"MESSAGE\" and I'll send you the messaging test I run with clients.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment MESSAGE\".",
    ctaLine: "Comment MESSAGE and I'll send you the messaging test.",
  },
  {
    weekOffset: 27, topicTag: "Brand Positioning & Messaging Strategy",
    title: "The Framework for Building a One-Sentence Positioning Statement",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most businesses never write down their actual positioning -- it lives loosely in the founder's head and comes out differently every time.\nPart 1: name the specific customer, not a broad category -- \"first-time exporters,\" not \"businesses.\"\nPart 2: name the specific outcome they get, in their language, not yours.\nPart 3: name what makes this true only for you, not for every competitor who could say the same sentence.\nPart 4: say the whole sentence out loud to 5 people outside the business and watch whether they can repeat it back.\nComment \"POSITION\" and I'll DM you the exact template I use to build this sentence.",
    bodyRed: "Draw the 4-part framework on the whiteboard.", bodyGreen: "On-screen text per part. Comment prompt: \"Comment POSITION\".",
    ctaLine: "Comment POSITION and I'll DM you the positioning template.",
  },
];
