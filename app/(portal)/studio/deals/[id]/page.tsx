import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenHeader, Section, Kvs, Kv, Divider, ButtonLink, Caption, Markdown, Input, Block } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { DraftForm } from "@/components/studio/DraftForm";
import { lbl, DELIV_STATUS } from "@/components/studio/labels";
import { requireStudio, myDeliverables, clearance, myScripts, carousels, posts } from "@/lib/queries/studio";
import { markLive } from "@/lib/actions/studio-deals";
import { disclosureLine, hasDisclosure } from "@/lib/rules/studio";
import { date, int } from "@/lib/format";

export const metadata = { title: "Deliverable" };
export const dynamic = "force-dynamic";

export default async function DeliverablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireStudio();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [d] = await myDeliverables(ctx, ctx.cfg, { id });
  if (!d) notFound();
  const [scripts, cars, ps] = await Promise.all([myScripts(ctx), carousels(ctx, { src: "mine" }, 0, 200), posts(ctx)]);
  const canDeals = ctx.access.deals === "write";
  const block = clearance(d);
  const canSubmit = canDeals && ["briefed", "drafting"].includes(d.status);
  const line = disclosureLine(d.disclosureStandard);
  const draftScript = scripts.find((s) => s.id === d.draftScriptId);
  const draftCarousel = cars.rows.find((c) => c.id === d.draftCarouselId);
  const linkedPosts = ps.filter((p) => p.deliverableId === d.id);
  const attachedScript = scripts.find((s) => s.deliverableId === d.id);
  const attachedCarousel = cars.rows.find((c) => c.deliverableId === d.id);

  return (
    <>
      <ScreenHeader title="Deliverable" action={<ButtonLink href="/studio/deals" variant="quiet">Back</ButtonLink>}>
        <span className="t-headline text-fg">
          {d.brandName} · {d.title}
        </span>
        <span className="t-caption block mt-1">{block ?? lbl(DELIV_STATUS, d.status)}</span>
      </ScreenHeader>

      <div className="grid lg:grid-cols-2">
        <Section title="Record">
          <Kvs>
            <Kv k="Deal" v={d.dealTitle} />
            <Kv k="Platform" v={<span className="capitalize">{d.platform}</span>} />
            <Kv k="Due" v={date(d.dueOn)} />
            <Kv k="Scheduled" v={d.scheduledFor ? `${date(d.scheduledFor)} · set by Crew` : "Not yet"} />
            <Kv k="Status" v={lbl(DELIV_STATUS, d.status)} />
            <Kv k="Claims round" v={d.revisionRound ? `${d.revisionRound} of 2` : "—"} />
            <Kv k="Clearance" v={block ?? "Cleared"} />
            {d.warnings[0] ? <Kv k="Warning" v={d.warnings[0]} /> : null}
            <Kv k="Disclosure" v={d.disclosureStandard.toUpperCase()} />
            <Kv k="Live URL" v={d.liveUrl ? <a href={d.liveUrl} className="underline underline-offset-2 break-all" target="_blank" rel="noreferrer">{d.liveUrl}</a> : "—"} />
          </Kvs>
        </Section>
        <Section title="Brief">
          <Markdown source={d.briefMd} />
          {d.briefUrl ? (
            <a href={d.briefUrl} target="_blank" rel="noreferrer" className="t-caption underline underline-offset-2">
              Full brief
            </a>
          ) : null}
        </Section>
      </div>

      {d.brandChangeRequestMd ? (
        <>
          <Divider />
          <Section title="Brand change requests">
            <Block>
              <Markdown source={d.brandChangeRequestMd} />
            </Block>
          </Section>
        </>
      ) : null}

      {d.draftMd || draftScript || draftCarousel ? (
        <>
          <Divider />
          <Section title="Submitted draft" aside="The brand sees claims only">
            <Markdown source={d.draftMd} />
            {draftScript ? (
              <Caption className="mt-2">
                Script:{" "}
                <Link className="underline underline-offset-2" href={`/studio/write/scripts/${draftScript.id}`}>
                  {draftScript.title}
                </Link>
              </Caption>
            ) : null}
            {draftCarousel ? (
              <Caption className="mt-2">
                Carousel:{" "}
                <Link className="underline underline-offset-2" href={`/studio/carousels/${draftCarousel.id}`}>
                  {draftCarousel.title}
                </Link>
              </Caption>
            ) : null}
          </Section>
        </>
      ) : null}

      {canSubmit ? (
        <>
          <Divider />
          <Section title="Submit draft" aside={`Needs the ${d.disclosureStandard.toUpperCase()} line in GREEN`}>
            <DraftForm
              deliverableId={d.id}
              disclosure={line}
              defaultScriptId={attachedScript?.id ?? null}
              defaultCarouselId={attachedCarousel?.id ?? null}
              scripts={scripts.map((s) => ({ id: s.id, title: s.title, hasDisclosure: hasDisclosure(d.disclosureStandard, s.bodyGreen) }))}
              carousels={cars.rows.map((c) => ({ id: c.id, title: c.title, hasDisclosure: hasDisclosure(d.disclosureStandard, c.designNotes) }))}
            />
          </Section>
        </>
      ) : null}

      {canDeals && d.status !== "cancelled" ? (
        <>
          <Divider />
          <div className="grid lg:grid-cols-2">
            <Section title="Mark live" aside="Crew moves it live once cleared">
              <ActionForm action={markLive} className="flex flex-wrap gap-2 items-start">
                <input type="hidden" name="deliverableId" value={d.id} />
                <Input name="liveUrl" type="url" defaultValue={d.liveUrl ?? ""} placeholder="https://" className="max-w-md" required />
                <SubmitButton variant="plain">Save live URL</SubmitButton>
              </ActionForm>
              {block ? <Caption className="mt-2">{block}</Caption> : null}
            </Section>
            <Section title="Metrics" aside="Logged once, read by the campaign report">
              {linkedPosts.length ? (
                <ul className="mb-3">
                  {linkedPosts.map((p) => (
                    <li key={p.id} className="py-1.5 border-b border-rule">
                      <Link href={`/studio/results?edit=${p.id}`} className="hover:underline underline-offset-2">
                        {p.title}
                      </Link>
                      <span className="t-caption ml-2 num">
                        {int(p.saves)} saves · {int(p.shares)} shares · {int(p.commentsDecisionMaker)} DM comments · {int(p.inbound)} inbound
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <ButtonLink href={`/studio/results?new=1&deliverable=${d.id}`} size="sm">
                Log metrics
              </ButtonLink>
            </Section>
          </div>
        </>
      ) : !canDeals ? (
        <Section>
          <Caption>Deals are read-only.</Caption>
        </Section>
      ) : null}
    </>
  );
}
