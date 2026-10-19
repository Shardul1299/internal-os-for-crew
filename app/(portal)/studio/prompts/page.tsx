import { ScreenHeader, Section, Divider, Block, Table, THead, TH, TR, TD } from "@/components/ui";
import { SegmentedControl } from "@/components/ui/client";
import { Generator } from "@/components/studio/Generator";
import { genFields } from "@/components/studio/genFields";
import { requireStudio, genDefaults, cadenceStep } from "@/lib/queries/studio";
import { GENERATOR_KEYS, GENERATOR_LABEL, type GeneratorKey } from "@/lib/studio/generators";
import { SCRIPT_ANGLES, STORY_TYPES, JOURNEY_SERIES_FORMATS, UNIVERSAL_HOOK_TEMPLATES, AUTHORITY_CONTENT_FORMATS, FILMING_FORMATS, PROFILE_RIGHT_WRONG, TOOLS } from "@/lib/studio/reference";
import { today } from "@/lib/dates";

export const metadata = { title: "Prompts" };
export const dynamic = "force-dynamic";

const TOOL_STATUS = { connected: "In Studio", manual: "Manual", planned: "Planned, not built" } as const;

export default async function PromptsPage({ searchParams }: { searchParams: Promise<{ gen?: string }> }) {
  const sp = await searchParams;
  const ctx = await requireStudio();
  const gen = (GENERATOR_KEYS as readonly string[]).includes(sp.gen ?? "") ? (sp.gen as GeneratorKey) : "bio";
  const spec = genFields(gen, ctx.profile.subniches);
  const d = genDefaults(ctx.cfg);
  return (
    <>
      <ScreenHeader
        title="Prompts"
        action={
          <a href="/studio/prompts/export" download className="inline-flex items-center h-9 px-3.5 bg-pink text-on-pink font-semibold hover:brightness-110">
            Export to Word
          </a>
        }
      >
        <span className="t-caption">Every generator, pre-filled from your Profile.</span>
      </ScreenHeader>
      <div className="px-5 pt-4">
        <SegmentedControl param="gen" value={gen} size="sm" options={GENERATOR_KEYS.map((k) => ({ value: k, label: GENERATOR_LABEL[k] }))} />
      </div>
      <Section title={GENERATOR_LABEL[gen]}>
        <div className="max-w-4xl">
          <Generator key={gen} gen={gen} brand={ctx.brand} defaults={d} today={today()} step={cadenceStep(ctx.profile)} fields={spec.fields} save={spec.save} meta={spec.meta} initial={{ ...(spec.initial ?? {}), ...(gen === "carousel" ? { slides: String(d.carouselSlides) } : {}) }} />
        </div>
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
      <Section title="7 story types">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-px bg-rule">
          {STORY_TYPES.map((a) => (
            <Block key={a.id} className="!bg-raised">
              <div className="font-semibold">{a.name}</div>
              <p className="t-caption mb-2">{a.description}</p>
              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-[16px] text-fg-2">{a.fillInTemplate}</pre>
            </Block>
          ))}
        </div>
      </Section>
      <div className="grid lg:grid-cols-2">
        <Section title="Journey series formats">
          <ul>
            {JOURNEY_SERIES_FORMATS.map((f) => (
              <li key={f.id} className="py-1.5 border-b border-rule">
                <span className="font-semibold">{f.name}</span> <span className="text-fg-3">— {f.description}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Universal hook templates">
          <ul>
            {UNIVERSAL_HOOK_TEMPLATES.map((t) => (
              <li key={t} className="py-1.5 border-b border-rule">
                {t}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Authority formats">
          <ul>
            {AUTHORITY_CONTENT_FORMATS.map((t) => (
              <li key={t} className="py-1.5 border-b border-rule">
                {t}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Filming formats">
          <ul>
            {FILMING_FORMATS.map((f) => (
              <li key={f.id} className="py-1.5 border-b border-rule">
                <span className="font-semibold">{f.name}</span> <span className="text-fg-3">— {f.description}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
      <Section title="Profile checklist">
        <Table>
          <THead>
            <TH>Field</TH>
            <TH>Wrong</TH>
            <TH>Right</TH>
          </THead>
          <tbody>
            {PROFILE_RIGHT_WRONG.map((r) => (
              <TR key={r.field}>
                <TD className="font-semibold whitespace-nowrap">{r.field}</TD>
                <TD className="text-fg-3">{r.wrong}</TD>
                <TD>{r.right}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Section>
      <Section title="Tools" flush>
        <Table>
          <THead>
            <TH>Tool</TH>
            <TH>Purpose</TH>
            <TH>Status</TH>
            <TH>Note</TH>
          </THead>
          <tbody>
            {TOOLS.map((t) => (
              <TR key={t.name}>
                <TD className="font-semibold whitespace-nowrap">{t.name}</TD>
                <TD>{t.purpose}</TD>
                <TD className="whitespace-nowrap">{TOOL_STATUS[t.status]}</TD>
                <TD className="text-fg-3">{t.note}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Section>
    </>
  );
}
