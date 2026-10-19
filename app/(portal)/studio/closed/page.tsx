import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ScreenHeader, EmptyState } from "@/components/ui";
import { requireMe, homeFor } from "@/lib/session";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { studioAccess } from "@/lib/rules/studio";

export const metadata = { title: "Studio" };

export default async function StudioClosed() {
  const me = await requireMe();
  if (me.role !== "creator_user") redirect(homeFor(me.role));
  const [c] = me.creatorId ? await db.select({ stage: s.creators.stage, consent: s.creators.consentStatus }).from(s.creators).where(and(eq(s.creators.id, me.creatorId), isNull(s.creators.archivedAt))) : [];
  if (c && studioAccess(c.stage, c.consent).content) redirect("/studio/today");
  return (
    <>
      <ScreenHeader title="Studio" />
      <EmptyState>Studio isn&apos;t open for this account.</EmptyState>
    </>
  );
}
