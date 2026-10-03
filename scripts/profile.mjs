// Dev helper: CPU-profile a page load under CPU throttling and print the long tasks and the hottest functions.
// Usage: node scripts/profile.mjs <url> [throttle=4] [seconds=10] [gpu|nogpu] [mobile|desktop]
//   SEEN=1 skips the first-visit intro and the consent banner.
import { chromium, devices } from "@playwright/test";
const [url, rate = "4", secs = "10", gpu = "gpu", device = "mobile"] = process.argv.slice(2);
const b = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome", headless: true, args: gpu === "gpu" ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] : ["--disable-gpu"] });
const ctx = await b.newContext(device === "desktop" ? { viewport: { width: 1440, height: 900 } } : { ...devices["Pixel 7"] });
if (process.env.SEEN) await ctx.addInitScript(() => { try { sessionStorage.setItem("scs-intro-seen", "1"); localStorage.setItem("scs-consent", "denied"); } catch {} });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(rate) });
await page.addInitScript(() => { window.__lt = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: "longtask", buffered: true }); });
await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", { interval: 500 }); await cdp.send("Profiler.start");
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(Number(secs) * 1000);
const { profile } = await cdp.send("Profiler.stop");
const dt = profile.timeDeltas, byNode = new Map(profile.nodes.map((n) => [n.id, n])), self = new Map();
profile.samples.forEach((id, i) => { const n = byNode.get(id), f = n.callFrame; const key = `${f.functionName || "(anon)"} ${f.url.replace(/^.*\/_next\/static\/chunks\//, "").slice(0, 26)}:${f.lineNumber}:${f.columnNumber}`; self.set(key, (self.get(key) || 0) + (dt[i] || 0) / 1000); });
const top = [...self.entries()].filter(([k]) => !/^\(idle\)|^\(program\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 28);
const lt = await page.evaluate(() => window.__lt);
console.log("long tasks (start,dur ms):", JSON.stringify(lt.filter((x) => x[1] > 150)), " total blocking:", lt.reduce((s, x) => s + Math.max(0, x[1] - 50), 0), "ms");
console.log("state:", await page.evaluate(() => ({ gpu: document.documentElement.dataset.gpu, glOn: document.documentElement.classList.contains("gl-on") })));
for (const [k, v] of top) console.log(String(Math.round(v)).padStart(6) + "ms  " + k);
await b.close();
