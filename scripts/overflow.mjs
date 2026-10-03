// Lists the elements that stick out of a phone-width viewport.  Usage: node scripts/overflow.mjs <url> [width]
import { chromium, devices } from "@playwright/test";
const [url, width = "412"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ["--disable-gpu"] });
const ctx = await browser.newContext({ ...devices["Pixel 7"], viewport: { width: Number(width), height: 839 } });
const page = await ctx.newPage();
await page.addInitScript(() => { try { localStorage.setItem("scs-consent", "denied"); sessionStorage.setItem("scs-intro-seen", "1"); sessionStorage.setItem("scs-exit", "1"); } catch {} });
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth, rows = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > vw + 0.5 && getComputedStyle(el).position !== "fixed") rows.push(`${Math.round(r.right - vw)}px  <${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 70)}">  ${(el.textContent || "").trim().slice(0, 50)}`);
  }
  return { doc: document.documentElement.scrollWidth, vw, rows: rows.slice(0, 14) };
});
console.log(`document ${out.doc}px in ${out.vw}px viewport`);
console.log(out.rows.join("\n") || "nothing sticks out");
await browser.close();
