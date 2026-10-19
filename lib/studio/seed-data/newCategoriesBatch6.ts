// Content expansion Phase 6: 7 more new sub-categories, 4 scripts each = 28
// scripts. Same contained pattern as Phases 1-5. Continues the weekly
// cadence right after Phase 5 (28 items at NEW_CATEGORIES_5_START_WEEK=507,
// weekOffset 0-27 -> occupies weeks 507-534), starting at week 535.

import type { BatchScript } from "./octBatch";
import { BASE_DATE } from "./octBatch";

export { BASE_DATE };
export const NEW_CATEGORIES_6_START_WEEK = 535;
export const NEW_CATEGORIES_6_BATCH_TAG = "new_categories_6_28_batch_v1";

export type NewCategoryScript = BatchScript & { topicTag: string };

const T = "follow" as const;
const M = "engagement" as const;
const B = "manychat" as const;

export const NEW_CATEGORIES_6_BATCH: NewCategoryScript[] = [
  // ---------- Customer Segmentation & Targeting (4) ----------
  {
    weekOffset: 0, topicTag: "Customer Segmentation & Targeting",
    title: "3 Levels of Knowing Your Customer",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: a vague sense of \"small business owners\" as the target.\nLevel 2: basic demographics -- age, industry, revenue range.\nLevel 3: knowing the specific moment in their business where they start actively looking for what you offer.\nMost marketing misses at Level 1 or 2 because it's aimed at a category, not a real moment.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I find that specific trigger moment.",
  },
  {
    weekOffset: 1, topicTag: "Customer Segmentation & Targeting",
    title: "Myth Bust: A Bigger Target Audience Isn't Always Better",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Broadening the target audience feels like more opportunity. Messaging built for everyone usually resonates deeply with no one.\nA narrower segment lets you speak with a specificity that a broad one never allows.\nThe businesses that grow fastest early on usually own a narrow segment completely before expanding.",
    bodyRed: "React with visible skepticism to a \"target everyone\" clip.", bodyGreen: "On-screen text: \"narrow and specific beats broad and vague\".",
    ctaLine: "Follow for how I picked my first narrow segment.",
  },
  {
    weekOffset: 2, topicTag: "Customer Segmentation & Targeting",
    title: "The 3 Questions I Ask to Define a Real Customer Segment",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What specific event triggers them to start looking for a solution?\" That's a segment, not a demographic.\n\"Where do they actually go to find answers to this problem?\" That tells you where to actually show up.\n\"What have they already tried that didn't work?\" That's the exact objection your messaging needs to address.\nComment \"SEGMENT\" and I'll send you the segmentation worksheet I use.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment SEGMENT\".",
    ctaLine: "Comment SEGMENT and I'll send you the worksheet.",
  },
  {
    weekOffset: 3, topicTag: "Customer Segmentation & Targeting",
    title: "The Framework for Defining Your Most Valuable Customer Segment",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most businesses target a category instead of a segment, and it costs them focus everywhere else. Here's how I define one properly.\nStep 1: review your last 10 best clients and find the one specific trait most of them share.\nStep 2: name the trigger moment that made each of them start looking for a solution.\nStep 3: write the segment as a specific sentence -- who they are, what triggered the need, what they've tried already.\nStep 4: test every piece of messaging against that one sentence before it goes out.\nComment \"TARGET\" and I'll DM you the segment-definition template.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment TARGET\".",
    ctaLine: "Comment TARGET and I'll DM you the segment-definition template.",
  },

  // ---------- Founder Time Audits & Delegation (4) ----------
  {
    weekOffset: 4, topicTag: "Founder Time Audits & Delegation",
    title: "3 Levels of Spending Your Time as a Founder",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: reacting to whatever's loudest in the inbox each day.\nLevel 2: a task list, worked in whatever order feels urgent.\nLevel 3: tracking actual hours for a week, then cutting or delegating anything that isn't your highest-value work.\nMost founders stay busy at Level 1 or 2 without ever seeing where the hours actually go.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I run a one-week time audit.",
  },
  {
    weekOffset: 5, topicTag: "Founder Time Audits & Delegation",
    title: "Myth Bust: Being Busy All Day Doesn't Mean the Business Is Moving Forward",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A packed calendar feels like proof of progress. Plenty of that time often goes to tasks that don't actually move the business forward.\nA short weekly review of where the hours went usually reveals more waste than anyone expects.\nBusy and productive get treated as the same thing. They rarely are.",
    bodyRed: "React with visible skepticism to a completely packed calendar screenshot.", bodyGreen: "On-screen text: \"busy isn't the same as productive\".",
    ctaLine: "Follow for the weekly review I run on my own time.",
  },
  {
    weekOffset: 6, topicTag: "Founder Time Audits & Delegation",
    title: "The 3 Questions I Ask to Decide What to Delegate First",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Does this task actually require my specific judgment, or only my time?\" Time-only tasks are the first to hand off.\n\"Could someone else do this at 80% of my quality for a fraction of the cost?\" That trade is usually worth it.\n\"Am I holding onto this because it's necessary, or because it's comfortable?\" Comfort is the harder one to admit.\nComment \"DELEGATE\" and I'll send you the delegation-priority worksheet.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment DELEGATE\".",
    ctaLine: "Comment DELEGATE and I'll send you the worksheet.",
  },
  {
    weekOffset: 7, topicTag: "Founder Time Audits & Delegation",
    title: "The Framework for Running a Time Audit That Actually Changes How You Work",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "A time audit without a real action plan becomes an interesting spreadsheet and nothing more. Here's how to make it change something.\nStep 1: track every hour for one full week, in real time, not from memory at the end of the day.\nStep 2: sort every task into three buckets -- only I can do this, someone else could do this, this shouldn't happen at all.\nStep 3: delegate or cut the second and third buckets over the following month, one task at a time.\nStep 4: re-run the audit a month later to confirm the time actually shifted, not only the plan.\nComment \"AUDIT\" and I'll DM you the time-tracking template.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment AUDIT\".",
    ctaLine: "Comment AUDIT and I'll DM you the time-tracking template.",
  },

  // ---------- Investor Updates & Reporting (4) ----------
  {
    weekOffset: 8, topicTag: "Investor Updates & Reporting",
    title: "3 Levels of Communicating With Investors",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: going quiet between the check and the next ask for money.\nLevel 2: sending an update only when something good happens.\nLevel 3: a consistent monthly update, including the hard news, sent whether or not anything exciting happened.\nMost founders operate at Level 1 or 2 and are surprised when investors hesitate on the next round.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for the monthly update template I actually use.",
  },
  {
    weekOffset: 9, topicTag: "Investor Updates & Reporting",
    title: "Myth Bust: Only Sharing Good News Doesn't Build Investor Trust",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Sharing only the wins feels like the safer move. Investors who never hear the hard news get blindsided later, and that's what actually breaks trust.\nAn update that includes what's not working, along with the plan to address it, builds more credibility than a highlight reel ever does.\nInvestors back founders who tell them the truth early, not founders who never have bad news.",
    bodyRed: "React with visible skepticism to a \"only share the wins\" clip.", bodyGreen: "On-screen text: \"the hard news builds more trust than the wins\".",
    ctaLine: "Follow for how I frame a hard update without losing confidence.",
  },
  {
    weekOffset: 10, topicTag: "Investor Updates & Reporting",
    title: "The 3 Questions Every Investor Update Should Actually Answer",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What actually happened since the last update -- the real number, not the framed version?\" Lead with that, every time.\n\"What's not working right now, and what's the specific plan for it?\" Naming this builds more trust than skipping it.\n\"Where could an investor's specific help actually move something forward?\" A clear ask gets more engagement than a vague one.\nComment \"UPDATE\" and I'll send you the monthly update template.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment UPDATE\".",
    ctaLine: "Comment UPDATE and I'll send you the update template.",
  },
  {
    weekOffset: 11, topicTag: "Investor Updates & Reporting",
    title: "The Framework for Building an Investor Update Cadence That Builds Trust Over Time",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Trust with investors compounds over consistent updates, not one impressive pitch. Here's how I build the cadence.\nStep 1: commit to a fixed monthly send date, and treat it as non-negotiable, regardless of how the month went.\nStep 2: use the same structure every time -- key metrics, wins, challenges, and one specific ask.\nStep 3: name challenges honestly, paired with the specific plan to address each one.\nStep 4: follow up individually on any ask made in a previous update, so investors see it actually gets used.\nComment \"INVESTORS\" and I'll DM you the recurring update template.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment INVESTORS\".",
    ctaLine: "Comment INVESTORS and I'll DM you the update template.",
  },

  // ---------- Building Case Studies & Social Proof (4) ----------
  {
    weekOffset: 12, topicTag: "Building Case Studies & Social Proof",
    title: "3 Levels of Showing Proof of Your Work",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: a generic testimonial saying you were great to work with.\nLevel 2: a short quote naming a specific result.\nLevel 3: a full case study with the starting point, the specific actions taken, and the measurable outcome.\nMost proof stays at Level 1 or 2 and doesn't actually convince a skeptical prospect.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I structure a Level 3 case study.",
  },
  {
    weekOffset: 13, topicTag: "Building Case Studies & Social Proof",
    title: "Myth Bust: A Five-Star Rating Isn't the Same as Real Social Proof",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "A star rating feels like solid proof. It tells a skeptical prospect almost nothing about whether this works for someone like them specifically.\nA detailed story -- their starting situation, what changed, and the specific result -- does the actual convincing.\nSpecificity is what makes proof believable. A rating alone rarely is.",
    bodyRed: "React with visible skepticism to a \"5 stars, great service\" review.", bodyGreen: "On-screen text: \"specificity convinces, ratings alone don't\".",
    ctaLine: "Follow for how I turn a vague testimonial into a real case study.",
  },
  {
    weekOffset: 14, topicTag: "Building Case Studies & Social Proof",
    title: "The 3 Questions I Ask a Client to Build a Real Case Study",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What did the specific situation actually look like before we started?\" Concrete beats vague every time.\n\"What almost stopped you from moving forward with this?\" That objection is exactly what a future prospect needs answered.\n\"What's the one number that best shows what changed?\" A single specific metric beats a paragraph of praise.\nComment \"CASESTUDY\" and I'll send you the interview questions I use.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment CASESTUDY\".",
    ctaLine: "Comment CASESTUDY and I'll send you the interview questions.",
  },
  {
    weekOffset: 15, topicTag: "Building Case Studies & Social Proof",
    title: "The Framework for Turning One Client Win Into Proof That Sells",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "One strong client result, told well, does more selling than a dozen generic testimonials. Here's how I build it.\nPart 1: describe the starting situation in specific, relatable terms a prospect will recognize in themselves.\nPart 2: name the hesitation or doubt they had before starting, stated honestly, not softened.\nPart 3: walk through the specific actions taken, not only the outcome -- this is what builds credibility.\nPart 4: end with the measurable result, in the client's own words wherever possible.\nComment \"PROOF\" and I'll DM you the case study template.",
    bodyRed: "Draw the 4-part framework on the whiteboard.", bodyGreen: "On-screen text per part. Comment prompt: \"Comment PROOF\".",
    ctaLine: "Comment PROOF and I'll DM you the case study template.",
  },

  // ---------- Automating Repetitive Business Tasks (4) ----------
  {
    weekOffset: 16, topicTag: "Automating Repetitive Business Tasks",
    title: "3 Levels of Handling Repetitive Tasks",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: doing the same manual task by hand every single time.\nLevel 2: a checklist so it's at least done consistently.\nLevel 3: an automation that does it without anyone touching it, checked only when something looks off.\nMost founders stay at Level 1 or 2 on tasks that could run themselves entirely.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for the first task I ever automated, and why.",
  },
  {
    weekOffset: 17, topicTag: "Automating Repetitive Business Tasks",
    title: "Myth Bust: You Don't Need to Be Technical to Automate Your Business",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Automation sounds like something only technical founders can build. Most no-code tools today handle it with simple, visual setup.\nThe real barrier usually isn't skill -- it's never sitting down to map out the repetitive task in the first place.\nOnce a task is clearly mapped step by step, automating it is often the easy part.",
    bodyRed: "React with visible skepticism to a \"you need to code to automate\" clip.", bodyGreen: "On-screen text: \"mapping the task is the hard part, not the tool\".",
    ctaLine: "Follow for the no-code tools I actually use.",
  },
  {
    weekOffset: 18, topicTag: "Automating Repetitive Business Tasks",
    title: "The 3 Questions I Ask to Find What's Worth Automating First",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"How many times a week does someone do this exact same task?\" High frequency is the first sign it's worth automating.\n\"Does this task follow the same steps every time, or does it change?\" Automation works best on predictable, repeatable work.\n\"What's the cost of an occasional mistake here?\" Low-stakes repetitive tasks are the safest place to start.\nComment \"AUTOMATE\" and I'll send you the task-mapping worksheet.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment AUTOMATE\".",
    ctaLine: "Comment AUTOMATE and I'll send you the worksheet.",
  },
  {
    weekOffset: 19, topicTag: "Automating Repetitive Business Tasks",
    title: "The Framework for Automating Your First Repetitive Task",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Automating the wrong task first is a common reason people give up on it entirely. Here's how to pick right and build it.\nStep 1: map the task step by step exactly as it's currently done, including the small manual decisions.\nStep 2: identify which steps are purely mechanical versus which require real judgment -- automate only the mechanical ones first.\nStep 3: build the automation using a simple no-code tool, and run it alongside the manual process for one full cycle.\nStep 4: once it's proven accurate, retire the manual version and check the automation monthly instead of running it by hand.\nComment \"BUILDAUTO\" and I'll DM you the automation-mapping template.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment BUILDAUTO\".",
    ctaLine: "Comment BUILDAUTO and I'll DM you the mapping template.",
  },

  // ---------- Founder Wellbeing & Sustainable Pace (4) ----------
  {
    weekOffset: 20, topicTag: "Founder Wellbeing & Sustainable Pace",
    title: "3 Levels of Pacing Yourself as a Founder",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: working every available hour and calling it commitment.\nLevel 2: taking a break only after burning out completely.\nLevel 3: building recovery into the week on a fixed schedule, treated with the same priority as client work.\nMost founders learn Level 3 the hard way, after Level 1 already cost them something.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I schedule recovery into a working week.",
  },
  {
    weekOffset: 21, topicTag: "Founder Wellbeing & Sustainable Pace",
    title: "Myth Bust: Working Every Weekend Isn't What Separates Successful Founders",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Working every weekend gets worn as a badge of commitment. Most founders who've built for a decade protect real recovery time deliberately, not by accident.\nThe founders who last aren't the ones who never stop -- they're the ones who built a pace they could actually sustain.\nA sprint that ends in burnout costs more than the slower, sustainable version ever would.",
    bodyRed: "React with visible skepticism to a \"never take a day off\" clip.", bodyGreen: "On-screen text: \"sustainable pace beats an unsustainable sprint\".",
    ctaLine: "Follow for how I define a sustainable pace for myself.",
  },
  {
    weekOffset: 22, topicTag: "Founder Wellbeing & Sustainable Pace",
    title: "The 3 Questions I Ask Myself to Check If My Pace Is Sustainable",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Could I keep this exact pace for another year without something breaking?\" If the honest answer is no, that's the signal.\n\"When did I last take a full day with no work at all?\" If you can't remember, that's the answer.\n\"Am I making my best decisions right now, or my most exhausted ones?\" Exhaustion quietly degrades judgment before it's obvious.\nComment \"PACE\" and I'll send you the sustainable-pace check-in I use.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment PACE\".",
    ctaLine: "Comment PACE and I'll send you the check-in.",
  },
  {
    weekOffset: 23, topicTag: "Founder Wellbeing & Sustainable Pace",
    title: "The Framework I Use to Build a Sustainable Pace Into the Business",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Sustainable pace doesn't happen by accident -- it gets built into the business the same way any other system does.\nStep 1: schedule recovery time on the calendar first, before client work fills every open slot.\nStep 2: define what actually needs the founder's direct attention versus what can wait or be delegated.\nStep 3: set a real end-of-day boundary, and protect it the way you'd protect a client deadline.\nStep 4: review monthly whether the pace still feels sustainable, and adjust before it breaks, not after.\nComment \"SUSTAIN\" and I'll DM you the pace-check worksheet.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment SUSTAIN\".",
    ctaLine: "Comment SUSTAIN and I'll DM you the pace-check worksheet.",
  },

  // ---------- Long-Term Strategic Planning (4) ----------
  {
    weekOffset: 24, topicTag: "Long-Term Strategic Planning",
    title: "3 Levels of Planning Beyond This Quarter",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Level 1: reacting quarter to quarter with no plan beyond the next few months.\nLevel 2: a vague long-term goal with no clear path to it.\nLevel 3: a written 3-year vision, broken into the specific milestones this year needs to hit.\nMost founders stay at Level 1 or 2 and wonder why the business feels directionless despite staying busy.",
    bodyRed: "Change camera angle per level.", bodyGreen: "On-screen text: \"LEVEL 1/2/3\".",
    ctaLine: "Follow for how I build a 3-year plan backward from the vision.",
  },
  {
    weekOffset: 25, topicTag: "Long-Term Strategic Planning",
    title: "Myth Bust: A Long-Term Plan Doesn't Have to Predict the Future Perfectly",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Skipping long-term planning because \"things always change\" feels like a reasonable excuse. A plan isn't a prediction -- it's a direction you can adjust as reality unfolds.\nWithout it, every decision gets made in isolation, with nothing to check it against.\nThe plan matters less for its accuracy and more for giving every decision a reference point.",
    bodyRed: "React with visible skepticism to a \"plans always change so why bother\" clip.", bodyGreen: "On-screen text: \"a plan is a direction, not a prediction\".",
    ctaLine: "Follow for how I revisit and adjust my plan every quarter.",
  },
  {
    weekOffset: 26, topicTag: "Long-Term Strategic Planning",
    title: "The 3 Questions I Ask Before Setting a 3-Year Vision",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Q&A Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"What does the business actually need to look like for my life to work the way I want it to?\" Start there, not with a revenue number.\n\"What has to be true this year for that 3-year vision to still be realistic?\" That's the actual plan for the next 12 months.\n\"What am I currently doing that doesn't lead toward that vision at all?\" That's usually the first thing to cut.\nComment \"VISION\" and I'll send you the 3-year planning worksheet.",
    bodyRed: "Off-camera interviewer asks each question.", bodyGreen: "Comment prompt: \"Comment VISION\".",
    ctaLine: "Comment VISION and I'll send you the planning worksheet.",
  },
  {
    weekOffset: 27, topicTag: "Long-Term Strategic Planning",
    title: "The Framework for Building a 3-Year Vision and Working Backward From It",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "Most strategic plans start with this year and hope it adds up to something bigger. Here's the reverse approach I use.\nStep 1: write a specific description of what the business and your life look like in 3 years, in concrete detail.\nStep 2: work backward to what needs to be true in year 2 for year 3 to be reachable.\nStep 3: work backward again to the specific milestones this year needs to hit to stay on that path.\nStep 4: revisit the whole plan every quarter and adjust the near-term milestones as reality provides new information.\nComment \"3YEAR\" and I'll DM you the backward-planning template.",
    bodyRed: "Draw the 4-step framework on the whiteboard.", bodyGreen: "On-screen text per step. Comment prompt: \"Comment 3YEAR\".",
    ctaLine: "Comment 3YEAR and I'll DM you the backward-planning template.",
  },
];
