import Link from "next/link";
import Hero from "@/components/sections/Hero";
import { ProcessPipeline, ServicesPinned, TrustMarquee } from "@/components/sections/HomeTop";
import { FinalCTA, WorkShowcase } from "@/components/sections/HomeBottom";
import Testimonials from "@/components/sections/Testimonials";
import { Bento, Founder, Manifesto, Stats, ToolsTeaser } from "@/components/sections/HomeStatic";
import BlogCard, { ThumbWarpFilter } from "@/components/sections/BlogCard";
import { SectionHead } from "@/components/sections/SectionHead";
import { RenderForm } from "@/components/sections/Blocks";
import { getPage, getPosts, pageMetadata } from "@/lib/content";
import { JsonLd, personSchema } from "@/lib/schema";
import { liveCases } from "@/content/work";
import type { Block } from "@/lib/content";

const page = getPage("index");
// The same "Start here" form as the service pages, for visitors who would rather write two lines than book a call.
const startForm: Extract<Block, { t: "form" }> = {
  t: "form", id: "leadForm", fields: [], submit: "Send →", kick: "Start here", title: "Tell us what you’re building.", price: "Websites from $500 · app features from $5,000 · MVP apps from $12,000",
  sub: "One short form. You get a straight answer on scope and a fixed price within 48 hours — or an honest no if it isn’t a fit.",
};
export const metadata = pageMetadata(page.meta, "/");

export default function Home() {
  const latest = [...getPosts()].sort((a, b) => b.datePublished.localeCompare(a.datePublished)).slice(0, 3);
  // only what the carousel shows is sent to the client
  const showcase = liveCases.map((c) => ({ slug: c.slug, short: c.short, tagline: c.tagline, status: c.status, metrics: c.metrics.map((m) => ({ num: m.num, lbl: m.lbl })), shots: c.shots.slice(0, 3).map((s) => ({ src: s.src, alt: s.alt })) }));
  return (
    <>
      <Hero />
      <TrustMarquee />
      <Stats />
      <Manifesto />
      <ServicesPinned />
      <ProcessPipeline />
      <WorkShowcase cases={showcase} />
      <Bento />
      <Founder />
      <Testimonials />
      <ToolsTeaser />
      <section className="section" data-loc="blog-teaser">
        <ThumbWarpFilter />
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead eyebrow="Latest from the blog" title="From the studio." />
            <Link href="/blog/" className="btn btn-glass" data-cta>All posts →</Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">{latest.map((p, i) => <BlogCard key={p.slug} post={p} i={i} />)}</div>
        </div>
      </section>
      <section className="section" data-loc="home-form">
        <div className="wrap"><RenderForm b={startForm} /></div>
      </section>
      <FinalCTA />
      <JsonLd data={[personSchema()]} />
    </>
  );
}
