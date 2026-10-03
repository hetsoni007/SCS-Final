"use client";
/** Home sections that hold client state: the 3D work carousel and the portal CTA. */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ViewSlot from "@/components/three/ViewSlot";
import { PhoneFrame, Poster } from "@/components/ui/Poster";
import { SectionHead } from "./SectionHead";
import { useApp } from "@/components/providers/AppProviders";
import { site } from "@/content/site";

/** The fields of a case study the carousel shows; the page passes them in so the full portfolio copy stays on the server. */
export type ShowcaseCase = { slug: string; short: string; tagline: string; status: string; metrics: { num: string; lbl: string }[]; shots: { src: string; alt: string }[] };

/* S6 — selected work: 3D carousel (drag / arrows / keyboard); cards are real links */
export function WorkShowcase({ cases: liveCases }: { cases: ShowcaseCase[] }) {
  const { expectGl } = useApp();
  const n = liveCases.length, step = 0.62; // must match SPREAD in scenes/WorkCarousel
  const state = useRef({ angle: 0, hover: -1 });
  const [idx, setIdx] = useState(0);
  const drag = useRef<{ x: number; a: number } | null>(null);
  const items = useMemo(() => liveCases.map((c) => ({ screens: c.shots.map((s) => s.src) })), [liveCases]);
  const go = (i: number) => { setIdx(i); state.current.angle = -i * step; state.current.hover = ((i % n) + n) % n; };
  const cur = ((idx % n) + n) % n, c = liveCases[cur];
  return (
    <section className="section" data-loc="work" aria-labelledby="work-h">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow="Selected work" title="Apps we've shipped." />
          <Link href="/work/" className="btn btn-glass" data-cta>Explore the full portfolio →</Link>
        </div>
        {expectGl ? (
          <>
            <div className="relative mt-8">
              {/* the poster holds the same space until the canvas mounts, so the section never changes height */}
              <ViewSlot scene="carousel" props={{ state, items }} className="h-[min(62vh,600px)] w-full" poster={<Poster kind="phones" screens={[liveCases[0].shots[0].src, liveCases[1].shots[0].src]} />} />
              <div
                className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing" data-cursor="Drag" role="group" aria-roledescription="carousel" aria-label="Selected work"
                onPointerDown={(e) => { drag.current = { x: e.clientX, a: state.current.angle }; e.currentTarget.setPointerCapture(e.pointerId); }}
                onPointerMove={(e) => { if (drag.current) state.current.angle = drag.current.a + (e.clientX - drag.current.x) * 0.006; }}
                onPointerUp={() => { if (!drag.current) return; drag.current = null; go(Math.round(-state.current.angle / step)); }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <button onClick={() => go(idx - 1)} aria-label="Previous project" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line-strong bg-bg-1/70 hover:bg-white/10"><ChevronLeft size={20} /></button>
              <Link href={`/work/${c.slug}/`} className="glass min-w-0 max-w-[520px] flex-1 p-5 text-center" data-cursor="View" aria-live="polite">
                <span className="mono text-[11px] uppercase tracking-widest text-accent-2">{c.status}</span>
                <span className="h3 mt-1 block">{c.short}</span>
                <span className="muted mt-1 block text-[14.5px]">{c.tagline}</span>
                <span className="mt-3 flex flex-wrap justify-center gap-2">{c.metrics.map((m) => <span key={m.lbl} className="chip"><b className="text-hi">{m.num}</b>&nbsp;{m.lbl}</span>)}</span>
              </Link>
              <button onClick={() => go(idx + 1)} aria-label="Next project" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line-strong bg-bg-1/70 hover:bg-white/10"><ChevronRight size={20} /></button>
            </div>
          </>
        ) : null}
        {/* All four projects as links: the only UI without WebGL, and the crawlable/accessible list with it */}
        <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${expectGl ? "mt-6" : "mt-12"}`}>
          {liveCases.map((w, i) => (
            <li key={w.slug} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <Link href={`/work/${w.slug}/`} className={`glass spot block h-full p-5 ${expectGl && cur === i ? "!border-accent" : ""}`} data-cursor="View" onPointerEnter={() => expectGl && go(idx + (((i - cur + n + n / 2) % n) - n / 2))}>
                {!expectGl && <PhoneFrame src={w.shots[0]?.src} alt={w.shots[0]?.alt} className="mx-auto mb-5 w-[62%]" />}
                <h3 className="h3">{w.short}</h3>
                <p className="dim mt-1">{w.tagline}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* S12 — final CTA: magnetic button over a shader portal; click zooms into the portal, then opens Calendly */
export function FinalCTA() {
  const state = useRef({ zoom: 0 });
  const { openCalendly, gl } = useApp();
  const [zooming, setZooming] = useState(false);
  useEffect(() => { if (!zooming) return; const t = setTimeout(() => { openCalendly("final-cta"); setZooming(false); state.current.zoom = 0; }, gl ? 750 : 0); return () => clearTimeout(t); }, [zooming, gl, openCalendly]);
  return (
    <section className="relative overflow-hidden" data-loc="final-cta" aria-labelledby="cta-h">
      <ViewSlot scene="portal" props={{ state }} className="!absolute inset-0" poster={<Poster kind="portal" />} />
      <div className="wrap relative z-10 flex min-h-[92vh] flex-col items-center justify-center py-28 text-center">
        <h2 id="cta-h" className="h1 max-w-[14ch]" data-reveal>Have an app idea?<br />Let&apos;s pressure-test it — free.</h2>
        <p className="lead mt-6" data-reveal>30 minutes with a senior engineer. We&apos;ll tell you what it takes to build, what it costs, and whether we&apos;re the right team. No pitch, no obligation.</p>
        <div className="mt-10 flex flex-col items-center gap-4 transition-[opacity,transform] duration-500" style={{ opacity: zooming ? 0 : 1, transform: zooming ? "scale(0.9)" : "none" }}>
          <a href={site.calendly} data-no-modal className="btn btn-primary btn-xl" data-magnetic="0.35" data-cursor="Book" data-cta
            onClick={(e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); state.current.zoom = 1; setZooming(true); }}>Book Your Free Call →</a>
          <span className="mono text-[12px] uppercase tracking-[.25em] text-mid">30 minutes with a senior engineer</span>
          <Link href="/contact/" className="btn btn-glass mt-2" data-cta>Send a brief</Link>
        </div>
        <p className="dim mt-10">You own all code &amp; IP · NDA on request · Free intro call, no upfront fee · Fixed scope &amp; price up front</p>
        <p className="dim mt-2">Or email <a href={`mailto:${site.email}`} className="underline underline-offset-4 hover:text-hi">{site.email}</a></p>
      </div>
    </section>
  );
}
