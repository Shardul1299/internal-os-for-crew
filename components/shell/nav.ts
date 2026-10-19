export type NavItem = { href: string; label: string; roles: string[]; count?: "inbox" | "today" };

const ALL_CREW = ["owner", "crew_lead", "ops", "strategist", "intern", "sales_viewer", "finance_viewer"];

export const NAV: NavItem[] = [
  { href: "/today", label: "Today", roles: ["owner", "crew_lead", "ops", "strategist", "intern"], count: "today" },
  { href: "/inbox", label: "Inbox", roles: ["owner", "crew_lead", "intern"], count: "inbox" },
  { href: "/creators", label: "Creators", roles: ["owner", "crew_lead", "ops", "strategist", "intern"] },
  { href: "/program", label: "Program", roles: ["owner", "crew_lead", "intern"] },
  { href: "/deals", label: "Deals", roles: ["owner", "crew_lead", "ops", "strategist", "sales_viewer"] },
  { href: "/campaigns", label: "Campaigns", roles: ["owner", "crew_lead", "ops", "strategist"] },
  { href: "/brands", label: "Brands", roles: ["owner", "crew_lead", "ops", "strategist", "sales_viewer"] },
  { href: "/money", label: "Money", roles: ["owner", "crew_lead", "ops", "finance_viewer"] },
  { href: "/reports", label: "Month-end", roles: ["owner", "crew_lead", "finance_viewer"] },
  { href: "/portals", label: "Portals", roles: ["owner", "crew_lead"] },
  { href: "/settings", label: "Settings", roles: ["owner", "crew_lead"] },
];

export function navFor(role: string) {
  return NAV.filter((n) => n.roles.includes(role));
}

export { ALL_CREW };
