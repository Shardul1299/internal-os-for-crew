// Calendar → Word (BRIEF §19.3): date, pillar, concept, topic, angle, format, CTA, funnel, status.
import { NextResponse } from "next/server";
import { getConfig } from "@/lib/settings";
import { toBrandConfig } from "@/lib/studio/brand";
import { buildCalendarDoc, toBuffer } from "@/lib/studio/docx-export";
import { calendarItems, ensureProfile, studioWindow, docxResponse, studioRouteCtx } from "@/lib/queries/studio";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await studioRouteCtx();
  if (!ctx) return new NextResponse("Not found", { status: 404 });
  const cfg = await getConfig();
  const win = studioWindow(cfg);
  const [items, profile] = await Promise.all([calendarItems(ctx, win.from, win.to), ensureProfile(ctx)]);
  const doc = buildCalendarDoc(
    items
      .filter((i) => i.kind !== "blackout")
      .map((i) => ({
        date: i.date,
        pillar: i.pillar ?? "",
        concept_bucket: (i.conceptBucket ?? "").replace("_", " "),
        content_type: i.contentType ?? "",
        topic: i.topic || i.title,
        angle: i.angle ?? "",
        format: i.format ?? "",
        cta_type: i.ctaType ?? "",
        funnel_stage: (i.funnelStage ?? "").toUpperCase(),
        status: i.studioStatus,
      })),
    toBrandConfig(profile, ctx.displayName),
  );
  return docxResponse(await toBuffer(doc), `calendar-${win.from}.docx`);
}
