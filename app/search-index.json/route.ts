import { allPageSlugs, getPage, getPosts } from "@/lib/content";
import { cases } from "@/content/work";

export const dynamic = "force-static";
/** Index for the ⌘K palette: every page, case study and post. */
export function GET() {
  const pages = allPageSlugs().map((s) => { const p = getPage(s); return { title: p.h1 || p.meta.title, href: p.path, group: "Page", kw: `${p.meta.title} ${p.meta.keywords ?? ""}` }; });
  const work = cases.map((c) => ({ title: c.title, href: `/work/${c.slug}/`, group: "Work", kw: `${c.industry} ${c.stack.join(" ")}` }));
  const posts = getPosts().map((p) => ({ title: p.title, href: `/blog/${p.slug}`, group: "Blog", kw: p.categories.join(" ") }));
  return Response.json([...pages, ...work, ...posts]);
}
