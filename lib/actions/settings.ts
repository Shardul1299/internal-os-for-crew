"use server";
// Settings — server actions (§3.7, §10, §12, §19.15). Money and gate rules are Owner-only (lib/rules/settings).
// Every change goes through withUser() so the audit log records who changed what; getConfig() reads the new values.
import { z } from "zod";
import { and, desc, eq, ne, sql as dsql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser, type Tx } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { ok, fail, guard, type ActionResult } from "./result";
import { parseInput } from "./parse";
import { RUNG_ORDER, type RungKey } from "@/lib/rules/config";
import {
  canEditSettings,
  validateLadder,
  validateAddon,
  validateDeliverable,
  validateRubric,
  validateCommission,
  validateNumber,
  type SettingsSection,
} from "@/lib/rules/settings";
import { encryptSecret, AI_PROVIDERS } from "@/lib/studio/ai";
import { getConfig } from "@/lib/settings";
import { rupeesToPaise } from "@/lib/format";
import { today as todayISO } from "@/lib/dates";
import { csvRecords } from "@/lib/csv";

async function settingsActor(section: SettingsSection) {
  const me = await actor("settings");
  const g = canEditSettings(me.role, section);
  if (!g.ok) throw new Error(g.reasons[0]);
  return me;
}

/**
 * Rows keyed by `key`/`origin` reach the audit trigger without an id; name the row on the entry the
 * trigger just wrote in this transaction (now() is the transaction time) so the audit log shows which one.
 */
async function tagAudit(tx: Tx, entity: string, key: string, userId: string) {
  await tx.execute(dsql`update audit_log set entity_id = ${key} where entity = ${entity} and entity_id is null and user_id = ${userId} and at = now()`);
}

function done(section: string) {
  revalidatePath(`/settings/${section}`);
  revalidatePath("/", "layout"); // thresholds are settings: every screen re-reads getConfig()
}

const num = (msg = "Enter a number") => z.coerce.number({ message: msg }).refine(Number.isFinite, msg);
const optNum = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : Number(v)))
  .refine((v) => v == null || Number.isFinite(v), "Enter a number");
const bool = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true" || v === "1");

// ---------- Ladder ----------

const LadderSchema = z.object({
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  lucrative: num(),
  semi: num(),
  standard: num(),
  pitch: num(),
  premium: num(),
});

export async function createLadderVersion(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("ladder");
    const input = parseInput(LadderSchema, Object.fromEntries(fd));
    const rungs = Object.fromEntries(RUNG_ORDER.map((k) => [k, input[k]])) as Record<RungKey, number>;
    const g = validateLadder(rungs);
    if (!g.ok) return fail(g.reasons[0]);
    const [latest] = await db.select().from(s.ladders).orderBy(desc(s.ladders.version)).limit(1);
    const base = latest?.rungs ?? [];
    const version = (latest?.version ?? 0) + 1;
    await withUser(me.id, (tx) =>
      tx.insert(s.ladders).values({
        version,
        effectiveFrom: input.effectiveFrom,
        active: false,
        rungs: RUNG_ORDER.map((k) => {
          const prev = base.find((r) => r.key === k);
          return { key: k, label: prev?.label ?? k, pct: rungs[k], use: prev?.use ?? "" };
        }),
        createdBy: me.id,
      }),
    );
    done("ladder");
    return ok(`Ladder v${version} drafted`);
  });
}

export async function activateLadder(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("ladder");
    const { id } = parseInput(z.object({ id: z.uuid() }), Object.fromEntries(fd));
    const [l] = await db.select().from(s.ladders).where(eq(s.ladders.id, id));
    if (!l) return fail("Ladder not found");
    const g = validateLadder(Object.fromEntries(l.rungs.map((r) => [r.key, r.pct])));
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, async (tx) => {
      await tx.update(s.ladders).set({ active: false }).where(and(eq(s.ladders.active, true), ne(s.ladders.id, id)));
      await tx.update(s.ladders).set({ active: true }).where(eq(s.ladders.id, id));
    });
    done("ladder");
    return ok(`Ladder v${l.version} active — new quotes use it`);
  });
}

// ---------- Deliverables ----------

const DeliverableSchema = z.object({
  key: z.string().trim().min(1, "Key missing"),
  isNew: bool,
  label: z.string().trim().min(1, "Label missing"),
  platform: z.enum(s.platformEnum.enumValues),
  multiple: num("Multiple must be a number"),
  sortOrder: z.coerce.number().int().default(0),
  active: bool,
});

export async function saveDeliverable(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("deliverables");
    const input = parseInput(DeliverableSchema, Object.fromEntries(fd));
    const g = validateDeliverable({ key: input.key, label: input.label, multiple: input.multiple });
    if (!g.ok) return fail(g.reasons[0]);
    const values = { label: input.label, platform: input.platform, defaultMultipleOfReel: input.multiple, sortOrder: input.sortOrder, active: input.active };
    await withUser(me.id, async (tx) => {
      if (input.isNew) {
        const [dup] = await tx.select({ k: s.deliverableTypes.key }).from(s.deliverableTypes).where(eq(s.deliverableTypes.key, input.key));
        if (dup) throw new Error("That key exists");
        await tx.insert(s.deliverableTypes).values({ key: input.key, ...values });
      } else await tx.update(s.deliverableTypes).set(values).where(eq(s.deliverableTypes.key, input.key));
      await tagAudit(tx, "deliverable_types", input.key, me.id);
    });
    done("deliverables");
    return ok(input.isNew ? "Deliverable added" : "Deliverable saved");
  });
}

// ---------- Add-ons ----------

const AddonSchema = z.object({
  key: z.string().trim().regex(/^[a-z0-9_]+$/, "Key uses lowercase letters, digits and underscores"),
  isNew: bool,
  label: z.string().trim().min(1, "Label missing"),
  pct: optNum,
  kind: z.enum(s.addonKindEnum.enumValues),
  days: optNum,
  note: z.string().optional().transform((v) => (v?.trim() ? v.trim() : null)),
  active: bool,
});

export async function saveAddon(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("addons");
    const input = parseInput(AddonSchema, Object.fromEntries(fd));
    const cfg = await getConfig();
    const g = validateAddon({ key: input.key, kind: input.kind, pct: input.pct, days: input.days }, cfg.n.usage_max_days);
    if (!g.ok) return fail(g.reasons[0]);
    const values = { label: input.label, pct: input.pct, kind: input.kind, days: input.days, note: input.note, active: input.active };
    await withUser(me.id, async (tx) => {
      if (input.isNew) {
        const [dup] = await tx.select({ k: s.addons.key }).from(s.addons).where(eq(s.addons.key, input.key));
        if (dup) throw new Error("That key exists");
        await tx.insert(s.addons).values({ key: input.key, ...values });
      } else await tx.update(s.addons).set(values).where(eq(s.addons.key, input.key));
      await tagAudit(tx, "addons", input.key, me.id);
    });
    done("addons");
    return ok(input.isNew ? "Add-on added" : "Add-on saved");
  });
}

// ---------- Filter rubric ----------

const RubricSchema = z.object({
  watchlist: z.coerce.number().int(),
  roster: z.coerce.number().int(),
  challenge_top_n: z.coerce.number().int(),
  revisit_min: z.coerce.number().int(),
  revisit_max: z.coerce.number().int(),
});

export async function saveRubric(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("filter");
    const t = parseInput(RubricSchema, Object.fromEntries(fd));
    const g = validateRubric(t);
    if (!g.ok) return fail(g.reasons[0]);
    const [cur] = await db.select().from(s.filterRubrics).orderBy(desc(s.filterRubrics.version)).limit(1);
    await withUser(me.id, async (tx) => {
      await tx.update(s.filterRubrics).set({ active: false }).where(eq(s.filterRubrics.active, true));
      await tx.insert(s.filterRubrics).values({ version: (cur?.version ?? 0) + 1, dimensions: cur?.dimensions ?? ["aesthetics", "taste", "personality"], thresholds: t, active: true });
    });
    done("filter");
    return ok(`Filter rubric v${(cur?.version ?? 0) + 1} active`);
  });
}

// ---------- NO list & blocklist ----------

const NoListSchema = z.object({
  list: z.enum(["no", "block"]),
  key: z.string().trim().regex(/^[a-z0-9_]+$/, "Key uses lowercase letters, digits and underscores"),
  isNew: bool,
  label: z.string().trim().min(1, "Label missing"),
  description: z.string().optional().default(""),
  active: bool,
});

export async function saveListItem(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("nolist");
    const input = parseInput(NoListSchema, Object.fromEntries(fd));
    await withUser(me.id, async (tx) => {
      if (input.list === "no") {
        const values = { label: input.label, description: input.description.trim() || input.label, active: input.active };
        if (input.isNew) await tx.insert(s.noListItems).values({ key: input.key, ...values });
        else await tx.update(s.noListItems).set(values).where(eq(s.noListItems.key, input.key));
        await tagAudit(tx, "no_list_items", input.key, me.id);
      } else {
        const values = { label: input.label, active: input.active };
        if (input.isNew) await tx.insert(s.blocklistCategories).values({ key: input.key, ...values });
        else await tx.update(s.blocklistCategories).set(values).where(eq(s.blocklistCategories.key, input.key));
        await tagAudit(tx, "blocklist_categories", input.key, me.id);
      }
    });
    done("nolist");
    return ok(input.isNew ? "Item added" : input.active ? "Item saved" : "Item off — no longer checked");
  });
}

// ---------- Commission ----------

export async function saveCommission(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("commission");
    const origins = Object.fromEntries(s.dealOriginEnum.enumValues.map((o) => [o, Number(fd.get(`origin_${o}`))]));
    const share = {
      upsellSharePct: Number(fd.get("upsell_share_pct")),
      referralSharePct: Number(fd.get("referral_share_pct")),
      referralDealCount: Number(fd.get("referral_deal_count")),
    };
    if ([...Object.values(origins), ...Object.values(share)].some((v) => !Number.isFinite(v))) return fail("Enter every percentage");
    const g = validateCommission({ origins, ...share });
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, async (tx) => {
      for (const [origin, pct] of Object.entries(origins)) {
        await tx
          .insert(s.commissionRules)
          .values({ origin: origin as (typeof s.dealOriginEnum.enumValues)[number], pct })
          .onConflictDoUpdate({ target: s.commissionRules.origin, set: { pct } });
        await tagAudit(tx, "commission_rules", origin, me.id);
      }
      const rows: [string, number, string, string][] = [
        ["upsell_share_pct", share.upsellSharePct, "Upsell share", "%"],
        ["referral_share_pct", share.referralSharePct, "Referral share", "%"],
        ["referral_deal_count", share.referralDealCount, "Referral share on first", "deals"],
      ];
      for (const [key, value, label, unit] of rows) {
        await tx.insert(s.settings).values({ key, value, label, unit }).onConflictDoUpdate({ target: s.settings.key, set: { value } });
        await tagAudit(tx, "settings", key, me.id);
      }
    });
    done("commission");
    return ok("Commission rules saved — new deals use them");
  });
}

// ---------- Numbers ----------

export async function saveNumbers(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("numbers");
    const rows = await db.select().from(s.settings);
    const changes: { key: string; value: number }[] = [];
    for (const r of rows) {
      const raw = fd.get(`n_${r.key}`);
      if (raw == null || String(raw).trim() === "") continue;
      const value = r.unit === "paise" ? rupeesToPaise(String(raw)) : Number(raw);
      const g = validateNumber(r.key, value);
      if (!g.ok) return fail(`${r.label}: ${g.reasons[0]}`);
      if (value !== r.value) changes.push({ key: r.key, value });
    }
    if (!changes.length) return ok("No changes");
    await withUser(me.id, async (tx) => {
      for (const c of changes) {
        await tx.update(s.settings).set({ value: c.value }).where(eq(s.settings.key, c.key));
        await tagAudit(tx, "settings", c.key, me.id);
      }
    });
    done("numbers");
    return ok(`${changes.length} ${changes.length === 1 ? "setting" : "settings"} saved`);
  });
}

// ---------- Templates ----------

const TemplateSchema = z.object({ key: z.string().min(1), label: z.string().trim().min(1, "Label missing"), bodyMd: z.string() });

export async function saveTemplate(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("templates");
    const input = parseInput(TemplateSchema, Object.fromEntries(fd));
    const [cur] = await db.select({ k: s.templates.key }).from(s.templates).where(eq(s.templates.key, input.key));
    if (!cur) return fail("Template not found");
    await withUser(me.id, async (tx) => {
      await tx.update(s.templates).set({ label: input.label, bodyMd: input.bodyMd, updatedAt: new Date() }).where(eq(s.templates.key, input.key));
      await tagAudit(tx, "templates", input.key, me.id);
    });
    done("templates");
    return ok("Template saved");
  });
}

// ---------- AI (§19.15): org-level key, encrypted at rest, masked in the UI ----------

const AiSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  model: z.string().trim().default(""),
  customEndpoint: z.union([z.literal(""), z.url("Endpoint must be a URL")]).default(""),
  apiKey: z.string().trim().default(""),
});

export async function saveAi(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("ai");
    const input = parseInput(AiSchema, Object.fromEntries(fd));
    if (input.provider === "custom" && !input.customEndpoint) return fail("A custom provider needs an endpoint");
    // Same storage as saveAiSettings (lib/studio/ai.ts), written inside withUser so the audit log names the Owner.
    await withUser(me.id, async (tx) => {
      const [row] = await tx.select().from(s.aiSettings).where(eq(s.aiSettings.id, 1));
      const apiKey = input.apiKey ? encryptSecret(input.apiKey) : (row?.apiKey ?? "");
      const values = { provider: input.provider, apiKey, model: input.model, customEndpoint: input.customEndpoint, updatedAt: new Date() };
      await tx.insert(s.aiSettings).values({ id: 1, ...values }).onConflictDoUpdate({ target: s.aiSettings.id, set: values });
    });
    done("ai");
    return ok(input.apiKey ? "AI key saved" : "AI settings saved");
  });
}

export async function clearAi(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  void fd;
  return guard(async () => {
    const me = await settingsActor("ai");
    await withUser(me.id, (tx) => tx.update(s.aiSettings).set({ apiKey: "", updatedAt: new Date() }).where(eq(s.aiSettings.id, 1)));
    done("ai");
    return ok("Key cleared — generators fall back to Copy prompt");
  });
}

// ---------- CSV import (§10, §11): creators and brands. Tier is never imported. ----------

const SUBS = s.subCategoryEnum.enumValues as readonly string[];
const PLATFORMS = s.platformEnum.enumValues as readonly string[];
const SOURCES = s.creatorSourceEnum.enumValues as readonly string[];
const CATEGORIES = s.brandCategoryEnum.enumValues as readonly string[];
const TEAMS = s.ownerTeamEnum.enumValues as readonly string[];

const ImportSchema = z.object({ kind: z.enum(["creators", "brands"]), csv: z.string().min(1, "Paste CSV with a header row") });

export async function importCsv(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await settingsActor("data");
    const input = parseInput(ImportSchema, Object.fromEntries(fd));
    const recs = csvRecords(input.csv);
    if (!recs.length) return fail("No rows under the header");
    if (recs.length > 2000) return fail("Import up to 2,000 rows at a time");
    if (input.kind === "creators") {
      const rows: (typeof s.creators.$inferInsert)[] = [];
      for (const [i, r] of recs.entries()) {
        const name = r.display_name || r.name;
        if (!name) return fail(`Row ${i + 2}: name missing`);
        const sub = (r.sub_category || r.subcategory || "").toLowerCase();
        if (!SUBS.includes(sub)) return fail(`Row ${i + 2}: sub-category must be one of ${SUBS.join(", ")}`);
        const platform = (r.primary_platform || r.platform || "instagram").toLowerCase();
        const source = (r.source || "outbound").toLowerCase();
        rows.push({
          displayName: name,
          email: r.email || null,
          city: r.city || null,
          subCategory: sub as (typeof s.subCategoryEnum.enumValues)[number],
          primaryPlatform: (PLATFORMS.includes(platform) ? platform : "other") as (typeof s.platformEnum.enumValues)[number],
          source: (SOURCES.includes(source) ? source : "outbound") as (typeof s.creatorSourceEnum.enumValues)[number],
          sourceDetail: `CSV import ${todayISO()}`,
          stage: "scout" as const, // every import starts in Scout; the Filter gate applies from there
          createdBy: me.id,
        });
      }
      await withUser(me.id, async (tx) => {
        for (let i = 0; i < rows.length; i += 200) await tx.insert(s.creators).values(rows.slice(i, i + 200));
      });
      revalidatePath("/creators");
      return ok(`${rows.length} creators imported to Scout`);
    }
    const existing = new Set((await db.select({ n: s.brands.name }).from(s.brands)).map((b) => b.n.toLowerCase()));
    const rows: (typeof s.brands.$inferInsert)[] = [];
    for (const [i, r] of recs.entries()) {
      const name = r.name || r.brand;
      if (!name) return fail(`Row ${i + 2}: name missing`);
      if (existing.has(name.toLowerCase())) continue;
      existing.add(name.toLowerCase());
      const category = (r.category || "other").toLowerCase();
      const team = (r.owner_team || "crew").toLowerCase();
      rows.push({
        name,
        website: r.website || null,
        category: (CATEGORIES.includes(category) ? category : "other") as (typeof s.brandCategoryEnum.enumValues)[number],
        ownerTeam: (TEAMS.includes(team) ? team : "crew") as (typeof s.ownerTeamEnum.enumValues)[number],
        createdBy: me.id,
      });
    }
    if (rows.length) await withUser(me.id, (tx) => tx.insert(s.brands).values(rows));
    revalidatePath("/brands");
    return ok(`${rows.length} brands imported${recs.length - rows.length ? ` · ${recs.length - rows.length} already existed` : ""}`);
  });
}
