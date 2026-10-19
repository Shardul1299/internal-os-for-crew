import { describe, it, expect } from "vitest";
import { hasDisclosure, disclosureLine, canSubmitSponsoredDraft } from "@/lib/rules/studio";

describe("studio §19.6.7 disclosure", () => {
  it("the inserted disclosure line satisfies its own standard", () => {
    for (const s of ["asci", "ftc", "both"] as const) expect(hasDisclosure(s, disclosureLine(s))).toBe(true);
  });
  it("plain editing notes don't count", () => {
    expect(hasDisclosure("asci", "Cut to b-roll, add captions")).toBe(false);
  });
  it("submit is blocked until the line is in GREEN, then passes", () => {
    const base = { text: "Our agent ships evals", green: "Cut to b-roll", topicFilters: [], disclosureStandard: "ftc" as const, deliverableStatus: "drafting" };
    expect(canSubmitSponsoredDraft(base).reasons).toContain("Disclosure line missing in GREEN");
    expect(canSubmitSponsoredDraft({ ...base, green: `${disclosureLine("ftc")}\nCut to b-roll` }).ok).toBe(true);
  });
});
