import { redirect } from "next/navigation";
import Link from "next/link";
import { requireCrew } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { listCreators, retentionMetrics, creatorSummary, scoreSheet, existingHandles, referralOptions, SEGMENTS, type Segment } from "@/lib/queries/creators";
import { ScreenHeader, Table, THead, TH, TR, TD, EmptyState, WithInspector, selHref, ButtonLink, Alert, Meta } from "@/components/ui";
import { SegmentedControl, SearchField, KeyRows } from "@/components/ui/client";
import { NewCreator } from "@/components/creators/NewCreator";
import { ImportCsv } from "@/components/creators/ImportCsv";
import { ScoreSheet } from "@/components/creators/ScoreSheet";
import { RetentionStrip } from "@/components/creators/RetentionStrip";
import { CreatorSummaryBlock } from "@/components/creators/Summary";
import { can } from "@/lib/rules/visibility";
import { canCreateCreator, canScoreFilter } from "@/lib/rules/creator-flow";
import { STAGE_LABEL, SUB_CATEGORY_LABEL, date, pct, int } from "@/lib/format";
import { sp as one } from "@/lib/search";
import { today as todayISO } from "@/lib/dates";

export const metadata = { title: "Creators" };
export const dynamic = "force-dynamic";

const CREATOR_ROLES = ["owner", "crew_lead", "ops", "strategist", "intern"];
const SEG_LABEL: Record<Segment, string> = {
  all: "All",
  scout: "Scout",
  watchlist: "Watchlist",
  incubation: "Incubation",
  roster: "Roster",
  alumni: "Alumni",
  revisit: "Revisit",
  declined: "Declined",
};

export default async function CreatorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await requireCrew();
  if (!CREATOR_ROLES.includes(me.role)) redirect("/today");
  const sp = await searchParams;
  const segRaw = one(sp.seg) ?? "all";
  const seg: Segment = (SEGMENTS as readonly string[]).includes(segRaw) ? (segRaw as Segment) : "all";
  const q = one(sp.q);
  const sel = one(sp.sel);
  const scoreMode = one(sp.mode) === "score" && canScoreFilter(me.role).ok;
  const showFollowers = one(sp.followers) === "1";
  const cfg = await getConfig();
  const today = todayISO();
  const canTier = can(me.role, "tier");
  const canCreate = canCreateCreator(me.role).ok;

  const [{ rows, counts }, metrics, summary, sheet, handles, referrers] = await Promise.all([
    listCreators({ seg, q, role: me.role, today, cfg }),
    seg === "all" && !scoreMode ? retentionMetrics(today) : Promise.resolve(null),
    sel ? creatorSummary(sel, cfg, me.role, today) : Promise.resolve(null),
    scoreMode ? scoreSheet(seg, q) : Promise.resolve(null),
    canCreate ? existingHandles() : Promise.resolve([]),
    canCreate ? referralOptions() : Promise.resolve([]),
  ]);

  const toggle = (key: string, value: string | null) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== key && k !== "sel" && k !== "new") p.set(k, v);
    if (value) p.set(key, value);
    const qs = p.toString();
    return qs ? `/creators?${qs}` : "/creators";
  };

  const table = rows.length ? (
    <KeyRows>
      <Table aria-label="Creators">
        <THead>
          <TH>Name</TH>
          {seg === "all" ? <TH>Stage</TH> : null}
          <TH>Sub-category</TH>
          <TH align="right">Filter</TH>
          {canTier ? <TH>Tier</TH> : null}
          <TH>Next check-in</TH>
          <TH align="right">Open deals</TH>
          <TH align="right">Adherence</TH>
          {showFollowers ? <TH align="right">Followers</TH> : null}
        </THead>
        <tbody>
          {rows.map((r) => (
            <TR key={r.id} href={selHref("/creators", sp, r.id)} selected={r.id === sel}>
              <TD>
                <Link href={`/creators/${r.id}`} className="hover:underline underline-offset-2 font-semibold">
                  {r.name}
                </Link>
                {r.handle ? <span className="t-caption ml-2">@{r.handle}</span> : null}
                {r.rosterProposed ? <span className="t-caption ml-2">· roster proposed</span> : null}
              </TD>
              {seg === "all" ? <TD className="text-fg-2">{STAGE_LABEL[r.stage]}</TD> : null}
              <TD className="text-fg-2">{SUB_CATEGORY_LABEL[r.subCategory]}</TD>
              <TD align="right" title={r.filter?.sentence}>
                {r.filter ? `${r.filter.total}/15` : <span className="text-fg-3">—</span>}
              </TD>
              {canTier ? <TD>{r.tier ?? <span className="text-fg-3">—</span>}</TD> : null}
              <TD>{r.nextCheckin ? r.nextCheckin.dueOn < today ? <Alert>Overdue</Alert> : date(r.nextCheckin.dueOn, "d MMM") : <span className="text-fg-3">—</span>}</TD>
              <TD align="right">{r.openDeals || <span className="text-fg-3">0</span>}</TD>
              <TD align="right">{pct(r.adherence)}</TD>
              {showFollowers ? (
                <TD align="right">
                  <Meta>{int(r.followers)}</Meta>
                </TD>
              ) : null}
            </TR>
          ))}
        </tbody>
      </Table>
    </KeyRows>
  ) : (
    <EmptyState>{q ? "No creators match." : `No ${seg === "all" ? "creators" : SEG_LABEL[seg]} yet.`}</EmptyState>
  );

  return (
    <>
      <ScreenHeader title="Creators" action={canCreate ? <NewCreator open={one(sp.new) === "1"} referrers={referrers} /> : undefined} />
      <WithInspector
        closeHref={selHref("/creators", sp, null)}
        inspector={summary && !scoreMode ? <CreatorSummaryBlock data={summary} role={me.role} today={today} showOpen /> : undefined}
        main={
          <>
            <div className="px-5 py-3 flex flex-wrap items-center gap-3 border-b border-rule">
              <SegmentedControl options={SEGMENTS.map((k) => ({ value: k, label: SEG_LABEL[k], count: counts[k] }))} value={seg} param="seg" />
              <SearchField placeholder="Search · sub: tier: src: lang: stage:" tokens={["sub:", "tier:", "src:", "lang:", "stage:"]} />
              <div className="flex items-center gap-2 lg:ml-auto">
                {!scoreMode ? (
                  <ButtonLink href={toggle("followers", showFollowers ? null : "1")} size="sm" variant="quiet" aria-pressed={showFollowers}>
                    {showFollowers ? "Hide followers" : "Followers"}
                  </ButtonLink>
                ) : null}
                {canScoreFilter(me.role).ok ? (
                  <ButtonLink href={toggle("mode", scoreMode ? null : "score")} size="sm">
                    {scoreMode ? "List" : "Score"}
                  </ButtonLink>
                ) : null}
                {canCreate ? <ImportCsv handles={handles} /> : null}
              </div>
            </div>
            {metrics ? <RetentionStrip m={metrics} /> : null}
            {scoreMode && sheet ? <ScoreSheet rows={sheet} threshold={cfg.filter.watchlist} /> : table}
          </>
        }
      />
    </>
  );
}
