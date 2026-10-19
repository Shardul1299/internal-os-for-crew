// Prompt Library → Word (BRIEF §19.11), pre-filled with the creator's own Profile only.
import { NextResponse } from "next/server";
import { ensureProfile, docxResponse, studioRouteCtx } from "@/lib/queries/studio";
import { toBrandConfig } from "@/lib/studio/brand";
import { buildPromptLibraryDoc, toBuffer } from "@/lib/studio/docx-export";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await studioRouteCtx();
  if (!ctx) return new NextResponse("Not found", { status: 404 });
  const profile = await ensureProfile(ctx);
  return docxResponse(await toBuffer(buildPromptLibraryDoc(toBrandConfig(profile, ctx.displayName))), "prompt-library.docx");
}
