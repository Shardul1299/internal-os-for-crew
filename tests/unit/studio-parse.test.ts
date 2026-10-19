import { describe, it, expect } from "vitest";
import {
  parseScriptSections,
  parseHookStacks,
  parseIdeationTable,
  parseDoubleDownVariants,
  parseCarouselSlides,
  buildShotList,
  folderName,
  finalSection,
  firstMeaningfulLine,
} from "@/lib/studio/parse";
import { parseSheet, autoMap, previewRows, toNumber, detectDelimiter, parseDelimited } from "@/lib/studio/csv";

describe("parseScriptSections", () => {
  it("reads the three bodies and strips bullets", () => {
    const out = `BLACK (spoken dialogue, line by line):
- I lost ₹4L on one pricing call.
- Here's the fix.
RED (physical actions / camera movement instructions):
- Walk into frame
GREEN (editing / graphic instructions for the editor):
- Text: ₹4L lost`;
    expect(parseScriptSections(out)).toEqual({ black: "I lost ₹4L on one pricing call.\nHere's the fix.", red: "Walk into frame", green: "Text: ₹4L lost" });
  });
  it("uses the final_script phase when the model shows its work", () => {
    const out = `<draft_v1>
BLACK:
- draft line
</draft_v1>
<final_script>
**BLACK** (spoken):
- final line
**RED**:
- move
**GREEN**:
- cut
</final_script>`;
    expect(finalSection(out)).toContain("final line");
    expect(parseScriptSections(out).black).toBe("final line");
    expect(parseScriptSections(out).green).toBe("cut");
  });
  it("falls back to the whole text as BLACK", () => {
    expect(parseScriptSections("just words\nmore")).toEqual({ black: "just words\nmore", red: "", green: "" });
  });
});

describe("parseHookStacks", () => {
  it("groups Written / Verbal / Visual lines", () => {
    const out = `1.
- Written hook: "₹0 to ₹10L in 90 days"
- Verbal hook: This is how I priced my first AI agent
- Visual hook: Whiteboard with one number
2.
- Written: 3 evals nobody runs
- Verbal: Your RAG demo lies to you
- Visual: Split screen`;
    const s = parseHookStacks(out);
    expect(s).toHaveLength(2);
    expect(s[0]).toEqual({ written: "₹0 to ₹10L in 90 days", verbal: "This is how I priced my first AI agent", visual: "Whiteboard with one number" });
    expect(s[1].verbal).toBe("Your RAG demo lies to you");
  });
  it("reads one-line stacks separated by pipes", () => {
    const s = parseHookStacks(`Written: "A" | Verbal: "B" | Visual: C`);
    expect(s).toEqual([{ written: "A", verbal: "B", visual: "C" }]);
  });
});

describe("parseIdeationTable", () => {
  it("maps markdown table rows to calendar rows", () => {
    const out = `| Topic | Pillar | Concept bucket | Suggested script angle | One-line hook idea |
|---|---|---|---|---|
| Evals before demos | Authority | Proven | Myth Bust | Your demo is lying |
| Week 3 build log | Journey | Double down | Progress Update | Day 21: 3 users |
| AI tutor teardown | authority | Original Experiment | Comparison | Two tutors, one winner |`;
    const rows = parseIdeationTable(out);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({ topic: "Evals before demos", pillar: "authority", conceptBucket: "proven", angle: "Myth Bust", hook: "Your demo is lying" });
    expect(rows[1].pillar).toBe("journey");
    expect(rows[1].conceptBucket).toBe("double_down");
    expect(rows[2].conceptBucket).toBe("experimental");
  });
  it("handles a leading number column", () => {
    const rows = parseIdeationTable(`| # | Topic | Pillar | Concept | Angle | Hook |\n|--|--|--|--|--|--|\n| 1 | X | journey | proven | A | H |`);
    expect(rows[0].topic).toBe("X");
    expect(rows[0].pillar).toBe("journey");
  });
  it("returns nothing for prose", () => {
    expect(parseIdeationTable("no table here")).toEqual([]);
  });
});

describe("parseDoubleDownVariants", () => {
  it("splits A / B / C", () => {
    const v = parseDoubleDownVariants(`**A) Keep most elements**\nNew topic: 5 evals\nHook: x\n\n**B) Same structure**\nNew topic: pricing\n\nC) New format\nTopic: whiteboard version`);
    expect(v.map((x) => x.method)).toEqual(["A", "B", "C"]);
    expect(firstMeaningfulLine(v[1].text)).toBe("Same structure");
    expect(v[2].text).toContain("whiteboard version");
  });
});

describe("parseCarouselSlides", () => {
  it("reads HOOK / BODY / CTA blocks", () => {
    const s = parseCarouselSlides(`HOOK: 5 evals nobody runs\nSave this\n---\nBODY: Eval 1\n---\nCTA: Save this for your next launch`);
    expect(s).toEqual([
      { role: "hook", headline: "5 evals nobody runs", supportingText: "Save this" },
      { role: "body", headline: "Eval 1", supportingText: "" },
      { role: "cta", headline: "Save this for your next launch", supportingText: "" },
    ]);
  });
});

describe("shoot helpers", () => {
  it("pairs RED and GREEN lines into ordered shots", () => {
    expect(buildShotList("- wide\n- close", "- title card")).toEqual([
      { n: 1, action: "wide", edit: "title card" },
      { n: 2, action: "close", edit: "" },
    ]);
  });
  it("names batch folders", () => {
    expect(folderName("2026-10-25", "Evals: before demos!")).toBe("2026-10-25_evals-before-demos/");
    expect(folderName("2026-10-25", "")).toBe("2026-10-25_untitled/");
  });
});

describe("CSV import", () => {
  it("detects delimiters and quoted fields", () => {
    expect(detectDelimiter("a\tb\tc")).toBe("\t");
    expect(parseDelimited('a,"b, c",d\n1,"say ""hi""",3', ",")).toEqual([
      ["a", "b, c", "d"],
      ["1", 'say "hi"', "3"],
    ]);
  });
  it("parses k/m view counts", () => {
    expect(toNumber("1.2m")).toBe(1_200_000);
    expect(toNumber("45K")).toBe(45_000);
    expect(toNumber("12,400")).toBe(12_400);
  });
  it("maps headers, computes multiples and flags ≥ threshold rows", () => {
    const sheet = parseSheet("Video URL,Views,Caption\nhttps://x/1,60000,first\nhttps://x/2,4000,second\n,0,empty");
    const map = autoMap(sheet.headers);
    expect(map.views).toBe(1);
    expect(map.link).toBe(0);
    const rows = previewRows(sheet, map, { followers: 10000, handle: "@a", threshold: 5 });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ multiple: 6, outlier: true, handle: "@a", caption: "first" });
    expect(rows[1]).toMatchObject({ multiple: 0.4, outlier: false });
  });
  it("uses a per-row follower column when present", () => {
    const sheet = parseSheet("username\tfollowers\tplays\nann\t1000\t9000");
    const rows = previewRows(sheet, autoMap(sheet.headers), { followers: 0, handle: "", threshold: 5 });
    expect(rows[0]).toMatchObject({ handle: "ann", followers: 1000, multiple: 9, outlier: true });
  });
});
