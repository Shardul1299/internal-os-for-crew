// Oct 2026 content batch: 30 scripts (25 individual + a 5-part signature
// series), built from the crisp-script craft rules in lib/reference.ts
// (SCRIPT_CRAFT_RULES) after a research pass on high-engagement short-form
// scripting. Mix: TOFU 15 / MOFU 10 / BOFU 5, effort low 10 / default 10 /
// high 10 (the 5-part series + 5 other scripts), all 12 filming formats
// covered at least once. Ordered for weekly posting starting 2026-10-07.

export type BatchEffort = "low" | "default" | "high";

export type BatchScript = {
  weekOffset: number; // weeks after BASE_DATE
  title: string;
  pillar: "authority" | "journey";
  contentType: "educational" | "storytelling" | "authority";
  angle: string;
  format: string;
  funnelStage: "tofu" | "mofu" | "bofu";
  ctaType: "follow" | "engagement" | "manychat" | "none";
  conceptBucket: "proven" | "double_down" | "experimental";
  effort: BatchEffort;
  seriesName?: string;
  bodyBlack: string;
  bodyRed: string;
  bodyGreen: string;
  ctaLine: string;
};

export const BASE_DATE = "2026-10-07";
export const BATCH_TAG = "oct_2026_batch_v1";

export const OCT_2026_BATCH: BatchScript[] = [
  {
    weekOffset: 0,
    title: "3 Levels of Market Research",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Shot / Angle Changes",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "Level 1: Googling your competitors. Everyone does this. It tells you nothing you can act on.\nLevel 2: Interviewing 10 people in your target market. Better -- now you have real objections to solve for.\nLevel 3: Running a $500 test campaign before you build anything. This is the only level that tells you if people will actually pay.\nMost founders stop at Level 1 and wonder why their launch flops.",
    bodyRed:
      "Change camera angle every ~2 seconds as each level is introduced -- wide shot for L1, closer for L2, tightest for L3.\nHold up one finger per level, count up on screen.",
    bodyGreen:
      "On-screen text: \"LEVEL 1 / 2 / 3\" stamped as each is introduced.\nBold on-screen number for \"$500\" when it appears.\nEnd card: \"Which level are you actually at?\"",
    ctaLine: "Follow for the exact interview questions I use at Level 2.",
  },
  {
    weekOffset: 1,
    title: "Why Most MSMEs Fail Their First Market Entry (3-Step Framework)",
    pillar: "authority",
    contentType: "educational",
    angle: "Framework / Formula / Acronym",
    format: "Whiteboard Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "87% of the MSMEs I've audited make the same 3 mistakes entering a new market. Here's the framework that fixes all three.\nStep 1: Beachhead first. Pick ONE narrow segment to dominate before you touch a second. Spreading thin is the #1 killer, not competition.\nStep 2: Price for that market's purchasing power, not your home market's. I've seen founders lose 40% of potential customers on price alone.\nStep 3: Map your 3 closest local competitors before you launch, not after. If you can't name them, you're not ready.\nGet the beachhead segment right and steps 2 and 3 get dramatically easier.",
    bodyRed:
      "Write each step on the whiteboard as you say it, numbered 1-2-3.\nCircle \"87%\" and underline \"beachhead\" for emphasis.",
    bodyGreen:
      "On-screen text reinforcing each number (87%, 40%) as spoken.\nZoom in on the whiteboard for the final 3-step recap.",
    ctaLine: "Follow for the full beachhead-selection checklist next week.",
  },
  {
    weekOffset: 2,
    title: "Rate These 5 Market-Entry Mistakes 1-10",
    pillar: "authority",
    contentType: "educational",
    angle: "Myth Bust / Common Mistake",
    format: "Reaction Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "experimental",
    effort: "low",
    bodyBlack:
      "Mistake 1: launching in a new country with zero local partner. That's a 9 out of 10 -- it's killed more expansions than bad products ever have.\nMistake 2: copy-pasting your home-market pricing. 7 out of 10 -- purchasing power isn't the same everywhere.\nMistake 3: skipping the regulatory check. 10 out of 10. I've seen a 6-month launch delay from this alone.\nMistake 4: no local competitor mapping. 6 out of 10 -- fixable fast if you catch it early.\nMistake 5: underbudgeting for legal setup. 8 out of 10.",
    bodyRed:
      "React to each clip/stat card with genuine reaction (wince, nod) as if watching real footage.\nHold up a number card (or on-screen graphic) for each rating.",
    bodyGreen:
      "On-screen scoreboard tallying up as each mistake is rated.\nFreeze-frame + rating number stamp after each line.",
    ctaLine: "Follow if you want the full regulatory checklist next.",
  },
  {
    weekOffset: 3,
    title: "The Psychology Behind Why Customers Overpay for Local Brands",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Voiceover Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "There's a real psychological reason a local brand can charge more than a cheaper import -- and it isn't only \"trust.\"\nIt's called the mere-exposure effect: the more familiar something feels, the safer it feels to buy, even if nothing about the product changed.\nThat's why a foreign brand's FIRST job in a new market isn't selling -- it's becoming familiar. Repetition before conversion.\nI've watched founders skip this and wonder why a technically-better product loses to a \"worse\" local option that's everywhere, full stop.\nIf you're entering a new market, budget for familiarity first, sales second.",
    bodyRed: "No on-camera talking -- voiceover only.\nCut to relevant b-roll for each beat.",
    bodyGreen:
      "B-roll: a busy local storefront, a repeated ad appearing multiple times, a side-by-side product comparison.\nOn-screen text: \"mere-exposure effect\" defined briefly on screen.",
    ctaLine: "Follow -- more psychology behind buying decisions every week.",
  },
  {
    weekOffset: 4,
    title: "I Failed My Entrance Exams at 18 -- Here's What Happened Next",
    pillar: "journey",
    contentType: "storytelling",
    angle: "My Story",
    format: "Voiceover Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "high",
    bodyBlack:
      "At 18, I failed my entrance exams. Not a near-miss -- a real, public failure, the kind everyone around you finds out about.\nFor a few months I didn't leave much. I didn't know what came next, and everyone I knew had a plan except me.\nThen I picked up a case study book that had been sitting on a shelf since 4th grade, and I read it cover to cover in a week.\nThat book is the reason Upforge exists. Two years later: 30+ clients, 15 industries, 6 countries. Started from a failed exam and an old book.\nIf you're in the middle of your own version of that -- the plan not working, everyone else seeming ahead -- I want you to see this.",
    bodyRed:
      "Use real photos/footage from that period of your life where possible -- not generic stock stand-ins.\nSlow zoom on the case-study book if you still have it.",
    bodyGreen:
      "On-screen text: \"18 years old\" then later \"2 years later: 30+ clients, 15 industries, 6 countries.\"\nIf real historical photos/footage from around age 18 exist, use them here -- that's what makes this land as real instead of staged.",
    ctaLine: "Follow to see the rest of the build -- from that failed exam to today.",
  },
  {
    weekOffset: 5,
    title: "How to Enter an Industry: D2C & FMCG (Ep. 1/5)",
    pillar: "authority",
    contentType: "authority",
    angle: "Framework / Formula / Acronym",
    format: "Whiteboard Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "high",
    seriesName: "How to Enter an Industry",
    bodyBlack:
      "In FMCG, the #1 killer isn't competition. It's distribution.\nYou can build a great product and still lose -- because you're not on the shelf, physical or digital, where the buying decision actually happens.\nHere's the framework: first, pick ONE channel to dominate -- quick-commerce, modern trade, or general trade -- not all three at once.\nSecond, price for shelf economics, not only your margin -- retailers and platforms take a cut before the customer ever sees your price.\nThird, budget 90 days of pure distribution-building before you spend a rupee on brand marketing. Nobody discovers a product that isn't there to find.\nThis is episode 1 of 5 -- next week: SaaS, and why the FMCG playbook completely breaks there.",
    bodyRed:
      "Draw the 3-step framework on the whiteboard, one step at a time.\nUnderline \"distribution\" heavily -- it's the core insight of this episode.",
    bodyGreen:
      "On-screen text: \"EPISODE 1/5\" badge in corner throughout.\nSeries title card at the start: \"How to Enter an Industry.\"",
    ctaLine: "Follow so you don't miss episode 2 -- SaaS, next week.",
  },
  {
    weekOffset: 6,
    title: "How to Enter an Industry: SaaS (Ep. 2/5)",
    pillar: "authority",
    contentType: "authority",
    angle: "Framework / Formula / Acronym",
    format: "Whiteboard Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "high",
    seriesName: "How to Enter an Industry",
    bodyBlack:
      "Episode 2: SaaS. Everything from last week's FMCG playbook gets flipped here -- distribution matters less than activation.\nThe #1 killer in SaaS market entry isn't lack of interest -- it's a free trial nobody finishes because the \"aha moment\" comes too late.\nThe framework: map the exact action a user takes right before they'd say \"I get it now,\" then redesign onboarding so that action happens in under 5 minutes.\nSecond: price on the value metric your buyer already tracks internally -- seats, usage, or outcomes -- never a generic flat tier that doesn't map to how they think about cost.\nComment \"SAAS\" and I'll send you the 5-minute activation audit template we use with SaaS clients entering a new market.",
    bodyRed:
      "Draw the \"time to aha moment\" timeline on the whiteboard, marking the 5-minute target.\nCircle the value metric example as you explain pricing.",
    bodyGreen: "On-screen text: \"EPISODE 2/5\" badge.\nComment prompt: \"Comment SAAS\".",
    ctaLine: "Comment SAAS and I'll send you the 5-minute activation audit template.",
  },
  {
    weekOffset: 7,
    title: "How to Enter an Industry: Healthcare & MedTech (Ep. 3/5)",
    pillar: "authority",
    contentType: "authority",
    angle: "Framework / Formula / Acronym",
    format: "Whiteboard Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "high",
    seriesName: "How to Enter an Industry",
    bodyBlack:
      "Episode 3: Healthcare and MedTech -- the industry where the regulatory window isn't a footnote, it's the entire timeline.\nThe #1 killer here is founders budgeting for a 3-month launch when the real regulatory approval window is 9 to 18 months, depending on the device or claim class.\nThe framework: work backward from the approval timeline first, THEN build your go-to-market calendar around it -- never the reverse.\nSecond: your first real customer isn't the patient, it's the compliance officer or procurement lead who has to sign off before a patient ever sees your product.\nComment \"HEALTH\" and I'll send you the regulatory-timeline worksheet we use to reverse-engineer a realistic launch date.",
    bodyRed:
      "Draw a long timeline on the whiteboard specifically to visually contrast with the shorter SaaS timeline from last episode.\nMark \"9-18 months\" clearly on the timeline.",
    bodyGreen: "On-screen text: \"EPISODE 3/5\" badge.\nComment prompt: \"Comment HEALTH\".",
    ctaLine: "Comment HEALTH and I'll send you the regulatory-timeline worksheet.",
  },
  {
    weekOffset: 8,
    title: "How to Enter an Industry: Fashion & Retail (Ep. 4/5)",
    pillar: "authority",
    contentType: "authority",
    angle: "Framework / Formula / Acronym",
    format: "Whiteboard Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "high",
    seriesName: "How to Enter an Industry",
    bodyBlack:
      "Episode 4: Fashion and Retail -- the industry where trend-timing kills more launches than product quality ever does.\nThe #1 killer: founders design a full collection before validating a single style with real local buyers, then discover the trend already peaked by the time they launch.\nThe framework: launch with a 3-piece capsule, not a full collection -- test which piece sells before you commit inventory capital to the rest.\nSecond: local sizing and fit data matters more than global trend data -- a size chart built for one region will quietly kill conversion in another.\nComment \"FASHION\" and I'll send you the 3-piece capsule-testing template we use before a full collection launch.",
    bodyRed:
      "Sketch a simple 3-piece capsule on the whiteboard vs a crossed-out \"full collection.\"\nPoint to the sizing note as a specific, easy-to-miss detail.",
    bodyGreen: "On-screen text: \"EPISODE 4/5\" badge.\nComment prompt: \"Comment FASHION\".",
    ctaLine: "Comment FASHION and I'll send you the 3-piece capsule-testing template.",
  },
  {
    weekOffset: 9,
    title: "How to Enter an Industry: Renewable Energy & CleanTech (Ep. 5/5, Finale)",
    pillar: "authority",
    contentType: "authority",
    angle: "Framework / Formula / Acronym",
    format: "Whiteboard Format",
    funnelStage: "bofu",
    ctaType: "manychat",
    conceptBucket: "proven",
    effort: "high",
    seriesName: "How to Enter an Industry",
    bodyBlack:
      "Episode 5, the finale: Renewable Energy and CleanTech -- where the real customer often isn't a consumer at all, it's a government incentive program or a utility contract.\nThe #1 killer: founders build a pitch for the end-user when the actual buying decision sits with a policy body or a B2B utility partner with a completely different sales cycle.\nThe framework: map the incentive and subsidy landscape FIRST -- it often decides your pricing and your real total addressable market before you've written a single line of marketing.\nSecond: your sales cycle here is measured in quarters, not weeks -- budget cash runway accordingly, or partner with someone who already has the relationships to shortcut it.\nThat's the series -- 5 industries, 5 playbooks, one underlying pattern: know exactly who the real buyer is before you build anything for them.\nIf you're entering any of these 5 industries and want the full playbook for yours specifically, comment \"ENTRY\" and I'll DM you next steps.",
    bodyRed:
      "Whiteboard recap: quickly flip back through mini-summaries of all 5 episodes' core insight, ending on this one.\nEnd on a direct, still shot -- no more writing, only you speaking to camera for the CTA.",
    bodyGreen:
      "On-screen text: \"EPISODE 5/5 -- FINALE\" badge.\nEnd card summarizing all 5 industries covered in the series.\nComment prompt: \"Comment ENTRY\".",
    ctaLine: "Comment ENTRY and I'll DM you the full playbook for your specific industry.",
  },
  {
    weekOffset: 10,
    title: "Old Me vs New Me: Pricing a Consulting Project",
    pillar: "authority",
    contentType: "educational",
    angle: "Do vs Don't (Right vs Wrong)",
    format: "Clone Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "Old me: quoted a flat fee without scoping the regulatory work first.\nNew me: I price in 3 layers -- discovery, execution, and a built-in complexity buffer.\nOld me ate a $40,000 overrun because of that one gap.\nNew me hasn't missed a scope in two years.",
    bodyRed:
      "Clone effect: two versions of yourself side by side, \"Old Me\" left, \"New Me\" right, mirrored poses.\nOld Me looks uncertain/shrugging; New Me holds up 3 fingers for the 3 layers.",
    bodyGreen:
      "Labels above each clone: \"OLD ME\" / \"NEW ME\".\nOn-screen text overlay: \"$40,000 overrun\" when mentioned.",
    ctaLine: "Follow for how I scope the complexity buffer.",
  },
  {
    weekOffset: 11,
    title: "Consulting Industry Insider: What Big Firms Won't Tell Small Founders",
    pillar: "authority",
    contentType: "educational",
    angle: "Myth Bust / Common Mistake",
    format: "Talking Back & Forth",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "Naive character: \"I need a big consulting firm, they have the most experience.\"\nSmart character: \"Big firms staff your project with a first-year analyst who's never run a market entry -- the partner you met is billing 3 other clients.\"\nNaive character: \"But they have all the frameworks.\"\nSmart character: \"Frameworks are public. What you're actually paying for is judgment from someone who's done YOUR specific problem before -- ask who on the team has, by name.\"",
    bodyRed:
      "Two characters, same actor, alternating sides of frame or quick cuts between positions.\nNaive character leans back, confident; Smart character leans in, direct.",
    bodyGreen:
      "Lower-third labels: \"NAIVE FOUNDER\" / \"REALITY\".\nOn-screen text: \"Ask: who on the team has done THIS before?\"",
    ctaLine: "Follow for more of what the consulting industry doesn't say out loud.",
  },
  {
    weekOffset: 12,
    title: "Starting From Scratch: If I Reset Upforge to Zero Clients Today",
    pillar: "authority",
    contentType: "authority",
    angle: "Challenge",
    format: "Setting Changes",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "experimental",
    effort: "high",
    bodyBlack:
      "If Upforge had zero clients tomorrow, here's exactly what I'd do in week 1, with everything I know now.\nDay 1: I would not touch outreach. I'd interview 10 people in my target niche and write down their exact words for their problem.\nDay 3: I'd price my first engagement at half my current rate, in exchange for a detailed case study -- one client, done properly, beats five rushed ones.\nDay 7: I'd publish that first case study everywhere I could, because proof beats pitching every time at zero clients.\nThe version of me with zero clients had none of the shortcuts I have now. This is the actual plan, not the polished story.",
    bodyRed:
      "Switch physical setting for each \"day\" -- a desk for Day 1, a laptop/call setup for Day 3, a phone/social post view for Day 7.\nNumber cards visible in each setting: \"DAY 1,\" \"DAY 3,\" \"DAY 7.\"",
    bodyGreen:
      "On-screen text for each day marker.\nFinal on-screen recap: \"Day 1 / 3 / 7\" summary card.",
    ctaLine: "Follow -- I'm documenting the real version of this, not the highlight reel.",
  },
  {
    weekOffset: 13,
    title: "3 Signs a Market Isn't Ready for You Yet",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Voiceover Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "Sign 1: nobody in that market can name a competitor to you. That's not opportunity, that's an unproven category.\nSign 2: your target customer's spending is going down, not up, over the last 2 years.\nSign 3: the regulatory approval window is longer than your runway. Simple as that.\nAny one of these isn't a dealbreaker. All three together means wait.",
    bodyRed: "No on-camera talking -- pure voiceover.\nCamera stays on relevant b-roll only.",
    bodyGreen:
      "B-roll: market charts trending down, a calendar flipping for \"approval window,\" a blank competitor slide.\nOn-screen text for each of the 3 signs as they're said.",
    ctaLine: "Follow for the market-readiness checklist I actually use with clients.",
  },
  {
    weekOffset: 14,
    title: "Do vs Don't: Pitching Your Business to Investors",
    pillar: "authority",
    contentType: "educational",
    angle: "Do vs Don't (Right vs Wrong)",
    format: "Setting Changes",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "Don't: open your pitch with your product features. Investors have heard a thousand feature lists.\nDo: open with the specific, sized problem -- a number, a market gap, a cost people are already paying.\nDon't: say \"we have no competitors.\" That tells an investor you haven't researched the market.\nDo: name your 3 closest competitors and say exactly why you win against each one.\nDon't: end with \"any questions?\" Do: end with the exact ask -- amount, use of funds, timeline.",
    bodyRed:
      "Switch physical location for each Do/Don't pair -- office for \"Don't,\" clean pitch-deck setup for \"Do.\"\nSlight tonal shift: flatter delivery for \"Don't,\" energized for \"Do.\"",
    bodyGreen:
      "On-screen text: \"DON'T\" in red, \"DO\" in green for each pair.\nZoom on the specific numbers/asks mentioned.",
    ctaLine: "Follow for the full pitch structure I coach clients through.",
  },
  {
    weekOffset: 15,
    title: "Rate My Own Biggest Pricing Mistake",
    pillar: "authority",
    contentType: "educational",
    angle: "Myth Bust / Common Mistake",
    format: "Reaction Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "I'm rating my own biggest mistake this time: quoting a flat $180,000 fee without scoping regulatory work. 10 out of 10, most expensive lesson I've had.\nHere's exactly what I missed: I scoped execution, not discovery. Two entirely different costs.\nIf you've made a pricing mistake like this, comment \"PRICE\" and I'll walk you through how I fixed it.",
    bodyRed:
      "React to your own past invoice/quote on screen, visibly wincing.\nHold up the \"10/10\" card yourself this time.",
    bodyGreen:
      "On-screen text: \"$180,000 quote\" bolded.\nComment prompt graphic: \"Comment PRICE\".",
    ctaLine: "Comment PRICE and I'll walk you through exactly how I fixed my pricing model.",
  },
  {
    weekOffset: 16,
    title: "How I Price a Market-Entry Engagement (Real Framework)",
    pillar: "authority",
    contentType: "educational",
    angle: "Framework / Formula / Acronym",
    format: "Visual Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "My pricing has 3 layers, and I show every client the math up front.\nLayer 1: Discovery -- fixed fee, covers research and the beachhead decision.\nLayer 2: Execution -- fixed fee, covers the actual go-to-market plan and rollout support.\nLayer 3: Complexity buffer -- this is the one most consultants skip, and it's why they eat cost overruns. I size it based on regulatory and logistics risk specific to that market.\nComment \"PRICING\" and I'll send you the exact template I use to size Layer 3.",
    bodyRed:
      "Use physical props: 3 stacked cards or blocks, one per layer, building up as you explain.\nHold up the \"complexity buffer\" card separately, tap it for emphasis.",
    bodyGreen:
      "On-screen text labeling each layer as it's introduced.\nComment prompt graphic: \"Comment PRICING\".",
    ctaLine: "Comment PRICING and I'll send you the exact Layer 3 sizing template.",
  },
  {
    weekOffset: 17,
    title: "The $40,000 Pricing Mistake That Nearly Broke My Business",
    pillar: "journey",
    contentType: "storytelling",
    angle: "Loss Story",
    format: "Voiceover Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "high",
    bodyBlack:
      "Three years ago I quoted a flat $40,000 fee for a market-entry project without scoping the regulatory work first.\nTwo months in, the regulatory piece alone would've cost more than the entire project fee. I had two choices: eat the loss, or go back and ask the client for more money.\nI ate the loss. It nearly wiped out Upforge's runway for that quarter, and for a few weeks I genuinely didn't know if we'd recover from it.\nWhat I built after that is the 3-layer pricing model I still use today -- discovery, execution, and a complexity buffer sized to the specific market's risk.\nI haven't missed a scope like that since. Comment \"SCOPE\" and I'll walk you through exactly how the complexity buffer is calculated.",
    bodyRed:
      "No on-camera talking -- voiceover carries the emotional weight, paired with real b-roll if available (an old invoice, a calendar from that period).\nLet a beat of silence sit after \"I ate the loss\" before continuing.",
    bodyGreen:
      "On-screen text: \"$40,000\" bolded at the start, \"3-layer pricing model\" at the resolution.\nComment prompt: \"Comment SCOPE\".",
    ctaLine: "Comment SCOPE and I'll walk you through exactly how I calculate the complexity buffer now.",
  },
  {
    weekOffset: 18,
    title: "Founder Red Flags vs Green Flags",
    pillar: "authority",
    contentType: "educational",
    angle: "Do vs Don't (Right vs Wrong)",
    format: "Multitasking Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "Red flag: a founder who wants to enter 5 countries at once. Green flag: one that picks one country and commits.\nRed flag: \"we'll figure out pricing later.\" Green flag: pricing tested before the product's even finished.\nRed flag: no one on the team has actually lived in the target market. Green flag: at least one advisor who has.",
    bodyRed:
      "Deliver this while doing a real task in frame (making coffee, packing a bag) -- casual, unscripted energy.\nNatural pause on each \"green flag\" line, look at camera.",
    bodyGreen:
      "Small red/green icon overlay next to each line.\nLower-third text summarizing each flag pair.",
    ctaLine: "Follow for more of these before you make the same mistakes.",
  },
  {
    weekOffset: 19,
    title: "The Framework I Use to Decide If a Market Is Worth Entering",
    pillar: "authority",
    contentType: "educational",
    angle: "Framework / Formula / Acronym",
    format: "Whiteboard Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "Before I let a client spend a rupee on a new market, it has to pass 3 filters.\nFilter 1: Is the total addressable market at least 10x your current revenue? If not, the upside doesn't justify the risk.\nFilter 2: Can you reach that market through a channel you already understand? New market AND new channel at once is how most expansions die.\nFilter 3: Is there a regulatory or logistics reason this market is HARDER to enter than it looks? If yes, that's often the moat protecting it -- and your opportunity.\nThree filters. If a market fails even one, I tell clients to wait.",
    bodyRed:
      "Draw a 3-box filter diagram on the whiteboard, filling each box as you explain it.\nCircle \"10x\" for emphasis.",
    bodyGreen:
      "On-screen text reinforcing \"10x\" and each filter name.\nFinal shot: whiteboard fully filled, all 3 filters visible.",
    ctaLine: "Follow -- next week I'm breaking down Filter 3 with a real client example.",
  },
  {
    weekOffset: 20,
    title: "3 Questions I Ask Before Taking a New Client",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Q&A Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "Question 1: \"What have you already tried?\" If the answer is nothing, I know we're starting from zero.\nQuestion 2: \"What does success look like in 90 days?\" Vague answers are a red flag before we even start.\nQuestion 3: \"Who else in your company needs to say yes?\" This tells me if the real decision-maker is even in the room.\nComment \"CLIENT\" if you want the full intake questionnaire I actually use.",
    bodyRed:
      "Off-camera interviewer asks each question, you answer directly to camera.\nSlight pause before each answer -- let the question land.",
    bodyGreen:
      "On-screen text for each question as it's asked.\nComment prompt overlay: \"Comment CLIENT\".",
    ctaLine: "Comment CLIENT for the full intake questionnaire.",
  },
  {
    weekOffset: 21,
    title: "3 Client Objections I Hear Most & How I Handle Them",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Q&A Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "\"Why not hire someone in-house instead?\" Because in-house takes 3-6 months to find and onboard -- I can start diagnosing this week.\n\"How do I know this will work for my industry?\" I show them 2-3 case studies from adjacent industries, not only mine, so they can judge the method, not only the track record.\n\"This feels expensive.\" I break the fee into a per-week cost against the number they told me they're losing by not fixing this -- the comparison usually answers the objection itself.\nComment \"OBJECTION\" and tell me yours -- I'll answer it here.",
    bodyRed:
      "Off-camera interviewer asks each objection as a real question, you respond directly and calmly.\nBrief pause before each response -- no rushed defensiveness.",
    bodyGreen: "On-screen text for each objection as it's read.\nComment prompt: \"Comment OBJECTION\".",
    ctaLine: "Comment OBJECTION with yours and I'll answer it in the comments.",
  },
  {
    weekOffset: 22,
    title: "What 30 Clients Across 15 Industries Taught Me About Market Entry",
    pillar: "journey",
    contentType: "storytelling",
    angle: "Lesson Story",
    format: "Voiceover Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "high",
    bodyBlack:
      "30-plus clients, 15 industries, 6 countries -- and the same one lesson keeps repeating no matter the industry.\nIt's never the product that fails a market entry. In every failure I've seen, it was a founder trying to enter 3 markets at once instead of proving one first.\nThe founders who won weren't the ones with the best product -- they were the ones disciplined enough to go narrow when everything in them wanted to go wide.\nI apply this to every new engagement now: before we talk strategy, we agree on the ONE segment we're not allowed to touch anything outside of for 90 days.\nComment \"NARROW\" and I'll send you the exact 1-page brief we use to lock that single segment before any strategy work starts.",
    bodyRed:
      "Voiceover over relevant b-roll -- a world map highlighting multiple countries, then narrowing to one.\nInclude real footage/photos from actual client work where possible, not generic stock.",
    bodyGreen:
      "On-screen text: \"30+ clients / 15 industries / 6 countries\" as opening stat.\nComment prompt: \"Comment NARROW\".",
    ctaLine: "Comment NARROW and I'll send you the 1-page brief we use to lock the segment before any strategy work.",
  },
  {
    weekOffset: 23,
    title: "Smart Founder vs Dumb Founder: Entering a New Country",
    pillar: "authority",
    contentType: "educational",
    angle: "Comparison",
    format: "Clone Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "Dumb founder: hires a local team before validating demand.\nSmart founder: runs a 4-week pilot with a single local distributor first.\nDumb founder: translates the website and calls it \"localization.\"\nSmart founder: rebuilds the offer around what that specific market actually values.",
    bodyRed:
      "Clone format -- Dumb Founder and Smart Founder as two versions of you, opposite reactions to each line.\nExaggerate Dumb Founder's confidence, Smart Founder's caution.",
    bodyGreen:
      "Split-screen labels: \"DUMB FOUNDER\" / \"SMART FOUNDER\".\nOn-screen text: \"4-week pilot\" bolded.",
    ctaLine: "Follow for the 4-week pilot structure I use with clients.",
  },
  {
    weekOffset: 24,
    title: "DIY Market Entry vs Hiring a Consultant",
    pillar: "authority",
    contentType: "educational",
    angle: "Comparison",
    format: "Green Screen Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "DIY: costs you nothing up front, but the average founder spends 4-6 months learning what a consultant already knows -- that's 4-6 months of runway.\nConsultant: costs money up front, but a good one has already made the expensive mistakes on someone else's dollar, not yours.\nDIY wins if: your market is simple, well-documented, and you have the time to learn it slowly.\nConsultant wins if: the regulatory or competitive complexity is high, or your runway can't absorb a 6-month learning curve.\nComment \"DIY\" or \"HIRE\" and I'll tell you honestly which one fits your situation.",
    bodyRed:
      "Green screen split -- DIY side with a cluttered spreadsheet/research graphic, Consultant side with a clean roadmap graphic.\nSwitch background as you switch between the two sides.",
    bodyGreen: "On-screen text: \"DIY\" vs \"CONSULTANT\" as headers.\nComment prompt: \"Comment DIY or HIRE\".",
    ctaLine: "Comment DIY or HIRE and I'll tell you honestly which fits your situation.",
  },
  {
    weekOffset: 25,
    title: "3 Numbers Every Founder Should Know Before Expanding",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Audio B-Roll + Text",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "experimental",
    effort: "low",
    bodyBlack:
      "On-screen text lines (no voiceover -- read by the viewer, timed to music):\n\"Number 1: Total addressable market size in your target city, not the whole country.\"\n\"Number 2: Average cart size for your category there -- not your home market's.\"\n\"Number 3: Days to regulatory approval. If it's longer than your runway, stop.\"",
    bodyRed:
      "No on-camera footage -- line-by-line image/video changes every 1-3 seconds.\nMatch each line to a relevant clip: a map zooming into one city, a receipt/cart graphic, a calendar counting days.",
    bodyGreen:
      "Bold, high-contrast on-screen text per line, emotional/driving background track.\nNo spoken audio at all -- text and music carry the whole video.",
    ctaLine: "Follow -- more numbers like this every week.",
  },
  {
    weekOffset: 26,
    title: "The Exact Process We Use for a Client's First 90 Days",
    pillar: "authority",
    contentType: "authority",
    angle: "Framework / Formula / Acronym",
    format: "Visual Format",
    funnelStage: "bofu",
    ctaType: "manychat",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "Every client goes through the same 90-day process, no exceptions -- here it is.\nDays 1-14: Discovery. We map the market, the regulatory landscape, and 3 closest competitors.\nDays 15-45: Beachhead plan. One narrow segment, priced and positioned specifically for it.\nDays 46-90: Launch and adjust. We track 3 metrics weekly and adjust the plan, not the goal.\nIf you want to see whether your business is ready for Day 1, comment \"90DAYS\" and I'll DM you the readiness checklist we use before we take on a new client.",
    bodyRed:
      "Use a physical 90-day timeline prop (a printed calendar or timeline board), point to each phase as you describe it.\nTap the timeline at \"Day 1\" and \"Day 90\" for emphasis.",
    bodyGreen:
      "On-screen text: \"DAY 1-14 / 15-45 / 46-90\" as each phase is introduced.\nComment prompt: \"Comment 90DAYS\".",
    ctaLine: "Comment 90DAYS and I'll DM you the readiness checklist we use before taking on a new client.",
  },
  {
    weekOffset: 27,
    title: "The 1 Question That Tells Me If a Founder Is Ready to Hire a Consultant",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Green Screen Format",
    funnelStage: "bofu",
    ctaType: "manychat",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "One question tells me everything: \"What happens if you don't fix this in the next 90 days?\"\nIf they can answer with a real number -- lost revenue, a missed deadline, a specific cost -- they're ready.\nIf the answer is vague, they're not ready yet, and I tell them that directly.\nIf you know your number, comment \"READY\" and I'll DM you the exact framework we use for a first 90 days.",
    bodyRed:
      "Green screen behind you showing a relevant graphic (a clock counting down, or a $ figure).\nDirect eye contact on the CTA line.",
    bodyGreen: "On-screen text: the question itself, large and bold.\nComment prompt: \"Comment READY\".",
    ctaLine: "Comment READY and I'll DM you the framework -- no pitch, just the process.",
  },
  {
    weekOffset: 28,
    title: "Before/After: A Client Who Nearly Failed Their Market Entry",
    pillar: "authority",
    contentType: "authority",
    angle: "Transformation",
    format: "Voiceover Format",
    funnelStage: "bofu",
    ctaType: "manychat",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "Before: a founder had already spent $60,000 trying to enter a new market with zero traction, 5 months in.\nWhat changed: we scrapped their broad 3-country launch and rebuilt around one city, one segment, with pricing reset to local purchasing power.\nAfter: first paying customers in 6 weeks, and a repeatable playbook they could now expand with market by market.\nIf you're 5 months into a stall like this one, comment \"STALL\" and I'll DM you the diagnostic we used to find what was actually broken.",
    bodyRed:
      "No on-camera talking -- voiceover over relevant b-roll.\nB-roll: a map showing 3 countries narrowing to 1 city, a \"week 6\" calendar marker, a small stack of invoices.",
    bodyGreen:
      "On-screen text: \"$60,000\" and \"6 weeks\" bolded when mentioned.\nComment prompt: \"Comment STALL\".",
    ctaLine: "Comment STALL and I'll DM you the exact diagnostic we used on this client.",
  },
  {
    weekOffset: 29,
    title: "If I Were Hired to Get a Founder Their First International Client in 60 Days",
    pillar: "authority",
    contentType: "authority",
    angle: "Transformation",
    format: "Whiteboard Format",
    funnelStage: "bofu",
    ctaType: "manychat",
    conceptBucket: "proven",
    effort: "high",
    bodyBlack:
      "If a founder hired me today with one goal -- first international client in 60 days -- here's the exact plan, no fluff.\nDays 1-10: I'd map the 5 companies most likely to buy, based on who's already paying a competitor for something adjacent, not who \"seems like a good fit.\"\nDays 11-30: One offer, one price, sent directly to a named decision-maker at each of those 5 -- not a mass outreach campaign, five specific pitches.\nDays 31-50: I'd expect 1-2 real conversations from those 5. This is where most people quit; this is where the actual deal gets built.\nDays 51-60: Close one. Not five -- one. The other four become your next 60-day list with warm context.\nThis is the exact plan we run with clients. Comment \"60DAYS\" and I'll DM you the 5-company scoring framework we use for Days 1-10.",
    bodyRed:
      "Draw the 60-day timeline on the whiteboard as a single line, marking each phase as you explain it.\nCircle \"5 companies\" and \"one\" for emphasis at the relevant beats.",
    bodyGreen: "On-screen text for each day range as it's introduced.\nComment prompt: \"Comment 60DAYS\".",
    ctaLine: "Comment 60DAYS and I'll DM you the 5-company scoring framework we use for Days 1-10.",
  },
];

// Extension batch: 15 more scripts, added after the first 30 held up against
// a self-audit run on SCRIPT_CRAFT_RULES (hedge-word scan, funnel/CTA
// matching). Continues the weekly cadence from week 30. Mix: TOFU 7 / MOFU 5
// / BOFU 3, effort low 5 / default 5 / high 5. No new series -- the
// signature series was delivered in the first 30.
export const OCT_2026_BATCH_EXT: BatchScript[] = [
  {
    weekOffset: 30,
    title: "3 Marketing Channels I'd Never Use to Enter a New Market",
    pillar: "authority",
    contentType: "educational",
    angle: "Myth Bust / Common Mistake",
    format: "Reaction Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "Channel 1: paid social with zero local audience data yet. 8 out of 10 wasted spend -- you're paying to learn what a free customer interview would've told you.\nChannel 2: influencer partnerships before you have a single case study. 7 out of 10 -- an influencer sells proof, and you don't have any yet.\nChannel 3: SEO content in a market where your customers don't search in English. 9 out of 10 -- wrong language, wrong channel, no traffic.",
    bodyRed:
      "React to each channel logo/graphic on screen with a visible wince or head shake.\nHold up the rating number card after each one.",
    bodyGreen:
      "On-screen channel logo/graphic for each one as it's named.\nFreeze-frame + rating stamp after each line.",
    ctaLine: "Follow for the 3 channels I'd actually start with instead.",
  },
  {
    weekOffset: 31,
    title: "3 Levels of Founder Focus",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Shot / Angle Changes",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "Level 1: working on whatever feels urgent today. Reactive, exhausting, rarely moves the business.\nLevel 2: working from a weekly priority list. Better -- but the list itself is rarely questioned.\nLevel 3: working on the ONE metric that unlocks the next stage of the business, and saying no to everything else that week.\nMost founders I meet are stuck switching between Level 1 and Level 2, and wonder why growth feels slow.",
    bodyRed:
      "Change camera angle every ~2 seconds as each level is introduced, same as the market-research levels format.\nHold up one finger per level.",
    bodyGreen:
      "On-screen text: \"LEVEL 1 / 2 / 3\" stamped per level.\nEnd card: \"Which level are you actually operating at this week?\"",
    ctaLine: "Follow for how I pick the ONE metric each week with clients.",
  },
  {
    weekOffset: 32,
    title: "Smart Marketer vs Dumb Marketer: Entering a New Market",
    pillar: "authority",
    contentType: "educational",
    angle: "Comparison",
    format: "Clone Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "Dumb marketer: runs the exact same ad creative that worked at home.\nSmart marketer: rebuilds the creative around what THIS market finds funny, urgent, or trustworthy -- those aren't universal.\nDumb marketer: measures success by impressions.\nSmart marketer: measures success by cost per qualified conversation, from day one.",
    bodyRed:
      "Clone format -- two versions of yourself, opposite reactions to each line.\nDumb Marketer shrugs confidently; Smart Marketer nods with a notebook in hand.",
    bodyGreen:
      "Split-screen labels: \"DUMB MARKETER\" / \"SMART MARKETER\".\nOn-screen text: \"cost per qualified conversation\" bolded.",
    ctaLine: "Follow for how I set up that metric before spending a rupee on ads.",
  },
  {
    weekOffset: 33,
    title: "The Finance Mistake That Kills Market Entry Budgets",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Voiceover Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "Most market-entry budgets die from one finance mistake, and it's not overspending.\nIt's building a single budget for the whole launch instead of splitting it into a test tranche and a scale tranche.\nThe test tranche should be small enough that losing all of it doesn't threaten the business -- its only job is proving the model works.\nThe scale tranche only gets released once the test tranche proves a specific number: cost to acquire a customer below what that customer is worth.\nFounders who skip this split either spend too cautiously to ever learn anything, or bet the whole budget on an unproven model.",
    bodyRed: "No on-camera talking -- voiceover only.\nCut to relevant b-roll for each beat.",
    bodyGreen:
      "B-roll: a budget spreadsheet splitting into two visible buckets, a simple bar chart of \"cost to acquire\" vs \"customer value.\"\nOn-screen text: \"test tranche\" / \"scale tranche\" labels.",
    ctaLine: "Follow -- next week I'm breaking down how I size the test tranche.",
  },
  {
    weekOffset: 34,
    title: "Do vs Don't: Building Your First Product for a New Market",
    pillar: "authority",
    contentType: "educational",
    angle: "Do vs Don't (Right vs Wrong)",
    format: "Setting Changes",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "Don't: translate your existing product's marketing and call it done. Do: rebuild the offer around the specific problem that market feels most urgently.\nDon't: assume the feature your home market loves most will matter here. Do: ask 10 local users what they'd pay for BEFORE you decide what to build first.\nDon't: launch every feature at once to \"look complete.\" Do: launch the one feature that solves the most urgent problem, and let the rest earn its place later.",
    bodyRed:
      "Switch physical location for each Do/Don't pair, same visual language as the investor-pitch Do/Don't video.\nFlatter delivery for \"Don't,\" energized for \"Do.\"",
    bodyGreen:
      "On-screen text: \"DON'T\" in red, \"DO\" in green for each pair.\nZoom on \"10 local users\" for emphasis.",
    ctaLine: "Follow for the 10-user interview script I use before any product decision.",
  },
  {
    weekOffset: 35,
    title: "The People-Psychology Trick Behind Every Successful Local Partnership",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Voiceover Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "high",
    bodyBlack:
      "Every local partnership I've seen work shares one thing, and it's not the contract terms.\nIt's called reciprocity priming: the partner who gives something real and useful BEFORE asking for anything gets dramatically better terms and faster trust than the one who leads with the pitch.\nI've watched two founders approach the exact same distributor -- one opened with \"here's a free market analysis of your current gaps,\" the other opened with a partnership deck. The first got a meeting in 3 days. The second waited 6 weeks for a reply.\nThis isn't about being generous for its own sake -- it's a specific, repeatable sequence: give something narrow and useful first, let them reciprocate the interest, THEN bring the ask.\nMost founders skip straight to the ask because it feels efficient. It's actually the slower path.",
    bodyRed:
      "No on-camera talking -- voiceover carries the explanation, paired with relevant b-roll (a handshake, two documents side by side).\nLet a brief pause sit after each contrasting outcome (\"3 days\" / \"6 weeks\") before continuing.",
    bodyGreen:
      "On-screen text: \"reciprocity priming\" defined briefly.\nOn-screen text: \"3 days\" vs \"6 weeks\" as a direct side-by-side stat.",
    ctaLine: "Follow -- more of the psychology behind deals that actually close.",
  },
  {
    weekOffset: 36,
    title: "The Hidden Financial Signal That Predicts If a Product Will Sell in a New Market",
    pillar: "authority",
    contentType: "educational",
    angle: "Framework / Formula / Acronym",
    format: "Whiteboard Format",
    funnelStage: "tofu",
    ctaType: "follow",
    conceptBucket: "proven",
    effort: "high",
    bodyBlack:
      "Before I trust any market-entry pitch, I check one number nobody talks about: the local savings rate.\nHere's why it predicts more than demand surveys ever do: a high-savings market will delay a purchase decision even when they want the product, because spending itself carries more psychological friction there.\nThat single number changes 3 things in a go-to-market plan: your pricing structure should favor installments over lump sums, your sales cycle should be budgeted longer than a low-savings market, and your messaging should lead with risk-reduction, not aspiration.\nI've watched two nearly identical product launches -- same category, same price -- succeed in one market and stall in another, and the savings-rate gap explained almost the entire difference.\nThis is the first number I pull before any client engagement starts.",
    bodyRed:
      "Draw a simple 2-column comparison on the whiteboard: high-savings market vs low-savings market, filling in each of the 3 changes.\nCircle \"savings rate\" at the top for emphasis.",
    bodyGreen:
      "On-screen text reinforcing each of the 3 changes as it's introduced.\nFinal shot: whiteboard fully filled, both columns visible side by side.",
    ctaLine: "Follow -- next week I'm walking through how to actually find this number for your target market.",
  },
  {
    weekOffset: 37,
    title: "The Marketing Channel Audit I Run Before Every Launch",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Green Screen Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "Before any client spends on marketing, I run 3 checks.\nCheck 1: where is this market's target customer already spending attention -- not where you assume, where the data says.\nCheck 2: which of those channels can you actually measure cost-per-conversion on, not only reach.\nCheck 3: which one channel, if it worked, would you double down on for the next 90 days.\nComment \"AUDIT\" and I'll DM you the 1-page channel scorecard we use for this.",
    bodyRed:
      "Green screen behind you showing a simple channel icon grid.\nDirect eye contact on the CTA line.",
    bodyGreen: "On-screen text: each of the 3 checks as it's said.\nComment prompt: \"Comment AUDIT\".",
    ctaLine: "Comment AUDIT and I'll DM you the 1-page channel scorecard.",
  },
  {
    weekOffset: 38,
    title: "How I Build a Go-to-Market Budget (Real Numbers)",
    pillar: "authority",
    contentType: "educational",
    angle: "Framework / Formula / Acronym",
    format: "Whiteboard Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "Every go-to-market budget I build has the same 3 buckets, in this order.\nBucket 1: validation spend -- small, fast, only proves the model. Usually 10-15% of the total budget.\nBucket 2: channel scale spend -- released only after validation hits its target number, not on a calendar date.\nBucket 3: a 20% reserve that stays untouched until week 8, because the first surprise always shows up by then.\nComment \"BUDGET\" and I'll send you the spreadsheet template with these 3 buckets built in.",
    bodyRed:
      "Draw the 3-bucket split on the whiteboard as a simple bar, filling in percentages as you explain.\nCircle \"20% reserve\" for emphasis.",
    bodyGreen: "On-screen text for each bucket and its percentage.\nComment prompt: \"Comment BUDGET\".",
    ctaLine: "Comment BUDGET and I'll send you the 3-bucket spreadsheet template.",
  },
  {
    weekOffset: 39,
    title: "3 Questions That Reveal If a Product Needs Localizing",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Q&A Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "Question 1: \"Does the core problem this product solves even exist here, or does this market solve it a completely different way already?\" If it's already solved differently, you need more than a translation.\nQuestion 2: \"Would a local competitor's version embarrass ours on price, speed, or trust?\" Any yes means localize before launch, not after.\nQuestion 3: \"What's the one feature a local user would consider non-negotiable that we don't have?\" That answer tells you exactly where to start.\nComment \"LOCALIZE\" and I'll send you the full localization checklist we run with product teams.",
    bodyRed:
      "Off-camera interviewer asks each question, you answer directly to camera.\nBrief pause before each answer -- let the question land.",
    bodyGreen: "On-screen text for each question as it's asked.\nComment prompt: \"Comment LOCALIZE\".",
    ctaLine: "Comment LOCALIZE and I'll send you the full localization checklist.",
  },
  {
    weekOffset: 40,
    title: "What Being a 19-Year-Old Founder Taught Me About Being Underestimated",
    pillar: "journey",
    contentType: "storytelling",
    angle: "Lesson Story",
    format: "Voiceover Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "high",
    bodyBlack:
      "At 19, I sat across from a client twice my age who asked, in the first five minutes, if I'd ever actually run a business.\nMy instinct was to defend myself -- list credentials, prove I belonged in the room. I didn't. I asked him what his last consultant got wrong instead.\nHe talked for ten minutes. Everything he described was a scoping problem, not an expertise problem -- exactly the failure mode I'd already built a process for.\nThe lesson: being underestimated isn't a disadvantage if you stop trying to out-argue it and start letting the work answer the question instead.\nI still get that same look in first meetings sometimes. I stopped defending against it years ago. Comment \"YOUNG\" and I'll tell you exactly how I handle it now.",
    bodyRed:
      "Voiceover over relevant b-roll -- an early photo from client meetings if available, or a simple two-chairs-at-a-table shot.\nLet a beat of silence sit after \"I didn't\" before continuing.",
    bodyGreen:
      "On-screen text: \"Age 19\" at the opening.\nComment prompt: \"Comment YOUNG\".",
    ctaLine: "Comment YOUNG and I'll tell you exactly how I handle that moment now.",
  },
  {
    weekOffset: 41,
    title: "The Product Decision That Cost Us a $25,000 Client",
    pillar: "journey",
    contentType: "storytelling",
    angle: "Loss Story",
    format: "Voiceover Format",
    funnelStage: "mofu",
    ctaType: "engagement",
    conceptBucket: "proven",
    effort: "high",
    bodyBlack:
      "We lost a $25,000 client over a decision that took us five minutes to make and should have taken five days.\nA client wanted us to skip the discovery phase and go straight to execution, to save time. We agreed, because saying no to a client that early felt risky.\nSix weeks in, the plan we built didn't fit their actual regulatory situation -- something discovery would have caught immediately. They pulled the engagement, and the fee went with it.\nWhat changed after that: discovery is no longer optional, ever, no matter how confident a client is that they don't need it. I tell every new client this story before they even ask to skip it.\nComment \"DISCOVERY\" and I'll send you the exact 5 questions discovery has to answer before we'll move to execution with anyone.",
    bodyRed:
      "No on-camera talking -- voiceover over relevant b-roll (a crossed-out project timeline, an old client email if usable).\nLet a pause sit after \"the fee went with it\" before continuing.",
    bodyGreen:
      "On-screen text: \"$25,000\" bolded at the opening.\nComment prompt: \"Comment DISCOVERY\".",
    ctaLine: "Comment DISCOVERY and I'll send you the 5 questions discovery has to answer before we move to execution.",
  },
  {
    weekOffset: 42,
    title: "The 1 Financial Number That Tells Me a Founder Is Ready to Scale",
    pillar: "authority",
    contentType: "educational",
    angle: "Educational Tip / Hack",
    format: "Multitasking Format",
    funnelStage: "bofu",
    ctaType: "manychat",
    conceptBucket: "proven",
    effort: "low",
    bodyBlack:
      "One number tells me if a founder is ready to scale: is your cost to acquire a customer trending down as you spend more, or up?\nTrending down means you've found a real, repeatable channel -- that's ready to scale.\nTrending up means you were riding a lucky early audience, and scaling now only scales the losses.\nIf you know your number and it's trending down, comment \"SCALE\" and I'll DM you the framework we use to size the next budget tranche.",
    bodyRed:
      "Deliver this while doing a real task in frame -- casual, unscripted energy, same as the red/green flags video.\nDirect look to camera on the CTA line.",
    bodyGreen: "On-screen text: the question itself, large and bold.\nComment prompt: \"Comment SCALE\".",
    ctaLine: "Comment SCALE and I'll DM you the framework we use to size the next budget tranche.",
  },
  {
    weekOffset: 43,
    title: "The Exact Budget Template We Build With Every New Client",
    pillar: "authority",
    contentType: "authority",
    angle: "Framework / Formula / Acronym",
    format: "Visual Format",
    funnelStage: "bofu",
    ctaType: "manychat",
    conceptBucket: "proven",
    effort: "default",
    bodyBlack:
      "Every client gets the same budget template on day one, no exceptions.\nRow 1: validation spend, capped and time-boxed.\nRow 2: the specific number validation has to hit before Row 3 unlocks.\nRow 3: scale spend, released only after Row 2 is hit.\nRow 4: a reserve that nobody touches until week 8.\nIf you want to see this template before your next launch, comment \"TEMPLATE\" and I'll DM it to you.",
    bodyRed:
      "Use a physical printed template or spreadsheet prop, point to each row as you explain it.\nTap Row 4 specifically for emphasis.",
    bodyGreen: "On-screen text for each row as it's introduced.\nComment prompt: \"Comment TEMPLATE\".",
    ctaLine: "Comment TEMPLATE and I'll DM you the exact budget template.",
  },
  {
    weekOffset: 44,
    title: "If I Were Hired to Fix a Failing Product Launch in 30 Days",
    pillar: "authority",
    contentType: "authority",
    angle: "Transformation",
    format: "Whiteboard Format",
    funnelStage: "bofu",
    ctaType: "manychat",
    conceptBucket: "proven",
    effort: "high",
    bodyBlack:
      "If a founder hired me today with a launch that's already failing, here's exactly what the first 30 days would look like.\nDays 1-5: stop all spend. Every dollar going to a channel you haven't proven yet is funding the failure faster, nothing else.\nDays 6-15: talk to 10 people who tried the product and didn't come back. Not surveys -- real conversations, and write down their exact words.\nDays 16-25: fix the ONE thing that came up in at least 6 of those 10 conversations. Not the loudest complaint -- the most repeated one.\nDays 26-30: relaunch to a small, specific audience first, and only scale spend again once that fix actually moves the number.\nThis is the exact triage process we run. Comment \"TRIAGE\" and I'll DM you the 10-conversation interview script we use for Days 6-15.",
    bodyRed:
      "Draw the 30-day timeline on the whiteboard as a single line, marking each phase.\nCircle \"10 people\" and \"6 of those 10\" for emphasis at the relevant beats.",
    bodyGreen: "On-screen text for each day range as it's introduced.\nComment prompt: \"Comment TRIAGE\".",
    ctaLine: "Comment TRIAGE and I'll DM you the 10-conversation interview script for Days 6-15.",
  },
];
