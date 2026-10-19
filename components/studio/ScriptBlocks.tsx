// BLACK / RED / GREEN script bodies as three labelled blocks (BRIEF §13.8): beige caps labels,
// no red or green colour — pink stays for emphasis only.
import { Block } from "@/components/ui";
import { SCRIPT_CRAFT_RULES } from "@/lib/studio/reference";

export const BODY_LABEL = {
  black: { label: "BLACK", sub: "Spoken dialogue" },
  red: { label: "RED", sub: "Actions and camera" },
  green: { label: "GREEN", sub: "Editing and graphics" },
} as const;

export function ScriptBlocks({ black, red, green }: { black: string; red: string; green: string }) {
  return (
    <div className="grid gap-px bg-rule">
      {(
        [
          ["black", black],
          ["red", red],
          ["green", green],
        ] as const
      ).map(([k, body]) => (
        <Block key={k} className="!bg-raised">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="t-label text-fg">{BODY_LABEL[k].label}</span>
            <span className="t-caption">{BODY_LABEL[k].sub}</span>
          </div>
          {body.trim() ? (
            <ol className="space-y-1">
              {body
                .split("\n")
                .filter((l) => l.trim())
                .map((l, i) => (
                  <li key={i} className="grid grid-cols-[24px_1fr] gap-2">
                    <span className="t-caption num pt-0.5">{i + 1}</span>
                    <span className="whitespace-pre-wrap">{l}</span>
                  </li>
                ))}
            </ol>
          ) : (
            <p className="t-caption">Empty.</p>
          )}
        </Block>
      ))}
    </div>
  );
}

/** The crisp-script checklist shown beside hand-written scripts (§19.6.4). */
export function CraftChecklist() {
  const groups: [string, readonly string[]][] = [
    ["Hook", SCRIPT_CRAFT_RULES.hook],
    ["Body", SCRIPT_CRAFT_RULES.body],
    ["CTA", SCRIPT_CRAFT_RULES.cta],
    ["Length", SCRIPT_CRAFT_RULES.length],
  ];
  return (
    <div className="space-y-4">
      {groups.map(([title, rules]) => (
        <div key={title}>
          <div className="t-label mb-1">{title}</div>
          <ul className="space-y-1.5">
            {rules.map((r) => (
              <li key={r} className="grid grid-cols-[14px_1fr] gap-2 t-callout text-fg-2">
                <span aria-hidden className="mt-1 w-2 h-2 border border-fg-3" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
