import Link from "next/link";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, Caption, Divider, Select, Button, Block, List, ListRow } from "@/components/ui";
import { FolderNamer } from "@/components/studio/FolderNamer";
import { requireStudio, myScripts, sundayShoots } from "@/lib/queries/studio";
import { FILMING_FORMATS } from "@/lib/studio/reference";
import { buildShotList } from "@/lib/studio/parse";
import { date } from "@/lib/format";
import { today as todayISO } from "@/lib/dates";

export const metadata = { title: "Shoot" };
export const dynamic = "force-dynamic";

const FLOOR = ["Tripod", "Microphone"];

export default async function ShootPage({ searchParams }: { searchParams: Promise<{ script?: string }> }) {
  const sp = await searchParams;
  const ctx = await requireStudio();
  const t = todayISO();
  const [scripts, shoots] = await Promise.all([myScripts(ctx), sundayShoots(ctx)]);
  const picked = scripts.find((s) => s.id === sp.script);
  const shots = picked ? buildShotList(picked.bodyRed, picked.bodyGreen) : [];
  const equipment = ctx.profile.equipment;
  const has = (item: string) => equipment.some((e) => e.toLowerCase().includes(item.toLowerCase().slice(0, 4)) || (item === "Microphone" && /mic/i.test(e)));
  const upcoming = shoots.filter((s) => s.date >= t);
  const ready = scripts.filter((s) => s.status === "ready");

  return (
    <>
      <ScreenHeader title="Shoot">
        <span className="t-caption">Plan it, film it, hand it to an editor.</span>
      </ScreenHeader>

      <Section title="Shot list" aside={picked ? `${shots.length} shots` : undefined}>
        <form method="get" className="flex flex-wrap items-center gap-2 mb-3">
          <Select name="script" defaultValue={picked?.id ?? ""} className="max-w-md" aria-label="Script">
            <option value="">Pick a saved script</option>
            {scripts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="primary">
            Build shot list
          </Button>
        </form>
        {picked ? (
          shots.length ? (
            <Table>
              <THead>
                <TH align="right">Shot</TH>
                <TH>RED · action and camera</TH>
                <TH>GREEN · edit</TH>
              </THead>
              <tbody>
                {shots.map((s) => (
                  <TR key={s.n}>
                    <TD align="right" className="w-12">
                      {s.n}
                    </TD>
                    <TD>{s.action || "—"}</TD>
                    <TD className="text-fg-2">{s.edit || "—"}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          ) : (
            <Caption>
              This script has no RED or GREEN lines.{" "}
              <Link href={`/studio/write/scripts/${picked.id}`} className="underline underline-offset-2">
                Add them
              </Link>
            </Caption>
          )
        ) : scripts.length ? null : (
          <Caption>No scripts yet.</Caption>
        )}
      </Section>

      <Divider />
      <div className="grid lg:grid-cols-2">
        <Section title="Batch folder">
          <FolderNamer today={t} topic={picked?.title ?? ""} />
          <Caption className="mt-2">Upload raw clips into it right after filming.</Caption>
        </Section>
        <Section title="Equipment" aside={<Link href="/studio/profile">Edit</Link>}>
          <ul>
            {[...FLOOR.filter((f) => !has(f)), ...equipment].map((e, i) => {
              const missing = i < FLOOR.filter((f) => !has(f)).length;
              return (
                <li key={`${e}-${i}`} className="grid grid-cols-[18px_1fr] gap-2 py-1.5 border-b border-rule items-center">
                  <span aria-hidden className={missing ? "w-2.5 h-2.5 border border-fg-3" : "w-2.5 h-2.5 bg-fg-2"} />
                  <span className={missing ? "text-fg-3" : undefined}>
                    {e}
                    {missing ? " — the floor; not on your list" : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>

      <Divider />
      <Section title="Sunday shoots" aside={upcoming.length ? `${upcoming.length} coming up` : undefined} flush>
        {shoots.length ? (
          <List>
            {shoots.map((s) => (
              <ListRow key={s.id} lead={date(s.date, "EEE d MMM")} title={s.location} meta={s.date < t ? "Held" : "Attending"} />
            ))}
          </List>
        ) : (
          <div className="px-5">
            <Caption>No Sunday shoots on your list.</Caption>
          </div>
        )}
        {upcoming.length && ready.length ? (
          <div className="px-5 pt-3">
            <span className="t-label">Shot lists to bring</span>
            <ul className="mt-1">
              {ready.map((s) => (
                <li key={s.id} className="py-1 border-b border-rule">
                  <Link href={`/studio/shoot?script=${s.id}`} className="hover:underline underline-offset-2">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Divider />
      <Section title="12 filming formats">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-px bg-rule">
          {FILMING_FORMATS.map((f) => (
            <Block key={f.id} className="!bg-raised">
              <div className="font-semibold">
                {f.name}
                {ctx.profile.formatPrefs.includes(f.id) ? <span className="t-caption ml-2">Yours</span> : null}
              </div>
              <p className="t-callout text-fg-2 mt-1">{f.description}</p>
            </Block>
          ))}
        </div>
      </Section>
    </>
  );
}
