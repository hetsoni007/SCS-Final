import type { MetadataRoute } from "next";
import { allPageSlugs, getPage, getPosts } from "@/lib/content";
import { cases } from "@/content/work";
import { site } from "@/content/site";

export const dynamic = "force-static";
/** Same URL forms as the live sitemap: pages end in "/", posts do not, home has no trailing slash. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = allPageSlugs().map((s) => { const p = getPage(s); return { url: s === "index" ? site.url : `${site.url}${p.path}`, changeFrequency: "monthly" as const, priority: s === "index" ? 1 : 0.8 }; });
  const work = cases.map((c) => ({ url: `${site.url}/work/${c.slug}/`, changeFrequency: "monthly" as const, priority: 0.6 }));
  const posts = getPosts().map((p) => ({ url: p.canonical, lastModified: p.dateModified ?? p.datePublished, changeFrequency: "monthly" as const, priority: 0.7 }));
  return [...pages, ...work, ...posts];
}
