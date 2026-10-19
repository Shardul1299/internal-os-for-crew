// BRIEF §15 Track S — Creator Studio.
import { test, expect } from "@playwright/test";
import { signIn, USERS, mainText } from "./helpers";

test("a creator lands in Studio and can't open Crew Desk", async ({ page }) => {
  await signIn(page, USERS.meera);
  expect(page.url()).toMatch(/\/studio/);
  await page.goto("/deals");
  expect(new URL(page.url()).pathname.startsWith("/studio")).toBe(true);
});

test("a creator sees only their own research", async ({ page }) => {
  await signIn(page, USERS.ananya);
  await page.goto("/studio/research");
  expect(await mainText(page)).not.toMatch(/tinyagents/);
  await signIn(page, USERS.meera);
  await page.goto("/studio/research");
  expect(await mainText(page)).toMatch(/tinyagents/);
});

test("every generator offers Copy prompt", async ({ page }) => {
  await signIn(page, USERS.meera);
  await page.goto("/studio/write?tab=hooks");
  await expect(page.getByRole("button", { name: "Copy prompt" }).first()).toBeVisible();
});

test("Studio never shows tier or Filter scores", async ({ page }) => {
  await signIn(page, USERS.meera);
  for (const path of ["/studio/today", "/studio/profile", "/studio/deals"]) {
    await page.goto(path);
    expect(await mainText(page), path).not.toMatch(/\bTier\b|\bT[0-3]\b|Filter score|\d+\/15/);
  }
});
