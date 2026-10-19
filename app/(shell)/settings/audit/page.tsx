import { requireCrew } from "@/lib/session";
import { getAuditLog, auditFacets } from "@/lib/queries/settings";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { Table, THead, TH, TR, TD, Select, Button, EmptyState, ButtonLink } from "@/components/ui";
import { dateTime } from "@/lib/format";

export const metadata = { title: "Settings · Audit" };
export const dynamic = "force-dynamic";

export default async function AuditSettings({ searchParams }: { searchParams: Promise<{ entity?: string; user?: string }> }) {
  await requireCrew("settings");
  const sp = await searchParams;
  const [facets, rows] = await Promise.all([auditFacets(), getAuditLog({ entity: sp.entity || undefined, userId: sp.user || undefined, limit: 300 })]);
  return (
    <>
      <SettingsHeader caption="Every write, with who made it. Latest 300." />
      <form method="get" className="px-5 py-3 flex flex-wrap gap-2 items-center border-b border-rule">
        <span className="w-full sm:w-56">
        <Select name="entity" defaultValue={sp.entity ?? ""} aria-label="Entity">
          <option value="">All entities</option>
          {facets.entities.map((e) => (
            <option key={e} value={e}>
              {e.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        </span>
        <span className="w-full sm:w-56">
        <Select name="user" defaultValue={sp.user ?? ""} aria-label="User">
          <option value="">All users</option>
          {facets.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        </span>
        <Button type="submit">Filter</Button>
        {sp.entity || sp.user ? (
          <ButtonLink href="/settings/audit" variant="quiet">
            Clear
          </ButtonLink>
        ) : null}
      </form>
      {rows.length === 0 ? (
        <EmptyState>No changes match.</EmptyState>
      ) : (
        <Table>
          <THead>
            <TH>When</TH>
            <TH>User</TH>
            <TH>Entity</TH>
            <TH>Action</TH>
            <TH>Changes</TH>
          </THead>
          <tbody>
            {rows.map((r) => (
              <TR key={r.id} className="align-top">
                <TD className="whitespace-nowrap text-fg-2 align-top">{dateTime(r.at)}</TD>
                <TD className="whitespace-nowrap align-top">{r.userName ?? <span className="text-fg-3">System</span>}</TD>
                <TD className="whitespace-nowrap align-top">
                  {r.entity.replace(/_/g, " ")}
                  {r.entityId ? <span className="t-caption block">{/^[0-9a-f-]{36}$/.test(r.entityId) ? r.entityId.slice(0, 8) : r.entityId}</span> : null}
                </TD>
                <TD className="align-top">{r.action}</TD>
                <TD className="align-top">
                  <ul className="space-y-0.5">
                    {r.changes.map((c) => (
                      <li key={c.field} className="text-[12px] leading-[16px] break-words">
                        <span className="text-fg-3">{c.field.replace(/_/g, " ")}</span> <span className="text-fg-2">{c.from}</span> → <span>{c.to}</span>
                      </li>
                    ))}
                  </ul>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
