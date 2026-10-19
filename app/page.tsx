import { redirect } from "next/navigation";
import { getMe, homeFor } from "@/lib/session";

export default async function Root() {
  const me = await getMe();
  redirect(me ? homeFor(me.role) : "/signin");
}
