import { NextResponse } from "next/server";
import { and, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getMe, CREW_ROLES } from "@/lib/session";
import { can } from "@/lib/rules/visibility";

export async function GET(req: Request) {
  const me = await getMe();
  if (!me || !CREW_ROLES.includes(me.role)) return NextResponse.json([], { status: 401 });
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  const like = `%${q}%`;
  const out: { id: string; label: string; group: string; href: string }[] = [];
  if (!["sales_viewer", "finance_viewer"].includes(me.role)) {
    const cs = await db.select({ id: s.creators.id, n: s.creators.displayName }).from(s.creators).where(and(or(ilike(s.creators.displayName, like), ilike(s.creators.legalName, like)), isNull(s.creators.archivedAt))).limit(6);
    out.push(...cs.map((c) => ({ id: c.id, label: c.n, group: "Creators", href: `/creators/${c.id}` })));
  }
  if (can(me.role, "readDeals")) {
    const ds = await db.select({ id: s.deals.id, t: s.deals.title }).from(s.deals).where(and(ilike(s.deals.title, like), isNull(s.deals.archivedAt))).limit(6);
    out.push(...ds.map((d) => ({ id: d.id, label: d.t, group: "Deals", href: `/deals/${d.id}` })));
  }
  if (can(me.role, "readBrands")) {
    const bs = await db.select({ id: s.brands.id, n: s.brands.name }).from(s.brands).where(and(ilike(s.brands.name, like), isNull(s.brands.archivedAt))).limit(6);
    out.push(...bs.map((b) => ({ id: b.id, label: b.n, group: "Brands", href: `/brands/${b.id}` })));
  }
  return NextResponse.json(out);
}
