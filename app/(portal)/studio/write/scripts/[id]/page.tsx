import { notFound } from "next/navigation";
import { ScreenHeader, Section, Kvs, Kv, Divider, ButtonLink, Caption, Select, Input } from "@/components/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/client";
import { ScriptBlocks, CraftChecklist } from "@/components/studio/ScriptBlocks";
import { ScriptForm } from "@/components/studio/ScriptForm";
import { lbl, PILLAR_LABEL, FUNNEL_LABEL, CTA_LABEL, EFFORT_LABEL, TYPE_LABEL, BUCKET_LABEL, DELIV_STATUS } from "@/components/studio/labels";
import { requireStudio, scriptFor, deliverableOptions } from "@/lib/queries/studio";
import { cloneScript, removeScript, attachScript, toggleScriptShared } from "@/lib/actions/studio-write";
import { scheduleScript } from "@/lib/actions/studio-calendar";
import { addDays, today } from "@/lib/dates";
import { date } from "@/lib/format";

export const metadata = { title: "Script" };
export const dynamic = "force-dynamic";

export default async function ScriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireStudio();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const sc = await scriptFor(ctx, id);
  if (!sc) notFound();
  const deliv = sc.readOnly ? [] : await deliverableOptions(ctx);
  const open = deliv.filter((d) => !["live", "reported"].includes(d.status) || d.id === sc.deliverableId);
  const attached = deliv.find((d) => d.id === sc.deliverableId);
  const canDeals = ctx.access.deals === "write";

  return (
    <>
      <ScreenHeader
        title={sc.readOnly ? "Starter script" : "Script"}
        action={
          sc.readOnly ? (
            <ActionButton action={cloneScript} fields={{ id: sc.id }} variant="primary" size="md">
              Clone to edit
            </ActionButton>
          ) : (
            <ButtonLink href={`/studio/write?tab=improve&script=${sc.id}`}>
              Improve
            </ButtonLink>
          )
        }
      >
        <span className="t-headline text-fg">{sc.title}</span>
        <span className="t-caption block mt-1">
          {lbl(PILLAR_LABEL, sc.pillar)} · {lbl(TYPE_LABEL, sc.contentType)} · {lbl(FUNNEL_LABEL, sc.funnelStage)} · {lbl(CTA_LABEL, sc.ctaType)}
          {sc.clonedFromId ? " · cloned" : ""}
        </span>
      </ScreenHeader>

      <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-rule">
        <ActionForm action={scheduleScript} className="flex items-center gap-2">
          <input type="hidden" name="scriptId" value={sc.id} />
          <Input type="date" name="date" defaultValue={addDays(today(), 1)} aria-label="Date" className="w-40" />
          <SubmitButton variant="plain" size="sm">
            {sc.readOnly ? "Clone and schedule" : "Schedule to calendar"}
          </SubmitButton>
        </ActionForm>
        {!sc.readOnly ? (
          <>
            <a href={`/studio/write/export?script=${sc.id}`} download className="h-7 px-2.5 inline-flex items-center text-[12px] bg-block hover:bg-raised">
              Export to Word
            </a>
            <ButtonLink size="sm" href={`/studio/shoot?script=${sc.id}`}>
              Shot list
            </ButtonLink>
            <ActionButton action={toggleScriptShared} fields={{ id: sc.id }}>
              {sc.sharedWithCrew ? "Stop sharing" : "Share with Crew"}
            </ActionButton>
          </>
        ) : null}
      </div>

      {sc.readOnly ? (
        <>
          <Section>
            <ScriptBlocks black={sc.bodyBlack} red={sc.bodyRed} green={sc.bodyGreen} />
          </Section>
          <Section title="Details">
            <Kvs>
              <Kv k="Angle" v={sc.angleOrStoryType} />
              <Kv k="Format" v={sc.format} />
              <Kv k="Concept" v={lbl(BUCKET_LABEL, sc.conceptBucket)} />
              <Kv k="Detail level" v={lbl(EFFORT_LABEL, sc.effort)} />
              <Kv k="Topic tag" v={sc.topicTag} />
              <Kv k="Segment" v={sc.segment} />
            </Kvs>
          </Section>
        </>
      ) : (
        <>
          <Section title="Attach to deliverable" aside="Sponsored only">
            {canDeals && open.length ? (
              <ActionForm action={attachScript} className="flex flex-wrap items-center gap-2 max-w-3xl">
                <input type="hidden" name="scriptId" value={sc.id} />
                <Select name="deliverableId" defaultValue={sc.deliverableId ?? ""} className="max-w-md">
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
            {attached ? (
              <Caption className="mt-2">
                Attached to {attached.brandName} · {attached.title} (due {date(attached.dueOn)}) — Crew can see this script.{" "}
                <a className="underline underline-offset-2" href={`/studio/deals/${attached.id}`}>
                  Submit draft
                </a>
              </Caption>
            ) : null}
          </Section>
          <Divider />
          <Section>
            <div className="grid xl:grid-cols-[1fr_340px] gap-8">
              <div className="max-w-3xl">
                <ScriptForm script={sc} />
              </div>
              <aside>
                <div className="t-label mb-2 text-fg">Crisp-script checklist</div>
                <CraftChecklist />
              </aside>
            </div>
          </Section>
          <Divider />
          <Section>
            <ActionButton action={removeScript} fields={{ id: sc.id }} variant="quiet" size="md">
              Remove script
            </ActionButton>
          </Section>
        </>
      )}
    </>
  );
}
