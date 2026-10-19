"use client";
// Section tabs for Settings — the segmented-control look, driven by the path (/settings/<section>).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui";

export const SETTINGS_SECTIONS = [
  { key: "ladder", label: "Ladder" },
  { key: "deliverables", label: "Deliverables" },
  { key: "addons", label: "Add-ons" },
  { key: "filter", label: "Filter" },
  { key: "nolist", label: "NO list" },
  { key: "commission", label: "Commission" },
  { key: "numbers", label: "Numbers" },
  { key: "templates", label: "Templates" },
  { key: "users", label: "Users" },
  { key: "ai", label: "AI" },
  { key: "audit", label: "Audit" },
  { key: "data", label: "Import / export" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings sections" className="px-5 py-3 border-b border-rule no-print">
      <div role="tablist" className="inline-flex bg-block p-0.5 gap-0.5 max-w-full overflow-x-auto">
        {SETTINGS_SECTIONS.map((s) => {
          const active = pathname === `/settings/${s.key}` || pathname.startsWith(`/settings/${s.key}/`);
          return (
            <Link
              key={s.key}
              href={`/settings/${s.key}`}
              role="tab"
              aria-selected={active}
              className={cx("px-3 h-7 whitespace-nowrap inline-flex items-center", active ? "bg-head-bg text-head-fg font-semibold" : "text-fg-2 hover:text-fg")}
            >
              {s.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
