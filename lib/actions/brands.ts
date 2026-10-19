"use server";
// Brand CRM actions (BRIEF §3.3, §10): brands, contacts, portal invites, risk review.
import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { canInviteContact, RISK_FLAGS } from "@/lib/rules/campaigns";
import { ok, fail, guard, type ActionResult } from "./result";
import { formObject, parseWith, zBool, zId, zOptText } from "./form-fields";

const zWebsite = z.preprocess((v) => {
  if (typeof v !== "string" || !v.trim()) return null;
  const t = v.trim();
  return /^https?:\/\//.test(t) ? t : `https://${t}`;
}, z.string().url("Enter a valid website").max(300).nullable());

const BrandSchema = z.object({
  name: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(1, "Name required").max(120)),
  website: zWebsite,
  category: z.enum(s.brandCategoryEnum.enumValues),
  ownerTeam: z.enum(s.ownerTeamEnum.enumValues),
  isHouseClient: zBool,
});

export async function createBrand(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeBrands");
    const input = parseWith(BrandSchema, formObject(fd));
    const [dupe] = await db.select({ id: s.brands.id }).from(s.brands).where(eq(s.brands.name, input.name));
    if (dupe) return fail("A brand with that name exists");
    const id = await withUser(me.id, async (tx) => {
      const [row] = await tx.insert(s.brands).values({ ...input, createdBy: me.id }).returning({ id: s.brands.id });
      return row.id;
    });
    revalidatePath("/brands");
    return ok(`Created ${input.name}`, { redirect: `/brands/${id}`, undo: { entity: "brands", id } });
  });
}

export async function updateBrand(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeBrands");
    const input = parseWith(BrandSchema.extend({ id: zId }), formObject(fd));
    const { id, ...values } = input;
    await withUser(me.id, (tx) => tx.update(s.brands).set(values).where(eq(s.brands.id, id)));
    revalidatePath(`/brands/${id}`);
    revalidatePath("/brands");
    return ok("Saved", { undo: { entity: "brands", id } });
  });
}

const ContactSchema = z.object({
  id: z.preprocess((v) => (v ? v : null), zId.nullable()),
  brandId: zId,
  name: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(1, "Name required").max(120)),
  role: zOptText(120),
  email: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim().toLowerCase() : null), z.string().email("Enter a valid email").nullable()),
  phone: zOptText(40),
  isPrimary: zBool,
});

export async function saveContact(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeBrands");
    const input = parseWith(ContactSchema, formObject(fd));
    const { id, brandId, ...values } = input;
    const savedId = await withUser(me.id, async (tx) => {
      let rowId = id;
      if (rowId) {
        const [c] = await tx.select().from(s.brandContacts).where(and(eq(s.brandContacts.id, rowId), eq(s.brandContacts.brandId, brandId)));
        if (!c) throw new Error("Contact not found");
        if (c.portalUserId && values.email !== c.email) throw new Error("This contact has a portal login; their email can't change");
        await tx.update(s.brandContacts).set(values).where(eq(s.brandContacts.id, rowId));
      } else {
        const [row] = await tx.insert(s.brandContacts).values({ brandId, ...values, createdBy: me.id }).returning({ id: s.brandContacts.id });
        rowId = row.id;
      }
      if (values.isPrimary) await tx.update(s.brandContacts).set({ isPrimary: false }).where(and(eq(s.brandContacts.brandId, brandId), ne(s.brandContacts.id, rowId!)));
      return rowId!;
    });
    revalidatePath(`/brands/${brandId}`);
    return ok(id ? "Contact saved" : `Added ${values.name}`, { undo: { entity: "brand_contacts", id: savedId } });
  });
}

export async function archiveContact(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeBrands");
    const input = parseWith(z.object({ id: zId }), formObject(fd));
    const [c] = await db.select().from(s.brandContacts).where(eq(s.brandContacts.id, input.id));
    if (!c) return fail("Contact not found");
    await withUser(me.id, async (tx) => {
      await tx.update(s.brandContacts).set({ archivedAt: new Date() }).where(eq(s.brandContacts.id, c.id));
      // Removing a contact ends their portal access.
      if (c.portalUserId) await tx.update(s.users).set({ active: false }).where(eq(s.users.id, c.portalUserId));
    });
    revalidatePath(`/brands/${c.brandId}`);
    return ok(`Removed ${c.name}`, c.portalUserId ? {} : { undo: { entity: "brand_contacts", id: c.id } });
  });
}

/** Invite to brand portal → a brand_user scoped to this brand and contact. */
export async function inviteContact(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeBrands");
    const input = parseWith(z.object({ id: zId }), formObject(fd));
    const [c] = await db.select().from(s.brandContacts).where(eq(s.brandContacts.id, input.id));
    if (!c || c.archivedAt) return fail("Contact not found");
    const g = canInviteContact(c);
    if (!g.ok) return fail(g.reasons[0]);
    const email = c.email!.toLowerCase();
    const [existing] = await db.select().from(s.users).where(eq(s.users.email, email));
    if (existing && !(existing.role === "brand_user" && existing.brandId === c.brandId)) return fail("That email already has another login");
    await withUser(me.id, async (tx) => {
      let userId = existing?.id;
      if (existing) await tx.update(s.users).set({ active: true, brandContactId: c.id }).where(eq(s.users.id, existing.id));
      else {
        const [u] = await tx.insert(s.users).values({ email, name: c.name, role: "brand_user", brandId: c.brandId, brandContactId: c.id }).returning({ id: s.users.id });
        userId = u.id;
      }
      await tx.update(s.brandContacts).set({ portalUserId: userId }).where(eq(s.brandContacts.id, c.id));
    });
    revalidatePath(`/brands/${c.brandId}`);
    return ok(`Invited ${c.name} — they sign in with ${email}`);
  });
}

const FLAG_KEYS = RISK_FLAGS.map((f) => f.key) as [string, ...string[]];

/** Risk review: flags checklist + note; "Mark reviewed" stamps reviewed at/by (deals need one in the last 180 days). */
export async function markRiskReviewed(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeBrands");
    const input = parseWith(z.object({ id: zId, flags: z.array(z.enum(FLAG_KEYS)), note: zOptText(1000) }), { ...formObject(fd), flags: fd.getAll("flags") });
    await withUser(me.id, (tx) =>
      tx.update(s.brands).set({ riskFlags: input.flags, riskNote: input.note, riskReviewedAt: new Date(), riskReviewedBy: me.id }).where(eq(s.brands.id, input.id)),
    );
    revalidatePath(`/brands/${input.id}`);
    revalidatePath("/brands");
    return ok(input.flags.length ? `Reviewed · ${input.flags.length} flag${input.flags.length > 1 ? "s" : ""}` : "Reviewed · no flags", { undo: { entity: "brands", id: input.id } });
  });
}
