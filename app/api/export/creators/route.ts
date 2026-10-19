// CSV export of creators. Tier, Filter scores and internal notes never appear in any export (§0.1 #6).
import { asc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getMe } from "@/lib/session";
import { canReadSettings, CREATOR_EXPORT_COLUMNS } from "@/lib/rules/settings";
import { toCsv } from "@/lib/csv";
import { today } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getMe();
  if (!me || !canReadSettings(me.role)) return new Response("Not allowed", { status: 403 });
  // Only whitelisted columns are selected — tier can't leak even if added to the table later.
  const rows = await db
    .select({
      id: s.creators.id,
      display_name: s.creators.displayName,
      stage: s.creators.stage,
      sub_category: s.creators.subCategory,
      primary_platform: s.creators.primaryPlatform,
      city: s.creators.city,
      country: s.creators.country,
      languages: s.creators.languages,
      source: s.creators.source,
      consent_status: s.creators.consentStatus,
      first_look_until: s.creators.firstLookUntil,
      revisit_on: s.creators.revisitOn,
      email: s.creators.email,
      created_at: s.creators.createdAt,
    })
    .from(s.creators)
    .where(isNull(s.creators.archivedAt))
    .orderBy(asc(s.creators.displayName));
  const body = toCsv(
    CREATOR_EXPORT_COLUMNS,
    rows.map((r) => CREATOR_EXPORT_COLUMNS.map((c) => (c === "languages" ? r.languages.join(" ") : r[c]))),
  );
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="creators-${today()}.csv"` } });
}
