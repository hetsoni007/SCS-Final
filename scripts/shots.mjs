// Dev helper: full-fidelity screenshots through the system Chrome (headless, GPU on).
// Usage: node scripts/shots.mjs <baseUrl> <outDir> <w>x<h> <path[@scrollSelector|@y=1234][#name]> ...
import { chromium } from "@playwright/test";
import fs from "node:fs";

const [base, out, size, ...targets] = process.argv.slice(2);
const [w, h] = size.split("x").map(Number);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome", headless: true, args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-webgl"] });
const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, colorScheme: "dark", reducedMotion: process.env.REDUCED ? "reduce" : "no-preference", isMobile: w < 600, hasTouch: w < 600 });
await ctx.addInitScript(() => { try { localStorage.setItem("scs-consent", "denied"); sessionStorage.setItem("scs-intro-seen", "1"); sessionStorage.setItem("scs-exit", "1"); if (window.__THEME) localStorage.setItem("scs-theme", window.__THEME); } catch {} });
if (process.env.THEME) await ctx.addInitScript((t) => { try { localStorage.setItem("scs-theme", t); } catch {} }, process.env.THEME);
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error" && !/insights|_vercel|favicon/.test(m.text())) errors.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 300)));
for (const t of targets) {
  const [spec, name] = t.split("#");
  const [path, scroll] = spec.split("@");
  await page.goto(base + path, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2500);
  if (scroll) {
    if (scroll.startsWith("y=")) await page.evaluate((y) => window.scrollTo(0, y), Number(scroll.slice(2)));
    else await page.evaluate((sel) => { const [s, off] = sel.split("+"); const e = document.querySelector(s); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY + (Number(off) || -70)); }, scroll);
    await page.waitForTimeout(3200);
  }
  const file = `${out}/${name || path.replace(/\W+/g, "_") || "home"}.png`;
  await page.screenshot({ path: file });
  const info = await page.evaluate(() => ({ gl: document.documentElement.classList.contains("gl-on"), tier: [...document.querySelectorAll(".view-slot")].map((e) => e.dataset.scene + ":" + e.dataset.live).join(","), overflowX: document.documentElement.scrollWidth - innerWidth }));
  console.log(file, JSON.stringify(info));
}
if (errors.length) console.log("CONSOLE ERRORS:\n" + [...new Set(errors)].join("\n"));
await browser.close();
