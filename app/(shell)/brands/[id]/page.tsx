import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCrew } from "@/lib/session";
import { can } from "@/lib/rules/visibility";
import { getConfig } from "@/lib/settings";
import { getBrand, OWNER_TEAM_LABEL, CATEGORY_LABEL } from "@/lib/queries/brands";
import { riskReviewCurrent, RISK_FLAGS, feedbackAverage } from "@/lib/rules/campaigns";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, Meta, Alert, Caption, Kvs, Kv, Toggle, Textarea, InspectorTitle, WithInspector, selHref, EmptyState } from "@/components/ui";
import { KeyRows, ActionForm, SubmitButton, ActionButton } from "@/components/ui/client";
import { AddContactSheet, EditContactForm } from "@/components/brands/ContactForms";
import { BrandDetailsForm } from "@/components/brands/BrandForm";
import { InspectorGroup, StackField, PhoneInspector } from "@/components/campaigns/fields";
import { markRiskReviewed, inviteContact, archiveContact } from "@/lib/actions/brands";
import { date, dateTime, moneyShort, DEAL_STAGE_LABEL, label, humanize } from "@/lib/format";
import { today, toISO } from "@/lib/dates";

export const metadata = { title: "Brand" };
export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

export default async function BrandPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const me = await requireCrew("readBrands");
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const data = await getBrand(id);
  if (!data) notFound();
  const { brand, contacts, deals, feedback, reviewerName, campaigns, portalUsers } = data;
  const cfg = await getConfig();
  const canWrite = can(me.role, "writeBrands");
  const current = riskReviewCurrent(cfg, toISO(brand.riskReviewedAt), today());
  const path = `/brands/${id}`;
  const selId = typeof sp.sel === "string" ? sp.sel : null;
  const sel = selId ? contacts.find((c) => c.id === selId) ?? null : null;
  const portalActive = (uid: string | null) => !!uid && portalUsers.some((u) => u.id === uid && u.active);
  const flagLabel = Object.fromEntries(RISK_FLAGS.map((f) => [f.key, f.label]));

  const inspector = sel ? (
    <div>
      <InspectorTitle sub={[sel.role, sel.isPrimary ? "Primary" : null].filter(Boolean).join(" · ") || undefined}>{sel.name}</InspectorTitle>
      {canWrite ? (
        <EditContactForm brandId={id} c={sel} />
      ) : (
        <Kvs>
          <Kv k="Email" v={sel.email} />
          <Kv k="Phone" v={sel.phone} />
        </Kvs>
      )}
      <InspectorGroup label="Brand portal">
        {portalActive(sel.portalUserId) ? (
          <Caption>Invited · signs in with {sel.email}</Caption>
        ) : canWrite ? (
          <ActionButton action={inviteContact} fields={{ id: sel.id }} size="md">
            Invite to brand portal
          </ActionButton>
        ) : (
          <Caption>Not invited.</Caption>
        )}
      </InspectorGroup>
      {canWrite ? (
        <InspectorGroup label="Remove">
          <ActionButton action={archiveContact} fields={{ id: sel.id }} variant="danger" size="md">
            Remove contact
          </ActionButton>
          {sel.portalUserId ? <Caption className="mt-1">Also ends their portal access.</Caption> : null}
        </InspectorGroup>
      ) : null}
    </div>
  ) : undefined;

  return (
    <WithInspector
      closeHref={selHref(path, sp, null)}
      inspector={inspector}
      main={
        <>
          <ScreenHeader title={brand.name} action={canWrite ? <AddContactSheet brandId={id} /> : undefined}>
            <div className="flex flex-wrap gap-x-1 gap-y-1">
              <span>{[CATEGORY_LABEL[brand.category], OWNER_TEAM_LABEL[brand.ownerTeam], brand.isHouseClient ? "House client" : null].filter(Boolean).join(" · ")}</span>
              {brand.website ? (
                <a href={brand.website} target="_blank" rel="noreferrer" className="text-fg-2 hover:underline underline-offset-2">
                  · {brand.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
            </div>
          </ScreenHeader>

          <Section title="Ownership">
            <p>
              Owned by {OWNER_TEAM_LABEL[brand.ownerTeam]}
              {brand.isHouseClient ? " · house client, no NO-list exception" : ""}
            </p>
            {brand.ownerTeam === "owled_social" ? <Caption>Roster-creator deals still route through Crew and need a referral note.</Caption> : <Caption>Roster creators are always sold through Crew.</Caption>}
          </Section>

          <Section title="Risk review" aside={brand.riskReviewedAt ? `Reviewed ${date(brand.riskReviewedAt)}${reviewerName ? ` by ${reviewerName}` : ""}` : undefined}>
            {!current ? (
              <p className="mb-2">
                <Alert>Review due</Alert> <span className="t-caption">Deals need a review in the last {cfg.n.risk_review_days} days.</span>
              </p>
            ) : null}
            {canWrite ? (
              <ActionForm action={markRiskReviewed} className="max-w-2xl">
                <input type="hidden" name="id" value={id} />
                <div className="grid sm:grid-cols-2 gap-x-6">
                  {RISK_FLAGS.map((f) => (
                    <Toggle key={f.key} name="flags" value={f.key} label={f.label} defaultChecked={brand.riskFlags.includes(f.key)} />
                  ))}
                </div>
                <StackField label="Note">
                  <Textarea name="note" rows={2} defaultValue={brand.riskNote ?? ""} />
                </StackField>
                <div className="pt-2">
                  <SubmitButton variant="plain">Mark reviewed</SubmitButton>
                </div>
              </ActionForm>
            ) : (
              <>
                <p>{brand.riskFlags.length ? brand.riskFlags.map((f) => flagLabel[f] ?? f).join(", ") : "No flags"}</p>
                {brand.riskNote ? <Caption>{brand.riskNote}</Caption> : null}
              </>
            )}
          </Section>

          <Section title="Contacts" aside={String(contacts.length)} flush>
            {contacts.length === 0 ? (
              <p className="px-5 t-caption">No contacts yet.</p>
            ) : (
              <KeyRows>
                <Table>
                  <THead>
                    <TH>Name</TH>
                    <TH>Role</TH>
                    <TH className="hidden md:table-cell">Email</TH>
                    <TH className="hidden md:table-cell">Phone</TH>
                    <TH>Portal</TH>
                  </THead>
                  <tbody>
                    {contacts.map((c) => (
                      <TR key={c.id} href={selHref(path, sp, c.id)} selected={c.id === selId}>
                        <TD>
                          {c.name}
                          {c.isPrimary ? <span className="t-caption ml-2">primary</span> : null}
                        </TD>
                        <TD>{c.role ?? <Meta>—</Meta>}</TD>
                        <TD className="hidden md:table-cell">{c.email ?? <Meta>—</Meta>}</TD>
                        <TD className="hidden md:table-cell">{c.phone ?? <Meta>—</Meta>}</TD>
                        <TD>{portalActive(c.portalUserId) ? "Invited" : <Meta>—</Meta>}</TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              </KeyRows>
            )}
          </Section>

          <Section title="Deals" aside={String(deals.length)} flush>
            {deals.length === 0 ? (
              <p className="px-5 t-caption">No deals yet.</p>
            ) : (
              <Table>
                <THead>
                  <TH>Deal</TH>
                  <TH>Stage</TH>
                  <TH className="hidden md:table-cell">Origin</TH>
                  <TH align="right">Value</TH>
                  <TH className="hidden md:table-cell">Campaign</TH>
                </THead>
                <tbody>
                  {deals.map((d) => {
                    const camp = campaigns.find((c) => c.dealId === d.id);
                    return (
                      <TR key={d.id} href={`/deals/${d.id}`}>
                        <TD className="max-w-[300px] truncate">{d.title}</TD>
                        <TD>{label(DEAL_STAGE_LABEL, d.stage)}</TD>
                        <TD className="hidden md:table-cell">{humanize(d.origin)}</TD>
                        <TD align="right">{moneyShort(d.signedTotalPaise ?? d.quotedTotalPaise, d.currency)}</TD>
                        <TD className="hidden md:table-cell">
                          {camp ? (
                            <Link href={`/campaigns/${camp.id}`} className="hover:underline underline-offset-2">
                              Tracker
                            </Link>
                          ) : (
                            <Meta>—</Meta>
                          )}
                        </TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Section>

          <Section title="Feedback and NPS" aside={brand.npsLatest != null ? `NPS ${brand.npsLatest} · ${date(brand.npsAsOf)}` : undefined} flush>
            {feedback.length === 0 ? (
              <p className="px-5 t-caption">No feedback yet.</p>
            ) : (
              <Table>
                <THead>
                  <TH>Date</TH>
                  <TH>Kind</TH>
                  <TH className="hidden md:table-cell">Campaign</TH>
                  <TH align="right">Score</TH>
                  <TH>Comment</TH>
                </THead>
                <tbody>
                  {feedback.map((f) => (
                    <TR key={f.id}>
                      <TD className="whitespace-nowrap">{date(f.submittedOn)}</TD>
                      <TD>{f.kind === "nps" ? "NPS" : "Survey"}</TD>
                      <TD className="hidden md:table-cell">{campaigns.find((c) => c.id === f.campaignId)?.name ?? <Meta>—</Meta>}</TD>
                      <TD align="right">{f.kind === "nps" ? `${f.nps ?? "—"}/10` : `${feedbackAverage(f) ?? "—"}/5`}</TD>
                      <TD className="max-w-[340px] truncate">{f.comment ?? <Meta>—</Meta>}</TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            )}
          </Section>

          {canWrite ? (
            <Section title="Details" aside={`Updated ${dateTime(brand.updatedAt)}`}>
              <BrandDetailsForm b={brand} />
            </Section>
          ) : null}
          {!canWrite && contacts.length === 0 && deals.length === 0 ? <EmptyState>Nothing recorded for this brand yet.</EmptyState> : null}
          <PhoneInspector>{inspector}</PhoneInspector>
        </>
      }
    />
  );
}
