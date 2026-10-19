// Check-ins (§9): scheduled list, Hold check-in (template prefilled, Studio "what shipped"),
// outcomes (Filter re-score, tier recommendation, roadmap, introductions), held history, roadmap CRUD.
import Link from "next/link";
import { Section, Table, THead, TH, TR, TD, Caption, Field, Input, Select, Textarea, Toggle, Alert, Markdown, ButtonLink } from "@/components/ui";
import { ActionButton, ActionForm, SubmitButton, MarkdownEditor } from "@/components/ui/client";
import { SheetForm } from "../SheetForm";
import { scheduleCheckin, rescheduleCheckin, holdCheckin, cancelCheckin, addRoadmapItem, updateRoadmapItem, removeRoadmapItem } from "@/lib/actions/checkins";
import { canRunCheckins } from "@/lib/rules/creator-flow";
import { can } from "@/lib/rules/visibility";
import { date, humanize } from "@/lib/format";
import { CHECKIN_LABEL, AREA_LABEL, ROADMAP_STATUS } from "../labels";
import type { CreatorSummary, creatorCheckins, creatorAgreement } from "@/lib/queries/creators";

type Data = Awaited<ReturnType<typeof creatorCheckins>>;
type Score = { id: string; total: number; scoredAt: Date };

const TEMPLATE_FOR: Record<string, string> = {
  quarterly: "checkin_quarterly",
  strategy_refresh: "checkin_quarterly",
  adhoc: "checkin_quarterly",
  roadmap: "checkin_roadmap",
  pilot_end: "checkin_pilot_end",
  exit_window: "checkin_exit_window",
};

export function CheckinsTab({
  summary,
  data,
  role,
  today,
  hold,
  shipped,
  scores,
  agreement,
}: {
  summary: CreatorSummary;
  data: Data;
  role: string;
  today: string;
  hold: string | null;
  shipped: { date: string; title: string; kind: string }[];
  scores: Score[];
  agreement: Awaited<ReturnType<typeof creatorAgreement>>;
}) {
  const c = summary.creator;
  const editable = canRunCheckins(role).ok;
  const pending = data.checkins.filter((k) => !k.heldOn);
  const held = data.checkins.filter((k) => k.heldOn).sort((a, b) => (a.heldOn! < b.heldOn! ? 1 : -1));
  const holding = hold ? (hold === "new" ? null : (pending.find((k) => k.id === hold) ?? null)) : undefined;
  const base = `/creators/${c.id}?tab=checkins`;
  const name = (id: string | null) => (id ? data.names.get(id) || "—" : "—");

  let form = null;
  if (editable && holding !== undefined) {
    const type = holding?.type ?? "adhoc";
    const shippedText = shipped.length ? "\n" + shipped.map((s) => `- ${date(s.date, "d MMM")} · ${s.title || s.kind}`).join("\n") : "nothing posted yet";
    const notes = (data.templates.get(TEMPLATE_FOR[type]) ?? data.templates.get("checkin_quarterly") ?? "")
      .replaceAll("{{creator}}", c.displayName)
      .replaceAll("{{shipped}}", shippedText)
      .replaceAll("{{pilot_ends_on}}", agreement?.pilotEndsOn ? date(agreement.pilotEndsOn) : "—")
      .replaceAll("{{exit_window_at}}", agreement?.exitWindowAt ? date(agreement.exitWindowAt) : "—");
    form = (
      <Section
        title={`Hold · ${CHECKIN_LABEL[type]}`}
        aside={
          <Link href={base} className="hover:text-fg">
            Close
          </Link>
        }
        className="border-b border-rule"
      >
        <ActionForm action={holdCheckin}>
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="checkinId" value={holding?.id ?? ""} />
          {holding ? (
            <input type="hidden" name="type" value={type} />
          ) : (
            <Field label="Type">
              <Select name="type" defaultValue="adhoc">
                {Object.entries(CHECKIN_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Held on">
            <Input name="heldOn" type="date" defaultValue={today} max={today} required className="max-w-[200px]" />
          </Field>
          <div className="py-2">
            <MarkdownEditor name="notesMd" defaultValue={notes} rows={18} />
          </div>
          <Field
            label="Filter re-score"
            hint={
              <Link href={`/creators/${c.id}?tab=filter#score`} className="underline underline-offset-2">
                Score now
              </Link>
            }
          >
            <Select name="filterRescoreId" defaultValue="">
              <option value="">None</option>
              {scores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.total}/15 · {date(s.scoredAt, "d MMM")}
                </option>
              ))}
            </Select>
          </Field>
          {can(role, "tier") ? (
            <Field label="Tier recommendation" hint="Signals only">
              <Select name="tierRecommendation" defaultValue="">
                <option value="">—</option>
                <option value="no_change">No change</option>
                {["T0", "T1", "T2", "T3"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Toggle name="calendarUpdated" label="Next-quarter calendar updated together" />
          {Object.entries(AREA_LABEL).map(([k, l]) => (
            <Field key={k} label={l}>
              <Input name={`goal_${k}`} placeholder="Roadmap goal" maxLength={300} />
            </Field>
          ))}
          <Field label="Introductions" hint="One per line. Best effort, no quota.">
            <Textarea name="introductions" rows={3} />
          </Field>
          <div className="mt-3 flex items-center gap-3">
            <SubmitButton>Complete check-in</SubmitButton>
            {type === "quarterly" ? <Caption>Completing a quarterly schedules the next.</Caption> : null}
          </div>
        </ActionForm>
      </Section>
    );
  }

  return (
    <>
      {form}
      <Section
        title="Scheduled"
        aside={
          editable ? (
            <span className="inline-flex gap-2">
              <ButtonLink href={`${base}&hold=new`} size="sm" variant="quiet" scroll={false}>
                Hold ad hoc
              </ButtonLink>
              <ScheduleCheckin id={c.id} today={today} />
            </span>
          ) : (
            `${pending.length}`
          )
        }
        flush
      >
        {pending.length ? (
          <Table>
            <THead>
              <TH>Due</TH>
              <TH>Type</TH>
              <TH />
            </THead>
            <tbody>
              {pending.map((k) => (
                <TR key={k.id} selected={k.id === hold}>
                  <TD className="whitespace-nowrap">{k.dueOn < today ? <Alert>Overdue · {date(k.dueOn, "d MMM yy")}</Alert> : date(k.dueOn, "d MMM yy")}</TD>
                  <TD>{CHECKIN_LABEL[k.type]}</TD>
                  <TD align="right" className="whitespace-nowrap">
                    {editable ? (
                      <span className="inline-flex gap-1 items-start">
                        <ButtonLink href={`${base}&hold=${k.id}`} size="sm" scroll={false}>
                          Hold
                        </ButtonLink>
                        <SheetForm title="Reschedule" trigger="Move" triggerVariant="quiet" action={rescheduleCheckin} submitLabel="Move" width={400}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="checkinId" value={k.id} />
                          <Field label="Due">
                            <Input name="dueOn" type="date" defaultValue={k.dueOn} required />
                          </Field>
                        </SheetForm>
                        <ActionButton action={cancelCheckin} fields={{ id: c.id, checkinId: k.id }} variant="quiet">
                          Cancel
                        </ActionButton>
                      </span>
                    ) : null}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="px-5 t-caption">{c.stage === "roster" ? "Nothing scheduled." : "Check-ins start at Roster."}</p>
        )}
      </Section>

      <Section title="Held" aside={`${held.length}`} flush>
        {held.length ? (
          <ul className="border-t border-rule">
            {held.map((k) => {
              const o = k.outcomes ?? {};
              const rescore = o.filter_rescore_id ? scores.find((s) => s.id === o.filter_rescore_id) : null;
              const bits = [
                rescore ? `Filter ${rescore.total}/15` : o.filter_rescore_id ? "Filter re-scored" : null,
                can(role, "tier") && o.tier_recommendation ? `Tier ${o.tier_recommendation === "no_change" ? "no change" : o.tier_recommendation}` : null,
                o.roadmap_items?.length ? `${o.roadmap_items.length} roadmap` : null,
                o.introductions?.length ? `${o.introductions.length} intros` : null,
                o.calendar_updated ? "calendar updated" : null,
              ].filter(Boolean);
              return (
                <li key={k.id} className="border-b border-rule">
                  <details className="group">
                    <summary className="px-5 h-9 flex items-center gap-3 cursor-pointer hover:bg-raised list-none">
                      <span className="w-24 text-fg-3 num">{date(k.heldOn, "d MMM yy")}</span>
                      <span>{CHECKIN_LABEL[k.type]}</span>
                      <span className="t-caption truncate">{bits.join(" · ")}</span>
                      <span className="ml-auto t-caption">{name(k.heldBy)}</span>
                    </summary>
                    <div className="px-5 pb-4">
                      <Markdown source={k.notesMd} />
                      {o.introductions?.length ? (
                        <>
                          <div className="t-label mt-3 mb-1">Introductions</div>
                          <ul className="list-[square] pl-5">
                            {o.introductions.map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-5 t-caption">No check-ins held yet.</p>
        )}
      </Section>

      <Section title="Roadmap" aside={editable ? <AddRoadmap id={c.id} /> : `${data.roadmap.length}`} flush>
        {data.roadmap.length ? (
          <Table>
            <THead>
              <TH>Area</TH>
              <TH>Goal</TH>
              <TH>Crew contribution</TH>
              <TH>Status</TH>
              <TH />
            </THead>
            <tbody>
              {data.roadmap.map((r) => (
                <TR key={r.id}>
                  <TD className="whitespace-nowrap text-fg-2">{AREA_LABEL[r.area]}</TD>
                  <TD>{r.goal}</TD>
                  <TD className="text-fg-2">{r.crewContribution ?? "—"}</TD>
                  <TD className={r.status === "done" || r.status === "dropped" ? "text-fg-3" : ""}>{humanize(r.status)}</TD>
                  <TD align="right" className="whitespace-nowrap">
                    {editable ? (
                      <span className="inline-flex gap-1">
                        <SheetForm title="Roadmap item" trigger="Edit" triggerVariant="quiet" action={updateRoadmapItem} width={460}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="rowId" value={r.id} />
                          <Field label="Goal">
                            <Input name="goal" defaultValue={r.goal} required maxLength={300} />
                          </Field>
                          <Field label="Crew contribution">
                            <Input name="crewContribution" defaultValue={r.crewContribution ?? ""} maxLength={300} />
                          </Field>
                          <Field label="Status">
                            <Select name="status" defaultValue={r.status}>
                              {ROADMAP_STATUS.map((s) => (
                                <option key={s} value={s}>
                                  {humanize(s)}
                                </option>
                              ))}
                            </Select>
                          </Field>
                        </SheetForm>
                        <ActionButton action={removeRoadmapItem} fields={{ id: c.id, rowId: r.id }} variant="quiet">
                          Remove
                        </ActionButton>
                      </span>
                    ) : null}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="px-5 t-caption">No roadmap items.</p>
        )}
      </Section>
    </>
  );
}

function ScheduleCheckin({ id, today }: { id: string; today: string }) {
  return (
    <SheetForm title="Schedule check-in" trigger="Schedule" action={scheduleCheckin} submitLabel="Schedule" width={420}>
      <input type="hidden" name="id" value={id} />
      <Field label="Type">
        <Select name="type" defaultValue="adhoc">
          {Object.entries(CHECKIN_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Due">
        <Input name="dueOn" type="date" defaultValue={today} required />
      </Field>
    </SheetForm>
  );
}

function AddRoadmap({ id }: { id: string }) {
  return (
    <SheetForm title="Roadmap item" trigger="Add" action={addRoadmapItem} submitLabel="Add" width={460}>
      <input type="hidden" name="id" value={id} />
      <Field label="Area">
        <Select name="area" defaultValue="platform_audience">
          {Object.entries(AREA_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Goal">
        <Input name="goal" required maxLength={300} />
      </Field>
      <Field label="Crew contribution">
        <Input name="crewContribution" maxLength={300} />
      </Field>
    </SheetForm>
  );
}
