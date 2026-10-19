import { requireCrew } from "@/lib/session";
import { can } from "@/lib/rules/visibility";
import { getConfig } from "@/lib/settings";
import { listBrands, OWNER_TEAM_LABEL, CATEGORY_LABEL } from "@/lib/queries/brands";
import { riskReviewCurrent, RISK_FLAGS } from "@/lib/rules/campaigns";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, EmptyState, Meta, Alert } from "@/components/ui";
import { KeyRows, SearchField } from "@/components/ui/client";
import { NewBrandSheet } from "@/components/brands/BrandForm";
import { DEAL_STAGE_LABEL, label } from "@/lib/format";
import { today, toISO } from "@/lib/dates";

export const metadata = { title: "Brands" };
export const dynamic = "force-dynamic";

const FLAG_LABEL = Object.fromEntries(RISK_FLAGS.map((f) => [f.key, f.label]));

export default async function BrandsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await requireCrew("readBrands");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const cfg = await getConfig();
  const rows = await listBrands(q);
  const t = today();
  const stale = rows.filter((b) => !riskReviewCurrent(cfg, toISO(b.riskReviewedAt), t)).length;
  const canWrite = can(me.role, "writeBrands");
  return (
    <>
      <ScreenHeader
        title="Brands"
        number={stale || undefined}
        numberCaption={stale ? (stale === 1 ? "risk review due" : "risk reviews due") : undefined}
        action={canWrite ? <NewBrandSheet defaultOpen={sp.new === "1"} /> : undefined}
      />
      <Section>
        <SearchField placeholder="Search brands" />
      </Section>
      {rows.length === 0 ? (
        <EmptyState>{q ? "No brand matches." : "No brands yet."}</EmptyState>
      ) : (
        <KeyRows>
          <Table>
            <THead>
              <TH>Brand</TH>
              <TH>Owner team</TH>
              <TH>Risk</TH>
              <TH className="hidden md:table-cell">Last deal</TH>
              <TH align="right">NPS</TH>
            </THead>
            <tbody>
              {rows.map((b) => {
                const current = riskReviewCurrent(cfg, toISO(b.riskReviewedAt), t);
                return (
                  <TR key={b.id} href={`/brands/${b.id}`}>
                    <TD>
                      <span className="font-semibold">{b.name}</span>
                      <span className="t-caption ml-2">
                        {CATEGORY_LABEL[b.category]}
                        {b.isHouseClient ? " · house client" : ""}
                      </span>
                    </TD>
                    <TD>{OWNER_TEAM_LABEL[b.ownerTeam]}</TD>
                    <TD className="max-w-[320px] truncate">
                      {b.riskFlags.length ? <span>{b.riskFlags.map((f) => FLAG_LABEL[f] ?? f).join(", ")}</span> : <Meta>No flags</Meta>}
                      {!current ? (
                        <span className="ml-2">
                          <Alert>Review due</Alert>
                        </span>
                      ) : null}
                    </TD>
                    <TD className="hidden md:table-cell max-w-[300px] truncate">
                      {b.lastDeal ? (
                        <>
                          {b.lastDeal.title} <Meta>· {label(DEAL_STAGE_LABEL, b.lastDeal.stage)}</Meta>
                        </>
                      ) : (
                        <Meta>—</Meta>
                      )}
                    </TD>
                    <TD align="right">{b.npsLatest ?? <Meta>—</Meta>}</TD>
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
