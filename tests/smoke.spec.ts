import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { quiet, watchConsole } from "./helpers";

test.beforeEach(async ({ page }) => { await quiet(page); });

test("home: hero renders as HTML with the primary CTA @all", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Build iOS & Android apps in 8 weeks.");
  // the home hero carries exactly two actions: the portfolio and the contact page
  const hero = page.locator('[data-loc="hero"]');
  await expect(hero.getByRole("link")).toHaveCount(2);
  const cta = hero.getByRole("link", { name: "View our portfolio →" });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "/work/");
  await expect(hero.getByRole("link", { name: "Connect with me" })).toHaveAttribute("href", "https://www.linkedin.com/in/hetsoni/");
  await page.waitForTimeout(1500);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("navigation: header links reach their pages", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const [label, url, h1] of [["Services", "/services/", /From idea to App Store/], ["Work", "/work/", /Apps we.ve shipped/], ["Blog", "/blog/", /From the studio/], ["Contact", "/contact/", /scope your app/]] as const) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(url.replace(/\//g, "\\/") + "?$"));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
  }
});

test("Calendly: CTA opens the booking dialog, Escape closes it and focus returns", async ({ page }) => {
  await page.goto("/services/");
  const cta = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Book a Call" });
  await cta.click();
  const dialog = page.getByRole("dialog", { name: /Book a call/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("iframe")).toHaveAttribute("src", /calendly\.com/);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(cta).toBeFocused();
});

test("command palette: Ctrl+K searches and navigates", async ({ page }) => {
  await page.goto("/about/");
  await page.waitForTimeout(400);
  await page.keyboard.press("Control+k");
  const box = page.getByRole("combobox", { name: "Search" });
  await expect(box).toBeFocused();
  await box.fill("cost calculator");
  await expect(page.getByRole("dialog", { name: "Search the site" }).getByRole("option").first()).toContainText(/cost/i);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/app-cost-calculator/);
});

test("cost calculator: formula matches the live site", async ({ page }) => {
  await page.goto("/app-cost-calculator/");
  const result = page.locator('[aria-live="polite"]').first();
  // default: MVP 4wk + accounts 1.5 → 6 weeks → $11k–$19k
  await expect(result).toContainText("~6 weeks");
  await expect(result).toContainText("$11k – $19k");
  await page.getByText("Payments / subscriptions").click();
  await page.getByText("Custom MERN API").click();
  // (4 + 1.5 + 2.5 + 3) × 1 × 1 = 11 weeks → 11×1800 = $20k, 11×3200 = $35k
  await expect(result).toContainText("~11 weeks");
  await expect(result).toContainText("$20k – $35k");
  await page.getByText("Premium / animated").click();
  // 11 × 1.4 = 15.4 → 15 weeks → $27k–$48k
  await expect(result).toContainText("~15 weeks");
  await expect(result).toContainText("$27k – $48k");
  await page.getByText("iOS only").click();
  // 11 × 0.9 × 1.4 = 13.86 → 14 weeks → $25k–$45k
  await expect(result).toContainText("~14 weeks");
  await expect(result).toContainText("$25k – $45k");
});

test("calculator lead form validates, then submits in place", async ({ page }) => {
  await page.goto("/app-cost-calculator/");
  await page.getByRole("button", { name: /Email me the breakdown/ }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await page.getByLabel("Your name").fill("Test Founder");
  await page.getByLabel("Work email").fill("not-an-email");
  await page.getByRole("button", { name: /Email me the breakdown/ }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await page.getByLabel("Work email").fill("founder@example.com");
  await page.getByRole("button", { name: /Email me the breakdown/ }).click();
  await expect(page.getByRole("status")).toContainText("Got it");
  await expect(page).toHaveURL(/app-cost-calculator/); // no reload / navigation
});

test("contact form: required fields, consent-free brief, success state", async ({ page }) => {
  await page.goto("/contact/");
  await page.getByRole("button", { name: /Send brief/ }).click();
  await expect(page.getByText("First name is required")).toBeVisible();
  await page.getByLabel("First name").fill("Test");
  await page.getByLabel("Last name").fill("Founder");
  await page.getByLabel("Work email").fill("founder@example.com");
  await page.getByLabel("I'm interested in…").selectOption("AI Integration");
  await page.getByLabel("Tell us about your project").fill("A booking app.");
  await page.getByRole("button", { name: /Send brief/ }).click();
  await expect(page.getByRole("status")).toContainText("Brief received");
});

test("start-here form requires consent", async ({ page }) => {
  await page.goto("/services/#start");
  const form = page.locator("#start");
  await form.getByLabel("Your name").fill("Test Founder");
  await form.getByLabel("Work email").fill("founder@example.com");
  await form.getByLabel("What are you building?").fill("An MVP.");
  await form.getByRole("button", { name: /Send/ }).click();
  await expect(form.getByText("Please tick the box so we can reply")).toBeVisible();
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: /Send/ }).click();
  await expect(form.getByRole("status")).toContainText("Thanks");
});

test("scoping guide: form reveals the PDF download", async ({ page }) => {
  await page.goto("/app-scoping-guide/");
  await page.getByLabel("First name").fill("Test");
  await page.getByLabel("Work email").fill("founder@example.com");
  await page.getByRole("button", { name: /Get the guide/ }).click();
  const dl = page.getByRole("link", { name: "Download the PDF (8 pages)" });
  await expect(dl).toHaveAttribute("href", "/assets/app-scoping-guide.pdf");
  expect((await page.request.get("/assets/app-scoping-guide.pdf")).headers()["content-type"]).toContain("pdf");
});

test("blog: decision tool runs to a result; filters and search work", async ({ page }) => {
  await page.goto("/blog/can-ai-build-my-app");
  const tool = page.locator(".prose .glass").filter({ hasText: "5 questions" });
  for (let i = 0; i < 5; i++) await tool.getByRole("button").first().click();
  await expect(tool.getByText("Your result")).toBeVisible();
  await expect(tool.getByText(/%$/).first()).toBeVisible();
  await page.goto("/blog/");
  await page.getByRole("button", { name: "DevOps", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(/^[1-9]\d* posts?$/);
  await page.getByPlaceholder("Search posts…").fill("zzzz-nothing");
  await expect(page.getByText("Nothing matches that yet")).toBeVisible();
});

test("blog: readiness checklist and self-audit score like the live versions", async ({ page }) => {
  await page.goto("/blog/dpdp-act-app-compliance-india");
  const check = page.locator(".prose .glass").filter({ hasText: "10-point readiness check" });
  const labels = check.locator("label");
  for (let i = 0; i < 7; i++) await labels.nth(i).click();
  await expect(check).toContainText("70/100");
  await expect(check).toContainText("Solid, with real gaps.");
  await expect(check).toContainText("7 of 10 controls in place");
  await page.goto("/blog/mobile-app-security-checklist");
  const audit = page.locator(".prose .glass").filter({ hasText: "answer all 10" });
  for (let i = 0; i < 10; i++) await audit.locator("fieldset").nth(i).getByText(i < 5 ? "Yes" : "Partly", { exact: true }).click();
  // 5×2 + 5×1 = 15 of 20 → 75/100 → "Gaps to close"
  await expect(audit).toContainText("Gaps to close: 75/100");
});

test("work: filters, case-study page and next-project link", async ({ page }) => {
  await page.goto("/work/");
  await page.getByRole("button", { name: "Design concepts" }).click();
  await expect(page.getByRole("heading", { name: "Web3 Creator Platform" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "HR & Payroll Platform" })).toBeHidden();
  await expect(page.getByText("Product & UI/UX design concept").first()).toBeVisible();
  await page.goto("/work/healthcare-staffing/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Healthcare Staffing Platform");
  await expect(page.getByText(/Designed to cut average shift-fill time/)).toBeVisible(); // claim stays hedged
  await page.getByRole("link", { name: /Next project/ }).click();
  await expect(page).toHaveURL(/\/work\/web3-creator\/?$/);
});

test("reduced motion: no WebGL canvas, content fully visible", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await quiet(page);
  await page.goto("/");
  await page.waitForTimeout(2500);
  expect(await page.locator(".gl-layer canvas").count()).toBe(0);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await expect(page.getByRole("heading", { name: "Five steps. No surprises." })).toBeVisible();
  await expect(page.getByText("App Store & Play Store submission, done for you.")).toBeVisible();
  await ctx.close();
});

test("footer toggle reduces motion and persists", async ({ page }) => {
  await page.goto("/about/");
  await page.getByLabel("Reduce motion").check();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await expect(page.getByLabel("Reduce motion")).toBeChecked();
});

test("consent: GA4 loads only after accepting", async ({ page }) => {
  // undo the shared "consent already declined" setup for this test (init scripts run in the order they were added)
  await page.addInitScript(() => { try { if (!sessionStorage.getItem("consent-test")) { localStorage.removeItem("scs-consent"); sessionStorage.setItem("consent-test", "1"); } } catch {} });
  await page.goto("/privacy/");
  const banner = page.getByRole("dialog", { name: "Cookie consent" });
  await expect(banner).toBeVisible();
  expect(await page.locator('script[src*="googletagmanager"]').count()).toBe(0);
  await banner.getByRole("button", { name: "Decline" }).click();
  await expect(banner).toBeHidden();
  expect(await page.locator('script[src*="googletagmanager"]').count()).toBe(0);
});

test.describe("mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "phone-sized projects only");
  for (const path of ["/", "/services/", "/work/", "/blog/", "/blog/react-native-push-notifications", "/contact/", "/app-cost-calculator/", "/cloud-cost-calculator/", "/mvp-development/", "/devops-cloud-engineering/"]) {
    test(`no horizontal overflow on ${path} @mobile`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const { doc, vv } = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, vv: Math.round(window.visualViewport?.width ?? innerWidth) }));
      expect(doc, `document is ${doc}px wide in a ${vv}px viewport`).toBeLessThanOrEqual(vv + 1);
    });
  }
  test("menu opens, lists every destination, sticky CTA bar is visible @mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-loc="mobile-bar"]').getByRole("link", { name: "View portfolio" })).toBeVisible();
    await expect(page.locator('[data-loc="mobile-bar"]').getByRole("link", { name: "Connect with me" })).toBeVisible();
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    for (const l of ["Services", "Work", "Blog", "AI Apps", "DevOps & Cloud", "About", "Contact"]) await expect(menu.getByRole("link", { name: l, exact: true })).toBeVisible();
    await menu.getByRole("link", { name: "Work", exact: true }).click();
    await expect(page).toHaveURL(/\/work\/?$/);
    await expect(menu).toBeHidden();
  });
});

async function axeSerious(page: import("@playwright/test").Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  // reveal-on-scroll content starts transparent; show everything so contrast is measured on final styles
  await page.addStyleTag({ content: "[data-reveal]{opacity:1!important;transform:none!important}" });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).exclude("iframe").analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  return serious.map((v) => `${v.id}: ${v.help}\n  ${v.nodes.slice(0, 4).map((n) => n.target.join(" ")).join("\n  ")}`);
}

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  for (const path of ["/", "/services/", "/work/", "/work/hr-payroll/", "/blog/", "/blog/can-ai-build-my-app", "/contact/", "/app-cost-calculator/", "/app-scoping-guide/", "/ai-app-development/", "/privacy/"]) {
    test(`no serious violations on ${path}`, async ({ page }) => {
      const serious = await axeSerious(page, path);
      expect(serious, serious.join("\n")).toEqual([]);
    });
  }
  // the theme toggle in the header switches to a light palette; it has to meet the same contrast rules
  for (const path of ["/", "/services/", "/work/", "/blog/can-ai-build-my-app", "/contact/", "/app-cost-calculator/", "/privacy/"]) {
    test(`light theme: no serious violations on ${path}`, async ({ page }) => {
      await page.addInitScript(() => { try { localStorage.setItem("scs-theme", "light"); } catch {} });
      const serious = await axeSerious(page, path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      expect(serious, serious.join("\n")).toEqual([]);
    });
  }
});
