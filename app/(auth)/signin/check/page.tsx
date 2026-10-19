import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { devMail } from "@/lib/db/schema";

export const metadata = { title: "Check your email" };
export const dynamic = "force-dynamic";

export default async function Check() {
  const showDev = !process.env.EMAIL_SERVER && process.env.NODE_ENV !== "production";
  const [last] = showDev ? await db.select().from(devMail).orderBy(desc(devMail.createdAt)).limit(1) : [];
  return (
    <main className="min-h-screen flex flex-col justify-center px-6 sm:px-16 max-w-2xl">
      <h1 className="t-display text-[44px] leading-[0.9]">Check your email</h1>
      <p className="mt-3 text-fg-2">The sign-in link works once and expires in 24 hours.</p>
      {last ? (
        <p className="mt-8 t-caption">
          No mail server is set up, so here is the link for {last.to}:{" "}
          <a className="text-pink-fg underline break-all" href={last.url}>
            Sign in
          </a>
        </p>
      ) : null}
    </main>
  );
}
