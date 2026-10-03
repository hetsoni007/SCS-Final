import { expect, test } from "@playwright/test";
import live from "./fixtures/live-pages.json";
import { norm } from "./helpers";

/**
 * Migration guarantees: every URL in the live sitemap still answers 200, with the same
 * title, meta description, canonical, robots directive and H1 as the live site (captured 2026-10-01).
 */
test.describe("live URL parity", () => {
  for (const p of live) {
    test(`${p.path}`, async ({ request }) => {
      const res = await request.get(p.path, { maxRedirects: 0 });
      expect(res.status(), "status").toBe(200);
      const html = await res.text();
      const pick = (re: RegExp) => (re.exec(html)?.[1] ?? "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      expect(pick(/<title>([^<]*)<\/title>/), "title").toBe(p.title);
      expect(pick(/<meta name="description" content="([^"]*)"/), "description").toBe(p.description);
      expect(pick(/<link rel="canonical" href="([^"]*)"/), "canonical").toBe(p.canonical);
      expect(pick(/<meta name="robots" content="([^"]*)"/).replace(/\s/g, ""), "robots").toBe(p.robots.replace(/\s/g, ""));
      const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? "";
      const h1Text = norm(h1.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&nbsp;| /g, " "));
      expect((html.match(/<h1[\s>]/g) ?? []).length, "exactly one h1").toBe(1);
      // the home H1 is split into characters for its reveal; its accessible name carries the text
      const aria = /<h1[^>]*aria-label="([^"]*)"/.exec(html)?.[1]?.replace(/&amp;/g, "&");
      expect(norm(aria ?? h1Text), "h1").toBe(norm(p.h1));
      // FAQ schema is kept wherever the live page had it
      if (p.jsonLd.includes("FAQPage")) expect(html, "FAQPage schema").toContain('"@type":"FAQPage"');
    });
  }

  test("both trailing-slash forms answer 200 without redirecting", async ({ request }) => {
    for (const path of ["/about", "/about/", "/blog/ci-cd-react-native", "/blog/ci-cd-react-native/", "/work/hr-payroll", "/work/hr-payroll/"]) {
      expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(200);
    }
  });

  test("redirects and 404", async ({ request }) => {
    const usa = await request.get("/usa", { maxRedirects: 0 });
    if (process.env.STATIC_HOST) {
      // S3 + CloudFront: the `scs-url-rewrite` function keeps the live site's behaviour, /usa → home page (301).
      expect(usa.status()).toBe(301);
      expect(new URL(usa.headers().location, "http://x").pathname).toBe("/");
    } else {
      expect(usa.status()).toBe(308);
      expect(usa.headers().location).toContain("/react-native-app-development-usa/");
      expect((await request.get("/hire-developers/", { maxRedirects: 0 })).headers().location).toContain("/hire/");
    }
    const missing = await request.get("/definitely-not-a-page/");
    expect(missing.status()).toBe(404);
    expect(await missing.text()).toContain("didn");
  });

  test("sitemap lists every live URL, robots points at it", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const p of live) expect(xml, p.path).toContain(`<loc>${p.canonical || "https://soniconsultancyservices.com" + p.path}</loc>`);
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://soniconsultancyservices.com/sitemap.xml");
  });

  test("no internal link is broken (404 crawl)", async ({ request }) => {
    test.setTimeout(240_000);
    const seen = new Set<string>(), bad: string[] = [];
    const queue = live.map((p) => p.path).concat(["/work/hr-payroll/", "/lab/"]);
    for (const path of queue) {
      const html = await (await request.get(path)).text();
      for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
        const href = m[1];
        if (seen.has(href) || href.startsWith("/_next") || href.startsWith("//")) continue;
        seen.add(href);
        const r = await request.get(href, { maxRedirects: 3 });
        if (r.status() >= 400) bad.push(`${href} (${r.status()}) linked from ${path}`);
      }
    }
    expect(bad, bad.join("\n")).toEqual([]);
    expect(seen.size).toBeGreaterThan(60);
  });
});
