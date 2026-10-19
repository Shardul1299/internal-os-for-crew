import { requireCrew } from "@/lib/session";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireCrew("settings"); // Owner and Crew lead
  return <>{children}</>;
}
