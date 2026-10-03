// Turns the Next.js static export (out/) into the layout S3 + the CloudFront rewrite function expect (dist/).
//
//   node scripts/prepare-static.mjs [out] [dist]
//
// CloudFront function `scs-url-rewrite` maps  /about  and  /about/  to  /about/index.html,  and leaves any
// path that contains a "." untouched. Next writes  about.html  and extensionless  about/opengraph-image,  so:
//   1. every  x.html  becomes  x/index.html
//   2. every  opengraph-image  becomes  opengraph-image.png  and the pages that point at it are updated
//   3. the hidden design-system page (/lab) is left out of the production upload
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const [src = "out", dest = "dist"] = process.argv.slice(2);
if (!existsSync(join(src, "index.html"))) { console.error(`${src}/index.html not found: run the static build first (STATIC_EXPORT=1 next build).`); process.exit(1); }

rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });

const walk = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });

// 3. drop the hidden page and the generic not-found duplicate
for (const p of ["lab", "lab.html", "lab.txt", "_not-found.html"]) rmSync(join(dest, p), { recursive: true, force: true });

let pages = 0, images = 0;
for (const file of walk(dest)) {
  const rel = relative(dest, file);
  const base = rel.split("/").pop();
  if (base === "opengraph-image") { renameSync(file, `${file}.png`); images++; continue; }
  if (base.endsWith(".html") && rel !== "index.html" && rel !== "404.html") {
    const target = join(dest, rel.slice(0, -".html".length), "index.html");
    mkdirSync(dirname(target), { recursive: true });
    renameSync(file, target);
    pages++;
  }
}

// 2. point og:image / twitter:image (and the matching RSC payloads) at the .png names, keeping the cache-busting query
let patched = 0;
for (const file of walk(dest)) {
  if (!/\.(html|txt)$/.test(file)) continue;
  const s = readFileSync(file, "utf8");
  const t = s.replace(/opengraph-image\?/g, "opengraph-image.png?");
  if (t !== s) { writeFileSync(file, t); patched++; }
}

const must = ["index.html", "404.html", "sitemap.xml", "robots.txt"];
const missing = must.filter((f) => !existsSync(join(dest, f)));
if (missing.length) { console.error("missing from dist:", missing.join(", ")); process.exit(1); }
console.log(`dist ready: ${pages} pages moved to <path>/index.html, ${images} OG images renamed to .png, ${patched} files re-pointed`);
