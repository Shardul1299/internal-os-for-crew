import { ScreenHeader, Section, Field, FormGrid, Input, Textarea, Select, Table, THead, TH, TR, TD, Divider, Toggle } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { Checks } from "@/components/studio/Checks";
import { Generator } from "@/components/studio/Generator";
import { SubmitForm } from "@/components/studio/SubmitForm";
import { requireStudio, primaryPlatform } from "@/lib/queries/studio";
import { saveProfile } from "@/lib/actions/studio";
import { PROFILE_RIGHT_WRONG, FILMING_FORMATS } from "@/lib/studio/reference";
import { DEFAULT_COLORS } from "@/lib/studio/brand";
import { date } from "@/lib/format";
import { today } from "@/lib/dates";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => ({ value: d, label: d[0].toUpperCase() + d.slice(1) }));
const COLOR_KEYS = [
  ["background", "Background"],
  ["foreground", "Foreground"],
  ["muted", "Muted"],
  ["border", "Border"],
  ["color4", "Accent"],
  ["color5", "Accent 2"],
] as const;

export default async function ProfilePage() {
  const ctx = await requireStudio();
  const p = ctx.profile;
  const platform = await primaryPlatform(ctx);
  const colors = p.colors ?? null;
  return (
    <>
      <ScreenHeader
        title="Profile"
        action={<SubmitForm target="profile">Save</SubmitForm>}
      >
        <span className="t-caption">Every generator writes from this.</span>
      </ScreenHeader>

      <ActionForm action={saveProfile} className="pb-2">
        <ProfileFields p={p} colors={colors} followers={platform?.followers ?? null} followersAsOf={platform?.followersAsOf ?? null} />
        <Section>
          <SubmitButton>Save</SubmitButton>
        </Section>
      </ActionForm>

      <Divider />
      <Section title="Right vs wrong">
        <Table>
          <THead>
            <TH>Field</TH>
            <TH>Wrong</TH>
            <TH>Right</TH>
          </THead>
          <tbody>
            {PROFILE_RIGHT_WRONG.map((r) => (
              <TR key={r.field}>
                <TD className="font-semibold whitespace-nowrap">{r.field}</TD>
                <TD className="text-fg-3">{r.wrong}</TD>
                <TD>{r.right}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Section>

      <Divider />
      <Section title="Bio generator">
        <div className="max-w-4xl">
          <Generator gen="bio" brand={ctx.brand} defaults={{ ideationCount: ctx.cfg.n.ideation_batch_size, carouselSlides: ctx.cfg.n.carousel_default_slides }} today={today()} />
        </div>
      </Section>
    </>
  );
}

function ProfileFields({
  p,
  colors,
  followers,
  followersAsOf,
}: {
  p: Awaited<ReturnType<typeof requireStudio>>["profile"];
  colors: Record<string, string> | null;
  followers: number | null;
  followersAsOf: string | null;
}) {
  return (
    <div id="profile">
      <Section title="Identity">
        <FormGrid className="max-w-3xl">
          <Field label="Handle">
            <Input name="handle" defaultValue={p.handle} placeholder="@yourname" />
          </Field>
          <Field label="Name field" hint="[Name] | [Searchable keyword / niche / occupation]">
            <Input name="nameField" defaultValue={p.nameField} />
          </Field>
          <Field label="Niche">
            <Input name="niche" defaultValue={p.niche} />
          </Field>
          <Field label="Sub-niches" hint="Comma separated">
            <Input name="subniches" defaultValue={p.subniches.join(", ")} />
          </Field>
          <Field label="Occupation">
            <Input name="occupation" defaultValue={p.occupation} />
          </Field>
          <Field label="Founder story">
            <Textarea name="founderStory" rows={5} defaultValue={p.founderStory} />
          </Field>
          <Field label="Bio link" hint="One destination only">
            <Input name="bioLink" type="url" defaultValue={p.bioLink} placeholder="https://" />
          </Field>
          <Field label="Brand colours">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLOR_KEYS.map(([k, label]) => {
                const v = colors?.[k] ?? "";
                return (
                  <label key={k} className="flex items-center gap-2">
                    <span aria-hidden className="w-5 h-5 shrink-0 border border-rule" style={{ background: v || DEFAULT_COLORS[k] }} />
                    <Input name={`c_${k}`} defaultValue={v} placeholder={DEFAULT_COLORS[k]} aria-label={label} className="font-mono" />
                  </label>
                );
              })}
            </div>
          </Field>
          <Field label="Fonts">
            <div className="grid grid-cols-2 gap-2">
              <Input name="fontHeading" defaultValue={p.fonts?.heading ?? ""} placeholder="Heading" aria-label="Heading font" />
              <Input name="fontBody" defaultValue={p.fonts?.body ?? ""} placeholder="Body" aria-label="Body font" />
            </div>
          </Field>
          <Field label="Visual assets" hint="Comma separated">
            <Input name="assetTypes" defaultValue={p.assetTypes.join(", ")} placeholder="whiteboard frames, screen recordings" />
          </Field>
        </FormGrid>
      </Section>

      <Section title="Growth & ratios">
        <FormGrid className="max-w-3xl">
          <Field label="Followers" hint={followersAsOf ? `Private · as of ${date(followersAsOf)}` : "Private. Never used for pricing."}>
            <Input name="followers" type="number" min={0} defaultValue={followers ?? ""} className="max-w-40 text-fg-3" />
          </Field>
          <Field label="Account status" hint="New → 90/10 rule · Established → 70/20/10 rule">
            <Select name="accountStatus" defaultValue={p.accountStatus} className="max-w-48">
              <option value="new">New</option>
              <option value="established">Established</option>
            </Select>
          </Field>
          <Field label="Posting cadence">
            <div className="grid grid-cols-2 gap-2 max-w-sm">
              <Select name="cadenceTier" defaultValue={p.postingCadence.tier} aria-label="Cadence tier">
                <option value="light">Light</option>
                <option value="steady">Steady</option>
                <option value="heavy">Heavy</option>
              </Select>
              <Input name="timesPerWeek" defaultValue={p.postingCadence.times_per_week} placeholder="Times per week" aria-label="Times per week" />
            </div>
            <Checks name="days" options={DAYS} value={p.postingCadence.days} />
          </Field>
          <Field label="Pillar ratio" hint="Authority %; Journey is the rest">
            <div className="flex items-center gap-2 max-w-sm">
              <Input name="authority" type="number" min={0} max={100} defaultValue={p.pillarRatio.authority} className="max-w-24 text-right" aria-label="Authority %" />
              <span className="t-caption">Authority · Journey {p.pillarRatio.journey}</span>
            </div>
          </Field>
          <Field label="Concept ratio" hint="Proven / Double down / Experimental — adds to 100">
            <div className="grid grid-cols-3 gap-2 max-w-sm">
              <Input name="proven" type="number" min={0} max={100} defaultValue={p.conceptRatio.proven} aria-label="Proven %" className="text-right" />
              <Input name="doubleDown" type="number" min={0} max={100} defaultValue={p.conceptRatio.double_down} aria-label="Double down %" className="text-right" />
              <Input name="experimental" type="number" min={0} max={100} defaultValue={p.conceptRatio.experimental} aria-label="Experimental %" className="text-right" />
            </div>
          </Field>
          <Field label="Hook preferences">
            <Checks
              name="hookPrefs"
              options={[
                { value: "verbal", label: "Verbal" },
                { value: "written", label: "Written" },
                { value: "visual", label: "Visual" },
              ]}
              value={p.hookPrefs}
            />
          </Field>
          <Field label="Format preferences">
            <Checks name="formatPrefs" options={FILMING_FORMATS.map((f) => ({ value: f.id, label: f.name.replace(" Format", "") }))} value={p.formatPrefs} />
          </Field>
          <Field label="CTA status">
            <Select name="ctaStatus" defaultValue={p.ctaStatus} className="max-w-48">
              <option value="undecided">Undecided</option>
              <option value="follow">Follow</option>
              <option value="engagement">Engagement</option>
              <option value="manychat">ManyChat</option>
              <option value="none">None</option>
            </Select>
          </Field>
          <Field label="ManyChat">
            <Toggle name="manychatSetup" label="Set up on my account" defaultChecked={p.manychatSetup} />
          </Field>
        </FormGrid>
      </Section>

      <Section title="What makes you credible and hard to copy">
        <FormGrid className="max-w-3xl">
          <Field label="Proprietary value" hint="Specific numbers from your track record">
            <Textarea name="proprietaryValue" rows={3} defaultValue={p.proprietaryValue} />
          </Field>
          <Field label="Journey assets" hint="Real footage and photos you have">
            <Textarea name="journeyAssets" rows={3} defaultValue={p.journeyAssets} />
          </Field>
          <Field label="Human alpha" hint="Why AI slop can't copy you">
            <Textarea name="humanAlpha" rows={3} defaultValue={p.humanAlpha} />
          </Field>
          <Field label="Equipment" hint="One per line">
            <Textarea name="equipment" rows={3} defaultValue={p.equipment.join("\n")} />
          </Field>
          <Field label="AI stack" hint="One per line">
            <Textarea name="aiStack" rows={3} defaultValue={p.aiStack.join("\n")} />
          </Field>
          <Field label="Workflows to automate" hint="One per line">
            <Textarea name="automateWorkflows" rows={3} defaultValue={p.automateWorkflows.join("\n")} />
          </Field>
        </FormGrid>
      </Section>
    </div>
  );
}
