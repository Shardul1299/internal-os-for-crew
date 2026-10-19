import Link from "next/link";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, Caption, Divider, EmptyState, Alert, Markdown, Kvs, Kv } from "@/components/ui";
import { KeyRows } from "@/components/ui/client";
import { lbl, DELIV_STATUS, PAYOUT_KIND, ROADMAP_AREA, CHECKIN_TYPE } from "@/components/studio/labels";
import { requireStudio, myDeliverables, clearance, myDeals, payouts, forwardedThreads, checkins, roadmap, topicFilters, anchorPlan, blackouts } from "@/lib/queries/studio";
import { DEAL_STAGE_LABEL, label, money, moneyShort, date, dateTime } from "@/lib/format";
import { today as todayISO } from "@/lib/dates";

export const metadata = { title: "Deals" };
export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const ctx = await requireStudio();
  const t = todayISO();
  const [deliv, deals, pay, threads, ck, road, filters, anchor, bl] = await Promise.all([
    myDeliverables(ctx, ctx.cfg),
    myDeals(ctx),
    payouts(ctx),
    forwardedThreads(ctx),
    checkins(ctx),
    roadmap(ctx),
    topicFilters(ctx),
    anchorPlan(ctx),
    blackouts(ctx),
  ]);
  const due = pay.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amountPaise, 0);
  const readOnly = ctx.access.deals !== "write";
  const nextCheckin = ck.find((c) => !c.heldOn);
  const held = ck.filter((c) => c.heldOn).reverse();

  return (
    <>
      <ScreenHeader title="Deals" number={due ? moneyShort(due) : undefined} numberCaption={due ? "payouts due" : undefined}>
        <span className="t-caption">{readOnly ? "Read-only." : "Your fee only. Crew handles the brand."}</span>
      </ScreenHeader>

      <Section title="Deliverables" aside={String(deliv.length)} flush>
        {deliv.length ? (
          <KeyRows>
            <Table>
              <THead>
                <TH>Due</TH>
                <TH>Deliverable</TH>
                <TH className="hidden sm:table-cell">Status</TH>
                <TH align="right" className="hidden sm:table-cell">Round</TH>
                <TH>Clearance</TH>
              </THead>
              <tbody>
                {deliv.map((d) => (
                  <TR key={d.id} href={`/studio/deals/${d.id}`}>
                    <TD className="whitespace-nowrap">{d.dueOn && d.dueOn < t && !["live", "reported", "cancelled"].includes(d.status) ? <Alert>{date(d.dueOn, "d MMM")}</Alert> : date(d.dueOn, "d MMM")}</TD>
                    <TD>
                      <Link href={`/studio/deals/${d.id}`} className="hover:underline underline-offset-2">
                        {d.brandName} · {d.title}
                      </Link>
                      {d.brandChangeRequestMd && ["drafting", "briefed"].includes(d.status) ? <span className="t-caption ml-2">Changes requested</span> : null}
                    </TD>
                    <TD className="hidden sm:table-cell">{lbl(DELIV_STATUS, d.status)}</TD>
                    <TD align="right" className="hidden sm:table-cell">{d.revisionRound || "—"}</TD>
                    <TD className="t-callout text-fg-3">{clearance(d) ?? (d.status === "live" || d.status === "reported" ? "Live" : "Cleared")}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </KeyRows>
        ) : (
          <EmptyState>No deliverables yet.</EmptyState>
        )}
      </Section>

      <Divider />
      <Section title="Deals and quotes" flush>
        {deals.length ? (
          <Table>
            <THead>
              <TH>Brand</TH>
              <TH>Deal</TH>
              <TH>Stage</TH>
              <TH>Pieces</TH>
              <TH>Term</TH>
              <TH align="right">Your fee</TH>
            </THead>
            <tbody>
              {deals.map((d) => (
                <TR key={d.id}>
                  <TD>{d.brandName}</TD>
                  <TD>{d.title}</TD>
                  <TD>{label(DEAL_STAGE_LABEL, d.stage)}</TD>
                  <TD className="text-fg-3">{d.pieces.map((p) => `${p.qty}× ${ctx.cfg.deliverables.find((x) => x.key === p.deliverableKey)?.label ?? p.deliverableKey.replace(/_/g, " ")}`).join(", ") || "—"}</TD>
                  <TD className="text-fg-3 whitespace-nowrap">{d.termStartsOn ? `${date(d.termStartsOn, "d MMM")} – ${date(d.termEndsOn, "d MMM yy")}` : "—"}</TD>
                  <TD align="right" className="font-semibold">
                    {d.feePaise != null ? money(d.feePaise, d.currency) : "—"}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="px-5">
            <Caption>No deals yet.</Caption>
          </div>
        )}
      </Section>

      <Divider />
      <Section title="Payouts" flush>
        {pay.length ? (
          <Table>
            <THead>
              <TH>Kind</TH>
              <TH>Deal</TH>
              <TH>Due</TH>
              <TH>Status</TH>
              <TH align="right">Amount</TH>
            </THead>
            <tbody>
              {pay.map((p) => (
                <TR key={p.id}>
                  <TD>{lbl(PAYOUT_KIND, p.kind)}</TD>
                  <TD>
                    {p.brandName} · {p.dealTitle}
                  </TD>
                  <TD className="whitespace-nowrap">{date(p.dueOn, "d MMM")}</TD>
                  <TD>{p.status === "paid" ? `Paid ${date(p.paidOn, "d MMM")}` : p.status === "held" ? "Held" : p.dueOn < t ? <Alert>Overdue</Alert> : "Due"}</TD>
                  <TD align="right">{money(p.amountPaise, p.currency)}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="px-5">
            <Caption>No payouts yet.</Caption>
          </div>
        )}
      </Section>

      <Divider />
      <div className="grid lg:grid-cols-2">
        <Section title="Inbox" aside="Forwarded by Crew">
          {threads.length ? (
            <ul className="space-y-4">
              {threads.map((th) => (
                <li key={th.id} className="border-b border-rule pb-3">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold">{th.subject || th.brandName || "Brand inbound"}</span>
                    <span className="t-caption whitespace-nowrap">{dateTime(th.receivedAt)}</span>
                  </div>
                  <div className="t-caption">
                    {th.fromName ?? th.brandName ?? ""} · {th.channel.replace("_", " ")}
                  </div>
                  <Markdown source={th.firstMessageMd} className="text-fg-2 mt-1" />
                  <div className="mt-2 pl-3 border-l border-fg-3">
                    <span className="t-label">Crew&apos;s reply{th.repliedAt ? ` · ${dateTime(th.repliedAt)}` : ""}</span>
                    {th.replyMd ? <Markdown source={th.replyMd} /> : <Caption>Crew is on it.</Caption>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Caption>Nothing forwarded.</Caption>
          )}
        </Section>
        <Section title="Check-ins">
          {nextCheckin ? (
            <p className="t-headline mb-3">
              Next: {lbl(CHECKIN_TYPE, nextCheckin.type)} · {nextCheckin.dueOn < t ? <Alert>{date(nextCheckin.dueOn)}</Alert> : date(nextCheckin.dueOn)}
            </p>
          ) : null}
          {held.length ? (
            <ul className="space-y-3">
              {held.map((c) => (
                <li key={c.id} className="border-b border-rule pb-2">
                  <span className="t-label">
                    {lbl(CHECKIN_TYPE, c.type)} · {date(c.heldOn)}
                  </span>
                  <Markdown source={c.notesMd} className="text-fg-2" />
                </li>
              ))}
            </ul>
          ) : (
            <Caption>No notes yet.</Caption>
          )}
        </Section>
      </div>

      <Divider />
      <div className="grid lg:grid-cols-3">
        <Section title="Roadmap">
          {road.length ? (
            <ul>
              {road.map((r) => (
                <li key={r.id} className="py-1.5 border-b border-rule">
                  <div className="t-caption">{lbl(ROADMAP_AREA, r.area)}</div>
                  <div>{r.goal}</div>
                  {r.crewContribution ? <div className="t-callout text-fg-3">Crew: {r.crewContribution}</div> : null}
                </li>
              ))}
            </ul>
          ) : (
            <Caption>No roadmap items yet.</Caption>
          )}
        </Section>
        <Section title="Topic filters" aside="Set with Crew">
          {filters.length ? (
            <ul>
              {filters.map((f) => (
                <li key={f.id} className="grid grid-cols-[90px_1fr] gap-2 py-1.5 border-b border-rule">
                  <span className="text-fg-3 capitalize">{f.kind}</span>
                  <span>{f.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Caption>None.</Caption>
          )}
        </Section>
        <Section title="Anchor plan" aside="Set with Crew">
          {anchor ? (
            <Kvs>
              <Kv k="Anchor format" v={anchor.anchorFormat} />
              <Kv k="Cadence" v={anchor.cadenceNote} />
              <Kv k="Sponsored max" v={`1 in ${Math.round(1 / (anchor.sponsoredRatioMax || 0.25))}`} />
              <Kv k="Blackouts" v={bl.length ? bl.map((b) => `${date(b.startsOn, "d MMM")}–${date(b.endsOn, "d MMM")}`).join(", ") : "None"} />
            </Kvs>
          ) : (
            <Caption>None yet.</Caption>
          )}
        </Section>
      </div>
    </>
  );
}
