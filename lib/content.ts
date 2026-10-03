import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Metadata } from "next";
import { site } from "@/content/site";

const ROOT = path.join(process.cwd(), "content");

/* ───────────── Marketing pages (content/pages/*.json, extracted from the live site) ───────────── */
export type Block =
  | { t: "eyebrow"; text: string }
  | { t: "h"; level: number; html: string; cls?: string }
  | { t: "p"; html: string; cls?: string }
  | { t: "text"; html: string; cls?: string; href?: string }
  | { t: "list"; ordered: boolean; items: string[]; cls?: string }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "img"; src: string; alt: string; cls?: string }
  | { t: "buttons"; items: { label: string; href?: string; variant: "primary" | "glass" }[] }
  | { t: "chips"; items: { label: string; href?: string }[] }
  | { t: "metric"; num: string; lbl: string }
  | { t: "quote"; html: string; cls?: string }
  | { t: "faq"; items: { q: string; a: string }[] }
  | { t: "form"; id?: string; fields: FormField[]; submit: string; kick?: string; title?: string; sub?: string; note?: string; consent?: string; success?: string }
  | { t: "grid"; cls?: string; items: { cls?: string; href?: string; id?: string; blocks: Block[] }[] }
  | { t: "panel"; cls?: string; href?: string; id?: string; blocks: Block[] }
  | { t: "group"; cls?: string; id?: string; blocks: Block[] };
export type FormField = { name?: string; id?: string; type: string; label: string; placeholder?: string; required: boolean; options?: string[] };
export type Section = { id?: string; cls?: string; blocks: Block[] };
export type PageMeta = { title: string; description?: string; keywords?: string; robots?: string; canonical?: string; ogTitle?: string; ogDescription?: string; ogType?: string };
export type PageContent = { slug: string; path: string; meta: PageMeta; h1: string; breadcrumb?: string; jsonLd: Record<string, unknown>[]; sections: Section[] };

export function getPage(slug: string): PageContent {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "pages", `${slug}.json`), "utf8"));
}
export function allPageSlugs(): string[] {
  return fs.readdirSync(path.join(ROOT, "pages")).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
}

/** Depth-first search for the first block of a type (optionally matching a predicate). */
export function findBlock<T extends Block["t"]>(blocks: Block[], t: T, pred?: (b: Extract<Block, { t: T }>) => boolean): Extract<Block, { t: T }> | undefined {
  for (const b of blocks) {
    if (b.t === t && (!pred || pred(b as Extract<Block, { t: T }>))) return b as Extract<Block, { t: T }>;
    const kids = "blocks" in b ? b.blocks : b.t === "grid" ? b.items.flatMap((i) => i.blocks) : null;
    if (kids) { const r = findBlock(kids, t, pred); if (r) return r; }
  }
}
export const pageFaqs = (p: PageContent) => p.sections.flatMap((s) => { const f = findBlock(s.blocks, "faq"); return f ? f.items : []; });

/** Page-for-page metadata port: title, description, canonical, OG copy and robots from the live site. */
export function pageMetadata(m: PageMeta, pathname: string): Metadata {
  const canonical = m.canonical ?? `${site.url}${pathname}`;
  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: { canonical },
    openGraph: { title: m.ogTitle ?? m.title, description: m.ogDescription ?? m.description, url: canonical, type: (m.ogType as "website" | "article") ?? "website", siteName: site.name },
    twitter: { card: "summary_large_image", title: m.ogTitle ?? m.title, description: m.ogDescription ?? m.description },
    // ported page-for-page: the live privacy page, for example, omits max-image-preview
    robots: { index: true, follow: true, ...(!m.robots || m.robots.includes("max-image-preview") ? { "max-image-preview": "large" as const } : {}) },
  };
}

/* ───────────── Blog (content/blog/*.mdx) ───────────── */
export type PostMeta = {
  slug: string; title: string; metaTitle: string; description: string; keywords?: string; canonical: string; ogTitle?: string; ogDescription?: string;
  categories: string[]; lead: string; author: string; readTime?: string; dateLabel?: string; datePublished: string; dateModified?: string;
  excerpt?: string; indexOrder?: number; indexFilter?: string; hasWidget: boolean; related: string[];
  cta?: { heading?: string; body?: string; buttons: { label: string; href: string }[] };
};
export type Post = PostMeta & { body: string; headings: { id: string; text: string }[] };

/** Same slug algorithm as the live site, so existing #anchor links keep working. */
export const slugifyHeading = (s: string) => s.toLowerCase().replace(/&[a-z#0-9]+;/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

let cache: Post[] | null = null;
export function getPosts(): Post[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const dir = path.join(ROOT, "blog");
  cache = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
    const headings = [...content.matchAll(/^## (.+)$/gm)].map((m) => ({ text: m[1].replace(/\\/g, "").replace(/[*_`]/g, ""), id: slugifyHeading(m[1].replace(/\\/g, "")) }));
    return { ...(data as PostMeta), body: content, headings };
  }).sort((a, b) => (a.indexOrder ?? 999) - (b.indexOrder ?? 999) || b.datePublished.localeCompare(a.datePublished));
  return cache;
}
export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);
export const readEmbed = (id: string) => { try { return fs.readFileSync(path.join(ROOT, "blog-embeds", `${id}.html`), "utf8"); } catch { return ""; } };
export const readThumb = (slug: string) => { try { return fs.readFileSync(path.join(ROOT, "blog-embeds", `${slug}.thumb.svg`), "utf8"); } catch { return ""; } };
export const readPostJsonLd = (slug: string): Record<string, unknown>[] => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, "blog-embeds", `${slug}.jsonld.json`), "utf8")); } catch { return []; } };
export const postDate = (p: PostMeta) => p.dateLabel || new Date(p.datePublished).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
