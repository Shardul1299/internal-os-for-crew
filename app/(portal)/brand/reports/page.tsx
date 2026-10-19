import { requireMe } from "@/lib/session";
import { portalReports } from "@/lib/queries/brand-portal";
import { ScreenHeader, Section, EmptyState, Markdown, Caption } from "@/components/ui";
import { CredibilityStats } from "@/components/campaigns/CredibilityStats";
import { date } from "@/lib/format";

export const metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const me = await requireMe();
  const rows = await portalReports(me.brandId!);
  return (
    <>
      <ScreenHeader title="Reports" />
      {rows.length === 0 ? (
        <EmptyState>Reports appear when a campaign wraps.</EmptyState>
      ) : (
        rows.map((r) => (
          <div key={r.id} className="border-b border-rule">
            <Section title={r.name} aside={r.reportedAt ? date(r.reportedAt) : undefined}>
              <CredibilityStats c={r.credibility} />
            </Section>
            <Section>
              <div className="max-w-3xl">
                <Markdown source={r.reportMd} />
                {r.reportUrl ? (
                  <a href={r.reportUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    Open full report
                  </a>
                ) : null}
              </div>
              {r.posts.length ? (
                <Caption className="mt-3">
                  {r.posts.map((p, i) => (
                    <span key={p.id}>
                      {i ? " · " : ""}
                      {p.liveUrl ? (
                        <a href={p.liveUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                          {p.title}
                        </a>
                      ) : (
                        p.title
                      )}
                    </span>
                  ))}
                </Caption>
              ) : null}
            </Section>
          </div>
        ))
      )}
    </>
  );
}
