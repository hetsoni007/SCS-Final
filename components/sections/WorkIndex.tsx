"use client";
import Link from "next/link";
import { ViewTransition, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import ViewSlot from "@/components/three/ViewSlot";
import { PhoneFrame, Poster } from "@/components/ui/Poster";
import Rich from "@/components/ui/Rich";
import { Counter } from "@/components/ui/Bits";
import type { CaseStudy, EnterpriseProject } from "@/content/work";

// The page (a Server Component) passes in just what this index renders, so the long case-study copy is not shipped as JavaScript.
export type IndexCase = Pick<CaseStudy, "slug" | "kind" | "title" | "short" | "eyebrow" | "summary" | "result" | "status" | "stack"> & { metrics: { num: string; lbl: string }[]; shots: { src: string; alt: string }[] };
type EnterpriseGroup = { category: string; blurb: string; projects: EnterpriseProject[] };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live apps" },
  { key: "shipped", label: "Shipped products" },
  { key: "concept", label: "Design concepts" },
  { key: "enterprise", label: "Enterprise" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

export function WorkStats({ stats: workStats }: { stats: { count: number; suffix?: string; lbl: string }[] }) {
  return (
    <section className="pb-6"><div className="wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {workStats.map((s, i) => (
        <div key={s.lbl} className="glass spot p-6" data-reveal style={{ "--i": i } as React.CSSProperties}>
          <span className="font-display block text-[clamp(44px,5vw,72px)] font-bold leading-none tracking-tighter"><span className="grad-text"><Counter value={s.count} suffix={s.suffix ?? ""} /></span></span>
          <span className="muted mt-3 block text-[15px]">{s.lbl}</span>
        </div>
      ))}
    </div></section>
  );
}

function CaseCard({ c, i }: { c: IndexCase; i: number }) {
  const tilt = (e: React.PointerEvent<HTMLElement>) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 22}deg`); e.currentTarget.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 12}deg`); };
  return (
    <article id={c.slug} className="glass spot scroll-mt-28 overflow-hidden" data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
      <Link href={`/work/${c.slug}/`} className="grid h-full gap-6 p-6 md:grid-cols-[200px_1fr] md:p-8" data-cursor="View" onPointerMove={tilt} onPointerLeave={(e) => { e.currentTarget.style.setProperty("--ry", "0deg"); e.currentTarget.style.setProperty("--rx", "0deg"); }}>
        <div className="[perspective:900px]">
          <ViewTransition name={`case-${c.slug}`}>
            {c.shots[0] ? (
              <div className="relative mx-auto w-[150px] transition-transform duration-300 ease-out [transform:rotateX(var(--rx,0))_rotateY(var(--ry,-8deg))] md:w-full">
                <PhoneFrame src={c.shots[0].src} alt={c.shots[0].alt} />
                {/* second screen cross-fades in on hover: a lightweight stand-in for a screen recording */}
                {c.shots[1] && <PhoneFrame src={c.shots[1].src} alt="" className="!absolute inset-0 opacity-0 transition-opacity duration-500 [a:hover_&]:opacity-100" />}
              </div>
            ) : (
              <div className="font-display grid aspect-[1.5/3.1] w-[150px] place-items-center rounded-[28px] border border-line-strong bg-bg-2 p-4 text-center text-[18px] font-semibold leading-tight md:w-full" style={{ background: "linear-gradient(160deg,#1f190d,#0d0f16 60%,#151824)" }}>{c.short}</div>
            )}
          </ViewTransition>
        </div>
        <div>
          <p className="eyebrow">{c.eyebrow}</p>
          <h3 className="h3 mt-3 !text-[clamp(24px,2.4vw,34px)]">{c.title}</h3>
          <p className="muted mt-3">{c.summary}</p>
          {c.result && <p className="mt-4 text-[15.5px] text-hi"><span className="mono mr-2 text-[11px] uppercase tracking-widest text-accent-2">Result</span><Rich html={c.result} /></p>}
          {c.metrics.length > 0 && <ul className="mt-5 flex flex-wrap gap-2">{c.metrics.map((m) => <li key={m.lbl} className="chip"><b className="text-hi">{m.num}</b>&nbsp;{m.lbl}</li>)}</ul>}
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tech stack">{c.stack.map((s) => <li key={s} className="chip">{s}</li>)}</ul>
          <p className={`chip mt-4 ${c.kind === "concept" ? "" : "on"}`}>{c.status}</p>
          <p className="mt-4 text-[15px] text-accent-2">Read the case study →</p>
        </div>
      </Link>
    </article>
  );
}

export default function WorkIndex({ cases, enterprise, intro: enterpriseIntro }: { cases: IndexCase[]; enterprise: EnterpriseGroup[]; intro: { eyebrow: string; heading: string; html: string } }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<EnterpriseProject | null>(null);
  const state = useRef({ active: -1 });
  const flat = useMemo(() => enterprise.flatMap((g, gi) => g.projects.map((p) => ({ ...p, group: gi, category: g.category }))), [enterprise]);
  // edges = projects sharing at least three technologies (Kafka, Kubernetes, ASP.NET Core, …)
  const links = useMemo(() => { const l: [number, number][] = []; flat.forEach((a, i) => flat.forEach((b, j) => { if (j > i && a.tech.filter((t) => b.tech.includes(t)).length >= 3) l.push([i, j]); })); return l; }, [flat]);
  const nodes = useMemo(() => flat.map((p) => ({ id: p.id, group: p.group })), [flat]);
  const show = (k: CaseStudy["kind"]) => filter === "all" || filter === k;
  const groups: { kind: CaseStudy["kind"]; title: string; note?: string }[] = [
    { kind: "live", title: "Live apps" },
    { kind: "shipped", title: "Other shipped products" },
    { kind: "concept", title: "Design concepts", note: "Product & UI/UX design concepts — not shipped products. We don't claim results or live status for work that hasn't shipped." },
  ];
  const pick = (p: EnterpriseProject | null) => { setActive(p); state.current.active = p ? flat.findIndex((x) => x.id === p.id) : -1; };
  return (
    <>
      <section className="py-10" data-loc="work-index">
        <div className="wrap">
          <div role="group" aria-label="Filter work" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => <button key={f.key} className="chip !px-5 !py-2.5 !text-[13px]" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</button>)}
          </div>
          {groups.filter((g) => show(g.kind)).map((g) => (
            <div key={g.kind} className="mt-12">
              <h2 className="h3 !text-[28px]">{g.title}</h2>
              {g.note && <p className="muted mt-2 max-w-[70ch] text-[15px]">{g.note}</p>}
              <div className="mt-6 grid gap-4 xl:grid-cols-2">{cases.filter((c) => c.kind === g.kind).map((c, i) => <CaseCard key={c.slug} c={c} i={i} />)}</div>
            </div>
          ))}
        </div>
      </section>
      {(filter === "all" || filter === "enterprise") && (
        <section className="section ent-sec" id="enterprise" data-loc="enterprise">
          <div className="wrap">
            <p className="eyebrow" data-reveal>{enterpriseIntro.eyebrow}</p>
            <h2 className="h2 mt-4 max-w-[20ch]" data-reveal>{enterpriseIntro.heading}</h2>
            <p className="lead mt-5" data-reveal><Rich html={enterpriseIntro.html} /></p>
            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="lg:sticky lg:top-[calc(var(--nav-h)+24px)] lg:self-start">
                <p className="mono mb-2 text-[11px] uppercase tracking-widest text-lo">Platform engineering · nodes are projects, lines are shared tech</p>
                <ViewSlot scene="graph" props={{ state, nodes, links }} className="glass aspect-[4/3] w-full overflow-hidden" poster={<Poster kind="grid" />} />
                {active && (
                  <div role="region" aria-live="polite" aria-label="Selected project" className="glass mt-4 p-6">
                    <div className="flex items-start justify-between gap-4"><div><p className="mono text-[11px] uppercase tracking-widest text-accent-2">{active.role}</p><h3 className="h3 mt-1">{active.title}</h3></div><button onClick={() => pick(null)} aria-label="Close project details" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line hover:bg-white/5"><X size={16} /></button></div>
                    <p className="muted mt-3 text-[15.5px]"><Rich html={active.html} /></p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">{active.tech.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
                  </div>
                )}
              </div>
              <div className="grid gap-8">
                {enterprise.map((g) => (
                  <div key={g.category}>
                    <h3 className="h3 !text-[24px]">{g.category}</h3>
                    <p className="muted mt-1 text-[15px]">{g.blurb}</p>
                    <ul className="mt-4 grid gap-3">
                      {g.projects.map((p) => (
                        <li key={p.id}>
                          <button onClick={() => pick(active?.id === p.id ? null : p)} onPointerEnter={() => { state.current.active = flat.findIndex((x) => x.id === p.id); }} onPointerLeave={() => { state.current.active = active ? flat.findIndex((x) => x.id === active.id) : -1; }} aria-expanded={active?.id === p.id}
                            className={`glass spot block w-full p-5 text-left ${active?.id === p.id ? "!border-accent" : ""}`}>
                            <span className="mono text-[11px] uppercase tracking-widest text-accent-2">{p.role}</span>
                            <span className="h3 mt-1 block">{p.title}</span>
                            {/* full description stays in the DOM for crawlers and screen readers */}
                            <span className="muted mt-2 block text-[15px]"><Rich html={p.html} /></span>
                            <span className="mt-3 flex flex-wrap gap-1.5">{p.tech.map((t) => <span key={t} className="chip">{t}</span>)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
