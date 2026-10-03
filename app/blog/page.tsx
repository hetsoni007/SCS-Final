import { PageHero } from "@/components/sections/PageView";
import BlogCard, { ThumbWarpFilter } from "@/components/sections/BlogCard";
import { FilterGrid } from "@/components/sections/BlogClient";
import { CtaBand } from "@/components/sections/SectionHead";
import { RenderForm } from "@/components/sections/Blocks";
import { findBlock, getPage, getPosts, pageMetadata } from "@/lib/content";
import { JsonLd, breadcrumbSchema } from "@/lib/schema";
import { site } from "@/content/site";

const page = getPage("blog");
export const metadata = pageMetadata(page.meta, page.path);

export default function BlogIndex() {
  const posts = getPosts();
  const featured = posts.find((p) => p.indexOrder === 0) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured.slug);
  const form = findBlock(page.sections.flatMap((s) => s.blocks), "form");
  return (
    <>
      <ThumbWarpFilter />
      <PageHero page={page} blocks={page.sections[0].blocks} />
      <section className="pb-10" data-loc="blog-index">
        <div className="wrap">
          <BlogCard post={featured} featured />
          <div className="mt-10">
            <FilterGrid items={rest.map((p) => ({ cats: p.categories, text: `${p.title} ${p.excerpt ?? ""} ${p.categories.join(" ")}`.toLowerCase() }))}>
              {rest.map((p, i) => <BlogCard key={p.slug} post={p} i={i} />)}
            </FilterGrid>
          </div>
        </div>
      </section>
      {form && <section className="section"><div className="wrap"><RenderForm b={form} /></div></section>}
      <CtaBand title="Got a product idea?<br>Let's talk this week." lead="A free 30-minute call with a senior engineer — no pitch, no obligation." primary={{ label: "Book a Free Call →", href: site.calendly }} secondary={{ label: "See our work", href: "/work/" }} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog/" }])} />
    </>
  );
}
