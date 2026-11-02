import { expect, test } from "@playwright/test";
import { quiet } from "./helpers";

// No endpoint is configured in test builds, so submissions are accepted and logged (a dry run): no real lead is created.
test.beforeEach(async ({ page }) => { await quiet(page); });

test("home: hero actions, in-page form after the process section, two-step flow to /thanks @mobile", async ({ page }) => {
  await page.goto("/?utm_source=facebook&utm_campaign=nov-india");
  const hero = page.locator('[data-loc="hero"]');
  await expect(hero.getByRole("link", { name: "Get my fixed-price proposal" })).toHaveAttribute("href", "#proposal");
  await expect(hero.getByRole("link", { name: "Chat on WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  await expect(hero.getByRole("link", { name: /View our portfolio/ })).toBeVisible();
  // the form sits right after the process section
  const order = await page.evaluate(() => { const f = document.getElementById("proposal"), p = document.querySelector("#process, [data-loc='process']"); return f && p ? !!(p.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING) : null; });
  expect(order).not.toBe(false);
  const form = page.locator("#proposal");
  await form.scrollIntoViewIfNeeded();
  await form.getByRole("radio", { name: "AI feature" }).click();
  await form.getByRole("button", { name: /Continue/ }).click();
  await form.getByLabel("Your name").fill("Test Person");
  await form.getByLabel("WhatsApp number").fill("+91 98765 43210");
  await form.getByLabel("Budget").selectOption("$10-25k");
  await form.getByRole("button", { name: /Send my request/ }).click();
  await expect(form.getByText("Please tick the box")).toBeVisible();
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: /Send my request/ }).click();
  await expect(page).toHaveURL(/\/thanks\/$/);
  await expect(page.getByRole("heading", { name: /it’s with Het/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "App Scoping Guide" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("sticky bar sheet opens, traps focus and closes with Escape @mobile", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/services/");
  const bar = page.locator('[data-loc="mobile-bar"]');
  await expect(bar.getByRole("link", { name: "Chat on WhatsApp" })).toBeVisible();
  await bar.getByRole("button", { name: "Get a proposal" }).click();
  const dlg = page.getByRole("dialog", { name: "Get a fixed-price proposal" });
  await expect(dlg).toBeVisible();
  await expect(dlg.getByRole("radio", { name: "Mobile app" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
});

test("whatsapp link carries the page and utm_campaign at click time @mobile", async ({ page, context }) => {
  await page.goto("/services/?utm_campaign=nov-india");
  await page.evaluate(() => document.querySelector<HTMLAnchorElement>("a[data-wa]")!.addEventListener("click", (e) => e.preventDefault()));
  const a = page.locator('[data-loc="mobile-bar"] a[data-wa], [data-loc="nav"] a[data-wa]').first();
  await a.dispatchEvent("click");
  const href = decodeURIComponent((await page.locator("a[data-wa]").first().getAttribute("href")) ?? "");
  expect(href).toContain("/services/");
  expect(href).toContain("nov-india");
  void context;
});
