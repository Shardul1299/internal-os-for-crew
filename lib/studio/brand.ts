// The prompt-facing profile shape (Upcreate's BrandConfig), built from creator_profiles.
// Prompts only ever see the creator's own Profile (BRIEF §19.15) — never tier, rates or Crew notes.
import type { creatorProfiles } from "../db/schema";

export type BrandConfig = {
  handle: string;
  nameField: string;
  niche: string;
  subniches: string[];
  occupation: string;
  founderStory: string;
  colors: { background: string; foreground: string; muted: string; border: string; color4: string; color5: string };
  fonts: { heading: string; body: string };
  assetTypes: string[];
  bioLink: string;
  accountStatus: "new" | "established";
  pillarRatio: { authority: number; journey: number };
  conceptRatio: { proven: number; doubleDown: number; experimental: number };
  postingCadence: { tier: string; timesPerWeek: string; days: string[] };
  hookPrefs: string[];
  formatPrefs: string[];
  ctaStatus: string;
  manychatSetup: boolean;
  equipment: string[];
  aiStack: string[];
  automateWorkflows: string[];
  humanAlpha: string;
  proprietaryValue: string;
  journeyAssets: string;
  onboardingComplete: boolean;
};

export const DEFAULT_COLORS = { background: "#0B0B0B", foreground: "#F6E8CD", muted: "#CFC2A9", border: "#8C8370", color4: "#FF409B", color5: "#262421" };

type ProfileRow = typeof creatorProfiles.$inferSelect;

export function toBrandConfig(p: ProfileRow, displayName?: string): BrandConfig {
  return {
    handle: p.handle,
    nameField: p.nameField || displayName || "",
    niche: p.niche,
    subniches: p.subniches,
    occupation: p.occupation,
    founderStory: p.founderStory,
    colors: p.colors ?? DEFAULT_COLORS,
    fonts: p.fonts ?? { heading: "Archivo Black", body: "Inter" },
    assetTypes: p.assetTypes,
    bioLink: p.bioLink,
    accountStatus: p.accountStatus,
    pillarRatio: p.pillarRatio,
    conceptRatio: { proven: p.conceptRatio.proven, doubleDown: p.conceptRatio.double_down, experimental: p.conceptRatio.experimental },
    postingCadence: { tier: p.postingCadence.tier, timesPerWeek: p.postingCadence.times_per_week, days: p.postingCadence.days },
    hookPrefs: p.hookPrefs,
    formatPrefs: p.formatPrefs,
    ctaStatus: p.ctaStatus,
    manychatSetup: p.manychatSetup,
    equipment: p.equipment,
    aiStack: p.aiStack,
    automateWorkflows: p.automateWorkflows,
    humanAlpha: p.humanAlpha,
    proprietaryValue: p.proprietaryValue,
    journeyAssets: p.journeyAssets,
    onboardingComplete: p.onboardingComplete,
  };
}
