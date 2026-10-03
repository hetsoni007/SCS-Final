import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke + accessibility tests. They run against a production build (`npm run build` first).
 *   npm run test:e2e                 → Chromium desktop + mobile
 *   PW_ALL=1 npm run test:e2e        → adds Firefox, WebKit (Safari) and a Samsung-Internet-sized Android profile
 *   PW_CHANNEL=chrome …              → use the locally installed Chrome instead of Playwright's Chromium
 *   BASE_URL=https://… …             → test a deployed preview instead of starting a local server
 */
const PORT = Number(process.env.PORT ?? 3100);
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;
const channel = process.env.PW_CHANNEL || undefined;
// Functional tests run without a GPU: the site then takes its "no WebGL" path (static posters), which keeps
// the suite fast and deterministic and matches CI machines. The `webgl` project covers the 3D layer itself.
const noGpu = { launchOptions: { args: ["--disable-gpu"] } };

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : process.env.CI ? 2 : 3,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  // traces are large; keep them for CI failures only
  use: { baseURL, trace: process.env.CI ? "retain-on-failure" : "off", screenshot: process.env.CI ? "only-on-failure" : "off" },
  webServer: process.env.BASE_URL ? undefined : {
    command: `npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { LEAD_DRY_RUN: "1" },
  },
  projects: [
    { name: "desktop", testIgnore: /webgl\.spec/, use: { ...devices["Desktop Chrome"], channel, ...noGpu } },
    { name: "mobile", testIgnore: /webgl\.spec/, use: { ...devices["Pixel 7"], channel, ...noGpu }, grep: /@mobile|@all/ },
    // needs a real GPU (skips itself otherwise); kept serial so one canvas renders at a time
    { name: "webgl", testMatch: /webgl\.spec/, fullyParallel: false, use: { ...devices["Desktop Chrome"], channel, launchOptions: { args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] } } },
    ...(process.env.PW_ALL ? [
      { name: "firefox", testIgnore: /webgl\.spec/, use: { ...devices["Desktop Firefox"] }, grep: /@all/ },
      { name: "safari", testIgnore: /webgl\.spec/, use: { ...devices["Desktop Safari"] }, grep: /@all/ },
      { name: "iphone", testIgnore: /webgl\.spec/, use: { ...devices["iPhone 14"] }, grep: /@mobile|@all/ },
      { name: "android-small", testIgnore: /webgl\.spec/, use: { ...devices["Galaxy S9+"] }, grep: /@mobile|@all/ },
    ] : []),
  ],
});
