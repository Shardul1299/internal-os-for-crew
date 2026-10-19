import { expect, type Page } from "@playwright/test";

export const USERS = {
  owner: "ayush@crew.example",
  lead: "shardul@crew.example",
  intern: "intern1@crew.example",
  finance: "finance@owled.example",
  sales: "sales@owled.example",
  brand: "growth@lumen.example",
  meera: "meera@creator.example",
  ananya: "ananya@creator.example",
  counterpart: "epic@lit.example",
};

export async function signIn(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/signin");
  await page.locator(`form:has(input[value="${email}"]) button`).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/signin") && u.pathname !== "/");
}

/** Opens the record behind a table row (rows carry data-href) or a link with that text. */
export async function openRow(page: Page, text: string) {
  const row = page.locator("[data-href]", { hasText: text }).first();
  if (await row.count()) {
    const href = await row.getAttribute("data-href");
    await page.goto(href!);
    return;
  }
  await page.getByRole("link", { name: new RegExp(text) }).first().click();
}

/** Opens a stage pill / status menu and returns the visible menu text. */
export async function openMenu(page: Page, triggerName: string | RegExp) {
  await page.getByRole("button", { name: triggerName }).first().click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  return menu;
}

export async function mainText(page: Page) {
  return (await page.locator("main").innerText()).replace(/\s+/g, " ");
}
