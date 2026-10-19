import { notFound } from "next/navigation";
import { ScreenHeader, Section, Divider, Caption, Select, Input, Textarea, Field, FormGrid, Block } from "@/components/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/client";
import { SlidesEditor } from "@/components/studio/SlidesEditor";
import { lbl, FUNNEL_LABEL, CTA_LABEL, DELIV_STATUS } from "@/components/studio/labels";
import { requireStudio, carouselFor, deliverableOptions } from "@/lib/queries/studio";
import { cloneCarousel, updateCarousel, removeCarousel } from "@/lib/actions/studio-carousels";
import { attachCarousel } from "@/lib/actions/studio-write";
import { CAROUSEL_ARCHETYPES, CAROUSEL_CTA_TYPES, CAROUSEL_BACKGROUND_STYLES, CAROUSEL_BACKGROUND_CATEGORIES } from "@/lib/studio/carousel-reference";

export const metadata = { title: "Carousel" };
export const dynamic = "force-dynamic";

export default async function CarouselPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireStudio();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const c = await carouselFor(ctx, id);
  if (!c) notFound();
  const arch = CAROUSEL_ARCHETYPES.find((a) => a.id === c.archetype);
  const deliv = c.readOnly ? [] : await deliverableOptions(ctx);
  const open = deliv.filter((d) => !["live", "reported"].includes(d.status) || d.id === c.deliverableId);
  const canDeals = ctx.access.deals === "write";
  return (
    <>
      <ScreenHeader
        title={c.readOnly ? "Starter carousel" : "Carousel"}
        action={
          c.readOnly ? (
            <ActionButton action={cloneCarousel} fields={{ id: c.id }} variant="primary" size="md">
              Clone to edit
            </ActionButton>
          ) : undefined
        }
      >
        <span className="t-headline text-fg">{c.title}</span>
        <span className="t-caption block mt-1">
          {arch?.name ?? c.archetype} · {c.slideCount} slides · {lbl(FUNNEL_LABEL, c.funnelStage)} · {lbl(CTA_LABEL, c.ctaType)}
        </span>
      </ScreenHeader>

      {c.readOnly ? (
        <Section title="Slides">
          <ol className="grid md:grid-cols-2 xl:grid-cols-4 gap-px bg-rule">
            {c.slides.map((s) => (
              <Block key={s.id} className="!bg-raised min-h-32">
                <div className="t-label mb-2">
                  {s.slideNumber} · {s.slideRole}
                </div>
                <div className="t-headline">{s.headline}</div>
                {s.supportingText ? <p className="text-fg-2 mt-1">{s.supportingText}</p> : null}
              </Block>
            ))}
          </ol>
        </Section>
      ) : (
        <>
          <Section title="Attach to deliverable" aside="Sponsored only">
            {canDeals && open.length ? (
              <ActionForm action={attachCarousel} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="carouselId" value={c.id} />
                <Select name="deliverableId" defaultValue={c.deliverableId ?? ""} className="max-w-md">
                  <option value="">Not attached</option>
                  {open.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.brandName} · {d.title} · {lbl(DELIV_STATUS, d.status)}
                    </option>
                  ))}
                </Select>
                <SubmitButton variant="plain" size="sm">
                  Save
                </SubmitButton>
              </ActionForm>
            ) : (
              <Caption>{canDeals ? "No open sponsored deliverables." : "Deals are read-only."}</Caption>
            )}
          </Section>
          <Divider />
          <div className="grid xl:grid-cols-2">
            <Section title="Slides">
              <SlidesEditor id={c.id} initial={c.slides.map((s) => ({ role: s.slideRole, headline: s.headline, supportingText: s.supportingText }))} />
            </Section>
            <Section title="Details">
              <ActionForm action={updateCarousel}>
                <input type="hidden" name="id" value={c.id} />
                <FormGrid>
                  <Field label="Title">
                    <Input name="title" defaultValue={c.title} />
                  </Field>
                  <Field label="Archetype">
                    <Select name="archetype" defaultValue={c.archetype}>
                      {CAROUSEL_ARCHETYPES.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Pillar · status">
                    <div className="grid grid-cols-2 gap-2">
                      <Select name="pillar" defaultValue={c.pillar} aria-label="Pillar">
                        <option value="authority">Authority</option>
                        <option value="journey">Journey</option>
                      </Select>
                      <Select name="status" defaultValue={c.status} aria-label="Status">
                        <option value="draft">Draft</option>
                        <option value="ready">Ready</option>
                        <option value="filmed">Made</option>
                        <option value="posted">Posted</option>
                      </Select>
                    </div>
                  </Field>
                  <Field label="Funnel · CTA">
                    <div className="grid grid-cols-2 gap-2">
                      <Select name="funnelStage" defaultValue={c.funnelStage} aria-label="Funnel">
                        <option value="tofu">TOFU</option>
                        <option value="mofu">MOFU</option>
                        <option value="bofu">BOFU</option>
                      </Select>
                      <Select name="ctaType" defaultValue={c.ctaType} aria-label="CTA">
                        {CAROUSEL_CTA_TYPES.map((x) => (
                          <option key={x} value={x}>
                            {CTA_LABEL[x]}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </Field>
                  <Field label="Background">
                    <div className="grid grid-cols-2 gap-2">
                      <Select name="backgroundStyle" defaultValue={c.backgroundStyle} aria-label="Background style">
                        {CAROUSEL_BACKGROUND_STYLES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </Select>
                      <Select name="backgroundCategory" defaultValue={c.backgroundCategory} aria-label="Photo category">
                        <option value="">—</option>
                        {CAROUSEL_BACKGROUND_CATEGORIES.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </Field>
                  <Field label="Topic tag · segment">
                    <div className="grid grid-cols-2 gap-2">
                      <Input name="topicTag" defaultValue={c.topicTag} aria-label="Topic tag" />
                      <Input name="segment" defaultValue={c.segment} aria-label="Segment" />
                    </div>
                  </Field>
                  <Field label="Design notes" hint="Disclosure for sponsored posts goes here">
                    <Textarea name="designNotes" rows={4} defaultValue={c.designNotes} />
                  </Field>
                </FormGrid>
                <div className="mt-3">
                  <SubmitButton variant="plain">Save details</SubmitButton>
                </div>
              </ActionForm>
            </Section>
          </div>
          <Divider />
          <Section>
            <ActionButton action={removeCarousel} fields={{ id: c.id }} variant="quiet" size="md">
              Remove carousel
            </ActionButton>
          </Section>
        </>
      )}
    </>
  );
}
