import { expect, test, type Page } from "@playwright/test";
// The production hostname is mapped to the local server; Meta's script is stubbed so nothing leaves the machine.
// Run against a production build: PORT=3100 npx playwright test tests/meta-pixel.spec.ts
const PORT = process.env.PORT ?? 3100;
test.use({ launchOptions: { args: ["--disable-gpu", "--host-resolver-rules=MAP soniconsultancyservices.com 127.0.0.1"] } });
type Fbq = { queue: unknown[][] };
const setup = async (page: Page, consent: "granted" | "denied" | null) => {
  let fetched = 0;
  await page.route("**/connect.facebook.net/**", (r) => { fetched++; return r.fulfill({ contentType: "application/javascript", body: "" }); });
  await page.addInitScript((c) => { try { if (c) localStorage.setItem("scs-consent", c); } catch {} }, consent);
  return () => fetched;
};
const queue = (page: Page) => page.evaluate(() => ((window as unknown as { fbq?: Fbq }).fbq?.queue ?? []).map((a) => [...a]));

test("meta pixel: loads on the production host after consent, init + PageView", async ({ page }) => {
  const fetched = await setup(page, "granted");
  await page.goto(`http://soniconsultancyservices.com:${PORT}/`);
  await expect.poll(fetched).toBe(1);
  const q = await queue(page);
  expect(q).toContainEqual(["init", "1437470517808016"]);
  expect(q).toContainEqual(["track", "PageView"]);
});

test("meta pixel: nothing without consent, and nothing off the production host", async ({ page }) => {
  const fetched = await setup(page, null);
  await page.goto(`http://soniconsultancyservices.com:${PORT}/`);
  await page.waitForTimeout(2500);
  expect(fetched()).toBe(0);
  const second = await setup(page, "granted");
  await page.goto("/");
  await page.waitForTimeout(2500);
  expect(second()).toBe(0);
});
