// CSV export of deals. No tier, rungs or creator Standards in exports.
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getMe } from "@/lib/session";
import { can } from "@/lib/rules/visibility";
import { toCsv } from "@/lib/csv";
import { today } from "@/lib/dates";

export const dynamic = "force-dynamic";
const rupees = (p: number | null) => (p == null ? null : (p / 100).toFixed(2));

export async function GET() {
  const me = await getMe();
  if (!me || !can(me.role, "readDeals")) return new Response("Not allowed", { status: 403 });
  const rows = await db
    .select({ d: s.deals, brand: s.brands.name })
    .from(s.deals)
    .innerJoin(s.brands, eq(s.brands.id, s.deals.brandId))
    .where(isNull(s.deals.archivedAt))
    .orderBy(asc(s.deals.createdAt));
  const header = ["id", "brand", "title", "stage", "type", "origin", "currency", "quoted_total", "signed_total", "term_starts_on", "term_ends_on", "po_reference", "declined_value", "created_at", "stage_changed_at"] as const;
  const body = toCsv(
    header,
    rows.map(({ d, brand }) => [d.id, brand, d.title, d.stage, d.type, d.origin, d.currency, rupees(d.quotedTotalPaise), rupees(d.signedTotalPaise), d.termStartsOn, d.termEndsOn, d.poReference, rupees(d.declinedValuePaise), d.createdAt, d.stageChangedAt]),
  );
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="deals-${today()}.csv"` } });
}
