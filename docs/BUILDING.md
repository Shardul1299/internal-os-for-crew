# Building Snoball OS — conventions

BRIEF.md is the spec. CLAUDE.md holds the rules that must never weaken. This file is how the code is organised.

## Stack
Next.js 16 (App Router, Server Actions, `proxy.ts`), TypeScript strict, Tailwind v4 with the §13 tokens in `app/globals.css`,
Drizzle ORM on Postgres (`lib/db/schema.ts`), Auth.js v5 (magic link + role claims, `auth.ts`), Zod, Radix, Vitest, Playwright.
Read `node_modules/next/dist/docs/` before using a Next API you are unsure of: `params`/`searchParams`/`cookies()` are async.

## Layout
```
app/(auth)/signin            sign-in (magic link; dev sign-in buttons when DEV_LOGIN=1)
app/(shell)/…                Crew Desk — requireCrew() in the layout
app/(portal)/brand/…         Brand portal — brand_user, scoped by brandId
app/(portal)/studio/…        Creator Studio (§19) — creator_user, scoped by creatorId
app/(portal)/counterpart/…   LIT counterpart view — program_counterpart, scoped by cohortIds
components/ui                the closed component set (§13.5) — import from "@/components/ui" (server) or "@/components/ui/client"
components/shell             sidebar, shell
lib/rules/*                  every gate, pure functions, unit-tested in tests/rules
lib/queries/*                read models; facts.ts loads DB rows into rule "facts"
lib/actions/*                server actions ("use server"): Zod → actor() → rules → withUser() → db → revalidatePath
lib/studio/*                 Upcreate playbook: prompts, reference content, AI engine, docx export
lib/format, lib/dates        Indian money formatting (paise), IST dates
```

## Server action pattern
```ts
"use server";
export async function doThing(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await actor("writeDeals");                 // role check (lib/rules/visibility ROLE_CAN)
    const input = Schema.parse(Object.fromEntries(fd));   // Zod
    const cfg = await getConfig();                        // settings, never constants
    const g = canAdvance(cfg, facts, to, today());        // lib/rules — the UI never re-implements a rule
    if (!g.ok) return fail(g.reasons[0]);
    await withUser(me.id, async (tx) => { /* writes */ }); // audit trigger records the user
    revalidatePath("/deals");
    return ok("Moved to Qualified", { undo: { entity: "deals", id } });  // reversible → ⌘Z line
  });
}
```
Forms use `<ActionForm action={doThing}>` + `<SubmitButton>`; errors render as one pink caption.
Reversible actions don't confirm; irreversible ones open a `<Sheet>` with a one-sentence consequence.

## Design rules in practice
- `ScreenHeader` = one title + one primary action + at most one pink number. `Section` for titled regions.
- Tables: `Table/THead/TH/TR/TD`; numbers right-aligned; wrap in `KeyRows` for J/K + Enter; rows with `href` open the record.
- Inspector: `WithInspector main inspector closeHref`; selection in `?sel=id`.
- Pink only via `variant="primary"` buttons, `Alert`, `tone="alert"`, the active rung, and the header number.
- No badges, no shadows, no rounded corners, no icon-only buttons except close/search/more, no helper paragraphs.
- Copy: verbs on buttons, one-word statuses, one-sentence blockers, captions ≤ 12 words, sentence case.
- Money in paise; show with `money()` / `moneyShort()`; dates with `date()`.
- Tier, Filter scores, rungs, commission never leave Crew Desk (lib/rules/visibility).

## Data
`pnpm db:reset` (drop, migrate, seed §12 + starter library) then `pnpm db:demo` for fictional demo data.
Dev sign-in: `/signin` lists every seeded user when `DEV_LOGIN=1`.
