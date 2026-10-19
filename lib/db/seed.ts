// Seed — BRIEF §12 exactly, plus users and the Studio Starter library (§12.8).
// Run: pnpm db:seed. Idempotent: settings upsert; the starter library loads once.
import "./env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { isNull, sql as dsql } from "drizzle-orm";
import * as s from "./schema";
import { DEFAULT_CONFIG, NUMERIC_SETTINGS, DEFAULT_DELIVERABLES, DEFAULT_ADDONS, DEFAULT_NO_LIST, DEFAULT_BLOCKLIST } from "../rules/config";
import { TEMPLATES } from "./templates";
import { starterScripts, starterCarousels } from "../studio/library";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema: s });

const NO_LIST_DESCRIPTIONS: Record<string, string> = {
  rev_share_only: "Paid only as a share of revenue, no fee.",
  no_budget_educational: "Asked for educational content with no pricing.",
  barter: "Product or access in place of a fee.",
  lifetime_rights: "Usage rights with no end date.",
  shady_tool: "Misleading claims; undisclosed data use or privacy risk; crypto-adjacent or regulatory exposure.",
};

async function main() {
  // 12.1 Ladder v1
  const existingLadder = await db.select().from(s.ladders).limit(1);
  if (!existingLadder.length) {
    await db.insert(s.ladders).values({
      version: 1,
      effectiveFrom: "2026-10-19",
      active: true,
      rungs: [
        { key: "lucrative", label: "Lucrative", pct: -30, use: "Bulk, very good brand, very lucrative deal; annual close" },
        { key: "semi", label: "Semi-lucrative", pct: -15, use: "Better than normal; quarterly close" },
        { key: "standard", label: "Standard", pct: 0, use: "What the creator normally charges; pilot and retainer default" },
        { key: "pitch", label: "Pitch", pct: 20, use: "Opening number to brands; one-off default" },
        { key: "premium", label: "Premium", pct: 50, use: "Exclusivity, category lock, special asks" },
      ],
    });
  }

  // 12.2 Deliverables v1
  for (const [i, d] of DEFAULT_DELIVERABLES.entries()) {
    await db
      .insert(s.deliverableTypes)
      .values({ key: d.key, label: d.label, platform: d.platform as "instagram", defaultMultipleOfReel: d.multiple, sortOrder: i })
      .onConflictDoNothing();
  }

  // 12.3 Add-ons v1
  for (const a of DEFAULT_ADDONS) {
    await db.insert(s.addons).values({ key: a.key, label: a.label, pct: a.pct, kind: a.kind, days: a.days, note: a.note ?? null }).onConflictDoNothing();
  }

  // Tier scale
  for (const [tier, multiple] of Object.entries(DEFAULT_CONFIG.tierScale)) {
    await db.insert(s.tierScale).values({ tier: tier as "T0", multiple }).onConflictDoNothing();
  }

  // 12.5 Filter rubric v1
  if (!(await db.select().from(s.filterRubrics).limit(1)).length) {
    await db.insert(s.filterRubrics).values({
      version: 1,
      dimensions: ["aesthetics", "taste", "personality"],
      thresholds: { watchlist: 12, roster: 12, challenge_top_n: 7, revisit_min: 10, revisit_max: 11 },
    });
  }

  // 12.6 NO list and blocklist
  for (const n of DEFAULT_NO_LIST) {
    await db.insert(s.noListItems).values({ key: n.key, label: n.label, description: NO_LIST_DESCRIPTIONS[n.key] }).onConflictDoNothing();
  }
  for (const b of DEFAULT_BLOCKLIST) {
    await db.insert(s.blocklistCategories).values({ key: b.key, label: b.label }).onConflictDoNothing();
  }

  // 12.4 Commission rules
  for (const [origin, pct] of Object.entries(DEFAULT_CONFIG.commission)) {
    await db.insert(s.commissionRules).values({ origin: origin as "crew_originated", pct }).onConflictDoNothing();
  }

  // 12.7 Settings (+ share rules)
  const numeric = [
    ...NUMERIC_SETTINGS,
    { key: "upsell_share_pct", label: "Upsell share", value: 3, unit: "%" },
    { key: "referral_share_pct", label: "Referral share", value: 1.5, unit: "%" },
    { key: "referral_deal_count", label: "Referral share on first", value: 10, unit: "deals" },
  ];
  for (const n of numeric) {
    await db.insert(s.settings).values({ key: n.key, value: n.value, label: n.label, unit: n.unit ?? null }).onConflictDoNothing();
  }

  // Templates
  for (const t of TEMPLATES) {
    await db.insert(s.templates).values(t).onConflictDoNothing();
  }

  // Users (§1). Emails are placeholders: change them in Settings → Users.
  const people: { email: string; name: string; role: (typeof s.roleEnum.enumValues)[number] }[] = [
    { email: "ayush@crew.example", name: "Ayush", role: "owner" },
    { email: "shardul@crew.example", name: "Shardul", role: "crew_lead" },
    { email: "ops@crew.example", name: "Deal desk", role: "ops" },
    { email: "strategist@crew.example", name: "Strategist", role: "strategist" },
    { email: "intern1@crew.example", name: "Intern (research)", role: "intern" },
    { email: "intern2@crew.example", name: "Intern (deal desk)", role: "intern" },
    { email: "sales@owled.example", name: "OWLED sales", role: "sales_viewer" },
    { email: "finance@owled.example", name: "OWLED finance", role: "finance_viewer" },
  ];
  for (const p of people) await db.insert(s.users).values(p).onConflictDoNothing();

  // Studio Starter library — global read-only rows (creator_id = null), loaded once.
  const [{ n: scriptCount }] = await db.select({ n: dsql<number>`count(*)::int` }).from(s.studioScripts).where(isNull(s.studioScripts.creatorId));
  if (scriptCount === 0) {
    const rows = starterScripts();
    for (let i = 0; i < rows.length; i += 200) {
      await db.insert(s.studioScripts).values(rows.slice(i, i + 200).map((r) => ({ ...r, creatorId: null, status: "ready" as const })));
    }
    console.log(`starter scripts: ${rows.length}`);
  }
  const [{ n: carouselCount }] = await db.select({ n: dsql<number>`count(*)::int` }).from(s.studioCarousels).where(isNull(s.studioCarousels.creatorId));
  if (carouselCount === 0) {
    let slides = 0;
    for (const c of starterCarousels()) {
      const [row] = await db
        .insert(s.studioCarousels)
        .values({
          creatorId: null,
          title: c.title,
          pillar: c.pillar,
          contentType: c.contentType,
          archetype: c.archetype,
          ctaType: c.ctaType,
          funnelStage: c.funnelStage,
          status: "ready",
          topicTag: c.topicTag,
          segment: c.segment,
          slideCount: c.slides.length,
          backgroundStyle: c.backgroundStyle,
          backgroundCategory: c.backgroundCategory,
          designNotes: c.designNotes,
          seedBatch: c.seedBatch,
        })
        .returning({ id: s.studioCarousels.id });
      await db.insert(s.studioCarouselSlides).values(
        c.slides.map((sl, i) => ({ carouselId: row.id, slideNumber: i + 1, slideRole: sl.role, headline: sl.headline, supportingText: sl.supportingText })),
      );
      slides += c.slides.length;
    }
    console.log(`starter carousels: ${starterCarousels().length} (${slides} slides)`);
  }

  console.log("seed complete");
}

main()
  .then(() => client.end())
  .catch(async (e) => {
    console.error(e);
    await client.end();
    process.exit(1);
  });
