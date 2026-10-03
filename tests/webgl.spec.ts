import { expect, test } from "@playwright/test";
import { quiet, watchConsole } from "./helpers";

/**
 * The 3D layer: one shared canvas, scenes attached to DOM slots, posters hidden once WebGL is live.
 * Skips itself on machines without a hardware GPU (the site then shows posters, which the other suites cover).
 */
test.describe.configure({ mode: "serial" });
test.beforeEach(async ({ page }) => { await quiet(page); });

async function hasGpu(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    const r = ext ? String(gl!.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    return !!gl && !/swiftshader|llvmpipe|software/i.test(r);
  });
}

test("home mounts a single canvas and attaches the hero scene", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/");
  test.skip(!(await hasGpu(page)), "no hardware GPU");
  await expect(page.locator("html")).toHaveClass(/gl-on/, { timeout: 15_000 });
  await expect(page.locator(".gl-layer canvas")).toHaveCount(1);
  await expect(page.locator('.view-slot[data-scene="hero"]')).toHaveAttribute("data-live", "1");
  // shaders compile asynchronously; the poster hands over when the scene is ready to draw
  await expect(page.locator('.view-slot[data-scene="hero"]')).toHaveAttribute("data-ready", "1", { timeout: 15_000 });
  // the hero becomes a tall scroll track only once WebGL is live
  const trackHeight = await page.locator('[data-loc="hero"]').evaluate((el) => el.getBoundingClientRect().height / innerHeight);
  expect(trackHeight).toBeGreaterThan(2);
  // every scene on the page shares that one WebGL context
  expect(await page.locator("canvas").count()).toBe(1);
  await page.waitForTimeout(1500);
  expect(errors, errors.join("\n")).toEqual([]);
});

// React Three Fiber copies a `uniforms` prop, so values written each frame can silently never reach the shader
// (everything then renders frozen at its first frame). The hero has to move on its own and respond to scroll.
test("hero shader is live: it animates and assembles on scroll", async ({ page }) => {
  await page.goto("/");
  test.skip(!(await hasGpu(page)), "no hardware GPU");
  const hero = page.locator('.view-slot[data-scene="hero"]');
  await expect(hero).toHaveAttribute("data-ready", "1", { timeout: 15_000 });
  const clip = { x: 760, y: 140, width: 480, height: 420 };
  const a = await page.screenshot({ clip });
  await page.waitForTimeout(900);
  const b = await page.screenshot({ clip });
  expect(a.equals(b), "the particle field should drift between two frames").toBe(false);
  // end of the hero's scroll track: the particles hand over to the two devices and the caption appears
  const end = await page.locator('[data-loc="hero"]').evaluate((el) => el.getBoundingClientRect().height - innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), end);
  await expect(page.getByText("Idea → App Store & Google Play")).toBeVisible();
  await page.waitForTimeout(2500);
  const c = await page.screenshot({ clip });
  expect(c.equals(b), "the scene should have changed with scroll").toBe(false);
});

test("each signature scene renders without console errors", async ({ page }) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await page.goto("/lab/");
  test.skip(!(await hasGpu(page)), "no hardware GPU");
  await expect(page.locator("html")).toHaveClass(/gl-on/, { timeout: 15_000 });
  const slots = page.locator(".view-slot");
  const n = await slots.count();
  expect(n).toBeGreaterThan(20);
  for (let i = 0; i < n; i++) { await slots.nth(i).scrollIntoViewIfNeeded(); await page.waitForTimeout(350); }
  for (const path of ["/app-cost-calculator/", "/mvp-development/", "/work/", "/contact/"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass(/gl-on/, { timeout: 15_000 });
    await page.mouse.wheel(0, 1400);
    await page.waitForTimeout(1500);
  }
  expect(errors, errors.join("\n")).toEqual([]);
});

// The functional suites run without a GPU, so the layout that waits for the canvas (posters sized for 3D slots,
// the tall hero track) is only exercised here. Checked at phone width, before and after the canvas mounts.
test("phone width: the WebGL layout never widens the page", async ({ browser, baseURL }) => {
  test.setTimeout(240_000);
  const ctx = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await quiet(page);
  await page.goto("/");
  test.skip(!(await hasGpu(page)), "no hardware GPU");
  const width = () => page.evaluate(() => Math.max(document.documentElement.scrollWidth, innerWidth));
  for (const path of ["/", "/services/", "/work/", "/work/hr-payroll/", "/contact/", "/app-cost-calculator/", "/mvp-development/", "/ai-app-development/", "/devops-cloud-engineering/", "/react-native-app-development/", "/app-scoping-guide/"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    expect(await width(), `${path} before the canvas mounts`).toBeLessThanOrEqual(391);
    // touch devices mount the canvas on the first interaction
    await page.touchscreen.tap(195, 500);
    await page.mouse.wheel(0, 900);
    await expect(page.locator("html")).toHaveClass(/gl-on/, { timeout: 15_000 });
    await page.waitForTimeout(1200);
    expect(await width(), `${path} with the canvas live`).toBeLessThanOrEqual(391);
  }
  await ctx.close();
});
