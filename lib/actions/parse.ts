// Zod parsing for server actions: the first issue becomes the one-sentence inline caption.
import { z } from "zod";

export function parseInput<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  const issue = r.error.issues[0];
  const custom = issue?.message && !/^Invalid input|^Invalid option|^Too (small|big)|^Expected/i.test(issue.message);
  const field = issue?.path?.filter((p) => typeof p === "string").join(" ");
  throw new Error(custom ? issue.message : `Check ${field ? field.replace(/([A-Z])/g, " $1").toLowerCase() : "the form"}`);
}
