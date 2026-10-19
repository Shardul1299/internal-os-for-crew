import Link from "next/link";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, ButtonLink, Caption, Divider, Input, Select, Textarea, EmptyState, Block, Button } from "@/components/ui";
import { SegmentedControl, ActionForm, ActionButton, SubmitButton, KeyRows } from "@/components/ui/client";
import { Generator, type GenField } from "@/components/studio/Generator";
import { ScriptForm } from "@/components/studio/ScriptForm";
import { CraftChecklist } from "@/components/studio/ScriptBlocks";
import { AddToCalendar } from "@/components/studio/AddToCalendar";
import { lbl, PILLAR_LABEL, FUNNEL_LABEL, EFFORT_LABEL, TYPE_LABEL } from "@/components/studio/labels";
import { requireStudio, hookStacks, myScripts, templates, outliers, libraryScripts, genDefaults, type StudioPage } from "@/lib/queries/studio";
import { removeHookStack, bulkImportScripts, removeTemplate, cloneScript } from "@/lib/actions/studio-write";
import {
  SCRIPT_ANGLES,
  STORY_TYPES,
  JOURNEY_SERIES_FORMATS,
  AUTHORITY_CONTENT_FORMATS,
  FILMING_FORMATS,
  STORYTELLING_RECOMMENDED_FORMAT_IDS,
  HISTORICAL_MEDIA_TIP,
  UNIVERSAL_HOOK_TEMPLATES,
  HOOK_STACK_EXAMPLES,
  REACH_VS_CONVERSION_EXAMPLE,
} from "@/lib/studio/reference";
import { date } from "@/lib/format";
import { addDays, today as todayISO } from "@/lib/dates";

export const metadata = { title: "Write" };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

const FUNNEL_OPTS = [
  { value: "tofu", label: "TOFU — reach" },
  { value: "mofu", label: "MOFU — nurture" },
  { value: "bofu", label: "BOFU — convert" },
];
const CTA_OPTS = [
  { value: "follow", label: "Follow" },
  { value: "engagement", label: "Engagement" },
  { value: "manychat", label: "ManyChat" },
  { value: "none", label: "None" },
];
const FORMAT_OPTS = [{ value: "", label: "—" }, ...FILMING_FORMATS.map((f) => ({ value: f.name, label: f.name }))];

export default async function WritePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireStudio();
  const tab = ["hooks", "scripts", "improve", "library"].includes(sp.tab ?? "") ? sp.tab! : "scripts";
  return (
    <>
      <ScreenHeader
        title="Write"
        action={
          <ButtonLink href="/studio/write?tab=scripts&gen=manual" variant="primary" data-new>
            New script
          </ButtonLink>
        }
      />
      <div className="px-5 pt-4">
        <SegmentedControl
          param="tab"
          value={tab}
          options={[
            { value: "hooks", label: "Hooks" },
            { value: "scripts", label: "Scripts" },
            { value: "improve", label: "Improve" },
            { value: "library", label: "Library" },
          ]}
        />
      </div>
      {tab === "hooks" ? <HooksTab ctx={ctx} /> : tab === "scripts" ? <ScriptsTab ctx={ctx} sp={sp} /> : tab === "improve" ? <ImproveTab ctx={ctx} sp={sp} /> : <LibraryTab ctx={ctx} sp={sp} />}
    </>
  );
}

async function HooksTab({ ctx }: { ctx: StudioPage }) {
  const stacks = await hookStacks(ctx);
  return (
    <>
      <Section title="Hook Lab" aside="Written + verbal + visual">
        <div className="max-w-4xl">
          <Generator
            gen="hook_stack"
            brand={ctx.brand}
            defaults={genDefaults(ctx.cfg)}
            today={todayISO()}
            save="hooks"
            fields={[
              { name: "topic", label: "Topic" },
              { name: "angle", label: "Angle", type: "select", options: [{ value: "", label: "Any angle" }, ...SCRIPT_ANGLES.map((a) => ({ value: a.name, label: a.name }))] },
            ]}
          />
        </div>
      </Section>
      <Divider />
      <Section title="Saved stacks" aside={String(stacks.length)} flush>
        {stacks.length ? (
          <Table>
            <THead>
              <TH>Written</TH>
              <TH>Verbal</TH>
              <TH>Visual</TH>
              <TH>Topic</TH>
              <TH> </TH>
            </THead>
            <tbody>
              {stacks.map((s) => (
                <TR key={s.id}>
                  <TD className="font-semibold">{s.written || "—"}</TD>
                  <TD>{s.verbal || "—"}</TD>
                  <TD className="text-fg-2">{s.visual || "—"}</TD>
                  <TD className="text-fg-3">{s.topic}</TD>
                  <TD className="whitespace-nowrap">
                    <span className="inline-flex gap-1">
                      <ButtonLink size="sm" variant="quiet" href={`/studio/write?tab=scripts&gen=authority&stack=${s.id}`}>
                        Write script
                      </ButtonLink>
                      <ActionButton action={removeHookStack} fields={{ id: s.id }} variant="quiet">
                        Remove
                      </ActionButton>
                    </span>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="px-5">
            <Caption>No saved stacks yet.</Caption>
          </div>
        )}
      </Section>
      <Divider />
      <Section title="7 angles">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-px bg-rule">
          {SCRIPT_ANGLES.map((a) => (
            <Block key={a.id} className="!bg-raised">
              <div className="font-semibold">{a.name}</div>
              <p className="t-caption mb-2">{a.description}</p>
              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-[16px] text-fg-2">{a.fillInTemplate}</pre>
            </Block>
          ))}
        </div>
      </Section>
      <div className="grid lg:grid-cols-2">
        <Section title="Universal templates">
          <ul className="space-y-1.5">
            {UNIVERSAL_HOOK_TEMPLATES.map((t) => (
              <li key={t} className="border-b border-rule pb-1.5">
                {t}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Stacks that work">
          <ul className="space-y-3">
            {HOOK_STACK_EXAMPLES.map((e) => (
              <li key={e.written} className="border-b border-rule pb-2">
                <div>
                  <span className="t-label mr-2">Written</span>
                  {e.written}
                </div>
                <div>
                  <span className="t-label mr-2">Verbal</span>
                  {e.verbal}
                </div>
                <div className="text-fg-2">
                  <span className="t-label mr-2">Visual</span>
                  {e.visual}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}

const SCRIPT_GENS = [
  { value: "bank", label: "Bank" },
  { value: "authority", label: "Authority" },
  { value: "story", label: "Story" },
  { value: "series", label: "Series" },
  { value: "raw", label: "Raw idea" },
  { value: "transcript", label: "Transcript" },
  { value: "manual", label: "Manual" },
  { value: "import", label: "Import" },
];

async function ScriptsTab({ ctx, sp }: { ctx: StudioPage; sp: Record<string, string | undefined> }) {
  const gen = SCRIPT_GENS.some((g) => g.value === sp.gen) ? sp.gen! : "bank";
  const d = genDefaults(ctx.cfg);
  const t = todayISO();
  return (
    <>
      <div className="px-5 pt-3">
        <SegmentedControl param="gen" value={gen} size="sm" options={SCRIPT_GENS} />
      </div>
      {gen === "bank" ? (
        <BankView ctx={ctx} />
      ) : gen === "authority" ? (
        <AuthorityGen ctx={ctx} stackId={sp.stack} />
      ) : gen === "story" ? (
        <Section title="Storytelling script" aside="Journey pillar">
          <div className="grid xl:grid-cols-[1fr_300px] gap-8">
            <Generator
              gen="script_story"
              brand={ctx.brand}
              defaults={d}
              today={t}
              save="script"
              meta={{ pillar: "journey", contentType: "storytelling" }}
              fields={[
                { name: "topic", label: "What happened" },
                { name: "storyType", label: "Story type", type: "select", options: STORY_TYPES.map((s) => ({ value: s.name, label: s.name })) },
                { name: "series", label: "Journey series", type: "select", options: [{ value: "", label: "—" }, ...JOURNEY_SERIES_FORMATS.map((f) => ({ value: f.name, label: f.name }))] },
                {
                  name: "format",
                  label: "Format",
                  type: "select",
                  options: [
                    ...FILMING_FORMATS.filter((f) => STORYTELLING_RECOMMENDED_FORMAT_IDS.includes(f.id)).map((f) => ({ value: f.name, label: `${f.name} · recommended` })),
                    ...FILMING_FORMATS.filter((f) => !STORYTELLING_RECOMMENDED_FORMAT_IDS.includes(f.id)).map((f) => ({ value: f.name, label: f.name })),
                  ],
                },
                { name: "funnelStage", label: "Funnel stage", type: "select", options: FUNNEL_OPTS },
                { name: "ctaType", label: "CTA", type: "select", options: CTA_OPTS },
              ]}
            />
            <aside className="space-y-4">
              <div>
                <div className="t-label mb-1">Story types</div>
                <ul className="space-y-1.5">
                  {STORY_TYPES.map((s) => (
                    <li key={s.id} className="t-callout">
                      <span className="text-fg">{s.name}</span> <span className="text-fg-3">— {s.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="t-label mb-1">Historical media</div>
                <p className="t-callout text-fg-2">{HISTORICAL_MEDIA_TIP}</p>
              </div>
            </aside>
          </div>
        </Section>
      ) : gen === "series" ? (
        <Section title="Signature series" aside="Built on your human alpha">
          <div className="max-w-4xl">
            <Generator
              gen="signature_series"
              brand={ctx.brand}
              defaults={d}
              today={t}
              initial={{ episodes: "5" }}
              fields={[
                { name: "seriesName", label: "Series name", placeholder: "How to Enter the [Industry] Industry" },
                { name: "subject", label: "Subject" },
                { name: "episodes", label: "Episodes", type: "number" },
              ]}
            />
          </div>
        </Section>
      ) : gen === "raw" ? (
        <Section title="Raw idea developer" aside="7 factors of a short">
          <div className="max-w-4xl">
            <Generator gen="raw_idea" brand={ctx.brand} defaults={d} today={t} fields={[{ name: "rawIdea", label: "Raw idea", type: "textarea", rows: 4 }]} />
          </div>
        </Section>
      ) : gen === "transcript" ? (
        <Section title="Transcript → template" aside="Saves to templates">
          <div className="max-w-4xl">
            <Generator gen="transcript_template" brand={ctx.brand} defaults={d} today={t} save="template" fields={[{ name: "transcript", label: "Transcript", type: "textarea", rows: 8, placeholder: "Transcribed by hand, e.g. with gettranscribe.ai" }]} />
          </div>
        </Section>
      ) : gen === "manual" ? (
        <Section title="Manual script">
          <div className="grid xl:grid-cols-[1fr_340px] gap-8">
            <div className="max-w-3xl">
              <ScriptForm />
            </div>
            <aside>
              <div className="t-label mb-2 text-fg">Crisp-script checklist</div>
              <CraftChecklist />
            </aside>
          </div>
        </Section>
      ) : (
        <Section title="Bulk import" aside="Blocks separated by a line of ---">
          <ActionForm action={bulkImportScripts} resetOnSuccess className="max-w-4xl">
            <Textarea name="blocks" rows={14} className="font-mono text-[12px]" placeholder={"Script one…\n---\nScript two…"} />
            <Caption className="mt-1">Classified in one AI call; without a key they import as authority · educational · follow · TOFU.</Caption>
            <div className="mt-3">
              <SubmitButton variant="plain" pendingLabel="Importing…">
                Import
              </SubmitButton>
            </div>
          </ActionForm>
        </Section>
      )}
    </>
  );
}

async function AuthorityGen({ ctx, stackId }: { ctx: StudioPage; stackId?: string }) {
  const [stacks, outl] = await Promise.all([hookStacks(ctx), outliers(ctx)]);
  const stack = stacks.find((s) => s.id === stackId);
  const fill: Record<string, Record<string, string>> = { "": { hookWritten: "", hookVerbal: "", hookVisual: "" } };
  for (const s of stacks) fill[s.id] = { hookWritten: s.written, hookVerbal: s.verbal, hookVisual: s.visual, topic: s.topic };
  const fields: GenField[] = [
    { name: "topic", label: "Topic" },
    {
      name: "angle",
      label: "Angle",
      type: "select",
      options: [...SCRIPT_ANGLES.map((a) => ({ value: a.name, label: a.name })), ...AUTHORITY_CONTENT_FORMATS.map((f) => ({ value: f, label: f }))],
    },
    ...(stacks.length ? [{ name: "stackId", label: "Saved hook stack", type: "select" as const, options: stacks.map((s) => ({ value: s.id, label: s.written || s.verbal })), fill }] : []),
    { name: "hookWritten", label: "Written hook" },
    { name: "hookVerbal", label: "Verbal hook" },
    { name: "hookVisual", label: "Visual hook" },
    { name: "format", label: "Format", type: "select", options: FORMAT_OPTS },
    {
      name: "depth",
      label: "Depth",
      type: "select",
      options: [
        { value: "complex", label: `Complex — ${REACH_VS_CONVERSION_EXAMPLE.complex.views} → ${REACH_VS_CONVERSION_EXAMPLE.complex.result}` },
        { value: "easy", label: `Easy — ${REACH_VS_CONVERSION_EXAMPLE.easy.views} → ${REACH_VS_CONVERSION_EXAMPLE.easy.result}` },
      ],
    },
    { name: "funnelStage", label: "Funnel stage", type: "select", options: FUNNEL_OPTS },
    { name: "ctaType", label: "CTA", type: "select", options: CTA_OPTS },
    ...(outl.length ? [{ name: "outlierId", label: "Modelled on", type: "select" as const, options: outl.slice(0, 40).map((o) => ({ value: o.id, label: `${o.multiple.toFixed(1)}× · ${o.hookWritten || o.hookVerbal || o.creatorHandle}` })), fill: {} }] : []),
  ];
  return (
    <Section title="Authority script" aside="45–75 s · 4-phase scaffold">
      <div className="grid xl:grid-cols-[1fr_300px] gap-8">
        <Generator
          gen="script_authority"
          brand={ctx.brand}
          defaults={genDefaults(ctx.cfg)}
          today={todayISO()}
          save="script"
          meta={{ pillar: "authority", contentType: "educational" }}
          fields={fields}
          initial={stack ? { stackId: stack.id, hookWritten: stack.written, hookVerbal: stack.verbal, hookVisual: stack.visual, topic: stack.topic, angle: stack.angle || SCRIPT_ANGLES[0].name } : {}}
        />
        <aside className="space-y-4">
          <div>
            <div className="t-label mb-1">Reach vs conversion</div>
            <p className="t-callout">
              <span className="text-fg">{REACH_VS_CONVERSION_EXAMPLE.easy.label}</span>
              <span className="text-fg-3 block">
                {REACH_VS_CONVERSION_EXAMPLE.easy.views} → {REACH_VS_CONVERSION_EXAMPLE.easy.result}
              </span>
            </p>
            <p className="t-callout mt-2">
              <span className="text-fg">{REACH_VS_CONVERSION_EXAMPLE.complex.label}</span>
              <span className="text-fg-3 block">
                {REACH_VS_CONVERSION_EXAMPLE.complex.views} → {REACH_VS_CONVERSION_EXAMPLE.complex.result} · {REACH_VS_CONVERSION_EXAMPLE.complex.verdict}
              </span>
            </p>
          </div>
          <div>
            <div className="t-label mb-1">9 authority formats</div>
            <ul className="space-y-1 t-callout text-fg-2">
              {AUTHORITY_CONTENT_FORMATS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Section>
  );
}

async function BankView({ ctx }: { ctx: StudioPage }) {
  const [scripts, tpl] = await Promise.all([myScripts(ctx), templates(ctx)]);
  const t = todayISO();
  return (
    <>
      <Section title="Script bank" aside={scripts.length ? <a href="/studio/write/export" download className="underline underline-offset-2">Export bank to Word</a> : undefined} flush>
        {scripts.length ? (
          <KeyRows>
            <Table>
              <THead>
                <TH>Title</TH>
                <TH>Pillar</TH>
                <TH>Funnel</TH>
                <TH>Status</TH>
                <TH>Deliverable</TH>
                <TH>Updated</TH>
                <TH> </TH>
              </THead>
              <tbody>
                {scripts.map((s) => (
                  <TR key={s.id} href={`/studio/write/scripts/${s.id}`}>
                    <TD>
                      <Link href={`/studio/write/scripts/${s.id}`} className="hover:underline underline-offset-2">
                        {s.title}
                      </Link>
                      {s.sharedWithCrew ? <span className="t-caption ml-2">Shared</span> : null}
                    </TD>
                    <TD>{lbl(PILLAR_LABEL, s.pillar)}</TD>
                    <TD>{lbl(FUNNEL_LABEL, s.funnelStage)}</TD>
                    <TD className="capitalize">{s.status}</TD>
                    <TD className="text-fg-3">{s.deliverableId ? "Attached" : "—"}</TD>
                    <TD className="text-fg-3 whitespace-nowrap">{date(s.updatedAt, "d MMM")}</TD>
                    <TD className="whitespace-nowrap">
                      <AddToCalendar scriptId={s.id} defaultDate={addDays(t, 1)} label="Schedule" />
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </KeyRows>
        ) : (
          <EmptyState action={<ButtonLink href="/studio/write?tab=library">Open the library</ButtonLink>}>No scripts yet.</EmptyState>
        )}
      </Section>
      <Divider />
      <Section title="Templates" aside={String(tpl.length)}>
        {tpl.length ? (
          <ul className="space-y-3">
            {tpl.map((x) => (
              <li key={x.id} className="border-b border-rule pb-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{x.name}</span>
                  {x.creatorId ? (
                    <ActionButton action={removeTemplate} fields={{ id: x.id }} variant="quiet">
                      Remove
                    </ActionButton>
                  ) : (
                    <span className="t-caption">Starter</span>
                  )}
                </div>
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-[16px] text-fg-2 mt-1 max-h-48 overflow-auto">{x.templateText}</pre>
              </li>
            ))}
          </ul>
        ) : (
          <Caption>No templates yet — use Transcript → template.</Caption>
        )}
      </Section>
    </>
  );
}

async function ImproveTab({ ctx, sp }: { ctx: StudioPage; sp: Record<string, string | undefined> }) {
  const scripts = (await myScripts(ctx)).slice(0, 60);
  const fill: Record<string, Record<string, string>> = { "": { bodyBlack: "", bodyRed: "", bodyGreen: "" } };
  for (const s of scripts) fill[s.id] = { bodyBlack: s.bodyBlack, bodyRed: s.bodyRed, bodyGreen: s.bodyGreen, pillar: s.pillar, angle: s.angleOrStoryType, format: s.format, funnelStage: s.funnelStage, ctaType: s.ctaType };
  const picked = scripts.find((s) => s.id === sp.script);
  return (
    <Section title="Script Improver" aside="Diagnosis → fix plan → revised script">
      <div className="max-w-4xl">
        <Generator
          gen="improver"
          brand={ctx.brand}
          defaults={genDefaults(ctx.cfg)}
          today={todayISO()}
          save="improve"
          initial={picked ? { scriptId: picked.id, ...fill[picked.id] } : {}}
          fields={[
            ...(scripts.length ? [{ name: "scriptId", label: "Script", type: "select" as const, options: scripts.map((s) => ({ value: s.id, label: s.title })), fill }] : []),
            { name: "bodyBlack", label: "BLACK · spoken", type: "textarea", rows: 6 },
            { name: "bodyRed", label: "RED · actions", type: "textarea", rows: 3 },
            { name: "bodyGreen", label: "GREEN · editing", type: "textarea", rows: 3 },
            { name: "focus", label: "Focus", placeholder: "The hook feels slow" },
          ]}
        />
      </div>
    </Section>
  );
}

async function LibraryTab({ ctx, sp }: { ctx: StudioPage; sp: Record<string, string | undefined> }) {
  const page = Math.max(0, Number(sp.page ?? 0) || 0);
  const f = { funnel: sp.funnel, effort: sp.effort, topic: sp.topic, segment: sp.segment, type: sp.type, pillar: sp.pillar, q: sp.q, src: sp.src };
  const { rows, total, topics, segments } = await libraryScripts(ctx, f, page);
  const t = todayISO();
  const pageHref = (p: number) => `/studio/write?${new URLSearchParams({ ...(Object.fromEntries(Object.entries({ ...f, tab: "library" }).filter(([, v]) => v)) as Record<string, string>), page: String(p) }).toString()}`;
  const sel = (name: string, label: string, opts: [string, string][], value?: string) => (
    <Select name={name} defaultValue={value ?? ""} aria-label={label} className="min-w-0">
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
        <form method="get" className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-9 gap-2 items-center">
          <input type="hidden" name="tab" value="library" />
          <Input name="q" defaultValue={sp.q} placeholder="Title or angle" aria-label="Search" className="col-span-2" />
          {sel("src", "All rows", [["starter", "Starter"], ["mine", "Mine"]], sp.src)}
          {sel("funnel", "Funnel", [["tofu", "TOFU"], ["mofu", "MOFU"], ["bofu", "BOFU"]], sp.funnel)}
          {sel("effort", "Detail", [["low", "Low"], ["default", "Default"], ["high", "High"]], sp.effort)}
          {sel("type", "Type", Object.entries(TYPE_LABEL), sp.type)}
          {sel("pillar", "Pillar", Object.entries(PILLAR_LABEL), sp.pillar)}
          {sel("topic", "Topic tag", topics.map((x) => [x, x]), sp.topic)}
          {sel("segment", "Segment", segments.map((x) => [x, x]), sp.segment)}
          <div className="col-span-2 md:col-span-4 xl:col-span-9 flex items-center gap-3">
            <Button type="submit" size="sm">
              Filter
            </Button>
            <Link href="/studio/write?tab=library" className="t-caption hover:text-fg">
              Clear
            </Link>
            <span className="t-caption ml-auto num">{total.toLocaleString("en-IN")} scripts</span>
          </div>
        </form>
      </Section>
      {rows.length ? (
        <KeyRows>
          <Table>
            <THead>
              <TH>Title</TH>
              <TH>Angle</TH>
              <TH>Segment</TH>
              <TH>Topic</TH>
              <TH>Funnel</TH>
              <TH>Detail</TH>
              <TH> </TH>
            </THead>
            <tbody>
              {rows.map((r) => (
                <TR key={r.id} href={`/studio/write/scripts/${r.id}`}>
                  <TD className="max-w-[340px]">
                    <Link href={`/studio/write/scripts/${r.id}`} className="block truncate hover:underline underline-offset-2">
                      {r.title}
                    </Link>
                    {r.creatorId ? <span className="t-caption">Mine</span> : null}
                  </TD>
                  <TD className="text-fg-2 max-w-[170px] truncate">{r.angle}</TD>
                  <TD className="text-fg-3 max-w-[150px] truncate">{r.segment || "—"}</TD>
                  <TD className="text-fg-3 max-w-[150px] truncate">{r.topicTag || "—"}</TD>
                  <TD>{lbl(FUNNEL_LABEL, r.funnelStage)}</TD>
                  <TD>{lbl(EFFORT_LABEL, r.effort)}</TD>
                  <TD className="whitespace-nowrap">
                    <span className="inline-flex gap-1">
                      {!r.creatorId ? (
                        <ActionButton action={cloneScript} fields={{ id: r.id }} variant="quiet">
                          Clone
                        </ActionButton>
                      ) : null}
                      <AddToCalendar scriptId={r.id} defaultDate={addDays(t, 1)} label="Schedule" />
                    </span>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </KeyRows>
      ) : (
        <EmptyState>No scripts match.</EmptyState>
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
        <span className="t-caption num">
          {total ? `${page * 50 + 1}–${Math.min(total, (page + 1) * 50)} of ${total.toLocaleString("en-IN")}` : ""}
        </span>
      </div>
    </>
  );
}
