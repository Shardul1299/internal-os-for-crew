// Shared Zod pieces and revalidation for the Studio server actions (not a server-action module).
import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as s from "@/lib/db/schema";
import type { Tx } from "@/lib/db/tx";
import type { StudioCtx } from "@/lib/queries/studio";

export const text = (max = 2000) => z.string().trim().max(max).default("");
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
export const optDate = z.union([isoDate, z.literal("")]).default("");
export const uuid = z.string().uuid();
export const optUuid = z.union([z.string().uuid(), z.literal("")]).default("");
export const count = z.coerce.number().int().min(0).max(2_000_000_000).default(0);
export const optCount = z.union([z.literal(""), z.coerce.number().int().min(0).max(2_000_000_000)]).default("").transform((v) => (v === "" ? null : v));
export const pillar = z.enum(["authority", "journey"]);
export const bucket = z.enum(["proven", "double_down", "experimental"]);
export const contentType = z.enum(["educational", "storytelling", "authority", "other"]);
export const ctaType = z.enum(["follow", "engagement", "manychat", "none"]);
export const funnel = z.enum(["tofu", "mofu", "bofu"]);
export const effort = z.enum(["low", "default", "high"]);
export const studioStatus = z.enum(["idea", "researched", "scripted", "filmed", "edited", "posted"]);
export const scriptStatus = z.enum(["draft", "ready", "filmed", "posted"]);
export const url = z.union([z.literal(""), z.string().trim().url("Enter a full URL").max(500)]).default("");

/** FormData → plain object; repeated keys become arrays only where asked. */
export function formObject(fd: FormData, arrays: string[] = []) {
  const o: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (k.startsWith("$ACTION")) continue;
    if (arrays.includes(k)) {
      const arr = (o[k] as string[] | undefined) ?? [];
      arr.push(String(v));
      o[k] = arr;
    } else o[k] = typeof v === "string" ? v.replace(/\r\n?/g, "\n") : "";
  }
  for (const k of arrays) o[k] ??= [];
  return o;
}

export function list(v: string): string[] {
  return v
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function firstIssue(e: unknown): string {
  if (e instanceof z.ZodError) {
    const i = e.issues[0];
    return i ? `${i.path.length ? `${String(i.path[0])}: ` : ""}${i.message}` : "Check the form";
  }
  return e instanceof Error ? e.message : "Something went wrong";
}

/** Parses with Zod and throws one readable sentence (guard() turns it into the caption). */
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data);
  if (!r.success) throw new Error(firstIssue(r.error));
  return r.data;
}

export function revalidateStudio(...paths: string[]) {
  for (const p of paths.length ? paths : ["/studio"]) revalidatePath(p, p === "/studio" ? "layout" : "page");
}

/** Clones a global starter row into the creator's bank (clonedFromId) and returns the clone. */
export async function cloneScriptRow(tx: Tx, ctx: StudioCtx, src: typeof s.studioScripts.$inferSelect) {
  const { id, createdAt, updatedAt, archivedAt, creatorId, seedBatch, deliverableId, sharedWithCrew, ...rest } = src;
  void [createdAt, updatedAt, archivedAt, creatorId, seedBatch, deliverableId, sharedWithCrew];
  delete (rest as Record<string, unknown>).readOnly;
  const [row] = await tx.insert(s.studioScripts).values({ ...rest, creatorId: ctx.creatorId, clonedFromId: id, status: "draft", createdBy: ctx.me.id }).returning();
  return row;
}
