import Link from "next/link";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, ButtonLink, Caption, Divider, Field, FormGrid, Input, Select, Textarea, EmptyState, Stat } from "@/components/ui";
import { ActionForm, ActionButton, SubmitButton, KeyRows } from "@/components/ui/client";
import { Generator } from "@/components/studio/Generator";
import { lbl, PILLAR_LABEL, DELIV_STATUS } from "@/components/studio/labels";
import { requireStudio, posts as loadPosts, calendarItems, deliverableOptions, genDefaults, cadenceStep, type PostRow } from "@/lib/queries/studio";
import { savePost, removePost } from "@/lib/actions/studio-results";
import { doubleDownCandidates, outlierMultiple } from "@/lib/rules/studio";
import { FILMING_FORMATS } from "@/lib/studio/reference";
import { date, int } from "@/lib/format";
import { addDays, today as todayISO } from "@/lib/dates";

export const metadata = { title: "Results" };
export const dynamic = "force-dynamic";

type SP = Promise<{ new?: string; edit?: string; dd?: string; deliverable?: string }>;

const sum = (xs: (number | null)[]) => xs.reduce<number>((t, x) => t + (x ?? 0), 0);

function groupAvg(rows: PostRow[], key: (p: PostRow) => string) {
  const m = new Map<string, PostRow[]>();
  for (const p of rows) m.set(key(p) || "—", [...(m.get(key(p) || "—") ?? []), p]);
  return [...m.entries()]
    .map(([k, ps]) => ({ k, n: ps.length, views: Math.round(sum(ps.map((p) => p.views)) / ps.length), saves: Math.round(sum(ps.map((p) => p.saves)) / ps.length), shares: Math.round(sum(ps.map((p) => p.shares)) / ps.length) }))
    .sort((a, b) => b.views - a.views);
}

export default async function ResultsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireStudio();
  const t = todayISO();
  const [rows, items, deliv] = await Promise.all([loadPosts(ctx), calendarItems(ctx, addDays(t, -70), addDays(t, 21)), deliverableOptions(ctx)]);
  const dd = doubleDownCandidates(ctx.cfg, rows);
  const editing = sp.edit ? rows.find((p) => p.id === sp.edit) : undefined;
  const ddPost = sp.dd ? rows.find((p) => p.id === sp.dd) : undefined;
  const byViews = [...rows].sort((a, b) => b.views - a.views);
  const totalViews = sum(rows.map((p) => p.views));
  const hooks = [...rows].filter((p) => p.hook).sort((a, b) => outlierMultiple(b.views, b.followersAtPost) - outlierMultiple(a.views, a.followersAtPost)).slice(0, 5);
  const canDeals = ctx.access.deals === "write";
  const showForm = !!sp.new || !!editing;
  const pre = editing ?? null;

  return (
    <>
      <ScreenHeader
        title="Results"
        action={
          <ButtonLink href="/studio/results?new=1" variant="primary" data-new>
            Log post
          </ButtonLink>
        }
      >
        <span className="t-caption">Credibility first. Numbers stay in Studio.</span>
      </ScreenHeader>

      {showForm ? (
        <Section title={editing ? "Edit post" : "Log a post"} aside={<Link href="/studio/results">Close</Link>}>
          <ActionForm action={savePost} className="max-w-3xl">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <FormGrid>
              <Field label="Title">
                <Input name="title" defaultValue={pre?.title} required />
              </Field>
              <Field label="Date · platform">
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" name="postedOn" defaultValue={pre?.postedOn ?? t} aria-label="Posted on" />
                  <Select name="platform" defaultValue={pre?.platform ?? "instagram"} aria-label="Platform">
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="x">X</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
              </Field>
              <Field label="URL">
                <Input type="url" name="url" defaultValue={pre?.url ?? ""} placeholder="https://" />
              </Field>
              <Field label="Pillar · format">
                <div className="grid grid-cols-2 gap-2">
                  <Select name="pillar" defaultValue={pre?.pillar ?? "authority"} aria-label="Pillar">
                    <option value="authority">Authority</option>
                    <option value="journey">Journey</option>
                  </Select>
                  <Select name="format" defaultValue={pre?.format ?? ""} aria-label="Format">
                    <option value="">—</option>
                    {FILMING_FORMATS.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </Field>
              <Field label="Hook">
                <Input name="hook" defaultValue={pre?.hook} />
              </Field>
              <Field label="Saves · shares">
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" min={0} name="saves" defaultValue={pre?.saves ?? ""} aria-label="Saves" placeholder="Saves" />
                  <Input type="number" min={0} name="shares" defaultValue={pre?.shares ?? ""} aria-label="Shares" placeholder="Shares" />
                </div>
              </Field>
              <Field label="Decision-maker comments">
                <Input type="number" min={0} name="commentsDecisionMaker" defaultValue={pre?.commentsDecisionMaker ?? ""} className="max-w-40" />
              </Field>
              <Field label="Inbound · sign-ups">
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" min={0} name="inbound" defaultValue={pre?.inbound ?? ""} aria-label="Inbound" placeholder="Inbound" />
                  <Input type="number" min={0} name="trackedSignups" defaultValue={pre?.trackedSignups ?? ""} aria-label="Tracked sign-ups" placeholder="Tracked sign-ups" />
                </div>
              </Field>
              <Field label="Views · followers then" hint="Private to Studio">
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" min={0} name="views" defaultValue={pre?.views ?? ""} aria-label="Views" placeholder="Views" />
                  <Input type="number" min={0} name="followersAtPost" defaultValue={pre?.followersAtPost ?? ""} aria-label="Followers at post" placeholder="Followers" />
                </div>
              </Field>
              <Field label="Calendar item">
                <Select name="calendarItemId" defaultValue={pre?.calendarItemId ?? ""}>
                  <option value="">—</option>
                  {items
                    .filter((i) => i.kind !== "blackout" && i.kind !== "shoot")
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {date(i.date, "d MMM")} · {i.title || i.topic}
                      </option>
                    ))}
                </Select>
              </Field>
              <Field label="Deliverable" hint={canDeals ? "Sends credibility metrics to the campaign report" : "Deals are read-only"}>
                <Select name="deliverableId" defaultValue={pre?.deliverableId ?? sp.deliverable ?? ""} disabled={!canDeals}>
                  <option value="">—</option>
                  {deliv.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.brandName} · {d.title} · {lbl(DELIV_STATUS, d.status)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Notes">
                <Textarea name="notes" rows={3} defaultValue={pre?.notes} />
              </Field>
            </FormGrid>
            <div className="mt-4">
              <SubmitButton>{editing ? "Save" : "Log post"}</SubmitButton>
            </div>
          </ActionForm>
        </Section>
      ) : null}

      {ddPost ? (
        <Section title={`Double down · ${ddPost.title}`} aside={<Link href="/studio/results">Close</Link>}>
          <div className="max-w-4xl">
            <Generator
              key={ddPost.id}
              gen="double_down"
              brand={ctx.brand}
              defaults={genDefaults(ctx.cfg)}
              today={t}
              step={cadenceStep(ctx.profile)}
              save="double_down"
              meta={{ pillar: ddPost.pillar }}
              initial={{ topic: ddPost.title, hook: ddPost.hook, format: ddPost.format }}
              fields={[
                { name: "topic", label: "Past video" },
                { name: "hook", label: "Its hook" },
                { name: "format", label: "Its format" },
              ]}
            />
          </div>
        </Section>
      ) : null}

      {rows.length ? (
        <>
          <Section title="Credibility">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <Stat label="Saves" value={int(sum(rows.map((p) => p.saves)))} />
              <Stat label="Shares" value={int(sum(rows.map((p) => p.shares)))} />
              <Stat label="Decision-maker comments" value={int(sum(rows.map((p) => p.commentsDecisionMaker)))} />
              <Stat label="Inbound" value={int(sum(rows.map((p) => p.inbound)))} />
              <Stat label="Tracked sign-ups" value={int(sum(rows.map((p) => p.trackedSignups)))} />
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-1 mt-4 t-callout text-fg-3 num">
              <span>{rows.length} posts logged</span>
              <span>{int(totalViews)} views</span>
              <span>{int(Math.round(totalViews / rows.length))} views per post</span>
              <span>{dd.size} double-down {dd.size === 1 ? "candidate" : "candidates"}</span>
            </div>
          </Section>
          <Divider />
          <Section title="Posts" flush>
            <KeyRows>
              <Table>
                <THead>
                  <TH>Date</TH>
                  <TH>Post</TH>
                  <TH align="right">Saves</TH>
                  <TH align="right">Shares</TH>
                  <TH align="right">DM comments</TH>
                  <TH align="right">Inbound</TH>
                  <TH align="right">Sign-ups</TH>
                  <TH align="right">Views</TH>
                  <TH align="right">Multiple</TH>
                  <TH> </TH>
                </THead>
                <tbody>
                  {rows.map((p) => (
                    <TR key={p.id} href={`/studio/results?edit=${p.id}`}>
                      <TD className="whitespace-nowrap">{date(p.postedOn, "d MMM")}</TD>
                      <TD className="max-w-[320px]">
                        <span className="block truncate">{p.title}</span>
                        <span className="t-caption block truncate">
                          {lbl(PILLAR_LABEL, p.pillar)}
                          {p.format ? ` · ${p.format}` : ""}
                          {p.deliverableId ? " · sponsored" : ""}
                          {dd.has(p.id) ? " · Double-down candidate" : ""}
                        </span>
                      </TD>
                      <TD align="right">{int(p.saves)}</TD>
                      <TD align="right">{int(p.shares)}</TD>
                      <TD align="right">{int(p.commentsDecisionMaker)}</TD>
                      <TD align="right">{int(p.inbound)}</TD>
                      <TD align="right">{int(p.trackedSignups)}</TD>
                      <TD align="right" className="text-fg-3 t-callout">
                        {int(p.views)}
                      </TD>
                      <TD align="right" className="text-fg-3 t-callout">
                        {outlierMultiple(p.views, p.followersAtPost).toFixed(1)}×
                      </TD>
                      <TD className="whitespace-nowrap">
                        <span className="inline-flex gap-1">
                          <ButtonLink size="sm" variant="quiet" href={`/studio/results?dd=${p.id}`}>
                            Double down
                          </ButtonLink>
                          <ActionButton action={removePost} fields={{ id: p.id }} variant="quiet">
                            Remove
                          </ActionButton>
                        </span>
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </KeyRows>
          </Section>
          <Divider />
          <div className="grid lg:grid-cols-2">
            <Section title="Top 5">
              <RankList rows={byViews.slice(0, 5)} />
            </Section>
            <Section title="Bottom 5">
              <RankList rows={byViews.slice(-5).reverse()} />
            </Section>
          </div>
          <div className="grid lg:grid-cols-2">
            <Section title="By pillar" flush>
              <AvgTable groups={groupAvg(rows, (p) => lbl(PILLAR_LABEL, p.pillar))} />
            </Section>
            <Section title="By format" flush>
              <AvgTable groups={groupAvg(rows, (p) => p.format)} />
            </Section>
          </div>
          <Section title="Hooks that perform">
            {hooks.length ? (
              <ul>
                {hooks.map((p) => (
                  <li key={p.id} className="grid grid-cols-[60px_1fr] gap-3 py-1.5 border-b border-rule">
                    <span className="num text-fg-3">{outlierMultiple(p.views, p.followersAtPost).toFixed(1)}×</span>
                    <span>{p.hook}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Caption>Log hooks with your posts to see which land.</Caption>
            )}
          </Section>
        </>
      ) : !showForm ? (
        <EmptyState>No posts logged yet.</EmptyState>
      ) : null}
    </>
  );
}

function RankList({ rows }: { rows: PostRow[] }) {
  return (
    <ol>
      {rows.map((p, i) => (
        <li key={p.id} className="grid grid-cols-[22px_1fr_auto] gap-3 py-1.5 border-b border-rule">
          <span className="num text-fg-3">{i + 1}</span>
          <span className="truncate">{p.title}</span>
          <span className="num text-fg-3 t-callout">
            {int(p.saves)} saves · {int(p.views)} views
          </span>
        </li>
      ))}
    </ol>
  );
}

function AvgTable({ groups }: { groups: ReturnType<typeof groupAvg> }) {
  return (
    <Table>
      <THead>
        <TH> </TH>
        <TH align="right">Posts</TH>
        <TH align="right">Avg saves</TH>
        <TH align="right">Avg shares</TH>
        <TH align="right">Avg views</TH>
      </THead>
      <tbody>
        {groups.map((g) => (
          <TR key={g.k}>
            <TD>{g.k}</TD>
            <TD align="right">{g.n}</TD>
            <TD align="right">{int(g.saves)}</TD>
            <TD align="right">{int(g.shares)}</TD>
            <TD align="right" className="text-fg-3">
              {int(g.views)}
            </TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
