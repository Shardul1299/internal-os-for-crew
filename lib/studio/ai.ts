// AI engine — BRIEF §19.15. One org-level provider key (set by the Owner in Settings,
// encrypted at rest, masked in the UI) drives every Studio generator. Without a key,
// every generator still works through "Copy prompt". Ported from Upcreate.
import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { aiSettings, aiUsage } from "../db/schema";

export const AI_PROVIDERS = ["gemini", "openai", "anthropic", "custom"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI",
  anthropic: "Anthropic (Claude)",
  custom: "Custom (OpenAI-compatible endpoint)",
};

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  gemini: "gemini-3.8-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-5-5",
  custom: "",
};

export type AiSettings = { provider: AiProvider; apiKey: string; model: string; customEndpoint: string };

function key() {
  return createHash("sha256").update(process.env.AUTH_SECRET ?? "snoball-dev").digest();
}

export function encryptSecret(plain: string): string {
  if (!plain) return "";
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return ["v1", iv.toString("base64"), c.getAuthTag().toString("base64"), enc.toString("base64")].join(":");
}

export function decryptSecret(stored: string): string {
  if (!stored) return "";
  const [v, iv, tag, data] = stored.split(":");
  if (v !== "v1") return "";
  try {
    const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
    d.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([d.update(Buffer.from(data, "base64")), d.final()]).toString("utf8");
  } catch {
    return "";
  }
}

export async function getAiSettings(): Promise<AiSettings> {
  const [row] = await db.select().from(aiSettings).where(eq(aiSettings.id, 1));
  const fromDb: AiSettings | null = row
    ? { provider: row.provider, apiKey: decryptSecret(row.apiKey), model: row.model, customEndpoint: row.customEndpoint }
    : null;
  if (fromDb?.apiKey) return fromDb;
  const envKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  const envProvider = (process.env.AI_PROVIDER as AiProvider) || "gemini";
  if (envKey) return { provider: envProvider, apiKey: envKey, model: process.env.AI_MODEL || "", customEndpoint: "" };
  return fromDb ?? { provider: "gemini", apiKey: "", model: "", customEndpoint: "" };
}

/** For the Settings page: never send the key back, only whether one is set and its last 4 characters. */
export async function getMaskedAiSettings() {
  const s = await getAiSettings();
  return { provider: s.provider, model: s.model, customEndpoint: s.customEndpoint, hasKey: !!s.apiKey, keyPreview: s.apiKey ? `••••${s.apiKey.slice(-4)}` : "" };
}

export async function saveAiSettings(s: AiSettings, keepKey: boolean): Promise<void> {
  const [row] = await db.select().from(aiSettings).where(eq(aiSettings.id, 1));
  const apiKey = keepKey && row ? row.apiKey : encryptSecret(s.apiKey);
  await db
    .insert(aiSettings)
    .values({ id: 1, provider: s.provider, apiKey, model: s.model, customEndpoint: s.customEndpoint })
    .onConflictDoUpdate({ target: aiSettings.id, set: { provider: s.provider, apiKey, model: s.model, customEndpoint: s.customEndpoint, updatedAt: new Date() } });
}

export async function clearAiKey(): Promise<void> {
  await db.update(aiSettings).set({ apiKey: "", updatedAt: new Date() }).where(eq(aiSettings.id, 1));
}

export type GenerateResult =
  | { ok: true; text: string }
  | { ok: false; error: "no_key" | "quota" | "generation_failed"; message?: string };


export async function generateText(prompt: string, meta: { creatorId: string | null; generator: string }): Promise<GenerateResult> {
  const settings = await getAiSettings();
  if (!settings.apiKey) return { ok: false, error: "no_key" };
  let result: GenerateResult;
  try {
    switch (settings.provider) {
      case "gemini":
        result = await callGemini(prompt, settings);
        break;
      case "openai":
        result = await callOpenAiCompatible(prompt, settings, "https://api.openai.com/v1/chat/completions");
        break;
      case "anthropic":
        result = await callAnthropic(prompt, settings);
        break;
      case "custom":
        result = settings.customEndpoint
          ? await callOpenAiCompatible(prompt, settings, settings.customEndpoint)
          : { ok: false, error: "generation_failed", message: "No custom endpoint set" };
        break;
      default:
        result = { ok: false, error: "generation_failed", message: "Unknown provider" };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isQuota = /quota|rate.?limit|429|RESOURCE_EXHAUSTED/i.test(message);
    result = { ok: false, error: isQuota ? "quota" : "generation_failed", message };
  }
  if (result.ok) {
    await db.insert(aiUsage).values({
      creatorId: meta.creatorId,
      generator: meta.generator,
      provider: settings.provider,
      tokensEst: Math.round((prompt.length + result.text.length) / 4),
    });
  }
  return result;
}

async function callGemini(prompt: string, settings: AiSettings): Promise<GenerateResult> {
  const model = settings.model || DEFAULT_MODELS.gemini;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || `Gemini request failed (${res.status})`;
    throw new Error(message);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  if (!text) return { ok: false, error: "generation_failed", message: "Empty response from Gemini" };
  return { ok: true, text };
}

async function callOpenAiCompatible(prompt: string, settings: AiSettings, endpoint: string): Promise<GenerateResult> {
  const model = settings.model || DEFAULT_MODELS.openai;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) return { ok: false, error: "generation_failed", message: "Empty response from provider" };
  return { ok: true, text };
}

async function callAnthropic(prompt: string, settings: AiSettings): Promise<GenerateResult> {
  const model = settings.model || DEFAULT_MODELS.anthropic;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": settings.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || `Anthropic request failed (${res.status})`;
    throw new Error(message);
  }
  const text = data?.content?.map((p: { text?: string }) => p.text || "").join("") || "";
  if (!text) return { ok: false, error: "generation_failed", message: "Empty response from Anthropic" };
  return { ok: true, text };
}
