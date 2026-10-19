import { requireCrew } from "@/lib/session";
import { getToday } from "@/lib/queries/today";
import { ScreenHeader, Section, List, ListRow, EmptyState } from "@/components/ui";
import { KeyRows } from "@/components/ui/client";
import { date } from "@/lib/format";

export const metadata = { title: "Today" };
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const me = await requireCrew();
  const sections = await getToday(me.role);
  const total = sections.reduce((t, s) => t + s.rows.length, 0);
  const alerts = sections.reduce((t, s) => t + s.rows.filter((r) => r.alert).length, 0);
  const visible = sections.filter((s) => s.rows.length);
  return (
    <>
      <ScreenHeader title="Today" number={alerts || undefined} numberCaption={alerts ? (alerts === 1 ? "needs you now" : "need you now") : undefined}>
        <span className="t-caption">{date(new Date(), "EEEE, d MMMM")}</span>
      </ScreenHeader>
      {total === 0 ? (
        <EmptyState>Nothing needs you today.</EmptyState>
      ) : (
        <KeyRows>
          {visible.map((s) => (
            <Section key={s.key} title={s.title} aside={String(s.rows.length)} flush className="pb-2">
              <List>
                {s.rows.map((r) => (
                  <ListRow key={r.id} href={r.href} lead={r.lead} title={r.title} meta={r.meta} tone={r.alert ? "alert" : undefined} />
                ))}
              </List>
            </Section>
          ))}
        </KeyRows>
      )}
    </>
  );
}
