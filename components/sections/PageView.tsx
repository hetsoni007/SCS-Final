import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Blocks } from "./Blocks";
import SceneBox from "./SceneBox";
import { CtaBand } from "./SectionHead";
import { ProcessPipeline } from "@/components/lazy";
import { crumbLabel, pageScene } from "@/content/page-config";
import type { Block, PageContent, Section } from "@/lib/content";
import { JsonLd, breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { stripTags } from "@/components/ui/Rich";

/** Does the section open with its own heading (directly or inside a layout group)? */
const hasHeading = (blocks: Block[]): boolean => blocks.some((b) => b.t === "h" || (b.t === "group" && hasHeading(b.blocks)));
const isCta = (s: Section) => s.blocks.length === 1 && s.blocks[0].t === "panel" && s.blocks[0].blocks.some((b) => b.t === "buttons") && s.blocks[0].blocks.some((b) => b.t === "h");
const isHero = (s: Section) => s.blocks.some((b) => b.t === "h" && b.level === 1) || s.blocks.some((b) => b.t === "group" && b.blocks.some((x) => x.t === "h" && x.level === 1));

export function Breadcrumb({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mono mb-6 text-[12px] uppercase tracking-widest text-lo">
      <ol className="flex flex-wrap gap-2">
        {trail.map((t, i) => <li key={t.path} className="flex gap-2">{i < trail.length - 1 ? <><Link href={t.path} className="hover:text-hi">{t.name}</Link><span aria-hidden>›</span></> : <span aria-current="page" className="text-mid">{t.name}</span>}</li>)}
      </ol>
    </nav>
  );
}

export function PageHero({ page, blocks, children }: { page: PageContent; blocks: Block[]; children?: ReactNode }) {
  const cfg = pageScene[page.slug];
  const crumb = page.breadcrumb?.split("›").map((s) => s.trim()).filter(Boolean).pop() ?? crumbLabel[page.slug] ?? page.h1;
  return (
    <section className="relative overflow-hidden pb-16 pt-[calc(var(--nav-h)+72px)] md:pb-24" data-loc="hero">
      <div className={`wrap grid items-center gap-10 ${cfg ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : ""}`}>
        <div>
          <Breadcrumb trail={[{ name: "Home", path: "/" }, { name: crumb, path: page.path }]} />
          <Blocks blocks={blocks} />
          {children}
        </div>
        {cfg && <SceneBox scene={cfg.scene} sceneProps={cfg.props} poster={cfg.poster} screens={cfg.screens} className="relative mx-auto aspect-square w-full max-w-[620px] max-lg:max-w-[420px]" />}
      </div>
    </section>
  );
}

/**
 * Shared marketing-page template. Sections come from content/pages/<slug>.json;
 * `replace` swaps a section (by index) for a bespoke component, `after` appends below.
 */
export default function PageView({ page, replace = {}, insertAfter = {}, after, compactPipeline }: { page: PageContent; replace?: Record<number, ReactNode>; insertAfter?: Record<number, ReactNode>; after?: ReactNode; compactPipeline?: number }) {
  // live JSON-LD is ported verbatim; Organization/WebSite are emitted once by the root layout
  const ld = page.jsonLd.filter((j) => !["Organization", "WebSite"].includes(String(j["@type"])));
  // /hire/ is a service page whose live version carries no Service schema
  if (page.slug === "hire" && !ld.some((j) => j["@type"] === "Service")) ld.push(serviceSchema("Hire a Developer", page.meta.description ?? "", page.path));
  if (!ld.some((j) => j["@type"] === "BreadcrumbList") && page.slug !== "index") ld.push(breadcrumbSchema([{ name: "Home", path: "/" }, { name: page.h1, path: page.path }]));
  return (
    <>
      {page.sections.map((s, i) => <Fragment key={i}>{renderSection(s, i)}{insertAfter[i]}</Fragment>)}
      {after}
      <JsonLd data={ld} />
    </>
  );
  function renderSection(s: Section, i: number) {
        if (i in replace) return <div key={i}>{replace[i]}</div>;
        if (i === compactPipeline) return <ProcessPipeline key={i} compact />;
        if (isHero(s)) return <PageHero key={i} page={page} blocks={s.blocks} />;
        if (isCta(s)) {
          const p = s.blocks[0] as Extract<Block, { t: "panel" }>;
          const h = p.blocks.find((b) => b.t === "h") as Extract<Block, { t: "h" }>, lead = p.blocks.find((b) => b.t === "p" && b.cls?.includes("lead")) as Extract<Block, { t: "p" }> | undefined;
          const btn = (p.blocks.find((b) => b.t === "buttons") as Extract<Block, { t: "buttons" }>).items.filter((b) => b.href) as { label: string; href: string }[];
          const note = p.blocks.filter((b) => b.t === "p" && !b.cls?.includes("lead")).map((b) => stripTags((b as { html: string }).html)).join(" · ");
          return <CtaBand key={i} title={h.html} lead={lead?.html} primary={btn[0]} secondary={btn[1]} note={note || undefined} />;
        }
        return (
          <section key={i} id={s.id} className={`${s.blocks.length === 1 && s.blocks[0].t !== "form" ? "py-10" : "section"} ${s.cls ?? ""}`}>
            <div className="wrap"><Blocks blocks={s.blocks} cardLevel={hasHeading(s.blocks) ? 3 : 2} /></div>
          </section>
        );
  }
}
