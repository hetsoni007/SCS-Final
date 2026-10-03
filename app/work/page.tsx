import PageView from "@/components/sections/PageView";
import WorkIndex, { WorkStats } from "@/components/sections/WorkIndex";
import { CtaBand } from "@/components/sections/SectionHead";
import Testimonials from "@/components/sections/Testimonials";
import { getPage, pageMetadata } from "@/lib/content";
import { site } from "@/content/site";
import { cases, enterprise, enterpriseIntro, workStats } from "@/content/work";

const page = getPage("work");
export const metadata = pageMetadata(page.meta, page.path);

// only the fields the index cards show are sent to the client; the full copy lives on /work/[slug]/
const index = cases.map((c) => ({
  slug: c.slug, kind: c.kind, title: c.title, short: c.short, eyebrow: c.eyebrow, summary: c.summary, result: c.result, status: c.status, stack: c.stack,
  metrics: c.metrics.map((m) => ({ num: m.num, lbl: m.lbl })), shots: c.shots.slice(0, 2).map((s) => ({ src: s.src, alt: s.alt })),
}));

export default function Page() {
  return (
    <PageView
      page={page}
      replace={{
        1: <WorkStats stats={workStats} />,
        2: <WorkIndex cases={index} enterprise={enterprise} intro={enterpriseIntro} />,
        3: <CtaBand title="Have a platform to architect or migrate?" lead="From compliance systems to cloud migrations — let's scope the architecture together." primary={{ label: "Book a Free Call →", href: site.calendly }} secondary={{ label: "Our services", href: "/services/" }} loc="enterprise-cta" />,
        4: <Testimonials />,
      }}
    />
  );
}
