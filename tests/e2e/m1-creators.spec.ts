// BRIEF §15 Milestone 1 — creators, Filter, tiers.
import { test, expect } from "@playwright/test";
import { signIn, USERS, openMenu, mainText } from "./helpers";

test("no follower column by default", async ({ page }) => {
  await signIn(page, USERS.lead);
  await page.goto("/creators");
  const headers = (await page.locator("main thead th").allInnerTexts()).map((t) => t.toLowerCase());
  expect(headers.length).toBeGreaterThan(3);
  expect(headers.some((h) => h.includes("follower"))).toBe(false);
});

test("no creator leaves Scout without a Filter score and consent", async ({ page }) => {
  await signIn(page, USERS.lead);
  await page.goto("/creators?seg=scout&q=Dev");
  await page.getByRole("link", { name: /Dev Malhotra/ }).first().click();
  await page.waitForURL(/\/creators\/[0-9a-f-]{36}/);
  const menu = await openMenu(page, /^Scout/);
  const text = await menu.innerText();
  expect(text).toMatch(/Watchlist/);
  expect(text).toMatch(/No Filter score/);
});

test("roster promotion needs the Owner", async ({ page }) => {
  await signIn(page, USERS.lead);
  await page.goto("/creators?seg=incubation");
  await page.getByRole("link", { name: /Ananya Das/ }).first().click();
  await page.waitForURL(/\/creators\/[0-9a-f-]{36}/);
  const text = await mainText(page);
  expect(text).toMatch(/Roster gate: \d of \d met/);
  const menu = await openMenu(page, /^Incubation/);
  expect(await menu.innerText()).toMatch(/Owner|signal/i);
});

test("tier appears in no export", async ({ page }) => {
  await signIn(page, USERS.owner);
  const res = await page.request.get("/api/export/creators");
  expect(res.ok()).toBe(true);
  const header = (await res.text()).split("\n")[0].toLowerCase();
  expect(header).toContain("name");
  expect(header).not.toMatch(/tier/);
  const deals = await page.request.get("/api/deals/export");
  expect(deals.ok()).toBe(true);
  expect((await deals.text()).split("\n")[0].toLowerCase()).not.toMatch(/tier|rung|commission/);
});

test("interns can't see tier", async ({ page }) => {
  await signIn(page, USERS.intern);
  await page.goto("/creators");
  const headers = (await page.locator("main thead th").allInnerTexts()).map((t) => t.toLowerCase());
  expect(headers).not.toContain("tier");
});

test("both themes render", async ({ page }) => {
  await signIn(page, USERS.lead);
  await page.goto("/today");
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.context().addCookies([{ name: "theme", value: "light", url: "http://localhost:3100" }]);
  await page.reload();
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(dark).toBe("rgb(11, 11, 11)");
  expect(light).toBe("rgb(246, 232, 205)");
});
