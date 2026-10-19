import { notFound } from "next/navigation";
import { requireCrew } from "@/lib/session";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Markdown, ButtonLink, EmptyState } from "@/components/ui";
import { PrintDoc } from "@/components/deals/PrintDoc";
import { PrintButton } from "@/components/deals/FormSheet";

export const metadata = { title: "SOW" };
export const dynamic = "force-dynamic";

export default async function SowPrint({ params }: { params: Promise<{ id: string }> }) {
  await requireCrew("readDeals");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [deal] = await db.select({ id: s.deals.id, sowMd: s.deals.sowMd }).from(s.deals).where(eq(s.deals.id, id));
  if (!deal) notFound();
  return (
    <PrintDoc>
      <div className="no-print flex gap-2 mb-6">
        {deal.sowMd ? <PrintButton /> : null}
        <ButtonLink href={`/deals/${deal.id}?step=terms`}>Back</ButtonLink>
      </div>
      {deal.sowMd ? <Markdown source={deal.sowMd} /> : <EmptyState>Generate the SOW in Terms first.</EmptyState>}
    </PrintDoc>
  );
}
