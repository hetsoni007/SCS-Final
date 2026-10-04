"use client";
/**
 * Client chrome that is not needed for first paint: custom cursor, consent banner, exit intent, analytics.
 * Loaded by Chrome.tsx after hydration, so none of it is in the initial bundle.
 */
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { useApp } from "@/components/providers/AppProviders";
import { prefs, serverPrefs } from "@/lib/prefs";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function Cursor() {
  const dot = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null);
  const { reduced } = useApp();
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0, seen = false;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      if (!seen) { seen = true; rx = x; ry = y; if (dot.current) dot.current.style.opacity = "1"; if (ring.current) ring.current.style.opacity = "1"; }
      const t = e.target as HTMLElement, r = ring.current;
      if (!r) return;
      const lab = t.closest?.<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
      r.textContent = lab;
      r.classList.toggle("has-label", !!lab);
      r.classList.toggle("is-link", !lab && !!t.closest?.("a,button,[role=button],summary,label,input,select,textarea"));
    };
    const loop = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, [reduced]);
  if (reduced) return null;
  // The native cursor stays visible: the ring is an enhancement and never replaces focus/pointer affordances.
  // Hidden until the mouse first moves, so it never sits in the middle of the page on load or on touch devices.
  return (<><div ref={ring} className="cursor-ring" style={{ opacity: 0 }} aria-hidden /><div ref={dot} className="cursor-dot" style={{ opacity: 0 }} aria-hidden /></>);
}

function ConsentBanner({ consent }: { consent: string }) {
  if (consent !== "unset") return null; // "pending" on the server / before hydration, then the stored choice
  return (
    // Bottom-right on desktop and compact on phones, so it never sits on the hero's buttons (which are left-aligned).
    <div role="dialog" aria-label="Cookie consent" className="glass fixed bottom-20 left-3 right-3 z-[90] mx-auto max-w-[560px] p-3.5 md:bottom-5 md:left-auto md:right-5 md:mx-0 md:max-w-[380px] md:p-5" style={{ background: "color-mix(in srgb, var(--bg-2) 94%, transparent)" }}>
      <p className="text-[13px] leading-snug text-mid md:text-[14px] md:leading-relaxed">
        We use analytics cookies to understand which pages are useful. They load only if you accept.
        {/* only true where the cookieless Vercel Analytics script is served (see next.config.ts) */}
        {process.env.VERCEL_ANALYTICS ? " Essential, cookieless measurement always runs." : ""} See our{" "}
        <Link href="/privacy/" className="underline text-hi">Privacy Policy</Link>.
      </p>
      <div className="mt-3 flex gap-2 md:mt-4">
        <button className="btn btn-primary !min-h-[40px] !px-5 !text-[14px]" onClick={() => prefs.setConsent("granted")}>Accept analytics</button>
        <button className="btn btn-glass !min-h-[40px] !px-5 !text-[14px]" onClick={() => prefs.setConsent("denied")}>Decline</button>
      </div>
    </div>
  );
}

/** Desktop only, once per session, dismissible. Offers the scoping guide. */
function ExitIntent() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (/app-scoping-guide|contact|privacy/.test(pathname)) return;
    const armed = Date.now();
    const out = (e: MouseEvent) => {
      if (e.clientY > 0 || e.relatedTarget || Date.now() - armed < 25000 || window.scrollY < window.innerHeight) return;
      try { if (sessionStorage.getItem("scs-exit")) return; sessionStorage.setItem("scs-exit", "1"); } catch { return; }
      setOpen(true);
    };
    document.addEventListener("mouseout", out);
    return () => document.removeEventListener("mouseout", out);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-labelledby="exit-h" className="glass max-w-[480px] p-8" onClick={(e) => e.stopPropagation()} data-loc="exit-intent">
        <span className="eyebrow">Free PDF · 8 pages</span>
        <h2 id="exit-h" className="h3 mt-3 !text-[28px]">Before you go — scope your app like a founder.</h2>
        <p className="muted mt-3 text-[15px]">The 5 discovery questions, timeline estimates, cost ranges and our 48-hour proposal method.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/app-scoping-guide/" className="btn btn-primary" onClick={() => setOpen(false)} autoFocus>Get the Guide (Free)</Link>
          <button className="btn btn-glass" onClick={() => setOpen(false)}>No thanks</button>
        </div>
      </div>
    </div>
  );
}

export default function ChromeExtras() {
  const consent = useSyncExternalStore(prefs.subscribe, prefs.consent, serverPrefs.consent);
  return (
    <>
      <Cursor />
      <ConsentBanner consent={consent} />
      <ExitIntent />
      {process.env.VERCEL_ANALYTICS ? <Analytics /> : null}
      {GA_ID && consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}</Script>
        </>
      )}
    </>
  );
}
