# Snoball OS — Product & Build Brief

**For:** Claude Code (drop this file into the repo root as `BRIEF.md`; the short `CLAUDE.md` at the end goes next to it)
**Owner:** Crew by OWLED — the talent division, a Snoball division with its own P&L
**Version:** 2.0 · 19 Oct 2026 · rebuilt on Shardul's decisions (see §18)
**v3.0 · 19 Oct 2026:** adds the creator side — **Creator Studio** (§19), **the seam** between both sides (§20) and the **Upcreate → Studio feature map** (§21). Nothing from v2.0 is removed. Every v3 addition is marked *(v3)*.
**Status:** Build-ready for v1

---

## 0. What this is

Snoball OS is the internal system of record for Crew. It manages creators across every stage from first sighting to roster and alumni, runs the **Owled Creator Program** (the LIT School pipeline) into that roster, assembles client campaigns from roster creators, handles brand inbound on creators' behalf, and encodes Crew's thesis — the Filter, the ladder, the NO list — so that the system, not a person under pressure, holds the line.

It is text-minimal and keyboard-friendly, one screen per job, built on Apple Human Interface Guidelines principles and dressed in the Crew brand: near-black base, beige type, pink used only for emphasis, heavy condensed headlines, square blocks. It should feel like a native Mac utility that happens to run in a browser.

**The one sentence:** *Snoball OS makes the right thing the default and the wrong thing impossible — without making anyone read a manual.*

### 0.0 Two sides, one system (v3)

| Side | Who | What |
|---|---|---|
| **Crew Desk** (our side) | Owner, Crew lead, Ops, Strategist, Interns, viewers | Everything in §1–§18: creators, the Filter, tiers, the Program, deals, the ladder, money, inbox, campaigns, retention, the brand portal. |
| **Creator Studio** (creator side) | Roster and Tier 0 creators | The Creator portal built out into the creator's own content workspace: Profile, the 8-week Calendar, Outlier Research, Hook Lab, Script Studio, Library, Carousels, Shoot, CTA & funnel, Prompt Library, Results — plus their deals, payouts, inbox and check-ins. Ported from the Upcreate app in this repo (§19, §21). |

Both sides share one database. The creator's calendar, deliverables, metrics, payouts and inbox threads are the same records on both sides; what each side can see is fixed in §20. Crew never posts; Studio helps the creator plan, research, write and shoot, and the creator posts themselves.

### 0.1 Non-negotiables the software must enforce

| # | Principle (from Crew's precedents and Shardul's decisions) | How the OS enforces it |
|---|---|---|
| 1 | **AI creators are paid for credibility, not reach. Never anchor pricing to CPV alone.** | The calculator has no CPV/CPM/follower input. Quotes are built from the creator's Standard × deliverable × rung ± add-ons. Follower counts appear only as grey metadata, never in pricing or tiering. |
| 2 | **The Filter — aesthetics, taste, personality — is the first gate and the last word.** | Every creator carries three 1–5 scores plus one sentence. Nobody leaves Scout without a Filter score; nobody enters a brand deal below the Filter threshold. No other score can override a Filter fail. |
| 3 | **Crew is a Growth & Partnerships partner, not a manager. It handles brand inbound but never posts.** | An Inbox module triages brand DMs/emails on the creator's behalf. There is no posting, scheduling-to-platform, comment or account-access feature anywhere. UI vocabulary: *partner / partnership / roster*, never *manage*. |
| 4 | **Crew is the exclusive seller for roster creators.** | Any deal attached to a roster creator must be a Crew deal; representation agreements record exclusivity; a brand owned by OWLED Social still routes through Crew when a roster creator is involved. |
| 5 | **No roster cap. Quality-gated. Demand decides the sub-category mix.** | No cap setting. Promotion to roster requires Filter re-score + tier-by-signal + Owner approval. Mix is reported, never enforced. |
| 6 | **Tiering is internal and set by signal, not follower count.** | Tier (T0–T3) is a field with signal evidence and review history. Crew lead proposes, Ayush approves, quarterly. Tier never appears in any export, PDF, email, portal or brand/creator-facing view. |
| 7 | **The ladder: five rungs per creator per deliverable; always negotiate toward the top.** | Each creator has their own Standard per deliverable. Rungs are −30% / −15% / 0 / +20% / +50%. Defaults: pilot opens at Standard, one-off at Pitch, annual/bulk closes at Lucrative, exclusivity at Premium. A quote below Lucrative needs an Owner override. |
| 8 | **Commission 20% on brands Crew brings, 15% on deals the creator brings; 3% upsell share to the originating creator; 1.5% referral on a referred creator's first 10 deals.** | Computed, not typed. Origin sets the rate; shares are generated as payout lines from Crew's commission. |
| 9 | **Retainers preferred. Push "3-month pilot minimum". Avoid "one post and see".** | Deal types: Pilot, Retainer, Quarterly (one rung down), Annual (Lucrative + exclusivity + 2 events + advisory), One-off (Pitch rung, reason required). |
| 10 | **NO list: rev-share-only, educational-without-pricing, barter, lifetime rights, shady AI tools. Blocklist: gambling/RMG, crypto, unregulated lending, political/religious.** | NO-list check at Lead → Qualified. Any flag blocks unless Ayush records an override with reason. House clients get no exception by default. Declined deals are logged with value and reported monthly. |
| 11 | **Content: 8-week calendars built together; creator decides cadence and no-post weeks; max 1 in 4 sponsored; claims-only approvals, 2 rounds.** | Calendar, anchor plan, topic filter and blackout weeks per creator. Blackouts are visible to brands but not contractual (warning, not block). Sponsored ratio and topic filter are hard blocks. |
| 12 | **50% advance; nothing live without signed SOW + PO/email confirmation + advance; creator paid 50% of their share within 5 days, balance within 7 days of campaign completion.** | Deliverables cannot reach *Scheduled/Live* without all three. Payout lines are generated automatically from receipts. No float. |
| 13 | **Central CRM, shared content tracker, pipeline view, creator performance dashboard — plus brand and creator portals in v1.** | The primary screens, plus two scoped portals. |
| 14 | **Retention > acquisition.** | Quarterly 60-minute check-ins with template; roadmap items; five-question brand survey after every campaign; quarterly NPS; shared with the creator. |
| 15 | *(v3)* **Crew helps creators make better content; it never makes or posts it for them.** | Creator Studio (§19) gives every T0 and roster creator the playbook tools — ratios, 5x outlier research, hook stacks, crisp-script rules, funnel-matched CTAs, double-downs. Studio has no publish, platform-scheduling or account-connection feature. |
| 16 | *(v3)* **The visibility wall.** | Studio never shows tier, Filter scores, rungs, commission, Crew notes or other creators. Crew never sees a creator's drafts, scripts or research unless the creator shares them or attaches them to a deliverable. Studio follower/view numbers never cross to Crew except as grey metadata (§20). |
| 17 | *(v3)* **One calendar, one set of metrics.** | The creator's Studio calendar *is* `creator_calendar_items`; sponsored items, blackouts and shoots live in it. Metrics logged in Studio Results for a sponsored post *are* the deliverable's metrics in the brand report. Nothing is entered twice. |

---

## 1. Users and roles

| Role | Who | Can |
|---|---|---|
| **Owner** | Ayush | Everything; approves overrides, tier changes and roster promotions; month-end one-pager. |
| **Crew lead** | Shardul | Full CRUD on creators, deals, campaigns, inbox; proposes tiers and overrides; runs check-ins. |
| **Ops** | Deal desk / finance liaison (hire TBD) | Payments ledger, invoices, PO references, calendars; read on deals. |
| **Strategist** | Shared with OWLED Social (TBD) | Calendars, topic filters, anchor plans, performance notes; read on deals. *(v3)* Proposes items on creators' Studio calendars; reads scripts creators share. |
| **Intern** | LIT interns (2 per cohort) | Scout/Watchlist research and data entry; Program scoring sheet as scribe; no money fields. |
| **Sales viewer** | OWLED / Snoball sales | Read on brands and pipeline (avoids channel conflict). |
| **Finance viewer** | OWLED finance | Payments module read; monthly reconciliation export. |
| **Program counterpart** | LIT EPIC Master / placements | Scoped read on Program records for opted-in students only. No money, no tier. |
| **Brand user** | Brand contacts on an active deal | Brand portal: their campaigns, deliverables, claim approvals, reports, invoices, feedback form. |
| **Creator user** | Roster and Tier 0 creators | Creator portal: calendar, deals and quotes, payouts, check-in notes, roadmap, brand inbound forwarded to them. *(v3)* The portal is **Creator Studio** (§19): Profile, Calendar, Research, Hook Lab, Scripts, Library, Carousels, Shoot, CTA & funnel, Prompts, Results. |

---

## 2. Information architecture

```
Snoball OS
├── Today           — what needs doing (blocked deliverables, deals awaiting PO/advance, inbox awaiting reply, check-ins, payouts, revisit dates)
├── Inbox           — brand inbound on behalf of creators (email/DM capture, triage, convert to deal, 24h SLA)
├── Creators        — Scout · Watchlist · Incubation (T0) · Roster · Alumni   (one list, stage as segmented filter)
│   └── Creator record (Overview · Filter & Tier · Rates · Calendar · Deals · Performance · Check-ins · Payments · Agreement)
├── Program         — Owled Creator Program: cohorts, 48-hour challenges, scoring, Sunday shoots, interns
├── Deals           — board · list · calculator
│   └── Deal record (Qualify · Brief · Match · Quote · Terms · Signature & PO · Money · Delivery · Report)
├── Campaigns       — brand campaigns composed of roster deliverables (shared content tracker)
├── Brands          — brand CRM (contacts, ownership, risk flags, history, feedback, NPS)
├── Portals         — Brand portal · Creator portal (scoped views of the same data)
│   └── Creator Studio (v3, §19) — the Creator portal, built out:
│       ├── Today       — due for Crew · next up · content mix · trending outliers · payouts · inbox · next check-in
│       ├── Profile     — brand foundation, ratios, credibility; onboarding on first run
│       ├── Calendar    — 8-week grid · board (idea → posted) · list · ratio meters · batch ideation · blackouts
│       ├── Research    — 5x outlier log · CSV import · keyword bank · deconstruction · topic/problem research
│       ├── Write       — Hook Lab · Scripts (authority, storytelling, series, raw idea, transcript→template) · Improve · Library
│       ├── Carousels   — generator · library
│       ├── Shoot       — filming formats · equipment · shot list · folder namer · Sunday shoots
│       ├── Funnel      — TOFU/MOFU/BOFU guide · distribution · captions · ManyChat copy
│       ├── Prompts     — every generator inline + reference library · Word export
│       ├── Results     — post log · credibility metrics · top/bottom 5 · double-down
│       └── Deals       — my deliverables · quotes (my fee) · payouts · forwarded inbox · check-ins · roadmap
└── Settings        — ladder & add-ons · deliverables · Filter rubric · NO list & blocklist · commission · templates · roles · audit
```

Global: `⌘K` command palette, global search with tokens, a right-hand **Inspector** for context without leaving the list.

---

## 3. Data model

Postgres. UUID keys. `created_at`, `updated_at`, `created_by` on every table; soft delete via `archived_at`. Money in integer paise with `currency` (INR default, USD supported; brand bears FX).

### 3.1 Creator

```
creators
  id, display_name, legal_name, email, phone, city, country, timezone
  stage            enum: scout | watchlist | incubation | roster | alumni | revisit | declined
  stage_changed_at, stage_reason, revisit_on
  tier             enum: T0 | T1 | T2 | T3 | null       -- internal only; by signal
  tier_proposed_by, tier_approved_by, tier_reviewed_at, tier_next_review_at
  sub_category     enum: ai_educator | builder_engineer | founder_operator | vc_analyst | enterprise_tech
  secondary_sub_category
  primary_platform enum: instagram | youtube | x | linkedin | newsletter | other   (default instagram)
  languages        text[]   (en, hinglish, ...)
  source           enum: program | frontseat | ayush_network | referral | inbound | outbound | event
  source_detail, referred_by_creator_id (nullable)
  is_employed_elsewhere bool, employer_disclosure_url
  is_founder bool, own_product_content_pct numeric      -- must be ≤ 70 to qualify
  is_pseudonymous bool, identity_verified_privately bool
  represented_elsewhere bool, representation_note        -- must be false to enter roster (exclusive)
  consent_status   enum: none | opted_in | withdrawn
  notes

creator_platforms
  creator_id, platform, handle, url, followers (grey metadata only), followers_as_of, is_primary

creator_filter_scores                      -- THE FILTER
  creator_id, scored_at, scored_by
  aesthetics int 1-5, taste int 1-5, personality int 1-5
  total int (computed), sentence text (required, ≤ 200 chars)
  context enum: scout | challenge | watchlist_review | incubation_review | roster_review | quarterly

creator_tier_signals                       -- evidence for tier, never follower counts
  creator_id, kind enum: inbound_founder | inbound_brand | speaking | podcast | press | newsletter_subs | community | prior_enterprise_deal | prior_vc_deal | advisory_role | other
  description, url, date, weight int 1-3

creator_evidence                           -- high-context proof (any of these counts)
  creator_id, kind enum: shipped_product | repo | employment | cited_by_practitioners | paper | benchmark | tutorial_series | other
  title, url, date

creator_standard_rates                     -- the creator's own Standard per deliverable (rung 0)
  creator_id, deliverable_key, standard_paise, currency, set_at, set_by, note

creator_agreement
  creator_id, pilot_started_on, pilot_ends_on (default +90d)
  partnership_started_on, partnership_ends_on (default +24m)
  exit_window_at (default +12m from partnership start), exit_threshold_md
  exclusive bool (true at roster), agreement_url, status enum: pilot | active | exit_window_open | exited

creator_topic_filters     creator_id, kind enum: category | competitor | claim | format | brand, value, reason, active
creator_anchor_plan       creator_id, anchor_format, cadence_note (creator decides), sponsored_ratio_max (default 0.25)
creator_blackouts         creator_id, starts_on, ends_on, note        -- creator-chosen; visible to brands; not contractual
creator_calendar_items    creator_id, date, kind enum: anchor | derivative | sponsored | organic | shoot | blackout, title, platform, status, deliverable_id, campaign_id
creator_checkins          creator_id, type enum: quarterly | strategy_refresh | roadmap | adhoc, due_on, held_on, held_by, notes_md, outcomes jsonb { tier_recommendation, filter_rescore_id, calendar_updated, roadmap_items[] }
creator_roadmap_items     creator_id, area enum: platform_audience | own_product | speaking_press | advisory_fund_board, goal, crew_contribution, status
```

### 3.2 Owled Creator Program (LIT)

```
program_cohorts
  id, programme enum: creatorpreneur | creator_marketer | next_gen_business | mixed
  batch_label, starts_on, ends_on, counterpart_name, counterpart_email

program_challenges                             -- the 48-hour challenge
  id, cohort_id, title, brand_id (hidden from students until judged), brief_md (anonymised)
  opens_at, closes_at (= opens_at + 48h), status enum: draft | open | judging | closed
  judges user_id[], top_n int (default 7), capacity_note

program_entries
  challenge_id, creator_id (created in stage=scout, source=program), consent_status
  declared_sub_category, declared_platform, submission_url, note_md (≤100 words), submitted_at
  filter_score_id (FK creator_filter_scores, context=challenge), rank int
  outcome enum: tier0 | revisit | pass | brand_commission
  outcome_note

program_sunday_shoots
  id, date, location, creators creator_id[], crew_lead_user_id, notes_md

program_interns
  person_name, email, cohort_id, starts_on, ends_on, function enum: research | deal_desk, converted_to_creator_id
```

### 3.3 Brands, contacts, inbox

```
brands
  id, name, website, category enum: ai_tool | dev_tool | saas | fintech | edtech | vc | consumer | enterprise | other
  owner_team enum: crew | owled_social | snoball | shared
  is_house_client bool
  risk_flags jsonb [ "misleading_claims", "undisclosed_data_use", "crypto_or_regulatory", "blocklist_gambling", "blocklist_crypto", "blocklist_unregulated_lending", "blocklist_political_religious" ]
  risk_reviewed_at, risk_reviewed_by, risk_note, nps_latest, nps_as_of

brand_contacts     brand_id, name, role, email, phone, is_primary, portal_user_id (nullable)

inbox_threads                                   -- brand inbound handled on the creator's behalf
  id, creator_id (nullable if addressed to Crew), brand_id (nullable until identified), channel enum: email | instagram_dm | linkedin | x | whatsapp | form
  subject, first_message_md, received_at, sla_due_at (= received_at + 24h)
  status enum: new | triaged | replied | converted | declined | spam
  deal_id (nullable), handled_by, no_list_prescreen jsonb

brand_feedback     brand_id, campaign_id, submitted_on, q1..q5 int 1-5, comment, shared_with_creator bool
```

### 3.4 Deals

```
deals
  id, brand_id, title, owner_user_id
  stage enum: lead | qualified | brief_received | creator_matched | proposal_sent | negotiation | signed | advance_received | in_production | live | reported | paid_in_full | declined | lost
  type enum: pilot | retainer | quarterly | annual | one_off    (one_off_reason required)
  origin enum: crew_originated | creator_inbound | frontseat_lead | snoball_referral | owled_referral
  originating_creator_id (nullable; set when origin = creator_inbound)
  commission_pct (computed: creator_inbound → 15, else 20)
  currency, quoted_total_paise, signed_total_paise
  term_starts_on, term_ends_on, pieces_per_month, pause_used bool (one 30-day pause/yr on retainers)
  exclusivity jsonb { scope: none|product|category, days }      -- priced at Premium rung
  usage_rights jsonb [{ kind: organic_reuse|whitelisting|web_print, days ≤ 365, channels[] }]
  frontseat_amplification bool (5-post package)
  sow_url, po_reference, confirmation_url, confirmation_received_at
  ladder_version_id
  no_list_check jsonb { rev_share_only, no_budget_educational, barter, lifetime_rights, shady_tool, blocklist_category, passed, checked_at, checked_by }
  declined_reason, declined_value_paise, lost_reason

deal_creators      deal_id, creator_id, role enum: primary | upsell, status enum: proposed | accepted | declined_by_creator

deal_quote_lines
  deal_id, creator_id, deliverable_key, qty
  standard_paise (from creator_standard_rates, or ladder default × tier scale if unset)
  rung enum: lucrative | semi | standard | pitch | premium
  addons jsonb [{ key, pct }]                 -- usage, rush
  line_total_paise (computed), note

deal_overrides     deal_id, kind enum: no_list | below_lucrative | tier0_in_deal | go_live_without_advance | go_live_without_po | min_deal | other, requested_by, approved_by (Owner only), approved_at, reason
deal_activity      deal_id, at, by, kind enum: note | email | call | stage_change | override | file, body_md
```

### 3.5 Campaigns and deliverables

```
campaigns          id, brand_id, deal_id, name, starts_on, ends_on, status enum: planning | active | reporting | closed, report_url, reported_at, feedback_requested_at, completed_at

deliverables
  id, campaign_id, creator_id, deliverable_key, platform, title
  due_on, scheduled_for, live_at, live_url
  status enum: briefed | drafting | in_review | approved | scheduled | live | reported | cancelled
  revision_round int, disclosure_checked bool, disclosure_standard enum: asci | ftc | both
  claims_approved_by_brand bool, approved_by_contact_id
  blocked_reason (computed), warnings jsonb (e.g. blackout overlap)

deliverable_metrics
  deliverable_id, captured_at, saves, shares, comments_decision_maker, inbound_to_brand, tracked_signups, impressions (stored, de-emphasised), notes
```

### 3.6 Money

```
invoices           id, deal_id, kind enum: advance | balance | usage_renewal | other, number, issued_by_entity (default 'OWLED'), issued_on, due_on (advance +7d, balance +7d after completion), amount_paise, gst_pct, tds_pct, status enum: draft | sent | paid | overdue | void, paid_on, paid_amount_paise, reference

creator_payouts
  id, deal_id, creator_id, kind enum: fee_advance | fee_balance | upsell_share | referral_share
  triggered_by_invoice_id, due_on (receipt +5 business days), amount_paise, tds_pct, status enum: due | paid | held, paid_on, reference

ledger_view (materialised)   per deal / per creator: advance due/received, balance due/received, payouts due/paid, overdue days, commission earned, shares paid
```

### 3.7 Settings / seed

```
ladders              id, version, effective_from, active, rungs jsonb (see §12.1)
deliverables         key, label, platform, default_multiple_of_reel (see §12.2), active
addons               key, label, pct (nullable), kind enum: usage | rush | revision | blocked, note
tier_scale           T0 0.5 · T1 1 · T2 2.5 · T3 6   (used only when a creator has no own Standard yet)
filter_rubric        version, dimensions [aesthetics, taste, personality], scale 1-5, thresholds { watchlist: 12, roster: 12, challenge_top_n: 7 }
no_list_items        key, label, description, active
blocklist_categories key, label, active
commission_rules     origin → pct; upsell_share_pct 3; referral_share_pct 1.5; referral_deal_count 10
settings             advance_pct 50 · advance_due_days 7 · balance_due_days 7 · payout_days 5 · pilot_days 90 · partnership_months 24 · exit_window_months 12 · sponsored_ratio_max 0.25 · min_deal_paise 2500000 · inbox_sla_hours 24 · checkin_cadence_days 90 · usage_max_days 365 · first_look_months 18 · revisit_months 6 · tier1_reel_standard_placeholder 5000000 · late_fee_pct_month 1.5 · kill_fee_after_script 50 · kill_fee_after_production 100 · retainer_pause_days 30
templates            checkin_quarterly, checkin_roadmap, brand_feedback_5q, sow, usage_addendum, exclusivity_addendum, representation_agreement, program_mou, student_opt_in, challenge_brief, cpv_reframe_page, month_end_onepager
users, roles, audit_log
```

### 3.8 Creator Studio (v3; ported from Upcreate, re-keyed from `user_id` to `creator_id`)

```
creator_profiles                            -- 1:1 with creators; was Upcreate brand_config
  creator_id, handle, name_field, niche, subniches text[], occupation, founder_story, bio_link
  colors jsonb { background, foreground, muted, border, color4, color5 }, fonts jsonb { heading, body }, asset_types text[]
  account_status enum: new | established
  pillar_ratio jsonb { authority 70, journey 30 }
  concept_ratio jsonb { proven 90, double_down 0, experimental 10 }   -- 70/20/10 when established
  posting_cadence jsonb { tier, times_per_week, days[] }
  hook_prefs text[] (verbal | written | visual), format_prefs text[] (filming format ids)
  cta_status, manychat_setup bool, equipment text[], ai_stack text[], automate_workflows text[]
  human_alpha, proprietary_value, journey_assets, onboarding_complete bool
  -- followers live in creator_platforms (grey metadata), not here

creator_calendar_items  (§3.1) gains:
  pillar enum: authority | journey, concept_bucket enum: proven | double_down | experimental
  content_type enum: educational | storytelling | authority | other
  topic, angle, format (filming format id), cta_type enum: follow | engagement | manychat | none
  funnel_stage enum: tofu | mofu | bofu, effort enum: low | default | high, topic_tag, segment
  studio_status enum: idea | researched | scripted | filmed | edited | posted
  script_id, carousel_id, live_url, notes, proposed_by_user_id (Crew proposals)

studio_outliers         creator_id, source_type enum: keyword | creator | recommendation, creator_handle, link, niche_keyword,
                        follower_count, views, multiple (computed views ÷ max(followers,1)), hook_written, hook_verbal, hook_visual,
                        angle, notes, used bool
studio_hook_stacks      creator_id, written, verbal, visual, angle, topic, saved bool
studio_scripts          creator_id, title, pillar, content_type, angle_or_story_type, format, body_black, body_red, body_green,
                        cta_type, funnel_stage, status enum: draft | ready | filmed | posted, series_name, effort, topic_tag, segment,
                        deliverable_id (nullable), shared_with_crew bool, cloned_from_id (nullable)
studio_script_templates creator_id (null = global starter), name, pillar, angle, source_note, template_text
studio_carousels        creator_id (null = global starter), title, pillar, content_type, archetype, cta_type enum: save | share | comment | follow | link,
                        funnel_stage, status, topic_tag, segment, slide_count, background_style, background_category, design_notes,
                        deliverable_id (nullable), cloned_from_id
studio_carousel_slides  carousel_id, slide_number, slide_role enum: hook | body | cta, headline, supporting_text
studio_posts            creator_id, title, posted_on, platform, url, pillar, format, hook, views, followers_at_post,
                        saves, shares, comments_decision_maker, inbound, tracked_signups, notes,
                        calendar_item_id, deliverable_id      -- if deliverable_id set, also writes deliverable_metrics
ai_settings             org-level: provider enum: gemini | openai | anthropic | custom, api_key (encrypted), model, custom_endpoint
ai_usage                creator_id, at, generator, provider, tokens_est
```

---

## 4. Creator lifecycle — state machine

```
scout ──► watchlist ──► incubation (T0) ──► roster ──► alumni
  │           │               │                │
  └► revisit  └► revisit      └► revisit       └► (return with Owner approval)
```

| Transition | Gate (enforced in `lib/rules/creators.ts`) | Who |
|---|---|---|
| → **scout** | Record with source and sub-category. | Anyone incl. Intern |
| scout → **watchlist** | **Filter score exists, total ≥ 12/15** (setting). `consent_status = opted_in`. For Program entries: top-N rank or Owner note. | Crew lead |
| watchlist → **incubation** | Anchor plan set; ≥ 3 topic filters; `represented_elsewhere` noted. Sets `tier = T0`, `first_look_until` +18 months. | Crew lead |
| incubation / watchlist → **roster** | Filter re-scored ≥ 12 in last 90 days; ≥ 2 tier signals recorded; `represented_elsewhere = false`; employer disclosure if employed; `own_product_content_pct ≤ 70` if founder; Owner approval. Creates `creator_agreement` in `pilot` (90 days). | Crew lead proposes, Owner approves |
| roster pilot → **partnership** | At pilot end: Filter re-score, Owner approval → 24-month agreement with `exit_window_at` +12 months. | Owner |
| any → **revisit** | Sets `revisit_on` (+6 months) and a Today reminder. Default for Program students instead of decline. | Crew lead |
| roster → **alumni** | Reason; open deals closed/reassigned; payouts settled; exclusivity ends. | Crew lead |
| alumni → roster | Owner approval. | Owner |

Tier changes: Crew lead proposes with signals; Owner approves; quarterly review prompted by the check-in. Follower counts are not an input anywhere in these rules.

*(v3)* **Studio access:** watchlist → incubation invites the creator to Creator Studio and runs first-run onboarding (§19.1). Roster keeps it. Roster → alumni keeps the creator's Studio content; their Deals tab turns read-only. A creator who withdraws consent loses Studio access and their Studio data is exported to them, then archived.

---

## 5. Deal pipeline — state machine and rules

### 5.1 Stages
`lead → qualified → brief_received → creator_matched → proposal_sent → negotiation → signed → advance_received → in_production → live → reported → paid_in_full`; exits `declined`, `lost`.

### 5.2 Gates (`lib/rules/deals.ts`)

| Transition | Gate |
|---|---|
| lead → qualified | NO-list check passed; brand risk flags reviewed in last 180 days; `type` set (`one_off_reason` if one-off); quoted value ≥ ₹25K or `min_deal` override; if brand `owner_team = owled_social`, a referral note is required. |
| qualified → brief_received | Brief attached. |
| brief_received → creator_matched | ≥ 1 creator `accepted`; each must be `stage = roster` (Tier 0 only with `tier0_in_deal` override and at the T0 rung); topic-filter conflicts block with the filter named; `represented_elsewhere` must be false. If `origin = creator_inbound`, the OS prompts "Upsell with other roster creators in the requirement band?" and marks extras as `role = upsell`. |
| creator_matched → proposal_sent | Quote has ≥ 1 line; rung per line; no line below Lucrative without `below_lucrative` override; exclusivity requested → Premium rung on affected lines; usage requested → usage add-on lines with `days ≤ 365`. |
| negotiation → signed | Signed total, term, pieces/month, exclusivity, usage, Frontseat amplification flag; SOW generated from template. |
| signed → advance_received | Advance invoice `paid` (≥ 50%) or `go_live_without_advance` override. Generates `fee_advance` payouts (50% of each creator's share) due in 5 business days. |
| advance_received → in_production | `po_reference` or `confirmation_url` present, or `go_live_without_po` override. Campaign auto-created. |
| live → reported | All deliverables live/cancelled; report attached; brand feedback requested; `completed_at` set → balance invoice issued, due in 7 days. |
| reported → paid_in_full | Balance paid → `fee_balance`, `upsell_share` and `referral_share` payouts generated and paid; all payouts `paid`. |
| any → declined | `declined_reason` + `declined_value_paise`; appears in the Declined log and the month-end one-pager. |

### 5.3 The ladder calculator

Per line: creator → their Standard for the deliverable (fallback: ladder default × tier scale, flagged "default"), rung, qty, add-ons.

```
line_total = standard × qty × (1 + rung_pct) × (1 + Σ addon_pct)
```

Rules:
- Rung defaults by deal type: pilot/retainer → Standard; one-off → Pitch; annual or bulk → Lucrative; quarterly → one rung below the creator's usual close; exclusivity/category lock → Premium on affected lines.
- Rush add-ons: +15% under 7 days, +25% under 2 days. Revisions beyond round 2: a free-text "case by case" line, never automatic.
- Usage add-ons: organic 90d +20%, whitelisting 90d +40%, web/print 12m +30%; `days` mandatory and ≤ 365. `lifetime` is `kind = blocked` and renders as "Not offered".
- Multi-creator campaigns carry no bundle discount: each creator at their own rung.
- Minimum deal ₹25K; below that the OS offers "Send creator the self-serve template" instead of a deal.
- Commission is computed: 15% if `origin = creator_inbound`, else 20%. Upsell share: 3% of `role = upsell` creators' fees to `originating_creator_id`, from Crew's commission. Referral share: 1.5% of a referred creator's first 10 deals to `referred_by_creator_id`, from Crew's commission.
- No follower, impression, CPV or CPM field exists on the calculator. The quote PDF includes the one-page CPV reframe (`templates.cpv_reframe_page`).
- Every quote stores `ladder_version_id`.

### 5.4 Deliverable blocking (`lib/rules/deliverables.ts`)

Cannot move to `scheduled` or `live` if: deal stage < `advance_received` (no override); no PO/confirmation (no override); `disclosure_checked = false`; `claims_approved_by_brand = false`; creator's sponsored ratio this month would exceed 25%; brief tags intersect the creator's topic filter.
**Warning only** (not a block): `scheduled_for` inside a creator blackout week — shown to brand and creator, because no-post weeks are creator-chosen and not contractual.
The UI shows the first reason as one grey line under the status control.

---

## 6. Inbox — brand inbound on the creator's behalf

1. Threads arrive by forwarding address (Gmail integration, v1), by paste, or from the portal contact form. Instagram/LinkedIn/X DMs are captured by paste or screenshot in v1.
2. Each thread gets an `sla_due_at` 24 hours out and appears in Today until `replied`.
3. Triage actions: *Identify brand* (creates/links brand), *Pre-screen NO list* (five toggles), *Convert to deal* (creates a `lead` with `origin = creator_inbound` and `originating_creator_id`), *Decline with template*, *Forward to creator* (creator portal).
4. The creator sees the thread and Crew's reply in their portal; they never have to answer a brand themselves.
5. Crew never posts, never touches the creator's accounts; the Inbox is communication only.

---

## 7. Owled Creator Program — workflow

1. **Cohort** created with programme, dates and LIT counterpart.
2. **Challenge** drafted from `templates.challenge_brief`: a real brand brief with the brand hidden (`brand_id` masked until judging closes); 48-hour window; capacity note ("runs when Crew has capacity").
3. **Entries**: students opt in (consent captured); each becomes a `scout` creator with `source = program`; they declare sub-category and platform; submission URL + ≤100-word note before `closes_at` (late = not accepted).
4. **Judging screen**: one row per entry; three 1–5 fields (aesthetics, taste, personality) + one sentence; arrow keys move between cells; totals rank live. Judges: Crew as an organisation under Ayush, with OWLED creative in the room.
5. **Outcomes**: top 7 → `tier0` (stage `incubation`, tier T0, `first_look_until` +18m); totals 10–11 → `revisit` (+1 quarter); below → `pass` with a kind note. The brand sees the top ten and may set `brand_commission` on one entry, which creates a paid deal at the T0 rung through Crew.
6. **Sunday shoots**: scheduled objects with attendees; each creates `shoot` calendar items; attendance feeds "cadence" on the creator record.
7. **Interns**: two per cohort (research, deal desk); conversion to creator if they start creating.
8. **Counterpart view**: read-only list of opted-in students with stage, Filter total and next shoot; no money, no tier.
9. **Quarterly Program report** (markdown → PDF): entrants, top-7 names, revisit count, Sunday attendance, moves to roster, cost to date.

---

## 8. Campaign workflow

1. Auto-created at `in_production`; deliverables generated from quote lines; `due_on` suggested from the creator calendar (next free slot; blackout overlap produces a warning).
2. Statuses `briefed → drafting → in_review → approved → scheduled → live → reported`; `scheduled` writes a `sponsored` calendar item.
3. **Approvals** in the brand portal: claims and facts only, two rounds; round 3 opens a "Revision — case by case" line on the deal for Crew to price or waive.
4. **Frontseat amplification**: if flagged on the deal, five amplification posts appear as tracked items with Frontseat as the channel.
5. **Report**: credibility metrics first (decision-maker comments, saves/shares, inbound, tracked sign-ups), impressions last and smaller.
6. **Feedback**: five-question survey + quarterly NPS from the brand portal; `shared_with_creator` on by default.
7. **Add creators**: a sheet over `stage = roster` with one search field, Filter total, sub-category, topic-filter conflicts and sponsored-ratio headroom inline. No follower column.
8. *(v3)* **Studio side of a campaign**: scheduling a deliverable writes a `sponsored` item to the creator's Studio calendar with the brief; the creator writes the script or carousel in Studio, attaches it and submits the draft (§19.6.7); the brand portal shows claims only; posting the live URL and logging metrics in Studio Results fill the deliverable and the report (§19.12).

---

## 9. Retention workflow

- On roster entry the OS schedules four quarterly 60-minute check-ins and a strategy refresh at +6 months; each completed check-in schedules the next.
- Check-in template: what shipped; what landed (credibility metrics, brand feedback); next-quarter calendar; topic-filter review; Filter re-score; tier recommendation with signals; roadmap items across platform/audience, own product or course, speaking and press, advisory/fund/board; introductions logged (best effort, no quota).
- Pilot-end and exit-window reviews are special check-in types with their own templates.
- Retention metrics on Creators → Overview: check-in adherence, 12-month churn, deal renewal rate, share of retainer/quarterly/annual vs one-off, brand repeat rate, average feedback score. No minimum guarantees exist anywhere in the system.
- *(v3)* Check-ins pull from Studio: "what shipped" = posted calendar items since the last check-in; "what landed" = credibility metrics from Studio Results; "next-quarter calendar" = the 8-week Studio calendar, edited together in the meeting. Calendar adherence (§20) is a retention signal.

---

## 10. Screens

Every screen: one title, one primary action, one list or one record, an Inspector on the right.

- **Today** — sections in plain text: Blocked · Awaiting money · Inbox due · Check-ins · Payouts due · Revisits · Pipeline moves. One row = one line + one hover action. Empty state: "Nothing needs you today."
- **Inbox** — list by SLA; Inspector shows the thread; actions as plain buttons (Identify · Pre-screen · Convert · Decline · Forward).
- **Creators** — segmented control (All · Scout · Watchlist · Incubation · Roster · Alumni); tokens `sub:` `tier:` `src:program` `lang:hinglish`. Columns: Name · Sub-category · Filter · Tier · Next check-in · Open deals · Calendar adherence. Follower column off by default.
- **Creator record** — tabs: Overview · Filter & Tier (three 1–5 scores + sentence, history; tier signals list; verdict line: "Roster gate: 3 of 4 met · missing: Filter re-score") · Rates (their Standard per deliverable; ladder preview) · Calendar (month grid; anchors bold, sponsored dotted, shoots marked, blackouts shaded) · Deals · Performance · Check-ins · Payments · Agreement (pilot/partnership dates, exit window, exclusivity).
- **Program** — cohorts left; main: challenge entries with Filter totals and outcomes; *Score* mode; tabs Entries · Sundays · Interns · Incubating · Report. Primary action: *Open challenge*.
- **Deals** — Board (one column per stage; card: brand · title · total · rung mix · days in stage · one-line blocker) and List; *Calculator* for scratch quotes; footer line: "Pipeline ₹… · Signed this quarter ₹… · Declined ₹… (n)".
- **Deal record** — left stepper mirrors stages; main pane shows only the current step. Qualify (NO-list toggles + blocklist + brand risk + referral note if OWLED Social brand) → Brief → Match (fit lines, upsell prompt) → Quote (ladder calculator; rung as a five-segment control per line; add-ons as toggles with one-line descriptions) → Terms → Signature & PO → Money (ledger, both legs of the 50/50) → Delivery → Report & close.
- **Campaigns** — one table: Creator · Deliverable · Platform · Due · Status · Blocker/Warning; grouped by creator or week; Report and Feedback tabs; *Add creators* sheet.
- **Brands** — list with owner team, risk flags as text, last deal, NPS; record with contacts, ownership rule, risk review, deals, feedback.
- **Brand portal** — campaigns, deliverables awaiting claim approval, reports, invoices with status, feedback form. No tiers, no rungs, no other creators' data.
- **Creator portal** — calendar, deals and quotes (their fee only; never Crew commission or other creators' fees except their own upsell/referral shares), payouts, check-in notes, roadmap, forwarded inbox threads.
- *(v3)* **Creator Studio** — the Creator portal built out (§19): Today · Profile · Calendar · Research · Write · Carousels · Shoot · Funnel · Prompts · Results · Deals. Same shell, tokens and text-minimal rules as Crew Desk; sidebar + content, no Inspector.
- **Settings** — ladder versions, deliverables, add-ons, Filter rubric, NO list and blocklist, commission rules, numeric settings, templates, users and roles, audit log, CSV import/export.
- **Owner month-end one-pager** (generated on the 1st): roster by stage/tier/sub-category; pipeline by stage; signed, collected, outstanding, overdue; payouts and shares; declined-deal log with values; framework exceptions; retention signals; Program counts.

---

## 11. Integrations

v1: **Gmail + Google Calendar** (inbox capture by forwarding address; check-ins, Sunday shoots and Monday pipeline review on calendar). CSV import for the current pipeline document, creators and brands. CSV/PDF export.
*(v3)* Studio v1: AI generation through one org-level provider key (Gemini default; OpenAI, Anthropic, custom endpoint supported) with *Copy prompt* fallback; `.docx` export (one script, script bank + templates, calendar, Prompt Library); CSV/TSV paste import for outliers (Sort Feed export) and bulk script import.
v2: Razorpay/Stripe invoice status; WhatsApp deep links; Instagram/YouTube analytics upload; Google Drive asset links; Slack digest of Today. International rails: decided with finance.

---

## 12. Seed data

### 12.1 Ladder v1
| Rung | % vs Standard | Default use |
|---|---|---|
| Lucrative | −30% | Bulk, very good brand, very lucrative deal; annual close |
| Semi-lucrative | −15% | Better than normal; quarterly close |
| Standard | 0 | What the creator normally charges; pilot and retainer default |
| Pitch | +20% | Opening number to brands; one-off default |
| Premium | +50% | Use-case: exclusivity, category lock, special asks |

Tier scale for creators without their own Standard yet: T0 ×0.5 · T1 ×1 · T2 ×2.5 · T3 ×6, on a **Tier 1 Reel Standard placeholder of ₹50,000** (to be decided).

### 12.2 Deliverables v1 (multiple of the dedicated Reel)
Instagram Reel dedicated 1.0 · Instagram Reel integrated 0.7 · Instagram carousel/static 0.6 · Instagram story set (3–5) + link 0.25 · YouTube integration 1.5 · YouTube dedicated 3.0 · X thread 0.5 · LinkedIn post 0.6. Platform preference order: Instagram, YouTube, X, LinkedIn.

### 12.3 Add-ons v1
usage_organic_90 +20 · usage_whitelist_90 +40 · usage_web_365 +30 · rush_7d +15 · rush_2d +25 · revisions_r3 (case by case, no %) · exclusivity (no %, forces Premium rung) · lifetime (blocked).

### 12.4 Commission rules v1
crew_originated 20 · frontseat_lead 20 · snoball_referral 20 · owled_referral 20 · creator_inbound 15 · upsell_share 3 (from Crew's commission) · referral_share 1.5 on first 10 deals (from Crew's commission).

### 12.5 Filter rubric v1
Aesthetics, Taste, Personality — each 1–5 — plus one sentence (required). Thresholds: watchlist ≥ 12, roster ≥ 12 (re-scored within 90 days), challenge top-N = 7, revisit band 10–11. Judged by Crew as an organisation under Ayush.

### 12.6 NO list and blocklist v1
NO: rev_share_only · no_budget_educational · barter · lifetime_rights · shady_tool (misleading claims; undisclosed data use / privacy risk; crypto-adjacent or regulatory exposure).
Blocklist categories: gambling / real-money gaming · crypto exchanges & tokens · unregulated lending / fintech · political & religious.
Exceptions: Owner (Ayush) only, logged, default none in year one, house clients included.

### 12.7 Settings v1
advance 50% due in 7 days · balance due 7 days after campaign completion · payouts 5 business days after receipt · pilot 90 days · partnership 24 months · exit window at 12 months · sponsored ratio max 0.25 · min deal ₹25,000 · inbox SLA 24h · check-in every 90 days · usage max 365 days · first look 18 months · revisit 6 months · late fee 1.5%/month · kill fee 50% after script approval / 100% after production · retainer pause 30 days once a year, exclusivity continues.

### 12.8 Creator Studio seed and reference (v3)
- **Starter library:** the Upcreate seed batches in `lib/seed-data/` — ~1,000 scripts with pillar, content type, angle, format, CTA, funnel stage, concept bucket, effort, topic tag and segment, plus 100 carousels (768 slides). Loaded once by `lib/db/seed.ts` as global read-only rows (`creator_id = null`).
- **Reference content as code:** `lib/studio/reference.ts` (7 script angles, 7 story types, 7 journey series formats, 9 authority content formats, 12 filming formats, storytelling formats, historical-media tip, 6 universal hook templates, profile checklist, reach-vs-conversion example, hook-stack examples, tools list, crisp-script rules, 5x rule, transcript prompt, funnel and CTA guidance, enums) and `lib/studio/carousel-reference.ts` (8 archetypes, 10 hook patterns, 5 CTA types, 6 background styles, 10 photo categories, carousel craft rules).
- **Profile defaults:** account status new · pillar 70/30 · concept 90/0/10 (70/20/10 when established) · cadence light, 1–2 per week · hook prefs verbal + written · format prefs whiteboard + voiceover/B-roll · ManyChat off.
- **Studio settings:** ratio warning threshold 10 points · ideation batch size 12 · outlier threshold 5× · script length 45–75 s · hook ≤ 10 words (generator lines < 12) · carousel default 8 slides · calendar window 8 weeks.

---

## 13. Design system — HIG principles in the Crew brand

### 13.1 Principles
Clarity, deference, depth, consistency, progressive disclosure, direct manipulation, inline feedback — exactly as before. The brand changes the surface, not the rules: the interface still recedes and content still carries the screen.

### 13.2 Brand tokens (from the Crew logo)
```
--ink:        #0B0B0B   base background (dark theme is the primary theme)
--ink-2:      #1A1917   raised surface
--ink-3:      #262421   blocks / cards
--beige:      #F6E8CD   primary text and beige blocks
--beige-2:    #CFC2A9   secondary text
--beige-3:    #8C8370   captions, separators
--pink:       #FF409B   emphasis only: the primary action, one number per screen, overdue/blocked words, the active rung
--pink-soft:  #FF409B @ 16% for selection and focus tints
```
Light theme (secondary): beige base `#F6E8CD`, ink text, same pink. Both themes first-class; the dark theme is default.

Pink is a scalpel, not a paint bucket: never as a background larger than a button or a single highlight block, never for body text, never for decoration.

### 13.3 Typography — brutalist-minimal
- Headlines: a heavy condensed sans (`"Archivo Black", "Inter Tight", "Arial Black", Impact, sans-serif`), uppercase, tight tracking, used for screen titles, big numbers and section marks. Nothing else is uppercase except small pink labels with wide tracking.
- Body/UI: `-apple-system, "SF Pro Text", Inter, Arial, sans-serif`; tabular numerals in all tables and ledgers.
- Scale: Screen title 22/26 heavy caps · Big number 40–64 heavy · Headline 15/20 semibold · Body 13/18 · Callout 12/16 · Label 9–10 caps with 0.3em tracking in pink or beige-3 · Caption 11/14 beige-3.
- Two weights per screen (regular, semibold) plus the heavy headline face.

### 13.4 Shape and layout
- Square corners everywhere (0 radius). Blocks are flat fills of `ink-3` or `beige`; no shadows, no borders except hairline separators in `ink-3`/`beige-3`.
- 8-pt grid; 20-pt content inset; 36-pt dense rows, 44-pt form rows.
- Three-pane shell (sidebar 220 · content · inspector 320, collapsible); stacks on phone widths.
- Tables: hairline separators, header row as a beige block with ink caps labels, right-aligned numerals.

### 13.5 Components (closed set)
List · Table · Segmented control · Search field with tokens · Stage pill (menu) · Status menu · Rung control (five segments, active one pink) · Score control (1–5, three per Filter) · Sheet · Popover · Inspector · Inline caption · Stepper · Month grid · Sparkline · Number field with unit · Toggle with one-line description · Markdown editor · Empty-state sentence · Command palette · Block (square, beige or ink-3). Nothing else.

### 13.6 Text-minimal rules
One-to-three-word titles; verbs on buttons; one-word statuses; one-sentence blockers; one-line gates; captions ≤ 12 words; no helper paragraphs; no confirmation dialogs for reversible actions (`⌘Z` 10 s); sheets with one-sentence consequence for irreversible ones; Indian number formatting (₹1,20,000; ₹ L / ₹ Cr in summaries).

### 13.7 Keyboard and accessibility
`⌘K` palette, `⌘N` new in context, `⌘F` search, `J/K` rows, `Enter` open, `Esc` close. Contrast ≥ 4.5:1 for all text in both themes (beige on ink passes comfortably; pink on ink is reserved for ≥ 15-pt semibold or non-text emphasis to stay above 4.5:1). Visible focus rings in pink-soft; reduced motion respected.

### 13.8 Creator Studio in the Crew design system (v3)
Studio uses the same tokens, type, shape and closed component set. Upcreate's lime-on-parchment palette, rounded cards, Instrument Serif headings and decorative motion are replaced. Upcreate's tokens are already centralised in `app/globals.css` (`--background`, `--foreground`, `--accent`, …), so the reskin is a token remap plus removing rounded corners and shadows. Studio-specific uses of the closed set: BLACK / RED / GREEN script bodies render as three labelled blocks (beige caps labels; no red or green colour — pink stays for emphasis only); ratio meters are Sparkline-weight bars with the target as a hairline; the board view is a Table grouped by status; outlier multiples are tabular numerals, the top one in pink as the screen's one number.

---

## 14. Tech stack and repo layout

Next.js 15 (App Router) + TypeScript · Postgres (Supabase or Neon) · Drizzle ORM · Auth.js (magic link + role claims; portal users scoped by brand/creator id) · Zod · Tailwind with the §13 tokens · Radix primitives · TanStack Table · date-fns-tz · pnpm · Vitest + Playwright. All writes via server actions through `lib/rules/*`; audit log by trigger; Gmail/Calendar via Google APIs with a forwarding address per creator.

```
snoball-os/
  BRIEF.md  CLAUDE.md
  app/(shell)/  today/ inbox/ creators/ program/ deals/ campaigns/ brands/ settings/
  app/(portal)/brand/  app/(portal)/creator/
  app/(portal)/creator/studio/  today/ profile/ calendar/ research/ write/ carousels/ shoot/ funnel/ prompts/ results/ deals/   ← (v3) §19
  components/ui/            ← §13.5 only
  lib/db/schema.ts  lib/db/seed.ts (§12)
  lib/rules/creators.ts (§4)  deals.ts (§5)  deliverables.ts (§5.4)  inbox.ts (§6)  program.ts (§7)  retention.ts (§9)  money.ts (payout generation)
  lib/reports/  lib/format/  lib/integrations/google/
  lib/studio/  prompts.ts  carousel-prompts.ts  reference.ts  carousel-reference.ts  bulk-import.ts  docx-export.ts  ai.ts   ← (v3) ported from Upcreate
  lib/rules/studio.ts (§19.16)
  tests/rules/*.test.ts  tests/e2e/*.spec.ts
```

*(v3)* **Porting Upcreate.** This repo already runs Upcreate on Next.js 16 (App Router, Server Actions, `proxy.ts`), Tailwind v4, `postgres` (postgres.js) and `docx`. Use the installed Next.js version and read `node_modules/next/dist/docs/` first (see `AGENTS.md`). Upcreate's inline `ensureSchema()` becomes Drizzle migrations; its tables are re-keyed from `user_id` to `creator_id` (§3.8); its server actions move behind `lib/rules/*`; its single-password / per-user auth gives way to Auth.js roles. Prompt builders (`lib/prompts.ts`, `lib/carousel-prompts.ts`), reference content and the docx builders move to `lib/studio/` with their logic unchanged.

---

## 15. Build plan and acceptance criteria

**Milestone 1 — Creators, Filter, tiers (weeks 1–2).** Schema, seed, auth/roles, shell, Today (empty), Creators list/record, Filter scoring, tier signals, stage machine, agreement dates, CSV import of the current pipeline document.
*Accept:* no creator leaves Scout without a Filter score ≥ 12 and consent; roster promotion requires Owner approval and `represented_elsewhere = false`; no follower column by default; tier appears in no export; both themes pass contrast.

**Milestone 2 — Deals, ladder, money (weeks 3–4).** Board/list, stepper, NO-list + blocklist gate, match with upsell prompt, ladder calculator with per-creator Standards, add-ons, commission and shares, SOW generation, invoices, payouts, overrides, declined log.
*Accept:* barter toggle on cannot pass Qualify without Owner override; no line below Lucrative without override; lifetime unselectable; no follower/CPV input on the calculator; one-off auto-selects Pitch; creator_inbound → 15% and the upsell share generates a payout line; advance paid → fee_advance payouts due in 5 days; every override audited with approver.

**Milestone 3 — Campaigns, Inbox, Today, portals (weeks 5–6).** Campaign auto-creation, tracker, blockers/warnings, brand portal (approvals, reports, invoices, feedback), creator portal, Inbox with 24h SLA and Gmail capture, Today sections.
*Accept:* a deliverable cannot be scheduled without PO + advance + disclosure + claims approval; a blackout overlap warns but does not block; brand portal shows no tier, rung or other creators; creator portal shows their fee and their shares only; inbox threads past 24h appear in Today.

**Milestone 4 — Program & retention (week 7).** Cohorts, 48-hour challenges with masked brand, scoring sheet, top-7 routing to Tier 0, Sunday shoots, interns, counterpart view, Program report; check-in scheduling, pilot-end and exit-window reviews, retention metrics, month-end one-pager.
*Accept:* brand name hidden until judging closes; top 7 by Filter total move to incubation in one click; counterpart sees no money/tier; roster entry schedules four check-ins and the pilot-end review; one-pager renders with declined log and exceptions count.

**Milestone 5 — Polish (week 8).** Command palette, keyboard nav, Calendar sync, PDF exports, empty states, VoiceOver pass, Playwright green.

**Track S — Creator Studio (v3; runs alongside Milestones 1–5).**
- *S1, with M1:* port Upcreate into `app/(portal)/creator/studio/`, re-key to `creator_id`, delete the cut features (§21), reskin to Crew tokens, Profile + onboarding, Calendar (grid, board, list, ratio meters, batch ideation), Research, Hook Lab, Scripts, Library (global starter rows), Carousels, Shoot, Funnel, Prompts, Results, org-level AI key.
  *Accept:* a creator sees only their own data; no publish / account-connection code remains; no tier, Filter or rung reaches any Studio query; every generator offers Generate and Copy prompt; seed loads once from one script.
- *S2, with M2–M3:* sponsored items on Studio calendars, attach / submit draft, topic-filter and disclosure checks on submit, claims-only view in the brand portal, live URL and metrics flowing to deliverables and reports, Studio Today, Deals tab.
  *Accept:* a sponsored draft that hits a topic filter can't be submitted; a sponsored item shows "Not cleared to post" until §5.4 clears; metrics logged once in Studio appear in the brand report; blackout weeks set in Studio warn on Crew's scheduling.
- *S3, with M4:* check-ins read Studio (shipped, landed, next calendar); calendar adherence on the Creators list; AI usage in the one-pager; Sunday shoots on Studio calendars and Shoot.
  *Accept:* a check-in opens pre-filled from Studio; adherence matches posted ÷ planned; consent withdrawal exports and archives Studio data.

Definition of done per screen: one title, one primary action, no legends, no helper paragraphs, both themes, every rule unit-tested.

---

## 16. CLAUDE.md (place beside BRIEF.md)

```markdown
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
```

---

## 17. Open items (decide before Milestone 2)
1. Tier 1 Reel Standard (₹50K is a placeholder) — and whether the ladder applies to each creator's own Standard from day one (assumed yes).
2. Team: lean (Shardul + interns) or staffed (+ ops, + strategist). Affects roles seeded.
3. International payment rails (with OWLED finance).
4. Filter judging panel composition for the roster (Crew under Ayush — named people).
5. The current pipeline document (to import as the first Scout/Watchlist records).
6. *(v3)* Default AI provider and who pays for generation (org key; Gemini today).
7. *(v3)* Whether Strategists can edit creators' Studio calendars directly or only propose items (assumed: propose only).
8. *(v3)* Whether Studio is offered to Scout/Watchlist creators as a trial (assumed: no — access starts at incubation).
9. *(v3)* The starter library is written in the original creator's niche (founder / consulting). Keep it as examples for all creators, or build per-sub-category starter sets (assumed: keep as examples).

## 18. Decisions this version is built on (19 Oct 2026)
Positioning: deal negotiator + brand filter as the lead promise; Crew is a Snoball division with its own P&L; Shardul full-time owner; Crew handles brand DMs but never posts; exclusive seller for roster creators; Frontseat gives a 5-post amplification package per deal and routes leads; no connector quota. Roster: Instagram primary, then YouTube, X, LinkedIn; India-first creators, India + US brands; English + Hinglish; employed creators with disclosure; founders if ≤70% own-product content; pseudonymous case by case; exclusive representation; no roster cap; demand decides mix; 1–2 Tier 3 anchors; the Filter (aesthetics, taste, personality, 1–5 + sentence) judged by Crew under Ayush. Tiering: by signal, not counts; Crew lead proposes, Ayush approves, quarterly; never disclosed. Pricing: five-rung ladder; T2 ×2.5, T3 ×6; exclusivity at Premium; usage add-ons by term; rush +15%/+25%; revisions case by case; no bundle discount; min deal ₹25K; INR default, USD for US brands. Commission: 20/15; 3% upsell share; 1.5% referral on first 10 deals; equity case by case via Ayush. Deals: retainer = 1–2 pieces + 24h SLA + report; quarterly = one rung down; annual = Lucrative + exclusivity + 2 events + advisory; one 30-day pause/yr; editorial veto on claims, kill fee, no-post weeks honoured; 12-month max licence; HOOC terms with 50% advance. NO list + blocklist as above; Ayush-only exceptions; declined log monthly. Content: 8-week calendar built together; creator decides cadence and no-post weeks (not contractual); 1-in-4 sponsored; claims-only approvals, 2 rounds; production add-on at internal rates. Money: 50/50; SOW + PO + advance gate; creator gets 50% of share on advance, balance within 7 days of completion; 1.5%/mo late; kill fees 50/100; OWLED invoices; tracker in OS, finance reconciles; rails TBD; month-end one-pager. OS: system of record; both portals in v1; Gmail/Calendar v1; access for Ayush, sales (read), finance (payments); 24h SLA; Monday 30-min review; Next.js + Postgres, multi-user, mobile-usable. Retention: 60-min quarterly check-ins; roadmap across four areas; 5-question survey + quarterly NPS shared with creator; never guarantees. Program: Owled Creator Program — 48-hour anonymous-brief challenge (idea → shoot → edit), 60 students/quarter, top 7 to Tier 0 and Sunday shoots, ad hoc cadence, no fellowship, 2 interns/cohort, opt-in only with LIT's own age gate, all three LIT programmes. 90 days: 12 creators in pilots, 30 brand deals, OS integrated; month-6 review is Ayush's qualitative call; four legal templates day one.

*(v3, proposed for sign-off)* Creator side: Creator portal becomes Creator Studio, ported from Upcreate; the playbook (ratio system, 5x outliers, hook stacks, 4-phase scripts, crisp-script rules, Improver, carousels, funnel-matched CTAs, double-downs) is kept intact; Publish, mock Media Bank, mock discovery feed and the follower-count Level tile are removed; one org-level AI key; Studio access from incubation; the visibility wall in §20.

---

## 19. Creator Studio — the creator side (v3 addition)

The Creator portal (§1, §10) is built out into **Creator Studio**: the creator's own content workspace. It is ported from the Upcreate app already in this repo, a personal content OS built on a growth-blueprint playbook (hooks, outlier research, the 70/20/10 ratio system, storytelling frameworks). Everything in §0–§18 still applies. This section adds the creator-side logic and mechanics, and §20 sets out exactly what crosses between the two sides.

**Why it exists.** Crew sells credibility (§0.1 #1). Credibility comes from the creator shipping specific, high-context content on a steady cadence. Studio is how Crew helps the creator do that without touching their accounts. **Crew never posts; Studio helps the creator plan, research, write and shoot, and the creator posts themselves.**

### 19.0 Studio principles

| # | Principle (from the Upcreate playbook) | How Studio enforces it |
|---|---|---|
| S1 | **Every generator is transparent.** | Each generator assembles the exact prompt from the creator's Profile plus the playbook rules, shows it, and offers two buttons: **Generate** (org AI key, §19.15) and **Copy prompt** (paste into any LLM). Nothing is locked behind the key. |
| S2 | **Never guess. Every hook and script traces back to a proven 5x outlier.** | The *Proven* concept bucket means "modelled on a logged outlier". Research rows carry a *Used* flag set when modelled. |
| S3 | **Batches hold ratios on purpose.** | Pillar ratio (Authority/Journey), concept ratio (Proven/Double down/Experimental) and the sponsored ratio are live meters on Today and Calendar. AI batch ideation is instructed to hit them exactly. |
| S4 | **One idea per video. Hyper-specific, never "fluffy".** | The crisp-script rules (§19.6.4) are hard constraints in every script prompt and the checklist for hand-written scripts. |
| S5 | **Every video knows its job: reach (TOFU), nurture (MOFU) or convert (BOFU).** | Funnel stage and CTA type are required fields on scripts, carousels and calendar items. CTA wording must match the stage. |
| S6 | **Complex beats easy for building a brand.** | The depth control (reach vs conversion) shows the real numbers: easy content got 1,000,000 views → ~200 followers; complex content got 1,000,000+ views → 30,000+ followers (150× the conversion). Complex is the default. |
| S7 | **Double down deliberately.** | Own posts that beat the creator's average (or hit 5× their followers) are flagged; the double-down generator produces three methodical variants (A/B/C). |
| S8 | **Studio never posts.** | No publish, schedule-to-platform, account connection or auto-post feature. The Upcreate "Publish" mock-up is deleted (§21). ManyChat is set up by the creator on their own account; Studio only writes the copy. |
| S9 | **The creator owns their Studio.** | Drafts, scripts, hooks and research are private to the creator unless shared or attached to a deliverable (§20). |
| S10 | **Studio numbers stay in Studio.** | Follower counts, views and multiples in Research and Results are the creator's own craft data. They never cross to Crew Desk except as grey metadata, and never feed pricing, tier or any gate (§0.1 #1, #6). |

### 19.1 Profile (Brand Foundation) and onboarding

**First-run onboarding** (shown once, skippable; sets `onboarding_complete`): Instagram handle · display name / tagline (`Name | Keyword`) · niche · sub-niches (comma separated) · occupation / title · bio link (CTA destination) · founder story (a paragraph or two) · current followers · account status (new / established) · posts per week.

**Profile** (editable any time) has three groups:

1. **Identity:** handle, name field (`[Name] | [Searchable keyword / niche / occupation]`), niche, sub-niches, occupation, founder story, bio link (one destination only), visual identity (six brand colours, heading + body font, visual asset types).
2. **Growth & ratios:** follower count (grey, private), account status (**New → 90/10 rule**, **Established → 70/20/10 rule**), posting cadence (tier, times per week, days), pillar ratio (Authority % / Journey %, default 70/30), concept ratio (Proven / Double down / Experimental, default 90/0/10 for new accounts), hook preferences (verbal, written, visual), format preferences (from the 12 filming formats), CTA status, ManyChat set up (yes/no).
3. **What makes you credible and hard to copy** (generators lean on this for voice): proprietary value / credibility (specific numbers from the track record), journey content assets (real footage and photos the creator has), human alpha (why AI slop can't copy you), equipment, AI stack, workflows to automate.

**Profile checklist** (right vs wrong, shown on Profile):

| Field | Wrong | Right |
|---|---|---|
| Link in bio | Linktree with many links (kills conversion up to 50%) | One destination link (landing page or freebie) |
| Username | Random or confusing handle | Full personal or business name |
| Name field | Only your name | `[Name] | [Searchable keyword / niche / occupation]` |
| Profile picture | Far away, several people, busy background | Clear close-up headshot, solid background (match brand colours) |
| Bio | Messy, unstructured | 4-line framework, clear in 5 seconds |

**Bio generator:** the 4-line framework — (1) who I am, hook-y, (2) who I help and how, a specific outcome, (3) proof, a specific number from proprietary value, (4) one next step to the bio link. Also three name-field options and a one-line check on the current name field.

**Link to the Crew record:** onboarding pre-fills `creator_platforms` (handle, followers as grey metadata) and is shown read-only on the Crew creator record Overview. Crew sets `sub_category`, tier and stage; the creator never sees tier or Filter (§0.1 #6).

### 19.2 The ratio system

Three ratios, all measured on the creator's calendar for the current batch (8-week window by default):

| Ratio | Values | Default | Enforcement |
|---|---|---|---|
| **Pillar** | Authority (expert / educational) vs Journey (documentation of the build) | 70 / 30 | Meter + warning when off target by > 10 points |
| **Concept** | Proven (modelled on outlier research) · Double down (variants of the creator's own past outliers) · Experimental (original) | New account: 90 / 0 / 10 · Established: 70 / 20 / 10 | Meter + warning |
| **Sponsored** | Sponsored items vs all items in the calendar month | ≤ 0.25 (`settings.sponsored_ratio_max`, per-creator `creator_anchor_plan.sponsored_ratio_max`) | **Hard block** on scheduling a deliverable (§5.4); Studio shows remaining headroom |

Batch discipline example (used in the ideation prompt): a 12-video batch at 70/20/10 is 8–9 proven, 2–3 double-downs, 1–2 experiments — not "whatever felt inspired".

### 19.3 Calendar & batching (the 8-week calendar, built together)

The same table as `creator_calendar_items` (§3.1), extended in §3.8. One calendar per creator, shared with Crew per §20.

- **Item fields:** date · kind (anchor / derivative / sponsored / organic / shoot / blackout) · pillar · concept bucket · content type (educational / storytelling / authority / other) · topic · angle · filming format · CTA type · funnel stage · Studio status · effort / detail level (low / default / high) · topic tag · segment · linked script · notes · platform · deliverable · campaign.
- **Studio statuses:** `idea → researched → scripted → filmed → edited → posted`.
- **Views:** month grid (anchors bold, sponsored dotted, shoots marked, blackouts shaded — §10) · **board** (one column per Studio status; drag to move; this replaces Upcreate's mock Pipeline) · list.
- **8-week window:** opens on the current 8 weeks. "Built together": Crew lead or Strategist can add *proposed* items (`proposed_by_user_id` set, shown with a "Crew" caption); the creator keeps or removes them. The creator decides cadence and no-post weeks (§0.1 #11).
- **Batch tools:** live ratio meters (§19.2) · **AI batch ideation** (default 12 topics; honours pillar and concept ratios; draws on journey assets and human alpha; returns `Topic | Pillar | Concept bucket | Angle | Hook idea`; each row has *Add to calendar*) · bulk add · add one item · **schedule a script** to a date (creates a linked item and copies the script's pillar, angle, format, CTA, funnel stage, effort, topic tag and segment) · reset calendar (creator only, irreversible-action sheet).
- **Blackout weeks:** set by the creator; shaded; visible to brands; warning only (§5.4).
- **Sponsored items:** created by Crew when a deliverable is scheduled (§8, step 2). Read-only date (changes go through Crew). Shows deliverable status, claims round and, if blocked, the grey blocker line as **"Not cleared to post: <reason>"** — the creator-side face of §0.1 #12. When the creator posts, they add the live URL, which writes `deliverables.live_url` (Crew moves the deliverable to `live` only if no block applies).
- **Shoot items:** Program Sunday shoots (§7, step 6) appear as `shoot` items with location and attendees.
- **Export to Word:** a formatted table (date, pillar, concept bucket, topic, angle, format, CTA, funnel stage, status).

### 19.4 Research — the Outlier Research Hub

> *An outlier is a reel from a small-to-midsize creator that got at least 5× more views than their total follower count. That's the bar for "proven" before you model it.*

- **Research log fields:** source type (keyword / creator / recommendation feed) · creator handle · link · niche keyword · their follower count · views · **multiple** (computed `views ÷ max(followers, 1)`, shown to one decimal) · hook written / verbal / visual · angle · notes · *Used* (set when modelled into a script or calendar item).
- **Method card (static reference):**
  - Reset the algorithm: dummy account → Profile → Menu → Content Preferences → Reset Suggested Content → Reset.
  - 3 search methods: creator research (Sort Feed Chrome extension), keyword research (Explore → Reels), recommendation feed (hidden gems after searching).
  - 4 creator-discovery methods: Accounts-tab search, Reels-tab profile screenshots, Suggested Accounts after following, top creators' Following lists.
- **CSV import:** paste a CSV/TSV export (Sort Feed sorts a creator's Reels by views); first row is headers; columns are auto-mapped; the multiple is computed per row; rows ≥ 5× are pre-selected; bulk save.
- **Keyword bank generator:** 25–40 search phrases a real person would type (not hashtags), grouped under niche / sub-niches / occupation.
- **Outlier deconstruction prompt:** paste a transcript or description → (1) hook type and text and why it stops the scroll, (2) script angle, (3) value type (personal or credible external), (4) beat-by-beat structure, (5) what's replicable vs creator-specific. Blunt about what does the work.
- **Topic research** (10 non-obvious frameworks, mental models, statistics or case-study angles per sub-niche, with source type) and **problem research** (10 painful audience problems per sub-niche, each mapped to the best script angle).
- **Trending in your niche:** top 6 logged outliers by multiple, on Studio Today.
- **Wall:** these follower and view numbers never leave Studio (S10).

### 19.5 Hook Lab

- **Hook stack** = **Written** (on-screen text, first 3 seconds) + **Verbal** (first spoken line) + **Visual** (what's seen in the first 3 seconds).
- **Generator:** topic + optional angle → 3 complete hook stacks, leaning on the creator's hook preferences; each line under 12 words, hyper-specific (numbers, names, timeframes), no emojis. Few-shot calibrated with real good stacks and one bad one ("Tips for you / Here's something you should know / just talking to camera").
- **The 7 hook / script angles** (shared with §19.6): Framework / Formula / Acronym · Comparison · Myth Bust / Common Mistake · Do vs Don't · Educational Tip / Hack · Transformation · Challenge. Each has a description and a fill-in template.
- **Universal hook templates:** "Is it possible to [outcome]…" · "[X] days/years ago vs today…" · "Did you know if you [action]…" · "3 levels of [topic]…" · "Smart [role] vs dumb [role] when it comes to [topic]" · "This is a picture of my first [experience] with [topic]".
- **Hook angles on screen:** one example reel per angle, showing how the hook reads in the first second.
- Saved stacks form the hook library; any stack can be passed into the script generator.

### 19.6 Script Studio

#### 19.6.1 The script format
Every script has three colour-coded bodies:
- **BLACK** — spoken dialogue, line by line.
- **RED** — physical actions and camera movement.
- **GREEN** — editing and graphic instructions for the editor.

Metadata: title · pillar · content type · angle or story type · filming format · CTA type · funnel stage · status (draft → ready → filmed → posted) · series name · effort · topic tag · segment · linked deliverable (sponsored only) · shared with Crew (bool).

#### 19.6.2 Generators
- **Authority / educational:** angle (one of 7) · topic · hook stack (optional, from Hook Lab, used as given) · filming format · **depth** (easy / complex, with the reach-vs-conversion numbers in S6) · funnel stage · CTA type. Output 45–75 seconds spoken.
- **Storytelling:** story type (My Story · Win · Loss · Lesson · Transformation · Challenge · Big Goal / Dream Journey) · journey series format (Daily · Progress Update · Lessons · Step-by-Step · Number & Metric Updates · Cost Breakdowns · What I Would Do Differently) · recommended formats for storytelling (Voiceover + B-roll, Shot / Angle Changes, Audio B-roll + Text). Journey scripts carry the historical-media tip in GREEN: use the real photo or video from the period, never a stand-in.
- **Signature series builder:** an N-episode series built on the creator's human alpha (Upcreate's example: "How to Enter the [Industry] Industry"). Per episode: title · written + verbal hook · one hyper-specific value point · angle · format. Each episode stands alone but rewards bingeing.
- **Raw idea developer:** a messy idea → a brief across the **7 factors of a short**: topic · hooks (full stack) · value · script angle · CTA + funnel stage · filming format (preferring the creator's format prefs) · editing notes using their visual assets. If the idea is too vague, it asks for what's missing instead of padding.
- **Transcript → template:** paste a viral reel's transcript (transcribed manually, e.g. gettranscribe.ai) → a fill-in-the-blank template for any niche, keeping the structure; saved to templates.
- **Manual writing:** colour-coded BLACK / RED / GREEN editor with the crisp-script checklist alongside.
- **Bulk import:** paste many scripts separated by a line containing only `---`; one AI call classifies every block into title, pillar, content type, angle, format, CTA, funnel stage, effort, topic tag, segment and the three bodies, so imports filter like hand-written scripts. Without a key, blocks import with defaults (authority / educational / follow / TOFU / default effort).

#### 19.6.3 The prompt scaffold (how every script prompt is built)
1. `brandContext(profile)`: name, occupation, niche, sub-niches, founder story (tone only), proprietary value; voice "direct, specific, no fluff, first-person founder voice".
2. **Four explicit phases**, no skipping: `<retention_plan>` (hook type, the hook line timed to 3 s and ≤ 10 words, open loops with timestamps every 7–10 s, pacing risk points, payoff placement) → `<draft_v1>` → `<self_critique>` (**persona switch**: a ruthless short-form editor reviewing a stranger's draft; at least 3 concrete flaws quoted, no praise) → `<final_script>` (fix every flaw, re-check every hard constraint one by one, output only BLACK / RED / GREEN).
3. Constraints are **grouped** — `<hard_constraints>` (non-negotiable), `<style_guidelines>` (soft), output format — because flat lists past ~7–10 items degrade. The most important rules appear at both the start and the end (primacy + recency).
4. A GOOD opening and a BAD opening are included as calibration.

#### 19.6.4 Crisp-script rules (hard constraints and the hand-writing checklist)
- **Hook:** verbal hook lands by 1.0 s — no logo, no "hey guys", no brand name, no setup sentence. One clause, one claim, ≤ 10 words. Prefer `[bad number] → [good number] in [timeframe] using [thing]`. Combine ≥ 2 of pattern interrupt, emotional spike, curiosity gap, self-relevance callout. State the payoff or tension, never that a topic "will be discussed".
- **Body:** one idea per video. Pattern interrupt every 7–10 s for educational content (3–5 s for fast formats). Re-hook beats at ~25–40% and ~60–75% of runtime. Each segment closes the last open loop and opens a new one. Cut on sight: throat-clearing openers ("So", "Okay so", "Today I want to talk about"), hedges ("just", "really", "very", "kind of", "I think", "basically"), redundant connectives ("in order to" → "to"), restated setup. 130–145 wpm baseline.
- **CTA:** TOFU — no hard CTA, or one soft topic-specific CTA at the very end. MOFU — one CTA framed as a value exchange ("comment X and I'll send the checklist"). BOFU — one explicit next step near the end (link in bio, DM keyword, book a call); never nag. Never reuse the same CTA wording across stages.
- **Length:** runtime multiplier on word count: talking head ×0.95, voiceover + B-roll ×0.85, visual-heavy / whiteboard / demo ×0.75. ~140–150 words for a tight 60 s; 35–75 words for 15–30 s. Narrow the idea before cutting words.

#### 19.6.5 Script Improver
Paste or pick a script, optional focus note ("the hook feels slow") → three phases: `<diagnosis>` (every weakness with the exact line, category — hook / pacing / specificity / craft-rule violation / CTA-funnel mismatch / format mismatch / persuasion structure — and severity HIGH / MEDIUM / LOW; plus lines that are already strong and must survive) → `<fix_plan>` (HIGH first; the actual replacement, or a recommended swap of format, angle, funnel stage or CTA citing the full reference; "already strong" is an allowed answer) → `<revised_script>` (targeted rewrite preserving strong lines; BLACK / RED / GREEN). The diagnosis is shown first so the creator decides.

#### 19.6.6 Script bank
All saved scripts and templates; open, edit, Improve, *Schedule to calendar*, *Attach to deliverable* (sponsored only), **Export to Word** (one script or the whole bank + templates).

#### 19.6.7 Sponsored scripts (where Studio meets a deal)
- *Attach to deliverable* links a script or carousel to one of the creator's deliverables (§3.5). *Submit draft* moves the deliverable to `in_review` and sets `revision_round`.
- **Topic-filter check:** before submit, the script text is checked against the creator's topic filters (§3.1 `creator_topic_filters`: category, competitor, claim, format, brand). A hit is shown as one grey line and blocks submission (the same rule as §5.4, run earlier).
- **Disclosure line:** GREEN must contain the disclosure instruction for the deal's `disclosure_standard` (ASCI / FTC / both). Studio inserts it; Crew ticks `disclosure_checked`.
- **Claims-only approval:** the brand portal shows BLACK lines and on-screen text only, never RED/GREEN or the creator's other work. The brand approves or flags claims; two rounds; round 3 opens the case-by-case line (§8, step 3).

### 19.7 Library

- **Starter library:** ~1,000 seeded scripts (the Upcreate batches in `lib/seed-data/`) plus 100 carousels (768 slides), global and read-only. A creator **clones** a row into their own bank before editing.
- **Filters:** funnel stage · detail level (effort) · topic tag · segment · content type · pillar · search (title or angle).
- **Segments** (the format / mechanic of a script), e.g. Framework Breakdown · Case Study · Unpopular Opinion · The Math Behind It · Surprising Stat Reveal · Resource-Tier Thought Experiment · Red-Flag Spotting · Reacting to AI Tool Output · Rapid-Fire Myth vs Reality · Rank & Tier List · Prediction / Trend Call · One Chart Explained · Objection Roleplay · Founder Voice-Memo Reflection · Explain Like I'm 5 · Day-in-the-Life POV · Compare 3 Options Live · Client Q&A Rapid Fire · Checklist / Audit Walkthrough · Behind-the-Scenes Process Reveal · Before You Do This, Watch This · Anonymized Client Story Breakdown.
- **Topic tags** in the seed are from the original creator's niche (founder journey, market entry and consulting, marketing, finance, consumer psychology, product building…). New creators get their own tags from their sub-niches; the seed stays as examples (§17 #9).
- *Add to calendar* on any row.

### 19.8 Carousels

- **Generator inputs:** archetype · topic · slide count (default 8) · funnel stage · CTA type (last slide) · background style · background photo category · design notes (art direction).
- **8 archetypes** (each with slide range and fill-in pattern): Listicle / Framework (7–10) · Single Concept Per Slide (6–9) · Before / After (6–8) · Myth Bust (6–9) · Story Arc (7–10) · Comparison (6–8) · Step-by-Step Tutorial (7–10) · Quote / Mindset Chain (5–7).
- **10 hook patterns:** "Stop [action] — do [alternative] instead" · "[Number] [things] about [topic] no one tells you" · "The [X]-step framework I used to [outcome]" · "Why your [thing] isn't [working] (it's not what you think)" · "I [did unexpected thing] and here's what happened" · "[Bold claim]. Save this before you [action]." · "The one [mistake] killing your [outcome]" · "What I wish I knew before [milestone]" · "[Audience], read this before you [action]" · "Everyone says [belief]. Here's why they're wrong."
- **5 CTA types:** save (strongest signal), share (reach), comment (only with a tight question), follow (awareness), link (BOFU).
- **Backgrounds:** styles solid · gradient · photo · screenshot · whiteboard · minimalist; 10 photo categories (desk / laptop overhead, POV hands, blurred meeting room, coffee shop, minimalist flatlay, skyline, bookshelf, walking / commuting POV, neutral texture, soft window light).
- **Carousel craft rules:** 8–10 slides is the sweet spot (6–7 minimum; 12–20 only for deep guides). Slide 1 legible in under 1 second, no logo-first; ≥ 2 of numbers, contrarian claim, curiosity gap, direct address, pattern interrupt. One idea per slide; if it needs > ~10 words at body size, split it. Every middle slide earns the next swipe. Max 2 font families. Dark-on-light or light-on-dark; 40–60% scrim on any text over photo. On 1080×1350: headline 60–90 px, section 40–55 px, body 28–36 px (never below 28 — cut text instead), labels 20–26 px. Solid colour or gradient is the default. One CTA per carousel, tied to the goal. Common mistakes are listed as a checklist.
- Slides are saved with a role (hook / body / CTA), headline and supporting text; carousels have a status and can be attached to a deliverable like scripts.

### 19.9 Production (Shoot)

- **12 filming formats:** Talking Back & Forth · Visual Format · Voiceover · Multitasking · Setting Changes · Shot / Angle Changes (every ~2 s) · Clone · Whiteboard · Q&A · Green Screen · Reaction · Audio B-roll + Text.
- **Equipment checklist** from Profile (basic tripod + microphone as the floor).
- **Shot list from a saved script:** RED and GREEN lines become an ordered shot list an editor can follow.
- **Batch folder namer:** `YYYY-MM-DD_topic-slug/`; upload raw clips into it right after filming.
- **Sunday shoots** (§7, step 6) the creator is attending appear here with date, location and the shot lists they plan to film.

### 19.10 CTA & funnel

- **Funnel guidance:** TOFU — reach a cold audience; strongest broad hook; no hard ask; don't reference the offer. MOFU — deepen trust; one layer deeper; soft engagement CTA. BOFU — convert a warm audience; strong specific CTA; the video allowed to ask.
- **CTA types:** follow (TOFU / proven concepts) · engagement ("comment X", MOFU) · ManyChat (trigger word → auto-DM with the one bio link, BOFU) · none.
- **Funnel distribution:** count of calendar items per stage for the batch.
- **Caption generator:** exactly three lines — written hook · CTA for the goal · 3–5 relevant keywords or hashtags (not hashtag spam).
- **ManyChat:** setup checklist (create account and connect the creator's own business profile; one automation comment keyword → DM with the one bio link; one trigger word per offer; test before use) and a DM writer (public reply, DM opener referencing the video, delivery message with the link, optional 24-hour follow-up). The creator does this on their own account; Crew never connects to it (S8).

### 19.11 Prompt Library

Every generator runnable inline in one place — bio · keyword bank · topic research · problem research · raw-idea developer · outlier deconstruction · hook stacks · scripts · Improve · captions · ManyChat DM · calendar ideation · double-down · carousels · signature series — each pre-filled with the creator's Profile, plus the static reference library (7 angles with templates, 7 story types, journey series formats, universal hook templates, authority content formats, filming formats, profile checklist, tools list). **Export to Word** for printing or handing to an editor.

**Tools reference** (static, with status): gettranscribe.ai (manual) · Sort Feed (CSV import) · Instagram Explore / Reels (manual logging) · dummy account reset (checklist) · Instagram Edits app (manual metrics once past 1,000 followers) · ManyChat (creator's own account) · CapCut (external editor) · PFPMaker (profile picture on brand colours) · tripod + mic (equipment checklist) · AI provider (Generate) · any LLM (Copy prompt). Planned, not built: an Instagram analytics API (none exists for this use) and a ManyChat API.

### 19.12 Results (analytics and insights)

- **Log a post:** title · date · platform · URL · pillar · format · hook · views · followers at time of post · **credibility metrics** (saves, shares, decision-maker comments, inbound, tracked sign-ups) · notes · linked calendar item · linked deliverable.
- **Credibility first:** the same order as the brand report (§8, step 5) — credibility metrics lead, views shown smaller.
- **Sponsored posts:** a post linked to a deliverable writes its metrics to `deliverable_metrics` (§3.5), so the creator logs once and Crew's report reads it.
- **Own outliers:** each post's multiple (`views ÷ followers_at_post`); posts above the creator's average or ≥ 5× are flagged *Double-down candidate*.
- **Views:** posts logged · total views · views per post · top 5 and bottom 5 · format performance (average by pillar and format) · hooks that perform.
- **Double-down generator:** on any post → three variants, one per method: **A** keep everything, tweak the value / details; **B** keep the structure / format, change the topic; **C** keep the topic, use a new filming format. Each variant can be added to the calendar in the *Double down* bucket. Guard rail in the prompt: changing everything at once is a new experiment, not a double-down.

### 19.13 Studio Today (replaces Upcreate's Dashboard)

Sections, in this order: **Due for Crew** (deliverables with due date, claims round, "Not cleared to post" reasons) · **Next up** (next 6 unposted calendar items) · **Content mix** (planned items, Authority % vs target, Journey % vs target, concept split, sponsored headroom) · **Trending in your niche** (top 6 outliers by multiple) · **Payouts** (due / paid) · **Inbox** (threads Crew forwarded, with Crew's reply) · **Next check-in**. Primary action: *Plan next batch*. Empty state: "Nothing due. Make something."

### 19.14 Crew-facing parts of Studio (the v2.0 creator portal, unchanged)

Deals and quotes (their fee only), payouts, check-in notes, roadmap (four areas), forwarded inbox threads, blackout weeks, and read-only topic filters and anchor plan. Never: Crew commission, tier, rung, Filter scores, other creators' fees (except their own upsell / referral shares).

### 19.15 AI engine

- One generation function `generateText(prompt)` with providers **Gemini** (default), OpenAI, Anthropic and a custom endpoint.
- **Org-level key** set by the Owner in Settings (encrypted at rest; masked in the UI). Upcreate's per-user keys are removed (§21). If no key is set, every generator still works through *Copy prompt*.
- Every call is logged in `ai_usage` (creator, generator, provider, rough tokens) for cost visibility in the month-end one-pager.
- Prompts are built only from the creator's own Profile and content. They never include tier, rates, Filter scores, other creators' data or Crew notes.

### 19.16 Studio rules (`lib/rules/studio.ts`)

| Rule | Type |
|---|---|
| No posting, platform scheduling or account connection exists in Studio. | Absent by design |
| Studio queries are scoped to the session's `creator_id`; global library rows are read-only. | Hard |
| A Studio user never sees tier, Filter, rungs, commission, Crew notes or other creators. | Hard |
| Pillar and concept ratio off target by > 10 points. | Warning |
| Sponsored share for the month would exceed the creator's max. | Hard (on scheduling, §5.4) |
| Sponsored item date changes. | Crew only |
| Submitting a sponsored draft that hits a topic filter. | Hard |
| Sponsored GREEN without the disclosure line. | Hard on submit |
| Marking a sponsored item posted while a §5.4 block applies. | Allowed to record the URL, but the deliverable stays blocked and Today shows the reason; Crew is alerted |
| Research / Results follower and view numbers leave Studio. | Never |
| Scripts, hooks, research visible to Crew. | Only if shared or attached to a deliverable |
| Studio access. | Granted at incubation (T0); kept at roster; alumni keep Studio content but Deals becomes read-only |

---

## 20. The seam — what crosses between Crew Desk and Creator Studio (v3 addition)

| Object | Created by | Crew sees | Creator sees |
|---|---|---|---|
| Profile | Creator (onboarding, Profile) | Read-only on the creator record Overview | Full edit (minus tier, Filter, stage, internal notes) |
| Calendar items | Creator (organic, anchor, derivative); Crew (proposed items); deals (sponsored); Program (shoots) | Full read; can propose items; owns sponsored dates | Full edit of their items; keep or remove Crew proposals; sponsored items read-only except status and live URL |
| Blackout weeks | Creator | Warnings when scheduling deliverables | Edit |
| Topic filters, anchor plan | Crew with the creator | Edit | Read |
| Scripts, carousels, hooks | Creator | Only when shared or attached to a deliverable | Full |
| Research (outliers) | Creator | Never | Full |
| Results (posts) | Creator | Credibility metrics on sponsored posts (via `deliverable_metrics`); calendar adherence (posted vs planned) | Full |
| Deliverables | Deal (§8.1) | Full | Their own: brief, due, claims status, blocker, submit draft, live URL, metrics |
| Inbox threads | Crew | Full | Forwarded threads + Crew's reply; never replies to a brand |
| Payouts | Generated from receipts (§3.6) | Full | Their own lines |
| Check-ins, roadmap | Crew | Full | Notes, roadmap, next date |
| AI usage | System | Totals per creator (one-pager) | Nothing |

**Calendar adherence** (Creators list column, §10) = posted items ÷ planned non-blackout items in the last 8 weeks, from Studio statuses.

---

## 21. Upcreate → Studio feature map (the cut-down)

Applied to the Upcreate app only; nothing in §0–§18 is cut.

| Upcreate screen / feature | Studio v1 | Reason |
|---|---|---|
| Dashboard (level, ratios, trending, upcoming) | **→ Studio Today** (§19.13). The follower-count *Level* tile (Level 1 0→1k, 2 1k→10k, 3 10k→100k) is **removed** | Follower-count gamification contradicts "signal, not counts" (§0.1 #1, #6) |
| Brand Foundation + Onboarding | **Keep → Profile** (§19.1) | Seeds the Crew record |
| Calendar & Batching | **Keep** (§19.3) + sponsored items, blackouts, shoots, 8-week window | The shared surface |
| Pipeline (mock data) | **→ Calendar board view** on real items | Same data, second view |
| Outlier Research + CSV import + keyword bank | **Keep** (§19.4) | |
| Outlier auto-discovery feed (mock) | **Cut** | No backend; scraping is out of scope |
| Hook Lab | **Keep** (§19.5) | |
| Scripts (Write / Improve / Library) | **Keep** (§19.6, §19.7); Library rows become global read-only, cloned before edit | |
| Carousels (Create / Library) | **Keep** (§19.8) | |
| Production (Planner / Media Bank) | **Keep Planner** (§19.9). **Cut Media Bank** (mock, no file storage) | Asset links come in v2 with Google Drive (§11) |
| CTA & Funnel | **Keep** (§19.10) | |
| Prompt Library | **Keep** (§19.11) | |
| Publish (schedule + auto-post to connected accounts, mock) | **Cut permanently** | Violates §0.1 #3 |
| Analytics + Insights | **Merge → Results** (§19.12), credibility metrics added | Matches the brand report |
| Settings (per-user AI provider and key) | **Cut → org-level AI setting** (§19.15) | No per-creator secrets |
| 20 one-click "seed batch" buttons and backfill action (`lib/actions.ts`, ~1,300 lines) | **Cut → one seed script** loading the Starter library | |
| Tour, Quickstart, Help bubble / menu, Version history | **Cut** | Text-minimal design (§13.6): no helper paragraphs, no tours |
| Landing page + hero video | **Cut** | Internal system; root URL is sign-in |
| Single-user auth (shared password / per-user signup) | **Replace** with Auth.js roles (§14); a creator user is scoped to one `creator_id` | Multi-user |
| Upcreate visual style (lime on parchment, rounded cards, Instrument Serif) | **Replace** with the Crew design system (§13) | One brand across both sides |
