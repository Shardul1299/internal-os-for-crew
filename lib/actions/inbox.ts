"use server";
// Inbox actions (BRIEF §6): capture, identify, pre-screen, reply, convert, decline, forward.
// Communication only — Crew replies on the creator's behalf and never touches creator accounts.
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { withUser } from "@/lib/db/tx";
import { actor } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import { slaDueAt, canConvert, canForward, conversionDefaults, NO_LIST_KEYS } from "@/lib/rules/inbox";
import { noListPassed, type NoListToggles } from "@/lib/rules/deals";
import { ok, fail, guard, type ActionResult } from "./result";
import { formObject, parseWith, zBool, zId, zOptText } from "./form-fields";

async function load(id: string) {
  const [t] = await db.select().from(s.inboxThreads).where(eq(s.inboxThreads.id, id));
  if (!t || t.archivedAt) throw new Error("Thread not found");
  return t;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function done(_id?: string) {
  revalidatePath("/inbox");
  revalidatePath("/today");
}

/** "2026-10-19T10:30" from a datetime-local field is Asia/Kolkata time. */
function parseIst(v: string): Date {
  const d = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(v) ? v : `${v.length === 16 ? `${v}:00` : v}+05:30`);
  if (Number.isNaN(d.getTime())) throw new Error("Check received at");
  return d;
}

const CaptureSchema = z.object({
  channel: z.enum(s.inboxChannelEnum.enumValues),
  fromName: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(1, "From is required").max(200)),
  fromAddress: zOptText(200),
  creatorId: z.preprocess((v) => (v ? v : null), zId.nullable()),
  subject: zOptText(300),
  body: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(1, "Paste the message").max(20000)),
  receivedAt: z.preprocess((v) => (typeof v === "string" && v ? v : null), z.string().nullable()),
});

/** Capture: paste an email or DM. SLA = received + inbox_sla_hours. */
export async function captureThread(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("inbox");
    const input = parseWith(CaptureSchema, formObject(fd));
    const cfg = await getConfig();
    const receivedAt = input.receivedAt ? parseIst(input.receivedAt) : new Date();
    if (receivedAt.getTime() > Date.now() + 5 * 60_000) return fail("Received at is in the future");
    const id = await withUser(me.id, async (tx) => {
      const [row] = await tx
        .insert(s.inboxThreads)
        .values({
          channel: input.channel,
          fromName: input.fromName,
          fromAddress: input.fromAddress,
          creatorId: input.creatorId,
          subject: input.subject ?? "",
          firstMessageMd: input.body,
          receivedAt,
          slaDueAt: slaDueAt(cfg, receivedAt),
          status: "new",
          createdBy: me.id,
        })
        .returning({ id: s.inboxThreads.id });
      return row.id;
    });
    done();
    return ok("Captured", { redirect: `/inbox?sel=${id}`, undo: { entity: "inbox_threads", id } });
  });
}

/** Identify: link an existing brand or create one by name. */
export async function identifyBrand(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("inbox");
    const input = parseWith(z.object({ id: zId, brandId: z.preprocess((v) => (v ? v : null), zId.nullable()), newBrand: zOptText(120) }), formObject(fd));
    const t = await load(input.id);
    if (!input.brandId && !input.newBrand) return fail("Pick a brand or type a new name");
    let brandName = "";
    await withUser(me.id, async (tx) => {
      let brandId = input.brandId;
      if (!brandId) {
        const [existing] = await tx.select().from(s.brands).where(eq(s.brands.name, input.newBrand!));
        if (existing) brandId = existing.id;
        else {
          const [b] = await tx.insert(s.brands).values({ name: input.newBrand!, createdBy: me.id }).returning({ id: s.brands.id });
          brandId = b.id;
        }
        brandName = input.newBrand!;
      } else {
        const [b] = await tx.select({ name: s.brands.name }).from(s.brands).where(eq(s.brands.id, brandId));
        if (!b) throw new Error("Brand not found");
        brandName = b.name;
      }
      await tx
        .update(s.inboxThreads)
        .set({ brandId, status: t.status === "new" ? "triaged" : t.status, handledBy: me.id })
        .where(eq(s.inboxThreads.id, t.id));
    });
    done(t.id);
    revalidatePath("/brands");
    return ok(`Identified ${brandName}`, { undo: { entity: "inbox_threads", id: t.id } });
  });
}

/** Pre-screen: the five NO-list toggles + blocklist. Stored on the thread and carried into the deal on convert. */
export async function prescreenThread(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("inbox");
    const cfg = await getConfig();
    const shape = Object.fromEntries(NO_LIST_KEYS.map((k) => [k, zBool]));
    const input = parseWith(
      z.object({ id: zId, ...shape, blocklist_category: z.preprocess((v) => (v ? v : null), z.string().refine((k) => cfg.blocklist.some((b) => b.key === k), "Unknown blocklist category").nullable()) }),
      formObject(fd),
    );
    const t = await load(input.id);
    const raw = input as Record<string, unknown>;
    const pre: Record<string, boolean | string | null> = Object.fromEntries(NO_LIST_KEYS.map((k) => [k, raw[k] === true]));
    pre.blocklist_category = input.blocklist_category;
    const flagged = NO_LIST_KEYS.some((k) => pre[k]) || !!input.blocklist_category;
    await withUser(me.id, (tx) =>
      tx
        .update(s.inboxThreads)
        .set({ noListPrescreen: pre as Record<string, boolean>, status: t.status === "new" ? "triaged" : t.status, handledBy: me.id })
        .where(eq(s.inboxThreads.id, t.id)),
    );
    done(t.id);
    return ok(flagged ? "Pre-screened · flagged — decline or get an Owner override" : "Pre-screened · clear", { undo: { entity: "inbox_threads", id: t.id } });
  });
}

/** Reply: Crew replies on the creator's behalf; marks the thread replied. */
export async function replyThread(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("inbox");
    const input = parseWith(z.object({ id: zId, replyMd: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(1, "Write the reply").max(10000)) }), formObject(fd));
    const t = await load(input.id);
    if (t.status === "declined" || t.status === "spam") return fail("Thread is closed");
    await withUser(me.id, (tx) =>
      tx
        .update(s.inboxThreads)
        .set({ replyMd: input.replyMd, repliedAt: new Date(), status: t.status === "converted" ? "converted" : "replied", handledBy: me.id })
        .where(eq(s.inboxThreads.id, t.id)),
    );
    done(t.id);
    return ok("Replied", { undo: { entity: "inbox_threads", id: t.id } });
  });
}

/** Convert: a `lead` deal — creator_inbound + originating creator when addressed to a creator, else crew_originated. */
export async function convertThread(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");
    const input = parseWith(z.object({ id: zId, title: zOptText(200) }), formObject(fd));
    const cfg = await getConfig();
    const t = await load(input.id);
    const g = canConvert(t);
    if (!g.ok) return fail(g.reasons[0]);
    const [brand] = await db.select().from(s.brands).where(eq(s.brands.id, t.brandId!));
    const def = conversionDefaults(t);
    const pre = (t.noListPrescreen ?? {}) as Record<string, boolean | string | null>;
    const toggles: NoListToggles = {
      rev_share_only: pre.rev_share_only === true,
      no_budget_educational: pre.no_budget_educational === true,
      barter: pre.barter === true,
      lifetime_rights: pre.lifetime_rights === true,
      shady_tool: pre.shady_tool === true,
      blocklist_category: typeof pre.blocklist_category === "string" ? pre.blocklist_category : null,
    };
    const dealId = await withUser(me.id, async (tx) => {
      const [deal] = await tx
        .insert(s.deals)
        .values({
          brandId: brand.id,
          title: input.title ?? `${brand.name} — ${t.subject || "inbound"}`,
          ownerUserId: me.id,
          stage: "lead",
          origin: def.origin,
          originatingCreatorId: def.originatingCreatorId,
          commissionPct: cfg.commission[def.origin],
          briefMd: null,
          // Prefilled from the pre-screen; any flag still blocks Qualify unless the Owner overrides.
          noListCheck: { ...toggles, passed: noListPassed(toggles, false), checked_at: new Date().toISOString(), checked_by: me.id },
          createdBy: me.id,
        })
        .returning({ id: s.deals.id });
      if (def.originatingCreatorId) await tx.insert(s.dealCreators).values({ dealId: deal.id, creatorId: def.originatingCreatorId, role: "primary", status: "proposed", createdBy: me.id });
      await tx.insert(s.dealActivity).values({
        dealId: deal.id,
        by: me.id,
        kind: "email",
        bodyMd: `Converted from inbox (${t.channel.replace(/_/g, " ")}) — ${t.fromName ?? "unknown sender"}: ${t.subject || t.firstMessageMd.slice(0, 120)}`,
        createdBy: me.id,
      });
      await tx.update(s.inboxThreads).set({ status: "converted", dealId: deal.id, handledBy: me.id }).where(eq(s.inboxThreads.id, t.id));
      return deal.id;
    });
    done(t.id);
    revalidatePath("/deals");
    return ok(def.origin === "creator_inbound" ? "Converted · creator-inbound lead" : "Converted · lead", { data: { dealId } });
  });
}

/** Decline with the inbox_decline template (edited before sending). */
export async function declineThread(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("inbox");
    const input = parseWith(z.object({ id: zId, replyMd: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(1, "Write the decline").max(10000)) }), formObject(fd));
    const t = await load(input.id);
    if (t.status === "converted") return fail("Already converted to a deal");
    await withUser(me.id, (tx) =>
      tx.update(s.inboxThreads).set({ replyMd: input.replyMd, repliedAt: new Date(), status: "declined", handledBy: me.id }).where(eq(s.inboxThreads.id, t.id)),
    );
    done(t.id);
    return ok("Declined", { undo: { entity: "inbox_threads", id: t.id } });
  });
}

/** Forward to creator: visible in Creator Studio with Crew's reply. */
export async function forwardThread(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("inbox");
    const input = parseWith(z.object({ id: zId, unforward: zBool }), formObject(fd));
    const t = await load(input.id);
    const g = canForward(t);
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, (tx) =>
      tx
        .update(s.inboxThreads)
        .set({ forwardedToCreatorAt: input.unforward ? null : new Date(), handledBy: me.id })
        .where(eq(s.inboxThreads.id, t.id)),
    );
    done(t.id);
    revalidatePath("/studio", "layout");
    return ok(input.unforward ? "Unforwarded" : "Forwarded to creator", { undo: { entity: "inbox_threads", id: t.id } });
  });
}
