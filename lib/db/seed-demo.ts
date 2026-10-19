// Demo data — fictional creators, brands and deals across every stage, for screens and e2e.
// Run after the base seed: pnpm db:demo. Safe to re-run: it exits if demo data exists.
import "./env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as s from "./schema";
import { addDays, addMonths, today as todayISO } from "../dates";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema: s });
const T = todayISO();
const d = (n: number) => addDays(T, n);
const ts = (n: number) => new Date(Date.now() + n * 86400_000);
const L = (rupees: number) => rupees * 100;

type CreatorSeed = {
  key: string;
  name: string;
  stage: (typeof s.creatorStageEnum.enumValues)[number];
  tier?: "T0" | "T1" | "T2" | "T3";
  sub: (typeof s.subCategoryEnum.enumValues)[number];
  source: (typeof s.creatorSourceEnum.enumValues)[number];
  city: string;
  langs: string[];
  handle: string;
  followers: number;
  scores?: [number, number, number, string, number][]; // a, t, p, sentence, daysAgo
  signals?: number;
  topics?: string[];
  anchor?: string;
  represented?: boolean | null;
  employed?: boolean;
  founder?: number;
  standards?: [string, number][];
  consent?: "none" | "opted_in";
};

const CREATORS: CreatorSeed[] = [
  { key: "meera", name: "Meera Iyer", stage: "roster", tier: "T2", sub: "ai_educator", source: "ayush_network", city: "Bengaluru", langs: ["en", "hinglish"], handle: "meera.builds.ai", followers: 184000, scores: [[5, 5, 4, "Explains agents like a staff engineer who still enjoys teaching.", 30]], signals: 4, topics: ["crypto", "gambling", "competitor: Lumen AI"], anchor: "Weekly whiteboard deep-dive", represented: false, standards: [["ig_reel_dedicated", 140000], ["yt_integration", 220000], ["linkedin_post", 70000]] },
  { key: "arjun", name: "Arjun Rao", stage: "roster", tier: "T1", sub: "builder_engineer", source: "frontseat", city: "Pune", langs: ["en"], handle: "arjun.ships", followers: 62000, scores: [[4, 5, 4, "Ships a working demo in every post; taste in tools is sharp.", 20]], signals: 2, topics: ["crypto", "political", "lending"], anchor: "Build-along reel", represented: false, employed: true, standards: [["ig_reel_dedicated", 60000], ["x_thread", 25000]] },
  { key: "zoya", name: "Zoya Khan", stage: "roster", tier: "T3", sub: "founder_operator", source: "ayush_network", city: "Mumbai", langs: ["en", "hinglish"], handle: "zoya.operates", followers: 410000, scores: [[5, 5, 5, "The operator founders forward to their team.", 45]], signals: 6, topics: ["gambling", "crypto", "religious"], anchor: "Founder teardown", represented: false, founder: 40, standards: [["ig_reel_dedicated", 380000], ["yt_dedicated", 900000]] },
  { key: "kabir", name: "Kabir Sethi", stage: "roster", tier: "T1", sub: "vc_analyst", source: "referral", city: "Delhi", langs: ["en"], handle: "kabir.on.markets", followers: 38000, scores: [[4, 4, 4, "Calm, numerate, never hypes a round.", 60]], signals: 2, topics: ["crypto", "gambling", "lending"], anchor: "One chart explained", represented: false },
  { key: "ananya", name: "Ananya Das", stage: "incubation", tier: "T0", sub: "ai_educator", source: "program", city: "Kolkata", langs: ["en", "hinglish"], handle: "ananya.explains", followers: 9400, scores: [[4, 4, 5, "Warm, quick, and her edits already have a point of view.", 10]], signals: 1, topics: ["crypto", "gambling", "political"], anchor: "Explain like I'm 5", represented: false, consent: "opted_in" },
  { key: "rohan", name: "Rohan Mehta", stage: "incubation", tier: "T0", sub: "enterprise_tech", source: "program", city: "Hyderabad", langs: ["en"], handle: "rohan.enterprise", followers: 5200, scores: [[4, 4, 4, "Knows procurement pain first-hand.", 70]], signals: 2, topics: ["crypto", "gambling", "lending"], anchor: "Case study", represented: false, employed: true, consent: "opted_in" },
  { key: "ishaan", name: "Ishaan Varma", stage: "watchlist", sub: "builder_engineer", source: "outbound", city: "Chennai", langs: ["en"], handle: "ishaan.codes", followers: 21000, scores: [[4, 4, 4, "Clean repos, clean frames; personality still finding its feet.", 15]], signals: 1, topics: ["crypto"], represented: null, consent: "opted_in" },
  { key: "tara", name: "Tara Bhat", stage: "watchlist", sub: "founder_operator", source: "event", city: "Bengaluru", langs: ["en", "hinglish"], handle: "tara.ops", followers: 14000, scores: [[5, 4, 4, "Specific about margins; never vague.", 25]], topics: ["crypto", "gambling", "lending"], anchor: "Founder voice memo", represented: false, consent: "opted_in" },
  { key: "dev", name: "Dev Malhotra", stage: "scout", sub: "ai_educator", source: "inbound", city: "Jaipur", langs: ["hinglish"], handle: "dev.ai.hindi", followers: 72000, consent: "none" },
  { key: "nisha", name: "Nisha Pillai", stage: "scout", sub: "vc_analyst", source: "outbound", city: "Kochi", langs: ["en"], handle: "nisha.thesis", followers: 8800, scores: [[3, 4, 3, "Good theses, flat delivery for now.", 5]], consent: "opted_in" },
  { key: "sameer", name: "Sameer Joshi", stage: "revisit", sub: "builder_engineer", source: "program", city: "Indore", langs: ["en", "hinglish"], handle: "sameer.makes", followers: 3100, scores: [[3, 4, 4, "Close. Revisit after another quarter of reps.", 40]], consent: "opted_in" },
  { key: "leela", name: "Leela Nair", stage: "alumni", tier: "T1", sub: "enterprise_tech", source: "ayush_network", city: "Bengaluru", langs: ["en"], handle: "leela.cio", followers: 51000, scores: [[4, 4, 4, "Moved in-house; great while it lasted.", 200]], signals: 3, represented: false },
];

const BRANDS = [
  { key: "lumen", name: "Lumen AI", category: "ai_tool" as const, ownerTeam: "crew" as const, review: -20 },
  { key: "patchwork", name: "Patchwork Dev", category: "dev_tool" as const, ownerTeam: "crew" as const, review: -40 },
  { key: "ledgerly", name: "Ledgerly", category: "saas" as const, ownerTeam: "owled_social" as const, review: -30, house: true },
  { key: "northstar", name: "Northstar Ventures", category: "vc" as const, ownerTeam: "snoball" as const, review: -10 },
  { key: "orbit", name: "Orbit Cloud", category: "enterprise" as const, ownerTeam: "crew" as const, review: -200 },
  { key: "quill", name: "Quill Notes", category: "consumer" as const, ownerTeam: "crew" as const, review: -5 },
  { key: "betbuddy", name: "BetBuddy", category: "other" as const, ownerTeam: "crew" as const, review: -2, flags: ["blocklist_gambling"] },
  { key: "stackly", name: "Stackly", category: "dev_tool" as const, ownerTeam: "shared" as const, review: -60 },
];

async function main() {
  const existing = await db.select().from(s.creators).limit(1);
  if (existing.length) {
    console.log("demo data already present");
    return;
  }
  const [owner] = await db.select().from(s.users).where(eq(s.users.role, "owner"));
  const [lead] = await db.select().from(s.users).where(eq(s.users.role, "crew_lead"));
  const C: Record<string, string> = {};
  const B: Record<string, string> = {};

  for (const c of CREATORS) {
    const [row] = await db
      .insert(s.creators)
      .values({
        displayName: c.name,
        legalName: c.name,
        email: `${c.key}@creator.example`,
        city: c.city,
        stage: c.stage,
        stageChangedAt: ts(-20),
        tier: c.tier ?? null,
        tierApprovedBy: c.tier ? owner.id : null,
        tierReviewedAt: c.tier ? ts(-30) : null,
        tierNextReviewAt: c.tier ? d(60) : null,
        subCategory: c.sub,
        primaryPlatform: "instagram",
        languages: c.langs,
        source: c.source,
        isEmployedElsewhere: !!c.employed,
        employerDisclosureUrl: c.employed ? "https://example.com/disclosure" : null,
        isFounder: c.founder != null,
        ownProductContentPct: c.founder ?? null,
        representedElsewhere: c.represented === undefined ? null : c.represented,
        consentStatus: c.consent ?? "opted_in",
        firstLookUntil: c.stage === "incubation" ? addMonths(T, 16) : null,
        revisitOn: c.stage === "revisit" ? d(4) : null,
        alumniReason: c.stage === "alumni" ? "Joined a platform company full-time" : null,
        createdBy: lead.id,
      })
      .returning({ id: s.creators.id });
    C[c.key] = row.id;
    await db.insert(s.creatorPlatforms).values({ creatorId: row.id, platform: "instagram", handle: c.handle, url: `https://instagram.com/${c.handle}`, followers: c.followers, followersAsOf: d(-14), isPrimary: true });
    for (const [a, t, p, sentence, ago] of c.scores ?? []) {
      await db.insert(s.creatorFilterScores).values({ creatorId: row.id, aesthetics: a, taste: t, personality: p, total: a + t + p, sentence, context: c.stage === "roster" ? "roster_review" : "scout", scoredAt: ts(-ago), scoredBy: lead.id });
    }
    const kinds = ["inbound_founder", "speaking", "podcast", "press", "prior_enterprise_deal", "community"] as const;
    for (let i = 0; i < (c.signals ?? 0); i++) {
      await db.insert(s.creatorTierSignals).values({ creatorId: row.id, kind: kinds[i % kinds.length], description: ["Inbound from two Series A founders", "Spoke at a Bengaluru AI meetup", "Guest on a top-50 tech podcast", "Quoted in a national daily", "Ran a paid workshop for an enterprise team", "Runs a 4k-member community"][i % 6], date: d(-30 * (i + 1)), weight: 2 });
    }
    for (const t of c.topics ?? []) {
      const [kind, value] = t.includes(":") ? (t.split(": ") as [string, string]) : ["category", t];
      await db.insert(s.creatorTopicFilters).values({ creatorId: row.id, kind: kind as "category", value, reason: "Creator's call" });
    }
    if (c.anchor) await db.insert(s.creatorAnchorPlans).values({ creatorId: row.id, anchorFormat: c.anchor, cadenceNote: "Creator decides; 2–3 posts a week" });
    for (const [key, rupees] of c.standards ?? []) {
      await db.insert(s.creatorStandardRates).values({ creatorId: row.id, deliverableKey: key, standardPaise: L(rupees), setBy: lead.id });
    }
    if (c.stage === "roster") {
      await db.insert(s.creatorAgreements).values({ creatorId: row.id, pilotStartedOn: d(-60), pilotEndsOn: d(30), exclusive: true, status: "pilot" });
      for (const [i, type] of (["quarterly", "quarterly", "strategy_refresh", "pilot_end"] as const).entries()) {
        await db.insert(s.creatorCheckins).values({ creatorId: row.id, type, dueOn: [d(-2), d(88), d(120), d(30)][i] });
      }
      await db.insert(s.creatorRoadmapItems).values({ creatorId: row.id, area: "speaking_press", goal: "One conference keynote this year", crewContribution: "Intro to two organisers" });
    }
    if (["roster", "incubation"].includes(c.stage)) {
      await db.insert(s.creatorProfiles).values({
        creatorId: row.id,
        handle: c.handle,
        nameField: `${c.name} | ${c.sub === "ai_educator" ? "AI explained" : c.sub === "builder_engineer" ? "Builds with AI" : c.sub === "founder_operator" ? "Founder playbooks" : c.sub === "vc_analyst" ? "Startup markets" : "Enterprise AI"}`,
        niche: c.sub.replace("_", " "),
        subniches: ["Agents", "Tooling", "Workflows"],
        occupation: c.sub === "founder_operator" ? "Founder & CEO" : c.sub === "vc_analyst" ? "Investor" : "Engineer",
        founderStory: "Started posting notes from work; people kept asking for the next one.",
        bioLink: `https://${c.handle}.example`,
        accountStatus: c.followers > 20000 ? "established" : "new",
        conceptRatio: c.followers > 20000 ? { proven: 70, double_down: 20, experimental: 10 } : { proven: 90, double_down: 0, experimental: 10 },
        proprietaryValue: "Shipped 3 products used by 40k people",
        humanAlpha: "Real builds, real numbers, on camera",
        journeyAssets: "Screen recordings from every build since 2023",
        equipment: ["Tripod", "Lav mic"],
        onboardingComplete: true,
      });
      // Calendar: four weeks of organic items
      for (let w = -3; w < 5; w++) {
        await db.insert(s.creatorCalendarItems).values([
          { creatorId: row.id, date: d(w * 7 + 1), kind: "anchor", title: c.anchor ?? "Anchor", pillar: "authority", conceptBucket: "proven", studioStatus: w < 0 ? "posted" : "scripted", funnelStage: "tofu", topic: c.anchor ?? "Anchor" },
          { creatorId: row.id, date: d(w * 7 + 3), kind: "organic", title: "Build log", pillar: "journey", conceptBucket: w % 3 === 0 ? "experimental" : "proven", studioStatus: w < 0 ? (w === -2 ? "edited" : "posted") : "idea", funnelStage: "mofu", topic: "Build log" },
          { creatorId: row.id, date: d(w * 7 + 5), kind: "derivative", title: "Carousel recap", pillar: "authority", conceptBucket: "double_down", studioStatus: w < 0 ? "posted" : "idea", funnelStage: "tofu", topic: "Recap" },
        ]);
      }
      await db.insert(s.creatorBlackouts).values({ creatorId: row.id, startsOn: d(14), endsOn: d(20), note: "Family wedding — no posts" });
    }
  }

  for (const b of BRANDS) {
    const [row] = await db
      .insert(s.brands)
      .values({ name: b.name, website: `https://${b.key}.example`, category: b.category, ownerTeam: b.ownerTeam, isHouseClient: !!b.house, riskFlags: b.flags ?? [], riskReviewedAt: ts(b.review), riskReviewedBy: lead.id, riskNote: b.flags ? "Gambling app — blocklist" : "Claims reviewed; no data-use concerns", createdBy: lead.id })
      .returning({ id: s.brands.id });
    B[b.key] = row.id;
    await db.insert(s.brandContacts).values({ brandId: row.id, name: `${b.name.split(" ")[0]} Marketing`, role: "Head of Growth", email: `growth@${b.key}.example`, isPrimary: true });
  }

  const noList = { rev_share_only: false, no_budget_educational: false, barter: false, lifetime_rights: false, shady_tool: false, blocklist_category: null, passed: true, checked_at: new Date().toISOString(), checked_by: lead.id };

  type DealSeed = {
    title: string;
    brand: string;
    stage: (typeof s.dealStageEnum.enumValues)[number];
    type: (typeof s.dealTypeEnum.enumValues)[number] | null;
    origin?: (typeof s.dealOriginEnum.enumValues)[number];
    originating?: string;
    creators: [string, "primary" | "upsell"][];
    lines: [string, string, number, (typeof s.rungEnum.enumValues)[number]][];
    days: number;
    signed?: boolean;
  };
  const DEALS: DealSeed[] = [
    { title: "Agent launch — 3-month pilot", brand: "lumen", stage: "in_production", type: "pilot", creators: [["meera", "primary"]], lines: [["meera", "ig_reel_dedicated", 3, "standard"], ["meera", "linkedin_post", 3, "standard"]], days: 12, signed: true },
    { title: "Patchwork CLI retainer", brand: "patchwork", stage: "signed", type: "retainer", creators: [["arjun", "primary"]], lines: [["arjun", "ig_reel_dedicated", 2, "standard"], ["arjun", "x_thread", 2, "standard"]], days: 9, signed: true },
    { title: "Ledgerly finance-ops quarterly", brand: "ledgerly", stage: "negotiation", type: "quarterly", creators: [["zoya", "primary"]], lines: [["zoya", "ig_reel_dedicated", 3, "semi"]], days: 4 },
    { title: "Northstar fund thesis series", brand: "northstar", stage: "proposal_sent", type: "pilot", origin: "creator_inbound", originating: "kabir", creators: [["kabir", "primary"], ["meera", "upsell"]], lines: [["kabir", "ig_reel_dedicated", 2, "standard"], ["meera", "ig_reel_dedicated", 1, "standard"]], days: 6 },
    { title: "Orbit Cloud enterprise annual", brand: "orbit", stage: "lead", type: "annual", creators: [], lines: [], days: 2 },
    { title: "Quill launch one-off", brand: "quill", stage: "qualified", type: "one_off", creators: [], lines: [], days: 8 },
    { title: "Stackly developer week", brand: "stackly", stage: "brief_received", type: "pilot", creators: [["arjun", "primary"]], lines: [], days: 3 },
    { title: "Lumen evals workshop", brand: "lumen", stage: "reported", type: "one_off", creators: [["meera", "primary"]], lines: [["meera", "yt_integration", 1, "pitch"]], days: 5, signed: true },
  ];

  for (const ds of DEALS) {
    const lines = ds.lines.map(([ck, key, qty, rung]) => {
      const std = CREATORS.find((c) => c.key === ck)?.standards?.find(([k]) => k === key)?.[1];
      const standardPaise = std ? L(std) : L(50000 * (key === "yt_integration" ? 1.5 : key === "linkedin_post" ? 0.6 : key === "x_thread" ? 0.5 : 1));
      const pct = { lucrative: -30, semi: -15, standard: 0, pitch: 20, premium: 50 }[rung];
      return { ck, key, qty, rung, standardPaise, isDefault: !std, total: Math.round(standardPaise * qty * (1 + pct / 100)) };
    });
    const quoted = lines.reduce((t, l) => t + l.total, 0) || L(ds.stage === "lead" ? 1200000 : 180000);
    const [deal] = await db
      .insert(s.deals)
      .values({
        brandId: B[ds.brand],
        title: ds.title,
        ownerUserId: lead.id,
        stage: ds.stage,
        stageChangedAt: ts(-ds.days),
        type: ds.type,
        oneOffReason: ds.type === "one_off" ? "Launch-week moment" : null,
        origin: ds.origin ?? "crew_originated",
        originatingCreatorId: ds.originating ? C[ds.originating] : null,
        commissionPct: ds.origin === "creator_inbound" ? 15 : 20,
        quotedTotalPaise: quoted,
        signedTotalPaise: ds.signed ? quoted : null,
        termStartsOn: ds.signed ? d(-ds.days) : null,
        termEndsOn: ds.signed ? d(90 - ds.days) : null,
        piecesPerMonth: ds.signed ? 2 : null,
        briefMd: ["lead", "qualified"].includes(ds.stage) ? null : `## Brief\nShow ${BRANDS.find((b) => b.key === ds.brand)!.name} solving one real workflow, start to finish.`,
        briefTags: ["agents", "productivity"],
        referralNote: ds.brand === "ledgerly" ? "Routed from OWLED Social account team" : null,
        sowMd: ds.signed ? "# Statement of work\nSigned." : null,
        poReference: ds.stage === "in_production" || ds.stage === "reported" ? "PO-2026-0412" : null,
        noListCheck: ds.stage === "lead" ? null : noList,
        createdBy: lead.id,
      })
      .returning();
    for (const [ck, role] of ds.creators) {
      await db.insert(s.dealCreators).values({ dealId: deal.id, creatorId: C[ck], role, status: ["brief_received"].includes(ds.stage) ? "proposed" : "accepted" });
    }
    for (const l of lines) {
      await db.insert(s.dealQuoteLines).values({ dealId: deal.id, creatorId: C[l.ck], deliverableKey: l.key, qty: l.qty, standardPaise: l.standardPaise, standardIsDefault: l.isDefault, rung: l.rung, addons: [], lineTotalPaise: l.total });
    }
    await db.insert(s.dealActivity).values({ dealId: deal.id, by: lead.id, kind: "note", bodyMd: "Intro call done. They want credibility, not reach." });
    if (ds.signed) {
      const adv = Math.round(quoted * 0.5);
      const advPaid = ds.stage !== "signed";
      const [inv] = await db
        .insert(s.invoices)
        .values({ dealId: deal.id, kind: "advance", number: `OWLED/2026/A${String(Math.floor(Math.random() * 9000) + 1000)}`, issuedOn: d(-ds.days), dueOn: d(7 - ds.days), amountPaise: adv, status: advPaid ? "paid" : "sent", paidOn: advPaid ? d(-ds.days + 3) : null, paidAmountPaise: advPaid ? adv : null })
        .returning();
      if (advPaid) {
        const comm = ds.origin === "creator_inbound" ? 0.15 : 0.2;
        const byCreator = new Map<string, number>();
        for (const l of lines) byCreator.set(l.ck, (byCreator.get(l.ck) ?? 0) + l.total);
        for (const [ck, gross] of byCreator) {
          await db.insert(s.creatorPayouts).values({ dealId: deal.id, creatorId: C[ck], kind: "fee_advance", triggeredByInvoiceId: inv.id, dueOn: d(-ds.days + 10), amountPaise: Math.round(gross * (1 - comm) * 0.5), status: ds.stage === "reported" ? "paid" : "due", paidOn: ds.stage === "reported" ? d(-ds.days + 9) : null });
        }
      }
      if (["in_production", "reported"].includes(ds.stage)) {
        const [camp] = await db.insert(s.campaigns).values({ brandId: B[ds.brand], dealId: deal.id, name: ds.title, startsOn: d(-ds.days), endsOn: d(80), status: ds.stage === "reported" ? "reporting" : "active", reportMd: ds.stage === "reported" ? "## Results\n- 41 decision-maker comments\n- 1,900 saves\n- 63 inbound demo requests" : null, reportedAt: ds.stage === "reported" ? ts(-2) : null, feedbackRequestedAt: ds.stage === "reported" ? ts(-2) : null, completedAt: ds.stage === "reported" ? ts(-2) : null }).returning();
        let n = 0;
        for (const l of lines) {
          for (let q = 0; q < l.qty; q++) {
            n++;
            const live = ds.stage === "reported" || n === 1;
            const status = live ? "live" : n === 2 ? "in_review" : n === 3 ? "approved" : "briefed";
            const due = live ? d(-3) : d(n * 5);
            const [dl] = await db
              .insert(s.deliverables)
              .values({ campaignId: camp.id, creatorId: C[l.ck], deliverableKey: l.key, platform: l.key.startsWith("yt") ? "youtube" : l.key.startsWith("linkedin") ? "linkedin" : "instagram", title: `${ds.title.split(" — ")[0]} #${n}`, briefTags: ["agents"], dueOn: due, scheduledFor: status === "approved" ? d(16) : live ? d(-3) : null, liveAt: live ? ts(-3) : null, liveUrl: live ? "https://instagram.com/p/example" : null, status, revisionRound: status === "in_review" ? 1 : 0, disclosureChecked: live || status === "approved", claimsApprovedByBrand: live || status === "approved", draftMd: status === "in_review" ? "Lumen's agent runs the whole eval loop in 4 minutes. #ad" : null })
              .returning();
            await db.insert(s.creatorCalendarItems).values({ creatorId: C[l.ck], date: due, kind: "sponsored", title: `${BRANDS.find((b) => b.key === ds.brand)!.name} · ${dl.title}`, deliverableId: dl.id, campaignId: camp.id, studioStatus: live ? "posted" : "scripted", pillar: "authority", conceptBucket: "proven" });
            if (live) await db.insert(s.deliverableMetrics).values({ deliverableId: dl.id, saves: 640, shares: 210, commentsDecisionMaker: 14, inboundToBrand: 22, trackedSignups: 180, impressions: 96000 });
          }
        }
        if (ds.stage === "reported") {
          await db.insert(s.invoices).values({ dealId: deal.id, kind: "balance", number: `OWLED/2026/B${String(Math.floor(Math.random() * 9000) + 1000)}`, issuedOn: d(-2), dueOn: d(5), amountPaise: quoted - adv, status: "sent" });
          await db.insert(s.brandFeedback).values({ brandId: B[ds.brand], campaignId: camp.id, submittedOn: d(-1), q1: 5, q2: 4, q3: 5, q4: 5, q5: 5, comment: "Best-qualified inbound we've had from creators." });
        }
      }
    }
  }

  // Declined deal on the blocklisted brand
  await db.insert(s.deals).values({ brandId: B.betbuddy, title: "BetBuddy IPL push", ownerUserId: lead.id, stage: "declined", type: "one_off", oneOffReason: "Season launch", quotedTotalPaise: L(600000), declinedReason: "Blocklist: gambling / real-money gaming", declinedValuePaise: L(600000), noListCheck: { ...noList, blocklist_category: "gambling_rmg", passed: false }, createdBy: lead.id });

  // Overrides awaiting the Owner
  const [quill] = await db.select().from(s.deals).where(eq(s.deals.title, "Quill launch one-off"));
  await db.insert(s.dealOverrides).values({ dealId: quill.id, kind: "min_deal", requestedBy: lead.id, reason: "Strategic logo for the ladder; small first deal" });

  // Inbox
  await db.insert(s.inboxThreads).values([
    { creatorId: C.meera, channel: "instagram_dm", fromName: "Priya @ Vectorly", subject: "Collab on our RAG launch?", firstMessageMd: "Hi Meera! We're launching a RAG toolkit next month and would love a reel. Budget is flexible.", receivedAt: ts(-1.2), slaDueAt: ts(-0.2), status: "new" },
    { creatorId: C.zoya, channel: "email", fromName: "Rahul, Finlo", fromAddress: "rahul@finlo.example", subject: "Partnership — lifetime usage", firstMessageMd: "We'd like to feature Zoya in our ads with lifetime usage rights. Can share product access in return.", receivedAt: ts(-0.3), slaDueAt: ts(0.7), status: "new" },
    { creatorId: null, channel: "linkedin", fromName: "Sana, Orbit Cloud", subject: "Creators for our enterprise AI week", firstMessageMd: "Looking for 3 creators who speak to CIOs. Annual budget approved.", receivedAt: ts(-0.1), slaDueAt: ts(0.9), status: "triaged", brandId: B.orbit },
  ]);

  // Program
  const [cohort] = await db.insert(s.programCohorts).values({ programme: "creatorpreneur", batchLabel: "Creatorpreneur — Batch 7", startsOn: d(-20), endsOn: d(70), counterpartName: "LIT EPIC Master", counterpartEmail: "epic@lit.example" }).returning();
  const [ch] = await db.insert(s.programChallenges).values({ cohortId: cohort.id, title: "Explain an AI note-taker to a busy founder", brandId: B.quill, briefMd: "An AI note-taker for founders. 60 seconds. Idea → shoot → edit.", opensAt: ts(-3), closesAt: ts(-1), status: "judging", judges: [owner.id, lead.id], topN: 7, capacityNote: "Runs when Crew has capacity" }).returning();
  const students = ["Aisha Qureshi", "Karan Gill", "Pooja Reddy", "Vikram Sen", "Neha Jain", "Farhan Ali", "Ritu Sharma", "Om Prakash", "Sneha Kulkarni", "Aditya Bose", "Ira Menon", "Yash Patel"];
  for (const [i, name] of students.entries()) {
    const [cr] = await db.insert(s.creators).values({ displayName: name, stage: "scout", subCategory: i % 2 ? "ai_educator" : "founder_operator", source: "program", consentStatus: "opted_in", city: "Bengaluru", languages: ["en", "hinglish"] }).returning();
    await db.insert(s.programEntries).values({ challengeId: ch.id, creatorId: cr.id, consentStatus: "opted_in", declaredSubCategory: i % 2 ? "ai_educator" : "founder_operator", declaredPlatform: "instagram", submissionUrl: `https://instagram.com/p/entry${i}`, noteMd: "Shot on my phone between classes.", submittedAt: ts(-1.5) });
  }
  await db.insert(s.programSundayShoots).values({ date: d(6), location: "OWLED studio, Indiranagar", creators: [C.ananya, C.rohan], crewLeadUserId: lead.id });
  await db.insert(s.programInterns).values([
    { personName: "Riya Kapoor", email: "intern1@crew.example", cohortId: cohort.id, startsOn: d(-20), endsOn: d(70), function: "research" },
    { personName: "Manav Shah", email: "intern2@crew.example", cohortId: cohort.id, startsOn: d(-20), endsOn: d(70), function: "deal_desk" },
  ]);

  // Portal users
  const [lumenContact] = await db.select().from(s.brandContacts).where(eq(s.brandContacts.brandId, B.lumen));
  await db.insert(s.users).values([
    { email: "meera@creator.example", name: "Meera Iyer", role: "creator_user", creatorId: C.meera },
    { email: "ananya@creator.example", name: "Ananya Das", role: "creator_user", creatorId: C.ananya },
    { email: "growth@lumen.example", name: "Lumen Marketing", role: "brand_user", brandId: B.lumen, brandContactId: lumenContact.id },
    { email: "epic@lit.example", name: "LIT EPIC Master", role: "program_counterpart", cohortIds: [cohort.id] },
  ]);

  // Studio content for Meera
  await db.insert(s.studioOutliers).values([
    { creatorId: C.meera, sourceType: "creator", creatorHandle: "@tinyagents", link: "https://instagram.com/reel/x1", followerCount: 12000, views: 410000, hookWritten: "I replaced my standup with an agent", hookVerbal: "This agent ran our standup for a week", angle: "Transformation", used: true },
    { creatorId: C.meera, sourceType: "keyword", creatorHandle: "@evalsguy", link: "https://instagram.com/reel/x2", nicheKeyword: "llm evals", followerCount: 30000, views: 96000, hookWritten: "3 evals every AI app needs", hookVerbal: "If you ship an LLM app, run these three evals", angle: "Framework / Formula / Acronym" },
  ]);
  await db.insert(s.studioPosts).values([
    { creatorId: C.meera, title: "Agents vs workflows", postedOn: d(-20), views: 220000, followersAtPost: 176000, saves: 4100, shares: 980, commentsDecisionMaker: 22, inbound: 6, pillar: "authority", format: "Whiteboard Format", hook: "Stop calling everything an agent" },
    { creatorId: C.meera, title: "My eval stack", postedOn: d(-13), views: 88000, followersAtPost: 179000, saves: 2300, shares: 410, commentsDecisionMaker: 9, inbound: 3, pillar: "authority", format: "Shot / Angle Changes", hook: "The 3 evals I run on every prompt" },
    { creatorId: C.meera, title: "Day 1 of building in public", postedOn: d(-6), views: 1200000, followersAtPost: 181000, saves: 15200, shares: 6100, commentsDecisionMaker: 51, inbound: 19, pillar: "journey", format: "Voiceover Format", hook: "Day 1: I'm building an agent that files my taxes" },
  ]);

  console.log("demo data loaded");
}

main()
  .then(() => client.end())
  .catch(async (e) => {
    console.error(e);
    await client.end();
    process.exit(1);
  });
