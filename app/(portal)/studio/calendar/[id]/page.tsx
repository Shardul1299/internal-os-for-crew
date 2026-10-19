import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenHeader, Section, Kvs, Kv, Field, FormGrid, Input, Select, Textarea, Caption, Divider, ButtonLink } from "@/components/ui";
import { ActionForm, ActionButton, SubmitButton } from "@/components/ui/client";
import { ItemForm } from "@/components/studio/ItemForm";
import { lbl, KIND_LABEL, STATUS_LABEL, STUDIO_STATUS, DELIV_STATUS } from "@/components/studio/labels";
import { requireStudio, calendarItem, myScripts, myDeliverables, clearance } from "@/lib/queries/studio";
import { updateCalendarItem, removeCalendarItem, keepProposal } from "@/lib/actions/studio-calendar";
import { creatorCanEditCalendarField } from "@/lib/rules/studio";
import { date } from "@/lib/format";

export const metadata = { title: "Calendar item" };
export const dynamic = "force-dynamic";

export default async function CalendarItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireStudio();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const item = await calendarItem(ctx, id);
  if (!item) notFound();
  const scripts = await myScripts(ctx);
  const crewOwned = item.kind === "sponsored" || item.kind === "shoot" || item.kind === "blackout";
  const [deliv] = item.deliverableId ? await myDeliverables(ctx, ctx.cfg, { id: item.deliverableId }) : [];
  const block = deliv ? clearance(deliv) : null;
  const script = scripts.find((s) => s.id === item.scriptId);
  const title = item.title || item.topic || lbl(KIND_LABEL, item.kind);

  return (
    <>
      <ScreenHeader title={lbl(KIND_LABEL, item.kind)} action={<ButtonLink href="/studio/calendar" variant="quiet">Back</ButtonLink>}>
        <span className="t-headline text-fg">{title}</span>
        <span className="t-caption block mt-1">
          {date(item.date, "EEEE, d MMMM yyyy")}
          {item.proposedByUserId ? " · Crew" : ""}
        </span>
      </ScreenHeader>

      {item.proposedByUserId ? (
        <Section title="Proposed by Crew">
          <div className="flex gap-2">
            <ActionButton action={keepProposal} fields={{ id: item.id }} size="md">
              Keep
            </ActionButton>
            <ActionButton action={removeCalendarItem} fields={{ id: item.id, back: "/studio/calendar" }} size="md" variant="quiet">
              Remove
            </ActionButton>
          </div>
        </Section>
      ) : null}

      {crewOwned ? (
        <>
          {deliv ? (
            <Section title="Deliverable">
              <Kvs>
                <Kv k="Brand" v={`${deliv.brandName} · ${deliv.title}`} />
                <Kv k="Status" v={lbl(DELIV_STATUS, deliv.status)} />
                <Kv k="Claims round" v={deliv.revisionRound || "—"} />
                <Kv k="Due" v={date(deliv.dueOn)} />
                <Kv k="Clearance" v={block ?? "Cleared"} />
                {deliv.warnings.length ? <Kv k="Warning" v={deliv.warnings[0]} /> : null}
              </Kvs>
              <div className="mt-3">
                <ButtonLink href={`/studio/deals/${deliv.id}`} size="sm">
                  Open deliverable
                </ButtonLink>
              </div>
            </Section>
          ) : null}
          <Section title="Your fields">
            <ActionForm action={updateCalendarItem} className="max-w-3xl">
              <input type="hidden" name="id" value={item.id} />
              <FormGrid>
                <Field label="Date" hint={creatorCanEditCalendarField(item.kind, "date") ? undefined : "Date changes go through Crew"}>
                  <Input value={date(item.date)} readOnly disabled className="max-w-48" />
                </Field>
                <Field label="Status">
                  <Select name="studioStatus" defaultValue={item.studioStatus} className="max-w-48">
                    {STUDIO_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </Select>
                </Field>
                {item.kind === "sponsored" ? (
                  <Field label="Live URL" hint={block ? block : "Writes the deliverable's live URL"}>
                    <Input name="liveUrl" type="url" defaultValue={item.liveUrl ?? ""} placeholder="https://" />
                  </Field>
                ) : null}
                <Field label="Notes">
                  <Textarea name="notes" rows={3} defaultValue={item.notes ?? ""} />
                </Field>
              </FormGrid>
              <div className="mt-4">
                <SubmitButton>Save</SubmitButton>
              </div>
            </ActionForm>
          </Section>
        </>
      ) : (
        <Section>
          <ItemForm action={updateCalendarItem} item={item} scripts={scripts.map((s) => ({ id: s.id, title: s.title }))} />
          {script ? (
            <Caption className="mt-3">
              Script:{" "}
              <Link href={`/studio/write/scripts/${script.id}`} className="underline underline-offset-2">
                {script.title}
              </Link>
            </Caption>
          ) : null}
        </Section>
      )}

      {!crewOwned && !item.proposedByUserId ? (
        <>
          <Divider />
          <Section>
            <ActionButton action={removeCalendarItem} fields={{ id: item.id, back: "/studio/calendar" }} variant="quiet" size="md">
              Remove item
            </ActionButton>
          </Section>
        </>
      ) : null}
    </>
  );
}
