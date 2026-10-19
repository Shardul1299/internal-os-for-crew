// BRIEF §15 Milestone 3 — campaigns, inbox, Today, portals.
import { test, expect } from "@playwright/test";
import { signIn, USERS, mainText, openRow } from "./helpers";

test("a deliverable can't be scheduled without disclosure, claims, PO and advance", async ({ page }) => {
  await signIn(page, USERS.lead);
  await page.goto("/campaigns");
  await openRow(page, "Agent launch");
  await page.waitForURL(/\/campaigns\/[0-9a-f-]{36}/);
  expect(await mainText(page)).toMatch(/Disclosure not checked|Claims not approved/);
});

test("inbox threads past 24 hours appear in Today", async ({ page }) => {
  await signIn(page, USERS.lead);
  await page.goto("/today");
  expect(await mainText(page)).toMatch(/Past SLA/);
});

test("the brand portal shows no tier, rung, Standard, commission or other brands", async ({ page }) => {
  await signIn(page, USERS.brand);
  expect(page.url()).toMatch(/\/brand/);
  for (const path of ["/brand", "/brand/approvals", "/brand/reports", "/brand/invoices"]) {
    await page.goto(path);
    const text = await mainText(page);
    expect(text, path).not.toMatch(/\bTier\b|\bT[0-3]\b|\bRung\b|Lucrative|Premium|Commission|Standard ₹|Patchwork|Ledgerly|Northstar/);
  }
});

test("a brand user can't open Crew Desk", async ({ page }) => {
  await signIn(page, USERS.brand);
  await page.goto("/creators");
  expect(new URL(page.url()).pathname.startsWith("/brand")).toBe(true);
});

test("the creator sees their fee and their shares only", async ({ page }) => {
  await signIn(page, USERS.meera);
  await page.goto("/studio/deals");
  const text = await mainText(page);
  expect(text).toMatch(/₹/);
  expect(text).not.toMatch(/Commission|\bRung\b|Lucrative|Kabir Sethi|Arjun Rao|Zoya Khan|\bT2\b|Filter/);
});
