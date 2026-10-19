// Auth.js (BRIEF §14): magic link + role claims. Portal users are scoped by brand / creator id.
// Only people already in `users` (invited from Settings, Brands or Creators) can sign in.
import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { createTransport } from "nodemailer";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens, devMail } from "@/lib/db/schema";

const devLogin = process.env.DEV_LOGIN === "1" && process.env.NODE_ENV !== "production" || process.env.DEV_LOGIN === "force";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }),
  session: { strategy: "jwt", maxAge: 30 * 24 * 3600 },
  pages: { signIn: "/signin", verifyRequest: "/signin/check", error: "/signin" },
  trustHost: true,
  providers: [
    Nodemailer({
      server: process.env.EMAIL_SERVER || { host: "localhost", port: 25 },
      from: process.env.EMAIL_FROM || "Snoball OS <os@crew.example>",
      async sendVerificationRequest({ identifier, url, provider }) {
        if (!process.env.EMAIL_SERVER) {
          // No SMTP configured: keep the link in the dev mailbox and the server log.
          await db.insert(devMail).values({ to: identifier, subject: "Sign in to Snoball OS", url });
          console.log(`[auth] magic link for ${identifier}: ${url}`);
          return;
        }
        const transport = createTransport(provider.server);
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: "Sign in to Snoball OS",
          text: `Sign in to Snoball OS:\n${url}\n\nThe link works once and expires in 24 hours.`,
          html: `<p style="font-family:-apple-system,Arial,sans-serif">Sign in to Snoball OS.</p><p><a href="${url}">Sign in</a></p><p style="color:#8C8370">The link works once and expires in 24 hours.</p>`,
        });
      },
    }),
    ...(devLogin
      ? [
          Credentials({
            id: "dev",
            name: "Development",
            credentials: { email: {} },
            async authorize(creds) {
              const email = String(creds?.email ?? "").toLowerCase();
              const [u] = await db.select().from(users).where(eq(users.email, email));
              return u && u.active ? { id: u.id, email: u.email, name: u.name } : null;
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "dev") return true;
      const email = (user.email ?? "").toLowerCase();
      if (!email) return false;
      const [u] = await db.select({ active: users.active }).from(users).where(eq(users.email, email));
      return !!u?.active;
    },
    async jwt({ token, user }) {
      const id = (user?.id ?? token.sub) as string | undefined;
      if (!id) return token;
      // Re-read the role on every check so role and scope changes apply immediately.
      const [u] = await db.select().from(users).where(eq(users.id, id));
      if (!u || !u.active) return { ...token, revoked: true };
      return { ...token, sub: u.id, role: u.role, creatorId: u.creatorId, brandId: u.brandId, brandContactId: u.brandContactId, cohortIds: u.cohortIds ?? [], name: u.name, email: u.email };
    },
    async session({ session, token }) {
      const t = token as Record<string, unknown>;
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub!,
          role: t.revoked ? null : (t.role as string),
          creatorId: (t.creatorId as string) ?? null,
          brandId: (t.brandId as string) ?? null,
          brandContactId: (t.brandContactId as string) ?? null,
          cohortIds: (t.cohortIds as string[]) ?? [],
        },
      };
    },
  },
});
