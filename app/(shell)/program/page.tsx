import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { requireCrew } from "@/lib/session";
import { ScreenHeader, EmptyState, WithInspector, Caption, ButtonLink, Kvs, Kv, cx } from "@/components/ui";
import { SegmentedControl, ActionButton } from "@/components/ui/client";
import { FormSheet } from "@/components/program/FormSheet";
import { CohortFields, ChallengeFields, PROGRAMME_LABEL } from "@/components/program/fields";
import { EntriesTable, ScoreMode, BrandView, EntryInspector, AddEntrant, SundaysTab, ShootInspector, InternsTab, IncubatingTab, ReportTab } from "@/components/program/tabs";
import {
  listCohorts,
  listChallenges,
  getChallengeBoard,
  cohortCreators,
  listShoots,
  listInterns,
  listIncubating,
  crewUsers,
  brandOptions,
  challengeTemplate,
  getProgramReport,
} from "@/lib/queries/program";
import { saveCohort, saveChallenge, moveChallenge, routeOutcomes } from "@/lib/actions/program";
import { programCan, canMoveChallenge, canRouteOutcomes, type ChallengeStatus } from "@/lib/rules/program";
import { getConfig } from "@/lib/settings";
import { stageEffects } from "@/lib/rules/creators";
import { date, dateTime, TZ } from "@/lib/format";
import { today as todayISO, addDays } from "@/lib/dates";

export const metadata = { title: "Program" };
export const dynamic = "force-dynamic";

const TABS = ["entries", "sundays", "interns", "incubating", "report"] as const;
const NEXT: Record<ChallengeStatus, { to: ChallengeStatus; label: string } | null> = {
  draft: { to: "open", label: "Open" },
  open: { to: "judging", label: "Move to judging" },
  judging: { to: "closed", label: "Close" },
  closed: null,
};

function nextSunday(t: string) {
  const d = new Date(`${t}T00:00:00Z`).getUTCDay();
  return addDays(t, d === 0 ? 7 : 7 - d);
}

export default async function ProgramPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireCrew("program");
  const sp = await searchParams;
  const role = me.role;
  const may = (a: Parameters<typeof programCan>[1]) => programCan(role, a).ok;
  const cfg = await getConfig();
  const cohorts = await listCohorts();
  const cohort = cohorts.find((c) => c.id === sp.cohort) ?? cohorts[0] ?? null;
  const today = todayISO();

  if (!cohort) {
    return (
      <>
        <ScreenHeader
          title="Program"
          action={
            may("cohort") ? (
              <FormSheet label="New cohort" title="Cohort" action={saveCohort} variant="primary" dataNew submitLabel="Create">
                <CohortFields showCost={may("cost")} />
              </FormSheet>
            ) : undefined
          }
        />
        <EmptyState>No cohorts yet.</EmptyState>
      </>
    );
  }

  const challenges = await listChallenges(cohort.id);
  const chRow = challenges.find((c) => c.c.id === sp.challenge) ?? challenges.find((c) => c.c.status === "open" || c.c.status === "judging") ?? challenges[0] ?? null;
  const tab = (TABS as readonly string[]).includes(sp.tab ?? "") ? (sp.tab as (typeof TABS)[number]) : "entries";
  const mode = sp.mode === "score" ? "score" : sp.mode === "brand" && may("commission") ? "brand" : "list";
  const board = chRow ? await getChallengeBoard(chRow.c.id, role) : null;
  const [members, users, brands, template] = await Promise.all([cohortCreators(cohort.id), crewUsers(), brandOptions(), challengeTemplate()]);

  const base = "/program";
  const keep = { cohort: cohort.id, challenge: chRow?.c.id, tab: sp.tab, mode: sp.mode };
  const q = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...keep, ...over })) if (v) p.set(k, v);
    return `${base}?${p.toString()}`;
  };
  const now = new Date();
  const defaultOpensAt = formatInTimeZone(new Date(now.getTime() + 3600_000), TZ, "yyyy-MM-dd'T'HH:00");
  const toLocal = (d: Date) => formatInTimeZone(d, TZ, "yyyy-MM-dd'T'HH:mm");

  const hoursLeft = tab === "entries" && board && board.challenge.status === "open" ? Math.max(0, Math.ceil((board.challenge.closesAt.getTime() - now.getTime()) / 3600_000)) : null;

  // Tab bodies
  let main: React.ReactNode = null;
  let inspector: React.ReactNode = null;
  if (tab === "entries") {
    if (!board) main = <EmptyState>No challenges in this cohort yet.</EmptyState>;
    else {
      const c = board.challenge;
      const entriesFacts = board.entries.map((e) => ({ submitted: !!e.submittedAt, scored: e.total != null, outcome: e.outcome }));
      const next = NEXT[c.status as ChallengeStatus];
      const moveGate = next ? canMoveChallenge({ ...c, status: c.status as ChallengeStatus }, next.to, { now: new Date(), entries: entriesFacts }) : null;
      const routeGate = canRouteOutcomes(c, entriesFacts);
      const routed = board.entries.some((e) => e.outcome);
      const firstLook = (stageEffects(cfg, "incubation", today) as { firstLookUntil: string }).firstLookUntil;
      const projected = { tier0: 0, revisit: 0, pass: 0 };
      for (const e of board.entries) projected[e.submittedAt ? (e.projected ?? "pass") : "pass"]++;
      main = (
        <>
          <div className="px-5 py-4 border-b border-rule">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="t-headline">{c.title}</div>
                <div className="t-caption mt-1">
                  {c.status === "open" ? "Open" : c.status === "draft" ? "Draft" : c.status === "judging" ? "Judging" : "Closed"} · {board.brandName ? `${board.brandShown} · ` : ""}{dateTime(c.opensAt)} → {dateTime(c.closesAt)} · top {c.topN}
                  {c.capacityNote ? ` · ${c.capacityNote}` : ""}
                </div>
                {board.judges.length ? <div className="t-caption">Judges: {board.judges.map((j) => j.name).join(", ")}</div> : null}
              </div>
              <div className="flex flex-wrap items-start gap-2 no-print">
                <ButtonLink href={q({ mode: undefined, sel: undefined })} size="sm" variant={mode === "list" ? "plain" : "quiet"}>
                  Entries
                </ButtonLink>
                <ButtonLink href={q({ mode: "score", sel: undefined })} size="sm" variant={mode === "score" ? "plain" : "quiet"}>
                  Score
                </ButtonLink>
                {may("commission") ? (
                  <ButtonLink href={q({ mode: "brand", sel: undefined })} size="sm" variant={mode === "brand" ? "plain" : "quiet"}>
                    Brand view
                  </ButtonLink>
                ) : null}
                {may("entry") ? <AddEntrant board={board} existing={members} /> : null}
                {may("challenge") && (c.status === "draft" || c.status === "open") ? (
                  <FormSheet label="Edit" title="Challenge" action={saveChallenge} size="sm" variant="quiet" width={680}>
                    <ChallengeFields
                      cohortId={cohort.id}
                      challenge={{ ...c, opensAtLocal: toLocal(c.opensAt) }}
                      brands={brands}
                      judges={users}
                      template={template}
                      defaultOpensAt={defaultOpensAt}
                      topN={cfg.filter.challengeTopN}
                    />
                  </FormSheet>
                ) : null}
                {may("route") && c.status === "judging" && !routed ? (
                  routeGate.ok ? (
                    <FormSheet
                      label="Route outcomes"
                      title="Route outcomes"
                      action={routeOutcomes}
                      size="sm"
                      submitLabel="Route"
                      consequence={`Moves ${projected.tier0} to Tier 0 and ${projected.revisit} to Revisit; ${projected.pass} get a kind pass. This can't be undone.`}
                    >
                      <input type="hidden" name="challengeId" value={c.id} />
                      <Kvs>
                        <Kv k="Tier 0" v={`${projected.tier0} · first look until ${date(firstLook)}`} />
                        <Kv k="Revisit" v={projected.revisit} />
                        <Kv k="Pass" v={projected.pass} />
                      </Kvs>
                    </FormSheet>
                  ) : (
                    <Caption tone="alert">{routeGate.reasons[0]}</Caption>
                  )
                ) : null}
                {may("challenge") && next && (moveGate?.ok || c.status !== "judging") ? (
                  moveGate?.ok ? (
                    <ActionButton action={moveChallenge} fields={{ id: c.id, to: next.to }} variant="plain">
                      {next.label}
                    </ActionButton>
                  ) : (
                    <span className="t-caption self-center">{moveGate?.reasons[0]}</span>
                  )
                ) : null}
              </div>
            </div>
          </div>
          {mode === "score" ? (
            <ScoreMode board={board} canEdit={may("score") && c.status === "judging"} />
          ) : mode === "brand" ? (
            <BrandView board={board} canCommission={may("commission")} />
          ) : (
            <EntriesTable board={board} base={base} sp={{ ...keep, sel: sp.sel }} selected={sp.sel} />
          )}
        </>
      );
      const sel = mode === "list" ? board.entries.find((e) => e.id === sp.sel) : undefined;
      if (sel) inspector = <EntryInspector e={sel} board={board} canEdit={may("entry")} />;
    }
  } else if (tab === "sundays") {
    const shoots = await listShoots(cohort.id);
    main = <SundaysTab shoots={shoots} base={base} sp={{ ...keep, sel: sp.sel }} selected={sp.sel} cohortId={cohort.id} creators={members} leads={users} canEdit={may("shoot")} defaultDate={nextSunday(today)} today={today} />;
    const sel = shoots.find((s) => s.id === sp.sel);
    if (sel) inspector = <ShootInspector shoot={sel} cohortId={cohort.id} creators={members} leads={users} canEdit={may("shoot")} today={today} />;
  } else if (tab === "interns") {
    main = <InternsTab interns={await listInterns(cohort.id)} cohortId={cohort.id} canEdit={may("intern")} />;
  } else if (tab === "incubating") {
    main = <IncubatingTab rows={await listIncubating(cohort.id)} today={today} />;
  } else if (tab === "report") {
    if (!may("cost")) main = <EmptyState>The Program report is for the Owner and Crew lead.</EmptyState>;
    else {
      const r = await getProgramReport(cohort.id);
      main = r ? <ReportTab md={r.md} cohortId={cohort.id} /> : null;
    }
  }

  const tabOptions = [
    { value: "entries", label: "Entries" },
    { value: "sundays", label: "Sundays" },
    { value: "interns", label: "Interns" },
    { value: "incubating", label: "Incubating" },
    ...(may("cost") ? [{ value: "report", label: "Report" }] : []),
  ];

  return (
    <>
      <ScreenHeader
        title="Program"
        number={hoursLeft != null ? `${hoursLeft}h` : undefined}
        numberCaption={hoursLeft != null ? "left to submit" : undefined}
        action={
          may("challenge") ? (
            <FormSheet label="Open challenge" title="48-hour challenge" action={saveChallenge} variant="primary" dataNew submitLabel="Draft challenge" width={680} defaultOpen={sp.new === "1"}>
              <ChallengeFields cohortId={cohort.id} brands={brands} judges={users} template={template} defaultOpensAt={defaultOpensAt} topN={cfg.filter.challengeTopN} />
            </FormSheet>
          ) : undefined
        }
      />
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <nav aria-label="Cohorts" className="lg:w-[240px] shrink-0 border-b lg:border-b-0 lg:border-r border-rule">
          <div className="flex items-center justify-between px-5 h-10">
            <span className="t-label">Cohorts</span>
            {may("cohort") ? (
              <FormSheet label="New" title="Cohort" action={saveCohort} size="sm" variant="quiet" submitLabel="Create">
                <CohortFields showCost={may("cost")} />
              </FormSheet>
            ) : null}
          </div>
          <ul className="flex lg:block overflow-x-auto">
            {cohorts.map((c) => {
              const active = c.id === cohort.id;
              return (
                <li key={c.id} className="shrink-0 min-w-[200px] lg:min-w-0">
                  <Link href={`${base}?cohort=${c.id}`} className={cx("block px-5 py-2.5 border-b border-rule", active ? "bg-raised" : "hover:bg-raised")} aria-current={active ? "true" : undefined}>
                    <span className={cx("block truncate", active && "font-semibold")}>{c.batchLabel}</span>
                    <span className="t-caption block truncate">
                      {PROGRAMME_LABEL[c.programme]} · {date(c.startsOn, "d MMM")}–{date(c.endsOn, "d MMM")}
                    </span>
                    <span className="t-caption block truncate">{c.counterpartName ?? "No counterpart"}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex-1 min-w-0 flex flex-col">
          <WithInspector
            closeHref={q({ sel: undefined })}
            inspector={inspector}
            main={
              <>
                <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3 flex-wrap border-b border-rule">
                  <div className="flex items-center gap-3 min-w-0 flex-wrap">
                    <span className="t-headline truncate">{cohort.batchLabel}</span>
                    {may("cohort") ? (
                      <FormSheet label="Edit cohort" title="Cohort" action={saveCohort} size="sm" variant="quiet">
                        <CohortFields cohort={cohort} showCost={may("cost")} />
                      </FormSheet>
                    ) : null}
                  </div>
                  <SegmentedControl param="tab" value={tab} options={tabOptions} size="sm" />
                </div>
                {tab === "entries" && challenges.length > 1 ? (
                  <div className="px-5 pt-3">
                    <SegmentedControl param="challenge" value={chRow?.c.id ?? ""} size="sm" options={challenges.map((c) => ({ value: c.c.id, label: c.c.title.length > 32 ? `${c.c.title.slice(0, 30)}…` : c.c.title }))} />
                  </div>
                ) : null}
                {main}
              </>
            }
          />
        </div>
      </div>
    </>
  );
}
