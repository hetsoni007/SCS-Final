import { expect, test } from "@playwright/test";
// Production hostname mapped to the local server, third-party scripts stubbed: counts what GA4 (dataLayer) and Meta receive.
const PORT = process.env.PORT ?? 3100;
test.use({ launchOptions: { args: ["--disable-gpu", "--host-resolver-rules=MAP soniconsultancyservices.com 127.0.0.1"] } });

type Spy = Window & { __ev: unknown[][]; gtag: (...a: unknown[]) => number };
const stub = () => { const w = window as unknown as Spy; w.__ev = []; w.gtag = (...a: unknown[]) => w.__ev.push(a); };

test("inquiry funnel: each event fires exactly once, Lead carries an event_id", async ({ page }) => {
  await page.route("**/connect.facebook.net/**", (r) => r.fulfill({ contentType: "application/javascript", body: "" }));
  await page.route("**/googletagmanager.com/**", (r) => r.fulfill({ contentType: "application/javascript", body: "" }));
  await page.addInitScript(stub);
  await page.addInitScript(() => { try { localStorage.setItem("scs-consent", "granted"); sessionStorage.setItem("scs-intro-seen", "1"); sessionStorage.setItem("scs-exit", "1"); } catch {} });
  await page.goto(`http://soniconsultancyservices.com:${PORT}/?utm_source=facebook&utm_campaign=nov-india`);
  const form = page.locator("#proposal");
  await form.scrollIntoViewIfNeeded();
  const radio = form.getByRole("radio", { name: "Mobile app" });
  await expect(async () => { await radio.click(); await expect(radio).toHaveAttribute("aria-checked", "true", { timeout: 500 }); }).toPass(); // retries until hydrated
  await form.getByRole("button", { name: /Continue/ }).click();
  await form.getByLabel("Your name").fill("Test Person");
  await form.getByLabel("or email").fill("test@example.com");
  await form.getByLabel("Budget").selectOption("Not sure yet");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: /Send my request/ }).click();
  await expect(page).toHaveURL(/\/thanks\/$/);
  await page.waitForTimeout(800);
  const { dl, fbq } = await page.evaluate(() => ({
    dl: (window as unknown as Spy).__ev.filter((a) => a[0] === "event").map((a) => a[1] as string),
    fbq: ((window as unknown as { fbq: { queue: unknown[][] } }).fbq.queue ?? []).map((a) => [...a]),
  }));
  const n = (e: string) => dl.filter((x) => x === e).length;
  expect(n("form_start")).toBe(1);
  expect(n("form_step1_complete")).toBe(1);
  expect(n("form_submit")).toBe(1);
  expect(n("generate_lead")).toBe(1);
  const leads = fbq.filter((a) => a[0] === "track" && a[1] === "Lead");
  expect(leads).toHaveLength(1);
  expect((leads[0][3] as { eventID: string }).eventID).toMatch(/^[0-9a-f-]{36}$/);
  expect(fbq.filter((a) => a[0] === "track" && a[1] === "ViewContent")).toHaveLength(1);
  await page.reload();
  await page.waitForTimeout(500);
  expect((await page.evaluate(() => (window as unknown as Spy).__ev.filter((a) => a[0] === "event" && a[1] === "form_submit").length))).toBe(0); // a reload does not count again
});
