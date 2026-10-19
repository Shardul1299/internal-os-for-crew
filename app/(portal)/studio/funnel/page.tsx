import { ScreenHeader, Section, Divider, Meter, Block, ButtonLink, Caption } from "@/components/ui";
import { Generator } from "@/components/studio/Generator";
import { requireStudio, calendarItems, studioWindow, genDefaults } from "@/lib/queries/studio";
import { funnelDistribution } from "@/lib/rules/studio";
import { FUNNEL_GUIDANCE, CTA_GUIDANCE } from "@/lib/studio/reference";
import { date } from "@/lib/format";
import { today } from "@/lib/dates";

export const metadata = { title: "Funnel" };
export const dynamic = "force-dynamic";

const MANYCHAT_STEPS = [
  "Create a ManyChat account and connect your own business profile.",
  "One automation: comment keyword → DM with your one bio link.",
  "One trigger word per offer.",
  "Test it from a second account before you use it in a video.",
];

export default async function FunnelPage() {
  const ctx = await requireStudio();
  const win = studioWindow(ctx.cfg);
  const items = await calendarItems(ctx, win.from, win.to);
  const dist = funnelDistribution(items);
  const total = dist.tofu + dist.mofu + dist.bofu;
  const d = genDefaults(ctx.cfg);
  const ctaOpts = Object.keys(CTA_GUIDANCE).map((k) => ({ value: k, label: k === "manychat" ? "ManyChat" : k[0].toUpperCase() + k.slice(1) }));
  return (
    <>
      <ScreenHeader
        title="Funnel"
        action={
          <ButtonLink href="#caption" variant="primary">
            Write caption
          </ButtonLink>
        }
      >
        <span className="t-caption">Every video knows its job.</span>
      </ScreenHeader>

      <Section title="Stages">
        <div className="grid md:grid-cols-3 gap-px bg-rule">
          {(["tofu", "mofu", "bofu"] as const).map((k) => (
            <Block key={k} className="!bg-raised">
              <div className="t-title">{k.toUpperCase()}</div>
              <div className="font-semibold mt-1">{FUNNEL_GUIDANCE[k].goal}</div>
              <p className="text-fg-2 mt-2">{FUNNEL_GUIDANCE[k].instruction}</p>
            </Block>
          ))}
        </div>
      </Section>

      <div className="grid lg:grid-cols-2">
        <Section title="This batch" aside={`${date(win.from, "d MMM")} – ${date(win.to, "d MMM")} · ${total} items`}>
          {(["tofu", "mofu", "bofu"] as const).map((k) => (
            <div key={k} className="grid grid-cols-[60px_1fr_70px] items-center gap-3 py-1.5">
              <span className="text-fg-2">{k.toUpperCase()}</span>
              <Meter value={dist[k]} max={Math.max(total, 1)} />
              <span className="num text-right">
                {dist[k]} <span className="text-fg-3">· {total ? Math.round((dist[k] / total) * 100) : 0}%</span>
              </span>
            </div>
          ))}
        </Section>
        <Section title="CTA types">
          <ul>
            {ctaOpts.map((o) => (
              <li key={o.value} className="grid grid-cols-[100px_1fr] gap-3 py-1.5 border-b border-rule">
                <span className="font-semibold">{o.label}</span>
                <span className="text-fg-2">{CTA_GUIDANCE[o.value as keyof typeof CTA_GUIDANCE]}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Divider />
      <Section title="Caption" aside="Hook · CTA · 3–5 keywords">
        <div id="caption" className="max-w-4xl scroll-mt-4">
          <Generator
            gen="caption"
            brand={ctx.brand}
            defaults={d}
            today={today()}
            fields={[
              { name: "hook", label: "Written hook" },
              { name: "topic", label: "Topic" },
              { name: "ctaType", label: "CTA", type: "select", options: ctaOpts },
            ]}
          />
        </div>
      </Section>

      <Divider />
      <div className="grid xl:grid-cols-[320px_1fr]">
        <Section title="ManyChat setup">
          <ol className="space-y-2">
            {MANYCHAT_STEPS.map((s, i) => (
              <li key={s} className="grid grid-cols-[22px_1fr] gap-2">
                <span className="num text-fg-3">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <Caption className="mt-3">{ctx.profile.manychatSetup ? "Marked set up on your Profile." : "On your own account. Studio only writes the copy."}</Caption>
        </Section>
        <Section title="DM writer">
          <div className="max-w-4xl">
            <Generator
              gen="manychat"
              brand={ctx.brand}
              defaults={d}
              today={today()}
              fields={[
                { name: "triggerWord", label: "Trigger word", placeholder: "EVALS" },
                { name: "offer", label: "Offer" },
              ]}
            />
          </div>
        </Section>
      </div>
    </>
  );
}
