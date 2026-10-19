"use server";
// Users and roles (§1, §10 Settings → Users & roles). Only invited people can sign in (auth.ts).
// Portal users carry a scope at the query layer: brand → brandId, creator → creatorId, counterpart → cohortIds.
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { ok, fail, guard, type ActionResult } from "./result";
import { parseInput } from "./parse";
import { canEditSettings, canAssignRole, canDeactivate, validateScope } from "@/lib/rules/settings";

const ROLES = s.roleEnum.enumValues;
const optUuid = z
  .string()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v == null || z.uuid().safeParse(v).success, "Pick from the list");

async function usersActor() {
  const me = await actor("settings");
  const g = canEditSettings(me.role, "users");
  if (!g.ok) throw new Error(g.reasons[0]);
  return me;
}

function scopeFor(role: string, input: { brandId: string | null; brandContactId: string | null; creatorId: string | null }, cohortIds: string[]) {
  // Only the scope that fits the role is kept, so a role change never leaves a stale scope behind.
  return {
    brandId: role === "brand_user" ? input.brandId : null,
    brandContactId: role === "brand_user" ? input.brandContactId : null,
    creatorId: role === "creator_user" ? input.creatorId : null,
    cohortIds: role === "program_counterpart" ? cohortIds : null,
  };
}

const InviteSchema = z.object({
  email: z.email("Email looks wrong").transform((v) => v.toLowerCase()),
  name: z.string().trim().min(1, "Name missing"),
  role: z.enum(ROLES),
  brandId: optUuid,
  brandContactId: optUuid,
  creatorId: optUuid,
});

export async function inviteUser(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await usersActor();
    const input = parseInput(InviteSchema, Object.fromEntries(fd));
    const cohortIds = fd.getAll("cohortIds").map(String).filter(Boolean);
    const r = canAssignRole({ actorRole: me.role, actorId: me.id }, { id: null, currentRole: null }, input.role);
    if (!r.ok) return fail(r.reasons[0]);
    const g = validateScope(input.role, { brandId: input.brandId, creatorId: input.creatorId, cohortIds });
    if (!g.ok) return fail(g.reasons[0]);
    const [dup] = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.email, input.email));
    if (dup) return fail("That email already has access");
    await withUser(me.id, (tx) => tx.insert(s.users).values({ email: input.email, name: input.name, role: input.role, active: true, ...scopeFor(input.role, input, cohortIds) }));
    revalidatePath("/settings/users");
    revalidatePath("/portals");
    return ok(`${input.name} invited — they sign in with ${input.email}`);
  });
}

const UpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name missing"),
  role: z.enum(ROLES),
  brandId: optUuid,
  brandContactId: optUuid,
  creatorId: optUuid,
});

export async function updateUser(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await usersActor();
    const input = parseInput(UpdateSchema, Object.fromEntries(fd));
    const cohortIds = fd.getAll("cohortIds").map(String).filter(Boolean);
    const [u] = await db.select().from(s.users).where(eq(s.users.id, input.id));
    if (!u) return fail("User not found");
    const r = canAssignRole({ actorRole: me.role, actorId: me.id }, { id: u.id, currentRole: u.role }, input.role);
    if (!r.ok) return fail(r.reasons[0]);
    const g = validateScope(input.role, { brandId: input.brandId, creatorId: input.creatorId, cohortIds });
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, (tx) => tx.update(s.users).set({ name: input.name, role: input.role, ...scopeFor(input.role, input, cohortIds) }).where(eq(s.users.id, u.id)));
    revalidatePath("/settings/users");
    revalidatePath("/portals");
    return ok(u.role !== input.role ? `${input.name} is now ${input.role.replace(/_/g, " ")}` : "User saved");
  });
}

const ActiveSchema = z.object({ id: z.string().min(1), active: z.enum(["1", "0"]) });

export async function setUserActive(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await usersActor();
    const input = parseInput(ActiveSchema, Object.fromEntries(fd));
    const [u] = await db.select().from(s.users).where(eq(s.users.id, input.id));
    if (!u) return fail("User not found");
    if (input.active === "0") {
      const g = canDeactivate({ actorRole: me.role, actorId: me.id }, { id: u.id, role: u.role });
      if (!g.ok) return fail(g.reasons[0]);
    } else if (u.role === "owner" && me.role !== "owner") return fail("Only the Owner changes an Owner");
    // auth.ts re-reads the user on every request, so deactivation signs them out at once.
    await withUser(me.id, (tx) => tx.update(s.users).set({ active: input.active === "1" }).where(eq(s.users.id, u.id)));
    revalidatePath("/settings/users");
    revalidatePath("/portals");
    return ok(input.active === "1" ? `${u.name ?? u.email} reactivated` : `${u.name ?? u.email} deactivated`);
  });
}
