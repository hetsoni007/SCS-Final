// Checks that the scroll-linked poses keep every revealed element inside its own layout box (so nothing can drift
// over its neighbours or cover a touch target), at every scroll position.
// Usage: node scripts/reveal-bounds.mjs <baseUrl> <path> [<path> ...]      (PW_CHANNEL=chrome to use the installed Chrome)
import { chromium } from "@playwright/test";
const [base, ...paths] = process.argv.slice(2);
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ["--disable-gpu"] });
let bad = 0;
for (const [w, h] of [[1350, 940], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 600, hasTouch: w < 600 });
  await ctx.addInitScript(() => { try { localStorage.setItem("scs-consent", "denied"); sessionStorage.setItem("scs-intro-seen", "1"); sessionStorage.setItem("scs-exit", "1"); } catch {} });
  const page = await ctx.newPage();
  for (const path of paths) {
    await page.goto(base + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    await page.addStyleTag({ content: "html{scroll-behavior:auto!important}.probe main [data-reveal],.probe .prose>*{animation:none!important;transform:none!important;translate:none!important;rotate:none!important;scale:none!important}" });
    const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const worst = new Map();
    for (let y = 0; y <= max; y += 260) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(60);
      const rows = await page.evaluate(() => {
        // outermost revealed elements only: one nested inside a revealed card moves with that card and stays inside it
        const els = [...document.querySelectorAll("main section:not([data-loc='hero']) [data-reveal], .prose > *")].filter((e) => !e.parentElement.closest("[data-reveal]"));
        const posed = els.map((e) => e.getBoundingClientRect());
        document.documentElement.classList.add("probe");
        const flat = els.map((e) => e.getBoundingClientRect());
        document.documentElement.classList.remove("probe");
        const out = [];
        els.forEach((e, i) => {
          const a = posed[i], b = flat[i];
          if (!b.width || b.bottom < -200 || b.top > innerHeight + 200) return; // only what is on or near the screen
          const over = Math.max(b.left - a.left, a.right - b.right, b.top - a.top, a.bottom - b.bottom);
          if (over > 3) out.push({ key: `<${e.tagName.toLowerCase()} class="${String(e.className).slice(0, 48)}"> ${(e.textContent || "").trim().slice(0, 28)}`, over: Math.round(over) });
        });
        return out;
      });
      for (const r of rows) worst.set(r.key, Math.max(worst.get(r.key) ?? 0, r.over));
    }
    const list = [...worst].sort((a, b) => b[1] - a[1]);
    bad += list.length;
    console.log(`${w}px ${path}: ${list.length ? `${list.length} element(s) leave their box` : "every pose stays inside its box"}`);
    for (const [k, v] of list.slice(0, 6)) console.log(`   +${v}px  ${k}`);
  }
  await ctx.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
