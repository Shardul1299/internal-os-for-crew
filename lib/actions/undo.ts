"use server";
// Generic ⌘Z within 10 seconds (§13.6), backed by the audit log: reverts the acting user's
// last change to a row. Updates restore old values; inserts are soft-deleted (archived_at).
import { and, desc, eq, gte } from "drizzle-orm";
import { sql as dsql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import * as s from "@/lib/db/schema";
import { verifyUndo } from "@/lib/undo-token";
import { getConfig } from "@/lib/settings";
import { recomputeQuoted } from "./deal-ops";
import { isAtLeast } from "@/lib/rules/deals";
import { draftLocked } from "@/lib/rules/studio";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import type { ActionResult } from "./result";

const UNDOABLE = new Set([
  "creators",
  "creator_topic_filters",
  "creator_blackouts",
  "creator_calendar_items",
  "deals",
  "deal_creators",
  "deal_quote_lines",
  "deliverables",
  "inbox_threads",
  "brands",
  "brand_contacts",
  "program_entries",
  "studio_scripts",
  "studio_outliers",
  "studio_hook_stacks",
  "studio_posts",
]);

/** Locks that undo must respect, like the actions themselves do. */
async function undoLocked(entity: string, id: string): Promise<string | null> {
  if (entity === "deal_quote_lines") {
    const [row] = await db.select({ stage: s.deals.stage }).from(s.dealQuoteLines).innerJoin(s.deals, eq(s.deals.id, s.dealQuoteLines.dealId)).where(eq(s.dealQuoteLines.id, id));
    if (row && isAtLeast(row.stage, "signed")) return "The quote is locked once signed.";
  }
  if (entity === "deliverables") {
    const [row] = await db.select({ status: s.deliverables.status }).from(s.deliverables).where(eq(s.deliverables.id, id));
    if (row && ["scheduled", "live", "reported"].includes(row.status)) return "Scheduled and live deliverables can't be undone.";
  }
  if (entity === "studio_scripts") {
    const rows = await db.select({ status: s.deliverables.status }).from(s.deliverables).where(eq(s.deliverables.draftScriptId, id));
    const lock = draftLocked(rows.map((r) => r.status));
    if (!lock.ok) return lock.reasons[0];
  }
  return null;
}

export async function undoLast(entity: string, id: string, token?: string): Promise<ActionResult> {
  const me = await actor();
  if (!UNDOABLE.has(entity)) return { ok: false, error: "This change can't be undone." };
  // Only a change whose action offered ⌘Z, within its window.
  if (!verifyUndo(entity, id, token)) return { ok: false, error: "Too late to undo." };
  const since = new Date(Date.now() - 12_000);
  const [last] = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.entity, entity), eq(auditLog.entityId, id), gte(auditLog.at, since)))
    .orderBy(desc(auditLog.at))
    .limit(1);
  // The latest change to the row must be this user's: never undo over someone else's later edit.
  if (!last || last.userId !== me.id) return { ok: false, error: "Too late to undo." };
  const locked = await undoLocked(entity, id);
  if (locked) return { ok: false, error: locked };
  const detail = last.detail as { changed?: Record<string, [unknown, unknown]>; new?: Record<string, unknown> };
  await withUser(me.id, async (tx) => {
    if (last.action === "update" && detail.changed) {
      // Keys are column names (the trigger serialises rows with to_jsonb).
      const sets = Object.entries(detail.changed).map(([k, [old]]) => {
        const v = old === null || Array.isArray(old) ? old : typeof old === "object" ? JSON.stringify(old) : old;
        return dsql`${dsql.identifier(k)} = ${v as string | number | boolean | null}`;
      });
      if (sets.length) await tx.execute(dsql`update ${dsql.identifier(entity)} set ${dsql.join(sets, dsql`, `)} where id = ${id}`);
    } else if (last.action === "insert") {
      await tx.execute(dsql`update ${dsql.identifier(entity)} set archived_at = now() where id = ${id}`);
    }
    // Derived totals follow the quote (the ₹25K minimum gate reads quoted_total_paise).
    if (entity === "deal_quote_lines") {
      const [line] = await tx.select({ dealId: s.dealQuoteLines.dealId }).from(s.dealQuoteLines).where(eq(s.dealQuoteLines.id, id));
      if (line) await recomputeQuoted(tx, await getConfig(), line.dealId);
    }
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
