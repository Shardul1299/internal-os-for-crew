import { describe, it, expect } from "vitest";
import { parseCsv, guessMapping, prepareImport, validateMapping, normalizeHandle, normalizeSubCategory, normalizeSource, normalizePlatform } from "@/lib/rules/creator-import";

const defaults = { source: null, subCategory: null, platform: "instagram" as const };

describe("CSV parsing", () => {
  it("handles quotes, doubled quotes, CRLF and blank lines", () => {
    const rows = parseCsv('name,notes\r\n"Rao, Arjun","Says ""ship it"""\r\n\r\nMeera,ok\n');
    expect(rows).toEqual([
      ["name", "notes"],
      ["Rao, Arjun", 'Says "ship it"'],
      ["Meera", "ok"],
    ]);
  });
  it("reads tab-separated pastes from a spreadsheet", () => {
    expect(parseCsv("name\thandle\nA\t@a")).toEqual([
      ["name", "handle"],
      ["A", "@a"],
    ]);
  });
});

describe("column mapping", () => {
  it("guesses columns from common headers", () => {
    expect(guessMapping(["Creator Name", "IG Handle", "Platform", "Category", "Found via", "Notes", "City"])).toEqual({
      name: 0,
      handle: 1,
      platform: 2,
      sub_category: 3,
      source: 4,
      notes: 5,
      city: 6,
    });
  });
  it("requires name and handle, real columns, no shared columns", () => {
    expect(validateMapping({ name: 0 }, 3)).toContain("Map a column to handle");
    expect(validateMapping({ name: 0, handle: 5 }, 3)).toContain("Column for handle doesn't exist");
    expect(validateMapping({ name: 0, handle: 0 }, 3)).toContain("Two fields share a column");
    expect(validateMapping({ name: 0, handle: 1 }, 3)).toEqual([]);
  });
});

describe("normalisation", () => {
  it("handles from URLs and @", () => {
    expect(normalizeHandle("https://www.instagram.com/Meera.Builds/?hl=en")).toBe("meera.builds");
    expect(normalizeHandle("@Arjun")).toBe("arjun");
  });
  it("sub-categories, sources and platforms from labels", () => {
    expect(normalizeSubCategory("AI educator")).toBe("ai_educator");
    expect(normalizeSubCategory("Founder / operator")).toBe("founder_operator");
    expect(normalizeSubCategory("cooking")).toBeNull();
    expect(normalizeSource("LIT challenge")).toBe("program");
    expect(normalizeSource("Ayush network")).toBe("ayush_network");
    expect(normalizePlatform("IG")).toBe("instagram");
    expect(normalizePlatform("twitter")).toBe("x");
  });
});

describe("prepareImport", () => {
  const rows = [
    ["Meera", "@meera", "ig", "AI educator", "outbound", "great", "Pune"],
    ["Dup", "MEERA", "ig", "AI educator", "outbound", "", ""],
    ["Old", "already.here", "ig", "AI educator", "outbound", "", ""],
    ["", "nobody", "ig", "AI educator", "outbound", "", ""],
    ["Chef", "chef", "ig", "cooking", "outbound", "", ""],
    ["NoSrc", "nosrc", "ig", "AI educator", "", "", ""],
  ];
  const mapping = { name: 0, handle: 1, platform: 2, sub_category: 3, source: 4, notes: 5, city: 6 };
  const out = prepareImport(rows, mapping, defaults, ["Already.Here"]);
  it("marks new rows", () => {
    expect(out[0]).toMatchObject({ status: "new", handle: "meera", platform: "instagram", subCategory: "ai_educator", source: "outbound", city: "Pune", notes: "great", line: 2 });
  });
  it("skips duplicates within the file and against the database, by handle", () => {
    expect(out[1].status).toBe("duplicate");
    expect(out[2].status).toBe("duplicate");
  });
  it("rejects rows missing required values or with unknown values", () => {
    expect(out[3]).toMatchObject({ status: "invalid", reason: "Name missing" });
    expect(out[4]).toMatchObject({ status: "invalid", reason: 'Unknown sub-category "cooking"' });
    expect(out[5]).toMatchObject({ status: "invalid", reason: "Source missing" });
  });
  it("defaults fill missing source / sub-category", () => {
    const o = prepareImport([["A", "a", "", "", ""]], mapping, { source: "outbound", subCategory: "vc_analyst", platform: "instagram" }, []);
    expect(o[0]).toMatchObject({ status: "new", source: "outbound", subCategory: "vc_analyst" });
  });
  it("watchlist rows carry a Filter score that must be valid; other stages can't be imported", () => {
    const m = { ...mapping, stage: 7, consent: 8, aesthetics: 9, taste: 10, personality: 11, sentence: 12 };
    const base = ["W", "w", "ig", "AI educator", "outbound", "", ""];
    const ok = prepareImport([[...base, "Watchlist", "yes", "4", "4", "5", "Sharp."]], m, defaults, []);
    expect(ok[0]).toMatchObject({ status: "new", wantsWatchlist: true, consent: "opted_in", score: { aesthetics: 4, taste: 4, personality: 5, sentence: "Sharp." } });
    const bad = prepareImport([[...base, "watchlist", "yes", "6", "4", "5", "Sharp."]], m, defaults, []);
    expect(bad[0].status).toBe("invalid");
    const noSentence = prepareImport([[...base, "watchlist", "yes", "4", "4", "5", ""]], m, defaults, []);
    expect(noSentence[0].reason).toBe("Filter: One sentence is required");
    const roster = prepareImport([[...base, "roster", "", "", "", "", ""]], m, defaults, []);
    expect(roster[0].reason).toBe('Stage "roster" can\'t be imported');
  });
});
