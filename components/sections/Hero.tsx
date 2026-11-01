"use client";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef } from "react";
import ViewSlot from "@/components/three/ViewSlot";
import { useApp } from "@/components/providers/AppProviders";
import { useProgress } from "@/lib/use-progress";
import { site } from "@/content/site";

const LINE1 = ["Build", "iOS", "&", "Android", "MVPs", "from"], LINE2 = ["8", "weeks."];
// each character's position in the headline, for the staggered CSS reveal (--ci).
// Words are inline-blocks, so the spaces sit between them (a trailing space inside one would be trimmed).
const OFFSET = [...LINE1, ...LINE2].reduce<number[]>((a, w, i, all) => [...a, i ? a[i - 1] + all[i - 1].length : 0], []);
const Word = ({ w, at, grad = false }: { w: string; at: number; grad?: boolean }) => (
  <span className="split-word" aria-hidden>
    {[...w].map((c, i) => <span key={i} className={`split-char ${grad ? "grad-text" : ""}`} style={{ "--ci": at + i } as React.CSSProperties}>{c}</span>)}
  </span>
);

/**
 * S1 — "Idea → App Store". The H1 + CTAs are plain server-rendered HTML, painted on the first frame (the
 * headline's character reveal is a CSS animation in app/globals.css, so it never waits for JavaScript);
 * the particle canvas attaches behind them later. Wherever WebGL is expected the section is a tall
 * sticky track from first paint (so nothing shifts when the canvas arrives) and scroll assembles the
 * particles into the device pair. Reduced motion / no GPU: a normal one-screen hero with a static composition.
 */
export default function Hero() {
  const track = useRef<HTMLElement>(null), copy = useRef<HTMLDivElement>(null), cap = useRef<HTMLDivElement>(null);
  const state = useRef({ progress: 0 });
  const { expectGl } = useApp();

  // The scroll choreography (copy fades out, caption fades in) is DOM-only, so it works before the canvas mounts.
  const onProgress = useCallback((p: number) => {
    state.current.progress = expectGl ? p : 0;
    if (!expectGl) return;
    if (copy.current) { const k = Math.min(1, p / 0.35); copy.current.style.opacity = String(1 - k); copy.current.style.transform = `translate3d(0,${-k * 60}px,0)`; copy.current.style.pointerEvents = k > 0.6 ? "none" : ""; }
    if (cap.current) { const k = Math.min(1, Math.max(0, (p - 0.78) / 0.15)); cap.current.style.opacity = String(k); cap.current.style.transform = `translate3d(0,${(1 - k) * 24}px,0)`; }
  }, [expectGl]);
  useProgress(track, onProgress);
  useEffect(() => { if (!expectGl && copy.current) { copy.current.style.opacity = ""; copy.current.style.transform = ""; copy.current.style.pointerEvents = ""; } }, [expectGl]);

  return (
    <section ref={track} className="relative" style={{ height: expectGl ? "240svh" : undefined }} data-loc="hero">
      <div className={`${expectGl ? "sticky top-0 h-[100svh]" : "relative min-h-[100svh]"} flex overflow-hidden`}>
        <ViewSlot scene="hero" props={{ state }} className="!absolute inset-0" />
        {/* static composition for no-WebGL / reduced motion */}
        {!expectGl && (
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-[3%] hidden w-[38%] items-center justify-center gap-5 lg:flex">
            <div className="absolute inset-[12%] rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(closest-side,rgba(201,162,75,.55),transparent),radial-gradient(closest-side at 70% 60%,rgba(242,218,140,.35),transparent)" }} />
            {[0, 1].map((i) => (
              <div key={i} className="relative aspect-[1.5/3.1] h-[48%] rounded-[28px] border border-line-strong bg-bg-2 p-2" style={{ transform: `perspective(900px) rotateY(${i ? -18 : 18}deg) rotateZ(${i ? -3 : 3}deg)` }}>
                <div className="h-full w-full rounded-[24px]" style={{ background: i ? "linear-gradient(160deg,#151824,#F2DA8C55 60%,#0d0f16)" : "linear-gradient(160deg,#1f190d,#C9A24B66 60%,#0d0f16)" }} />
              </div>
            ))}
          </div>
        )}
        <div ref={copy} className="wrap relative z-10 flex flex-col justify-center pb-16 pt-[calc(var(--nav-h)+48px)] will-change-transform">
          <p className="eyebrow">{site.positioning}</p>
          <h1 className="display mt-6 max-w-[14ch]" aria-label="Build iOS & Android MVPs from 8 weeks." style={{ perspective: 900 }}>
            {LINE1.map((w, i) => <Fragment key={w}>{i > 0 && " "}<Word w={w} at={OFFSET[i]} /></Fragment>)}
            <br aria-hidden />
            {LINE2.map((w, i) => <Fragment key={w}>{i > 0 && " "}<Word w={w} at={OFFSET[LINE1.length + i]} grad /></Fragment>)}
          </h1>
          <p className="lead mt-7 max-w-[56ch]">
            We design and build <strong className="font-semibold text-hi">cross-platform iOS &amp; Android apps</strong> in React Native &amp; MERN — with AI built in. Real products, live on both stores, shipped by senior engineers.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            {/* the owner asked for exactly two actions on the home hero: the portfolio, and Het's LinkedIn profile */}
            <Link href="/work/" className="btn btn-primary btn-lg" data-magnetic="0.25" data-cursor="View" data-cta>View our portfolio →</Link>
            <a href={site.founder.linkedin} target="_blank" rel="noopener" className="btn btn-glass btn-lg" data-magnetic="0.2" data-cta>Connect with me</a>
          </div>
          <p className="dim mt-7 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-success shadow-[0_0_10px_var(--success)]" aria-hidden />
            Live on the App Store &amp; Google Play · 4+ products shipped · No upfront fee to talk
          </p>
        </div>
        {expectGl && (
          <div ref={cap} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[7svh] z-10 text-center opacity-0">
            <p className="mono text-[12px] uppercase tracking-[.3em] text-accent-2">One codebase</p>
            <p className="font-display mt-2 text-[clamp(22px,3vw,40px)] font-semibold tracking-tight">Idea → App Store &amp; Google Play</p>
          </div>
        )}
        {expectGl && <div aria-hidden className="mono absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[11px] uppercase tracking-[.3em] text-lo">Scroll</div>}
      </div>
    </section>
  );
}
