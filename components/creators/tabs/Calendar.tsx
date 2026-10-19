// Calendar: one calendar (creator_calendar_items, §0.1 #17). Month grid with anchors bold, sponsored dotted,
// shoots marked, blackouts shaded. Crew proposes items; the creator decides (§19.3). Topic filters,
// anchor plan and blackout weeks sit beside it.
import Link from "next/link";
import { Section, MonthGrid, Table, THead, TH, TR, TD, Caption, Field, Input, Select, NumberField, Kvs, Kv, Textarea } from "@/components/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/client";
import { SheetForm } from "../SheetForm";
import { proposeCalendarItem, withdrawCalendarItem, addTopicFilter, setTopicFilterActive, saveAnchorPlan, addBlackout, removeBlackout } from "@/lib/actions/creators";
import { canProposeCalendarItem, canEditContentPlan, canEditBlackouts } from "@/lib/rules/creator-flow";
import type { RulesConfig } from "@/lib/rules/config";
import { date, pct, humanize } from "@/lib/format";
import { addMonths } from "@/lib/dates";
import { CALENDAR_KIND_LABEL, TOPIC_KIND_LABEL, PLATFORM_LABEL } from "../labels";
import type { creatorCalendar } from "@/lib/queries/creators";

type Data = Awaited<ReturnType<typeof creatorCalendar>>;

export function CalendarTab({
  creatorId,
  month,
  data,
  role,
  cfg,
  today,
  adherence,
}: {
  creatorId: string;
  month: string;
  data: Data;
  role: string;
  cfg: RulesConfig;
  today: string;
  adherence: number | null;
}) {
  const canPropose = canProposeCalendarItem(role, "organic").ok;
  const canPlan = canEditContentPlan(role).ok;
  const canBlackout = canEditBlackouts(role).ok;
  const prev = addMonths(`${month}-01`, -1).slice(0, 7);
  const next = addMonths(`${month}-01`, 1).slice(0, 7);
  const href = (m: string) => `/creators/${creatorId}?tab=calendar&m=${m}`;
  const activeTopics = data.topics.filter((t) => t.active).length;
  const items = data.items.map((i) => ({
    date: i.date,
    kind: i.kind,
    label: `${i.proposedByUserId ? "Crew · " : ""}${i.title || CALENDAR_KIND_LABEL[i.kind]}`,
    caption: `${CALENDAR_KIND_LABEL[i.kind]} · ${humanize(i.studioStatus)}${i.proposedByUserId ? ` · proposed by ${data.names.get(i.proposedByUserId) ?? "Crew"}` : ""}`,
    href: i.kind === "sponsored" && i.campaignId ? `/campaigns/${i.campaignId}${i.deliverableId ? `?sel=${i.deliverableId}` : ""}` : undefined,
  }));
  return (
    <>
      <Section
        title={date(`${month}-01`, "MMMM yyyy")}
        aside={
          <span className="inline-flex items-center gap-3">
            <span>
              Adherence {pct(adherence)} · last {cfg.n.calendar_window_weeks} weeks
            </span>
            <Link href={href(prev)} scroll={false} className="hover:text-fg" aria-label="Previous month">
              ‹ {date(`${prev}-01`, "MMM")}
            </Link>
            <Link href={href(today.slice(0, 7))} scroll={false} className="hover:text-fg">
              Today
            </Link>
            <Link href={href(next)} scroll={false} className="hover:text-fg" aria-label="Next month">
              {date(`${next}-01`, "MMM")} ›
            </Link>
          </span>
        }
      >
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <MonthGrid month={month} items={items} blackouts={data.blackouts} today={today} />
          </div>
        </div>
        <Caption className="mt-2">Bold anchor · dotted sponsored · ◼ shoot · shaded blackout. The creator decides.</Caption>
      </Section>

      <Section title="This month" aside={canPropose ? <ProposeItem creatorId={creatorId} month={month} today={today} /> : `${data.items.length}`} flush>
        {data.items.length ? (
          <Table>
            <THead>
              <TH>Date</TH>
              <TH>Kind</TH>
              <TH>Title</TH>
              <TH>Status</TH>
              <TH>Platform</TH>
              <TH />
            </THead>
            <tbody>
              {data.items.map((i) => (
                <TR key={i.id}>
                  <TD className="whitespace-nowrap">{date(i.date, "EEE d MMM")}</TD>
                  <TD className={i.kind === "anchor" ? "font-semibold" : "text-fg-2"}>{CALENDAR_KIND_LABEL[i.kind]}</TD>
                  <TD>
                    {i.title}
                    {i.proposedByUserId ? <span className="t-caption ml-2">Crew</span> : null}
                  </TD>
                  <TD className="text-fg-2">{humanize(i.studioStatus)}</TD>
                  <TD className="text-fg-3">{i.platform ? PLATFORM_LABEL[i.platform] : "—"}</TD>
                  <TD align="right">
                    {i.proposedByUserId && i.studioStatus === "idea" && canPropose ? (
                      <ActionButton action={withdrawCalendarItem} fields={{ id: creatorId, rowId: i.id }} variant="quiet">
                        Withdraw
                      </ActionButton>
                    ) : null}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="px-5 t-caption">Nothing planned this month.</p>
        )}
      </Section>

      <div className="grid grid-cols-1 xl:grid-cols-3 border-t border-rule">
        <Section title="Topic filters" aside={`${activeTopics} active`} className="xl:border-r border-rule">
          <ul className="divide-y divide-rule border-y border-rule">
            {data.topics.map((t) => (
              <li key={t.id} className="flex items-center gap-2 min-h-9 py-1">
                <span className="text-fg-3 w-20 shrink-0">{TOPIC_KIND_LABEL[t.kind]}</span>
                <span className={t.active ? "" : "text-fg-3 line-through"}>{t.value}</span>
                {t.reason ? <span className="t-caption truncate">{t.reason}</span> : null}
                {canPlan ? (
                  <span className="ml-auto">
                    <ActionButton action={setTopicFilterActive} fields={{ id: creatorId, rowId: t.id, active: t.active ? "false" : "true" }} variant="quiet">
                      {t.active ? "Turn off" : "Turn on"}
                    </ActionButton>
                  </span>
                ) : null}
              </li>
            ))}
            {!data.topics.length ? <li className="py-2 t-caption">No topic filters.</li> : null}
          </ul>
          {canPlan ? (
            <ActionForm action={addTopicFilter} resetOnSuccess className="mt-3 space-y-1">
              <input type="hidden" name="id" value={creatorId} />
              <div className="flex gap-1">
                <Select name="kind" defaultValue="category" className="max-w-[130px]" aria-label="Kind">
                  {Object.entries(TOPIC_KIND_LABEL).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </Select>
                <Input name="value" placeholder="Value" required maxLength={120} aria-label="Value" />
              </div>
              <Input name="reason" placeholder="Reason" maxLength={200} aria-label="Reason" />
              <SubmitButton variant="plain" size="sm">
                Add filter
              </SubmitButton>
            </ActionForm>
          ) : null}
          <Caption className="mt-2">Topic filters are hard blocks on deliverables.</Caption>
        </Section>

        <Section title="Anchor plan" className="xl:border-r border-rule" aside={canPlan ? <AnchorPlan creatorId={creatorId} plan={data.anchor} cfg={cfg} /> : undefined}>
          {data.anchor ? (
            <Kvs>
              <Kv k="Anchor format" v={data.anchor.anchorFormat} />
              <Kv k="Cadence" v={data.anchor.cadenceNote ?? "Creator decides"} />
              <Kv k="Sponsored max" v={pct(data.anchor.sponsoredRatioMax)} />
            </Kvs>
          ) : (
            <p className="t-caption">No anchor plan. Needed for Incubation.</p>
          )}
        </Section>

        <Section title="Blackout weeks" aside={`${data.blackouts.length}`}>
          <ul className="divide-y divide-rule border-y border-rule">
            {data.blackouts.map((b) => (
              <li key={b.id} className="flex items-center gap-2 min-h-9 py-1">
                <span className="whitespace-nowrap">
                  {date(b.startsOn, "d MMM")} – {date(b.endsOn, "d MMM yy")}
                </span>
                {b.note ? <span className="t-caption truncate">{b.note}</span> : null}
                {canBlackout ? (
                  <span className="ml-auto">
                    <ActionButton action={removeBlackout} fields={{ id: creatorId, rowId: b.id }} variant="quiet">
                      Remove
                    </ActionButton>
                  </span>
                ) : null}
              </li>
            ))}
            {!data.blackouts.length ? <li className="py-2 t-caption">No blackouts.</li> : null}
          </ul>
          {canBlackout ? (
            <ActionForm action={addBlackout} resetOnSuccess className="mt-3 space-y-1">
              <input type="hidden" name="id" value={creatorId} />
              <div className="grid grid-cols-[48px_1fr] items-center gap-1">
                <span className="t-caption">From</span>
                <Input name="startsOn" type="date" required aria-label="Starts" />
                <span className="t-caption">To</span>
                <Input name="endsOn" type="date" required aria-label="Ends" />
              </div>
              <Input name="note" placeholder="Note" maxLength={200} aria-label="Note" />
              <SubmitButton variant="plain" size="sm">
                Add blackout
              </SubmitButton>
            </ActionForm>
          ) : null}
          <Caption className="mt-2">The creator&apos;s call. Brands see them; they warn, never block.</Caption>
        </Section>
      </div>
    </>
  );
}

function ProposeItem({ creatorId, month, today }: { creatorId: string; month: string; today: string }) {
  const def = today.slice(0, 7) === month ? today : `${month}-01`;
  return (
    <SheetForm title="Propose item" trigger="Propose" action={proposeCalendarItem} submitLabel="Propose" width={480}>
      <input type="hidden" name="id" value={creatorId} />
      <Field label="Date">
        <Input name="date" type="date" defaultValue={def} required />
      </Field>
      <Field label="Kind">
        <Select name="kind" defaultValue="organic">
          <option value="anchor">Anchor</option>
          <option value="derivative">Derivative</option>
          <option value="organic">Organic</option>
          <option value="shoot">Shoot</option>
        </Select>
      </Field>
      <Field label="Title">
        <Input name="title" required maxLength={160} />
      </Field>
      <Field label="Pillar">
        <Select name="pillar" defaultValue="authority">
          <option value="authority">Authority</option>
          <option value="journey">Journey</option>
        </Select>
      </Field>
      <Field label="Platform">
        <Select name="platform" defaultValue="instagram">
          {Object.entries(PLATFORM_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Notes">
        <Textarea name="notes" rows={3} maxLength={1000} />
      </Field>
      <Caption>The creator keeps or removes it in Studio.</Caption>
    </SheetForm>
  );
}

function AnchorPlan({ creatorId, plan, cfg }: { creatorId: string; plan: Data["anchor"]; cfg: RulesConfig }) {
  return (
    <SheetForm title="Anchor plan" trigger={plan ? "Edit" : "Set"} action={saveAnchorPlan} submitLabel="Save plan" width={460}>
      <input type="hidden" name="id" value={creatorId} />
      <Field label="Anchor format">
        <Input name="anchorFormat" defaultValue={plan?.anchorFormat ?? ""} required maxLength={200} />
      </Field>
      <Field label="Cadence note" hint="The creator decides cadence">
        <Input name="cadenceNote" defaultValue={plan?.cadenceNote ?? ""} maxLength={200} />
      </Field>
      <Field label="Sponsored max" hint={`Up to ${Math.round(cfg.n.sponsored_ratio_max * 100)}%`}>
        <NumberField
          unit="%"
          name="sponsoredPct"
          min={0}
          max={Math.round(cfg.n.sponsored_ratio_max * 100)}
          step={1}
          defaultValue={Math.round((plan?.sponsoredRatioMax ?? cfg.n.sponsored_ratio_max) * 100)}
        />
      </Field>
    </SheetForm>
  );
}
