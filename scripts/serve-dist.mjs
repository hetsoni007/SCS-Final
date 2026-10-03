// Serves dist/ the way S3 + CloudFront do, so the Playwright suite can run against the real deploy artefact.
//
//   node scripts/serve-dist.mjs [dist] [port]      (defaults: dist, 3200)
//
// It applies the same URL rewrite as the CloudFront function `scs-url-rewrite` (main-site branch) and answers
// missing keys with 404.html and status 404, like the distribution's custom error response.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const [root = "dist", port = "3200"] = process.argv.slice(2);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".pdf": "application/pdf", ".ico": "image/x-icon" };
const GONE = new Set(["/usa", "/uk", "/uae", "/australia", "/canada"]);

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  let uri = decodeURIComponent(url.pathname);
  const key = uri.toLowerCase().replace(/\/+$/, "") || "/";
  if (GONE.has(key)) { res.writeHead(301, { location: "/" }).end(); return; }
  if (uri.endsWith("/")) uri += "index.html"; else if (!uri.includes(".")) uri += "/index.html";
  const file = normalize(join(root, uri));
  const ok = file.startsWith(normalize(root)) && existsSync(file) && statSync(file).isFile();
  const send = (path, status) => { res.writeHead(status, { "content-type": types[extname(path)] ?? "application/octet-stream", "cache-control": "no-cache" }); res.end(readFileSync(path)); };
  if (ok) send(file, 200); else if (existsSync(join(root, "404.html"))) send(join(root, "404.html"), 404); else { res.writeHead(404).end("Not found"); }
}).listen(Number(port), "127.0.0.1", () => console.log(`serving ${root}/ on http://127.0.0.1:${port} with the CloudFront rewrite`));
