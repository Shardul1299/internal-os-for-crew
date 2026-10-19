// Program tab bodies (§10): Entries · Sundays · Interns · Incubating · Report. Server components.
import Link from "next/link";
import { Field, Textarea, Table, THead, TH, TR, TD, EmptyState, Section, Kv, Kvs, Caption, Markdown, ButtonLink, Alert, InspectorTitle, Label } from "@/components/ui";
import { ActionButton, KeyRows } from "@/components/ui/client";
import { FormSheet } from "./FormSheet";
import { ScoreSheet } from "./ScoreSheet";
import { SubmitFields, ShootFields, InternFields, ConvertFields, EntrantFields, PLATFORM_LABEL } from "./fields";
import { addEntrant, submitEntry, saveScores, brandCommission, saveShoot, setAttendance, saveIntern, convertIntern } from "@/lib/actions/program";
import type { BoardEntry, getChallengeBoard, listShoots, listInterns, listIncubating, cohortCreators, crewUsers } from "@/lib/queries/program";
import { brandShortlist, canCommissionEntry, canSubmit, canEnter, noteWordCount } from "@/lib/rules/program";
import { date, dateTime, SUB_CATEGORY_LABEL, STAGE_LABEL, label } from "@/lib/format";
import { selHref } from "@/components/ui";

const OUTCOME_LABEL: Record<string, string> = { tier0: "Tier 0", revisit: "Revisit", pass: "Pass", brand_commission: "Commissioned" };

type Board = NonNullable<Awaited<ReturnType<typeof getChallengeBoard>>>;

export function EntriesTable({ board, base, sp, selected }: { board: Board; base: string; sp: Record<string, string | undefined>; selected?: string }) {
  const { entries, challenge } = board;
  if (!entries.length) return <EmptyState>No entrants yet.</EmptyState>;
  const routed = entries.some((e) => e.outcome);
  return (
    <KeyRows>
      <Table>
        <THead>
          <TH align="right">Rank</TH>
          <TH>Entrant</TH>
          <TH>Declared</TH>
          <TH>Submitted</TH>
          <TH align="right">Filter</TH>
          <TH>{routed ? "Outcome" : "Projected"}</TH>
        </THead>
        <tbody>
          {entries.map((e) => {
            const href = selHref(base, sp, e.id);
            return (
              <TR key={e.id} href={href} selected={selected === e.id}>
                <TD align="right" className="w-14">{e.rank ?? "—"}</TD>
                <TD href={href}>{e.name}</TD>
                <TD className="text-fg-2">
                  {label(SUB_CATEGORY_LABEL, e.declaredSubCategory)} · {label(PLATFORM_LABEL, e.declaredPlatform)}
                </TD>
                <TD className="text-fg-2">{e.submittedAt ? dateTime(e.submittedAt) : challenge.status === "open" ? "Waiting" : <span className="text-fg-3">None</span>}</TD>
                <TD align="right" className={e.rank != null && e.rank <= challenge.topN ? "font-semibold" : undefined}>
                  {e.total ?? "—"}
                </TD>
                <TD className={routed ? undefined : "text-fg-3"}>{e.outcome ? OUTCOME_LABEL[e.outcome] : e.projected ? OUTCOME_LABEL[e.projected] : "—"}</TD>
              </TR>
            );
          })}
        </tbody>
      </Table>
    </KeyRows>
  );
}

export function ScoreMode({ board, canEdit }: { board: Board; canEdit: boolean }) {
  return (
    <ScoreSheet
      challengeId={board.challenge.id}
      topN={board.challenge.topN}
      filter={board.cfg.filter}
      canEdit={canEdit}
      action={saveScores}
      entries={board.entries.map((e) => ({
        id: e.id,
        name: e.name,
        submissionUrl: e.submissionUrl,
        submitted: !!e.submittedAt,
        aesthetics: e.aesthetics,
        taste: e.taste,
        personality: e.personality,
        sentence: e.sentence,
      }))}
    />
  );
}

/** Brand view: the top ten the brand sees, with the one-entry commission. */
export function BrandView({ board, canCommission }: { board: Board; canCommission: boolean }) {
  const top = brandShortlist(board.entries);
  if (!top.length) return <EmptyState>Score entries to build the brand&apos;s top ten.</EmptyState>;
  const all = board.entries.map((e) => ({ rank: e.rank, outcome: e.outcome }));
  const commissioned = all.some((e) => e.outcome === "brand_commission");
  return (
    <Section title={`Top ten for ${board.brandName ?? "the brand"}`} flush>
      <Table>
        <THead>
          <TH align="right">Rank</TH>
          <TH>Entrant</TH>
          <TH>Submission</TH>
          <TH>Outcome</TH>
          <TH align="right"> </TH>
        </THead>
        <tbody>
          {top.map((e) => {
            const g = canCommissionEntry(e, all, board.challenge);
            return (
              <TR key={e.id}>
                <TD align="right" className="w-14">{e.rank}</TD>
                <TD>{e.name}</TD>
                <TD>
                  {e.submissionUrl ? (
                    <a href={e.submissionUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                      Open
                    </a>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD>
                  {e.outcome ? OUTCOME_LABEL[e.outcome] : "—"}
                  {e.dealId ? (
                    <Link href={`/deals/${e.dealId}`} className="ml-2 underline underline-offset-2">
                      Deal
                    </Link>
                  ) : null}
                </TD>
                <TD align="right">
                  {canCommission && g.ok ? (
                    <FormSheet label="Commission" title="Brand commission" size="sm" action={brandCommission} submitLabel="Create lead" consequence="Creates a paid lead at the T0 rung through Crew. One per challenge.">
                      <input type="hidden" name="entryId" value={e.id} />
                      <Kvs>
                        <Kv k="Entrant" v={e.name} />
                        <Kv k="Brand" v={board.brandName} />
                      </Kvs>
                      <Field label="Note" className="mt-3">
                        <Textarea name="note" rows={3} />
                      </Field>
                    </FormSheet>
                  ) : commissioned || !canCommission ? null : (
                    <span className="t-caption">{g.reasons[0]}</span>
                  )}
                </TD>
              </TR>
            );
          })}
        </tbody>
      </Table>
    </Section>
  );
}

export function EntryInspector({ e, board, canEdit }: { e: BoardEntry; board: Board; canEdit: boolean }) {
  const submitGate = canSubmit(e, board.challenge, new Date(), "");
  return (
    <div>
      <InspectorTitle sub={`${label(STAGE_LABEL, e.stage)} · consent ${e.consentStatus.replace("_", " ")}`}>
        <Link href={`/creators/${e.creatorId}`} className="hover:underline underline-offset-2">
          {e.name}
        </Link>
      </InspectorTitle>
      <Kvs>
        <Kv k="Declared" v={`${label(SUB_CATEGORY_LABEL, e.declaredSubCategory)} · ${label(PLATFORM_LABEL, e.declaredPlatform)}`} />
        <Kv
          k="Submission"
          v={
            e.submissionUrl ? (
              <a href={e.submissionUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 break-all">
                {e.submissionUrl.replace(/^https?:\/\//, "")}
              </a>
            ) : null
          }
        />
        <Kv k="Submitted" v={e.submittedAt ? dateTime(e.submittedAt) : null} />
        <Kv k="Filter" v={e.total != null ? `${e.total}/15 · ${e.aesthetics}/${e.taste}/${e.personality}` : null} />
        <Kv k="Rank" v={e.rank} />
        <Kv k="Outcome" v={e.outcome ? OUTCOME_LABEL[e.outcome] : null} />
        {e.firstLookUntil ? <Kv k="First look" v={date(e.firstLookUntil)} /> : null}
        {e.revisitOn ? <Kv k="Revisit" v={date(e.revisitOn)} /> : null}
        {e.dealId ? <Kv k="Deal" v={<Link href={`/deals/${e.dealId}`} className="underline underline-offset-2">Open lead</Link>} /> : null}
      </Kvs>
      {e.sentence ? <p className="mt-3 text-fg-2">“{e.sentence}”</p> : null}
      {e.noteMd ? (
        <div className="mt-3">
          <Label>Note · {noteWordCount(e.noteMd)} words</Label>
          <Markdown source={e.noteMd} />
        </div>
      ) : null}
      {e.outcomeNote ? <Caption className="mt-3">{e.outcomeNote}</Caption> : null}
      {!e.submittedAt && canEdit ? (
        <div className="mt-4">
          {submitGate.ok ? (
            <FormSheet label="Record submission" title="Submission" action={submitEntry} variant="plain" size="sm" submitLabel="Record">
              <SubmitFields entryId={e.id} />
            </FormSheet>
          ) : (
            <Caption tone="alert">{submitGate.reasons[0]}</Caption>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function AddEntrant({ board, existing }: { board: Board; existing: { id: string; name: string }[] }) {
  const g = canEnter({ consentStatus: "opted_in", challengeStatus: board.challenge.status });
  if (!g.ok) return null;
  const inChallenge = new Set(board.entries.map((e) => e.creatorId));
  return (
    <FormSheet label="Add entrant" title="Add entrant" action={addEntrant} size="sm" submitLabel="Add">
      <EntrantFields challengeId={board.challenge.id} existing={existing.filter((c) => !inChallenge.has(c.id))} />
    </FormSheet>
  );
}

// ---------- Sundays ----------

type Shoot = Awaited<ReturnType<typeof listShoots>>[number];

export function SundaysTab({
  shoots,
  base,
  sp,
  selected,
  cohortId,
  creators,
  leads,
  canEdit,
  defaultDate,
  today,
}: {
  shoots: Shoot[];
  base: string;
  sp: Record<string, string | undefined>;
  selected?: string;
  cohortId: string;
  creators: Awaited<ReturnType<typeof cohortCreators>>;
  leads: Awaited<ReturnType<typeof crewUsers>>;
  canEdit: boolean;
  defaultDate: string;
  today: string;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-3 gap-4">
        <Caption>Each shoot adds a calendar item for every attendee.</Caption>
        {canEdit ? (
          <FormSheet label="Schedule shoot" title="Sunday shoot" action={saveShoot} size="sm" submitLabel="Schedule">
            <ShootFields cohortId={cohortId} creators={creators} leads={leads} defaultDate={defaultDate} />
          </FormSheet>
        ) : null}
      </div>
      {shoots.length === 0 ? (
        <EmptyState>No Sunday shoots yet.</EmptyState>
      ) : (
        <KeyRows>
          <Table>
            <THead>
              <TH>Date</TH>
              <TH>Location</TH>
              <TH>Crew lead</TH>
              <TH align="right">Creators</TH>
              <TH align="right">Attended</TH>
            </THead>
            <tbody>
              {shoots.map((sh) => {
                const href = selHref(base, sp, sh.id);
                return (
                  <TR key={sh.id} href={href} selected={selected === sh.id}>
                    <TD href={href}>{date(sh.date, "EEE d MMM")}</TD>
                    <TD>{sh.location}</TD>
                    <TD className="text-fg-2">{sh.leadName}</TD>
                    <TD align="right">{sh.creators.length}</TD>
                    <TD align="right">{sh.date <= today ? sh.attended.length : <span className="text-fg-3">—</span>}</TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        </KeyRows>
      )}
    </>
  );
}

export function ShootInspector({
  shoot,
  cohortId,
  creators,
  leads,
  canEdit,
  today,
}: {
  shoot: Shoot;
  cohortId: string;
  creators: Awaited<ReturnType<typeof cohortCreators>>;
  leads: Awaited<ReturnType<typeof crewUsers>>;
  canEdit: boolean;
  today: string;
}) {
  const past = shoot.date <= today;
  const all = [...creators];
  for (const c of shoot.creatorNames) if (!all.some((x) => x.id === c.id)) all.push({ id: c.id, name: c.name, stage: "" });
  return (
    <div>
      <InspectorTitle sub={shoot.location}>{date(shoot.date, "EEE d MMM")}</InspectorTitle>
      <Kvs>
        <Kv k="Crew lead" v={shoot.leadName} />
        <Kv k="Attendance" v={past ? `${shoot.attended.length} of ${shoot.creators.length}` : "After the shoot"} />
      </Kvs>
      {shoot.notesMd ? <Markdown source={shoot.notesMd} className="mt-3" /> : null}
      <Section title="Attendees" className="px-0">
        <ul>
          {shoot.creatorNames.map((c) => (
            <li key={c.id} className="flex items-center justify-between h-9 border-b border-rule">
              <Link href={`/creators/${c.id}`} className="truncate hover:underline underline-offset-2">
                {c.name}
              </Link>
              {past && canEdit ? (
                <ActionButton action={setAttendance} fields={{ shootId: shoot.id, creatorId: c.id, attended: c.attended ? "0" : "1" }} variant={c.attended ? "plain" : "quiet"}>
                  {c.attended ? "Attended" : "Mark attended"}
                </ActionButton>
              ) : (
                <span className="t-caption">{past ? (c.attended ? "Attended" : "Absent") : "Invited"}</span>
              )}
            </li>
          ))}
        </ul>
      </Section>
      {canEdit ? (
        <FormSheet label="Edit shoot" title="Sunday shoot" action={saveShoot} size="sm">
          <ShootFields cohortId={cohortId} shoot={shoot} creators={all} leads={leads} defaultDate={shoot.date} />
        </FormSheet>
      ) : null}
    </div>
  );
}

// ---------- Interns ----------

export function InternsTab({ interns, cohortId, canEdit }: { interns: Awaited<ReturnType<typeof listInterns>>; cohortId: string; canEdit: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-3 gap-4">
        <Caption>Two per cohort: research and deal desk.</Caption>
        {canEdit && interns.length < 2 ? (
          <FormSheet label="Add intern" title="Intern" action={saveIntern} size="sm" submitLabel="Add">
            <InternFields cohortId={cohortId} />
          </FormSheet>
        ) : null}
      </div>
      {interns.length === 0 ? (
        <EmptyState>No interns for this cohort.</EmptyState>
      ) : (
        <Table>
          <THead>
            <TH>Function</TH>
            <TH>Name</TH>
            <TH>Email</TH>
            <TH>Dates</TH>
            <TH>Creator</TH>
            <TH align="right"> </TH>
          </THead>
          <tbody>
            {interns.map(({ i, creator }) => (
              <TR key={i.id}>
                <TD>{i.function === "research" ? "Research" : "Deal desk"}</TD>
                <TD>{i.personName}</TD>
                <TD className="text-fg-2">{i.email ?? "—"}</TD>
                <TD className="text-fg-2">
                  {date(i.startsOn)} – {date(i.endsOn)}
                </TD>
                <TD>
                  {i.convertedToCreatorId ? (
                    <Link href={`/creators/${i.convertedToCreatorId}`} className="underline underline-offset-2">
                      {creator}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD align="right">
                  {canEdit ? (
                    <span className="inline-flex gap-1">
                      <FormSheet label="Edit" title="Intern" action={saveIntern} size="sm" variant="quiet">
                        <InternFields cohortId={cohortId} intern={i} />
                      </FormSheet>
                      {!i.convertedToCreatorId ? (
                        <FormSheet label="Convert" title="Convert to creator" action={convertIntern} size="sm" submitLabel="Convert" consequence="Creates a scout creator from this intern.">
                          <ConvertFields internId={i.id} />
                        </FormSheet>
                      ) : null}
                    </span>
                  ) : null}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

// ---------- Incubating ----------

export function IncubatingTab({ rows, today }: { rows: Awaited<ReturnType<typeof listIncubating>>; today: string }) {
  if (!rows.length) return <EmptyState>Nobody from this cohort is incubating yet.</EmptyState>;
  return (
    <KeyRows>
      <Table>
        <THead>
          <TH>Creator</TH>
          <TH>Sub-category</TH>
          <TH>First look until</TH>
          <TH align="right">Sundays</TH>
        </THead>
        <tbody>
          {rows.map((c) => (
            <TR key={c.id} href={`/creators/${c.id}`}>
              <TD href={`/creators/${c.id}`}>{c.displayName}</TD>
              <TD className="text-fg-2">{label(SUB_CATEGORY_LABEL, c.subCategory)}</TD>
              <TD>{c.firstLookUntil ? c.firstLookUntil < today ? <Alert>{date(c.firstLookUntil)}</Alert> : date(c.firstLookUntil) : "—"}</TD>
              <TD align="right">
                {c.cadence.attended} of {c.cadence.invited}
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </KeyRows>
  );
}

// ---------- Report ----------

export function ReportTab({ md, cohortId }: { md: string; cohortId: string }) {
  return (
    <div className="px-5 py-4">
      <div className="flex gap-2 mb-4 no-print">
        <ButtonLink href={`/program/report?cohort=${cohortId}`} size="sm">
          Printable
        </ButtonLink>
        <ButtonLink href={`/api/export/program-report?cohort=${cohortId}`} size="sm" variant="quiet" prefetch={false}>
          Download .md
        </ButtonLink>
      </div>
      <Markdown source={md} />
    </div>
  );
}
