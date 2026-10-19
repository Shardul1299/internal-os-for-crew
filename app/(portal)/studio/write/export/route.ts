// Script bank → Word (BRIEF §19.6.6): one script (?script=id) or the whole bank plus templates.
import { NextResponse } from "next/server";
import { myScripts, scriptFor, templates, docxResponse, studioRouteCtx } from "@/lib/queries/studio";
import { buildScriptDoc, buildScriptBankDoc, toBuffer } from "@/lib/studio/docx-export";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await studioRouteCtx();
  if (!ctx) return new NextResponse("Not found", { status: 404 });
  const id = new URL(req.url).searchParams.get("script");
  if (id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Not found", { status: 404 });
    const s = await scriptFor(ctx, id);
    if (!s) return new NextResponse("Not found", { status: 404 });
    const doc = buildScriptDoc({ title: s.title, pillar: s.pillar, content_type: s.contentType, angle_or_story_type: s.angleOrStoryType, format: s.format, body_black: s.bodyBlack, body_red: s.bodyRed, body_green: s.bodyGreen, cta_type: s.ctaType, funnel_stage: s.funnelStage });
    return docxResponse(await toBuffer(doc), `${s.title.slice(0, 60) || "script"}.docx`);
  }
  const [scripts, tpl] = await Promise.all([myScripts(ctx), templates(ctx)]);
  const doc = buildScriptBankDoc(
    scripts.map((s) => ({ title: s.title, pillar: s.pillar, content_type: s.contentType, angle_or_story_type: s.angleOrStoryType, format: s.format, body_black: s.bodyBlack, body_red: s.bodyRed, body_green: s.bodyGreen, status: s.status })),
    tpl.map((t) => ({ name: t.name, pillar: t.pillar, angle: t.angle, template_text: t.templateText })),
  );
  return docxResponse(await toBuffer(doc), "script-bank.docx");
}
