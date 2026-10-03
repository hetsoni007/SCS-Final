"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";
import { Marquee } from "@/components/ui/Bits";
import { useApp } from "@/components/providers/AppProviders";
import { useProgress } from "@/lib/use-progress";
import { megaServices } from "@/content/site";
import { homeServices, marquee, process } from "@/content/home";

/* S2 — trust marquee (dual direction, speeds up with scroll velocity) */
export function TrustMarquee() {
  return (
    <section aria-label="Technologies and platforms" className="relative border-y border-line py-7">
      <div className="grid gap-3">
        <Marquee dir={1} speed={36}>{marquee.tech.map((t) => <span key={t} className="chip !px-5 !py-2.5 !text-[13px]">{t}</span>)}</Marquee>
        <Marquee dir={-1} speed={28}>{[...marquee.proof, ...marquee.tech.slice().reverse()].map((t) => <span key={t} className={`chip !px-5 !py-2.5 !text-[13px] ${marquee.proof.includes(t) ? "on" : ""}`}>{t}</span>)}</Marquee>
      </div>
    </section>
  );
}

/* S4 — services: pinned horizontal scroll on desktop, stacked on mobile / reduced motion */
export function ServicesPinned() {
  const track = useRef<HTMLDivElement>(null), row = useRef<HTMLDivElement>(null);
  const { reduced } = useApp();
  const [pin, setPin] = useState(false);
  const hover = useRef({ hover: 0 });
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)"), f = () => setPin(mq.matches && !reduced);
    f(); mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [reduced]);
  const on = useCallback((p: number) => {
    if (!pin || !row.current) return;
    const max = row.current.scrollWidth - window.innerWidth;
    row.current.style.transform = `translate3d(${-p * Math.max(0, max)}px,0,0)`;
  }, [pin]);
  useProgress(track, on);
  useEffect(() => { if (!pin && row.current) row.current.style.transform = ""; }, [pin]);
  return (
    <section data-loc="services" aria-labelledby="svc-h">
      <div ref={track} style={{ height: pin ? "320vh" : undefined }}>
        <div className={pin ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "section"}>
          <div className="wrap">
            <p className="eyebrow">What we do</p>
            <h2 id="svc-h" className="h2 mt-4">One team, from idea<br />to App Store.</h2>
            <p className="lead mt-4">Mobile-first, AI-ready, senior-only. We own design, build and launch so you ship faster with fewer moving parts.</p>
          </div>
          <div ref={row} className={pin ? "mt-10 flex w-max gap-6 px-[max(16px,calc((100vw-1440px)/2+56px))] will-change-transform" : "wrap mt-10 grid gap-5"}>
            {homeServices.map((s, i) => (
              <article key={s.key} className={`glass spot grid overflow-hidden ${pin ? "h-[56vh] w-[min(78vw,1040px)] grid-cols-2" : "sm:grid-cols-2"}`}
                onPointerEnter={() => { if (s.key === "ai") hover.current.hover = 1; }} onPointerLeave={() => { if (s.key === "ai") hover.current.hover = 0; }}>
                <div className="flex flex-col justify-between p-7 md:p-10">
                  <div>
                    <span className="step-n">0{i + 1}</span>
                    <h3 className="h3 mt-3 !text-[clamp(26px,2.6vw,40px)]">{s.title}</h3>
                    <p className="muted mt-4 max-w-[44ch]">{s.body}</p>
                    {s.key === "ai" && <p className="mono mt-5 inline-flex items-center gap-2 rounded-xl border border-line bg-bg-2 px-4 py-2 text-[13px] text-accent-2"><span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent-2" aria-hidden />Predicting fare… £12.40</p>}
                  </div>
                  <div>
                    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">{s.chips.map((c) => <li key={c} className="chip">{c}</li>)}</ul>
                    <Link href={s.href} className="mt-6 inline-block text-[15px] text-accent-2 underline-offset-4 hover:underline" data-cursor="View">{s.linkLabel ?? `Explore ${s.title} →`}</Link>
                  </div>
                </div>
                <ViewSlot scene={s.scene} props={s.key === "ai" ? { state: hover } : undefined} className="min-h-[260px]" poster={<Poster />} />
              </article>
            ))}
            <div className={`glass flex flex-col justify-center p-8 md:p-10 ${pin ? "h-[56vh] w-[min(60vw,560px)]" : ""}`}>
              <p className="eyebrow">All 7 services</p>
              <ul className="mt-5 grid gap-2.5">
                {megaServices.map((m) => <li key={m.href}><Link href={m.href} className="text-[17px] text-mid hover:text-hi"><span className="step-n mr-3">{m.n}</span>{m.label}</Link></li>)}
              </ul>
              <Link href="/services/" className="btn btn-glass mt-7 self-start" data-cta>See all services →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* S5 — process: camera flies along the pipeline with scroll; steps are real DOM (list) either way */
export function ProcessPipeline({ compact = false }: { compact?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const state = useRef({ progress: 0 });
  const { expectGl } = useApp();
  const [active, setActive] = useState(0);
  const pinned = expectGl && !compact;
  const on = useCallback((p: number) => { state.current.progress = p; setActive(Math.min(4, Math.floor(p * 5))); }, []);
  useProgress(track, on, pinned ? "track" : "through");
  return (
    <section data-loc="process" aria-labelledby="proc-h">
      <div ref={track} style={{ height: pinned ? "420vh" : undefined }}>
        <div className={pinned ? "sticky top-0 h-screen overflow-hidden" : "section relative"}>
          {(pinned || compact) && <ViewSlot scene="pipeline" props={{ state, compact }} className={pinned ? "!absolute inset-0" : "!absolute inset-x-0 top-0 h-[340px] opacity-70"} />}
          <div className={`wrap relative z-10 flex h-full flex-col ${pinned ? "justify-between py-[12vh]" : ""}`}>
            <div className={compact ? "pt-[220px]" : ""}>
              <p className="eyebrow">How we work</p>
              <h2 id="proc-h" className="h2 mt-4">Five steps. No surprises.</h2>
            </div>
            <ol className={pinned ? "relative mt-auto min-h-[190px] max-w-[560px]" : "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"}>
              {process.map((s, i) => (
                <li key={s.n} className={pinned ? `glass absolute inset-x-0 bottom-0 p-7 transition-all duration-500 ${active === i ? "opacity-100" : "pointer-events-none translate-y-6 opacity-0"}` : "glass spot p-6"} aria-current={pinned && active === i ? "step" : undefined} {...(!pinned ? { "data-reveal": true, style: { "--i": i } as React.CSSProperties } : {})}>
                  <span className="step-n">{s.n}</span>
                  <h3 className={`h3 mt-2 ${pinned ? "!text-[36px]" : ""}`}>{s.title}</h3>
                  <p className="muted mt-2">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
          {pinned && (
            <ol aria-hidden className="absolute right-[clamp(16px,4vw,56px)] top-1/2 z-10 grid -translate-y-1/2 gap-4 max-md:hidden">
              {process.map((s, i) => <li key={s.n} className={`mono flex items-center gap-3 text-[12px] transition-colors ${active === i ? "text-accent-2" : "text-lo"}`}><span className={`h-px transition-all ${active === i ? "w-10 bg-accent-2" : "w-5 bg-current"}`} />{s.n}</li>)}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
