// Brand-facing quote (§5.3): deliverables, quantities, prices and terms — then the CPV reframe page.
// No tier, rung names, Standards or commission: the view model is built here and checked by assertNoInternal.
import { notFound } from "next/navigation";
import { requireCrew } from "@/lib/session";
import { getDealRecord, getTemplate } from "@/lib/queries/deals";
import { assertNoInternal } from "@/lib/rules/visibility";
import { Table, THead, TH, TR, TD, Markdown, Kv, Kvs, ButtonLink } from "@/components/ui";
import { PrintDoc } from "@/components/deals/PrintDoc";
import { PrintButton } from "@/components/deals/FormSheet";
import { money, date, humanize } from "@/lib/format";

export const metadata = { title: "Quote" };
export const dynamic = "force-dynamic";

export default async function QuotePrint({ params }: { params: Promise<{ id: string }> }) {
  await requireCrew("readDeals");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [rec, cpv] = await Promise.all([getDealRecord(id), getTemplate("cpv_reframe_page")]);
  if (!rec) notFound();
  const { deal, brand, cfg } = rec;
  const termsOf = (keys: string[]) =>
    keys
      .map((k) => cfg.addons.find((a) => a.key === k))
      .filter((a) => a && a.kind !== "blocked")
      .map((a) => a!.label);
  const view = {
    brand: brand.name,
    title: deal.title,
    issued: rec.today,
    currency: deal.currency,
    items: rec.lines.map((l) => ({
      creator: l.creatorName,
      deliverable: l.isCaseByCase ? (l.note ?? "Revision") : (cfg.deliverables.find((d) => d.key === l.deliverableKey)?.label ?? l.deliverableKey),
      qty: l.qty,
      includes: termsOf(l.addons.map((a) => a.key)),
      pricePaise: l.totalPaise,
    })),
    totalPaise: rec.quoteTotal,
    usage: deal.usageRights.map((u) => `${humanize(u.kind)}, ${u.days} days`),
    exclusivity: deal.exclusivity.scope === "none" ? null : `${humanize(deal.exclusivity.scope)}, ${deal.exclusivity.days} days`,
    advancePct: cfg.n.advance_pct,
    advanceDueDays: cfg.n.advance_due_days,
    balanceDueDays: cfg.n.balance_due_days,
    gstPct: cfg.n.gst_pct,
  };
  assertNoInternal(view);
  return (
    <PrintDoc>
      <div className="no-print flex gap-2 mb-6">
        <PrintButton />
        <ButtonLink href={`/deals/${deal.id}?step=quote`}>Back</ButtonLink>
      </div>
      <div className="t-label">Crew by OWLED · Quote</div>
      <h1 className="t-display text-[40px] leading-[0.95] mt-2">{view.title}</h1>
      <p className="mt-2 text-fg-2">
        For {view.brand} · {date(view.issued)}
      </p>
      <div className="mt-6">
        <Table>
          <THead>
            <TH>Creator</TH>
            <TH>Deliverable</TH>
            <TH align="right">Qty</TH>
            <TH>Includes</TH>
            <TH align="right">Price</TH>
          </THead>
          <tbody>
            {view.items.map((it, i) => (
              <TR key={i}>
                <TD>{it.creator}</TD>
                <TD>{it.deliverable}</TD>
                <TD align="right">{it.qty}</TD>
                <TD className="text-fg-2">{it.includes.length ? it.includes.join(", ") : "—"}</TD>
                <TD align="right">{money(it.pricePaise, view.currency)}</TD>
              </TR>
            ))}
            <TR>
              <TD className="font-semibold">Total</TD>
              <TD> </TD>
              <TD> </TD>
              <TD className="text-fg-3">Exclusive of {view.gstPct}% GST</TD>
              <TD align="right" className="font-semibold">
                {money(view.totalPaise, view.currency)}
              </TD>
            </TR>
          </tbody>
        </Table>
      </div>
      <div className="mt-6 max-w-[620px]">
        <Kvs>
          <Kv k="Payment" v={`${view.advancePct}% on signature, due in ${view.advanceDueDays} days; balance on completion, due in ${view.balanceDueDays} days.`} />
          <Kv k="Go-live" v="After signed SOW, PO or email confirmation, and the advance." />
          <Kv k="Usage" v={view.usage.length ? view.usage.join("; ") : "Organic posting only."} />
          <Kv k="Exclusivity" v={view.exclusivity ?? "None"} />
          <Kv k="Approvals" v="Claims and facts only, two rounds. Further revisions priced case by case." />
          <Kv k="Lifetime usage" v="Not offered. Maximum licence 12 months." />
        </Kvs>
      </div>
      <section className="print-break mt-12 pt-8 border-t border-rule">
        <Markdown source={cpv} />
      </section>
    </PrintDoc>
  );
}
