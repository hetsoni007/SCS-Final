import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import type { Metadata } from "next";
import SceneBox from "@/components/sections/SceneBox";
import { Breadcrumb } from "@/components/sections/PageView";
import { CtaBand } from "@/components/sections/SectionHead";
import { PhoneFrame } from "@/components/ui/Poster";
import Rich, { stripTags } from "@/components/ui/Rich";
import { Counter } from "@/components/ui/Bits";
import { caseBySlug, cases } from "@/content/work";
import { site } from "@/content/site";
import { JsonLd, breadcrumbSchema, creativeWorkSchema } from "@/lib/schema";

export const dynamicParams = false;
export const generateStaticParams = () => cases.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const c = caseBySlug((await params).slug);
  if (!c) return {};
  const title = `${c.title} — ${c.kind === "concept" ? "Design Concept" : "Case Study"} | Soni Consultancy Services`;
  return { title, description: c.summary, alternates: { canonical: `${site.url}/work/${c.slug}/` }, openGraph: { title, description: c.summary, url: `${site.url}/work/${c.slug}/`, type: "article" } };
}

export default async function CasePage({ params }: PageProps<"/work/[slug]">) {
  const c = caseBySlug((await params).slug);
  if (!c) notFound();
  const i = cases.indexOf(c), next = cases[(i + 1) % cases.length];
  const screens = c.shots.map((s) => s.src);
  const psr = [["Problem", c.problem], ["Solution", c.solution], [c.kind === "concept" ? "Outcome" : "Result", c.result]].filter(([, v]) => v) as [string, string][];
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-[calc(var(--nav-h)+72px)]" data-loc="case-hero">
        <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <Breadcrumb trail={[{ name: "Home", path: "/" }, { name: "Work", path: "/work/" }, { name: c.short, path: `/work/${c.slug}/` }]} />
            <p className="eyebrow">{c.eyebrow}</p>
            <h1 className="h1 mt-5">{c.title}</h1>
            <p className="lead mt-6">{c.summary}</p>
            <dl className="mt-8 grid max-w-[640px] grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-6 text-[15px] sm:grid-cols-4">
              {[["Industry", c.industry], ["Duration", c.duration ?? "—"], ["Status", c.status], ["Stack", c.stack.slice(0, 2).join(" · ")]].map(([k, v]) => (
                <div key={k} className={k === "Status" ? "col-span-2 sm:col-span-1" : ""}><dt className="mono text-[11px] uppercase tracking-widest text-lo">{k}</dt><dd className="mt-1 text-hi">{v}</dd></div>
              ))}
            </dl>
          </div>
          <ViewTransition name={`case-${c.slug}`}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px]">
              {screens.length ? <SceneBox scene="device" sceneProps={{ screens: screens.slice(0, 4) }} poster="device" screens={screens} className="h-full w-full" /> : <SceneBox scene="neural" className="h-full w-full" />}
            </div>
          </ViewTransition>
        </div>
      </section>

      {psr.length > 0 && (
        <section className="section !pt-6"><div className="wrap grid gap-4 lg:grid-cols-3">
          {psr.map(([k, v], j) => (
            <div key={k} className="glass spot p-7" data-reveal style={{ "--i": j } as React.CSSProperties}>
              <span className="step-n">0{j + 1}</span>
              <h2 className="h3 mt-2 !text-[28px]">{k}</h2>
              <p className="muted mt-3"><Rich html={v} /></p>
            </div>
          ))}
        </div></section>
      )}

      {c.notes && (
        <section className="section !pt-6"><div className="wrap">
          <h2 className="h2">What the concept covers.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{c.notes.map((n, j) => <div key={n.k} className="glass spot p-6" data-reveal style={{ "--i": j } as React.CSSProperties}><h3 className="h3">{n.k}</h3><p className="muted mt-2 text-[15.5px]"><Rich html={n.html} /></p></div>)}</div>
          {c.research && <p className="glass mt-6 border-l-2 !border-l-accent p-5 text-mid">{c.research}</p>}
        </div></section>
      )}

      {c.metrics.length > 0 && (
        <section className="section !pt-0" aria-label="Results"><div className="wrap grid gap-4 sm:grid-cols-3">
          {c.metrics.map((m, j) => (
            <div key={m.lbl} className="glass spot p-7 text-center" data-reveal style={{ "--i": j } as React.CSSProperties}>
              <span className="font-display block text-[clamp(48px,6vw,88px)] font-bold leading-none tracking-tighter"><span className="grad-text">{m.count != null ? <Counter value={m.count} prefix={m.prefix ?? ""} suffix={m.suffix ?? ""} /> : m.num}</span></span>
              <span className="muted mt-3 block">{m.lbl}</span>
            </div>
          ))}
        </div></section>
      )}

      {c.shots.length > 0 && (
        <section className="section !pt-0"><div className="wrap">
          <h2 className="h2">Inside the product.</h2>
          <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {c.shots.map((s, j) => <li key={s.src} data-reveal style={{ "--i": j % 4 } as React.CSSProperties}><figure><PhoneFrame src={s.src} alt={s.alt} /><figcaption className="dim mt-3 text-center">{s.cap ?? s.alt}</figcaption></figure></li>)}
          </ul>
        </div></section>
      )}

      {c.flows && (
        <section className="section !pt-0"><div className="wrap">
          <h2 className="h2">How it works.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {c.flows.map((f) => <div key={f.label} className="glass p-7" data-reveal><h3 className="h3">{f.label}</h3><ol className="mt-5 grid gap-3">{f.steps.map((st, j) => <li key={st} className="flex gap-4 text-mid"><span className="step-n mt-0.5">{String(j + 1).padStart(2, "0")}</span>{st}</li>)}</ol></div>)}
          </div>
        </div></section>
      )}

      <section className="section !pt-0"><div className="wrap">
        <h2 className="eyebrow">Tech stack</h2>
        <ul className="mt-5 flex flex-wrap gap-2">{c.stack.map((s) => <li key={s} className="chip !px-5 !py-2.5 !text-[14px]">{s}</li>)}</ul>
        <p className="dim mt-6">Product names are withheld under client NDAs. {c.kind === "concept" ? "This is a design concept, not a shipped product." : "The problems, solutions, metrics, tech stacks and screens shown are real."}{c.industryPage && <> See also: <Link href={c.industryPage} className="underline underline-offset-4 hover:text-hi">related industry page</Link>.</>}</p>
      </div></section>

      <section className="pb-10"><div className="wrap">
        <Link href={`/work/${next.slug}/`} className="glass spot group flex items-center justify-between gap-6 p-8 md:p-12" data-cursor="View">
          <span><span className="eyebrow">Next project</span><span className="h2 mt-3 block">{next.title}</span><span className="muted mt-2 block">{next.tagline}</span></span>
          <span className="font-display text-[64px] leading-none text-accent-2 transition-transform duration-500 group-hover:translate-x-3" aria-hidden>→</span>
        </Link>
      </div></section>

      <CtaBand title="Want something like this built?" lead="Tell us what you have in mind. We’ll tell you what it takes, and what it doesn’t need." primary={{ label: "Book a Free Call →", href: site.calendly }} secondary={{ label: "See our work", href: "/work/" }} />
      <JsonLd data={[creativeWorkSchema(c.title, stripTags(c.summary), `/work/${c.slug}/`, c.stack), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/work/" }, { name: c.title, path: `/work/${c.slug}/` }])]} />
    </>
  );
}
