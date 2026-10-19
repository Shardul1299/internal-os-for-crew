// BRIEF §15 Milestone 4 — Program and retention.
import { test, expect } from "@playwright/test";
import { signIn, USERS, mainText } from "./helpers";

test("the counterpart sees students but no brand, money or tier while judging", async ({ page }) => {
  await signIn(page, USERS.counterpart);
  expect(page.url()).toMatch(/\/counterpart/);
  const text = await mainText(page);
  expect(text).toMatch(/Aisha Qureshi|Karan Gill/);
  expect(text).not.toMatch(/Quill|₹|\bTier\b|\bT[0-3]\b/);
});

test("the month-end one-pager renders with the declined log and exceptions", async ({ page }) => {
  await signIn(page, USERS.owner);
  await page.goto("/reports");
  const text = await mainText(page);
  expect(text).toMatch(/Declined/i);
  expect(text).toMatch(/exception|override/i);
});

test("the program screen opens the judging sheet", async ({ page }) => {
  await signIn(page, USERS.lead);
  await page.goto("/program");
  expect(await mainText(page)).toMatch(/Explain an AI note-taker/);
});
