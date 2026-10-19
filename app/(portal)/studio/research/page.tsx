import Link from "next/link";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, ButtonLink, Caption, Divider, Field, FormGrid, Input, Select, Textarea, EmptyState, Block } from "@/components/ui";
import { SegmentedControl, ActionForm, ActionButton, SubmitButton, KeyRows } from "@/components/ui/client";
import { CsvImport } from "@/components/studio/CsvImport";
import { Generator } from "@/components/studio/Generator";
import { requireStudio, outliers, genDefaults } from "@/lib/queries/studio";
import { saveOutlier, toggleOutlierUsed, removeOutlier } from "@/lib/actions/studio-research";
import { SCRIPT_ANGLES } from "@/lib/studio/reference";
import { int } from "@/lib/format";
import { today } from "@/lib/dates";

export const metadata = { title: "Research" };
export const dynamic = "force-dynamic";

type SP = Promise<{ tab?: string; new?: string; edit?: string }>;

const SEARCH_METHODS = [
  ["Creator research", "Sort Feed extension: sort one creator's Reels by views."],
  ["Keyword research", "Explore → search a keyword → Reels tab."],
  ["Recommendation feed", "Hidden gems that surface after you search."],
];
const DISCOVERY = ["Accounts-tab search", "Reels-tab profile screenshots", "Suggested Accounts after following", "Top creators' Following lists"];

export default async function ResearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireStudio();
  const tab = ["log", "import", "keywords", "deconstruct", "topics"].includes(sp.tab ?? "") ? sp.tab! : "log";
  const rows = await outliers(ctx);
  const top = rows[0];
  const editing = sp.edit ? rows.find((r) => r.id === sp.edit) : undefined;
  const threshold = ctx.cfg.n.outlier_threshold;
  const d = genDefaults(ctx.cfg);
  const subOpts = (ctx.profile.subniches.length ? ctx.profile.subniches : [ctx.profile.niche || "Your niche"]).map((s) => ({ value: s, label: s }));

  return (
    <>
      <ScreenHeader
        title="Research"
        number={top ? `${top.multiple.toFixed(1)}×` : undefined}
        numberCaption={top ? "top multiple" : undefined}
        action={
          <ButtonLink href="/studio/research?new=1" variant="primary" data-new>
            Log outlier
          </ButtonLink>
        }
      >
        <span className="t-caption">An outlier has {threshold}× more views than followers.</span>
      </ScreenHeader>
      <div className="px-5 pt-4">
        <SegmentedControl
          param="tab"
          value={tab}
          options={[
            { value: "log", label: "Log", count: rows.length },
            { value: "import", label: "Import" },
            { value: "keywords", label: "Keywords" },
            { value: "deconstruct", label: "Deconstruct" },
            { value: "topics", label: "Topics" },
          ]}
        />
      </div>

      {sp.new || editing ? (
        <Section title={editing ? "Edit outlier" : "Log outlier"} aside={<Link href="/studio/research">Close</Link>}>
          <ActionForm action={saveOutlier} className="max-w-3xl">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <FormGrid>
              <Field label="Source">
                <Select name="sourceType" defaultValue={editing?.sourceType ?? "keyword"} className="max-w-60">
                  <option value="keyword">Keyword</option>
                  <option value="creator">Creator</option>
                  <option value="recommendation">Recommendation feed</option>
                </Select>
              </Field>
              <Field label="Creator handle">
                <Input name="creatorHandle" defaultValue={editing?.creatorHandle} placeholder="@creator" />
              </Field>
              <Field label="Link">
                <Input name="link" defaultValue={editing?.link} placeholder="https://" />
              </Field>
              <Field label="Niche keyword">
                <Input name="nicheKeyword" defaultValue={editing?.nicheKeyword} />
              </Field>
              <Field label="Followers · views">
                <div className="grid grid-cols-2 gap-2 max-w-sm">
                  <Input name="followerCount" type="number" min={0} defaultValue={editing?.followerCount ?? ""} aria-label="Their followers" placeholder="Followers" />
                  <Input name="views" type="number" min={0} defaultValue={editing?.views ?? ""} aria-label="Views" placeholder="Views" />
                </div>
              </Field>
              <Field label="Written hook">
                <Input name="hookWritten" defaultValue={editing?.hookWritten} />
              </Field>
              <Field label="Verbal hook">
                <Input name="hookVerbal" defaultValue={editing?.hookVerbal} />
              </Field>
              <Field label="Visual hook">
                <Input name="hookVisual" defaultValue={editing?.hookVisual} />
              </Field>
              <Field label="Angle">
                <Select name="angle" defaultValue={editing?.angle ?? ""} className="max-w-72">
                  <option value="">—</option>
                  {SCRIPT_ANGLES.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Notes">
                <Textarea name="notes" rows={3} defaultValue={editing?.notes} />
              </Field>
            </FormGrid>
            <div className="mt-4">
              <SubmitButton>{editing ? "Save" : "Log outlier"}</SubmitButton>
            </div>
          </ActionForm>
        </Section>
      ) : null}

      {tab === "log" ? (
        <>
          {rows.length ? (
            <Section flush>
              <KeyRows>
                <Table>
                  <THead>
                    <TH align="right">Multiple</TH>
                    <TH>Creator</TH>
                    <TH>Hook</TH>
                    <TH>Angle</TH>
                    <TH>Source</TH>
                    <TH align="right">Views</TH>
                    <TH align="right">Followers</TH>
                    <TH>Used</TH>
                    <TH> </TH>
                  </THead>
                  <tbody>
                    {rows.map((r) => (
                      <TR key={r.id} href={`/studio/research?edit=${r.id}`}>
                        <TD align="right" className={r.multiple >= threshold ? "font-semibold" : "text-fg-3"}>
                          {r.multiple.toFixed(1)}×
                        </TD>
                        <TD className="whitespace-nowrap">
                          {r.link ? (
                            <a href={r.link} target="_blank" rel="noreferrer" className="hover:underline underline-offset-2">
                              {r.creatorHandle || "Link"}
                            </a>
                          ) : (
                            r.creatorHandle
                          )}
                        </TD>
                        <TD className="max-w-[320px]">
                          <span className="block truncate">{r.hookWritten || r.hookVerbal || "—"}</span>
                          {r.hookVisual ? <span className="t-caption block truncate">{r.hookVisual}</span> : null}
                        </TD>
                        <TD className="text-fg-2">{r.angle || "—"}</TD>
                        <TD className="text-fg-3">{r.sourceType === "recommendation" ? "Feed" : r.sourceType === "creator" ? "Creator" : "Keyword"}{r.nicheKeyword ? ` · ${r.nicheKeyword}` : ""}</TD>
                        <TD align="right" className="text-fg-3">{int(r.views)}</TD>
                        <TD align="right" className="text-fg-3">{int(r.followerCount)}</TD>
                        <TD>
                          <ActionButton action={toggleOutlierUsed} fields={{ id: r.id }} variant="quiet">
                            {r.used ? "Used" : "Mark used"}
                          </ActionButton>
                        </TD>
                        <TD>
                          <ActionButton action={removeOutlier} fields={{ id: r.id }} variant="quiet">
                            Remove
                          </ActionButton>
                        </TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              </KeyRows>
            </Section>
          ) : (
            <EmptyState>No outliers yet. Find a reel at {threshold}× and log it.</EmptyState>
          )}
          <Divider />
          <Section title="Method">
            <div className="grid md:grid-cols-3 gap-px bg-rule">
              <Block className="!bg-raised">
                <div className="t-label mb-2">Reset the algorithm</div>
                <p className="text-fg-2">Dummy account → Profile → Menu → Content Preferences → Reset Suggested Content → Reset.</p>
              </Block>
              <Block className="!bg-raised">
                <div className="t-label mb-2">3 search methods</div>
                <ol className="space-y-1 text-fg-2 list-decimal pl-4">
                  {SEARCH_METHODS.map(([k, v]) => (
                    <li key={k}>
                      <span className="text-fg">{k}</span> — {v}
                    </li>
                  ))}
                </ol>
              </Block>
              <Block className="!bg-raised">
                <div className="t-label mb-2">4 discovery methods</div>
                <ol className="space-y-1 text-fg-2 list-decimal pl-4">
                  {DISCOVERY.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ol>
              </Block>
            </div>
            <Caption className="mt-2">These numbers stay in Studio.</Caption>
          </Section>
        </>
      ) : tab === "import" ? (
        <Section title="Import from CSV" aside={`Rows at ${threshold}× are pre-selected`}>
          <CsvImport threshold={threshold} />
        </Section>
      ) : tab === "keywords" ? (
        <Section title="Keyword bank" aside="25–40 search phrases">
          <div className="max-w-4xl">
            <Generator gen="keyword_bank" brand={ctx.brand} defaults={d} today={today()} />
          </div>
        </Section>
      ) : tab === "deconstruct" ? (
        <Section title="Outlier deconstruction">
          <div className="max-w-4xl">
            <Generator gen="outlier_deconstruction" brand={ctx.brand} defaults={d} today={today()} fields={[{ name: "transcript", label: "Transcript or description", type: "textarea", rows: 6 }]} />
          </div>
        </Section>
      ) : (
        <>
          <Section title="Topic research" aside="10 frameworks, models or stats">
            <div className="max-w-4xl">
              <Generator gen="topic_research" brand={ctx.brand} defaults={d} today={today()} fields={[{ name: "subniche", label: "Sub-niche", type: "select", options: subOpts }]} />
            </div>
          </Section>
          <Divider />
          <Section title="Problem research" aside="10 painful problems">
            <div className="max-w-4xl">
              <Generator gen="problem_research" brand={ctx.brand} defaults={d} today={today()} fields={[{ name: "subniche", label: "Sub-niche", type: "select", options: subOpts }]} />
            </div>
          </Section>
        </>
      )}
    </>
  );
}
