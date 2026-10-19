"use server";
// Creator Studio — the one AI action (BRIEF §19.15). It takes a generator key and the form
// inputs, rebuilds the prompt server-side from the creator's stored Profile, and calls the
// org-level engine. Without a key every generator still works through Copy prompt.
import { z } from "zod";
import { guard, ok, fail, type ActionResult } from "./result";
import { studioActor, ensureProfile } from "@/lib/queries/studio";
import { GENERATOR_KEYS, buildGeneratorPrompt } from "@/lib/studio/generators";
import { generateText } from "@/lib/studio/ai";
import { toBrandConfig } from "@/lib/studio/brand";
import { getConfig } from "@/lib/settings";

const Input = z.object({ gen: z.enum(GENERATOR_KEYS), inputs: z.record(z.string(), z.string().max(40000)) });

export async function runGenerator(gen: string, inputs: Record<string, string>): Promise<ActionResult> {
  return guard(async () => {
    const ctx = await studioActor();
    const i = Input.safeParse({ gen, inputs });
    if (!i.success) return fail("Check the inputs");
    const [profile, cfg] = await Promise.all([ensureProfile(ctx), getConfig()]);
    const prompt = buildGeneratorPrompt(i.data.gen, toBrandConfig(profile, ctx.displayName), i.data.inputs, { ideationCount: cfg.n.ideation_batch_size, carouselSlides: cfg.n.carousel_default_slides });
    const r = await generateText(prompt, { creatorId: ctx.creatorId, generator: i.data.gen });
    if (!r.ok) {
      if (r.error === "no_key") return fail("No AI key set — copy the prompt instead.");
      if (r.error === "quota") return fail("The AI provider is rate-limited — try again or copy the prompt.");
      return fail(r.message ? `Generation failed: ${r.message.slice(0, 120)}` : "Generation failed — copy the prompt instead.");
    }
    return ok(undefined, { data: { text: r.text } });
  });
}
