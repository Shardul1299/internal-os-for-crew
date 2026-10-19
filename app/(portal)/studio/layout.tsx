// Creator Studio shell (BRIEF §19, §10): same shell and tokens as Crew Desk, sidebar + content, no Inspector.
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { Shell } from "@/components/shell/Shell";
import type { Command } from "@/components/ui/client";
import { requireMe, homeFor } from "@/lib/session";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { studioAccess } from "@/lib/rules/studio";
import { STUDIO_NAV } from "@/components/studio/nav";



export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const me = await requireMe();
  if (me.role !== "creator_user") redirect(homeFor(me.role));
  const [c] = me.creatorId
    ? await db.select({ stage: s.creators.stage, consent: s.creators.consentStatus }).from(s.creators).where(and(eq(s.creators.id, me.creatorId), isNull(s.creators.archivedAt)))
    : [];
  const access = c ? studioAccess(c.stage, c.consent) : { content: false, deals: "none" as const };
  const items = access.content ? STUDIO_NAV : [];
  const commands: Command[] = [
    ...items.map((n) => ({ id: n.href, label: n.label, group: "Go to", href: n.href })),
    ...(access.content
      ? [
          { id: "new-item", label: "New calendar item", group: "Create", href: "/studio/calendar?new=1" },
          { id: "new-script", label: "New script", group: "Create", href: "/studio/write?tab=scripts&gen=manual" },
          { id: "new-outlier", label: "Log outlier", group: "Create", href: "/studio/research?new=1" },
          { id: "new-post", label: "Log post", group: "Create", href: "/studio/results?new=1" },
          { id: "batch", label: "Plan next batch", group: "Create", href: "/studio/calendar?view=batch", keywords: "ideation" },
        ]
      : []),
  ];
  return (
    <Shell items={items} user={me.name} role="Creator" commands={commands} brand="Creator Studio">
      {children}
    </Shell>
  );
}
