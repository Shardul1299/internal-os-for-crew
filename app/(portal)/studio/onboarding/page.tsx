import { redirect } from "next/navigation";
import { ScreenHeader, Section, Field, FormGrid, Input, Textarea, Select } from "@/components/ui";
import { ActionForm, SubmitButton, ActionButton } from "@/components/ui/client";
import { requireStudio, primaryPlatform } from "@/lib/queries/studio";
import { completeOnboarding, skipOnboarding } from "@/lib/actions/studio";

export const metadata = { title: "Welcome" };
export const dynamic = "force-dynamic";

export default async function Onboarding() {
  const ctx = await requireStudio({ allowIncomplete: true });
  if (ctx.profile.onboardingComplete) redirect("/studio/today");
  const p = ctx.profile;
  const platform = await primaryPlatform(ctx);
  return (
    <>
      <ScreenHeader title="Welcome" action={<ActionButton action={skipOnboarding} fields={{}} variant="quiet" size="md">Skip</ActionButton>}>
        <span className="t-caption">Seven answers set up your Studio.</span>
      </ScreenHeader>
      <Section>
        <ActionForm action={completeOnboarding} className="max-w-3xl">
          <FormGrid>
            <Field label="Instagram handle">
              <Input name="handle" defaultValue={p.handle || platform?.handle || ""} placeholder="@yourname" />
            </Field>
            <Field label="Name field" hint="Name | Keyword">
              <Input name="nameField" defaultValue={p.nameField || ctx.displayName} placeholder={`${ctx.displayName} | AI for founders`} />
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
            <Field label="Bio link" hint="One destination only">
              <Input name="bioLink" type="url" defaultValue={p.bioLink} placeholder="https://" />
            </Field>
            <Field label="Founder story">
              <Textarea name="founderStory" rows={5} defaultValue={p.founderStory} />
            </Field>
            <Field label="Current followers" hint="Private. Never used for pricing.">
              <Input name="followers" type="number" min={0} defaultValue={platform?.followers ?? ""} className="max-w-48" />
            </Field>
            <Field label="Account status" hint="New: 90/0/10 · Established: 70/20/10">
              <Select name="accountStatus" defaultValue={p.accountStatus} className="max-w-48">
                <option value="new">New</option>
                <option value="established">Established</option>
              </Select>
            </Field>
            <Field label="Posts per week">
              <Input name="timesPerWeek" defaultValue={p.postingCadence.times_per_week} className="max-w-48" />
            </Field>
          </FormGrid>
          <div className="mt-4">
            <SubmitButton>Start</SubmitButton>
          </div>
        </ActionForm>
      </Section>
    </>
  );
}
