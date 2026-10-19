import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import type { BrandConfig } from "./brand";
import {
  SCRIPT_ANGLES,
  STORY_TYPES,
  JOURNEY_SERIES_FORMATS,
  AUTHORITY_CONTENT_FORMATS,
  FILMING_FORMATS,
  UNIVERSAL_HOOK_TEMPLATES,
  PROFILE_RIGHT_WRONG,
  FIVE_X_OUTLIER_RULE,
  TRANSCRIPT_TEMPLATIZE_PROMPT,
  TOOLS,
  HOOK_STACK_EXAMPLES,
  REACH_VS_CONVERSION_EXAMPLE,
  HISTORICAL_MEDIA_TIP,
} from "./reference";
import {
  buildHookStackPrompt,
  buildScriptPrompt,
  buildCaptionPrompt,
  buildCalendarIdeationPrompt,
  buildDoubleDownPrompt,
  buildKeywordBankPrompt,
  buildTopicResearchPrompt,
  buildProblemResearchPrompt,
  buildIndustryEntrySeriesPrompt,
  buildRawIdeaDeveloperPrompt,
  buildBioPrompt,
  buildManyChatMessagePrompt,
  buildOutlierDeconstructionPrompt,
} from "./prompts";

const h1 = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
const h2 = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } });
const h3 = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 180, after: 90 } });
const p = (text: string) => new Paragraph({ children: [new TextRun(text)], spacing: { after: 120 } });
const bullet = (text: string) => new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } });
const label = (l: string, v: string) =>
  new Paragraph({
    children: [new TextRun({ text: `${l}: `, bold: true }), new TextRun(v || "—")],
    spacing: { after: 60 },
  });
const promptBlock = (text: string) =>
  new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 20 })],
    spacing: { after: 200 },
    shading: { fill: "F2F0EA" },
  });

export async function toBuffer(doc: Document): Promise<Buffer> {
  return Packer.toBuffer(doc);
}

// ---------- Single script ----------
export function buildScriptDoc(script: {
  title: string;
  pillar: string;
  content_type: string;
  angle_or_story_type: string;
  format: string;
  body_black: string;
  body_red: string;
  body_green: string;
  cta_type: string;
  funnel_stage: string;
}) {
  const doc = new Document({
    sections: [
      {
        children: [
          h1(script.title || "Untitled script"),
          label("Pillar", script.pillar),
          label("Content type", script.content_type),
          label("Angle / story type", script.angle_or_story_type),
          label("Format", script.format),
          label("CTA", `${script.cta_type} (${script.funnel_stage?.toUpperCase()})`),
          h2("Black — spoken dialogue"),
          ...(script.body_black || "—").split("\n").filter(Boolean).map(bullet),
          h2("Red — physical actions / camera moves"),
          ...(script.body_red || "—").split("\n").filter(Boolean).map(bullet),
          h2("Green — editing / graphic instructions"),
          ...(script.body_green || "—").split("\n").filter(Boolean).map(bullet),
        ],
      },
    ],
  });
  return doc;
}

// ---------- Full script bank ----------
export function buildScriptBankDoc(
  scripts: {
    title: string;
    pillar: string;
    content_type: string;
    angle_or_story_type: string;
    format: string;
    body_black: string;
    body_red: string;
    body_green: string;
    status: string;
  }[],
  templates: { name: string; pillar: string; angle: string; template_text: string }[]
) {
  const children: Paragraph[] = [h1("Script Bank"), p(`${scripts.length} scripts, ${templates.length} fill-in-the-blank templates.`)];

  for (const s of scripts) {
    children.push(h2(s.title || "Untitled script"));
    children.push(label("Pillar / type", `${s.pillar} / ${s.content_type}`));
    children.push(label("Angle / story type", s.angle_or_story_type));
    children.push(label("Format", s.format));
    children.push(label("Status", s.status));
    children.push(h3("Black — dialogue"));
    (s.body_black || "—").split("\n").filter(Boolean).forEach((l) => children.push(bullet(l)));
    if (s.body_red) {
      children.push(h3("Red — actions"));
      s.body_red.split("\n").filter(Boolean).forEach((l) => children.push(bullet(l)));
    }
    if (s.body_green) {
      children.push(h3("Green — editing"));
      s.body_green.split("\n").filter(Boolean).forEach((l) => children.push(bullet(l)));
    }
  }

  if (templates.length) {
    children.push(h1("Fill-in-the-Blank Templates"));
    for (const t of templates) {
      children.push(h2(t.name));
      children.push(label("Pillar / angle", `${t.pillar} / ${t.angle || "—"}`));
      children.push(promptBlock(t.template_text));
    }
  }

  return new Document({ sections: [{ children }] });
}

// ---------- Calendar ----------
export function buildCalendarDoc(
  items: {
    date: string;
    pillar: string;
    concept_bucket: string;
    content_type: string;
    topic: string;
    angle: string;
    format: string;
    cta_type: string;
    funnel_stage: string;
    status: string;
  }[],
  brand: BrandConfig
) {
  const headerCells = ["Date", "Pillar", "Concept", "Type", "Topic", "Angle", "Format", "CTA", "Funnel", "Status"];
  const headerRow = new TableRow({
    tableHeader: true,
    children: headerCells.map(
      (t) =>
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })],
        })
    ),
  });

  const rows = items.map(
    (i) =>
      new TableRow({
        children: [i.date, i.pillar, i.concept_bucket, i.content_type, i.topic, i.angle, i.format, i.cta_type, i.funnel_stage, i.status].map(
          (v) => new TableCell({ children: [new Paragraph(v || "—")] })
        ),
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          h1("Content Calendar"),
          p(`${brand.nameField} — ${items.length} items, posting ${brand.postingCadence.timesPerWeek}x/week.`),
          label(
            "Target ratios",
            `Pillar ${brand.pillarRatio.authority}/${brand.pillarRatio.journey} · Concept ${brand.conceptRatio.proven}/${brand.conceptRatio.doubleDown}/${brand.conceptRatio.experimental}`
          ),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...rows] }),
        ],
      },
    ],
  });
  return doc;
}

// ---------- Full master prompt library ----------
export function buildPromptLibraryDoc(brand: BrandConfig) {
  const exampleTopic = "[YOUR TOPIC]";
  const exampleSubniche = brand.subniches[0] || "[SUB-NICHE]";

  const children: Paragraph[] = [
    h1("Upforge Content OS — Master Prompt Library"),
    p(`Generated for ${brand.nameField}. Every prompt below is pre-filled with your real brand context (niche, sub-niches, founder story, proprietary value) — replace the bracketed placeholders with your specifics and paste into Gemini, Claude, or ChatGPT.`),
  ];

  // 1. Brand & Profile
  children.push(h1("1. Brand & Profile"));
  children.push(h2("Bio generator (4-line framework)"));
  children.push(promptBlock(buildBioPrompt(brand)));
  children.push(h2("Profile checklist — right vs. wrong"));
  PROFILE_RIGHT_WRONG.forEach((r) => {
    children.push(label(r.field, `✗ ${r.wrong}  |  ✓ ${r.right}`));
  });

  // 2. Research
  children.push(h1("2. Research"));
  children.push(h2("The 5x outlier rule"));
  children.push(p(FIVE_X_OUTLIER_RULE));
  children.push(h2("Keyword bank generator"));
  children.push(promptBlock(buildKeywordBankPrompt(brand)));
  children.push(h2("Topic & framework research"));
  children.push(promptBlock(buildTopicResearchPrompt(brand, { subniche: exampleSubniche })));
  children.push(h2("Problem research"));
  children.push(promptBlock(buildProblemResearchPrompt(brand, { subniche: exampleSubniche })));
  children.push(h2("Outlier deconstruction (analyze why a video worked)"));
  children.push(promptBlock(buildOutlierDeconstructionPrompt({ transcriptOrDescription: "[PASTE TRANSCRIPT OR DESCRIPTION]" })));
  children.push(h2("Transcript → fill-in-the-blank template"));
  children.push(p(TRANSCRIPT_TEMPLATIZE_PROMPT));
  children.push(h2("Raw idea developer (turn a messy note into a full 7-factor brief)"));
  children.push(promptBlock(buildRawIdeaDeveloperPrompt(brand, { rawIdea: "[YOUR RAW IDEA]" })));

  // 3. Hooks
  children.push(h1("3. Hooks"));
  children.push(h2("Hook stack generator"));
  children.push(promptBlock(buildHookStackPrompt(brand, { topic: exampleTopic })));
  children.push(h2("7 hook / script angles"));
  SCRIPT_ANGLES.forEach((a) => {
    children.push(h3(a.name));
    children.push(p(a.description));
    children.push(promptBlock(a.fillInTemplate));
  });
  children.push(h2("Universal cross-niche hook templates"));
  UNIVERSAL_HOOK_TEMPLATES.forEach((t) => children.push(bullet(t)));

  // 4. Scripts
  children.push(h1("4. Scripts"));
  children.push(h2("Authority / educational script generator"));
  children.push(
    promptBlock(
      buildScriptPrompt(brand, {
        pillar: "authority",
        contentType: "educational / authority",
        angleOrStoryType: SCRIPT_ANGLES[0].name,
        topic: exampleTopic,
      })
    )
  );
  children.push(h2("9 authority content formats"));
  AUTHORITY_CONTENT_FORMATS.forEach((f) => children.push(bullet(f)));
  children.push(h2("Storytelling script generator"));
  children.push(
    promptBlock(
      buildScriptPrompt(brand, {
        pillar: "journey",
        contentType: "storytelling",
        angleOrStoryType: STORY_TYPES[0].name,
        topic: exampleTopic,
      })
    )
  );
  children.push(h2("7 story types"));
  STORY_TYPES.forEach((s) => {
    children.push(h3(s.name));
    children.push(p(s.description));
    children.push(promptBlock(s.fillInTemplate));
  });
  children.push(h2("Journey series formats"));
  JOURNEY_SERIES_FORMATS.forEach((f) => children.push(label(f.name, f.description)));
  children.push(h2('Signature series builder — "How to Enter an Industry"'));
  children.push(promptBlock(buildIndustryEntrySeriesPrompt(brand, { industry: "[INDUSTRY]", episodes: 5 })));

  // 5. Production
  children.push(h1("5. Production"));
  children.push(h2("12 filming formats"));
  FILMING_FORMATS.forEach((f) => children.push(label(f.name, f.description)));
  children.push(h2("Equipment on hand"));
  brand.equipment.forEach((e) => children.push(bullet(e)));

  // 6. Captions, CTA & Funnel
  children.push(h1("6. Captions, CTA & Funnel"));
  children.push(h2("Caption generator"));
  children.push(promptBlock(buildCaptionPrompt(brand, { hook: "[YOUR HOOK]", ctaType: "follow", topic: exampleTopic })));
  children.push(h2("ManyChat automated DM message writer"));
  children.push(promptBlock(buildManyChatMessagePrompt(brand, { triggerWord: "[TRIGGER WORD]", offer: "[YOUR OFFER]" })));

  // 7. Calendar & Batching
  children.push(h1("7. Calendar & Batching"));
  children.push(h2("Batch ideation generator"));
  children.push(
    promptBlock(
      buildCalendarIdeationPrompt(brand, { count: 12, pillarRatio: brand.pillarRatio, conceptRatio: brand.conceptRatio })
    )
  );

  // 8. Analytics
  children.push(h1("8. Analytics"));
  children.push(h2("Double-down variant generator"));
  children.push(promptBlock(buildDoubleDownPrompt(brand, { topic: exampleTopic })));

  // 9. Tools & Integrations
  children.push(h1("9. Tools & Integrations"));
  children.push(p("Every tool the playbook names, and its status in this app."));
  TOOLS.forEach((t) => {
    children.push(h3(`${t.name} — ${t.status === "connected" ? "connected in-app" : t.status === "planned" ? "future / planned" : "manual (external)"}`));
    children.push(label("Purpose", t.purpose));
    children.push(p(t.note));
  });

  // 10. Extra calibration reference
  children.push(h1("10. Calibration Reference"));
  children.push(h2("Reach vs. conversion — the real numbers"));
  children.push(label(REACH_VS_CONVERSION_EXAMPLE.easy.label, `${REACH_VS_CONVERSION_EXAMPLE.easy.views} → ${REACH_VS_CONVERSION_EXAMPLE.easy.result} — ${REACH_VS_CONVERSION_EXAMPLE.easy.verdict}`));
  children.push(label(REACH_VS_CONVERSION_EXAMPLE.complex.label, `${REACH_VS_CONVERSION_EXAMPLE.complex.views} → ${REACH_VS_CONVERSION_EXAMPLE.complex.result} — ${REACH_VS_CONVERSION_EXAMPLE.complex.verdict}`));
  children.push(h2("Real hook stack examples"));
  HOOK_STACK_EXAMPLES.forEach((e) => {
    children.push(bullet(`Written: "${e.written}" | Verbal: "${e.verbal}" | Visual: ${e.visual}`));
  });
  children.push(h2("Historical media tip (storytelling)"));
  children.push(p(HISTORICAL_MEDIA_TIP));

  return new Document({ sections: [{ children, properties: { titlePage: false } }] });
}
