import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCrew } from "@/lib/session";
import { getPortalUsers } from "@/lib/queries/settings";
import { canReadSettings } from "@/lib/rules/settings";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, ButtonLink, Caption } from "@/components/ui";
import { KeyRows } from "@/components/ui/client";
import { STAGE_LABEL, label } from "@/lib/format";

export const metadata = { title: "Portals" };
export const dynamic = "force-dynamic";

function Empty({ children }: { children: string }) {
  return <p className="t-caption px-5 py-2">{children}</p>;
}

// Overview only: invites live on the brand record (Brands) and the creator record (Creators), and in Settings → Users.
export default async function PortalsPage() {
  const me = await requireCrew();
  if (!canReadSettings(me.role)) redirect("/today");
  const { brand, creator, counterpart } = await getPortalUsers();
  const total = brand.length + creator.length + counterpart.length;
  return (
    <>
      <ScreenHeader
        title="Portals"
        number={total}
        numberCaption="portal users"
        action={
          <ButtonLink href="/settings/users?new=1" variant="primary" data-new="">
            Invite
          </ButtonLink>
        }
      >
        <Caption>Scoped views of the same data. No tier, rungs or commission.</Caption>
      </ScreenHeader>
      <KeyRows>
        <Section title="Brand portal" aside={String(brand.length)} flush>
          {brand.length ? (
            <Table>
              <THead>
                <TH>User</TH>
                <TH>Email</TH>
                <TH>Brand</TH>
                <TH>Status</TH>
              </THead>
              <tbody>
                {brand.map((u) => (
                  <TR key={u.id} href={u.brandId ? `/brands/${u.brandId}` : `/settings/users?sel=${u.id}`} className={u.active ? undefined : "text-fg-3"}>
                    <TD href={`/settings/users?sel=${u.id}`}>{u.name ?? "—"}</TD>
                    <TD className="text-fg-2">{u.email}</TD>
                    <TD>{u.brandId ? <Link href={`/brands/${u.brandId}`} className="underline underline-offset-2">{u.brandName ?? "—"}</Link> : "No brand"}</TD>
                    <TD>{u.active ? "Active" : "Off"}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          ) : (
            <Empty>No brand users yet. Invite from a brand record.</Empty>
          )}
        </Section>
        <Section title="Creator portal · Studio" aside={String(creator.length)} flush>
          {creator.length ? (
            <Table>
              <THead>
                <TH>User</TH>
                <TH>Email</TH>
                <TH>Creator</TH>
                <TH>Stage</TH>
                <TH>Status</TH>
              </THead>
              <tbody>
                {creator.map((u) => (
                  <TR key={u.id} href={u.creatorId ? `/creators/${u.creatorId}` : `/settings/users?sel=${u.id}`} className={u.active ? undefined : "text-fg-3"}>
                    <TD href={`/settings/users?sel=${u.id}`}>{u.name ?? "—"}</TD>
                    <TD className="text-fg-2">{u.email}</TD>
                    <TD>{u.creatorId ? <Link href={`/creators/${u.creatorId}`} className="underline underline-offset-2">{u.creatorName ?? "—"}</Link> : "No creator"}</TD>
                    <TD className="text-fg-2">{label(STAGE_LABEL, u.creatorStage)}</TD>
                    <TD>{u.active ? "Active" : "Off"}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          ) : (
            <Empty>No creator users yet. Invite from a creator record.</Empty>
          )}
        </Section>
        <Section title="LIT counterpart" aside={String(counterpart.length)} flush>
          {counterpart.length ? (
            <Table>
              <THead>
                <TH>User</TH>
                <TH>Email</TH>
                <TH>Cohorts</TH>
                <TH>Status</TH>
              </THead>
              <tbody>
                {counterpart.map((u) => (
                  <TR key={u.id} href={`/settings/users?sel=${u.id}`} className={u.active ? undefined : "text-fg-3"}>
                    <TD href={`/settings/users?sel=${u.id}`}>{u.name ?? "—"}</TD>
                    <TD className="text-fg-2">{u.email}</TD>
                    <TD>{u.cohortLabels.join(", ") || "No cohort"}</TD>
                    <TD>{u.active ? "Active" : "Off"}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          ) : (
            <Empty>No counterpart users yet.</Empty>
          )}
        </Section>
      </KeyRows>
    </>
  );
}
