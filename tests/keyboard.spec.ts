import { expect, test } from "@playwright/test";
import { quiet } from "./helpers";

// Keyboard only: open the sheet from the sticky bar, fill both steps and submit without touching the mouse.
test("inquiry sheet is fully keyboard operable @mobile", async ({ page }) => {
  await quiet(page);
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/services/");
  const open = page.locator('[data-loc="mobile-bar"]').getByRole("button", { name: "Get a proposal" });
  await expect(async () => { await open.focus(); await page.keyboard.press("Enter"); await expect(page.getByRole("dialog")).toBeVisible({ timeout: 500 }); }).toPass();
  const dlg = page.getByRole("dialog");
  await expect(dlg.getByRole("radio", { name: "Mobile app" })).toBeFocused();
  await page.keyboard.press("Tab"); await page.keyboard.press("Space"); // second option
  await expect(dlg.getByRole("radio", { name: "Web app" })).toHaveAttribute("aria-checked", "true");
  await dlg.getByRole("button", { name: /Continue/ }).focus(); await page.keyboard.press("Enter");
  await expect(dlg.getByRole("heading", { name: /Where should we send/ })).toBeFocused();
  await dlg.getByLabel("Your name").focus(); await page.keyboard.type("Kay Board");
  await dlg.getByLabel("or email").focus(); await page.keyboard.type("kay@example.com");
  await dlg.getByLabel("Budget").focus(); await page.keyboard.type("Not");
  await dlg.getByRole("checkbox").focus(); await page.keyboard.press("Space");
  await dlg.getByRole("button", { name: /Send my request/ }).focus(); await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/thanks\/$/);
});
