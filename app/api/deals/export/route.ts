// Deals CSV (BRIEF §11). Role-checked. Leaves Crew Desk, so no tier, rungs, Standards or commission.
import { getMe } from "@/lib/session";
import { can } from "@/lib/rules/visibility";
import { getDeals } from "@/lib/queries/deals";

function csvCell(v: unknown) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const rupees = (paise: number | null | undefined) => (paise == null ? "" : (paise / 100).toFixed(2));

export async function GET() {
  const me = await getMe();
  if (!me) return new Response("Sign in", { status: 401 });
  if (!can(me.role, "readDeals")) return new Response("Your role can't export deals", { status: 403 });
  const { rows } = await getDeals();
  const header = ["brand", "title", "stage", "type", "origin", "currency", "total", "days_in_stage", "blocker", "created_on", "stage_changed_on", "declined_reason", "declined_value", "lost_reason"];
  const body =
    [header, ...rows.map((r) => [r.brand, r.title, r.stage, r.type, r.origin, r.currency, rupees(r.totalPaise), r.daysInStage, r.blocker, r.createdAt, r.stageChangedAt, r.declinedReason, rupees(r.declinedValuePaise), r.lostReason])]
      .map((r) => r.map(csvCell).join(","))
      .join("\n") + "\n";
  return new Response(body, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="snoball-deals.csv"`, "cache-control": "no-store" },
  });
}
