// Shared type for every carousel seed-data batch file. Mirrors the
// BatchScript convention in octBatch.ts so carousel content batches follow
// the same shape/discipline as script content batches.

export type CarouselSlideSeed = { role: "hook" | "body" | "cta"; headline: string; supportingText: string };

export type CarouselSeed = {
  title: string;
  pillar: "authority" | "journey";
  contentType: "educational" | "storytelling" | "authority" | "other";
  // One of CAROUSEL_ARCHETYPES ids in lib/carousel-reference.ts:
  // listicle | single_concept | before_after | myth_bust | story_arc | comparison | tutorial | quote_chain
  archetype: string;
  ctaType: "save" | "share" | "comment" | "follow" | "link";
  funnelStage: "tofu" | "mofu" | "bofu";
  topicTag: string;
  segment: string;
  backgroundStyle: "solid" | "gradient" | "photo" | "screenshot" | "whiteboard" | "minimalist";
  // One of CAROUSEL_BACKGROUND_CATEGORIES ids in lib/carousel-reference.ts, or "" if backgroundStyle isn't "photo":
  // desk_laptop | pov_hands | meeting_blur | coffee_shop | workspace_flatlay | skyline | bookshelf | walking_commute | textured_neutral | window_light
  backgroundCategory: string;
  designNotes: string;
  slides: CarouselSlideSeed[];
};
