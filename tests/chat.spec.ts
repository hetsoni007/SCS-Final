import { expect, test } from "@playwright/test";
import { quiet } from "./helpers";
// Needs a build with NEXT_PUBLIC_CHAT_ENABLED=true NEXT_PUBLIC_CHAT_ENDPOINT=http://localhost:3100/chat-mock; skips itself otherwise.
test("chat: launcher, answer, lead handoff, WhatsApp link @mobile", async ({ page }) => {
  await quiet(page);
  await page.route("**/chat-mock", async (r) => {
    const b = r.request().postDataJSON();
    await r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(b.action === "handoff" ? { ok: true } : { ok: true, reply: "You own all code and IP." }) });
  });
  await page.goto("/app-quote/");
  const launch = page.getByRole("button", { name: "Ask a question first" });
  test.skip(!(await launch.count()), "chat flag is off in this build");
  await expect(async () => { await launch.click(); await expect(page.getByRole("button", { name: "Who owns the code?" })).toBeVisible({ timeout: 500 }); }).toPass();
  await page.getByRole("button", { name: "Who owns the code?" }).click();
  await expect(page.locator(`[data-loc="chat"]`).getByText("You own all code and IP.")).toBeVisible();
  await page.getByLabel("Your question").fill("And an NDA?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByText("Want Het to send your fixed-price proposal?")).toBeVisible();
  await page.getByLabel("Name", { exact: true }).fill("Asha");
  await page.getByLabel("WhatsApp").fill("+91 98765 43210");
  await page.locator('[data-loc="chat"] input[type=checkbox]').check();
  await page.getByRole("button", { name: /Send to Het/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Het has this chat" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue on WhatsApp" })).toHaveAttribute("href", /wa\.me/);
});
