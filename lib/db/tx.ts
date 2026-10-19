import "server-only";
import { sql as dsql } from "drizzle-orm";
import { db } from "./index";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Runs writes in a transaction that tags the audit trigger with the acting user (§14). */
export async function withUser<T>(userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(dsql`select set_config('app.user_id', ${userId}, true)`);
    return fn(tx);
  });
}
