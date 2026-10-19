import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendMagicLink, devSignIn } from "@/lib/actions/auth";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { Input } from "@/components/ui";

export const metadata = { title: "Sign in" };

const devEnabled = (process.env.DEV_LOGIN === "1" && process.env.NODE_ENV !== "production") || process.env.DEV_LOGIN === "force";

export default async function SignIn({ searchParams }: { searchParams: Promise<{ from?: string; error?: string }> }) {
  const { from, error } = await searchParams;
  const devUsers = devEnabled
    ? await db
        .select({ email: users.email, name: users.name, role: users.role })
        .from(users)
        .where(inArray(users.role, ["owner", "crew_lead", "ops", "strategist", "intern", "sales_viewer", "finance_viewer", "brand_user", "creator_user", "program_counterpart"]))
        .orderBy(users.role)
    : [];
  return (
    <main className="min-h-screen grid lg:grid-cols-[1fr_440px]">
      <section className="hidden lg:flex flex-col justify-between p-10 border-r border-rule">
        <div className="t-label">Crew by OWLED</div>
        <div>
          <h1 className="t-display title-in text-[clamp(64px,9vw,148px)] leading-[0.84] text-fg">
            Snoball
            <br />
            OS
          </h1>
          <p className="mt-6 max-w-[40ch] text-fg-2 t-headline font-normal">The right thing by default. The wrong thing impossible.</p>
        </div>
        <div className="flex gap-1">
          <span className="w-10 h-10 bg-head-bg" />
          <span className="w-10 h-10 bg-block" />
          <span className="w-10 h-10 bg-pink" />
        </div>
      </section>
      <section className="flex flex-col justify-center px-6 py-12 sm:px-10">
        <h2 className="t-title lg:hidden mb-6">Snoball OS</h2>
        <h2 className="t-headline mb-1">Sign in</h2>
        <p className="t-caption mb-5">We email you a one-time link.</p>
        <ActionForm action={sendMagicLink} className="space-y-3">
          <input type="hidden" name="from" value={from ?? "/"} />
          <Input name="email" type="email" placeholder="you@crew.example" autoComplete="email" required aria-label="Email" />
          <SubmitButton pendingLabel="Sending…">Email me a link</SubmitButton>
        </ActionForm>
        {error ? <p className="t-caption text-pink-fg mt-3">That link didn&apos;t work. Ask for a new one.</p> : null}
        {devEnabled ? (
          <div className="mt-10">
            <div className="t-label mb-2">Development — sign in as</div>
            <div className="border-t border-rule">
              {devUsers.map((u) => (
                <form key={u.email} action={devSignIn}>
                  <input type="hidden" name="email" value={u.email ?? ""} />
                  <button className="w-full h-9 px-2 flex items-center justify-between border-b border-rule hover:bg-raised text-left">
                    <span>{u.name}</span>
                    <span className="t-caption">{u.role.replace("_", " ")}</span>
                  </button>
                </form>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
