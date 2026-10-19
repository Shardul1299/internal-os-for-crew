// BRIEF §15 Milestone 2 — deals, ladder, money.
import { test, expect } from "@playwright/test";
import { signIn, USERS, openMenu, mainText, openRow } from "./helpers";

test("the calculator has no follower, CPV, CPM or impression input; lifetime can't be picked; one-off opens at Pitch", async ({ page }) => {
  await signIn(page, USERS.lead);
  await page.goto("/deals/calculator");
  const labels = (await page.locator("main label, main input, main select").evaluateAll((els) => els.map((e) => `${e.textContent ?? ""} ${e.getAttribute("name") ?? ""}`))).join(" ").toLowerCase();
  expect(labels).not.toMatch(/follower|cpv|cpm|impression|views/);
  await expect(page.getByLabel(/Lifetime usage/)).toBeDisabled();
  await page.getByLabel("Deal type").selectOption({ label: "One-off" });
  await expect(page.getByRole("radio", { name: /Pitch/ })).toHaveAttribute("aria-checked", "true");
});

test("barter can't pass Qualify without an Owner override", async ({ page }) => {
  await signIn(page, USERS.lead);
  await page.goto("/deals?view=list");
  await openRow(page, "Orbit Cloud enterprise annual");
  await page.waitForURL(/\/deals\/[0-9a-f-]{36}/);
  await page.goto(page.url().split("?")[0] + "?step=qualify");
  // Toggles render the checkbox visually hidden; click the label like a person would.
  const barter = page.locator("input[name=barter]");
  if (!(await barter.isChecked())) await page.locator("label", { has: barter }).click();
  await expect(barter).toBeChecked();
  await page.getByRole("button", { name: "Save check" }).click();
  // The stepper caption carries the first blocker once the check is saved.
  await expect(page.getByRole("link", { name: /Qualify/ }).first()).toContainText(/Barter/, { timeout: 15_000 });
  const menu = await openMenu(page, /^Lead/);
  await expect(menu).toContainText(/Barter.*Owner override/);
  await page.keyboard.press("Escape");
  // Put it back for the next run.
  await page.locator("label", { has: barter }).click();
  await expect(barter).not.toBeChecked();
  await page.getByRole("button", { name: "Save check" }).click();
});

test("creator-inbound deals carry 15% commission", async ({ page }) => {
  await signIn(page, USERS.lead);
  await page.goto("/deals?view=list");
  await openRow(page, "Northstar fund thesis series");
  await page.waitForURL(/\/deals\/[0-9a-f-]{36}/);
  await page.goto(page.url().split("?")[0] + "?step=quote");
  expect(await mainText(page)).toMatch(/Commission 15%/);
});

test("finance sees money read-only and can't export deals", async ({ page }) => {
  await signIn(page, USERS.finance);
  await page.goto("/money");
  await expect(page.getByRole("heading", { name: /money/i })).toBeVisible();
  const res = await page.request.get("/api/deals/export");
  expect(res.status()).toBe(403);
});
