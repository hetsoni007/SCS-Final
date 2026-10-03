// Reports the gzip size of the JavaScript a route's HTML asks the browser for (the "initial route JS"),
// against the 180 KB budget. Counts <script src> and <link rel="preload" as="script">; ignores `nomodule`
// polyfills (modern browsers never download them). Code fetched later by import() — the 3D canvas,
// GSAP/Lenis, the Calendly modal — is not part of the initial route JS and is not counted here.
// Usage: node scripts/js-budget.mjs [--detail] http://localhost:3100 / /services/ …
import zlib from "node:zlib";
const args = process.argv.slice(2);
const detail = args.includes("--detail");
const [base, ...paths] = args.filter((a) => a !== "--detail");
const BUDGET = 180;
const cache = new Map();
const size = async (src) => {
  if (!cache.has(src)) cache.set(src, zlib.gzipSync(Buffer.from(await (await fetch(base + src)).arrayBuffer())).length);
  return cache.get(src);
};
let failed = false;
for (const p of paths) {
  const html = await (await fetch(base + p)).text();
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js[^"]*)"[^>]*>/g)].filter((m) => !/\bnomodule\b/i.test(m[0])).map((m) => m[1]);
  const preloads = [...html.matchAll(/<link\b[^>]*>/g)].filter((m) => /rel="preload"/.test(m[0]) && /as="script"/.test(m[0])).map((m) => /href="([^"]+)"/.exec(m[0])?.[1]).filter(Boolean);
  const all = [...new Set([...scripts, ...preloads])];
  let total = 0;
  const rows = [];
  for (const s of all) { const n = await size(s); total += n; rows.push([n, s, scripts.includes(s) ? "script" : "preload"]); }
  const kb = Math.round(total / 1024);
  if (kb > BUDGET) failed = true;
  console.log(`${String(kb).padStart(4)} KB gz  ${String(all.length).padStart(2)} files  ${kb > BUDGET ? "OVER" : "ok  "}  ${p}`);
  if (detail) for (const [n, s, kind] of rows.sort((a, b) => b[0] - a[0])) console.log(`        ${(n / 1024).toFixed(1).padStart(6)} KB  ${kind.padEnd(7)}  ${s.split("/").pop()}`);
}
process.exit(failed ? 1 : 0);
