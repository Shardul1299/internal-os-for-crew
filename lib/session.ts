import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can, ROLE_CAN } from "./rules/visibility";

export type Me = {
  id: string;
  name: string;
  email: string;
  role: string;
  creatorId: string | null;
  brandId: string | null;
  brandContactId: string | null;
  cohortIds: string[];
};

export const CREW_ROLES = ["owner", "crew_lead", "ops", "strategist", "intern", "sales_viewer", "finance_viewer"];

export const getMe = cache(async (): Promise<Me | null> => {
  const s = await auth();
  if (!s?.user?.id || !s.user.role) return null;
  return {
    id: s.user.id,
    name: s.user.name ?? s.user.email ?? "",
    email: s.user.email ?? "",
    role: s.user.role,
    creatorId: s.user.creatorId,
    brandId: s.user.brandId,
    brandContactId: s.user.brandContactId,
    cohortIds: s.user.cohortIds ?? [],
  };
});

export async function requireMe(): Promise<Me> {
  const me = await getMe();
  if (!me) redirect("/signin");
  return me;
}

export async function requireCrew(what?: keyof typeof ROLE_CAN): Promise<Me> {
  const me = await requireMe();
  if (!CREW_ROLES.includes(me.role)) redirect(homeFor(me.role));
  if (what && !can(me.role, what)) redirect("/today");
  return me;
}

export function homeFor(role: string): string {
  if (role === "brand_user") return "/brand";
  if (role === "creator_user") return "/studio";
  if (role === "program_counterpart") return "/counterpart";
  return "/today";
}

/** For server actions: throws instead of redirecting. */
export async function actor(what?: keyof typeof ROLE_CAN): Promise<Me> {
  const me = await getMe();
  if (!me) throw new Error("Sign in again");
  if (what && !can(me.role, what)) throw new Error("Your role can't do that");
  return me;
}
