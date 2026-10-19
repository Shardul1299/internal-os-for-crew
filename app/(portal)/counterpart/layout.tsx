// LIT counterpart view (§1, §7.8): program_counterpart only, scoped by the user's cohortIds.
import { redirect } from "next/navigation";
import { requireMe, homeFor } from "@/lib/session";
import { Shell } from "@/components/shell/Shell";

export default async function CounterpartLayout({ children }: { children: React.ReactNode }) {
  const me = await requireMe();
  if (me.role !== "program_counterpart") redirect(homeFor(me.role));
  return (
    <Shell
      items={[{ href: "/counterpart", label: "Students" }]}
      user={me.name}
      role={me.role}
      brand="Owled Program"
      commands={[{ id: "/counterpart", label: "Students", group: "Go to", href: "/counterpart" }]}
    >
      {children}
    </Shell>
  );
}
