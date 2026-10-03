import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import PageView from "@/components/sections/PageView";
import { ArchExplorer, AssistantDemo, IdeaConstellation, MvpScoper, OpsDashboard, PlatformToggle } from "@/components/lazy";
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

/** Bespoke interactive sections per page. Everything else comes from the shared template. */
function extras(slug: string, page: PageContent): { replace?: Record<number, ReactNode>; insertAfter?: Record<number, ReactNode>; compactPipeline?: number } {
  const sec = (i: number) => page.sections[i]?.blocks ?? [];
  switch (slug) {
    case "services":
      return { compactPipeline: 2 }; // reuses the 3D pipeline (compact) for "Five steps"
    case "ai-app-development": {
      const b = sec(2), grid = findBlock(b, "grid");
      const ideas = (grid?.items ?? []).map((it) => ({ title: html(it.blocks.find((x) => x.t === "h")), body: html(it.blocks.find((x) => x.t === "p")), tag: html(it.blocks.find((x) => x.t === "text")) }));
      return {
        replace: { 2: <IdeaConstellation eyebrow={html(findBlock(b, "eyebrow"))} title={html(findBlock(b, "h"))} lead={html(findBlock(b, "p"))} ideas={ideas} /> },
        insertAfter: process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === "true" ? { 3: <AssistantDemo /> } : {},
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
