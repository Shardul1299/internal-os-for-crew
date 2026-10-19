# Snoball OS — working rules for Claude Code

Read BRIEF.md before any change. It is the spec; this file is how to work on it.

## Product rules you must never weaken
- Pricing never takes follower counts, impressions, CPV or CPM as inputs. If a task asks for it, stop and flag it.
- The Filter (aesthetics, taste, personality; 1–5 each + one sentence) is the first gate. No score or rule may override a Filter fail.
- Tier is internal and set by signals, never follower counts. It must not appear in any export, PDF, email, portal or brand/creator-facing view.
- The ladder has five rungs (−30/−15/0/+20/+50). Below Lucrative requires an Owner override. Lifetime usage is never selectable; usage terms are ≤ 365 days.
- Commission is computed from origin (15% creator-inbound, 20% otherwise); upsell (3%) and referral (1.5% × first 10 deals) shares are generated from Crew's commission, never typed by hand.
- NO list and blocklist block deals; only an Owner override with a reason passes one, and it is logged and counted.
- Nothing is scheduled or goes live without signed SOW + PO/email confirmation + advance received (or a logged override). Payouts are generated from receipts, never ahead of them.
- Crew handles brand inbound (Inbox) but never posts, schedules to a platform, or touches creator accounts. Do not build those features.
- There is no roster cap and no minimum guarantee. Do not add either.
- Thresholds, percentages and cadences are settings, not constants. All gates live in lib/rules/*; UI never re-implements a rule.

## Design rules
- Crew brand, HIG principles, text-minimal. Dark theme default (ink #0B0B0B, beige #F6E8CD, pink #FF409B for emphasis only), light theme secondary. Square corners, flat blocks, no shadows, no decorative colour.
- Heavy condensed uppercase headlines; plain sans body; tabular numerals.
- One title, one primary action per screen. No cards on content screens beyond the Block component, no coloured badges, no icon-only buttons except close/search/more, no helper paragraphs, no toast stacks.
- Use only components in components/ui (BRIEF §13.5). A new component needs a one-line justification in the PR.

## Engineering rules
- TypeScript strict. Zod schemas are the single source of truth for forms and server actions.
- Every write goes through a server action → lib/rules → db. No client-side writes. Portal routes are scoped by brand_id / creator_id at the query layer.
- Every gate row in BRIEF §4 and §5 has a unit test in tests/rules. A PR that changes a rule changes its test.
- Money is integer paise with currency; format with lib/format (Indian notation, ₹ L / ₹ Cr). Dates stored UTC, shown in Asia/Kolkata.
- Seed data matches BRIEF §12 exactly.
- Run `pnpm test && pnpm e2e` before calling a milestone done. Attach dark and light screenshots for UI changes.

## Creator Studio rules (v3)
- Studio is the creator's workspace. Never build posting, platform scheduling, auto-publish or account connection into it. Do not resurrect Upcreate's Publish screen.
- Every Studio query is scoped to the session's creator_id. Global starter rows are read-only and cloned before editing.
- Tier, Filter scores, rungs, commission, Crew notes and other creators never reach a Studio query, prompt or export (lib/rules/visibility).
- Studio follower/view numbers (Research, Results) never feed pricing, tier or any gate, and cross to Crew only as grey metadata.
- Every generator shows the assembled prompt and offers Generate and Copy prompt. Prompts use only the creator's own Profile and content.
- Keep the playbook logic intact when porting: 4-phase script scaffold, crisp-script rules, 3-phase Improver, 5x rule, ratio system, double-down A/B/C.
- One calendar (creator_calendar_items) and one metrics record per sponsored post. Never duplicate them between Desk and Studio.

## When unsure
Prefer the more restrictive reading of a rule, implement it, leave a `// BRIEF: clarify` comment. Never silently relax a gate.
