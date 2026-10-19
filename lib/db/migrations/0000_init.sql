CREATE TYPE "public"."account_status" AS ENUM('new', 'established');--> statement-breakpoint
CREATE TYPE "public"."activity_kind" AS ENUM('note', 'email', 'call', 'stage_change', 'override', 'file');--> statement-breakpoint
CREATE TYPE "public"."addon_kind" AS ENUM('usage', 'rush', 'revision', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."agreement_status" AS ENUM('pilot', 'active', 'exit_window_open', 'exited');--> statement-breakpoint
CREATE TYPE "public"."ai_provider" AS ENUM('gemini', 'openai', 'anthropic', 'custom');--> statement-breakpoint
CREATE TYPE "public"."brand_category" AS ENUM('ai_tool', 'dev_tool', 'saas', 'fintech', 'edtech', 'vc', 'consumer', 'enterprise', 'other');--> statement-breakpoint
CREATE TYPE "public"."calendar_kind" AS ENUM('anchor', 'derivative', 'sponsored', 'organic', 'shoot', 'blackout');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('planning', 'active', 'reporting', 'closed');--> statement-breakpoint
CREATE TYPE "public"."carousel_cta" AS ENUM('save', 'share', 'comment', 'follow', 'link');--> statement-breakpoint
CREATE TYPE "public"."challenge_status" AS ENUM('draft', 'open', 'judging', 'closed');--> statement-breakpoint
CREATE TYPE "public"."checkin_type" AS ENUM('quarterly', 'strategy_refresh', 'roadmap', 'adhoc', 'pilot_end', 'exit_window');--> statement-breakpoint
CREATE TYPE "public"."concept_bucket" AS ENUM('proven', 'double_down', 'experimental');--> statement-breakpoint
CREATE TYPE "public"."consent_status" AS ENUM('none', 'opted_in', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('educational', 'storytelling', 'authority', 'other');--> statement-breakpoint
CREATE TYPE "public"."creator_source" AS ENUM('program', 'frontseat', 'ayush_network', 'referral', 'inbound', 'outbound', 'event');--> statement-breakpoint
CREATE TYPE "public"."creator_stage" AS ENUM('scout', 'watchlist', 'incubation', 'roster', 'alumni', 'revisit', 'declined');--> statement-breakpoint
CREATE TYPE "public"."cta_type" AS ENUM('follow', 'engagement', 'manychat', 'none');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('INR', 'USD');--> statement-breakpoint
CREATE TYPE "public"."deal_creator_role" AS ENUM('primary', 'upsell');--> statement-breakpoint
CREATE TYPE "public"."deal_creator_status" AS ENUM('proposed', 'accepted', 'declined_by_creator');--> statement-breakpoint
CREATE TYPE "public"."deal_origin" AS ENUM('crew_originated', 'creator_inbound', 'frontseat_lead', 'snoball_referral', 'owled_referral');--> statement-breakpoint
CREATE TYPE "public"."deal_stage" AS ENUM('lead', 'qualified', 'brief_received', 'creator_matched', 'proposal_sent', 'negotiation', 'signed', 'advance_received', 'in_production', 'live', 'reported', 'paid_in_full', 'declined', 'lost');--> statement-breakpoint
CREATE TYPE "public"."deal_type" AS ENUM('pilot', 'retainer', 'quarterly', 'annual', 'one_off');--> statement-breakpoint
CREATE TYPE "public"."deliverable_status" AS ENUM('briefed', 'drafting', 'in_review', 'approved', 'scheduled', 'live', 'reported', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."disclosure_standard" AS ENUM('asci', 'ftc', 'both');--> statement-breakpoint
CREATE TYPE "public"."effort" AS ENUM('low', 'default', 'high');--> statement-breakpoint
CREATE TYPE "public"."entry_outcome" AS ENUM('tier0', 'revisit', 'pass', 'brand_commission');--> statement-breakpoint
CREATE TYPE "public"."evidence_kind" AS ENUM('shipped_product', 'repo', 'employment', 'cited_by_practitioners', 'paper', 'benchmark', 'tutorial_series', 'other');--> statement-breakpoint
CREATE TYPE "public"."filter_context" AS ENUM('scout', 'challenge', 'watchlist_review', 'incubation_review', 'roster_review', 'quarterly');--> statement-breakpoint
CREATE TYPE "public"."funnel_stage" AS ENUM('tofu', 'mofu', 'bofu');--> statement-breakpoint
CREATE TYPE "public"."inbox_channel" AS ENUM('email', 'instagram_dm', 'linkedin', 'x', 'whatsapp', 'form');--> statement-breakpoint
CREATE TYPE "public"."inbox_status" AS ENUM('new', 'triaged', 'replied', 'converted', 'declined', 'spam');--> statement-breakpoint
CREATE TYPE "public"."intern_function" AS ENUM('research', 'deal_desk');--> statement-breakpoint
CREATE TYPE "public"."invoice_kind" AS ENUM('advance', 'balance', 'usage_renewal', 'other');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'paid', 'overdue', 'void');--> statement-breakpoint
CREATE TYPE "public"."outlier_source" AS ENUM('keyword', 'creator', 'recommendation');--> statement-breakpoint
CREATE TYPE "public"."override_kind" AS ENUM('no_list', 'below_lucrative', 'tier0_in_deal', 'go_live_without_advance', 'go_live_without_po', 'min_deal', 'other');--> statement-breakpoint
CREATE TYPE "public"."owner_team" AS ENUM('crew', 'owled_social', 'snoball', 'shared');--> statement-breakpoint
CREATE TYPE "public"."payout_kind" AS ENUM('fee_advance', 'fee_balance', 'upsell_share', 'referral_share');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('due', 'paid', 'held');--> statement-breakpoint
CREATE TYPE "public"."pillar" AS ENUM('authority', 'journey');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('instagram', 'youtube', 'x', 'linkedin', 'newsletter', 'other');--> statement-breakpoint
CREATE TYPE "public"."programme" AS ENUM('creatorpreneur', 'creator_marketer', 'next_gen_business', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."roadmap_area" AS ENUM('platform_audience', 'own_product', 'speaking_press', 'advisory_fund_board');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'crew_lead', 'ops', 'strategist', 'intern', 'sales_viewer', 'finance_viewer', 'program_counterpart', 'brand_user', 'creator_user');--> statement-breakpoint
CREATE TYPE "public"."rung" AS ENUM('lucrative', 'semi', 'standard', 'pitch', 'premium');--> statement-breakpoint
CREATE TYPE "public"."script_status" AS ENUM('draft', 'ready', 'filmed', 'posted');--> statement-breakpoint
CREATE TYPE "public"."slide_role" AS ENUM('hook', 'body', 'cta');--> statement-breakpoint
CREATE TYPE "public"."studio_status" AS ENUM('idea', 'researched', 'scripted', 'filmed', 'edited', 'posted');--> statement-breakpoint
CREATE TYPE "public"."sub_category" AS ENUM('ai_educator', 'builder_engineer', 'founder_operator', 'vc_analyst', 'enterprise_tech');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('T0', 'T1', 'T2', 'T3');--> statement-breakpoint
CREATE TYPE "public"."tier_signal_kind" AS ENUM('inbound_founder', 'inbound_brand', 'speaking', 'podcast', 'press', 'newsletter_subs', 'community', 'prior_enterprise_deal', 'prior_vc_deal', 'advisory_role', 'other');--> statement-breakpoint
CREATE TYPE "public"."topic_filter_kind" AS ENUM('category', 'competitor', 'claim', 'format', 'brand');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "addons" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"pct" numeric,
	"kind" "addon_kind" NOT NULL,
	"days" integer,
	"note" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"provider" "ai_provider" DEFAULT 'gemini' NOT NULL,
	"api_key" text DEFAULT '' NOT NULL,
	"model" text DEFAULT '' NOT NULL,
	"custom_endpoint" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"generator" text NOT NULL,
	"provider" text NOT NULL,
	"tokens_est" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text,
	"entity" text NOT NULL,
	"entity_id" text,
	"action" text NOT NULL,
	"detail" jsonb
);
--> statement-breakpoint
CREATE TABLE "blocklist_categories" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"email" text,
	"phone" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"portal_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "brand_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"campaign_id" uuid,
	"kind" text DEFAULT 'campaign_5q' NOT NULL,
	"submitted_on" date NOT NULL,
	"q1" integer,
	"q2" integer,
	"q3" integer,
	"q4" integer,
	"q5" integer,
	"nps" integer,
	"comment" text,
	"shared_with_creator" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"category" "brand_category" DEFAULT 'other' NOT NULL,
	"owner_team" "owner_team" DEFAULT 'crew' NOT NULL,
	"is_house_client" boolean DEFAULT false NOT NULL,
	"risk_flags" text[] DEFAULT '{}' NOT NULL,
	"risk_reviewed_at" timestamp with time zone,
	"risk_reviewed_by" text,
	"risk_note" text,
	"nps_latest" integer,
	"nps_as_of" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"deal_id" uuid NOT NULL,
	"name" text NOT NULL,
	"starts_on" date,
	"ends_on" date,
	"status" "campaign_status" DEFAULT 'planning' NOT NULL,
	"report_url" text,
	"report_md" text,
	"reported_at" timestamp with time zone,
	"feedback_requested_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone,
	CONSTRAINT "campaigns_deal_id_unique" UNIQUE("deal_id")
);
--> statement-breakpoint
CREATE TABLE "commission_rules" (
	"origin" "deal_origin" PRIMARY KEY NOT NULL,
	"pct" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_agreement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"pilot_started_on" date,
	"pilot_ends_on" date,
	"partnership_started_on" date,
	"partnership_ends_on" date,
	"exit_window_at" date,
	"exit_threshold_md" text,
	"exclusive" boolean DEFAULT true NOT NULL,
	"agreement_url" text,
	"status" "agreement_status" DEFAULT 'pilot' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone,
	CONSTRAINT "creator_agreement_creator_id_unique" UNIQUE("creator_id")
);
--> statement-breakpoint
CREATE TABLE "creator_anchor_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"anchor_format" text NOT NULL,
	"cadence_note" text,
	"sponsored_ratio_max" numeric DEFAULT 0.25 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone,
	CONSTRAINT "creator_anchor_plan_creator_id_unique" UNIQUE("creator_id")
);
--> statement-breakpoint
CREATE TABLE "creator_blackouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_calendar_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"date" date NOT NULL,
	"kind" "calendar_kind" DEFAULT 'organic' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"platform" "platform" DEFAULT 'instagram',
	"status" text,
	"deliverable_id" uuid,
	"campaign_id" uuid,
	"pillar" "pillar" DEFAULT 'authority',
	"concept_bucket" "concept_bucket" DEFAULT 'proven',
	"content_type" "content_type" DEFAULT 'educational',
	"topic" text,
	"angle" text,
	"format" text,
	"cta_type" "cta_type" DEFAULT 'follow',
	"funnel_stage" "funnel_stage" DEFAULT 'tofu',
	"effort" "effort" DEFAULT 'default',
	"topic_tag" text,
	"segment" text,
	"studio_status" "studio_status" DEFAULT 'idea' NOT NULL,
	"script_id" uuid,
	"carousel_id" uuid,
	"live_url" text,
	"notes" text,
	"proposed_by_user_id" text,
	"shoot_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"type" "checkin_type" NOT NULL,
	"due_on" date NOT NULL,
	"held_on" date,
	"held_by" text,
	"notes_md" text,
	"outcomes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"kind" "evidence_kind" NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_filter_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"scored_at" timestamp with time zone DEFAULT now() NOT NULL,
	"scored_by" text,
	"aesthetics" integer NOT NULL,
	"taste" integer NOT NULL,
	"personality" integer NOT NULL,
	"total" integer NOT NULL,
	"sentence" text NOT NULL,
	"context" "filter_context" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"kind" "payout_kind" NOT NULL,
	"triggered_by_invoice_id" uuid,
	"due_on" date NOT NULL,
	"amount_paise" bigint NOT NULL,
	"currency" "currency" DEFAULT 'INR' NOT NULL,
	"tds_pct" numeric DEFAULT 0 NOT NULL,
	"status" "payout_status" DEFAULT 'due' NOT NULL,
	"paid_on" date,
	"reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"platform" "platform" NOT NULL,
	"handle" text NOT NULL,
	"url" text,
	"followers" integer,
	"followers_as_of" date,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"handle" text DEFAULT '' NOT NULL,
	"name_field" text DEFAULT '' NOT NULL,
	"niche" text DEFAULT '' NOT NULL,
	"subniches" text[] DEFAULT '{}' NOT NULL,
	"occupation" text DEFAULT '' NOT NULL,
	"founder_story" text DEFAULT '' NOT NULL,
	"bio_link" text DEFAULT '' NOT NULL,
	"colors" jsonb,
	"fonts" jsonb,
	"asset_types" text[] DEFAULT '{}' NOT NULL,
	"account_status" "account_status" DEFAULT 'new' NOT NULL,
	"pillar_ratio" jsonb DEFAULT '{"authority":70,"journey":30}'::jsonb NOT NULL,
	"concept_ratio" jsonb DEFAULT '{"proven":90,"double_down":0,"experimental":10}'::jsonb NOT NULL,
	"posting_cadence" jsonb DEFAULT '{"tier":"light","times_per_week":"1-2","days":[]}'::jsonb NOT NULL,
	"hook_prefs" text[] DEFAULT '{"verbal","written"}' NOT NULL,
	"format_prefs" text[] DEFAULT '{"whiteboard","voiceover_broll"}' NOT NULL,
	"cta_status" text DEFAULT 'undecided' NOT NULL,
	"manychat_setup" boolean DEFAULT false NOT NULL,
	"equipment" text[] DEFAULT '{}' NOT NULL,
	"ai_stack" text[] DEFAULT '{}' NOT NULL,
	"automate_workflows" text[] DEFAULT '{}' NOT NULL,
	"human_alpha" text DEFAULT '' NOT NULL,
	"proprietary_value" text DEFAULT '' NOT NULL,
	"journey_assets" text DEFAULT '' NOT NULL,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone,
	CONSTRAINT "creator_profiles_creator_id_unique" UNIQUE("creator_id")
);
--> statement-breakpoint
CREATE TABLE "creator_roadmap_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"area" "roadmap_area" NOT NULL,
	"goal" text NOT NULL,
	"crew_contribution" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_standard_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"deliverable_key" text NOT NULL,
	"standard_paise" bigint NOT NULL,
	"currency" "currency" DEFAULT 'INR' NOT NULL,
	"set_at" timestamp with time zone DEFAULT now() NOT NULL,
	"set_by" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_tier_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"kind" "tier_signal_kind" NOT NULL,
	"description" text NOT NULL,
	"url" text,
	"date" date,
	"weight" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_topic_filters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"kind" "topic_filter_kind" NOT NULL,
	"value" text NOT NULL,
	"reason" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"legal_name" text,
	"email" text,
	"phone" text,
	"city" text,
	"country" text DEFAULT 'IN',
	"timezone" text DEFAULT 'Asia/Kolkata',
	"stage" "creator_stage" DEFAULT 'scout' NOT NULL,
	"stage_changed_at" timestamp with time zone DEFAULT now(),
	"stage_reason" text,
	"revisit_on" date,
	"previous_stage" "creator_stage",
	"tier" "tier",
	"tier_proposed" "tier",
	"tier_proposed_by" text,
	"tier_approved_by" text,
	"tier_reviewed_at" timestamp with time zone,
	"tier_next_review_at" date,
	"sub_category" "sub_category" NOT NULL,
	"secondary_sub_category" "sub_category",
	"primary_platform" "platform" DEFAULT 'instagram' NOT NULL,
	"languages" text[] DEFAULT '{"en"}' NOT NULL,
	"source" "creator_source" NOT NULL,
	"source_detail" text,
	"referred_by_creator_id" uuid,
	"is_employed_elsewhere" boolean DEFAULT false NOT NULL,
	"employer_disclosure_url" text,
	"is_founder" boolean DEFAULT false NOT NULL,
	"own_product_content_pct" numeric,
	"is_pseudonymous" boolean DEFAULT false NOT NULL,
	"identity_verified_privately" boolean DEFAULT false NOT NULL,
	"represented_elsewhere" boolean,
	"representation_note" text,
	"consent_status" "consent_status" DEFAULT 'none' NOT NULL,
	"first_look_until" date,
	"roster_proposed_at" timestamp with time zone,
	"roster_proposed_by" text,
	"roster_approved_by" text,
	"alumni_reason" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "deal_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"by" text,
	"kind" "activity_kind" NOT NULL,
	"body_md" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "deal_creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"role" "deal_creator_role" DEFAULT 'primary' NOT NULL,
	"status" "deal_creator_status" DEFAULT 'proposed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "deal_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"kind" "override_kind" NOT NULL,
	"requested_by" text NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "deal_quote_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"deliverable_key" text NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"standard_paise" bigint NOT NULL,
	"standard_is_default" boolean DEFAULT false NOT NULL,
	"rung" "rung" DEFAULT 'standard' NOT NULL,
	"addons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"line_total_paise" bigint NOT NULL,
	"note" text,
	"is_case_by_case" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"title" text NOT NULL,
	"owner_user_id" text,
	"stage" "deal_stage" DEFAULT 'lead' NOT NULL,
	"stage_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" "deal_type",
	"one_off_reason" text,
	"origin" "deal_origin" DEFAULT 'crew_originated' NOT NULL,
	"originating_creator_id" uuid,
	"commission_pct" numeric DEFAULT 20 NOT NULL,
	"currency" "currency" DEFAULT 'INR' NOT NULL,
	"quoted_total_paise" bigint DEFAULT 0 NOT NULL,
	"signed_total_paise" bigint,
	"term_starts_on" date,
	"term_ends_on" date,
	"pieces_per_month" integer,
	"pause_used" boolean DEFAULT false NOT NULL,
	"exclusivity" jsonb DEFAULT '{"scope":"none","days":0}'::jsonb NOT NULL,
	"usage_rights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"frontseat_amplification" boolean DEFAULT false NOT NULL,
	"brief_md" text,
	"brief_url" text,
	"brief_tags" text[] DEFAULT '{}' NOT NULL,
	"referral_note" text,
	"sow_url" text,
	"sow_md" text,
	"po_reference" text,
	"confirmation_url" text,
	"confirmation_received_at" timestamp with time zone,
	"report_url" text,
	"ladder_version_id" uuid,
	"no_list_check" jsonb,
	"declined_reason" text,
	"declined_value_paise" bigint,
	"lost_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "deliverable_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deliverable_id" uuid NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"saves" integer,
	"shares" integer,
	"comments_decision_maker" integer,
	"inbound_to_brand" integer,
	"tracked_signups" integer,
	"impressions" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "deliverable_types" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"platform" "platform" NOT NULL,
	"default_multiple_of_reel" numeric NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"deliverable_key" text NOT NULL,
	"platform" "platform" DEFAULT 'instagram' NOT NULL,
	"title" text NOT NULL,
	"channel" text,
	"brief_tags" text[] DEFAULT '{}' NOT NULL,
	"due_on" date,
	"scheduled_for" date,
	"live_at" timestamp with time zone,
	"live_url" text,
	"status" "deliverable_status" DEFAULT 'briefed' NOT NULL,
	"revision_round" integer DEFAULT 0 NOT NULL,
	"disclosure_checked" boolean DEFAULT false NOT NULL,
	"disclosure_standard" "disclosure_standard" DEFAULT 'asci' NOT NULL,
	"claims_approved_by_brand" boolean DEFAULT false NOT NULL,
	"approved_by_contact_id" uuid,
	"draft_md" text,
	"draft_script_id" uuid,
	"draft_carousel_id" uuid,
	"brand_change_request_md" text,
	"warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "dev_mail" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "filter_rubric" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"dimensions" text[] NOT NULL,
	"scale_min" integer DEFAULT 1 NOT NULL,
	"scale_max" integer DEFAULT 5 NOT NULL,
	"thresholds" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbox_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid,
	"brand_id" uuid,
	"channel" "inbox_channel" NOT NULL,
	"from_name" text,
	"from_address" text,
	"subject" text DEFAULT '' NOT NULL,
	"first_message_md" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sla_due_at" timestamp with time zone NOT NULL,
	"status" "inbox_status" DEFAULT 'new' NOT NULL,
	"deal_id" uuid,
	"handled_by" text,
	"no_list_prescreen" jsonb,
	"reply_md" text,
	"replied_at" timestamp with time zone,
	"forwarded_to_creator_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"kind" "invoice_kind" NOT NULL,
	"number" text NOT NULL,
	"issued_by_entity" text DEFAULT 'OWLED' NOT NULL,
	"issued_on" date NOT NULL,
	"due_on" date NOT NULL,
	"amount_paise" bigint NOT NULL,
	"currency" "currency" DEFAULT 'INR' NOT NULL,
	"gst_pct" numeric DEFAULT 18 NOT NULL,
	"tds_pct" numeric DEFAULT 0 NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"paid_on" date,
	"paid_amount_paise" bigint,
	"reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ladders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"effective_from" date NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"rungs" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "no_list_items" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cohort_id" uuid NOT NULL,
	"title" text NOT NULL,
	"brand_id" uuid,
	"brief_md" text DEFAULT '' NOT NULL,
	"opens_at" timestamp with time zone NOT NULL,
	"closes_at" timestamp with time zone NOT NULL,
	"status" "challenge_status" DEFAULT 'draft' NOT NULL,
	"judges" text[] DEFAULT '{}' NOT NULL,
	"top_n" integer DEFAULT 7 NOT NULL,
	"capacity_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "program_cohorts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programme" "programme" NOT NULL,
	"batch_label" text NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"counterpart_name" text,
	"counterpart_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "program_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"consent_status" "consent_status" DEFAULT 'none' NOT NULL,
	"declared_sub_category" "sub_category",
	"declared_platform" "platform",
	"submission_url" text,
	"note_md" text,
	"submitted_at" timestamp with time zone,
	"filter_score_id" uuid,
	"rank" integer,
	"outcome" "entry_outcome",
	"outcome_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "program_interns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_name" text NOT NULL,
	"email" text,
	"cohort_id" uuid,
	"starts_on" date,
	"ends_on" date,
	"function" "intern_function" NOT NULL,
	"converted_to_creator_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "program_sunday_shoots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"location" text NOT NULL,
	"creators" uuid[] DEFAULT '{}' NOT NULL,
	"attended" uuid[] DEFAULT '{}' NOT NULL,
	"crew_lead_user_id" text,
	"notes_md" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" numeric NOT NULL,
	"label" text NOT NULL,
	"unit" text
);
--> statement-breakpoint
CREATE TABLE "studio_carousel_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carousel_id" uuid NOT NULL,
	"slide_number" integer NOT NULL,
	"slide_role" "slide_role" DEFAULT 'body' NOT NULL,
	"headline" text DEFAULT '' NOT NULL,
	"supporting_text" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_carousels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid,
	"title" text DEFAULT 'Untitled carousel' NOT NULL,
	"pillar" "pillar" DEFAULT 'authority' NOT NULL,
	"content_type" "content_type" DEFAULT 'educational' NOT NULL,
	"archetype" text DEFAULT 'listicle' NOT NULL,
	"cta_type" "carousel_cta" DEFAULT 'save' NOT NULL,
	"funnel_stage" "funnel_stage" DEFAULT 'tofu' NOT NULL,
	"status" "script_status" DEFAULT 'draft' NOT NULL,
	"topic_tag" text DEFAULT '' NOT NULL,
	"segment" text DEFAULT '' NOT NULL,
	"slide_count" integer DEFAULT 0 NOT NULL,
	"background_style" text DEFAULT 'solid' NOT NULL,
	"background_category" text DEFAULT '' NOT NULL,
	"design_notes" text DEFAULT '' NOT NULL,
	"deliverable_id" uuid,
	"cloned_from_id" uuid,
	"seed_batch" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio_hook_stacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"written" text DEFAULT '' NOT NULL,
	"verbal" text DEFAULT '' NOT NULL,
	"visual" text DEFAULT '' NOT NULL,
	"angle" text DEFAULT '' NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"saved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio_outliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"source_type" "outlier_source" DEFAULT 'keyword' NOT NULL,
	"creator_handle" text DEFAULT '' NOT NULL,
	"link" text DEFAULT '' NOT NULL,
	"niche_keyword" text DEFAULT '' NOT NULL,
	"follower_count" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"hook_written" text DEFAULT '' NOT NULL,
	"hook_verbal" text DEFAULT '' NOT NULL,
	"hook_visual" text DEFAULT '' NOT NULL,
	"angle" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"posted_on" date NOT NULL,
	"platform" "platform" DEFAULT 'instagram' NOT NULL,
	"url" text,
	"pillar" "pillar" DEFAULT 'authority' NOT NULL,
	"format" text DEFAULT '' NOT NULL,
	"hook" text DEFAULT '' NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"followers_at_post" integer DEFAULT 0 NOT NULL,
	"saves" integer,
	"shares" integer,
	"comments_decision_maker" integer,
	"inbound" integer,
	"tracked_signups" integer,
	"notes" text DEFAULT '' NOT NULL,
	"calendar_item_id" uuid,
	"deliverable_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio_script_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid,
	"name" text DEFAULT 'Untitled template' NOT NULL,
	"pillar" "pillar" DEFAULT 'authority' NOT NULL,
	"angle" text DEFAULT '' NOT NULL,
	"source_note" text DEFAULT '' NOT NULL,
	"template_text" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio_scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid,
	"title" text DEFAULT 'Untitled script' NOT NULL,
	"pillar" "pillar" DEFAULT 'authority' NOT NULL,
	"content_type" "content_type" DEFAULT 'educational' NOT NULL,
	"angle_or_story_type" text DEFAULT '' NOT NULL,
	"format" text DEFAULT '' NOT NULL,
	"body_black" text DEFAULT '' NOT NULL,
	"body_red" text DEFAULT '' NOT NULL,
	"body_green" text DEFAULT '' NOT NULL,
	"cta_type" "cta_type" DEFAULT 'follow' NOT NULL,
	"funnel_stage" "funnel_stage" DEFAULT 'tofu' NOT NULL,
	"status" "script_status" DEFAULT 'draft' NOT NULL,
	"series_name" text DEFAULT '' NOT NULL,
	"effort" "effort" DEFAULT 'default' NOT NULL,
	"topic_tag" text DEFAULT '' NOT NULL,
	"segment" text DEFAULT '' NOT NULL,
	"concept_bucket" "concept_bucket",
	"deliverable_id" uuid,
	"shared_with_crew" boolean DEFAULT false NOT NULL,
	"cloned_from_id" uuid,
	"seed_batch" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"body_md" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tier_scale" (
	"tier" "tier" PRIMARY KEY NOT NULL,
	"multiple" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp with time zone,
	"image" text,
	"role" "role" DEFAULT 'intern' NOT NULL,
	"creator_id" uuid,
	"brand_id" uuid,
	"brand_contact_id" uuid,
	"cohort_ids" uuid[],
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_contacts" ADD CONSTRAINT "brand_contacts_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_feedback" ADD CONSTRAINT "brand_feedback_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_agreement" ADD CONSTRAINT "creator_agreement_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_anchor_plan" ADD CONSTRAINT "creator_anchor_plan_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_blackouts" ADD CONSTRAINT "creator_blackouts_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_calendar_items" ADD CONSTRAINT "creator_calendar_items_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_checkins" ADD CONSTRAINT "creator_checkins_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_evidence" ADD CONSTRAINT "creator_evidence_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_filter_scores" ADD CONSTRAINT "creator_filter_scores_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_payouts" ADD CONSTRAINT "creator_payouts_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_payouts" ADD CONSTRAINT "creator_payouts_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_platforms" ADD CONSTRAINT "creator_platforms_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_roadmap_items" ADD CONSTRAINT "creator_roadmap_items_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_standard_rates" ADD CONSTRAINT "creator_standard_rates_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_tier_signals" ADD CONSTRAINT "creator_tier_signals_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_topic_filters" ADD CONSTRAINT "creator_topic_filters_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_activity" ADD CONSTRAINT "deal_activity_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_creators" ADD CONSTRAINT "deal_creators_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_creators" ADD CONSTRAINT "deal_creators_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_overrides" ADD CONSTRAINT "deal_overrides_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_quote_lines" ADD CONSTRAINT "deal_quote_lines_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_quote_lines" ADD CONSTRAINT "deal_quote_lines_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverable_metrics" ADD CONSTRAINT "deliverable_metrics_deliverable_id_deliverables_id_fk" FOREIGN KEY ("deliverable_id") REFERENCES "public"."deliverables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_challenges" ADD CONSTRAINT "program_challenges_cohort_id_program_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."program_cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_entries" ADD CONSTRAINT "program_entries_challenge_id_program_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."program_challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_entries" ADD CONSTRAINT "program_entries_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_interns" ADD CONSTRAINT "program_interns_cohort_id_program_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."program_cohorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_carousel_slides" ADD CONSTRAINT "studio_carousel_slides_carousel_id_studio_carousels_id_fk" FOREIGN KEY ("carousel_id") REFERENCES "public"."studio_carousels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_carousels" ADD CONSTRAINT "studio_carousels_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_hook_stacks" ADD CONSTRAINT "studio_hook_stacks_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_outliers" ADD CONSTRAINT "studio_outliers_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_posts" ADD CONSTRAINT "studio_posts_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_script_templates" ADD CONSTRAINT "studio_script_templates_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_scripts" ADD CONSTRAINT "studio_scripts_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "calendar_creator_date_idx" ON "creator_calendar_items" USING btree ("creator_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_rate_unique" ON "creator_standard_rates" USING btree ("creator_id","deliverable_key","currency");--> statement-breakpoint
CREATE INDEX "creators_stage_idx" ON "creators" USING btree ("stage");--> statement-breakpoint
CREATE UNIQUE INDEX "deal_creator_unique" ON "deal_creators" USING btree ("deal_id","creator_id");--> statement-breakpoint
CREATE INDEX "deals_stage_idx" ON "deals" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "deliverables_creator_idx" ON "deliverables" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "scripts_creator_idx" ON "studio_scripts" USING btree ("creator_id");