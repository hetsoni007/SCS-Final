import { expect, test } from "@playwright/test";
import { quiet } from "./helpers";

test.beforeEach(async ({ page }) => { await quiet(page); });

test("app-quote: both hero buttons above the fold at 360x640, bar stays, no full nav @mobile", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/app-quote/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Proposal in 48 hours");
  const hero = page.locator('[data-loc="hero"]');
  const bar = await page.locator('[data-loc="mobile-bar"]').boundingBox();
  for (const b of [hero.getByRole("link", { name: "Get my fixed-price proposal" }), hero.getByRole("link", { name: "Chat on WhatsApp" })]) {
    const box = await b.boundingBox();
    expect(box && box.y + box.height <= 640 && box.y + box.height <= bar!.y).toBeTruthy();
  }
  await expect(page.getByRole("button", { name: "Get a proposal" })).toBeVisible();
  await expect(page.locator("header").getByRole("link")).toHaveCount(1); // the logo; the one CTA is a button
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("app-quote: hero opens the sheet; case numbers; no prices @mobile", async ({ page }) => {
  await page.goto("/app-quote/");
  await expect(page.getByText("Faster payroll")).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/\$\d/);
  const btn = page.locator('[data-loc="hero"]').getByRole("link", { name: "Get my fixed-price proposal" });
  await expect(async () => { await btn.click(); await expect(page.getByRole("dialog", { name: "Get a fixed-price proposal" })).toBeVisible({ timeout: 500 }); }).toPass();
});
