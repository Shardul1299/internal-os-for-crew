import { requireCrew } from "@/lib/session";
import { Shell } from "@/components/shell/Shell";
import { navFor } from "@/components/shell/nav";
import { getNavCounts } from "@/lib/queries/today";
import type { Command } from "@/components/ui/client";

export default async function CrewLayout({ children }: { children: React.ReactNode }) {
  const me = await requireCrew();
  const counts = await getNavCounts();
  const nav = navFor(me.role);
  const items = nav.map((n) => ({
    href: n.href,
    label: n.label,
    count: n.count === "inbox" ? counts.inbox : undefined,
    alert: n.count === "inbox" ? counts.inboxLate : false,
  }));
  const commands: Command[] = [
    ...nav.map((n) => ({ id: n.href, label: n.label, group: "Go to", href: n.href })),
    ...(["owner", "crew_lead", "intern"].includes(me.role) ? [{ id: "new-creator", label: "New creator", group: "Create", href: "/creators?new=1" }] : []),
    ...(["owner", "crew_lead"].includes(me.role)
      ? [
          { id: "new-deal", label: "New deal", group: "Create", href: "/deals?new=1" },
          { id: "new-brand", label: "New brand", group: "Create", href: "/brands?new=1" },
          { id: "calc", label: "Calculator", group: "Create", href: "/deals/calculator", keywords: "quote ladder" },
        ]
      : []),
    ...(["owner", "crew_lead", "intern"].includes(me.role) ? [{ id: "new-thread", label: "Capture brand inbound", group: "Create", href: "/inbox?new=1" }] : []),
  ];
  return (
    <Shell items={items} user={me.name} role={me.role} commands={commands} searchUrl="/api/search">
      {children}
    </Shell>
  );
}
