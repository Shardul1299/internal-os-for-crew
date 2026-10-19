// 50-script "idea commentary" batch -- content that sets context on a real
// idea (a book, a public interview theme, a study, a historical case, a
// famous letter or quote) and then gives a specific, opinionated take on it,
// delivered with a curiosity-driven hook. Requested as an extension of the
// "X said this in their book/interview -- here's my take" format, generated
// across 11 distinct source-types so it doesn't read as one repeated
// template and isn't limited to psychology.
//
// Accuracy note: every reference here paraphrases a real, well-established
// idea from a real book, letter, or documented study/case -- nothing is
// presented as a verbatim quote unless it's a genuinely public, widely
// quoted line (e.g. Bezos's "Day 1" letter, "your margin is my
// opportunity"). Interview-based scripts paraphrase a person's well-known
// public position rather than inventing a specific quote.
//
// Ratio (not user-specified this time, chosen to fit the format): TOFU 28 /
// MOFU 18 / BOFU 4 -- commentary content is naturally reach-and-nurture
// content, rarely a hard pitch. Effort: low 6 / default 30 / high 14 --
// context-setting pushes most of this above "low effort" by nature.
// Continues the weekly cadence right after the growth batch (which ends at
// absolute week 144), starting at absolute week 145.

import type { BatchScript } from "./octBatch";
import { BASE_DATE } from "./octBatch";

export { BASE_DATE };
export const COMMENTARY_START_WEEK = 145;
export const COMMENTARY_BATCH_TAG = "commentary_50_batch_v1";

export type SourceType =
  | "Book concept + opinion"
  | "Public interview theme + reaction"
  | "Research study breakdown"
  | "Historical business case lesson"
  | "Contrarian take on popular advice"
  | "Two thinkers disagree"
  | "Concept through my own deal"
  | "Quote deconstruction"
  | "Shareholder/public letter reaction"
  | "Podcast/documentary theme reaction"
  | "Old proverb vs modern data";

export type CommentaryScript = BatchScript & { sourceType: SourceType; sourceRef: string };

const T = "follow" as const;
const M = "engagement" as const;
const B = "manychat" as const;

export const COMMENTARY_BATCH: CommentaryScript[] = [
  // ---------- 1. Book concept + opinion (5) ----------
  {
    weekOffset: 0, sourceType: "Book concept + opinion", sourceRef: "Daniel Kahneman, Thinking, Fast and Slow",
    title: "Kahneman's 'System 1' Explains Why Your Pricing Feels Wrong Even When the Math Is Right",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "In Thinking, Fast and Slow, Kahneman splits the mind into two systems: System 1, fast and instinctive, and System 2, slow and deliberate.\nMost pricing objections come from System 1 reacting to a number before System 2 has evaluated the value behind it.\nMy take: don't fight System 1 with more logic. Slow the client down first -- walk through the value BEFORE the number, so System 2 gets a fair shot at overriding the instinctive flinch.\nThat single sequencing change has moved more deals than any pricing justification I've ever written.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll (a proposal document, a price line highlighted).",
    bodyGreen: "On-screen text: \"System 1\" vs \"System 2\" defined briefly.",
    ctaLine: "Follow for more of what behavioral science actually means for how you sell.",
  },
  {
    weekOffset: 1, sourceType: "Book concept + opinion", sourceRef: "Robert Cialdini, Influence",
    title: "Cialdini's Commitment Principle Explains Why Clients Ghost After a Great First Call",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Green Screen Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Cialdini's Influence argues people feel pressure to stay consistent with commitments they've made out loud, not only ones they've signed.\nMost founders treat a great first call as the win. It isn't -- if the client never said a specific next step out loud, there's no consistency pressure keeping them moving.\nMy take: end every promising call by asking the client to state their own next step, not by you stating it for them.\nComment \"COMMIT\" and I'll send you the exact closing question I use.",
    bodyRed: "Green screen with a simple \"say it -> do it\" graphic.",
    bodyGreen: "Comment prompt: \"Comment COMMIT\".",
    ctaLine: "Comment COMMIT and I'll send you the exact closing question.",
  },
  {
    weekOffset: 2, sourceType: "Book concept + opinion", sourceRef: "Morgan Housel, The Psychology of Money",
    title: "Housel's 'Enough' Idea Is the Best Argument Against Chasing Every Client",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "Housel's The Psychology of Money spends a whole chapter on the idea of \"enough\" -- the discipline to stop reaching past a goal you've already defined.\nMost founders never define what \"enough\" clients or revenue actually looks like, so every new opportunity feels mandatory to chase.\nMy take: write down your \"enough\" number for this quarter before you're in a pitch, not during one -- it's the only thing that lets you say no to a bad-fit client without second-guessing it live.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"define 'enough' before the pitch, not during it\".",
    ctaLine: "Follow for more of how I actually use this in client decisions.",
  },
  {
    weekOffset: 3, sourceType: "Book concept + opinion", sourceRef: "Clayton Christensen, The Innovator's Dilemma",
    title: "Christensen's Disruption Theory Explains Why Your Best Clients Can Kill Your Best Ideas",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "high",
    bodyBlack: "Christensen's core argument in The Innovator's Dilemma: good companies fail not from bad decisions, but from listening too carefully to their best current customers, who never ask for the disruptive thing that will matter later.\nApplied to consulting: your best current clients will always push you toward more of what already works for them -- deeper service, bigger scope, more hours. Rarely toward the leaner, more scalable offer that would actually grow the business.\nMy take: keep a separate track for testing ideas your best clients would never ask for, funded deliberately, evaluated on its own terms -- not judged by whether your existing clients like it yet.\nThat's the only way I've found to avoid getting disrupted by my own future self.\nComment \"DISRUPT\" and I'll send you how I structure that separate testing track.",
    bodyRed: "Draw the disruption curve on the whiteboard -- sustaining innovation vs disruptive innovation.",
    bodyGreen: "On-screen text: \"Innovator's Dilemma\" concept labeled. Comment prompt: \"Comment DISRUPT\".",
    ctaLine: "Comment DISRUPT and I'll send you how I structure a separate testing track.",
  },
  {
    weekOffset: 4, sourceType: "Book concept + opinion", sourceRef: "Jim Collins, Good to Great",
    title: "Collins' Hedgehog Concept Is the Reason 'Niching Down' Actually Works",
    pillar: "authority", contentType: "educational", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Good to Great's Hedgehog Concept asks 3 questions: what can you be best in the world at, what drives your economic engine, and what are you deeply passionate about.\nThe overlap of all 3 -- not any one alone -- is where Collins found sustained outperformance.\nMy take: most founders pick a niche off only one of the three (usually passion), then wonder why it doesn't scale. Score your niche against all 3 before committing.\nComment \"HEDGEHOG\" and I'll send you the worksheet I use to score a niche against all 3.",
    bodyRed: "Draw the 3-circle Venn diagram on the whiteboard.",
    bodyGreen: "Comment prompt: \"Comment HEDGEHOG\".",
    ctaLine: "Comment HEDGEHOG and I'll send you the 3-circle scoring worksheet.",
  },

  // ---------- 2. Public interview theme + reaction (5) ----------
  {
    weekOffset: 5, sourceType: "Public interview theme + reaction", sourceRef: "Naval Ravikant, public interviews and essays on \"specific knowledge\"",
    title: "Naval's 'Specific Knowledge' Idea Explains Why Copying a Competitor's Content Never Works",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "In interviews, Naval Ravikant has repeatedly made the point that \"specific knowledge\" -- what you learned that can't be taught in a classroom, only found by pursuing your own genuine curiosity -- can't be copied by anyone else, even if they see exactly what you built.\nMy take: that's why founders who copy a competitor's content strategy get worse results with the same format. The format was never the asset -- the specific, uncopyable judgment behind it was.\nStop asking \"what content should I make.\" Ask \"what do I know that took me years to learn that I can say in 60 seconds.\"",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"specific knowledge\" defined briefly.",
    ctaLine: "Follow for more of what actually can't be copied in a business.",
  },
  {
    weekOffset: 6, sourceType: "Public interview theme + reaction", sourceRef: "Warren Buffett and Charlie Munger, Berkshire Hathaway annual meeting Q&As",
    title: "Buffett and Munger's 'Circle of Competence' Answer Is the Best Client-Screening Question I've Stolen",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "At Berkshire Hathaway's annual meetings, Buffett and Munger have consistently answered questions about unfamiliar industries the same way: knowing the boundary of what you understand matters more than trying to understand everything.\nMy take: I now ask that question of every new market-entry request before saying yes -- is this genuinely inside what I understand, or does it only feel exciting?\nSaying no to an exciting-but-outside-the-circle engagement has saved more client relationships than it's cost me in fees.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"circle of competence\" defined briefly.",
    ctaLine: "Follow for more of how I decide which engagements to say yes to.",
  },
  {
    weekOffset: 7, sourceType: "Public interview theme + reaction", sourceRef: "Reid Hoffman, public interviews and writing on \"blitzscaling\"",
    title: "Reid Hoffman's Blitzscaling Advice Is Right for VCs and Wrong for Most Consultants",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Talking Back & Forth",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Naive founder: \"Reid Hoffman says prioritize speed over efficiency to win the market first.\"\nReality: that advice was built for venture-funded companies racing for a winner-take-most market, with outside capital covering the inefficiency.\nNaive founder: \"So it doesn't apply to a consulting business at all?\"\nReality: a bootstrapped services business has no outside capital cushioning the inefficiency -- for you, efficiency IS the moat, not the thing you trade away for speed.\nComment \"SPEED\" and I'll send you the version of this advice that actually fits a bootstrapped business.",
    bodyRed: "Two characters, same actor, alternating positions.",
    bodyGreen: "Lower-third labels: \"NAIVE FOUNDER\" / \"REALITY\". Comment prompt: \"Comment SPEED\".",
    ctaLine: "Comment SPEED and I'll send you the bootstrapped version of this advice.",
  },
  {
    weekOffset: 8, sourceType: "Public interview theme + reaction", sourceRef: "N.R. Narayana Murthy, public interviews on trust and long-term client relationships",
    title: "Narayana Murthy's Point About Trust Compounding Is Why I Track Client Relationships in Years, Not Deals",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "In public interviews, Narayana Murthy has consistently framed long-term client trust as something that compounds slowly and gets destroyed instantly by one broken promise.\nMy take: most founders measure success by deals closed this quarter. I measure it by how many clients from 2 years ago still refer people.\nOne metric optimizes for this month. The other optimizes for the business actually existing in 5 years.",
    bodyRed: "Change camera angle per contrasting point.",
    bodyGreen: "On-screen text: \"deals this quarter\" vs \"referrals in 2 years\".",
    ctaLine: "Follow for how I actually track relationship compounding.",
  },
  {
    weekOffset: 9, sourceType: "Public interview theme + reaction", sourceRef: "Public talks by leading tech CEOs on staying \"paranoid\" as a company scales",
    title: "The 'Stay Paranoid' Advice From Scaled Founders Applies at 3 Clients, Not Just 300",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "Founders who've scaled large companies often say the same thing in public talks about staying paranoid: the moment you assume your current model will keep working is the moment it stops.\nMost founders dismiss this as advice for a much later stage than they're at.\nMy take: the earlier you build the habit of asking \"what would break this\" the cheaper it is to fix -- waiting until you're big enough for it to matter means the mistake is also big enough to hurt.\nI run this question on my own business every single quarter, at 3 clients or 30.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"what would break this?\" asked at every stage.",
    ctaLine: "Follow -- more of how I stress-test my own business model.",
  },

  // ---------- 3. Research study breakdown (5) ----------
  {
    weekOffset: 10, sourceType: "Research study breakdown", sourceRef: "Kahneman & Tversky's original prospect theory research on loss aversion",
    title: "The Original Loss Aversion Study Found We Feel Losses About Twice as Strongly as Equal Gains",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Whiteboard Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "Kahneman and Tversky's foundational research on prospect theory found that people weigh a loss roughly twice as heavily as an equivalent gain -- the basis for loss aversion.\nThe practical version most people miss: this isn't only about money. It applies to time, reputation, and missed opportunity too.\nMy take: this is why \"here's what you're currently losing\" beats \"here's what you'll gain\" in almost every pitch I've tested -- it's not a manipulation trick, it's how the math of attention actually works in someone's head.\nComment \"LOSS\" and I'll send you 3 loss-framed rewrites of common pitch lines.",
    bodyRed: "Draw the gain-vs-loss weighting on the whiteboard.",
    bodyGreen: "Comment prompt: \"Comment LOSS\".",
    ctaLine: "Comment LOSS and I'll send you 3 loss-framed pitch rewrites.",
  },
  {
    weekOffset: 11, sourceType: "Research study breakdown", sourceRef: "Widely replicated anchoring research from negotiation and behavioral economics literature",
    title: "Anchoring Research Shows the First Number in a Negotiation Predicts the Final One More Than 'Fair Value' Does",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Decades of anchoring research in negotiation studies show the same result: whoever states the first number pulls the final agreed number toward it, even when that number is arbitrary.\nMost founders let the client name a number first out of politeness.\nMy take: politeness is costing you the anchor. State your number first, backed by a real rationale, and let the negotiation happen from your anchor outward, not toward it.\nComment \"ANCHOR\" and I'll send you how I introduce a first number without it feeling aggressive.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"first number wins the frame\". Comment prompt: \"Comment ANCHOR\".",
    ctaLine: "Comment ANCHOR and I'll send you how to introduce a first number smoothly.",
  },
  {
    weekOffset: 12, sourceType: "Research study breakdown", sourceRef: "Anders Ericsson's deliberate practice research, and how it was popularized (and oversimplified) as the '10,000 hour rule'",
    title: "The Real '10,000 Hour' Research Says Something Very Different From What Got Popularized",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Whiteboard Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "experimental", effort: "high",
    bodyBlack: "Anders Ericsson's original deliberate practice research never claimed 10,000 hours guarantees mastery -- the number got popularized as a simple rule far more than the underlying finding supports.\nWhat the research actually emphasizes: it's not raw hours that build skill, it's deliberate practice -- specific, effortful, feedback-driven repetition on your actual weak points, not only doing the job for years.\nMy take: a consultant who's \"had 10 years of experience\" and a consultant who's deliberately reviewed and improved their process every quarter for 3 years are not the same thing -- and the second one is usually better, despite fewer years.\nWhen you evaluate anyone's experience, including your own, ask about the deliberate part, not only the years.\nComment \"PRACTICE\" and I'll send you how I structure deliberate practice into client work.",
    bodyRed: "Draw \"raw hours\" crossed out next to \"deliberate practice\" on the whiteboard.",
    bodyGreen: "On-screen text: \"10,000 hours\" myth vs the real finding. Comment prompt: \"Comment PRACTICE\".",
    ctaLine: "Comment PRACTICE and I'll send you how I structure deliberate practice into client work.",
  },
  {
    weekOffset: 13, sourceType: "Research study breakdown", sourceRef: "Solomon Asch's classic conformity experiments",
    title: "Asch's Conformity Experiments Explain Why One Confident Voice Can Move an Entire Room",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "Solomon Asch's classic conformity experiments found people would give an answer they knew was wrong simply because everyone else in the room said it first.\nThe experiments also found one thing that broke the effect: a single dissenting voice, even a wrong one, made it dramatically easier for others to speak up honestly.\nMy take: in a client meeting with multiple stakeholders, the first opinion stated in the room often becomes the group's opinion, correct or not -- which is exactly why I try to get the quietest person's real view before the loudest person anchors the room.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"one dissenting voice breaks conformity\".",
    ctaLine: "Follow for more of how group dynamics actually work in a pitch.",
  },
  {
    weekOffset: 14, sourceType: "Research study breakdown", sourceRef: "Dunning & Kruger's research on self-assessed competence",
    title: "The Dunning-Kruger Research Isn't About Stupid People -- It's About All of Us, Early",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Dunning and Kruger's research is often misquoted as \"dumb people think they're smart.\" The actual finding: people early in learning a skill consistently overestimate their competence, because the skill needed to recognize your own gaps IS the skill you haven't learned yet.\nMy take: this describes almost every first-time founder entering a new market, myself included early on -- confidence peaks right when knowledge is lowest.\nThe fix isn't more confidence-checking. It's deliberately seeking out someone further along who can see the gaps you structurally can't see yet.\nComment \"GAPS\" and I'll DM you the 3 questions I ask to find my own blind spots before a new engagement.",
    bodyRed: "React with a knowing, self-aware nod.",
    bodyGreen: "On-screen text: the real finding vs the popular misquote. Comment prompt: \"Comment GAPS\".",
    ctaLine: "Comment GAPS and I'll DM you the 3 questions I use to find my own blind spots.",
  },

  // ---------- 4. Historical business case lesson (5) ----------
  {
    weekOffset: 15, sourceType: "Historical business case lesson", sourceRef: "Kodak inventing the digital camera in 1975 and not commercializing it",
    title: "Kodak Invented the Digital Camera in 1975 and Sat on It -- Here's the Real Lesson",
    pillar: "authority", contentType: "authority", angle: "Myth Bust / Common Mistake", format: "Whiteboard Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "high",
    bodyBlack: "Kodak's own engineers built a working digital camera prototype in 1975. Kodak didn't miss the technology -- they had it first, over a decade before it went mainstream.\nThe popular version of this story is \"they were too slow.\" The real story is worse: their core film business was so profitable that internally championing digital meant arguing against the thing paying everyone's salary.\nMy take: the danger isn't missing a trend, it's having a current revenue stream so comfortable that no one inside the company is incentivized to threaten it.\nThe question I ask clients now: if a competitor built the obvious next version of your product today, who inside your company would be the one to actually push for building it first?\nComment \"KODAK\" and I'll send you the exact question set I use to find that internal blind spot.",
    bodyRed: "Draw a simple timeline: 1975 invention, decades of delay, digital disruption on the whiteboard.",
    bodyGreen: "On-screen text: \"1975\" bolded at the opening. Comment prompt: \"Comment KODAK\".",
    ctaLine: "Comment KODAK and I'll send you the internal blind-spot question set.",
  },
  {
    weekOffset: 16, sourceType: "Historical business case lesson", sourceRef: "Blockbuster's 2000 decision to pass on acquiring Netflix",
    title: "Blockbuster Turned Down Buying Netflix in 2000 -- The Real Mistake Wasn't the Rejection",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "In 2000, Netflix reportedly approached Blockbuster about an acquisition, and Blockbuster passed, confident their retail model would hold.\nThe popular version of this story mocks the rejection itself. The real mistake was earlier: Blockbuster never seriously ran the smaller, cheaper version of Netflix's model internally to test if it threatened them.\nMy take: the decision that matters most isn't the acquisition offer, it's whether you ever tested the threat yourself, at a small scale, before someone else proved it at full scale.",
    bodyRed: "React with visible hindsight skepticism.",
    bodyGreen: "On-screen text: \"2000\" bolded.",
    ctaLine: "Follow for more of what actually killed companies that looked unbeatable.",
  },
  {
    weekOffset: 17, sourceType: "Historical business case lesson", sourceRef: "IBM's 1980 licensing deal with Microsoft for the PC operating system",
    title: "IBM Licensed Its OS Instead of Owning It in 1980 -- The Decision That Built Microsoft",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "In 1980, IBM licensed its new PC's operating system from a small company called Microsoft rather than building and owning it outright, because hardware was IBM's real business and software felt secondary.\nMicrosoft kept the right to license that OS to other computer makers too -- and that single contract term became the foundation of Microsoft's dominance for decades.\nMy take: the underlying lesson isn't about software versus hardware. It's that the most valuable clause in any deal is often the one that feels like a minor technicality at the time it's signed.\nComment \"CLAUSE\" and I'll send you the 3 contract clauses I now read twice before signing any partnership deal.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"1980\" bolded. Comment prompt: \"Comment CLAUSE\".",
    ctaLine: "Comment CLAUSE and I'll send you the 3 contract clauses I always double-check now.",
  },
  {
    weekOffset: 18, sourceType: "Historical business case lesson", sourceRef: "Nokia's decline in the smartphone era, often analyzed through Christensen's disruption lens",
    title: "Nokia Didn't Lose to a Better Phone -- It Lost to a Different Question",
    pillar: "authority", contentType: "educational", angle: "Comparison", format: "Talking Back & Forth",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "Naive take: \"Nokia lost because the iPhone had better hardware.\"\nReality: Nokia kept optimizing the question \"how do we build a better phone,\" while Apple and Google were answering a different question entirely -- \"what's the best computer that happens to fit in a pocket.\"\nNaive take: \"So the lesson is only to innovate faster.\"\nReality: the lesson is check whether you're still answering the right question, not only answering your original question better and better.",
    bodyRed: "Two characters, same actor, alternating positions.",
    bodyGreen: "Lower-third labels: \"NAIVE TAKE\" / \"REALITY\".",
    ctaLine: "Follow for more of how the right question beats the better answer.",
  },
  {
    weekOffset: 19, sourceType: "Historical business case lesson", sourceRef: "The Indian IT services industry's shift from staffing-based \"body-shopping\" to platform and product models",
    title: "India's IT Industry Had to Unlearn Its Own Winning Formula -- Here's Why That's a Warning for Any Growing Firm",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "India's early IT services boom was built largely on a staffing model -- billing by headcount and hours, which worked brilliantly for two decades.\nAs margins compressed, the firms that adapted shifted toward platform-based, outcome-priced models. The ones that didn't kept optimizing a formula the market had already started discounting.\nMy take: the formula that built you is the hardest one to question, precisely because it worked. Set a recurring check: is the thing that made us successful still what clients are actually paying for, or only what we're used to selling?\nComment \"MODEL\" and I'll send you that check as a quarterly worksheet.",
    bodyRed: "Draw \"staffing model\" evolving into \"platform model\" on the whiteboard.",
    bodyGreen: "Comment prompt: \"Comment MODEL\".",
    ctaLine: "Comment MODEL and I'll send you the quarterly business-model check.",
  },

  // ---------- 5. Contrarian take on popular advice (5) ----------
  {
    weekOffset: 20, sourceType: "Contrarian take on popular advice", sourceRef: "Cal Newport's So Good They Can't Ignore You, countering \"follow your passion\"",
    title: "'Follow Your Passion' Is Backwards -- Cal Newport's Research Says Skill Comes First",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Follow your passion\" assumes passion exists first, then work becomes fulfilling because of it.\nCal Newport's So Good They Can't Ignore You argues the sequence usually runs the other way: deep skill, built through deliberate work, is what generates the feeling people later call passion.\nMy take: I didn't feel passionate about consulting on day one. I felt passionate about it once I got specifically good at one narrow part of it -- the feeling followed the competence, not the reverse.",
    bodyRed: "React with visible pushback to the \"follow your passion\" quote.",
    bodyGreen: "On-screen text: \"skill first, passion follows\".",
    ctaLine: "Follow for more career advice that doesn't survive a closer look.",
  },
  {
    weekOffset: 21, sourceType: "Contrarian take on popular advice", sourceRef: "The popular startup mantra of \"fake it till you make it\"",
    title: "'Fake It Till You Make It' Works Once -- Then It's the Reason Clients Stop Trusting You",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "\"Fake it till you make it\" gets treated as harmless startup wisdom about confidence.\nThe version that actually damages trust: overstating capability you don't have yet to close a deal, then scrambling to build it after signing.\nMy take: confidence and capability are different things. Project confidence in your process. Be precise, even understated, about your current capability -- the gap between the two is exactly where trust breaks.",
    bodyRed: "Change camera angle for the contrast.",
    bodyGreen: "On-screen text: \"confidence in process, honesty about capability\".",
    ctaLine: "Follow for more of the advice that sounds right but isn't.",
  },
  {
    weekOffset: 22, sourceType: "Contrarian take on popular advice", sourceRef: "The retail-era mantra \"the customer is always right\"",
    title: "'The Customer Is Always Right' Is How Founders Talk Themselves Into Building the Wrong Thing",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Voiceover Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"The customer is always right\" made sense as retail service advice -- refund the complaint, keep the relationship.\nApplied to product and strategy decisions, it produces a different failure: building exactly what the loudest client asks for, even when it doesn't serve your broader market.\nMy take: customers are right about their own problem. They're rarely right about the correct solution -- that judgment call is still yours to make.\nComment \"RIGHT\" and I'll send you how I separate a client's stated request from their actual underlying problem.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"right about the problem, not the solution\". Comment prompt: \"Comment RIGHT\".",
    ctaLine: "Comment RIGHT and I'll send you how I separate a request from the real problem.",
  },
  {
    weekOffset: 23, sourceType: "Contrarian take on popular advice", sourceRef: "The tech-industry mantra \"move fast and break things\"",
    title: "'Move Fast and Break Things' Only Works When Someone Else Pays for What Breaks",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "The mantra came from a consumer tech environment with venture funding absorbing the cost of mistakes and low regulatory exposure.\nMy take: for a bootstrapped services business, every broken thing comes directly out of your own runway and your own client trust -- there's no outside capital cushioning it.\nThe better version for most founders: move fast on anything reversible, and be deliberately slow on anything that isn't.",
    bodyRed: "React with visible skepticism to the mantra.",
    bodyGreen: "On-screen text: \"fast on reversible, slow on irreversible\".",
    ctaLine: "Follow for more startup mantras worth questioning before you adopt them.",
  },
  {
    weekOffset: 24, sourceType: "Contrarian take on popular advice", sourceRef: "The service-industry advice to \"never say no to a client\"",
    title: "'Never Say No to a Client' Is the Advice That Quietly Caps Your Business's Ceiling",
    pillar: "authority", contentType: "authority", angle: "Myth Bust / Common Mistake", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "\"Never say no to a client\" sounds like good service instinct. In practice, it means every yes to a bad-fit engagement crowds out the capacity for a better one that hasn't shown up yet.\nMy take: every business has a finite amount of delivery capacity. Saying yes to everything doesn't grow that capacity -- it only fills it with whatever asked first, good fit or not.\nThe founders I've watched build the strongest businesses said no more often as they grew, not less -- they got increasingly specific about the exact 3 conditions an engagement had to meet.\nComment \"CAPACITY\" and I'll DM you the exact 3 conditions we screen every new engagement against.",
    bodyRed: "Draw a simple \"capacity bucket\" filling with mixed-fit clients on the whiteboard.",
    bodyGreen: "On-screen text: \"saying yes to everything doesn't grow capacity\". Comment prompt: \"Comment CAPACITY\".",
    ctaLine: "Comment CAPACITY and I'll DM you the exact 3 screening conditions we use.",
  },

  // ---------- 6. Two thinkers disagree (4) ----------
  {
    weekOffset: 25, sourceType: "Two thinkers disagree", sourceRef: "Daniel Kahneman's slow-deliberation research vs. Malcolm Gladwell's Blink, on fast intuitive judgment",
    title: "Kahneman Says Slow Down. Gladwell Says Trust the Blink. Both Are Right About Different Decisions",
    pillar: "authority", contentType: "authority", angle: "Comparison", format: "Talking Back & Forth",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "high",
    bodyBlack: "Kahneman: our fast instincts are riddled with predictable biases -- slow down and reason deliberately, especially on anything high-stakes or unfamiliar.\nGladwell, in Blink: trained intuition, built from real repeated experience in a domain, can outperform slow deliberate analysis, especially under time pressure.\nMy take: they're describing two different situations, not contradicting each other. Kahneman's warning applies to decisions outside your real expertise. Gladwell's applies inside it.\nThe practical rule: trust your gut fast on the specific problem type you've solved dozens of times. Force yourself to slow down on anything genuinely new.\nComment \"GUT\" and I'll send you how I tell the difference in the moment.",
    bodyRed: "Two characters, same actor, alternating positions -- \"Kahneman\" side and \"Gladwell\" side.",
    bodyGreen: "Lower-third labels: \"SLOW DOWN\" / \"TRUST THE BLINK\". Comment prompt: \"Comment GUT\".",
    ctaLine: "Comment GUT and I'll send you how I tell the difference in the moment.",
  },
  {
    weekOffset: 26, sourceType: "Two thinkers disagree", sourceRef: "Eric Ries's Lean Startup (build-measure-learn fast) vs. Peter Thiel's Zero to One (plan for a defensible secret)",
    title: "Eric Ries Says Test Fast. Peter Thiel Says Plan Deeply. Here's When Each One Is Actually Right",
    pillar: "authority", contentType: "authority", angle: "Comparison", format: "Whiteboard Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "high",
    bodyBlack: "Ries's Lean Startup argues you can't out-plan uncertainty -- build the smallest test, measure real behavior, iterate fast.\nThiel's Zero to One pushes back: some of the most valuable companies were built on a specific, deeply-reasoned insight that wasn't obvious from rapid testing alone -- iteration without a real thesis wanders instead.\nMy take: use Ries's method to validate demand, and Thiel's method to decide whether the opportunity is even worth defending once you've validated it. Iteration tells you if something works. It rarely tells you if it's defensible.\nComment \"TEST\" and I'll send you how I combine both in a market-entry plan.",
    bodyRed: "Draw \"iterate fast\" on one side of the whiteboard, \"defensible thesis\" on the other.",
    bodyGreen: "On-screen text: \"Lean Startup\" vs \"Zero to One\". Comment prompt: \"Comment TEST\".",
    ctaLine: "Comment TEST and I'll send you how I combine both approaches.",
  },
  {
    weekOffset: 27, sourceType: "Two thinkers disagree", sourceRef: "Jim Collins's Good to Great (disciplined patience) vs. Reid Hoffman's blitzscaling (speed over efficiency)",
    title: "Good to Great Says Be Patient. Blitzscaling Says Be Fast. The Real Answer Depends on Your Funding",
    pillar: "authority", contentType: "authority", angle: "Comparison", format: "Whiteboard Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Collins studied companies that outperformed over 15+ years through disciplined, patient execution.\nHoffman's blitzscaling case studies are almost entirely venture-funded companies racing for a winner-take-most market with outside capital funding the inefficiency.\nMy take: the disagreement dissolves once you ask who's paying for mistakes made at speed. If it's your own runway, Collins's patience wins. If it's investor capital chasing a real winner-take-most market, Hoffman's speed can make sense.\nMost founders read the wrong one for their situation.",
    bodyRed: "Draw a simple 2-column comparison on the whiteboard: \"outside capital\" vs \"self-funded\".",
    bodyGreen: "On-screen text: \"who's paying for the mistake?\".",
    ctaLine: "Follow for more of how to know which advice actually applies to you.",
  },
  {
    weekOffset: 28, sourceType: "Two thinkers disagree", sourceRef: "Nassim Taleb's antifragility and \"avoid ruin\" principle vs. traditional venture advice to \"swing big\"",
    title: "Taleb Says Avoid Ruin at All Costs. VCs Say Swing Big. Most Founders Are Applying the Wrong One",
    pillar: "authority", contentType: "authority", angle: "Comparison", format: "Talking Back & Forth",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "high",
    bodyBlack: "Taleb's core argument across Antifragile and Fooled by Randomness: never take a bet, however good the odds look, where a bad outcome means total ruin -- ruin removes you from the game before the good odds can ever play out.\nVenture advice pushes the opposite: swing for outsized outcomes, because a portfolio of many bets can absorb any single failure.\nMy take: VC advice works for VCs, because THEY hold the portfolio of many bets. A single founder betting their whole business is the one company in that portfolio, not the portfolio itself -- Taleb's warning applies directly to you, even if the advice you're hearing was built for someone else's math.\nComment \"RUIN\" and I'll send you the 1 question I ask before any bet that could threaten the whole business.",
    bodyRed: "Two characters, same actor, alternating positions.",
    bodyGreen: "Lower-third labels: \"AVOID RUIN\" / \"SWING BIG\". Comment prompt: \"Comment RUIN\".",
    ctaLine: "Comment RUIN and I'll send you the 1 question I ask before any big bet.",
  },

  // ---------- 7. Concept through my own deal (4) ----------
  {
    weekOffset: 29, sourceType: "Concept through my own deal", sourceRef: "Robert Cialdini's reciprocity principle, applied to a real client win",
    title: "How Cialdini's Reciprocity Principle Actually Landed One of Our Best Clients",
    pillar: "authority", contentType: "authority", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Cialdini's reciprocity principle says people feel a real pull to give back once they've genuinely received something first, no strings attached.\nHere's how I've applied it: before pitching a specific prospect, I send a short, specific analysis of one gap in their current market approach -- no ask attached, no pitch in the same message.\nThat single move has opened more first conversations than any cold outreach template I've used.\nComment \"GIVE\" and I'll send you the exact format of that analysis.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"give first, ask later, never in the same message\". Comment prompt: \"Comment GIVE\".",
    ctaLine: "Comment GIVE and I'll send you the exact format of that first analysis.",
  },
  {
    weekOffset: 30, sourceType: "Concept through my own deal", sourceRef: "Anchoring research, applied to a real fee negotiation",
    title: "The Anchoring Research Cost Me a Deal Once -- Here's What I Do Differently Now",
    pillar: "authority", contentType: "authority", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "Early on, I let a client name their budget first in a negotiation, politely, before stating my own number -- exactly what anchoring research says loses the negotiation frame.\nTheir number became the ceiling for the whole conversation, and I ended up 30% under what the scope was actually worth.\nWhat I do now: state my number first, with the reasoning attached, every time -- and let their counter happen from my anchor, not the reverse.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"30% under\" bolded.",
    ctaLine: "Follow for more real mistakes I've actually made and fixed.",
  },
  {
    weekOffset: 31, sourceType: "Concept through my own deal", sourceRef: "Buffett and Munger's circle of competence, applied to a real client I declined",
    title: "I Turned Down a $50,000 Engagement Because of Buffett's Circle of Competence -- Here's Why",
    pillar: "authority", contentType: "authority", angle: "Transformation", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "high",
    bodyBlack: "A prospect offered a $50,000 engagement in an industry I'd never worked in, with a regulatory structure I didn't understand yet.\nBuffett and Munger's circle of competence says the boundary of what you understand matters more than the size of the opportunity outside it.\nI turned it down, and referred them to someone who actually specialized in that exact regulatory environment.\nThat referral came back to me twice since, on engagements that WERE inside my circle -- the relationship survived because I was honest about the boundary instead of stretching to take the fee.\nComment \"CIRCLE\" and I'll DM you the exact question I ask myself before any new-industry engagement.",
    bodyRed: "Draw a simple circle on the whiteboard, marking \"inside\" and \"outside\".",
    bodyGreen: "On-screen text: \"$50,000\" bolded. Comment prompt: \"Comment CIRCLE\".",
    ctaLine: "Comment CIRCLE and I'll DM you the exact question I ask before a new-industry engagement.",
  },
  {
    weekOffset: 32, sourceType: "Concept through my own deal", sourceRef: "Jim Collins's Hedgehog Concept, applied to choosing Upforge's own niche",
    title: "The Hedgehog Concept Is the Actual Reason I Picked Market Entry Over Generalist Consulting",
    pillar: "authority", contentType: "authority", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Collins's Hedgehog Concept asks what you can be best at, what drives the economic engine, and what you're genuinely driven by -- the overlap of all 3, not only one.\nGeneralist MSME consulting scored on \"driven by\" but not on \"best at\" -- too broad to build real depth in.\nMarket entry specifically scored on all 3: a narrow enough problem to actually master, real economic demand behind it, and the exact intersection of psychology, finance, and strategy I was drawn to anyway.\nThat's the actual reasoning behind the pivot, not only instinct.",
    bodyRed: "Draw the 3-circle Venn diagram, filled in with the actual reasoning.",
    bodyGreen: "On-screen text per circle.",
    ctaLine: "Follow for how I'd score your niche against the same 3 circles.",
  },

  // ---------- 8. Quote deconstruction (4) ----------
  {
    weekOffset: 33, sourceType: "Quote deconstruction", sourceRef: "Peter Drucker, widely attributed line \"culture eats strategy for breakfast\"",
    title: "Deconstructing 'Culture Eats Strategy for Breakfast' Line by Line",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Whiteboard Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Culture eats strategy for breakfast\" -- widely attributed to Peter Drucker. Let's break down why it holds up.\n\"Culture\": the actual behavior a team defaults to under pressure, not the values poster on the wall.\n\"Eats\": not competes with -- consumes. A brilliant strategy executed by a culture that doesn't actually value the behaviors it requires simply won't get executed as designed.\n\"For breakfast\": first, before anything else even gets a chance -- culture wins by default, not by contest.\nMy take: before writing a new strategy, audit whether your current team culture would actually execute it under pressure, not only agree with it in a meeting.",
    bodyRed: "Write the quote on the whiteboard, underlining each phrase as it's deconstructed.",
    bodyGreen: "On-screen text per phrase.",
    ctaLine: "Follow for more quotes broken down for what they actually mean.",
  },
  {
    weekOffset: 34, sourceType: "Quote deconstruction", sourceRef: "Charlie Munger's advice to \"invert, always invert\"",
    title: "Deconstructing Munger's 'Invert, Always Invert' -- The Mental Model Behind It",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Whiteboard Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Munger's \"invert, always invert\" comes from a mathematician's habit: instead of asking how to succeed, ask how to guarantee failure, then avoid every item on that list.\nApplied to a market entry: instead of \"how do we win this market,\" ask \"what would guarantee we fail here\" -- usually a much shorter, clearer, and more actionable list.\nMy take: this is the single most useful planning exercise I run with new clients, and it takes 20 minutes.\nComment \"INVERT\" and I'll send you the exact inversion exercise I run in a client kickoff.",
    bodyRed: "Write \"how to win\" crossed out, \"how to guarantee failure\" written instead, on the whiteboard.",
    bodyGreen: "Comment prompt: \"Comment INVERT\".",
    ctaLine: "Comment INVERT and I'll send you the exact inversion exercise.",
  },
  {
    weekOffset: 35, sourceType: "Quote deconstruction", sourceRef: "Jeff Bezos's widely quoted line \"your margin is my opportunity\"",
    title: "Deconstructing Bezos's 'Your Margin Is My Opportunity' -- Why It's Scarier Than It Sounds",
    pillar: "authority", contentType: "authority", angle: "Myth Bust / Common Mistake", format: "Whiteboard Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "high",
    bodyBlack: "Bezos's famous line, \"your margin is my opportunity,\" describes Amazon's strategy of entering markets specifically where incumbents had built in comfortable margin, and undercutting it deliberately.\n\"Your margin\": not your revenue, not your customers -- specifically the comfortable gap between your cost and your price.\n\"Is my opportunity\": a wide margin isn't only profit, it's an open invitation for a leaner competitor to enter exactly there.\nMy take: any founder with a comfortably wide margin should treat that margin as a visible target, not a safety cushion -- ask who could enter your market underneath your current price, and what would stop them.\nComment \"MARGIN\" and I'll send you the exact audit I run to find that vulnerability.",
    bodyRed: "Write the quote on the whiteboard, underlining \"margin\" and \"opportunity\" separately.",
    bodyGreen: "On-screen text per phrase. Comment prompt: \"Comment MARGIN\".",
    ctaLine: "Comment MARGIN and I'll send you the exact margin-vulnerability audit.",
  },
  {
    weekOffset: 36, sourceType: "Quote deconstruction", sourceRef: "Seth Godin's line from Purple Cow, \"in a crowded market, fitting in is failing\"",
    title: "Deconstructing Seth Godin's 'In a Crowded Market, Fitting In Is Failing'",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "Godin's Purple Cow line: \"in a crowded market, fitting in is failing.\"\n\"Crowded market\": most niches worth entering already have real competition -- that's a signal of demand, not a reason to avoid it.\n\"Fitting in\": looking, sounding, and positioning like everyone else already there.\n\"Is failing\": not a risk -- a guarantee, because a buyer with no way to tell you apart defaults to the cheapest or the most familiar option, never you.\nMy take: differentiation isn't a nice-to-have in a crowded market. It's the entire entry requirement.",
    bodyRed: "Change camera angle per phrase deconstructed.",
    bodyGreen: "On-screen text per phrase.",
    ctaLine: "Follow for more quotes worth actually breaking down.",
  },

  // ---------- 9. Shareholder/public letter reaction (4) ----------
  {
    weekOffset: 37, sourceType: "Shareholder/public letter reaction", sourceRef: "Jeff Bezos's 1997 letter to Amazon shareholders, \"It's All About the Long Term\"",
    title: "Bezos's 1997 'Day 1' Letter Is the Best Founder Document I've Ever Read -- Here's the Part Everyone Skips",
    pillar: "authority", contentType: "authority", angle: "Educational Tip / Hack", format: "Whiteboard Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "high",
    bodyBlack: "Bezos's 1997 shareholder letter, titled \"It's All About the Long Term,\" is the founding document that introduced Amazon's now-famous \"Day 1\" philosophy -- everyone quotes the long-term framing.\nThe part most people skip: the same letter explicitly says Amazon would make deliberate, calculated bets that might not pay off, and to expect that as strategy, not failure.\nMy take: most founders adopt the long-term patience part of \"Day 1\" thinking without adopting the deliberate-bet-taking part -- and end up patient about a business that was never actually taking any real risks to justify the patience.\nPatience without real bets isn't strategy. It's only waiting.\nComment \"DAY1\" and I'll send you the 1 deliberate bet I'm running in my own business right now.",
    bodyRed: "Draw \"long-term patience\" and \"deliberate bets\" as two connected boxes on the whiteboard.",
    bodyGreen: "On-screen text: \"1997\" bolded. Comment prompt: \"Comment DAY1\".",
    ctaLine: "Comment DAY1 and I'll send you the deliberate bet I'm running right now.",
  },
  {
    weekOffset: 38, sourceType: "Shareholder/public letter reaction", sourceRef: "Warren Buffett's annual shareholder letters, recurring theme of circle of competence",
    title: "Buffett's Letters Repeat the Same Warning Every Year -- Most Founders Read Right Past It",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Buffett's annual letters return, year after year, to the same warning: knowing what you don't understand matters as much as what you do.\nIt's repeated so consistently precisely because it's the discipline that's easiest to abandon once things are going well.\nMy take: the years a founder is most likely to drift outside their circle of competence are the successful ones, not the struggling ones -- success is when the temptation to chase an unfamiliar opportunity feels safest.\nComment \"BUFFETT\" and I'll send you my own yearly check-in questions modeled on this.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"repeated every year for a reason\". Comment prompt: \"Comment BUFFETT\".",
    ctaLine: "Comment BUFFETT and I'll send you my yearly check-in questions.",
  },
  {
    weekOffset: 39, sourceType: "Shareholder/public letter reaction", sourceRef: "Ray Dalio's writing on radical transparency in Principles",
    title: "Dalio's 'Radical Transparency' Idea Sounds Great Until You Actually Try Running a Business On It",
    pillar: "authority", contentType: "authority", angle: "Do vs Don't (Right vs Wrong)", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "default",
    bodyBlack: "Dalio's Principles argues radical transparency -- surfacing disagreements openly instead of managing them privately -- produces better decisions over time.\nDon't: apply it as \"say whatever you think, whenever\" -- that reads as bluntness without structure, and damages trust fast.\nDo: apply it as a specific, scheduled practice -- a regular review where disagreement is explicitly invited and structured, not an everyday improvisation.\nComment \"TRANSPARENT\" and I'll DM you the exact structure I use for this with clients.",
    bodyRed: "Draw \"unstructured bluntness\" crossed out next to \"scheduled structured review\" on the whiteboard.",
    bodyGreen: "Comment prompt: \"Comment TRANSPARENT\".",
    ctaLine: "Comment TRANSPARENT and I'll DM you the exact structured review format.",
  },
  {
    weekOffset: 40, sourceType: "Shareholder/public letter reaction", sourceRef: "Jeff Bezos's shareholder-letter framing of \"one-way door\" vs \"two-way door\" decisions",
    title: "Bezos's 'Two-Way Door' Framing Changed How Fast I Make Most Decisions",
    pillar: "authority", contentType: "educational", angle: "Framework / Formula / Acronym", format: "Whiteboard Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "Bezos's letters describe two kinds of decisions: one-way doors, that are hard or impossible to reverse, and two-way doors, that can be undone cheaply if wrong.\nThe mistake most founders make: treating every decision with one-way-door caution, which slows the business down on things that were never actually risky.\nMy take: sort every open decision into one of the two categories before debating it. Two-way doors get decided same-day. One-way doors get the careful process. Most \"hard decisions\" are actually two-way doors in disguise.\nComment \"DOOR\" and I'll send you the 1-question test I use to sort a decision.",
    bodyRed: "Draw two labeled doors on the whiteboard: \"one-way\" and \"two-way\".",
    bodyGreen: "Comment prompt: \"Comment DOOR\".",
    ctaLine: "Comment DOOR and I'll send you the 1-question test to sort any decision.",
  },

  // ---------- 10. Podcast/documentary theme reaction (4) ----------
  {
    weekOffset: 41, sourceType: "Podcast/documentary theme reaction", sourceRef: "A recurring theme in startup-failure documentaries and podcasts: premature scaling",
    title: "Every Startup-Failure Documentary Has the Same Villain, and It's Not the One They Name",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "Startup-failure documentaries usually name a dramatic villain -- a bad co-founder, a market crash, a competitor.\nWatch enough of them and the real pattern is quieter: premature scaling -- hiring, spending, and expanding ahead of actual proven demand, dressed up as \"growth mode.\"\nMy take: before any scaling decision, I make clients answer one question -- what specific, repeatable proof do we have that this will work at the next size, not only at the current one.\nWithout a real answer, scaling is only spending faster toward the same uncertainty.",
    bodyRed: "React with a knowing nod to the pattern.",
    bodyGreen: "On-screen text: \"the quiet villain: premature scaling\".",
    ctaLine: "Follow for more of the pattern behind failures that get blamed on something else.",
  },
  {
    weekOffset: 42, sourceType: "Podcast/documentary theme reaction", sourceRef: "Chris Voss, Never Split the Difference, and his FBI-negotiation concept of tactical empathy",
    title: "Chris Voss's 'Tactical Empathy' From His FBI Negotiation Work Applies Directly to Closing Clients",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Talking Back & Forth",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "high",
    bodyBlack: "In Never Split the Difference, former FBI negotiator Chris Voss describes tactical empathy -- naming the other side's likely objection out loud, before they raise it, so it loses its emotional charge.\nA client thinking \"this feels expensive\" and hearing you say it first, unprompted, disarms the objection almost completely -- it signals you already understand their hesitation instead of being blindsided by it.\nMy take: I now name the most likely objection myself, early in every proposal call, before the client has to work up the nerve to say it. It changes the entire tone of the conversation.\nComment \"EMPATHY\" and I'll send you exactly how I phrase this in a real proposal call.",
    bodyRed: "Two characters, same actor, alternating positions -- one voicing the unspoken objection, one naming it first.",
    bodyGreen: "On-screen text: \"name the objection before they do\". Comment prompt: \"Comment EMPATHY\".",
    ctaLine: "Comment EMPATHY and I'll send you exactly how I phrase this in a proposal call.",
  },
  {
    weekOffset: 43, sourceType: "Podcast/documentary theme reaction", sourceRef: "Seth Godin's recurring podcast theme of the \"smallest viable market\"",
    title: "Seth Godin's 'Smallest Viable Market' Idea Is the Opposite of How Most Founders Think About Growth",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Voiceover Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "Seth Godin's recurring point in interviews and talks: find the smallest group of people who would genuinely miss you if you disappeared, and serve them completely, rather than chasing the broadest possible audience from day one.\nMost founders think growth means widening the target early.\nMy take: a narrower, fully-served audience produces the specific proof, referrals, and case studies that make widening later dramatically easier -- trying to widen first usually means serving no one particularly well.\nStart smaller than feels comfortable. It compounds faster than starting broad.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"smallest viable market\" defined briefly.",
    ctaLine: "Follow for more of how I define a genuinely narrow starting audience.",
  },
  {
    weekOffset: 44, sourceType: "Podcast/documentary theme reaction", sourceRef: "A recurring theme in founder-interview podcasts on sustainable pace vs. burnout",
    title: "Founders Who've Actually Built for a Decade Say the Same Thing About Pace, and New Founders Ignore It",
    pillar: "authority", contentType: "authority", angle: "Myth Bust / Common Mistake", format: "Whiteboard Format",
    funnelStage: "bofu", ctaType: B, conceptBucket: "proven", effort: "default",
    bodyBlack: "Across founder interviews with people who've genuinely built for 10+ years, the same idea comes up repeatedly: the pace that feels heroic in year one is rarely the pace that survives year five.\nNew founders tend to treat burnout stories as things that happen to other, less disciplined people.\nMy take: the founders who last built in recovery deliberately, on a schedule, the same way they scheduled client work -- not as an afterthought once they collapsed.\nComment \"PACE\" and I'll DM you how I actually schedule recovery into a working week.",
    bodyRed: "Draw a simple sustainable-pace curve on the whiteboard, contrasted with a burnout spike-and-crash curve.",
    bodyGreen: "Comment prompt: \"Comment PACE\".",
    ctaLine: "Comment PACE and I'll DM you how I schedule recovery into a working week.",
  },

  // ---------- 11. Old proverb vs modern data (5) ----------
  {
    weekOffset: 45, sourceType: "Old proverb vs modern data", sourceRef: "The proverb \"slow and steady wins the race\" vs modern compounding-growth data",
    title: "'Slow and Steady Wins the Race' Isn't Just a Nice Proverb -- Compounding Math Actually Proves It",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Audio B-Roll + Text",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "On-screen text (no voiceover, timed to music):\n\"The old proverb: slow and steady wins the race.\"\n\"The modern data: consistent small growth, compounded, mathematically outpaces sporadic big spikes over time.\"\n\"My take: consistency isn't the boring option. It's the highest-leverage one, if you actually stick with it long enough to compound.\"",
    bodyRed: "Line-by-line image changes every 1-3 seconds, no on-camera footage.",
    bodyGreen: "Bold on-screen text per line, driving background track.",
    ctaLine: "Follow for more of what old wisdom actually gets right.",
  },
  {
    weekOffset: 46, sourceType: "Old proverb vs modern data", sourceRef: "The retail proverb \"the customer is king\" vs modern customer-segmentation data",
    title: "'The Customer Is King' Sounds Fair -- Segmentation Data Says Treating Everyone Equally Is a Mistake",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Voiceover Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"The customer is king\" implies every customer deserves the same effort.\nModern segmentation and cohort data consistently shows a small share of clients drive a disproportionate share of long-term value -- treating every account identically means under-serving your best ones and over-serving your worst.\nMy take: the proverb should instead be \"your best customer is king\" -- identify who that actually is with real data, then allocate effort accordingly, not evenly.\nComment \"KING\" and I'll send you how I segment client value in a small practice.",
    bodyRed: "No on-camera talking -- voiceover over relevant b-roll.",
    bodyGreen: "On-screen text: \"not all customers are equally king\". Comment prompt: \"Comment KING\".",
    ctaLine: "Comment KING and I'll send you how I segment client value.",
  },
  {
    weekOffset: 47, sourceType: "Old proverb vs modern data", sourceRef: "The proverb \"fortune favors the bold\" vs prospect theory's findings on loss aversion",
    title: "'Fortune Favors the Bold' Is Only Half True -- Loss Aversion Research Explains the Other Half",
    pillar: "authority", contentType: "educational", angle: "Myth Bust / Common Mistake", format: "Reaction Format",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "default",
    bodyBlack: "\"Fortune favors the bold\" gets used to justify almost any big, risky move.\nLoss aversion research shows boldness only pays off when the downside is genuinely survivable -- a bold bet that risks ruin isn't brave, it's only gambling with the whole business.\nMy take: the useful version is \"fortune favors bold bets with a survivable downside\" -- less catchy, considerably more accurate, and the one I actually apply.",
    bodyRed: "React with visible skepticism to the unqualified version of the proverb.",
    bodyGreen: "On-screen text: \"bold, with a survivable downside\".",
    ctaLine: "Follow for more proverbs worth a second look before you follow them.",
  },
  {
    weekOffset: 48, sourceType: "Old proverb vs modern data", sourceRef: "The proverb \"don't put all your eggs in one basket\" vs Buffett's concentrated-investing counterpoint",
    title: "'Don't Put All Your Eggs in One Basket' -- Buffett's Own Track Record Actually Argues the Opposite",
    pillar: "authority", contentType: "authority", angle: "Comparison", format: "Whiteboard Format",
    funnelStage: "mofu", ctaType: M, conceptBucket: "proven", effort: "high",
    bodyBlack: "\"Don't put all your eggs in one basket\" is treated as universal risk-management wisdom.\nBuffett has argued the opposite for genuine experts: watch that one basket closely and concentrate on what you deeply understand, rather than diluting attention across many baskets you understand less well.\nMy take: diversification protects you from what you don't understand. Concentration rewards you for what you understand deeply. The proverb is right for a generalist -- it's actually costly advice for a specialist.\nKnow honestly which one you are in your niche before deciding which advice applies.\nComment \"BASKET\" and I'll send you how I decide when to concentrate vs diversify client focus.",
    bodyRed: "Draw \"diversify\" and \"concentrate\" as two boxes on the whiteboard, with \"generalist\" and \"specialist\" underneath each.",
    bodyGreen: "Comment prompt: \"Comment BASKET\".",
    ctaLine: "Comment BASKET and I'll send you how I decide when to concentrate vs diversify.",
  },
  {
    weekOffset: 49, sourceType: "Old proverb vs modern data", sourceRef: "The proverb \"first impressions last\" vs modern halo-effect research",
    title: "'First Impressions Last' Isn't Just Folk Wisdom -- Halo Effect Research Explains the Mechanism",
    pillar: "authority", contentType: "educational", angle: "Educational Tip / Hack", format: "Shot / Angle Changes",
    funnelStage: "tofu", ctaType: T, conceptBucket: "proven", effort: "low",
    bodyBlack: "\"First impressions last\" has been repeated for generations as simple advice.\nHalo effect research explains the actual mechanism: one strong early impression colors how every later interaction gets interpreted, favorably or unfavorably, regardless of its own individual merit.\nMy take: this means your first client interaction deserves a disproportionate share of your preparation effort, not an equal share with every interaction after it.\nThe old proverb had the conclusion right. The research explains exactly why.",
    bodyRed: "Change camera angle for the contrast between the proverb and the mechanism.",
    bodyGreen: "On-screen text: \"proverb -> mechanism\".",
    ctaLine: "Follow for more old wisdom explained by what the research actually says.",
  },
];
