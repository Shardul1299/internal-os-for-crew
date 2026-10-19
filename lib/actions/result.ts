export type ActionResult =
  | { ok: true; message?: string; undo?: { entity: string; id: string }; redirect?: string; data?: unknown }
  | { ok: false; error: string };

export const ok = (message?: string, extra: Partial<Extract<ActionResult, { ok: true }>> = {}): ActionResult => ({ ok: true, message, ...extra });
export const fail = (error: string): ActionResult => ({ ok: false, error });

/** Wraps an action body: thrown errors become one inline caption. */
export async function guard(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await fn();
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")) throw e;
    const msg = e instanceof Error ? e.message : "Something went wrong";
    return { ok: false, error: msg };
  }
}
