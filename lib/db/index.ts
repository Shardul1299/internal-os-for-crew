import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");

declare global {
  var __snoballSql: ReturnType<typeof postgres> | undefined;
}

const isLocal = /localhost|127\.0\.0\.1/.test(url);
export const sql =
  globalThis.__snoballSql ?? postgres(url, { ssl: isLocal ? false : "require", prepare: false, max: isLocal ? 10 : 5 });
if (process.env.NODE_ENV !== "production") globalThis.__snoballSql = sql;

export const db = drizzle(sql, { schema, casing: "snake_case" });
export type DB = typeof db;
export { schema };
