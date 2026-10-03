import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx";
import BlogCard, { ThumbWarpFilter } from "@/components/sections/BlogCard";
import { ReadingProgress, ShareRow, Toc } from "@/components/sections/BlogClient";
import { Breadcrumb } from "@/components/sections/PageView";
import { CtaBand } from "@/components/sections/SectionHead";
import { getPost, getPosts, postDate, readPostJsonLd } from "@/lib/content";
import { JsonLd } from "@/lib/schema";
import { site } from "@/content/site";

export const dynamicParams = false;
export const generateStaticParams = () => getPosts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.metaTitle, description: p.description, keywords: p.keywords, alternates: { canonical: p.canonical },
    authors: [{ name: p.author, url: site.founder.linkedin }],
    openGraph: { type: "article", title: p.ogTitle ?? p.title, description: p.ogDescription ?? p.description, url: p.canonical, publishedTime: p.datePublished, modifiedTime: p.dateModified, authors: [p.author] },
    twitter: { card: "summary_large_image", title: p.ogTitle ?? p.title, description: p.ogDescription ?? p.description },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const related = post.related.map(getPost).filter((p) => !!p);
  const ld = readPostJsonLd(post.slug).filter((j) => !["Organization", "WebSite"].includes(String(j["@type"])));
  const cta = post.cta?.heading && post.cta.buttons.length ? post.cta : null;
  return (
    <>
      <ReadingProgress />
      <ThumbWarpFilter />
      <article id="article">
        <header className="wrap-narrow pb-10 pt-[calc(var(--nav-h)+72px)]">
          <Breadcrumb trail={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog/" }, { name: post.categories[0] ?? "Post", path: `/blog/${post.slug}` }]} />
          <p className="eyebrow">{post.categories.join(" · ")}</p>
          <h1 className="h1 mt-5 !text-[clamp(34px,5vw,64px)]">{post.title}</h1>
          <p className="lead mt-6">{post.lead}</p>
          <p className="dim mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-mid">{post.author}</span><span aria-hidden>·</span>
            <span>{[post.readTime, postDate(post)].filter(Boolean).join(" · ")}</span>
            <time dateTime={post.dateModified ?? post.datePublished} className="sr-only">{post.dateModified ?? post.datePublished}</time>
          </p>
        </header>
        <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,760px)_minmax(0,1fr)]">
          <aside className="hidden lg:block"><div className="sticky top-[calc(var(--nav-h)+32px)] max-h-[70vh] overflow-y-auto pr-2" data-lenis-prevent><Toc headings={post.headings} /></div></aside>
          <div className="prose min-w-0">
            <MDXRemote source={post.body} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            <div className="not-prose mt-12 grid gap-6 border-t border-line pt-8">
              <ShareRow title={post.title} url={post.canonical} />
              <div className="glass flex items-center gap-5 p-6">
                <span className="font-display grid h-14 w-14 shrink-0 place-items-center rounded-full text-[18px] font-bold text-white" style={{ background: "var(--grad)" }} aria-hidden>{site.founder.initials}</span>
                <p className="text-[15px] text-mid"><span className="block text-[16px] font-semibold text-hi">{site.founder.name}</span>{site.founder.role} at {site.name}. 5+ years building and shipping React Native, MERN and AI apps to the App Store and Google Play. <a href={site.founder.linkedin} target="_blank" rel="noopener" className="text-accent-2 underline underline-offset-4">LinkedIn</a> · <Link href="/about/" className="text-accent-2 underline underline-offset-4">About</Link></p>
              </div>
            </div>
          </div>
          <div />
        </div>
      </article>
      {cta && <CtaBand title={cta.heading!} lead={cta.body} primary={cta.buttons[0]} secondary={cta.buttons[1]} loc="post-cta" />}
      <section className="pb-6"><div className="wrap-narrow">
        <div className="glass spot flex flex-wrap items-center justify-between gap-6 p-7" data-loc="newsletter">
          <div className="min-w-0">
            <p className="eyebrow">Newsletter · {site.newsletter.cadence}</p>
            <h2 className="h3 mt-3">{site.newsletter.name}</h2>
            <p className="muted mt-2 max-w-[52ch] text-[15.5px]">{site.newsletter.blurb}</p>
          </div>
          <a href={site.newsletter.url} target="_blank" rel="noopener" className="btn btn-primary" data-cta data-magnetic="0.2">Subscribe on LinkedIn →</a>
        </div>
      </div></section>
      {related.length > 0 && (
        <section className="section"><div className="wrap">
          <h2 className="h2">Keep reading</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{related.map((p, i) => <BlogCard key={p!.slug} post={p!} i={i} />)}</div>
        </div></section>
      )}
      <JsonLd data={ld} />
    </>
  );
}
