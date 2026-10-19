import Link from "next/link";
import { ScreenHeader, Section, MonthGrid, Table, THead, TH, TR, TD, ButtonLink, Caption, Divider, Field, FormGrid, Input, Select, Textarea, EmptyState, type GridItem } from "@/components/ui";
import { SegmentedControl, KeyRows, ActionForm, ActionButton, SubmitButton } from "@/components/ui/client";
import { MixPanel } from "@/components/studio/Mix";
import { ItemForm } from "@/components/studio/ItemForm";
import { CalendarBoard } from "@/components/studio/CalendarBoard";
import { ConfirmSheet } from "@/components/studio/ConfirmSheet";
import { Generator } from "@/components/studio/Generator";
import { lbl, KIND_LABEL, STATUS_LABEL, PILLAR_LABEL, BUCKET_LABEL, FUNNEL_LABEL, DELIV_STATUS } from "@/components/studio/labels";
import { requireStudio, calendarItems, studioWindow, contentMix, blackouts, myScripts, myDeliverables, clearance, genDefaults, cadenceStep, type CalendarRow, type StudioDeliverable } from "@/lib/queries/studio";
import { addCalendarItem, bulkAddCalendar, scheduleScript, resetCalendar, addBlackout, removeBlackout, keepProposal, removeCalendarItem } from "@/lib/actions/studio-calendar";
import { date } from "@/lib/format";
import { addDays, today as todayISO } from "@/lib/dates";

export const metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

type SP = Promise<{ view?: string; month?: string; from?: string; new?: string }>;

function monthShift(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export default async function CalendarPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireStudio();
  const t = todayISO();
  const view = ["month", "board", "list", "batch"].includes(sp.view ?? "") ? sp.view! : "month";
  const win = studioWindow(ctx.cfg, sp.from);
  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : t.slice(0, 7);
  const monthFrom = `${month}-01`;
  const monthTo = addDays(`${monthShift(month, 1)}-01`, -1);
  const [windowItems, monthItems, bl, scripts, deliv] = await Promise.all([
    calendarItems(ctx, win.from, win.to),
    calendarItems(ctx, monthFrom, monthTo),
    blackouts(ctx),
    myScripts(ctx),
    myDeliverables(ctx, ctx.cfg),
  ]);
  const mix = await contentMix(ctx, ctx.cfg, ctx.profile, windowItems);
  const delivById = new Map(deliv.map((d) => [d.id, d]));
  const proposals = windowItems.filter((i) => i.proposedByUserId);
  const scriptOpts = scripts.map((s) => ({ id: s.id, title: s.title }));
  const qs = (o: Record<string, string>) => `/studio/calendar?${new URLSearchParams({ view, ...(sp.month ? { month: sp.month } : {}), ...(sp.from ? { from: sp.from } : {}), ...o }).toString()}`;

  return (
    <>
      <ScreenHeader
        title="Calendar"
        action={
          <ButtonLink href={qs({ new: "1" })} variant="primary" data-new>
            New item
          </ButtonLink>
        }
      >
        <span className="t-caption">
          {date(win.from, "d MMM")} – {date(win.to, "d MMM")} · {win.weeks} weeks · {mix.planned} planned
        </span>
      </ScreenHeader>

      <div className="px-5 pt-4 flex flex-wrap items-center gap-3 justify-between">
        <SegmentedControl
          param="view"
          value={view}
          options={[
            { value: "month", label: "Month" },
            { value: "board", label: "Board" },
            { value: "list", label: "List" },
            { value: "batch", label: "Batch" },
          ]}
        />
        <div className="flex items-center gap-2">
          {view === "month" ? (
            <>
              <ButtonLink size="sm" variant="quiet" href={qs({ month: monthShift(month, -1) })}>
                ← {date(`${monthShift(month, -1)}-01`, "MMM")}
              </ButtonLink>
              <span className="t-headline">{date(`${month}-01`, "MMMM yyyy")}</span>
              <ButtonLink size="sm" variant="quiet" href={qs({ month: monthShift(month, 1) })}>
                {date(`${monthShift(month, 1)}-01`, "MMM")} →
              </ButtonLink>
            </>
          ) : view !== "batch" ? (
            <>
              <ButtonLink size="sm" variant="quiet" href={qs({ from: addDays(win.from, -win.weeks * 7) })}>
                ← Earlier
              </ButtonLink>
              <ButtonLink size="sm" variant="quiet" href={qs({ from: addDays(win.from, win.weeks * 7) })}>
                Later →
              </ButtonLink>
            </>
          ) : null}
          <a href="/studio/calendar/export" download className="h-7 px-2.5 inline-flex items-center text-[12px] text-fg-2 hover:text-fg hover:bg-block">
            Export to Word
          </a>
        </div>
      </div>

      <Section title="Ratios" aside="Batch window">
        <MixPanel mix={mix} compact />
      </Section>

      {sp.new ? (
        <>
          <Divider />
          <Section title="New item" aside={<Link href={qs({})}>Close</Link>}>
            <ItemForm action={addCalendarItem} item={{ date: addDays(t, 1) }} scripts={scriptOpts} back={qs({})} submit="Add to calendar" />
          </Section>
        </>
      ) : null}

      {proposals.length ? (
        <>
          <Divider />
          <Section title="Proposed by Crew" aside={String(proposals.length)} flush>
            <ul className="border-t border-rule">
              {proposals.map((i) => (
                <li key={i.id} className="flex items-center gap-3 px-5 h-10 border-b border-rule">
                  <span className="w-24 t-callout text-fg-3">{date(i.date, "EEE d MMM")}</span>
                  <Link href={`/studio/calendar/${i.id}`} className="truncate flex-1 hover:underline underline-offset-2">
                    {i.title || i.topic}
                  </Link>
                  <span className="t-caption">Crew</span>
                  <ActionButton action={keepProposal} fields={{ id: i.id }}>
                    Keep
                  </ActionButton>
                  <ActionButton action={removeCalendarItem} fields={{ id: i.id }} variant="quiet">
                    Remove
                  </ActionButton>
                </li>
              ))}
            </ul>
          </Section>
        </>
      ) : null}

      <Divider />
      {view === "month" ? (
        <Section>
          <MonthGrid month={month} today={t} blackouts={bl} items={monthItems.map((i) => gridItem(i, delivById.get(i.deliverableId ?? "")))} />
        </Section>
      ) : view === "board" ? (
        <Section title="Board" aside={`${windowItems.length} items`} flush>
          <CalendarBoard
            items={windowItems
              .filter((i) => i.kind !== "blackout")
              .map((i) => {
                const d = delivById.get(i.deliverableId ?? "");
                return { id: i.id, date: i.date, dateLabel: date(i.date, "EEE d MMM"), title: i.title || i.topic || "Untitled", kind: i.kind, status: i.studioStatus, crew: !!i.proposedByUserId, clearance: d ? clearance(d) : null };
              })}
          />
        </Section>
      ) : view === "list" ? (
        <ListView items={windowItems} deliv={delivById} />
      ) : (
        <BatchView ctx={ctx} today={t} scripts={scriptOpts} blackoutRows={bl} />
      )}
    </>
  );
}

function gridItem(i: CalendarRow, d?: StudioDeliverable): GridItem {
  const c = d ? clearance(d) : null;
  return { date: i.date, label: i.title || i.topic || lbl(KIND_LABEL, i.kind), kind: i.kind, href: `/studio/calendar/${i.id}`, caption: [lbl(KIND_LABEL, i.kind), lbl(STATUS_LABEL, i.studioStatus), i.proposedByUserId ? "Crew" : "", c ?? ""].filter(Boolean).join(" · ") };
}

function ListView({ items, deliv }: { items: CalendarRow[]; deliv: Map<string, StudioDeliverable> }) {
  if (!items.length) return <EmptyState>Nothing planned in this window.</EmptyState>;
  return (
    <KeyRows>
      <Table>
        <THead>
          <TH>Date</TH>
          <TH>Title</TH>
          <TH>Kind</TH>
          <TH>Pillar</TH>
          <TH>Concept</TH>
          <TH>Funnel</TH>
          <TH>Status</TH>
          <TH>Note</TH>
        </THead>
        <tbody>
          {items.map((i) => {
            const d = deliv.get(i.deliverableId ?? "");
            const note = d ? (clearance(d) ?? `${lbl(DELIV_STATUS, d.status)}${d.revisionRound ? ` · round ${d.revisionRound}` : ""}`) : i.proposedByUserId ? "Crew" : "";
            return (
              <TR key={i.id} href={`/studio/calendar/${i.id}`}>
                <TD className="whitespace-nowrap">{date(i.date, "EEE d MMM")}</TD>
                <TD className={i.kind === "anchor" ? "font-semibold" : undefined}>
                  <Link href={`/studio/calendar/${i.id}`} className="hover:underline underline-offset-2">
                    {i.title || i.topic || "Untitled"}
                  </Link>
                </TD>
                <TD>{lbl(KIND_LABEL, i.kind)}</TD>
                <TD>{lbl(PILLAR_LABEL, i.pillar)}</TD>
                <TD>{lbl(BUCKET_LABEL, i.conceptBucket)}</TD>
                <TD>{lbl(FUNNEL_LABEL, i.funnelStage)}</TD>
                <TD>{lbl(STATUS_LABEL, i.studioStatus)}</TD>
                <TD className="t-callout text-fg-3">{note}</TD>
              </TR>
            );
          })}
        </tbody>
      </Table>
    </KeyRows>
  );
}

function BatchView({
  ctx,
  today,
  scripts,
  blackoutRows,
}: {
  ctx: Awaited<ReturnType<typeof requireStudio>>;
  today: string;
  scripts: { id: string; title: string }[];
  blackoutRows: { id: string; startsOn: string; endsOn: string; note: string | null }[];
}) {
  return (
    <>
      <Section title="Batch ideation" aside={`${ctx.cfg.n.ideation_batch_size} topics · your ratios`}>
        <div className="max-w-5xl">
          <Generator gen="calendar_ideation" brand={ctx.brand} defaults={genDefaults(ctx.cfg)} save="ideas" today={today} step={cadenceStep(ctx.profile)} />
        </div>
      </Section>
      <Divider />
      <div className="grid lg:grid-cols-2">
        <Section title="Bulk add">
          <ActionForm action={bulkAddCalendar} resetOnSuccess>
            <FormGrid>
              <Field label="Titles" hint="One per line">
                <Textarea name="titles" rows={5} />
              </Field>
              <Field label="Start · every">
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" name="startOn" defaultValue={addDays(today, 1)} aria-label="Start" />
                  <Input type="number" name="everyDays" min={1} max={30} defaultValue={cadenceStep(ctx.profile)} aria-label="Every N days" />
                </div>
              </Field>
              <Field label="Pillar · concept">
                <div className="grid grid-cols-2 gap-2">
                  <Select name="pillar" aria-label="Pillar">
                    <option value="authority">Authority</option>
                    <option value="journey">Journey</option>
                  </Select>
                  <Select name="conceptBucket" aria-label="Concept">
                    <option value="proven">Proven</option>
                    <option value="double_down">Double down</option>
                    <option value="experimental">Experimental</option>
                  </Select>
                </div>
              </Field>
            </FormGrid>
            <div className="mt-3">
              <SubmitButton variant="plain">Add all</SubmitButton>
            </div>
          </ActionForm>
        </Section>
        <Section title="Schedule a script">
          {scripts.length ? (
            <ActionForm action={scheduleScript}>
              <FormGrid>
                <Field label="Script">
                  <Select name="scriptId">
                    {scripts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Date">
                  <Input type="date" name="date" defaultValue={addDays(today, 1)} className="max-w-48" />
                </Field>
              </FormGrid>
              <div className="mt-3">
                <SubmitButton variant="plain">Schedule</SubmitButton>
              </div>
            </ActionForm>
          ) : (
            <Caption>No scripts yet — write one in Write.</Caption>
          )}
        </Section>
      </div>
      <Divider />
      <div className="grid lg:grid-cols-2">
        <Section title="Blackout weeks" aside="Brands see these; warning only">
          {blackoutRows.length ? (
            <ul className="border-t border-rule mb-3">
              {blackoutRows.map((b) => (
                <li key={b.id} className="flex items-center gap-3 h-9 border-b border-rule">
                  <span className="num">
                    {date(b.startsOn, "d MMM")} – {date(b.endsOn, "d MMM yyyy")}
                  </span>
                  <span className="text-fg-3 truncate flex-1">{b.note}</span>
                  <ActionButton action={removeBlackout} fields={{ id: b.id }} variant="quiet">
                    Remove
                  </ActionButton>
                </li>
              ))}
            </ul>
          ) : null}
          <ActionForm action={addBlackout} resetOnSuccess className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.4fr_auto] gap-2 items-start">
            <Input type="date" name="startsOn" aria-label="Starts" required />
            <Input type="date" name="endsOn" aria-label="Ends" required />
            <Input name="note" placeholder="Note" aria-label="Note" />
            <SubmitButton variant="plain">Add</SubmitButton>
          </ActionForm>
        </Section>
        <Section title="Reset">
          <Caption className="mb-3">Clears unposted organic items. Sponsored, shoots and posted stay.</Caption>
          <ConfirmSheet label="Reset calendar" title="Reset calendar" word="reset" consequence="Every unposted organic item is removed and can't be brought back." action={resetCalendar} />
        </Section>
      </div>
    </>
  );
}
