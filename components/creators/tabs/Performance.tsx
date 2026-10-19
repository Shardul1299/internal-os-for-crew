// Performance: credibility first — decision-maker comments, saves/shares, inbound, sign-ups (§0.1 #1, §3.5).
// Impressions are stored but de-emphasised: last and smaller. Calendar adherence is the retention signal (§20).
import { Section, Stat, Table, THead, TH, TR, TD, Meta, Caption } from "@/components/ui";
import { int, pct, date, humanize } from "@/lib/format";
import type { creatorPerformance } from "@/lib/queries/creators";

export function PerformanceTab({ data, adherence, weeks }: { data: Awaited<ReturnType<typeof creatorPerformance>>; adherence: number | null; weeks: number }) {
  const t = data.totals;
  return (
    <>
      <Section title="Credibility" aside={`${t.measured} measured posts`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-x-6 gap-y-4">
          <Stat label="DM comments" value={int(t.decisionMakerComments)} caption="From decision-makers" />
          <Stat label="Saves" value={int(t.saves)} />
          <Stat label="Shares" value={int(t.shares)} />
          <Stat label="Inbound to brand" value={int(t.inbound)} />
          <Stat label="Sign-ups" value={int(t.signups)} />
          <Stat label="Calendar adherence" value={pct(adherence)} caption={`Posted ÷ planned, ${weeks} weeks`} />
        </div>
        <p className="mt-3 t-caption">
          Impressions <span className="num">{int(t.impressions)}</span> · stored, never priced
        </p>
      </Section>
      <Section title="Sponsored posts" flush>
        {data.rows.length ? (
          <Table>
            <THead>
              <TH>Deliverable</TH>
              <TH>Brand</TH>
              <TH>Status</TH>
              <TH>Live</TH>
              <TH align="right">DM comments</TH>
              <TH align="right">Saves</TH>
              <TH align="right">Shares</TH>
              <TH align="right">Inbound</TH>
              <TH align="right">Sign-ups</TH>
              <TH align="right" className="opacity-60">
                Impr.
              </TH>
            </THead>
            <tbody>
              {data.rows.map((r) => (
                <TR key={r.id} href={`/campaigns/${r.campaignId}?sel=${r.id}`}>
                  <TD href={`/campaigns/${r.campaignId}?sel=${r.id}`}>{r.title}</TD>
                  <TD className="text-fg-2">{r.brand}</TD>
                  <TD className="text-fg-2">{humanize(r.status)}</TD>
                  <TD className="whitespace-nowrap">{r.liveAt ? date(r.liveAt, "d MMM") : "—"}</TD>
                  <TD align="right">{int(r.metrics?.commentsDecisionMaker)}</TD>
                  <TD align="right">{int(r.metrics?.saves)}</TD>
                  <TD align="right">{int(r.metrics?.shares)}</TD>
                  <TD align="right">{int(r.metrics?.inboundToBrand)}</TD>
                  <TD align="right">{int(r.metrics?.trackedSignups)}</TD>
                  <TD align="right" className="text-[11px]">
                    <Meta>{int(r.metrics?.impressions)}</Meta>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="px-5 t-caption">No sponsored posts yet.</p>
        )}
        <Caption className="px-5 mt-2">One metrics record per sponsored post, shared with Studio.</Caption>
      </Section>
    </>
  );
}
