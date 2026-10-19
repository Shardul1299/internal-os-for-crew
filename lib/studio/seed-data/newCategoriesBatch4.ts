// Content expansion Phase 4: 7 more new sub-categories, 4 scripts each = 28
// scripts. Same contained pattern as Phases 1-3. Continues the weekly
// cadence right after Phase 3 (28 items at NEW_CATEGORIES_3_START_WEEK=451,
// weekOffset 0-27 -> occupies weeks 451-478), starting at week 479.

import type { BatchScript } from "./octBatch";
import { BASE_DATE } from "./octBatch";

export { BASE_DATE };
export const NEW_CATEGORIES_4_START_WEEK = 479;
export const NEW_CATEGORIES_4_BATCH_TAG = "new_categories_4_28_batch_v1";

export type NewCategoryScript = BatchScript & { topicTag: string };

const T = "follow" as const;
const M = "engagement" as const;
const B = "manychat" as const;

export const NEW_CATEGORIES_4_BATCH: NewCategoryScript[] = [
  // ---------- Customer Onboarding & Retention Systems (4) ----------
  {
    weekOffset: 0, topicTag: "Customer Onboarding & Retention Systems",
    title: "3 Levels of Client Onboarding",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: send the invoice, then go quiet until the work starts.\nLevel 2: a welcome email with next steps attached.\nLevel 3: a structured first-week sequence that sets expectations, gathers what you need, and gets a small win on the board fast.\nMost churn traces back to a rough first two weeks, not a rough delivery months later.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for the exact first-week sequence I run with every client.",
  },
  {
    weekOffset: 1, topicTag: "Customer Onboarding & Retention Systems",
    title: "Myth Bust: A Great Deliverable Doesn't Guarantee a Client Stays",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Great work feels like the whole game. Clients rarely leave over quality alone -- they leave over feeling forgotten between deliverables.\nA short, consistent check-in cadence does more for retention than another round of polish on the work itself.\nThe relationship is what gets renewed, not the deliverable.",
    bodyRed: "React with visible skepticism to a \"just do great work and they'll stay\" clip.", bodyGreen: "On-screen text: \"the relationship renews, not the deliverable\".",
    ctaLine: "Follow for the check-in cadence I use to keep clients engaged.",
  },
  {
    weekOffset: 2, topicTag: "Customer Onboarding & Retention Systems",
    title: "The 3 Questions I Ask to Diagnose Why a Client Might Churn",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"When did they last respond quickly to me?\" A slowdown is the earliest churn signal, before anyone says a word.\n\"Do they still know what result they're getting from this?\" Confusion about the value is a bigger risk than the value itself.\n\"Who on their side actually championed bringing me on?\" If that person left or went quiet, the relationship is exposed.\nComment \"RETAIN\" and I'll send you the full churn-risk checklist.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment RETAIN\".",
    ctaLine: "Comment RETAIN and I'll send you the churn-risk checklist.",
  },
  {
    weekOffset: 3, topicTag: "Customer Onboarding & Retention Systems",
    title: "The Framework for Building a Retention System That Doesn't Rely on Memory",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Retention that depends on you remembering to check in eventually fails. Here's how I built a system instead.\nStep 1: set a fixed check-in cadence for every client tier, on the calendar, not on memory.\nStep 2: define one measurable win to surface at each check-in, so it's never a status update, always a proof point.\nStep 3: build a simple early-warning tracker -- response time, engagement, and champion status -- reviewed monthly.\nStep 4: flag any client showing two or more warning signs for a direct, honest conversation before the relationship quietly ends.\nComment \"RETENTION\" and I'll DM you the tracker template.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment RETENTION\".",
    ctaLine: "Comment RETENTION and I'll DM you the tracker template.",
  },

  // ---------- Email & Outreach Copywriting (4) ----------
  {
    weekOffset: 4, topicTag: "Email & Outreach Copywriting",
    title: "3 Levels of Cold Outreach Emails",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: a generic pitch blasted to a long list.\nLevel 2: a template with the name and company swapped in.\nLevel 3: one specific, researched observation about their business, tied directly to the offer.\nMost outreach dies at Level 1 or 2 before anyone reads past the first line.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I write the Level 3 opening line.",
  },
  {
    weekOffset: 5, topicTag: "Email & Outreach Copywriting",
    title: "Myth Bust: A Longer Outreach Email Doesn't Build More Credibility",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A long email feels thorough to write. To the person reading it on their phone between meetings, it's a reason to close the tab.\nThe emails that actually get replies are short, specific, and end with one easy question to answer.\nCredibility comes from the specificity of the one line you wrote, not the word count.",
    bodyRed: "React with visible skepticism to a wall-of-text email screenshot.", bodyGreen: "On-screen text: \"short and specific beats long and generic\".",
    ctaLine: "Follow for how I keep outreach emails under 80 words.",
  },
  {
    weekOffset: 6, topicTag: "Email & Outreach Copywriting",
    title: "The 3 Questions I Ask Before Sending Any Outreach Email",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Would this line only make sense for this one company, or could I send it to anyone?\" If it fits anyone, rewrite it.\n\"Is there one clear, easy next step, or am I asking for too much too soon?\" A 15-minute call beats a signed contract as the ask.\n\"Would I open this if it landed in my own inbox?\" The honest answer catches more bad emails than any checklist.\nComment \"OUTREACH\" and I'll send you the 5 templates I actually use.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment OUTREACH\".",
    ctaLine: "Comment OUTREACH and I'll send you the 5 templates.",
  },
  {
    weekOffset: 7, topicTag: "Email & Outreach Copywriting",
    title: "The Framework for Writing an Outreach Email That Gets Replies",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most outreach fails at the structure level, not the writing level. Here's the structure I use every time.\nLine 1: one specific, researched detail about their business that proves this isn't a template.\nLine 2: the problem that detail implies, stated plainly, without exaggerating it.\nLine 3: how I've solved that exact problem before, in one sentence, no case study attached.\nLine 4: one easy, low-commitment next step -- a specific day and time, not \"let me know if you're interested.\"\nComment \"EMAIL\" and I'll DM you 3 real examples that got replies.",
    bodyRed: "Draw the 4-line structure on the whiteboard.", bodyGreen: "On-screen text per line. Comment prompt: \"Comment EMAIL\".",
    ctaLine: "Comment EMAIL and I'll DM you 3 real examples.",
  },

  // ---------- Vendor & Supplier Negotiation (4) ----------
  {
    weekOffset: 8, topicTag: "Vendor & Supplier Negotiation",
    title: "3 Levels of Negotiating With Suppliers",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: accepting the first quote you're given.\nLevel 2: asking for a discount and hoping they say yes.\nLevel 3: knowing your walk-away number and having a second supplier lined up before the conversation starts.\nMost founders negotiate at Level 1 or 2 because they never built the Level 3 leverage first.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I build leverage before a supplier call.",
  },
  {
    weekOffset: 9, topicTag: "Vendor & Supplier Negotiation",
    title: "Myth Bust: The Cheapest Supplier Isn't the Best Deal",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "The lowest quote looks like the obvious winner on a spreadsheet. Reliability, lead time, and quality consistency rarely show up in that number.\nA supplier who's 10% more expensive but never misses a deadline usually saves more than they cost, once you count the downstream damage of a late shipment.\nPrice is one input. It's not the whole decision.",
    bodyRed: "React with visible skepticism to a cheapest-quote-wins spreadsheet.", bodyGreen: "On-screen text: \"cheapest isn't the same as best deal\".",
    ctaLine: "Follow for the full supplier scorecard I use.",
  },
  {
    weekOffset: 10, topicTag: "Vendor & Supplier Negotiation",
    title: "The 3 Questions I Ask Before Signing With Any New Supplier",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What happens if they miss a deadline -- is that even in the contract?\" If not, it's not negotiated yet.\n\"Do I have a real second option, or is this my only supplier?\" Leverage without an alternative isn't real leverage.\n\"What's their actual track record with a client my size?\" A reference from a much bigger client tells you little.\nComment \"SUPPLIER\" and I'll send you the vetting checklist I use.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment SUPPLIER\".",
    ctaLine: "Comment SUPPLIER and I'll send you the vetting checklist.",
  },
  {
    weekOffset: 11, topicTag: "Vendor & Supplier Negotiation",
    title: "The Framework for Negotiating Better Terms Without Burning the Relationship",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Good supplier negotiation isn't about squeezing the hardest. It's about structuring a deal both sides want to keep.\nStep 1: come with real market data on comparable pricing, not only a request for a discount.\nStep 2: ask for value beyond price first -- better payment terms, faster turnaround, priority scheduling.\nStep 3: offer something in return -- a longer commitment, larger order volume, a case study for them.\nStep 4: put every agreed term in writing within 24 hours, before memory of the conversation drifts.\nComment \"NEGOTIATE\" and I'll DM you the term sheet I use.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment NEGOTIATE\".",
    ctaLine: "Comment NEGOTIATE and I'll DM you the term sheet.",
  },

  // ---------- Exit Planning & Business Valuation (4) ----------
  {
    weekOffset: 12, topicTag: "Exit Planning & Business Valuation",
    title: "3 Levels of Thinking About a Business Exit",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: never thinking about an exit until someone makes an offer.\nLevel 2: knowing you'd like to exit eventually, with no real plan.\nLevel 3: building the business for the last 2-3 years as if a buyer is already reviewing the books.\nThe businesses that sell well were built sellable years before the sale conversation started.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for what \"built sellable\" actually means in practice.",
  },
  {
    weekOffset: 13, topicTag: "Exit Planning & Business Valuation",
    title: "Myth Bust: Revenue Alone Doesn't Set Your Valuation",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A big revenue number feels like the whole valuation story. Buyers pay more for a business that runs without the founder in every decision.\nOwner dependency is one of the biggest discounts a buyer applies, regardless of how strong the top line looks.\nDocumented systems and a team that operates independently often move the number more than another year of growth.",
    bodyRed: "React with visible skepticism to a \"just grow revenue\" clip.", bodyGreen: "On-screen text: \"owner dependency is a valuation discount\".",
    ctaLine: "Follow for how I help founders reduce owner dependency.",
  },
  {
    weekOffset: 14, topicTag: "Exit Planning & Business Valuation",
    title: "The 3 Questions a Buyer Actually Asks Before Making an Offer",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Does this business run if the founder takes a month off?\" A hard no here drops the valuation fast.\n\"Are the financials clean enough to survive real due diligence?\" Messy books cost deals, not only discounts.\n\"Is the revenue concentrated in one or two clients?\" Concentration risk scares buyers more than most founders expect.\nComment \"EXIT\" and I'll send you the full pre-sale readiness checklist.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment EXIT\".",
    ctaLine: "Comment EXIT and I'll send you the pre-sale readiness checklist.",
  },
  {
    weekOffset: 15, topicTag: "Exit Planning & Business Valuation",
    title: "If I Were Prepping a Founder for an Exit in 24 Months",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "If a founder came to me wanting to exit in 24 months, here's exactly how I'd sequence the work.\nMonths 1-6: document every core process so the business doesn't depend on the founder's memory to run.\nMonths 7-12: clean up the financials and get them reviewed by someone who's been through due diligence before.\nMonths 13-18: reduce revenue concentration by diversifying the client base, even if it slows short-term growth.\nMonths 19-24: build the story a buyer actually wants to hear -- systems, team, and growth that isn't founder-dependent.\nComment \"EXIT24\" and I'll DM you the full 24-month readiness plan.",
    bodyRed: "Draw the 24-month timeline on the whiteboard.", bodyGreen: "On-screen text per phase. Comment prompt: \"Comment EXIT24\".",
    ctaLine: "Comment EXIT24 and I'll DM you the full readiness plan.",
  },

  // ---------- Board & Advisor Management (4) ----------
  {
    weekOffset: 16, topicTag: "Board & Advisor Management",
    title: "3 Levels of Working With Advisors",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: adding advisors to the website for credibility and rarely talking to them.\nLevel 2: reaching out to advisors only when something goes wrong.\nLevel 3: a set cadence of updates and specific, targeted questions that actually use their expertise.\nMost founders pay in equity for Level 3 value and only get Level 1 engagement because they never asked for more.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I run a useful advisor update.",
  },
  {
    weekOffset: 17, topicTag: "Board & Advisor Management",
    title: "Myth Bust: A Bigger Name on Your Advisor List Doesn't Mean More Help",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A well-known name on the advisor list looks impressive on a deck. It rarely translates into time and attention for an early business.\nThe advisor who actually replies within a day and asks sharp questions is worth more than the famous name who never engages.\nAccess and responsiveness matter more than prestige when you're the one who needs the help.",
    bodyRed: "React with visible skepticism to a name-heavy advisor slide.", bodyGreen: "On-screen text: \"responsive beats famous\".",
    ctaLine: "Follow for how I vet an advisor's actual availability upfront.",
  },
  {
    weekOffset: 18, topicTag: "Board & Advisor Management",
    title: "The 3 Questions I Ask Before Adding Anyone as an Advisor",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What specific problem do I expect them to help with?\" A vague reason means a vague relationship.\n\"How much time have they agreed to give, in writing?\" An unspoken expectation almost always disappoints.\n\"Have they actually solved this problem before, or do they only sound credible?\" Real experience beats a polished bio.\nComment \"ADVISOR\" and I'll send you the advisor agreement template I use.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment ADVISOR\".",
    ctaLine: "Comment ADVISOR and I'll send you the agreement template.",
  },
  {
    weekOffset: 19, topicTag: "Board & Advisor Management",
    title: "The Framework for Running a Board or Advisor Meeting That Actually Helps",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most board meetings turn into status updates nobody needed a meeting for. Here's the structure that actually generates value.\nPart 1: send the update in writing 48 hours before the meeting -- the meeting is for discussion, not presentation.\nPart 2: open with the 2-3 specific decisions or problems you need input on, named clearly.\nPart 3: let advisors push back and disagree before defending your position -- that's the whole point of having them.\nPart 4: end with named owners and dates for every action item, sent out within 24 hours.\nComment \"BOARD\" and I'll DM you the meeting template I use.",
    bodyRed: "Draw the 4-part framework on the whiteboard.", bodyGreen: "On-screen text per part. Comment prompt: \"Comment BOARD\".",
    ctaLine: "Comment BOARD and I'll DM you the meeting template.",
  },

  // ---------- Product-Market Fit Validation (4) ----------
  {
    weekOffset: 20, topicTag: "Product-Market Fit Validation",
    title: "3 Levels of Testing for Product-Market Fit",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: asking friends and family if they'd use it.\nLevel 2: running a survey to a broader but still friendly audience.\nLevel 3: asking strangers who match your target customer to actually pay before it's fully built.\nOnly Level 3 tells you the truth, because it's the only level where saying no costs the other person nothing.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I structure a pre-sale test at Level 3.",
  },
  {
    weekOffset: 21, topicTag: "Product-Market Fit Validation",
    title: "Myth Bust: Positive Feedback Doesn't Mean You Have Product-Market Fit",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "\"This is a great idea\" feels like validation. People say that to be polite far more often than they say it because they'd actually pay.\nReal fit shows up as people asking when they can buy it, without you prompting them.\nCompliments cost nothing to give. A pre-order does.",
    bodyRed: "React with visible skepticism to a \"everyone loved the idea\" clip.", bodyGreen: "On-screen text: \"compliments are free, pre-orders aren't\".",
    ctaLine: "Follow for the real signal I look for instead of compliments.",
  },
  {
    weekOffset: 22, topicTag: "Product-Market Fit Validation",
    title: "The 3 Questions I Ask to Know If Product-Market Fit Is Real",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Are people coming back without me reminding them to?\" Organic repeat use is the strongest early signal there is.\n\"Would a meaningful number of them be upset if this disappeared tomorrow?\" That's a sharper test than satisfaction scores.\n\"Is anyone telling someone else about it unprompted?\" Word of mouth you didn't ask for is hard to fake.\nComment \"FIT\" and I'll send you the fit-testing framework I use with clients.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment FIT\".",
    ctaLine: "Comment FIT and I'll send you the fit-testing framework.",
  },
  {
    weekOffset: 23, topicTag: "Product-Market Fit Validation",
    title: "The Framework I Use to Test Product-Market Fit Before a Full Launch",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Building the full product before testing demand is the most expensive way to find out nobody wants it. Here's how I test first.\nStep 1: build the smallest version that delivers the core value, even if it looks unfinished.\nStep 2: sell it, or get a real financial commitment, before building anything beyond that core version.\nStep 3: track whether early users return and refer others, not only whether they said yes once.\nStep 4: only invest in the full build once steps 2 and 3 show a real, repeatable pattern.\nComment \"PMF\" and I'll DM you the minimum-viable-test checklist.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment PMF\".",
    ctaLine: "Comment PMF and I'll DM you the minimum-viable-test checklist.",
  },

  // ---------- Cash Flow Management for Founders (4) ----------
  {
    weekOffset: 24, topicTag: "Cash Flow Management for Founders",
    title: "3 Levels of Managing Cash Flow",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: checking the bank balance and hoping it's enough.\nLevel 2: a monthly profit and loss review.\nLevel 3: a rolling 13-week cash flow forecast updated weekly, so surprises show up months before they happen.\nMost cash crunches were visible weeks in advance to anyone tracking at Level 3.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I build a 13-week cash flow forecast.",
  },
  {
    weekOffset: 25, topicTag: "Cash Flow Management for Founders",
    title: "Myth Bust: Being Profitable Doesn't Mean You Won't Run Out of Cash",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A profitable income statement feels like safety. Cash and profit run on different timing, and that gap has closed more businesses than a lack of profit ever did.\nSlow-paying clients, upfront inventory costs, and payroll timing can drain cash while the numbers on paper still look healthy.\nWatch cash on its own schedule. Profit alone won't warn you in time.",
    bodyRed: "React with visible skepticism to a \"we're profitable, we're fine\" clip.", bodyGreen: "On-screen text: \"profitable on paper, out of cash in reality\".",
    ctaLine: "Follow for the gap between profit and cash I watch closest.",
  },
  {
    weekOffset: 26, topicTag: "Cash Flow Management for Founders",
    title: "The 3 Questions I Ask to Catch a Cash Problem Early",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"How many weeks of runway do I have at today's burn rate?\" If you can't answer this instantly, that's the first fix.\n\"Which clients are consistently paying late, and is that getting worse?\" A pattern here predicts trouble before it hits.\n\"What's the single biggest upcoming expense I might be underestimating?\" Big irregular costs cause more surprises than routine ones.\nComment \"CASH\" and I'll send you the 13-week forecast template.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment CASH\".",
    ctaLine: "Comment CASH and I'll send you the forecast template.",
  },
  {
    weekOffset: 27, topicTag: "Cash Flow Management for Founders",
    title: "The Framework for Building a Cash Buffer That Actually Protects the Business",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most founders know they should have a cash buffer. Few have a real plan for building and protecting one.\nStep 1: calculate your actual monthly burn rate including irregular expenses, not only the obvious fixed costs.\nStep 2: set a target buffer of 3 months of burn as the first milestone, not the final goal.\nStep 3: automate a fixed transfer into that buffer account every time revenue comes in, before it's available to spend.\nStep 4: treat the buffer as untouchable except for a defined emergency -- write down what counts as one, in advance.\nComment \"BUFFER\" and I'll DM you the buffer-building spreadsheet.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment BUFFER\".",
    ctaLine: "Comment BUFFER and I'll DM you the buffer spreadsheet.",
  },
];
