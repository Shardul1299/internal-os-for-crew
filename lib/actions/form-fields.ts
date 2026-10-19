// Zod field helpers for FormData inputs (checkboxes, optional text, numbers).
import { z } from "zod";

export const zBool = z.preprocess((v) => v === "on" || v === "true" || v === "1" || v === true, z.boolean());
export const zText = (max = 2000) => z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().max(max));
export const zOptText = (max = 2000) => z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(max).nullable());
export const zOptInt = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().min(0).nullable());
export const zOptDate = z.preprocess((v) => (typeof v === "string" && v ? v : null), z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable());
export const zOptUrl = z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().url("Enter a full URL").max(500).nullable());
export const zId = z.string().uuid();

export function formObject(fd: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(fd);
}

/** Parses with Zod; the first issue becomes one readable sentence (guard() shows it as the caption). */
export function parseWith<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  const i = r.error.issues[0];
  const field = i?.path?.length ? String(i.path[i.path.length - 1]).replace(/([A-Z])/g, " $1").toLowerCase() : "";
  throw new Error(i ? (i.message.startsWith("Invalid") || i.message.startsWith("Too") ? `Check ${field || "the form"}` : i.message) : "Check the form");
}
