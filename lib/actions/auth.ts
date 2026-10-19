"use server";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { ActionResult } from "./result";

export async function sendMagicLink(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email." };
  const [u] = await db.select({ active: users.active }).from(users).where(eq(users.email, email));
  if (!u?.active) return { ok: false, error: "That email isn't invited. Ask the Crew lead for access." };
  try {
    await signIn("nodemailer", { email, redirectTo: String(fd.get("from") || "/"), redirect: true });
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: "Couldn't send the link. Try again." };
    throw e;
  }
  return { ok: true };
}

export async function devSignIn(fd: FormData) {
  await signIn("dev", { email: String(fd.get("email")), redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/signin" });
}
