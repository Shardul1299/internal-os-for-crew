import { requireBrand } from "@/lib/session";
import { portalApprovals } from "@/lib/queries/brand-portal";
import { ScreenHeader, Section, Block, Caption, EmptyState, Markdown, Textarea } from "@/components/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/client";
import { approveClaims, requestChangesBrand } from "@/lib/actions/brand-portal";
import { date } from "@/lib/format";

export const metadata = { title: "Approvals" };
export const dynamic = "force-dynamic";

const DISCLOSURE: Record<string, string> = { asci: "ASCI", ftc: "FTC", both: "ASCI and FTC" };

export default async function ApprovalsPage() {
  const me = await requireBrand();
  const rows = await portalApprovals(me.brandId);
  return (
    <>
      <ScreenHeader title="Approvals" number={rows.length || undefined} numberCaption={rows.length ? "awaiting you" : undefined}>
        <Caption>Approve claims and facts only. Two rounds of changes.</Caption>
      </ScreenHeader>
      {rows.length === 0 ? (
        <EmptyState>Nothing awaits your approval.</EmptyState>
      ) : (
        rows.map((d) => (
          <Section key={d.id} title={`${d.campaignName} · round ${d.round} of 2`} aside={d.dueOn ? `Due ${date(d.dueOn, "d MMM")}` : undefined} className="border-b border-rule pb-6">
            <h2 className="t-headline">{d.creatorName} · {d.deliverable}</h2>
            <Caption>Disclosure: {DISCLOSURE[d.disclosureStandard]}</Caption>
            <Block className="mt-3 max-w-3xl">
              <div className="t-label mb-2">{d.claims.kind === "carousel" ? "On-screen text" : "Spoken and on-screen claims"}</div>
              {d.claims.lines.length ? (
                <ol className="space-y-1.5 list-none">
                  {d.claims.lines.map((l, i) => (
                    <li key={i} className="max-w-[72ch]">{l}</li>
                  ))}
                </ol>
              ) : (
                <Caption>No draft text yet.</Caption>
              )}
            </Block>
            {d.lastRequest ? (
              <div className="mt-3 max-w-3xl">
                <div className="t-caption mb-1">Your last request</div>
                <Markdown source={d.lastRequest} />
              </div>
            ) : null}
            <div className="mt-4 grid gap-4 md:grid-cols-[auto_1fr] items-start max-w-3xl">
              <ActionButton action={approveClaims} fields={{ id: d.id }} variant="plain" size="md">
                Approve claims
              </ActionButton>
              <ActionForm action={requestChangesBrand} resetOnSuccess className="space-y-2">
                <input type="hidden" name="id" value={d.id} />
                <Textarea name="note" rows={2} placeholder="Which claim should change, and to what" aria-label="Change request" required />
                <div className="flex items-center gap-3 flex-wrap">
                  <SubmitButton variant="plain">Request changes</SubmitButton>
                  {d.round >= 2 ? <Caption>A third round is priced case by case.</Caption> : null}
                </div>
              </ActionForm>
            </div>
          </Section>
        ))
      )}
    </>
  );
}
