// Snoball OS schema — BRIEF §3 (§3.1–§3.8). Money is integer paise + currency.
// Every domain table carries created_at, updated_at, created_by and archived_at (soft delete).
import {
  pgTable,
  pgEnum,
  text,
  uuid,
  integer,
  bigint,
  boolean,
  timestamp,
  date,
  jsonb,
  numeric,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

const money = (name: string) => bigint(name, { mode: "number" });

const audit = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  createdBy: text("created_by"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
};

// ---------- Enums ----------
export const roleEnum = pgEnum("role", [
  "owner",
  "crew_lead",
  "ops",
  "strategist",
  "intern",
  "sales_viewer",
  "finance_viewer",
  "program_counterpart",
  "brand_user",
  "creator_user",
]);
export const creatorStageEnum = pgEnum("creator_stage", ["scout", "watchlist", "incubation", "roster", "alumni", "revisit", "declined"]);
export const tierEnum = pgEnum("tier", ["T0", "T1", "T2", "T3"]);
export const subCategoryEnum = pgEnum("sub_category", ["ai_educator", "builder_engineer", "founder_operator", "vc_analyst", "enterprise_tech"]);
export const platformEnum = pgEnum("platform", ["instagram", "youtube", "x", "linkedin", "newsletter", "other"]);
export const creatorSourceEnum = pgEnum("creator_source", ["program", "frontseat", "ayush_network", "referral", "inbound", "outbound", "event"]);
export const consentEnum = pgEnum("consent_status", ["none", "opted_in", "withdrawn"]);
export const filterContextEnum = pgEnum("filter_context", ["scout", "challenge", "watchlist_review", "incubation_review", "roster_review", "quarterly"]);
export const tierSignalKindEnum = pgEnum("tier_signal_kind", [
  "inbound_founder",
  "inbound_brand",
  "speaking",
  "podcast",
  "press",
  "newsletter_subs",
  "community",
  "prior_enterprise_deal",
  "prior_vc_deal",
  "advisory_role",
  "other",
]);
export const evidenceKindEnum = pgEnum("evidence_kind", ["shipped_product", "repo", "employment", "cited_by_practitioners", "paper", "benchmark", "tutorial_series", "other"]);
export const agreementStatusEnum = pgEnum("agreement_status", ["pilot", "active", "exit_window_open", "exited"]);
export const topicFilterKindEnum = pgEnum("topic_filter_kind", ["category", "competitor", "claim", "format", "brand"]);
export const calendarKindEnum = pgEnum("calendar_kind", ["anchor", "derivative", "sponsored", "organic", "shoot", "blackout"]);
export const checkinTypeEnum = pgEnum("checkin_type", ["quarterly", "strategy_refresh", "roadmap", "adhoc", "pilot_end", "exit_window"]);
export const roadmapAreaEnum = pgEnum("roadmap_area", ["platform_audience", "own_product", "speaking_press", "advisory_fund_board"]);
export const programmeEnum = pgEnum("programme", ["creatorpreneur", "creator_marketer", "next_gen_business", "mixed"]);
export const challengeStatusEnum = pgEnum("challenge_status", ["draft", "open", "judging", "closed"]);
export const entryOutcomeEnum = pgEnum("entry_outcome", ["tier0", "revisit", "pass", "brand_commission"]);
export const internFunctionEnum = pgEnum("intern_function", ["research", "deal_desk"]);
export const brandCategoryEnum = pgEnum("brand_category", ["ai_tool", "dev_tool", "saas", "fintech", "edtech", "vc", "consumer", "enterprise", "other"]);
export const ownerTeamEnum = pgEnum("owner_team", ["crew", "owled_social", "snoball", "shared"]);
export const inboxChannelEnum = pgEnum("inbox_channel", ["email", "instagram_dm", "linkedin", "x", "whatsapp", "form"]);
export const inboxStatusEnum = pgEnum("inbox_status", ["new", "triaged", "replied", "converted", "declined", "spam"]);
export const dealStageEnum = pgEnum("deal_stage", [
  "lead",
  "qualified",
  "brief_received",
  "creator_matched",
  "proposal_sent",
  "negotiation",
  "signed",
  "advance_received",
  "in_production",
  "live",
  "reported",
  "paid_in_full",
  "declined",
  "lost",
]);
export const dealTypeEnum = pgEnum("deal_type", ["pilot", "retainer", "quarterly", "annual", "one_off"]);
export const dealOriginEnum = pgEnum("deal_origin", ["crew_originated", "creator_inbound", "frontseat_lead", "snoball_referral", "owled_referral"]);
export const dealCreatorRoleEnum = pgEnum("deal_creator_role", ["primary", "upsell"]);
export const dealCreatorStatusEnum = pgEnum("deal_creator_status", ["proposed", "accepted", "declined_by_creator"]);
export const rungEnum = pgEnum("rung", ["lucrative", "semi", "standard", "pitch", "premium"]);
export const overrideKindEnum = pgEnum("override_kind", [
  "no_list",
  "below_lucrative",
  "tier0_in_deal",
  "go_live_without_advance",
  "go_live_without_po",
  "min_deal",
  "other",
]);
export const activityKindEnum = pgEnum("activity_kind", ["note", "email", "call", "stage_change", "override", "file"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["planning", "active", "reporting", "closed"]);
export const deliverableStatusEnum = pgEnum("deliverable_status", ["briefed", "drafting", "in_review", "approved", "scheduled", "live", "reported", "cancelled"]);
export const disclosureEnum = pgEnum("disclosure_standard", ["asci", "ftc", "both"]);
export const invoiceKindEnum = pgEnum("invoice_kind", ["advance", "balance", "usage_renewal", "other"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "sent", "paid", "overdue", "void"]);
export const payoutKindEnum = pgEnum("payout_kind", ["fee_advance", "fee_balance", "upsell_share", "referral_share"]);
export const payoutStatusEnum = pgEnum("payout_status", ["due", "paid", "held"]);
export const addonKindEnum = pgEnum("addon_kind", ["usage", "rush", "revision", "blocked"]);
export const currencyEnum = pgEnum("currency", ["INR", "USD"]);
// Studio (§3.8)
export const pillarEnum = pgEnum("pillar", ["authority", "journey"]);
export const conceptBucketEnum = pgEnum("concept_bucket", ["proven", "double_down", "experimental"]);
export const contentTypeEnum = pgEnum("content_type", ["educational", "storytelling", "authority", "other"]);
export const ctaTypeEnum = pgEnum("cta_type", ["follow", "engagement", "manychat", "none"]);
export const funnelStageEnum = pgEnum("funnel_stage", ["tofu", "mofu", "bofu"]);
export const effortEnum = pgEnum("effort", ["low", "default", "high"]);
export const studioStatusEnum = pgEnum("studio_status", ["idea", "researched", "scripted", "filmed", "edited", "posted"]);
export const accountStatusEnum = pgEnum("account_status", ["new", "established"]);
export const outlierSourceEnum = pgEnum("outlier_source", ["keyword", "creator", "recommendation"]);
export const scriptStatusEnum = pgEnum("script_status", ["draft", "ready", "filmed", "posted"]);
export const carouselCtaEnum = pgEnum("carousel_cta", ["save", "share", "comment", "follow", "link"]);
export const slideRoleEnum = pgEnum("slide_role", ["hook", "body", "cta"]);
export const aiProviderEnum = pgEnum("ai_provider", ["gemini", "openai", "anthropic", "custom"]);

// ---------- Auth.js (users, accounts, sessions, verification tokens) ----------
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),
  role: roleEnum("role").notNull().default("intern"),
  creatorId: uuid("creator_id"),
  brandId: uuid("brand_id"),
  brandContactId: uuid("brand_contact_id"),
  cohortIds: uuid("cohort_ids").array(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// Development mailbox: magic links are stored here when no SMTP server is configured.
export const devMail = pgTable("dev_mail", {
  id: uuid("id").primaryKey().defaultRandom(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- 3.1 Creator ----------
export const creators = pgTable(
  "creators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    displayName: text("display_name").notNull(),
    legalName: text("legal_name"),
    email: text("email"),
    phone: text("phone"),
    city: text("city"),
    country: text("country").default("IN"),
    timezone: text("timezone").default("Asia/Kolkata"),
    stage: creatorStageEnum("stage").notNull().default("scout"),
    stageChangedAt: timestamp("stage_changed_at", { withTimezone: true }).defaultNow(),
    stageReason: text("stage_reason"),
    revisitOn: date("revisit_on"),
    previousStage: creatorStageEnum("previous_stage"),
    tier: tierEnum("tier"), // internal only; by signal
    tierProposed: tierEnum("tier_proposed"),
    tierProposedBy: text("tier_proposed_by"),
    tierApprovedBy: text("tier_approved_by"),
    tierReviewedAt: timestamp("tier_reviewed_at", { withTimezone: true }),
    tierNextReviewAt: date("tier_next_review_at"),
    subCategory: subCategoryEnum("sub_category").notNull(),
    secondarySubCategory: subCategoryEnum("secondary_sub_category"),
    primaryPlatform: platformEnum("primary_platform").notNull().default("instagram"),
    languages: text("languages").array().notNull().default(["en"]),
    source: creatorSourceEnum("source").notNull(),
    sourceDetail: text("source_detail"),
    referredByCreatorId: uuid("referred_by_creator_id"),
    isEmployedElsewhere: boolean("is_employed_elsewhere").notNull().default(false),
    employerDisclosureUrl: text("employer_disclosure_url"),
    isFounder: boolean("is_founder").notNull().default(false),
    ownProductContentPct: numeric("own_product_content_pct", { mode: "number" }),
    isPseudonymous: boolean("is_pseudonymous").notNull().default(false),
    identityVerifiedPrivately: boolean("identity_verified_privately").notNull().default(false),
    representedElsewhere: boolean("represented_elsewhere"), // null = not yet noted
    representationNote: text("representation_note"),
    consentStatus: consentEnum("consent_status").notNull().default("none"),
    firstLookUntil: date("first_look_until"),
    rosterProposedAt: timestamp("roster_proposed_at", { withTimezone: true }),
    rosterProposedBy: text("roster_proposed_by"),
    rosterApprovedBy: text("roster_approved_by"),
    alumniReason: text("alumni_reason"),
    notes: text("notes"),
    ...audit,
  },
  (t) => [index("creators_stage_idx").on(t.stage)],
);

export const creatorPlatforms = pgTable("creator_platforms", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  handle: text("handle").notNull(),
  url: text("url"),
  followers: integer("followers"), // grey metadata only
  followersAsOf: date("followers_as_of"),
  isPrimary: boolean("is_primary").notNull().default(false),
  ...audit,
});

export const creatorFilterScores = pgTable("creator_filter_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  scoredAt: timestamp("scored_at", { withTimezone: true }).notNull().defaultNow(),
  scoredBy: text("scored_by"),
  aesthetics: integer("aesthetics").notNull(),
  taste: integer("taste").notNull(),
  personality: integer("personality").notNull(),
  total: integer("total").notNull(),
  sentence: text("sentence").notNull(),
  context: filterContextEnum("context").notNull(),
  ...audit,
});

export const creatorTierSignals = pgTable("creator_tier_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  kind: tierSignalKindEnum("kind").notNull(),
  description: text("description").notNull(),
  url: text("url"),
  date: date("date"),
  weight: integer("weight").notNull().default(1),
  ...audit,
});

export const creatorEvidence = pgTable("creator_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  kind: evidenceKindEnum("kind").notNull(),
  title: text("title").notNull(),
  url: text("url"),
  date: date("date"),
  ...audit,
});

export const creatorStandardRates = pgTable(
  "creator_standard_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
    deliverableKey: text("deliverable_key").notNull(),
    standardPaise: money("standard_paise").notNull(),
    currency: currencyEnum("currency").notNull().default("INR"),
    setAt: timestamp("set_at", { withTimezone: true }).notNull().defaultNow(),
    setBy: text("set_by"),
    note: text("note"),
    ...audit,
  },
  (t) => [uniqueIndex("creator_rate_unique").on(t.creatorId, t.deliverableKey, t.currency)],
);

export const creatorAgreements = pgTable("creator_agreement", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }).unique(),
  pilotStartedOn: date("pilot_started_on"),
  pilotEndsOn: date("pilot_ends_on"),
  partnershipStartedOn: date("partnership_started_on"),
  partnershipEndsOn: date("partnership_ends_on"),
  exitWindowAt: date("exit_window_at"),
  exitThresholdMd: text("exit_threshold_md"),
  exclusive: boolean("exclusive").notNull().default(true),
  agreementUrl: text("agreement_url"),
  status: agreementStatusEnum("status").notNull().default("pilot"),
  ...audit,
});

export const creatorTopicFilters = pgTable("creator_topic_filters", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  kind: topicFilterKindEnum("kind").notNull(),
  value: text("value").notNull(),
  reason: text("reason"),
  active: boolean("active").notNull().default(true),
  ...audit,
});

export const creatorAnchorPlans = pgTable("creator_anchor_plan", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }).unique(),
  anchorFormat: text("anchor_format").notNull(),
  cadenceNote: text("cadence_note"),
  sponsoredRatioMax: numeric("sponsored_ratio_max", { mode: "number" }).notNull().default(0.25),
  ...audit,
});

export const creatorBlackouts = pgTable("creator_blackouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  startsOn: date("starts_on").notNull(),
  endsOn: date("ends_on").notNull(),
  note: text("note"),
  ...audit,
});

export const creatorCalendarItems = pgTable(
  "creator_calendar_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    kind: calendarKindEnum("kind").notNull().default("organic"),
    title: text("title").notNull().default(""),
    platform: platformEnum("platform").default("instagram"),
    status: text("status"),
    deliverableId: uuid("deliverable_id"),
    campaignId: uuid("campaign_id"),
    // §3.8 Studio extensions
    pillar: pillarEnum("pillar").default("authority"),
    conceptBucket: conceptBucketEnum("concept_bucket").default("proven"),
    contentType: contentTypeEnum("content_type").default("educational"),
    topic: text("topic"),
    angle: text("angle"),
    format: text("format"),
    ctaType: ctaTypeEnum("cta_type").default("follow"),
    funnelStage: funnelStageEnum("funnel_stage").default("tofu"),
    effort: effortEnum("effort").default("default"),
    topicTag: text("topic_tag"),
    segment: text("segment"),
    studioStatus: studioStatusEnum("studio_status").notNull().default("idea"),
    scriptId: uuid("script_id"),
    carouselId: uuid("carousel_id"),
    liveUrl: text("live_url"),
    notes: text("notes"),
    proposedByUserId: text("proposed_by_user_id"),
    shootId: uuid("shoot_id"),
    ...audit,
  },
  (t) => [index("calendar_creator_date_idx").on(t.creatorId, t.date)],
);

export const creatorCheckins = pgTable("creator_checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  type: checkinTypeEnum("type").notNull(),
  dueOn: date("due_on").notNull(),
  heldOn: date("held_on"),
  heldBy: text("held_by"),
  notesMd: text("notes_md"),
  outcomes: jsonb("outcomes").$type<{
    tier_recommendation?: string;
    filter_rescore_id?: string;
    calendar_updated?: boolean;
    roadmap_items?: string[];
    introductions?: string[];
  }>(),
  ...audit,
});

export const creatorRoadmapItems = pgTable("creator_roadmap_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  area: roadmapAreaEnum("area").notNull(),
  goal: text("goal").notNull(),
  crewContribution: text("crew_contribution"),
  status: text("status").notNull().default("open"),
  ...audit,
});

// ---------- 3.2 Owled Creator Program ----------
export const programCohorts = pgTable("program_cohorts", {
  id: uuid("id").primaryKey().defaultRandom(),
  programme: programmeEnum("programme").notNull(),
  batchLabel: text("batch_label").notNull(),
  startsOn: date("starts_on").notNull(),
  endsOn: date("ends_on").notNull(),
  counterpartName: text("counterpart_name"),
  counterpartEmail: text("counterpart_email"),
  ...audit,
});

export const programChallenges = pgTable("program_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  cohortId: uuid("cohort_id").notNull().references(() => programCohorts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  brandId: uuid("brand_id"), // hidden from students until judged
  briefMd: text("brief_md").notNull().default(""),
  opensAt: timestamp("opens_at", { withTimezone: true }).notNull(),
  closesAt: timestamp("closes_at", { withTimezone: true }).notNull(),
  status: challengeStatusEnum("status").notNull().default("draft"),
  judges: text("judges").array().notNull().default([]),
  topN: integer("top_n").notNull().default(7),
  capacityNote: text("capacity_note"),
  ...audit,
});

export const programEntries = pgTable("program_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  challengeId: uuid("challenge_id").notNull().references(() => programChallenges.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  consentStatus: consentEnum("consent_status").notNull().default("none"),
  declaredSubCategory: subCategoryEnum("declared_sub_category"),
  declaredPlatform: platformEnum("declared_platform"),
  submissionUrl: text("submission_url"),
  noteMd: text("note_md"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  filterScoreId: uuid("filter_score_id"),
  rank: integer("rank"),
  outcome: entryOutcomeEnum("outcome"),
  outcomeNote: text("outcome_note"),
  ...audit,
});

export const programSundayShoots = pgTable("program_sunday_shoots", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  location: text("location").notNull(),
  creators: uuid("creators").array().notNull().default([]),
  attended: uuid("attended").array().notNull().default([]),
  crewLeadUserId: text("crew_lead_user_id"),
  notesMd: text("notes_md"),
  ...audit,
});

export const programInterns = pgTable("program_interns", {
  id: uuid("id").primaryKey().defaultRandom(),
  personName: text("person_name").notNull(),
  email: text("email"),
  cohortId: uuid("cohort_id").references(() => programCohorts.id),
  startsOn: date("starts_on"),
  endsOn: date("ends_on"),
  function: internFunctionEnum("function").notNull(),
  convertedToCreatorId: uuid("converted_to_creator_id"),
  ...audit,
});

// ---------- 3.3 Brands, contacts, inbox ----------
export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  website: text("website"),
  category: brandCategoryEnum("category").notNull().default("other"),
  ownerTeam: ownerTeamEnum("owner_team").notNull().default("crew"),
  isHouseClient: boolean("is_house_client").notNull().default(false),
  riskFlags: text("risk_flags").array().notNull().default([]),
  riskReviewedAt: timestamp("risk_reviewed_at", { withTimezone: true }),
  riskReviewedBy: text("risk_reviewed_by"),
  riskNote: text("risk_note"),
  npsLatest: integer("nps_latest"),
  npsAsOf: date("nps_as_of"),
  ...audit,
});

export const brandContacts = pgTable("brand_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  phone: text("phone"),
  isPrimary: boolean("is_primary").notNull().default(false),
  portalUserId: text("portal_user_id"),
  ...audit,
});

export const inboxThreads = pgTable("inbox_threads", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id"),
  brandId: uuid("brand_id"),
  channel: inboxChannelEnum("channel").notNull(),
  fromName: text("from_name"),
  fromAddress: text("from_address"),
  subject: text("subject").notNull().default(""),
  firstMessageMd: text("first_message_md").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  slaDueAt: timestamp("sla_due_at", { withTimezone: true }).notNull(),
  status: inboxStatusEnum("status").notNull().default("new"),
  dealId: uuid("deal_id"),
  handledBy: text("handled_by"),
  noListPrescreen: jsonb("no_list_prescreen").$type<Record<string, boolean>>(),
  replyMd: text("reply_md"),
  repliedAt: timestamp("replied_at", { withTimezone: true }),
  forwardedToCreatorAt: timestamp("forwarded_to_creator_at", { withTimezone: true }),
  ...audit,
});

export const brandFeedback = pgTable("brand_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id"),
  kind: text("kind").notNull().default("campaign_5q"), // campaign_5q | nps
  submittedOn: date("submitted_on").notNull(),
  q1: integer("q1"),
  q2: integer("q2"),
  q3: integer("q3"),
  q4: integer("q4"),
  q5: integer("q5"),
  nps: integer("nps"),
  comment: text("comment"),
  sharedWithCreator: boolean("shared_with_creator").notNull().default(true),
  ...audit,
});

// ---------- 3.4 Deals ----------
export type NoListCheck = {
  rev_share_only: boolean;
  no_budget_educational: boolean;
  barter: boolean;
  lifetime_rights: boolean;
  shady_tool: boolean;
  blocklist_category: string | null;
  passed: boolean;
  checked_at: string;
  checked_by: string;
};
export type UsageRight = { kind: "organic_reuse" | "whitelisting" | "web_print"; days: number; channels: string[] };
export type Exclusivity = { scope: "none" | "product" | "category"; days: number };

export const deals = pgTable(
  "deals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id").notNull().references(() => brands.id),
    title: text("title").notNull(),
    ownerUserId: text("owner_user_id"),
    stage: dealStageEnum("stage").notNull().default("lead"),
    stageChangedAt: timestamp("stage_changed_at", { withTimezone: true }).notNull().defaultNow(),
    type: dealTypeEnum("type"),
    oneOffReason: text("one_off_reason"),
    origin: dealOriginEnum("origin").notNull().default("crew_originated"),
    originatingCreatorId: uuid("originating_creator_id"),
    commissionPct: numeric("commission_pct", { mode: "number" }).notNull().default(20),
    currency: currencyEnum("currency").notNull().default("INR"),
    quotedTotalPaise: money("quoted_total_paise").notNull().default(0),
    signedTotalPaise: money("signed_total_paise"),
    termStartsOn: date("term_starts_on"),
    termEndsOn: date("term_ends_on"),
    piecesPerMonth: integer("pieces_per_month"),
    pauseUsed: boolean("pause_used").notNull().default(false),
    exclusivity: jsonb("exclusivity").$type<Exclusivity>().notNull().default({ scope: "none", days: 0 }),
    usageRights: jsonb("usage_rights").$type<UsageRight[]>().notNull().default([]),
    frontseatAmplification: boolean("frontseat_amplification").notNull().default(false),
    briefMd: text("brief_md"),
    briefUrl: text("brief_url"),
    briefTags: text("brief_tags").array().notNull().default([]),
    referralNote: text("referral_note"),
    sowUrl: text("sow_url"),
    sowMd: text("sow_md"),
    poReference: text("po_reference"),
    confirmationUrl: text("confirmation_url"),
    confirmationReceivedAt: timestamp("confirmation_received_at", { withTimezone: true }),
    reportUrl: text("report_url"),
    ladderVersionId: uuid("ladder_version_id"),
    noListCheck: jsonb("no_list_check").$type<NoListCheck>(),
    declinedReason: text("declined_reason"),
    declinedValuePaise: money("declined_value_paise"),
    lostReason: text("lost_reason"),
    ...audit,
  },
  (t) => [index("deals_stage_idx").on(t.stage)],
);

export const dealCreators = pgTable(
  "deal_creators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id").notNull().references(() => creators.id),
    role: dealCreatorRoleEnum("role").notNull().default("primary"),
    status: dealCreatorStatusEnum("status").notNull().default("proposed"),
    ...audit,
  },
  (t) => [uniqueIndex("deal_creator_unique").on(t.dealId, t.creatorId)],
);

export const dealQuoteLines = pgTable("deal_quote_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => creators.id),
  deliverableKey: text("deliverable_key").notNull(),
  qty: integer("qty").notNull().default(1),
  standardPaise: money("standard_paise").notNull(),
  standardIsDefault: boolean("standard_is_default").notNull().default(false),
  rung: rungEnum("rung").notNull().default("standard"),
  addons: jsonb("addons").$type<{ key: string; pct: number | null }[]>().notNull().default([]),
  lineTotalPaise: money("line_total_paise").notNull(),
  manualTotalPaise: money("manual_total_paise"), // a hand-set price; below the Lucrative price needs an Owner override
  note: text("note"),
  isCaseByCase: boolean("is_case_by_case").notNull().default(false),
  ...audit,
});

export const dealOverrides = pgTable("deal_overrides", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  kind: overrideKindEnum("kind").notNull(),
  requestedBy: text("requested_by").notNull(),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),
  reason: text("reason").notNull(),
  ...audit,
});

export const dealActivity = pgTable("deal_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  by: text("by"),
  kind: activityKindEnum("kind").notNull(),
  bodyMd: text("body_md").notNull(),
  ...audit,
});

// ---------- 3.5 Campaigns and deliverables ----------
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id").notNull().references(() => brands.id),
  dealId: uuid("deal_id").notNull().references(() => deals.id).unique(),
  name: text("name").notNull(),
  startsOn: date("starts_on"),
  endsOn: date("ends_on"),
  status: campaignStatusEnum("status").notNull().default("planning"),
  reportUrl: text("report_url"),
  reportMd: text("report_md"),
  reportedAt: timestamp("reported_at", { withTimezone: true }),
  feedbackRequestedAt: timestamp("feedback_requested_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...audit,
});

export const deliverables = pgTable(
  "deliverables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id").notNull().references(() => creators.id),
    deliverableKey: text("deliverable_key").notNull(),
    platform: platformEnum("platform").notNull().default("instagram"),
    title: text("title").notNull(),
    channel: text("channel"), // "frontseat" for amplification items
    briefTags: text("brief_tags").array().notNull().default([]),
    dueOn: date("due_on"),
    scheduledFor: date("scheduled_for"),
    liveAt: timestamp("live_at", { withTimezone: true }),
    liveUrl: text("live_url"),
    status: deliverableStatusEnum("status").notNull().default("briefed"),
    revisionRound: integer("revision_round").notNull().default(0),
    disclosureChecked: boolean("disclosure_checked").notNull().default(false),
    disclosureStandard: disclosureEnum("disclosure_standard").notNull().default("asci"),
    claimsApprovedByBrand: boolean("claims_approved_by_brand").notNull().default(false),
    approvedByContactId: uuid("approved_by_contact_id"),
    draftMd: text("draft_md"),
    draftScriptId: uuid("draft_script_id"),
    draftCarouselId: uuid("draft_carousel_id"),
    brandChangeRequestMd: text("brand_change_request_md"),
    warnings: jsonb("warnings").$type<string[]>().notNull().default([]),
    ...audit,
  },
  (t) => [index("deliverables_creator_idx").on(t.creatorId)],
);

export const deliverableMetrics = pgTable("deliverable_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  deliverableId: uuid("deliverable_id").notNull().references(() => deliverables.id, { onDelete: "cascade" }),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  saves: integer("saves"),
  shares: integer("shares"),
  commentsDecisionMaker: integer("comments_decision_maker"),
  inboundToBrand: integer("inbound_to_brand"),
  trackedSignups: integer("tracked_signups"),
  impressions: integer("impressions"), // stored, de-emphasised
  notes: text("notes"),
  studioPostId: uuid("studio_post_id"), // (v3) the Studio Results post that logged these metrics — one record per sponsored post
  ...audit,
});

// ---------- 3.6 Money ----------
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  kind: invoiceKindEnum("kind").notNull(),
  number: text("number").notNull(),
  issuedByEntity: text("issued_by_entity").notNull().default("OWLED"),
  issuedOn: date("issued_on").notNull(),
  dueOn: date("due_on").notNull(),
  amountPaise: money("amount_paise").notNull(),
  currency: currencyEnum("currency").notNull().default("INR"),
  gstPct: numeric("gst_pct", { mode: "number" }).notNull().default(18),
  tdsPct: numeric("tds_pct", { mode: "number" }).notNull().default(0),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  paidOn: date("paid_on"),
  paidAmountPaise: money("paid_amount_paise"),
  reference: text("reference"),
  ...audit,
});

export const creatorPayouts = pgTable("creator_payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => creators.id),
  kind: payoutKindEnum("kind").notNull(),
  triggeredByInvoiceId: uuid("triggered_by_invoice_id"),
  dueOn: date("due_on").notNull(),
  amountPaise: money("amount_paise").notNull(),
  currency: currencyEnum("currency").notNull().default("INR"),
  tdsPct: numeric("tds_pct", { mode: "number" }).notNull().default(0),
  status: payoutStatusEnum("status").notNull().default("due"),
  paidOn: date("paid_on"),
  reference: text("reference"),
  ...audit,
});

// ---------- 3.7 Settings / seed ----------
export type LadderRung = { key: "lucrative" | "semi" | "standard" | "pitch" | "premium"; label: string; pct: number; use: string };
export const ladders = pgTable("ladders", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: integer("version").notNull(),
  effectiveFrom: date("effective_from").notNull(),
  active: boolean("active").notNull().default(true),
  rungs: jsonb("rungs").$type<LadderRung[]>().notNull(),
  ...audit,
});

export const deliverableTypes = pgTable("deliverable_types", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  platform: platformEnum("platform").notNull(),
  defaultMultipleOfReel: numeric("default_multiple_of_reel", { mode: "number" }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const addons = pgTable("addons", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  pct: numeric("pct", { mode: "number" }),
  kind: addonKindEnum("kind").notNull(),
  days: integer("days"),
  note: text("note"),
  active: boolean("active").notNull().default(true),
});

export const tierScale = pgTable("tier_scale", {
  tier: tierEnum("tier").primaryKey(),
  multiple: numeric("multiple", { mode: "number" }).notNull(),
});

export const filterRubrics = pgTable("filter_rubric", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: integer("version").notNull(),
  dimensions: text("dimensions").array().notNull(),
  scaleMin: integer("scale_min").notNull().default(1),
  scaleMax: integer("scale_max").notNull().default(5),
  thresholds: jsonb("thresholds").$type<{ watchlist: number; roster: number; challenge_top_n: number; revisit_min: number; revisit_max: number }>().notNull(),
  active: boolean("active").notNull().default(true),
});

export const noListItems = pgTable("no_list_items", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  active: boolean("active").notNull().default(true),
});

export const blocklistCategories = pgTable("blocklist_categories", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  active: boolean("active").notNull().default(true),
});

export const commissionRules = pgTable("commission_rules", {
  origin: dealOriginEnum("origin").primaryKey(),
  pct: numeric("pct", { mode: "number" }).notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: numeric("value", { mode: "number" }).notNull(),
  label: text("label").notNull(),
  unit: text("unit"),
});

export const templates = pgTable("templates", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  bodyMd: text("body_md").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    userId: text("user_id"),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    action: text("action").notNull(),
    detail: jsonb("detail"),
  },
  (t) => [index("audit_entity_idx").on(t.entity, t.entityId)],
);

// ---------- 3.8 Creator Studio ----------
export type BrandColors = { background: string; foreground: string; muted: string; border: string; color4: string; color5: string };
export const creatorProfiles = pgTable("creator_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }).unique(),
  handle: text("handle").notNull().default(""),
  nameField: text("name_field").notNull().default(""),
  niche: text("niche").notNull().default(""),
  subniches: text("subniches").array().notNull().default([]),
  occupation: text("occupation").notNull().default(""),
  founderStory: text("founder_story").notNull().default(""),
  bioLink: text("bio_link").notNull().default(""),
  colors: jsonb("colors").$type<BrandColors>(),
  fonts: jsonb("fonts").$type<{ heading: string; body: string }>(),
  assetTypes: text("asset_types").array().notNull().default([]),
  accountStatus: accountStatusEnum("account_status").notNull().default("new"),
  pillarRatio: jsonb("pillar_ratio").$type<{ authority: number; journey: number }>().notNull().default({ authority: 70, journey: 30 }),
  conceptRatio: jsonb("concept_ratio")
    .$type<{ proven: number; double_down: number; experimental: number }>()
    .notNull()
    .default({ proven: 90, double_down: 0, experimental: 10 }),
  postingCadence: jsonb("posting_cadence")
    .$type<{ tier: string; times_per_week: string; days: string[] }>()
    .notNull()
    .default({ tier: "light", times_per_week: "1-2", days: [] }),
  hookPrefs: text("hook_prefs").array().notNull().default(["verbal", "written"]),
  formatPrefs: text("format_prefs").array().notNull().default(["whiteboard", "voiceover_broll"]),
  ctaStatus: text("cta_status").notNull().default("undecided"),
  manychatSetup: boolean("manychat_setup").notNull().default(false),
  equipment: text("equipment").array().notNull().default([]),
  aiStack: text("ai_stack").array().notNull().default([]),
  automateWorkflows: text("automate_workflows").array().notNull().default([]),
  humanAlpha: text("human_alpha").notNull().default(""),
  proprietaryValue: text("proprietary_value").notNull().default(""),
  journeyAssets: text("journey_assets").notNull().default(""),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  ...audit,
});

export const studioOutliers = pgTable("studio_outliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  sourceType: outlierSourceEnum("source_type").notNull().default("keyword"),
  creatorHandle: text("creator_handle").notNull().default(""),
  link: text("link").notNull().default(""),
  nicheKeyword: text("niche_keyword").notNull().default(""),
  followerCount: integer("follower_count").notNull().default(0),
  views: integer("views").notNull().default(0),
  hookWritten: text("hook_written").notNull().default(""),
  hookVerbal: text("hook_verbal").notNull().default(""),
  hookVisual: text("hook_visual").notNull().default(""),
  angle: text("angle").notNull().default(""),
  notes: text("notes").notNull().default(""),
  used: boolean("used").notNull().default(false),
  ...audit,
});

export const studioHookStacks = pgTable("studio_hook_stacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  written: text("written").notNull().default(""),
  verbal: text("verbal").notNull().default(""),
  visual: text("visual").notNull().default(""),
  angle: text("angle").notNull().default(""),
  topic: text("topic").notNull().default(""),
  saved: boolean("saved").notNull().default(true),
  ...audit,
});

export const studioScripts = pgTable(
  "studio_scripts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").references(() => creators.id, { onDelete: "cascade" }), // null = global starter row
    title: text("title").notNull().default("Untitled script"),
    pillar: pillarEnum("pillar").notNull().default("authority"),
    contentType: contentTypeEnum("content_type").notNull().default("educational"),
    angleOrStoryType: text("angle_or_story_type").notNull().default(""),
    format: text("format").notNull().default(""),
    bodyBlack: text("body_black").notNull().default(""),
    bodyRed: text("body_red").notNull().default(""),
    bodyGreen: text("body_green").notNull().default(""),
    ctaType: ctaTypeEnum("cta_type").notNull().default("follow"),
    funnelStage: funnelStageEnum("funnel_stage").notNull().default("tofu"),
    status: scriptStatusEnum("status").notNull().default("draft"),
    seriesName: text("series_name").notNull().default(""),
    effort: effortEnum("effort").notNull().default("default"),
    topicTag: text("topic_tag").notNull().default(""),
    segment: text("segment").notNull().default(""),
    conceptBucket: conceptBucketEnum("concept_bucket"),
    deliverableId: uuid("deliverable_id"),
    sharedWithCrew: boolean("shared_with_crew").notNull().default(false),
    clonedFromId: uuid("cloned_from_id"),
    seedBatch: text("seed_batch"),
    ...audit,
  },
  (t) => [index("scripts_creator_idx").on(t.creatorId)],
);

export const studioScriptTemplates = pgTable("studio_script_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => creators.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Untitled template"),
  pillar: pillarEnum("pillar").notNull().default("authority"),
  angle: text("angle").notNull().default(""),
  sourceNote: text("source_note").notNull().default(""),
  templateText: text("template_text").notNull().default(""),
  ...audit,
});

export const studioCarousels = pgTable("studio_carousels", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => creators.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled carousel"),
  pillar: pillarEnum("pillar").notNull().default("authority"),
  contentType: contentTypeEnum("content_type").notNull().default("educational"),
  archetype: text("archetype").notNull().default("listicle"),
  ctaType: carouselCtaEnum("cta_type").notNull().default("save"),
  funnelStage: funnelStageEnum("funnel_stage").notNull().default("tofu"),
  status: scriptStatusEnum("status").notNull().default("draft"),
  topicTag: text("topic_tag").notNull().default(""),
  segment: text("segment").notNull().default(""),
  slideCount: integer("slide_count").notNull().default(0),
  backgroundStyle: text("background_style").notNull().default("solid"),
  backgroundCategory: text("background_category").notNull().default(""),
  designNotes: text("design_notes").notNull().default(""),
  deliverableId: uuid("deliverable_id"),
  clonedFromId: uuid("cloned_from_id"),
  seedBatch: text("seed_batch"),
  ...audit,
});

export const studioCarouselSlides = pgTable("studio_carousel_slides", {
  id: uuid("id").primaryKey().defaultRandom(),
  carouselId: uuid("carousel_id").notNull().references(() => studioCarousels.id, { onDelete: "cascade" }),
  slideNumber: integer("slide_number").notNull(),
  slideRole: slideRoleEnum("slide_role").notNull().default("body"),
  headline: text("headline").notNull().default(""),
  supportingText: text("supporting_text").notNull().default(""),
});

export const studioPosts = pgTable("studio_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  title: text("title").notNull().default(""),
  postedOn: date("posted_on").notNull(),
  platform: platformEnum("platform").notNull().default("instagram"),
  url: text("url"),
  pillar: pillarEnum("pillar").notNull().default("authority"),
  format: text("format").notNull().default(""),
  hook: text("hook").notNull().default(""),
  views: integer("views").notNull().default(0),
  followersAtPost: integer("followers_at_post").notNull().default(0),
  saves: integer("saves"),
  shares: integer("shares"),
  commentsDecisionMaker: integer("comments_decision_maker"),
  inbound: integer("inbound"),
  trackedSignups: integer("tracked_signups"),
  notes: text("notes").notNull().default(""),
  calendarItemId: uuid("calendar_item_id"),
  deliverableId: uuid("deliverable_id"),
  ...audit,
});

export const aiSettings = pgTable("ai_settings", {
  id: integer("id").primaryKey().default(1),
  provider: aiProviderEnum("provider").notNull().default("gemini"),
  apiKey: text("api_key").notNull().default(""),
  model: text("model").notNull().default(""),
  customEndpoint: text("custom_endpoint").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiUsage = pgTable("ai_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id"),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  generator: text("generator").notNull(),
  provider: text("provider").notNull(),
  tokensEst: integer("tokens_est").notNull().default(0),
});
