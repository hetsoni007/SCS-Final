import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import PageView from "@/components/sections/PageView";
import ToolSection from "@/components/sections/ToolSection";
import { ArchExplorer, AssistantDemo, EngagementModels, IdeaConstellation, MvpScoper, OpsDashboard, PlatformToggle, RegionsGlobe, ScreenTour, ServiceExplorer } from "@/components/lazy";
import type { SceneKey } from "@/lib/gl-store";
import { caseBySlug } from "@/content/work";
import { stripTags } from "@/components/ui/Rich";
import { templatePages } from "@/content/page-config";
import { findBlock, getPage, pageMetadata, type Block, type PageContent } from "@/lib/content";

export const dynamicParams = false;
export const generateStaticParams = () => templatePages.map((slug) => ({ slug }));

export async function generateMetadata({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (!templatePages.includes(slug)) return {};
  const page = getPage(slug);
  return pageMetadata(page.meta, page.path);
}

const html = (b: Block | undefined) => (b && "html" in b ? b.html : b && "text" in b ? b.text : "");
const txt = (blocks: Block[], cls: string) => stripTags(html(blocks.find((b) => b.t === "text" && (b.cls ?? "") === cls)));
const listOf = (blocks: Block[]) => (blocks.find((b) => b.t === "list") as Extract<Block, { t: "list" }> | undefined)?.items ?? [];
const chipsOf = (blocks: Block[]) => ((blocks.find((b) => b.t === "chips") as Extract<Block, { t: "chips" }> | undefined)?.items ?? []).map((c) => c.label);
/** The 3D scene shown for each service in the explorer on /services/. */
const serviceScene = (title: string): { scene: SceneKey; sceneProps?: Record<string, unknown>; href?: string } =>
  /react native/i.test(title) ? { scene: "codeSplit", href: "/react-native-app-development/" }
  : /mvp/i.test(title) ? { scene: "blocks", sceneProps: { count: 10 }, href: "/mvp-development/" }
  : /mern|web development/i.test(title) ? { scene: "nodeGraph" }
  : /\bai\b/i.test(title) ? { scene: "neural", href: "/ai-app-development/" }
  : /devops|cloud/i.test(title) ? { scene: "cloud", href: "/devops-cloud-engineering/" }
  : /hire/i.test(title) ? { scene: "pods", href: "/hire/" }
  : /wordpress/i.test(title) ? { scene: "browser", href: "/wordpress-website-development-india/" }
  : { scene: "exploded" };
/** Real app screens for the industry pages, from the matching case study. */
const tour = (caseSlug: string, title: string) => { const c = caseBySlug(caseSlug); return c ? <ScreenTour eyebrow="Inside the product" title={title} shots={c.shots.map((s) => ({ src: s.src, alt: s.alt, cap: s.cap }))} /> : null; };

/** Bespoke interactive sections per page. Everything else comes from the shared template. */
function extras(slug: string, page: PageContent): { replace?: Record<number, ReactNode>; insertAfter?: Record<number, ReactNode>; compactPipeline?: number } {
  const sec = (i: number) => page.sections[i]?.blocks ?? [];
  switch (slug) {
    case "services": {
      const grid = findBlock(sec(1), "grid");
      const items = (grid?.items ?? []).map((it) => { const title = stripTags(html(it.blocks.find((x) => x.t === "h"))); return { n: txt(it.blocks, "num"), title, body: html(it.blocks.find((x) => x.t === "p")), points: listOf(it.blocks), chips: chipsOf(it.blocks), ...serviceScene(title) }; });
      return { replace: { 1: <ServiceExplorer items={items} /> }, compactPipeline: 2 }; // "Five steps" reuses the 3D pipeline (compact)
    }
    case "hire": {
      const b = sec(1), grid = findBlock(b, "grid");
      const models = (grid?.items ?? []).map((it) => ({ title: stripTags(html(it.blocks.find((x) => x.t === "h"))), body: html(it.blocks.find((x) => x.t === "p")), points: listOf(it.blocks), chips: chipsOf(it.blocks), badge: txt(it.blocks, "badge") || undefined }));
      return { replace: { 1: <EngagementModels eyebrow={html(findBlock(b, "eyebrow"))} title={html(findBlock(b, "h"))} models={models} /> } };
    }
    case "about": {
      const b = sec(4), grid = findBlock(b, "grid");
      const regions = (grid?.items ?? []).map((it) => ({ flag: txt(it.blocks, "fl"), country: txt(it.blocks, "c"), focus: txt(it.blocks, "i") }));
      return { replace: { 4: <RegionsGlobe eyebrow={html(findBlock(b, "eyebrow"))} title={html(findBlock(b, "h"))} regions={regions} /> } };
    }
    case "fintech-app-development":
      return { insertAfter: { 4: <ToolSection post="rbi-fintech-app-compliance-india" /> } };
    case "retail-app-development":
      return { insertAfter: { 2: tour("retail-ops", "Tour the retail operations app.") } };
    case "ride-hailing-app-development":
      return { insertAfter: { 2: tour("ride-hailing", "Tour the ride-hailing app.") } };
    case "hr-payroll-app-development":
      return { insertAfter: { 2: tour("hr-payroll", "Tour the HR & payroll app.") } };
    case "react-native-app-development-usa":
    case "react-native-app-development-uk":
    case "react-native-app-development-dubai":
      return { insertAfter: { 1: <ToolSection post="native-vs-cross-platform-2026" /> } };
    case "wordpress-website-development-india":
      return { insertAfter: { 2: <ToolSection post="wordpress-website-cost-india" /> } };
    case "ai-app-development": {
      const b = sec(2), grid = findBlock(b, "grid");
      const ideas = (grid?.items ?? []).map((it) => ({ title: html(it.blocks.find((x) => x.t === "h")), body: html(it.blocks.find((x) => x.t === "p")), tag: html(it.blocks.find((x) => x.t === "text")) }));
      return {
        replace: { 2: <IdeaConstellation eyebrow={html(findBlock(b, "eyebrow"))} title={html(findBlock(b, "h"))} lead={html(findBlock(b, "p"))} ideas={ideas} /> },
        insertAfter: { 4: <ToolSection post="can-ai-build-my-app" />, ...(process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === "true" ? { 3: <AssistantDemo /> } : {}) },
      };
    }
    case "devops-cloud-engineering": {
      const panel = findBlock(sec(2), "panel")!, head = findBlock(panel.blocks, "panel")!, dora = findBlock(panel.blocks, "grid", (g) => /dora/.test(g.cls ?? ""))!;
      const a = sec(6);
      return {
        replace: {
          2: <OpsDashboard title={txt(head.blocks, "ti")} sub={stripTags(html(head.blocks.find((x) => x.t === "text" && !x.cls)))} badge={txt(head.blocks, "demo-badge")} dora={dora.items.map((it) => ({ l: txt(it.blocks, "l"), v: txt(it.blocks, "v"), t: txt(it.blocks, "t") }))} note={stripTags(html(sec(2).find((x) => x.t === "p")))} />,
          6: <ArchExplorer eyebrow={html(findBlock(a, "eyebrow"))} title={html(findBlock(a, "h"))} lead={stripTags(html(findBlock(a, "p")))} />,
        },
      };
    }
    case "mvp-development":
      return { insertAfter: { 1: <MvpScoper /> } };
    case "react-native-app-development":
      return { insertAfter: { 1: <PlatformToggle /> } };
    default:
      return {};
  }
}

export default async function Page({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (!templatePages.includes(slug)) notFound();
  const page = getPage(slug);
  return <PageView page={page} {...extras(slug, page)} />;
}
