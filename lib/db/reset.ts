import "./env";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
await sql.unsafe("DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;");
await sql.end();
console.log("database reset");
