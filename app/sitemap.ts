import type { MetadataRoute } from "next";
import { allPageSlugs, getPage, getPosts } from "@/lib/content";
import { cases } from "@/content/work";
import { site } from "@/content/site";

export const dynamic = "force-static";
/** Same URL forms as the live sitemap: pages end in "/", posts do not, home has no trailing slash. */
/** lastmod only where a real date exists: pages carry none in their content, so this lists the ones edited on a known date,
 *  and the blog index follows its newest post. Everything else is left without a lastmod rather than guessed. */
const pageLastmod: Record<string, string> = { "app-cost-calculator": "2026-11-01" };
export default function sitemap(): MetadataRoute.Sitemap {
  const all = getPosts();
  const newest = all.map((p) => p.dateModified ?? p.datePublished).sort().at(-1);
  const pages = allPageSlugs().map((s) => { const p = getPage(s); const lastModified = pageLastmod[s] ?? (s === "blog" ? newest : undefined); return { url: s === "index" ? site.url : `${site.url}${p.path}`, ...(lastModified ? { lastModified } : {}), changeFrequency: "monthly" as const, priority: s === "index" ? 1 : 0.8 }; });
  const work = cases.map((c) => ({ url: `${site.url}/work/${c.slug}/`, changeFrequency: "monthly" as const, priority: 0.6 }));
  const posts = all.map((p) => ({ url: p.canonical, lastModified: p.dateModified ?? p.datePublished, changeFrequency: "monthly" as const, priority: 0.7 }));
  return [...pages, ...work, ...posts];
}
