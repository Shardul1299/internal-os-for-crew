import { asc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getMe } from "@/lib/session";
import { can } from "@/lib/rules/visibility";
import { toCsv } from "@/lib/csv";
import { today } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getMe();
  if (!me || !can(me.role, "readBrands")) return new Response("Not allowed", { status: 403 });
  const rows = await db.select().from(s.brands).where(isNull(s.brands.archivedAt)).orderBy(asc(s.brands.name));
  const header = ["id", "name", "website", "category", "owner_team", "is_house_client", "risk_flags", "risk_reviewed_at", "nps_latest", "nps_as_of", "created_at"] as const;
  const body = toCsv(
    header,
    rows.map((b) => [b.id, b.name, b.website, b.category, b.ownerTeam, b.isHouseClient, b.riskFlags.join(" "), b.riskReviewedAt, b.npsLatest, b.npsAsOf, b.createdAt]),
  );
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="brands-${today()}.csv"` } });
}
