import { Field, FormGrid, Input, Select, Toggle } from "@/components/ui";

export const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  crew_lead: "Crew lead",
  ops: "Ops",
  strategist: "Strategist",
  intern: "Intern",
  sales_viewer: "Sales viewer",
  finance_viewer: "Finance viewer",
  program_counterpart: "Program counterpart",
  brand_user: "Brand user",
  creator_user: "Creator user",
};

type Scope = {
  brands: { id: string; name: string }[];
  creators: { id: string; name: string; stage: string }[];
  cohorts: { id: string; label: string }[];
  contacts: { id: string; name: string; brandId: string }[];
};

export function UserFields({
  user,
  scope,
  actorRole,
}: {
  user?: { id: string; email: string | null; name: string | null; role: string; brandId: string | null; brandContactId: string | null; creatorId: string | null; cohortIds: string[] | null } | null;
  scope: Scope;
  actorRole: string;
}) {
  const brandName = new Map(scope.brands.map((b) => [b.id, b.name]));
  const roles = Object.entries(ROLE_LABEL).filter(([k]) => k !== "owner" || actorRole === "owner" || user?.role === "owner");
  return (
    <FormGrid>
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      {user ? null : (
        <Field label="Email">
          <Input type="email" name="email" required />
        </Field>
      )}
      <Field label="Name">
        <Input name="name" required defaultValue={user?.name ?? ""} />
      </Field>
      <Field label="Role">
        <Select name="role" defaultValue={user?.role ?? "intern"}>
          {roles.map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Brand" hint="Brand users only.">
        <Select name="brandId" defaultValue={user?.brandId ?? ""}>
          <option value="">—</option>
          {scope.brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Brand contact">
        <Select name="brandContactId" defaultValue={user?.brandContactId ?? ""}>
          <option value="">—</option>
          {scope.contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {brandName.get(c.brandId) ?? "—"} · {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Creator" hint="Creator users only.">
        <Select name="creatorId" defaultValue={user?.creatorId ?? ""}>
          <option value="">—</option>
          {scope.creators.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.stage}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Cohorts" hint="Program counterparts only.">
        <span className="block">
          {scope.cohorts.length ? (
            scope.cohorts.map((c) => <Toggle key={c.id} name="cohortIds" value={c.id} label={c.label} defaultChecked={user?.cohortIds?.includes(c.id) ?? false} />)
          ) : (
            <span className="t-caption block pt-2">No cohorts yet.</span>
          )}
        </span>
      </Field>
    </FormGrid>
  );
}
