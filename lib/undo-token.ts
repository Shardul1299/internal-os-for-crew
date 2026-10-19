// Signed undo tokens: only an action that offered ⌘Z can be undone, within its window (§13.6).
import { createHmac, timingSafeEqual } from "node:crypto";

const WINDOW_MS = 12_000;
const secret = () => process.env.AUTH_SECRET ?? "snoball-dev";

function sig(entity: string, id: string, exp: number) {
  return createHmac("sha256", secret()).update(`undo:${entity}:${id}:${exp}`).digest("base64url");
}

export function signUndo(entity: string, id: string, now = Date.now()): string {
  const exp = now + WINDOW_MS;
  return `${exp}.${sig(entity, id, exp)}`;
}

export function verifyUndo(entity: string, id: string, token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const [expStr, s] = token.split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < now || !s) return false;
  const want = Buffer.from(sig(entity, id, exp));
  const got = Buffer.from(s);
  return want.length === got.length && timingSafeEqual(want, got);
}
