// Overview: identity, platforms (followers as grey metadata), flags, representation, consent, notes,
// the Studio profile read-only (§20) and Studio access (§4).
import { Section, Kvs, Kv, Table, THead, TH, TR, TD, Meta, Caption, Field, Input, Select, Textarea, Toggle, Alert, Divider } from "@/components/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/client";
import { SheetForm } from "../SheetForm";
import { updateCreator, setConsent, addPlatform, editPlatform, inviteToStudio } from "@/lib/actions/creators";
import { canEditCreator, canInviteToStudio } from "@/lib/rules/creator-flow";
import { studioAccess } from "@/lib/rules/studio";
import { SUB_CATEGORY_LABEL, date, int } from "@/lib/format";
import { SOURCE_LABEL, PLATFORM_LABEL } from "../labels";
import type { CreatorSummary, creatorOverview } from "@/lib/queries/creators";

type Overview = Awaited<ReturnType<typeof creatorOverview>>;

export function OverviewTab({ summary, data, role, cadence }: { summary: CreatorSummary; data: Overview; role: string; cadence?: { invited: number; attended: number } }) {
  const c = summary.creator;
  const editable = canEditCreator(role, c.stage).ok;
  const access = studioAccess(c.stage, c.consentStatus);
  const invite = canInviteToStudio({ role, stage: c.stage, consentStatus: c.consentStatus, email: c.email, hasActiveUser: !!summary.studioUser?.active });
  const p = data.profile;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2">
      <div className="xl:border-r border-rule">
        <Section title="Identity" aside={editable ? <EditCreator summary={summary} referrers={data.creatorsForReferral} role={role} /> : undefined}>
          <Kvs>
            <Kv k="Legal name" v={c.legalName} />
            <Kv k="Email" v={c.email} />
            <Kv k="Phone" v={c.phone} />
            <Kv k="City" v={[c.city, c.country].filter(Boolean).join(", ") || null} />
            <Kv k="Sub-category" v={`${SUB_CATEGORY_LABEL[c.subCategory]}${c.secondarySubCategory ? ` · ${SUB_CATEGORY_LABEL[c.secondarySubCategory]}` : ""}`} />
            <Kv k="Languages" v={c.languages.join(", ")} />
            <Kv k="Source" v={`${SOURCE_LABEL[c.source]}${c.sourceDetail ? ` · ${c.sourceDetail}` : ""}`} />
            <Kv
              k="Referred by"
              v={
                data.referredBy ? (
                  <a className="underline underline-offset-2" href={`/creators/${data.referredBy.id}`}>
                    {data.referredBy.name}
                  </a>
                ) : null
              }
            />
            <Kv
              k="Employment"
              v={
                c.isEmployedElsewhere ? (
                  c.employerDisclosureUrl ? (
                    <a className="underline underline-offset-2" href={c.employerDisclosureUrl} target="_blank" rel="noreferrer">
                      Employed · disclosure
                    </a>
                  ) : (
                    <Alert>Employed · disclosure missing</Alert>
                  )
                ) : (
                  "Independent"
                )
              }
            />
            <Kv k="Founder" v={c.isFounder ? `Yes · own-product content ${c.ownProductContentPct ?? "—"}%` : "No"} />
            <Kv k="Pseudonymous" v={c.isPseudonymous ? (c.identityVerifiedPrivately ? "Yes · identity verified privately" : "Yes · identity not verified") : "No"} />
            <Kv k="Representation" v={c.representedElsewhere == null ? <Alert>Not noted</Alert> : c.representedElsewhere ? <Alert>Represented elsewhere</Alert> : "Exclusive to Crew"} />
            {c.representationNote ? <Kv k="Note" v={c.representationNote} /> : null}
            {c.firstLookUntil ? <Kv k="First look until" v={date(c.firstLookUntil)} /> : null}
            {c.revisitOn ? <Kv k="Revisit on" v={date(c.revisitOn)} /> : null}
            {c.stageReason ? <Kv k="Stage reason" v={c.stageReason} /> : null}
            {c.alumniReason ? <Kv k="Alumni reason" v={c.alumniReason} /> : null}
            <Kv k="Notes" v={c.notes ? <span className="whitespace-pre-wrap">{c.notes}</span> : null} />
          </Kvs>
        </Section>
        <Section title="Consent">
          {editable ? (
            <ActionForm action={setConsent} className="flex items-center gap-2">
              <input type="hidden" name="id" value={c.id} />
              <Select name="consentStatus" defaultValue={c.consentStatus} className="max-w-[200px]" aria-label="Consent">
                <option value="none">Not yet</option>
                <option value="opted_in">Opted in</option>
                <option value="withdrawn">Withdrawn</option>
              </Select>
              <SubmitButton variant="plain" size="sm">
                Save
              </SubmitButton>
            </ActionForm>
          ) : (
            <p>{c.consentStatus === "opted_in" ? "Opted in" : c.consentStatus === "withdrawn" ? "Withdrawn" : "Not yet"}</p>
          )}
          <Caption className="mt-1">Withdrawing consent ends Studio access.</Caption>
        </Section>
      </div>
      <div>
        <Section title="Platforms" aside={editable ? <AddPlatform id={c.id} /> : undefined} flush>
          {summary.platforms.length ? (
            <Table>
              <THead>
                <TH>Platform</TH>
                <TH>Handle</TH>
                <TH align="right">Followers</TH>
                <TH />
              </THead>
              <tbody>
                {summary.platforms.map((pl) => (
                  <TR key={pl.id}>
                    <TD>
                      {PLATFORM_LABEL[pl.platform]}
                      {pl.isPrimary ? <span className="t-caption ml-2">primary</span> : null}
                    </TD>
                    <TD>
                      {pl.url ? (
                        <a href={pl.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                          @{pl.handle}
                        </a>
                      ) : (
                        `@${pl.handle}`
                      )}
                    </TD>
                    <TD align="right" className="whitespace-nowrap">
                      <Meta>
                        {int(pl.followers)}
                        {pl.followersAsOf ? ` · ${date(pl.followersAsOf, "d MMM")}` : ""}
                      </Meta>
                    </TD>
                    <TD align="right" className="whitespace-nowrap">
                      {editable ? (
                        <span className="inline-flex gap-1">
                          {!pl.isPrimary ? (
                            <ActionButton action={editPlatform} fields={{ id: c.id, rowId: pl.id, op: "primary" }} variant="quiet">
                              Make primary
                            </ActionButton>
                          ) : null}
                          <ActionButton action={editPlatform} fields={{ id: c.id, rowId: pl.id, op: "remove" }} variant="quiet">
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
            <p className="px-5 t-caption">No platforms yet.</p>
          )}
          <Caption className="px-5 mt-2">Followers are metadata. They never price or tier.</Caption>
        </Section>
        <Section title="Studio">
          <Kvs>
            <Kv
              k="Access"
              v={
                summary.studioUser?.active && access.content
                  ? `Invited · ${summary.studioUser.email}${access.deals === "read" ? " · deals read-only" : ""}`
                  : summary.studioUser && !summary.studioUser.active
                    ? "Access ended"
                    : access.content
                      ? "Not invited"
                      : "Opens at Incubation"
              }
            />
            {cadence && cadence.invited > 0 ? <Kv k="Sunday shoots" v={`${cadence.attended} of ${cadence.invited} attended`} /> : null}
          </Kvs>
          {["owner", "crew_lead"].includes(role) && summary.studioUser ? (
            <p className="mt-2">
              <a className="underline underline-offset-2 text-fg-2 hover:text-fg" href={`/api/creators/${c.id}/studio-export`}>
                Export Studio data
              </a>
            </p>
          ) : null}
          {(c.stage === "incubation" || c.stage === "roster") && !summary.studioUser?.active ? (
            <div className="mt-2 flex items-center gap-3">
              {invite.ok ? (
                <ActionButton action={inviteToStudio} fields={{ id: c.id }} size="sm">
                  Invite to Studio
                </ActionButton>
              ) : (
                <Caption>{invite.reasons[0]}</Caption>
              )}
            </div>
          ) : null}
        </Section>
        <Divider />
        <Section title="Studio profile" aside="Read-only · the creator edits it">
          {p ? (
            <Kvs>
              <Kv k="Handle" v={p.handle ? `@${p.handle.replace(/^@/, "")}` : null} />
              <Kv k="Name field" v={p.nameField || null} />
              <Kv k="Niche" v={[p.niche, ...p.subniches].filter(Boolean).join(" · ") || null} />
              <Kv k="Occupation" v={p.occupation || null} />
              <Kv
                k="Bio link"
                v={
                  p.bioLink ? (
                    <a href={p.bioLink} className="underline underline-offset-2" target="_blank" rel="noreferrer">
                      {p.bioLink}
                    </a>
                  ) : null
                }
              />
              <Kv k="Account" v={p.accountStatus === "new" ? "New · 90/10" : "Established · 70/20/10"} />
              <Kv k="Cadence" v={`${p.postingCadence.times_per_week} a week${p.postingCadence.days.length ? ` · ${p.postingCadence.days.join(", ")}` : ""}`} />
              <Kv k="Pillars" v={`Authority ${p.pillarRatio.authority} · Journey ${p.pillarRatio.journey}`} />
              <Kv k="Concepts" v={`Proven ${p.conceptRatio.proven} · Double down ${p.conceptRatio.double_down} · Experimental ${p.conceptRatio.experimental}`} />
              <Kv k="Credibility" v={p.proprietaryValue || null} />
              <Kv k="Human alpha" v={p.humanAlpha || null} />
              <Kv k="Journey assets" v={p.journeyAssets || null} />
              <Kv k="Founder story" v={p.founderStory || null} />
              <Kv k="Onboarding" v={p.onboardingComplete ? "Complete" : "Not finished"} />
            </Kvs>
          ) : (
            <p className="t-caption">No Studio profile yet.</p>
          )}
        </Section>
      </div>
    </div>
  );
}

function AddPlatform({ id }: { id: string }) {
  return (
    <SheetForm title="Add platform" trigger="Add" action={addPlatform} submitLabel="Add platform" width={460}>
      <input type="hidden" name="id" value={id} />
      <Field label="Platform">
        <Select name="platform" defaultValue="instagram">
          {Object.entries(PLATFORM_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Handle">
        <Input name="handle" required maxLength={120} />
      </Field>
      <Field label="URL">
        <Input name="url" type="url" placeholder="https://" />
      </Field>
      <Field label="Followers" hint="Grey metadata only">
        <Input name="followers" type="number" min={0} inputMode="numeric" />
      </Field>
      <Toggle name="isPrimary" label="Primary platform" />
    </SheetForm>
  );
}

function EditCreator({ summary, referrers, role }: { summary: CreatorSummary; referrers: { id: string; name: string }[]; role: string }) {
  const c = summary.creator;
  return (
    <SheetForm title="Edit creator" trigger="Edit" action={updateCreator} submitLabel="Save" width={600}>
      <input type="hidden" name="id" value={c.id} />
      <Field label="Name">
        <Input name="displayName" defaultValue={c.displayName} required maxLength={120} />
      </Field>
      <Field label="Legal name">
        <Input name="legalName" defaultValue={c.legalName ?? ""} />
      </Field>
      <Field label="Email">
        <Input name="email" type="email" defaultValue={c.email ?? ""} />
      </Field>
      <Field label="Phone">
        <Input name="phone" defaultValue={c.phone ?? ""} />
      </Field>
      <Field label="City">
        <Input name="city" defaultValue={c.city ?? ""} />
      </Field>
      <Field label="Country">
        <Input name="country" defaultValue={c.country ?? ""} maxLength={2} />
      </Field>
      <Field label="Sub-category">
        <Select name="subCategory" defaultValue={c.subCategory}>
          {Object.entries(SUB_CATEGORY_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Secondary">
        <Select name="secondarySubCategory" defaultValue={c.secondarySubCategory ?? ""}>
          <option value="">—</option>
          {Object.entries(SUB_CATEGORY_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Primary platform">
        <Select name="primaryPlatform" defaultValue={c.primaryPlatform}>
          {Object.entries(PLATFORM_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Languages">
        <Input name="languages" defaultValue={c.languages.join(", ")} />
      </Field>
      <Field label="Source">
        <Select name="source" defaultValue={c.source}>
          {Object.entries(SOURCE_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Source detail">
        <Input name="sourceDetail" defaultValue={c.sourceDetail ?? ""} />
      </Field>
      <Field label="Referred by">
        <Select name="referredByCreatorId" defaultValue={c.referredByCreatorId ?? ""}>
          <option value="">—</option>
          {referrers
            .filter((r) => r.id !== c.id)
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
        </Select>
      </Field>
      <Toggle name="isEmployedElsewhere" label="Employed elsewhere" defaultChecked={c.isEmployedElsewhere} />
      <Field label="Disclosure URL">
        <Input name="employerDisclosureUrl" type="url" defaultValue={c.employerDisclosureUrl ?? ""} placeholder="https://" />
      </Field>
      <Toggle name="isFounder" label="Founder" description="Own-product content must be 70% or less" defaultChecked={c.isFounder} />
      <Field label="Own-product %">
        <Input name="ownProductContentPct" type="number" min={0} max={100} defaultValue={c.ownProductContentPct ?? ""} />
      </Field>
      <Toggle name="isPseudonymous" label="Pseudonymous" defaultChecked={c.isPseudonymous} />
      <Toggle name="identityVerifiedPrivately" label="Identity verified privately" defaultChecked={c.identityVerifiedPrivately} />
      <Field label="Represented elsewhere">
        <Select name="representedElsewhere" defaultValue={c.representedElsewhere == null ? "unknown" : c.representedElsewhere ? "yes" : "no"}>
          <option value="unknown">Not noted</option>
          <option value="no">No · exclusive to Crew</option>
          <option value="yes">Yes</option>
        </Select>
      </Field>
      <Field label="Representation note">
        <Input name="representationNote" defaultValue={c.representationNote ?? ""} />
      </Field>
      <Field label="Notes">
        <Textarea name="notes" rows={4} defaultValue={c.notes ?? ""} />
      </Field>
      {role === "owner" ? (
        <Field label="Owner note" hint="Lets a Program entry outside top-N reach Watchlist">
          <Input name="ownerNote" defaultValue={c.stageReason ?? ""} />
        </Field>
      ) : null}
    </SheetForm>
  );
}
