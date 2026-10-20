# Snoball OS

The internal system of record for **Crew by OWLED**, plus **Creator Studio**, the creator's own content workspace. One app, one database, two sides.

- **Crew Desk** (our side): creators from first sighting to roster, the Filter, tiers, the Owled Creator Program, brand deals and the five-rung ladder, money (50/50, payouts generated from receipts), brand inbound, campaigns, retention, the month-end one-pager.
- **Creator Studio** (creator side): profile, the 8-week calendar, 5× outlier research, hook stacks, scripts, carousels, shoot planning, funnel-matched CTAs and results. It also shows the creator their own deals, payouts, forwarded inbound and check-ins.
- **Brand portal**: claims approvals, reports, invoices, feedback.

`BRIEF.md` is the spec. `CLAUDE.md` holds the rules the software must never weaken. `docs/BUILDING.md` describes how the code is organised.

## Run it locally

Requires Node 20.9+, pnpm 10 and Postgres 16.

```bash
pnpm install
cp .env.example .env.local        # set DATABASE_URL and AUTH_SECRET
pnpm db:migrate                   # schema + audit triggers
pnpm db:seed                      # BRIEF §12 settings, users, Studio starter library
pnpm db:demo                      # optional: fictional demo creators, brands and deals
pnpm dev
```

Open http://localhost:3000. With `DEV_LOGIN=1`, the sign-in page lists every seeded user so you can sign in as any role. Without SMTP (`EMAIL_SERVER`), magic links are printed to the server log and shown on the "Check your email" page in development.

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test        # rules engine: every gate in BRIEF §4, §5 and §19
pnpm e2e         # Playwright acceptance paths (needs a built app and seeded DB)
```

## Deploy

The app is a standard Next.js server plus Postgres 16. On boot it runs migrations and the §12 seed (both idempotent).

### Render (recommended): one Blueprint, web service + managed Postgres
1. Render dashboard → **New → Blueprint** → pick this repo and the branch to deploy. `render.yaml` creates `snoball-db` (Postgres 16) and `snoball-os` (Node 22, Singapore).
2. Render asks for three values:
   - `SEED_OWNER_EMAIL`: Ayush's real email.
   - `SEED_CREW_LEAD_EMAIL`: Shardul's real email.
   - `EMAIL_SERVER`: an SMTP URL, e.g. `smtp://resend:<API_KEY>@smtp.resend.com:587`. Leave it blank for a first look.
   `AUTH_SECRET` and `INBOUND_EMAIL_SECRET` are generated for you.
3. Deploy. Sign in at the service URL with the Owner email. Without `EMAIL_SERVER`, the one-time link is printed in the service's **Logs** (`magic link for …`). Invite everyone else from Settings → Users.

### Any Docker host
```bash
cp .env.example .env   # set AUTH_SECRET, SEED_OWNER_EMAIL, SEED_CREW_LEAD_EMAIL, EMAIL_SERVER, AUTH_URL
docker compose up -d   # app on :3000 with its own Postgres volume
```

### Vercel + Neon/Supabase
Import the repo in Vercel, set the `.env.example` variables (`DATABASE_URL` is the pooled string with `?sslmode=require`), then run `pnpm db:migrate && pnpm db:seed` once against that database from your machine.

Never set `DEV_LOGIN` in production. Demo data (`pnpm db:demo`) is for local use only.

Integrations:
- **Gmail capture**: point a Gmail forwarding rule at `POST /api/inbox/inbound` with the `x-inbound-secret` header set to `INBOUND_EMAIL_SECRET`.
- **Google Calendar**: subscribe to your personal ICS feed from Settings → Users (check-ins, Sunday shoots, Monday pipeline review).
- **AI for Studio**: set the provider and key in Settings → AI (stored encrypted), or via `AI_PROVIDER` / `AI_API_KEY`. Every generator also offers "Copy prompt".
