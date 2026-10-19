import { Suspense } from "react";
import { requireCrew } from "@/lib/session";
import { getDeals, getNewDealOptions, getTemplate } from "@/lib/queries/deals";
import { getConfig } from "@/lib/settings";
import { can } from "@/lib/rules/visibility";
import { ScreenHeader, ButtonLink } from "@/components/ui";
import { SegmentedControl, KeyRows } from "@/components/ui/client";
import { DealsBoard, DealsList, DeclinedLog, DealsFooterLine, type SortKey } from "@/components/deals/DealsViews";
import { NewDealSheet } from "@/components/deals/NewDealSheet";

export const metadata = { title: "Deals" };
export const dynamic = "force-dynamic";

const SORTS: SortKey[] = ["brand", "title", "stage", "type", "total", "days", "blocker"];

export default async function DealsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireCrew("readDeals");
  const sp = await searchParams;
  const view = sp.view === "list" || sp.view === "declined" ? sp.view : "board";
  const sort = SORTS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : "stage";
  const dir = sp.dir === "desc" ? "desc" : "asc";
  const canWrite = can(me.role, "writeDeals");
  const [{ rows, footer }, options, cfg, selfServe] = await Promise.all([getDeals(), canWrite ? getNewDealOptions() : null, getConfig(), canWrite ? getTemplate("self_serve") : ""]);
  const open = rows.filter((r) => !["declined", "lost", "paid_in_full"].includes(r.stage)).length;
  return (
    <div className="flex flex-col min-h-screen">
      <ScreenHeader
        title="Deals"
        action={
          canWrite && options ? (
            <Suspense>
              <NewDealSheet brands={options.brands} creators={options.creators} minDealRupees={cfg.n.min_deal_paise / 100} selfServe={selfServe} />
            </Suspense>
          ) : undefined
        }
      >
        <span className="t-caption">{open} open</span>
      </ScreenHeader>
      <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap border-b border-rule">
        <SegmentedControl
          param="view"
          value={view}
          options={[
            { value: "board", label: "Board" },
            { value: "list", label: "List" },
            { value: "declined", label: "Declined", count: footer.declinedCount },
          ]}
        />
        <div className="flex gap-1">
          <ButtonLink href="/deals/calculator" variant="quiet" size="sm">
            Calculator
          </ButtonLink>
          <ButtonLink href="/api/deals/export" variant="quiet" size="sm" prefetch={false}>
            Export CSV
          </ButtonLink>
        </div>
      </div>
      <KeyRows className="flex-1">
        {view === "board" ? <DealsBoard rows={rows} /> : view === "list" ? <DealsList rows={rows} sort={sort} dir={dir} /> : <DeclinedLog rows={rows} />}
      </KeyRows>
      <DealsFooterLine pipeline={footer.pipelinePaise} signed={footer.signedQuarterPaise} declined={footer.declinedPaise} declinedCount={footer.declinedCount} />
    </div>
  );
}
