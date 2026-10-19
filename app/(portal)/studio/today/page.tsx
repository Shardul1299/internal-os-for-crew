import Link from "next/link";
import { ScreenHeader, Section, List, ListRow, EmptyState, Table, THead, TH, TR, TD, Alert, ButtonLink, Caption, Markdown, Divider } from "@/components/ui";
import { KeyRows } from "@/components/ui/client";
import { MixPanel } from "@/components/studio/Mix";
import { lbl, DELIV_STATUS, KIND_LABEL, STATUS_LABEL, PAYOUT_KIND, ROADMAP_AREA, CHECKIN_TYPE } from "@/components/studio/labels";
import { requireStudio, myDeliverables, clearance, calendarItems, studioWindow, contentMix, outliers, payouts, forwardedThreads, checkins, roadmap } from "@/lib/queries/studio";
import { date, money, dateTime } from "@/lib/format";
import { addDays, today as todayISO } from "@/lib/dates";

export const metadata = { title: "Today" };
export const dynamic = "force-dynamic";

export default async function StudioToday() {
  const ctx = await requireStudio();
  const t = todayISO();
  const win = studioWindow(ctx.cfg);
  const [deliv, upcoming, windowItems, outl, pay, threads, ck, road] = await Promise.all([
    myDeliverables(ctx, ctx.cfg, { open: true }),
    calendarItems(ctx, t, addDays(t, 120)),
    calendarItems(ctx, win.from, win.to),
    outliers(ctx),
    payouts(ctx),
    forwardedThreads(ctx),
    checkins(ctx),
    roadmap(ctx),
  ]);
  const mix = await contentMix(ctx, ctx.cfg, ctx.profile, windowItems);
  const nextUp = upcoming.filter((i) => i.studioStatus !== "posted" && i.kind !== "blackout").slice(0, 6);
  const trending = outl.slice(0, 6);
  const dueSoon = deliv.filter((d) => d.dueOn && d.dueOn <= addDays(t, 7)).length;
  const nextCheckin = ck.find((c) => !c.heldOn);
  const held = ck.filter((c) => c.heldOn).reverse();
  const payDue = pay.filter((p) => p.status !== "paid");
  const payPaid = pay.filter((p) => p.status === "paid").slice(0, 5);
  const nothing = !deliv.length && !nextUp.length;

  return (
    <>
      <ScreenHeader
        title="Today"
        number={dueSoon || undefined}
        numberCaption={dueSoon ? "due for Crew this week" : undefined}
        action={
          <ButtonLink href="/studio/calendar?view=batch" variant="primary" data-new>
            Plan next batch
          </ButtonLink>
        }
      >
        <span className="t-caption">{date(new Date(), "EEEE, d MMMM")}</span>
      </ScreenHeader>

      {nothing ? <EmptyState>Nothing due. Make something.</EmptyState> : null}

      <KeyRows>
        {deliv.length ? (
          <Section title="Due for Crew" aside={String(deliv.length)} flush>
            <Table>
              <THead>
                <TH>Due</TH>
                <TH>Deliverable</TH>
                <TH className="hidden sm:table-cell">Status</TH>
                <TH align="right" className="hidden sm:table-cell">Round</TH>
                <TH>Clearance</TH>
              </THead>
              <tbody>
                {deliv.map((d) => {
                  const c = clearance(d);
                  const late = d.dueOn && d.dueOn < t;
                  return (
                    <TR key={d.id} href={`/studio/deals/${d.id}`}>
                      <TD className="whitespace-nowrap">{late ? <Alert>{date(d.dueOn, "d MMM")}</Alert> : date(d.dueOn, "d MMM")}</TD>
                      <TD>
                        <Link href={`/studio/deals/${d.id}`} className="hover:underline underline-offset-2">
                          {d.brandName} · {d.title}
                        </Link>
                      </TD>
                      <TD className="hidden sm:table-cell">{lbl(DELIV_STATUS, d.status)}</TD>
                      <TD align="right" className="hidden sm:table-cell">{d.revisionRound || "—"}</TD>
                      <TD className="t-callout text-fg-3">{c ?? "Cleared"}</TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
          </Section>
        ) : null}

        {nextUp.length ? (
          <Section title="Next up" aside={String(nextUp.length)} flush>
            <List>
              {nextUp.map((i) => (
                <ListRow
                  key={i.id}
                  href={`/studio/calendar/${i.id}`}
                  lead={date(i.date, "EEE d MMM")}
                  title={`${i.title || i.topic || "Untitled"}${i.proposedByUserId ? " · Crew" : ""}`}
                  meta={`${lbl(KIND_LABEL, i.kind)} · ${lbl(STATUS_LABEL, i.studioStatus)}`}
                />
              ))}
            </List>
          </Section>
        ) : null}
      </KeyRows>

      <Section title="Content mix" aside={`${mix.planned} planned · ${date(win.from, "d MMM")} – ${date(win.to, "d MMM")}`}>
        <MixPanel mix={mix} />
      </Section>

      <Divider />
      <div className="grid lg:grid-cols-2">
        <Section title="Trending in your niche" aside={trending.length ? "Top multiples" : undefined} flush>
          {trending.length ? (
            <List>
              {trending.map((o) => (
                <ListRow key={o.id} href={`/studio/research?edit=${o.id}`} lead={`${o.multiple.toFixed(1)}×`} title={o.hookWritten || o.hookVerbal || o.creatorHandle || o.link} meta={o.used ? "Used" : o.nicheKeyword} />
              ))}
            </List>
          ) : (
            <div className="px-5">
              <Caption>No outliers logged yet.</Caption>
            </div>
          )}
        </Section>

        <Section title="Payouts" aside={payDue.length ? `${payDue.length} due` : undefined} flush>
          {pay.length ? (
            <List>
              {[...payDue, ...payPaid].map((p) => (
                <ListRow
                  key={p.id}
                  lead={p.status === "paid" ? "Paid" : p.dueOn < t ? <span className="text-pink-fg font-semibold">Overdue</span> : `Due ${date(p.dueOn, "d MMM")}`}
                  title={`${lbl(PAYOUT_KIND, p.kind)} · ${p.brandName}`}
                  meta={money(p.amountPaise, p.currency)}
                />
              ))}
            </List>
          ) : (
            <div className="px-5">
              <Caption>No payouts yet.</Caption>
            </div>
          )}
        </Section>
      </div>

      <Divider />
      <div className="grid lg:grid-cols-2">
        <Section title="Inbox" aside={threads.length ? "From Crew" : undefined}>
          {threads.length ? (
            <ul className="space-y-4">
              {threads.slice(0, 4).map((th) => (
                <li key={th.id} className="border-b border-rule pb-3">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold truncate">{th.subject || th.brandName || "Brand inbound"}</span>
                    <span className="t-caption whitespace-nowrap">{dateTime(th.receivedAt)}</span>
                  </div>
                  <p className="text-fg-2 mt-1 line-clamp-2">{th.firstMessageMd}</p>
                  <div className="mt-2">
                    <span className="t-label">Crew&apos;s reply</span>
                    {th.replyMd ? <Markdown source={th.replyMd} className="text-fg-2" /> : <Caption>Crew is on it.</Caption>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Caption>Nothing forwarded.</Caption>
          )}
        </Section>

        <Section title="Next check-in">
          {nextCheckin ? (
            <p className="t-headline">
              {lbl(CHECKIN_TYPE, nextCheckin.type)} · {nextCheckin.dueOn < t ? <Alert>{date(nextCheckin.dueOn)}</Alert> : date(nextCheckin.dueOn)}
            </p>
          ) : (
            <Caption>None scheduled.</Caption>
          )}
          {held[0]?.notesMd ? (
            <div className="mt-3">
              <span className="t-label">Last notes · {date(held[0].heldOn)}</span>
              <Markdown source={held[0].notesMd} className="text-fg-2" />
            </div>
          ) : null}
          {road.length ? (
            <div className="mt-3">
              <span className="t-label">Roadmap</span>
              <ul className="mt-1">
                {road.map((r) => (
                  <li key={r.id} className="grid grid-cols-[150px_1fr] gap-3 py-1 border-b border-rule">
                    <span className="text-fg-3">{lbl(ROADMAP_AREA, r.area)}</span>
                    <span>{r.goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>
      </div>
    </>
  );
}
