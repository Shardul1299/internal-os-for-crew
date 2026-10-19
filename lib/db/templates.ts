// Seed templates (BRIEF §3.7 templates, §9, §11.8 of v3). Placeholders use {{double_braces}}.
export const TEMPLATES: { key: string; label: string; bodyMd: string }[] = [
  {
    key: "checkin_quarterly",
    label: "Quarterly check-in",
    bodyMd: `# Quarterly check-in — {{creator}}
60 minutes. Shared with the creator after.

## What shipped
Posted since the last check-in: {{shipped}}

## What landed
Credibility metrics (decision-maker comments, saves, shares, inbound, sign-ups) and brand feedback.

## Next-quarter calendar
Open the 8-week calendar together. The creator decides cadence and no-post weeks.

## Topic-filter review

## Filter re-score
Aesthetics · Taste · Personality, 1–5 each, one sentence.

## Tier recommendation
Signals only. Never follower counts.

## Roadmap
- Platform / audience:
- Own product or course:
- Speaking and press:
- Advisory / fund / board:

## Introductions logged
Best effort, no quota.
`,
  },
  {
    key: "checkin_roadmap",
    label: "Roadmap session",
    bodyMd: `# Roadmap — {{creator}}

| Area | Goal | Crew contribution | Status |
|---|---|---|---|
| Platform / audience | | | |
| Own product or course | | | |
| Speaking and press | | | |
| Advisory / fund / board | | | |
`,
  },
  {
    key: "checkin_pilot_end",
    label: "Pilot-end review",
    bodyMd: `# Pilot-end review — {{creator}}

The 90-day pilot ends {{pilot_ends_on}}.

## Filter re-score
## What the pilot shipped
## Brand feedback
## Recommendation
Partnership (24 months, exit window at 12) or part ways. Owner approves.
`,
  },
  {
    key: "checkin_exit_window",
    label: "Exit-window review",
    bodyMd: `# Exit-window review — {{creator}}

The exit window opens {{exit_window_at}}.

## Against the exit threshold
## What both sides want next
## Decision
`,
  },
  {
    key: "brand_feedback_5q",
    label: "Brand feedback — five questions",
    bodyMd: `1. How credible did the content feel to your audience? (1–5)
2. How well did the creator understand your product? (1–5)
3. How much qualified inbound did it drive? (1–5)
4. How smooth was working with Crew? (1–5)
5. How likely are you to run another campaign? (1–5)
`,
  },
  {
    key: "sow",
    label: "Statement of work",
    bodyMd: `# Statement of work

**Brand:** {{brand}}
**Campaign:** {{title}}
**Type:** {{type}}
**Term:** {{term_starts_on}} to {{term_ends_on}}
**Pieces per month:** {{pieces_per_month}}

## Deliverables
{{deliverables}}

## Fees
Total: {{signed_total}} (exclusive of GST). Invoiced by OWLED.
- 50% advance on signature, due in 7 days.
- 50% balance on campaign completion, due in 7 days.
Nothing goes live without this SOW signed, a PO or email confirmation, and the advance received.

## Usage
{{usage}}
Maximum licence 12 months. Lifetime usage is not offered.

## Exclusivity
{{exclusivity}}

## Approvals
Claims and facts only, two rounds. Further revisions are priced case by case.
The creator keeps editorial veto on claims and chooses their no-post weeks.

## Disclosure
Every post carries the platform's paid-partnership label and #ad, per ASCI (and FTC where applicable).

## Cancellation
Kill fee: 50% after script approval, 100% after production. Late payment: 1.5% per month.

## Retainer pause
One 30-day pause per year on retainers; exclusivity continues during the pause.
`,
  },
  {
    key: "usage_addendum",
    label: "Usage addendum",
    bodyMd: `# Usage addendum
Licence: {{usage_kind}} for {{usage_days}} days from first post, on {{channels}}. Renewal priced at the then-current rung. No lifetime rights.
`,
  },
  {
    key: "exclusivity_addendum",
    label: "Exclusivity addendum",
    bodyMd: `# Exclusivity addendum
Scope: {{scope}} for {{days}} days. Priced at the Premium rung. Continues through any retainer pause.
`,
  },
  {
    key: "representation_agreement",
    label: "Representation agreement",
    bodyMd: `# Growth & Partnerships agreement — {{creator}}

Crew by OWLED is the creator's exclusive seller for brand partnerships. Crew handles brand inbound on the creator's behalf. Crew never posts, never schedules to a platform and never accesses the creator's accounts.

- Pilot: 90 days.
- Partnership: 24 months, with an exit window at 12 months.
- Commission: 20% on brands Crew brings; 15% on deals the creator brings.
- Upsell share: 3% of fees when another roster creator is added to a deal the creator brought.
- Referral share: 1.5% of a referred creator's first 10 deals.
- Payment: 50% of the creator's share within 5 business days of the brand's advance; the balance within 7 days of campaign completion.
- No minimum guarantee.
`,
  },
  {
    key: "program_mou",
    label: "Program MOU (LIT)",
    bodyMd: `# Owled Creator Program — MOU
48-hour anonymous-brief challenges for opted-in students across all three LIT programmes, when Crew has capacity. LIT applies its own age gate. Students' data is used only with consent. The LIT counterpart sees stage, Filter total and next shoot for opted-in students; no money and no tier.
`,
  },
  {
    key: "student_opt_in",
    label: "Student opt-in",
    bodyMd: `I opt in to the Owled Creator Program. I understand my submission will be judged by Crew and that I can withdraw at any time.
`,
  },
  {
    key: "challenge_brief",
    label: "48-hour challenge brief",
    bodyMd: `# 48-hour challenge

A real brand brief. The brand stays hidden until judging closes.

**The product:** {{product}}
**The audience:** {{audience}}
**The ask:** idea → shoot → edit, one short-form video.
**Submit:** your video link and a note of up to 100 words before the window closes. Late entries are not accepted.
`,
  },
  {
    key: "cpv_reframe_page",
    label: "CPV reframe page (quote PDF)",
    bodyMd: `# Why this isn't priced on views

Our creators are paid for credibility, not reach. The people who buy AI tools, developer tools and enterprise software decide on trust: who explained it well, who has shipped, whose taste they follow.

A cost-per-view comparison prices a credible operator like a meme account. It misses the metrics that move pipeline:

- decision-maker comments,
- saves and shares,
- inbound to your team,
- tracked sign-ups.

Every report we send leads with those numbers. Impressions are included, last.
`,
  },
  {
    key: "month_end_onepager",
    label: "Month-end one-pager",
    bodyMd: `# Month-end — {{month}}
Generated on the 1st. Roster, pipeline, money, payouts, declined log, exceptions, retention, Program.
`,
  },
  {
    key: "inbox_decline",
    label: "Inbox decline",
    bodyMd: `Thanks for reaching out about {{creator}}. This one isn't a fit for us right now, so we'll pass. We'd be glad to hear about future campaigns.

— Crew by OWLED, on behalf of {{creator}}
`,
  },
  {
    key: "self_serve",
    label: "Self-serve template (below minimum)",
    bodyMd: `Below our ₹25,000 minimum we don't run a managed deal. Here's a simple self-serve agreement you can use directly with the brand: scope, one round of claims approval, 50% upfront, disclosure, no lifetime rights.
`,
  },
];
