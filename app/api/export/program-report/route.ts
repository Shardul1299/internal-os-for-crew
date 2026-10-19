import type { NextRequest } from "next/server";
import { getMe } from "@/lib/session";
import { programCan } from "@/lib/rules/program";
import { getProgramReport } from "@/lib/queries/program";

export async function GET(req: NextRequest) {
  const me = await getMe();
  if (!me || !programCan(me.role, "cost").ok) return new Response("Not allowed", { status: 403 });
  const id = req.nextUrl.searchParams.get("cohort");
  if (!id) return new Response("Missing cohort", { status: 400 });
  const r = await getProgramReport(id);
  if (!r) return new Response("Not found", { status: 404 });
  const name = `program-report-${r.cohort.batchLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${r.generatedOn}.md`;
  return new Response(r.md, { headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": `attachment; filename="${name}"` } });
}
