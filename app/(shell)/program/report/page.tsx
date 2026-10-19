import { notFound, redirect } from "next/navigation";
import { requireCrew } from "@/lib/session";
import { ScreenHeader, Markdown, ButtonLink, Caption } from "@/components/ui";
import { PrintButton } from "@/components/program/PrintButton";
import { getProgramReport, listCohorts } from "@/lib/queries/program";
import { programCan } from "@/lib/rules/program";
import { date } from "@/lib/format";

export const metadata = { title: "Program report" };
export const dynamic = "force-dynamic";

export default async function ProgramReportPage({ searchParams }: { searchParams: Promise<{ cohort?: string }> }) {
  const me = await requireCrew("program");
  if (!programCan(me.role, "cost").ok) redirect("/program");
  const { cohort } = await searchParams;
  const id = cohort ?? (await listCohorts())[0]?.id;
  if (!id) notFound();
  const r = await getProgramReport(id);
  if (!r) notFound();
  return (
    <>
      <ScreenHeader title="Program report" action={<PrintButton label="Print" />}>
        <Caption>
          {r.cohort.batchLabel} · generated {date(r.generatedOn)}
        </Caption>
      </ScreenHeader>
      <div className="px-5 py-4 max-w-[860px]">
        <div className="no-print mb-3">
          <ButtonLink href={`/program?cohort=${id}&tab=report`} size="sm" variant="quiet">
            Back to Program
          </ButtonLink>
        </div>
        <Markdown source={r.md} />
      </div>
    </>
  );
}
