import { requireCrew } from "@/lib/session";
import { getCalculatorData } from "@/lib/queries/deals";
import { ScreenHeader, ButtonLink, Section } from "@/components/ui";
import { Calculator } from "@/components/deals/Calculator";
import { can } from "@/lib/rules/visibility";

export const metadata = { title: "Calculator" };
export const dynamic = "force-dynamic";

export default async function CalculatorPage() {
  const me = await requireCrew("readDeals");
  const data = await getCalculatorData();
  return (
    <>
      <ScreenHeader
        title="Calculator"
        action={
          can(me.role, "writeDeals") ? (
            <ButtonLink href="/deals?new=1" variant="primary">
              New deal
            </ButtonLink>
          ) : undefined
        }
      >
        <span className="t-caption">Standard × deliverable × rung ± add-ons</span>
      </ScreenHeader>
      <Section>
        <Calculator cfg={data.cfg} creators={data.creators} standards={data.standards} tierDefaults={data.tierDefaults} />
      </Section>
    </>
  );
}
