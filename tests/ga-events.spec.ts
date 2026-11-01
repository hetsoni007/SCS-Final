import { expect, test, type Page } from "@playwright/test";
// Maps the production hostname to the local server so isProdHost() is true; gtag is stubbed to record events.
// Run against a production build: PORT=3100 npx playwright test tests/ga-events.spec.ts
const PORT = process.env.PORT ?? 3100;
test.use({ launchOptions: { args: ["--disable-gpu", "--host-resolver-rules=MAP soniconsultancyservices.com 127.0.0.1"] } });
type Ev = { name: string; [k: string]: unknown };
type Spy = Window & { __ev: unknown[][]; gtag: (...a: unknown[]) => number };
const stub = () => { const w = window as unknown as Spy; w.__ev = []; w.gtag = (...a: unknown[]) => w.__ev.push(a); };
const events = (page: Page): Promise<Ev[]> => page.evaluate(() => (window as unknown as Spy).__ev.filter((a) => a[0] === "event").map((a) => ({ name: a[1] as string, ...(a[2] as object) })));

test("prod host: calculator_complete once, generate_lead on success", async ({ page }) => {
  await page.addInitScript(stub);
  await page.goto(`http://soniconsultancyservices.com:${PORT}/app-cost-calculator/`);
  await page.getByText("Payments / subscriptions").click();
  await page.waitForTimeout(1200);
  await page.getByText("Custom MERN API").click();
  await page.waitForTimeout(1200);
  let ev = await events(page);
  const done = ev.filter((e) => e.name === "calculator_complete");
  expect(done).toHaveLength(1);
  expect(done[0]).toMatchObject({ calculator: "app", page_path: "/app-cost-calculator/" });
  await page.getByLabel("Your name").fill("Test Founder");
  await page.getByLabel("Work email").fill("founder@example.com");
  await page.getByRole("button", { name: /Email me the breakdown/ }).click();
  await expect(page.getByRole("status")).toContainText("Got it");
  ev = await events(page);
  const lead = ev.filter((e) => e.name === "generate_lead");
  expect(lead).toHaveLength(1);
  expect(lead[0]).toMatchObject({ form: "calculator", page_path: "/app-cost-calculator/" });
  expect(JSON.stringify(lead)).not.toContain("founder@example.com");
});

test("prod host: book_call fires with book_call_click on a Calendly link", async ({ page }) => {
  await page.addInitScript(stub);
  await page.goto(`http://soniconsultancyservices.com:${PORT}/`);
  await page.locator('a[href*="calendly.com"]').first().click();
  await page.waitForTimeout(500);
  const ev = await events(page);
  const call = ev.filter((e) => e.name === "book_call");
  expect(call).toHaveLength(1);
  expect(call[0].page_path).toBe("/");
  expect(ev.some((e) => e.name === "book_call_click")).toBe(true);
});

test("localhost: no events are sent", async ({ page }) => {
  await page.addInitScript(stub);
  await page.goto("/app-cost-calculator/");
  await page.getByText("Payments / subscriptions").click();
  await page.waitForTimeout(1200);
  expect(await events(page)).toHaveLength(0);
});
