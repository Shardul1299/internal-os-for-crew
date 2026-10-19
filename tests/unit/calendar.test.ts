import { describe, it, expect, vi, beforeAll } from "vitest";
import { toCsv, parseCsv, csvRecords } from "@/lib/csv";
vi.mock("server-only", () => ({}));

let mod: typeof import("@/lib/calendar");
beforeAll(async () => {
  process.env.AUTH_SECRET = "test-secret";
  mod = await import("@/lib/calendar");
});

describe("calendar feed §11", () => {
  it("token round-trips and rejects tampering", () => {
    const tok = mod.calendarToken("user-123");
    expect(mod.verifyCalendarToken(tok)).toBe("user-123");
    expect(mod.verifyCalendarToken(`${tok}.ics`)).toBe("user-123");
    expect(mod.verifyCalendarToken(tok.replace(/.$/, (c) => (c === "a" ? "b" : "a")))).toBe(null);
    expect(mod.verifyCalendarToken("user-999." + tok.split(".")[1])).toBe(null);
    expect(mod.verifyCalendarToken("garbage")).toBe(null);
  });

  it("builds RFC 5545 events: all-day, timed with weekly rule", () => {
    const ics = mod.buildIcs("Test", [
      { uid: "a", title: "Sunday shoot, studio", date: "2026-10-25", location: "OWLED; Indiranagar" },
      { uid: "b", title: "Pipeline review", start: "2026-10-26T10:00", minutes: 30, rrule: "FREQ=WEEKLY;BYDAY=MO" },
    ]);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261025");
    expect(ics).toContain("DTEND;VALUE=DATE:20261026");
    expect(ics).toContain("SUMMARY:Sunday shoot\\, studio");
    expect(ics).toContain("LOCATION:OWLED\\; Indiranagar");
    expect(ics).toContain("DTSTART;TZID=Asia/Kolkata:20261026T100000");
    expect(ics).toContain("DTEND;TZID=Asia/Kolkata:20261026T103000");
    expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO");
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });
});

describe("csv export/import", () => {
  it("quotes, neutralises formulas and parses back", () => {
    const out = toCsv(["a", "b"], [["x,y", '=HYPERLINK("z")'], ["line\nbreak", -5]]);
    expect(out).toBe('a,b\r\n"x,y","\'=HYPERLINK(""z"")"\r\n"line\nbreak",-5\r\n');
    expect(parseCsv(out)).toEqual([["a", "b"], ["x,y", "'=HYPERLINK(\"z\")"], ["line\nbreak", "-5"]]);
    expect(csvRecords("Display Name,Sub category\nAsha,ai_educator\n")).toEqual([{ display_name: "Asha", sub_category: "ai_educator" }]);
  });
});

import { signUndo, verifyUndo } from "@/lib/undo-token";
describe("undo tokens", () => {
  it("only verify for the same row within the window", () => {
    const t = signUndo("deals", "abc", 1_000);
    expect(verifyUndo("deals", "abc", t, 5_000)).toBe(true);
    expect(verifyUndo("deals", "abd", t, 5_000)).toBe(false);
    expect(verifyUndo("creators", "abc", t, 5_000)).toBe(false);
    expect(verifyUndo("deals", "abc", t, 20_000)).toBe(false);
    expect(verifyUndo("deals", "abc", undefined)).toBe(false);
  });
});
