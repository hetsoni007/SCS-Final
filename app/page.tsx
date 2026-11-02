import Link from "next/link";
import Hero from "@/components/sections/Hero";
import { ProcessPipeline, ServicesPinned, TrustMarquee } from "@/components/sections/HomeTop";
import { FinalCTA, WorkShowcase } from "@/components/sections/HomeBottom";
import Testimonials from "@/components/sections/Testimonials";
import { Bento, Founder, Manifesto, Stats, ToolsTeaser } from "@/components/sections/HomeStatic";
import BlogCard, { ThumbWarpFilter } from "@/components/sections/BlogCard";
import { SectionHead } from "@/components/sections/SectionHead";
import InquiryPanel from "@/components/inquiry/InquiryPanel";
import { getPage, getPosts, pageMetadata } from "@/lib/content";
import { JsonLd, personSchema } from "@/lib/schema";
import { liveCases, storeAppCount } from "@/content/work";

const page = getPage("index");
// Price line kept exactly as it was on the previous home form (no new prices).
const PRICE = "Websites from $500 · app features from $1,000 · MVP apps from $2,500";
export const metadata = pageMetadata(page.meta, "/");

export default function Home() {
  const latest = [...getPosts()].sort((a, b) => b.datePublished.localeCompare(a.datePublished)).slice(0, 3);
  // only what the carousel shows is sent to the client
  const showcase = liveCases.map((c) => ({ slug: c.slug, short: c.short, tagline: c.tagline, status: c.status, metrics: c.metrics.map((m) => ({ num: m.num, lbl: m.lbl })), shots: c.shots.slice(0, 3).map((s) => ({ src: s.src, alt: s.alt })) }));
  return (
    <>
      <Hero storeApps={storeAppCount} />
      <TrustMarquee />
      <Stats />
      <Manifesto />
      <ServicesPinned />
      <ProcessPipeline />
      <section className="section" data-loc="home-form"><div className="wrap"><InquiryPanel price={PRICE} /></div></section>
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
      <FinalCTA />
      <JsonLd data={[personSchema()]} />
    </>
  );
}
