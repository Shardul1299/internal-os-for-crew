// Brand portal (BRIEF §1 Brand user, §10): campaigns, claim approvals, reports, invoices, feedback.
// brand_user only; every query below is scoped by the session's brandId.
import { redirect } from "next/navigation";
import { requireMe, homeFor } from "@/lib/session";
import { Shell } from "@/components/shell/Shell";
import { portalBrand, portalCounts } from "@/lib/queries/brand-portal";
import type { Command } from "@/components/ui/client";

export default async function BrandPortalLayout({ children }: { children: React.ReactNode }) {
  const me = await requireMe();
  if (me.role !== "brand_user" || !me.brandId) redirect(homeFor(me.role) === "/brand" ? "/signin" : homeFor(me.role));
  const [brand, counts] = await Promise.all([portalBrand(me.brandId), portalCounts(me.brandId)]);
  if (!brand) redirect("/signin");
  const items = [
    { href: "/brand/campaigns", label: "Campaigns" },
    { href: "/brand/approvals", label: "Approvals", count: counts.approvals || undefined, alert: counts.approvals > 0 },
    { href: "/brand/reports", label: "Reports" },
    { href: "/brand/invoices", label: "Invoices" },
    { href: "/brand/feedback", label: "Feedback", count: counts.feedback || undefined, alert: counts.feedback > 0 },
  ];
  const commands: Command[] = items.map((i) => ({ id: i.href, label: i.label, group: "Go to", href: i.href }));
  return (
    <Shell items={items} user={me.name} role={brand.name} commands={commands} brand="Crew">
      {children}
    </Shell>
  );
}
