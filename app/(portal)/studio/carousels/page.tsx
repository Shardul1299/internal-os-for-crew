import Link from "next/link";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, ButtonLink, Divider, Input, Select, EmptyState, Block, Button, Field, FormGrid } from "@/components/ui";
import { SegmentedControl, ActionForm, ActionButton, SubmitButton, KeyRows } from "@/components/ui/client";
import { Generator } from "@/components/studio/Generator";
import { lbl, FUNNEL_LABEL, CTA_LABEL, PILLAR_LABEL } from "@/components/studio/labels";
import { requireStudio, carousels, genDefaults, type StudioPage } from "@/lib/queries/studio";
import { cloneCarousel, createCarousel } from "@/lib/actions/studio-carousels";
import { CAROUSEL_ARCHETYPES, CAROUSEL_HOOK_PATTERNS, CAROUSEL_CTA_GUIDANCE, CAROUSEL_CTA_TYPES, CAROUSEL_BACKGROUND_STYLES, CAROUSEL_BACKGROUND_CATEGORIES, CAROUSEL_CRAFT_RULES } from "@/lib/studio/carousel-reference";
import { today } from "@/lib/dates";

export const metadata = { title: "Carousels" };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;
const ARCH = Object.fromEntries(CAROUSEL_ARCHETYPES.map((a) => [a.id, a.name]));

export default async function CarouselsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireStudio();
  const tab = sp.tab === "library" ? "library" : "create";
  return (
    <>
      <ScreenHeader
        title="Carousels"
        action={
          <ButtonLink href="/studio/carousels?new=1" variant="primary" data-new>
            New carousel
          </ButtonLink>
        }
      />
      <div className="px-5 pt-4">
        <SegmentedControl
          param="tab"
          value={tab}
          options={[
            { value: "create", label: "Create" },
            { value: "library", label: "Library" },
          ]}
        />
      </div>
      {sp.new ? (
        <Section title="New carousel" aside={<Link href="/studio/carousels">Close</Link>}>
          <ActionForm action={createCarousel} className="max-w-2xl">
            <FormGrid>
              <Field label="Title">
                <Input name="title" required />
              </Field>
              <Field label="Archetype">
                <Select name="archetype">
                  {CAROUSEL_ARCHETYPES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </FormGrid>
            <div className="mt-3">
              <SubmitButton>Create</SubmitButton>
            </div>
          </ActionForm>
        </Section>
      ) : null}
      {tab === "create" ? <CreateTab ctx={ctx} /> : <LibraryTab ctx={ctx} sp={sp} />}
    </>
  );
}

function CreateTab({ ctx }: { ctx: StudioPage }) {
  const d = genDefaults(ctx.cfg);
  return (
    <>
      <Section title="Generator" aside={`${d.carouselSlides} slides by default`}>
        <div className="max-w-4xl">
          <Generator
            gen="carousel"
            brand={ctx.brand}
            defaults={d}
            today={today()}
            save="carousel"
            initial={{ slides: String(d.carouselSlides) }}
            fields={[
              { name: "topic", label: "Topic" },
              { name: "archetype", label: "Archetype", type: "select", options: CAROUSEL_ARCHETYPES.map((a) => ({ value: a.id, label: `${a.name} · ${a.slideCount}` })) },
              { name: "slides", label: "Slides", type: "number" },
              {
                name: "funnelStage",
                label: "Funnel stage",
                type: "select",
                options: [
                  { value: "tofu", label: "TOFU" },
                  { value: "mofu", label: "MOFU" },
                  { value: "bofu", label: "BOFU" },
                ],
              },
              { name: "ctaType", label: "CTA (last slide)", type: "select", options: CAROUSEL_CTA_TYPES.map((c) => ({ value: c, label: CTA_LABEL[c] })) },
              { name: "backgroundStyle", label: "Background", type: "select", options: CAROUSEL_BACKGROUND_STYLES.map((b) => ({ value: b, label: b[0].toUpperCase() + b.slice(1) })) },
              { name: "backgroundCategory", label: "Photo category", type: "select", options: [{ value: "", label: "—" }, ...CAROUSEL_BACKGROUND_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))] },
              { name: "designNotes", label: "Design notes", type: "textarea", rows: 3 },
            ]}
          />
        </div>
      </Section>
      <Divider />
      <div className="grid lg:grid-cols-2">
        <Section title="Hook patterns">
          <ul>
            {CAROUSEL_HOOK_PATTERNS.map((h) => (
              <li key={h.id} className="py-1.5 border-b border-rule">
                {h.template}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="CTA">
          <ul>
            {CAROUSEL_CTA_TYPES.map((c) => (
              <li key={c} className="grid grid-cols-[80px_1fr] gap-3 py-1.5 border-b border-rule">
                <span className="font-semibold">{CTA_LABEL[c]}</span>
                <span className="text-fg-2">{CAROUSEL_CTA_GUIDANCE[c]}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
      <Section title="Archetypes">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-px bg-rule">
          {CAROUSEL_ARCHETYPES.map((a) => (
            <Block key={a.id} className="!bg-raised">
              <div className="font-semibold">{a.name}</div>
              <div className="t-caption mb-2">
                {a.slideCount} slides · {a.description}
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-[16px] text-fg-2">{a.fillInTemplate}</pre>
            </Block>
          ))}
        </div>
      </Section>
      <div className="grid lg:grid-cols-2">
        <Section title="Background photo categories">
          <ul>
            {CAROUSEL_BACKGROUND_CATEGORIES.map((c) => (
              <li key={c.id} className="py-1.5 border-b border-rule">
                <span className="font-semibold">{c.name}</span> <span className="text-fg-3">— {c.description}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Craft rules">
          {(
            [
              ["Slide count", CAROUSEL_CRAFT_RULES.slideCount],
              ["Slide 1", CAROUSEL_CRAFT_RULES.hook],
              ["Middle slides", CAROUSEL_CRAFT_RULES.body],
              ["Design", CAROUSEL_CRAFT_RULES.design],
              ["CTA", CAROUSEL_CRAFT_RULES.cta],
              ["Mistakes", CAROUSEL_CRAFT_RULES.mistakes],
            ] as const
          ).map(([t, rules]) => (
            <div key={t} className="mb-3">
              <div className="t-label mb-1">{t}</div>
              <ul className="space-y-1">
                {rules.map((r) => (
                  <li key={r} className="grid grid-cols-[14px_1fr] gap-2 t-callout text-fg-2">
                    <span aria-hidden className="mt-1 w-2 h-2 border border-fg-3" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      </div>
    </>
  );
}

async function LibraryTab({ ctx, sp }: { ctx: StudioPage; sp: Record<string, string | undefined> }) {
  const page = Math.max(0, Number(sp.page ?? 0) || 0);
  const f = { archetype: sp.archetype, funnel: sp.funnel, cta: sp.cta, pillar: sp.pillar, status: sp.status, src: sp.src, q: sp.q };
  const { rows, total } = await carousels(ctx, f, page);
  const pageHref = (p: number) => `/studio/carousels?${new URLSearchParams({ ...(Object.fromEntries(Object.entries({ ...f, tab: "library" }).filter(([, v]) => v)) as Record<string, string>), page: String(p) }).toString()}`;
  const sel = (name: string, label: string, opts: [string, string][], value?: string) => (
    <Select name={name} defaultValue={value ?? ""} aria-label={label}>
      <option value="">{label}</option>
      {opts.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </Select>
  );
  return (
    <>
      <Section>
        <form method="get" className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 items-center">
          <input type="hidden" name="tab" value="library" />
          <Input name="q" defaultValue={sp.q} placeholder="Title" aria-label="Search" className="col-span-2" />
          {sel("src", "All rows", [["starter", "Starter"], ["mine", "Mine"]], sp.src)}
          {sel("archetype", "Archetype", CAROUSEL_ARCHETYPES.map((a) => [a.id, a.name]), sp.archetype)}
          {sel("funnel", "Funnel", [["tofu", "TOFU"], ["mofu", "MOFU"], ["bofu", "BOFU"]], sp.funnel)}
          {sel("cta", "CTA", CAROUSEL_CTA_TYPES.map((c) => [c, CTA_LABEL[c]]), sp.cta)}
          {sel("pillar", "Pillar", Object.entries(PILLAR_LABEL), sp.pillar)}
          {sel("status", "Status", [["draft", "Draft"], ["ready", "Ready"], ["filmed", "Made"], ["posted", "Posted"]], sp.status)}
          <div className="col-span-2 md:col-span-4 xl:col-span-8 flex items-center gap-3">
            <Button type="submit" size="sm">
              Filter
            </Button>
            <Link href="/studio/carousels?tab=library" className="t-caption hover:text-fg">
              Clear
            </Link>
            <span className="t-caption ml-auto num">{total} carousels</span>
          </div>
        </form>
      </Section>
      {rows.length ? (
        <KeyRows>
          <Table>
            <THead>
              <TH>Title</TH>
              <TH>Archetype</TH>
              <TH align="right">Slides</TH>
              <TH>Funnel</TH>
              <TH>CTA</TH>
              <TH>Status</TH>
              <TH> </TH>
            </THead>
            <tbody>
              {rows.map((r) => (
                <TR key={r.id} href={`/studio/carousels/${r.id}`}>
                  <TD className="max-w-[380px]">
                    <Link href={`/studio/carousels/${r.id}`} className="block truncate hover:underline underline-offset-2">
                      {r.title}
                    </Link>
                    {r.creatorId ? <span className="t-caption">Mine{r.deliverableId ? " · attached" : ""}</span> : null}
                  </TD>
                  <TD className="text-fg-2">{ARCH[r.archetype] ?? r.archetype}</TD>
                  <TD align="right">{r.slideCount}</TD>
                  <TD>{lbl(FUNNEL_LABEL, r.funnelStage)}</TD>
                  <TD>{lbl(CTA_LABEL, r.ctaType)}</TD>
                  <TD className="capitalize text-fg-3">{r.status}</TD>
                  <TD>
                    {!r.creatorId ? (
                      <ActionButton action={cloneCarousel} fields={{ id: r.id }} variant="quiet">
                        Clone
                      </ActionButton>
                    ) : null}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </KeyRows>
      ) : (
        <EmptyState>No carousels match.</EmptyState>
      )}
      <div className="px-5 py-4 flex items-center gap-3">
        {page > 0 ? (
          <ButtonLink size="sm" href={pageHref(page - 1)}>
            ← Previous
          </ButtonLink>
        ) : null}
        {(page + 1) * 50 < total ? (
          <ButtonLink size="sm" href={pageHref(page + 1)}>
            Next →
          </ButtonLink>
        ) : null}
      </div>
    </>
  );
}
