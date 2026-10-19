// Form bodies for the Program sheets. Server-safe; rendered inside <FormSheet>.
import { Field, FormGrid, Input, Select, Textarea, NumberField, Toggle } from "@/components/ui";
import { MarkdownEditor } from "@/components/ui/client";
import { SUB_CATEGORY_LABEL } from "@/lib/format";

const PROGRAMMES = [
  ["creatorpreneur", "Creatorpreneur"],
  ["creator_marketer", "Creator marketer"],
  ["next_gen_business", "Next-gen business"],
  ["mixed", "Mixed"],
] as const;
export const PROGRAMME_LABEL: Record<string, string> = Object.fromEntries(PROGRAMMES);
const PLATFORMS = [
  ["instagram", "Instagram"],
  ["youtube", "YouTube"],
  ["x", "X"],
  ["linkedin", "LinkedIn"],
  ["newsletter", "Newsletter"],
  ["other", "Other"],
] as const;
export const PLATFORM_LABEL: Record<string, string> = Object.fromEntries(PLATFORMS);

export function SubCategorySelect({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  return (
    <Select name={name} defaultValue={defaultValue ?? "ai_educator"}>
      {Object.entries(SUB_CATEGORY_LABEL).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </Select>
  );
}

export function PlatformSelect({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  return (
    <Select name={name} defaultValue={defaultValue ?? "instagram"}>
      {PLATFORMS.map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </Select>
  );
}

export function CohortFields({
  cohort,
  showCost,
}: {
  cohort?: { id: string; programme: string; batchLabel: string; startsOn: string; endsOn: string; counterpartName: string | null; counterpartEmail: string | null; costPaise: number } | null;
  showCost: boolean;
}) {
  return (
    <FormGrid>
      {cohort ? <input type="hidden" name="id" value={cohort.id} /> : null}
      <Field label="Programme">
        <Select name="programme" defaultValue={cohort?.programme ?? "creatorpreneur"}>
          {PROGRAMMES.map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Batch">
        <Input name="batchLabel" required defaultValue={cohort?.batchLabel ?? ""} placeholder="Creatorpreneur — Batch 8" />
      </Field>
      <Field label="Starts">
        <Input type="date" name="startsOn" required defaultValue={cohort?.startsOn ?? ""} />
      </Field>
      <Field label="Ends">
        <Input type="date" name="endsOn" required defaultValue={cohort?.endsOn ?? ""} />
      </Field>
      <Field label="LIT counterpart">
        <Input name="counterpartName" defaultValue={cohort?.counterpartName ?? ""} placeholder="Name" />
      </Field>
      <Field label="Counterpart email">
        <Input type="email" name="counterpartEmail" defaultValue={cohort?.counterpartEmail ?? ""} />
      </Field>
      {showCost ? (
        <Field label="Cost to date">
          <NumberField unit="₹" name="cost" min={0} step="1" defaultValue={cohort ? Math.round(cohort.costPaise / 100) : 0} />
        </Field>
      ) : null}
    </FormGrid>
  );
}

export function ChallengeFields({
  cohortId,
  challenge,
  brands,
  judges,
  template,
  defaultOpensAt,
  topN,
}: {
  cohortId: string;
  challenge?: { id: string; title: string; brandId: string | null; briefMd: string; opensAtLocal: string; judges: string[]; topN: number; capacityNote: string | null; status: string } | null;
  brands: { id: string; name: string }[];
  judges: { id: string; name: string | null; role: string }[];
  template: string;
  defaultOpensAt: string;
  topN: number;
}) {
  const lockedWindow = challenge && challenge.status !== "draft";
  return (
    <FormGrid>
      <input type="hidden" name="cohortId" value={cohortId} />
      {challenge ? <input type="hidden" name="id" value={challenge.id} /> : null}
      <Field label="Title">
        <Input name="title" required defaultValue={challenge?.title ?? ""} placeholder="Explain an AI note-taker to a busy founder" />
      </Field>
      <Field label="Brand" hint="Hidden from students until closed.">
        <Select name="brandId" defaultValue={challenge?.brandId ?? ""}>
          <option value="">No brand yet</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Opens" hint="Closes 48 hours later.">
        {lockedWindow ? (
          <>
            <input type="hidden" name="opensAt" value={challenge!.opensAtLocal} />
            <Input type="datetime-local" value={challenge!.opensAtLocal} disabled readOnly />
          </>
        ) : (
          <Input type="datetime-local" name="opensAt" required defaultValue={challenge?.opensAtLocal ?? defaultOpensAt} />
        )}
      </Field>
      <Field label="Top N">
        <NumberField name="topN" min={1} max={50} step="1" defaultValue={challenge?.topN ?? topN} unit="entries" />
      </Field>
      <Field label="Capacity note">
        <Input name="capacityNote" defaultValue={challenge?.capacityNote ?? "Runs when Crew has capacity"} />
      </Field>
      <Field label="Judges">
        <span className="grid grid-cols-2 gap-x-4">
          {judges
            .filter((j) => j.role !== "intern")
            .map((j) => (
              <Toggle key={j.id} name="judges" value={j.id} label={j.name ?? j.id} defaultChecked={challenge ? challenge.judges.includes(j.id) : j.role === "owner" || j.role === "crew_lead"} />
            ))}
        </span>
      </Field>
      <div className="py-2">
        <div className="text-fg-2 mb-1">Anonymised brief</div>
        <MarkdownEditor name="briefMd" defaultValue={challenge?.briefMd ?? template} rows={12} />
      </div>
    </FormGrid>
  );
}

export function EntrantFields({ challengeId, existing }: { challengeId: string; existing: { id: string; name: string }[] }) {
  return (
    <FormGrid>
      <input type="hidden" name="challengeId" value={challengeId} />
      {existing.length ? (
        <Field label="Existing creator" hint="Or leave blank and add a new student.">
          <Select name="creatorId" defaultValue="">
            <option value="">New student</option>
            {existing.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}
      <Field label="Name">
        <Input name="displayName" placeholder="Student name" />
      </Field>
      <Field label="Email">
        <Input type="email" name="email" />
      </Field>
      <Field label="City">
        <Input name="city" />
      </Field>
      <Field label="Sub-category">
        <SubCategorySelect name="declaredSubCategory" />
      </Field>
      <Field label="Platform">
        <PlatformSelect name="declaredPlatform" />
      </Field>
      <Toggle name="consent" label="Opt-in consent captured" description="Student opt-in signed. Required to enter." />
    </FormGrid>
  );
}

export function SubmitFields({ entryId }: { entryId: string }) {
  return (
    <FormGrid>
      <input type="hidden" name="entryId" value={entryId} />
      <Field label="Submission link">
        <Input type="url" name="submissionUrl" required placeholder="https://" />
      </Field>
      <Field label="Note" hint="Up to 100 words.">
        <Textarea name="noteMd" rows={4} />
      </Field>
    </FormGrid>
  );
}

export function ShootFields({
  cohortId,
  shoot,
  creators,
  leads,
  defaultDate,
}: {
  cohortId: string;
  shoot?: { id: string; date: string; location: string; creators: string[]; crewLeadUserId: string | null; notesMd: string | null } | null;
  creators: { id: string; name: string; stage: string }[];
  leads: { id: string; name: string | null; role: string }[];
  defaultDate: string;
}) {
  return (
    <FormGrid>
      <input type="hidden" name="cohortId" value={cohortId} />
      {shoot ? <input type="hidden" name="id" value={shoot.id} /> : null}
      <Field label="Date">
        <Input type="date" name="date" required defaultValue={shoot?.date ?? defaultDate} />
      </Field>
      <Field label="Location">
        <Input name="location" required defaultValue={shoot?.location ?? "OWLED studio, Indiranagar"} />
      </Field>
      <Field label="Crew lead">
        <Select name="crewLeadUserId" defaultValue={shoot?.crewLeadUserId ?? leads.find((l) => l.role === "crew_lead")?.id ?? ""}>
          <option value="">—</option>
          {leads
            .filter((l) => l.role !== "intern")
            .map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
        </Select>
      </Field>
      <Field label="Creators">
        {creators.length ? (
          <span className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            {creators.map((c) => (
              <Toggle key={c.id} name="creators" value={c.id} label={c.name} description={c.stage} defaultChecked={shoot ? shoot.creators.includes(c.id) : c.stage === "incubation"} />
            ))}
          </span>
        ) : (
          <span className="t-caption block pt-2">No Program creators in this cohort yet.</span>
        )}
      </Field>
      <Field label="Notes">
        <Textarea name="notesMd" rows={3} defaultValue={shoot?.notesMd ?? ""} />
      </Field>
    </FormGrid>
  );
}

export function InternFields({
  cohortId,
  intern,
}: {
  cohortId: string;
  intern?: { id: string; personName: string; email: string | null; function: string; startsOn: string | null; endsOn: string | null } | null;
}) {
  return (
    <FormGrid>
      <input type="hidden" name="cohortId" value={cohortId} />
      {intern ? <input type="hidden" name="id" value={intern.id} /> : null}
      <Field label="Name">
        <Input name="personName" required defaultValue={intern?.personName ?? ""} />
      </Field>
      <Field label="Email">
        <Input type="email" name="email" defaultValue={intern?.email ?? ""} />
      </Field>
      <Field label="Function">
        <Select name="function" defaultValue={intern?.function ?? "research"}>
          <option value="research">Research</option>
          <option value="deal_desk">Deal desk</option>
        </Select>
      </Field>
      <Field label="Starts">
        <Input type="date" name="startsOn" defaultValue={intern?.startsOn ?? ""} />
      </Field>
      <Field label="Ends">
        <Input type="date" name="endsOn" defaultValue={intern?.endsOn ?? ""} />
      </Field>
    </FormGrid>
  );
}

export function ConvertFields({ internId }: { internId: string }) {
  return (
    <FormGrid>
      <input type="hidden" name="internId" value={internId} />
      <Field label="Sub-category">
        <SubCategorySelect name="subCategory" />
      </Field>
      <Field label="Platform">
        <PlatformSelect name="platform" />
      </Field>
      <Toggle name="consent" label="Opt-in consent captured" />
    </FormGrid>
  );
}
