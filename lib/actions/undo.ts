"use server";
// Generic ⌘Z within 10 seconds (§13.6), backed by the audit log: reverts the acting user's
// last change to a row. Updates restore old values; inserts are soft-deleted (archived_at).
import { and, desc, eq, gte } from "drizzle-orm";
import { sql as dsql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
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

export async function undoLast(entity: string, id: string): Promise<ActionResult> {
  const me = await actor();
  if (!UNDOABLE.has(entity)) return { ok: false, error: "This change can't be undone." };
  const since = new Date(Date.now() - 12_000);
  const [last] = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.entity, entity), eq(auditLog.entityId, id), eq(auditLog.userId, me.id), gte(auditLog.at, since)))
    .orderBy(desc(auditLog.at))
    .limit(1);
  if (!last) return { ok: false, error: "Too late to undo." };
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
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
