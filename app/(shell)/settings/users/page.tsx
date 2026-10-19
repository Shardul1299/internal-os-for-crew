import Link from "next/link";
import { requireCrew } from "@/lib/session";
import { getUsers, scopeOptions } from "@/lib/queries/settings";
import { inviteUser, updateUser, setUserActive } from "@/lib/actions/users";
import { canEditSettings, canDeactivate } from "@/lib/rules/settings";
import { calendarUrl } from "@/lib/calendar";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { UserFields, ROLE_LABEL } from "@/components/settings/UserFields";
import { FormSheet } from "@/components/program/FormSheet";
import { Table, THead, TH, TR, TD, WithInspector, InspectorTitle, Section, Caption, Input, selHref } from "@/components/ui";
import { ActionForm, ActionButton, SubmitButton, KeyRows, CopyButton } from "@/components/ui/client";

export const metadata = { title: "Settings · Users" };
export const dynamic = "force-dynamic";

function scopeLine(u: Awaited<ReturnType<typeof getUsers>>[number]) {
  if (u.role === "brand_user") return u.brandId ? { text: u.brandName ?? "—", href: `/brands/${u.brandId}` } : { text: "No brand" };
  if (u.role === "creator_user") return u.creatorId ? { text: u.creatorName ?? "—", href: `/creators/${u.creatorId}` } : { text: "No creator" };
  if (u.role === "program_counterpart") return { text: u.cohortLabels.length ? u.cohortLabels.join(", ") : "No cohort" };
  return { text: "Crew Desk" };
}

export default async function UserSettings({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireCrew("settings");
  const sp = await searchParams;
  const edit = canEditSettings(me.role, "users").ok;
  const [users, scope] = await Promise.all([getUsers(), scopeOptions()]);
  const sel = users.find((u) => u.id === sp.sel);
  const base = "/settings/users";
  const feed = calendarUrl(me.id);
  return (
    <>
      <SettingsHeader
        caption="Only invited people can sign in."
        action={
          edit ? (
            <FormSheet label="Invite" title="Invite user" action={inviteUser} variant="primary" dataNew submitLabel="Invite" defaultOpen={sp.new === "1"}>
              <UserFields scope={scope} actorRole={me.role} />
            </FormSheet>
          ) : undefined
        }
      />
      <WithInspector
        closeHref={base}
        main={
          <>
            <KeyRows>
              <Table>
                <THead>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>Scope</TH>
                  <TH>Status</TH>
                </THead>
                <tbody>
                  {users.map((u) => {
                    const href = selHref(base, sp, u.id);
                    const sc = scopeLine(u);
                    return (
                      <TR key={u.id} href={href} selected={sel?.id === u.id} className={u.active ? undefined : "text-fg-3"}>
                        <TD href={href}>{u.name ?? "—"}</TD>
                        <TD className="text-fg-2">{u.email}</TD>
                        <TD>{ROLE_LABEL[u.role] ?? u.role}</TD>
                        <TD className="text-fg-2 max-w-[260px] truncate">
                          {sc.href ? (
                            <Link href={sc.href} className="hover:underline underline-offset-2">
                              {sc.text}
                            </Link>
                          ) : (
                            sc.text
                          )}
                        </TD>
                        <TD>{u.active ? "Active" : "Off"}</TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </KeyRows>
            <Section title="Your calendar feed" className="max-w-[760px]">
              <div className="flex gap-2 items-center">
                <Input readOnly value={feed} aria-label="Calendar subscribe URL" className="font-mono text-[12px]" />
                <CopyButton text={feed} label="Copy" />
              </div>
              <Caption className="mt-1">Google Calendar → Other calendars → From URL.</Caption>
            </Section>
          </>
        }
        inspector={
          sel ? (
            <>
              <InspectorTitle sub={sel.email ?? undefined}>{sel.name ?? sel.email}</InspectorTitle>
              {edit ? (
                <>
                  <ActionForm action={updateUser} key={sel.id}>
                    <UserFields user={sel} scope={scope} actorRole={me.role} />
                    <div className="mt-3">
                      <SubmitButton>Save</SubmitButton>
                    </div>
                  </ActionForm>
                  <div className="mt-6 pt-3 border-t border-rule">
                    {sel.active ? (
                      canDeactivate({ actorRole: me.role, actorId: me.id }, { id: sel.id, role: sel.role }).ok ? (
                        <ActionButton action={setUserActive} fields={{ id: sel.id, active: "0" }} variant="danger">
                          Deactivate
                        </ActionButton>
                      ) : (
                        <Caption>{canDeactivate({ actorRole: me.role, actorId: me.id }, { id: sel.id, role: sel.role }).reasons[0]}</Caption>
                      )
                    ) : (
                      <ActionButton action={setUserActive} fields={{ id: sel.id, active: "1" }}>
                        Reactivate
                      </ActionButton>
                    )}
                  </div>
                </>
              ) : null}
            </>
          ) : undefined
        }
      />
    </>
  );
}
