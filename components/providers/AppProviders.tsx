"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { shared } from "@/lib/gl-store";
import { detectTier } from "@/lib/gpu-tier";
import type { Tier } from "@/lib/motion";
import { track } from "@/lib/analytics";
import { site } from "@/content/site";
import { captureAttribution } from "@/lib/attribution";
import { prefs, serverPrefs } from "@/lib/prefs";

const GLRoot = dynamic(() => import("@/components/three/GLRoot"), { ssr: false });
const CalendlyModal = dynamic(() => import("@/components/ui/CalendlyModal"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/ui/CommandPalette"), { ssr: false });
const EasterEgg = dynamic(() => import("@/components/ui/EasterEgg"), { ssr: false });

type Ctx = {
  reduced: boolean;
  setReduced: (v: boolean) => void;
  tier: Tier;
  /** the shared canvas is mounted and scenes can attach */
  gl: boolean;
  /**
   * WebGL is expected on this device (motion allowed, GPU not ruled out). Layout that depends on 3D —
   * the tall hero track, the pinned pipeline, the carousel — keys off this, so nothing shifts when the canvas mounts later.
   */
  expectGl: boolean;
  openCalendly: (location?: string) => void;
  openPalette: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
};
const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside AppProviders");
  return c;
};

const idle = (fn: () => void) =>
  "requestIdleCallback" in window ? window.requestIdleCallback(fn, { timeout: 1800 }) : setTimeout(fn, 600);

export default function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // ── preferences held by the browser (OS motion setting or the footer toggle; theme)
  const reduced = useSyncExternalStore(prefs.subscribe, prefs.reduced, serverPrefs.reduced);
  const theme = useSyncExternalStore(prefs.subscribe, prefs.theme, serverPrefs.theme);
  const [detected, setDetected] = useState<Tier>("none");
  const [calendly, setCalendly] = useState(false);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const [palette, setPalette] = useState(false);
  const [paletteLoaded, setPaletteLoaded] = useState(false);
  const lenisRef = useRef<{ destroy: () => void; stop: () => void; start: () => void; scrollTo: (t: number | string | HTMLElement, o?: object) => void } | null>(null);

  const [probed, setProbed] = useState(false);
  const [mountGl, setMountGl] = useState(false);

  // Reduced motion always means no WebGL: posters and static compositions are shown instead.
  const tier: Tier = reduced ? "none" : detected;
  const expectGl = !reduced && (!probed || detected !== "none");
  const gl = tier !== "none" && mountGl;
  useEffect(() => { document.documentElement.dataset.motion = reduced ? "reduce" : "full"; }, [reduced]);
  useEffect(() => { shared.light = theme === "light"; }, [theme]);
  useEffect(() => { shared.tier = tier; }, [tier]);

  // ── GPU tier is probed once, after first paint and when idle (in a worker; see lib/gpu-tier.ts)
  useEffect(() => {
    let dead = false;
    const id = idle(() => {
      detectTier().then((t) => {
        if (dead) return;
        // CSS reads this to drop backdrop blur and always-on animations on devices without a capable GPU
        document.documentElement.dataset.gpu = t;
        setDetected(t);
        setProbed(true);
      });
    });
    return () => { dead = true; if (typeof id === "number") (window.cancelIdleCallback ?? clearTimeout)(id); };
  }, []);

  // ── When the canvas (three.js, shaders, textures) is allowed to load:
  //    mouse/trackpad devices → once the page has loaded and the browser is idle;
  //    touch devices → on the first touch, scroll or key press, or 6 s after load, whichever comes first,
  //    so the download and shader compile never compete with first render on a phone.
  useEffect(() => {
    if (mountGl) return;
    const go = () => setMountGl(true);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];
    const afterLoad = (fn: () => void) => {
      if (document.readyState === "complete") fn();
      else { window.addEventListener("load", fn, { once: true }); cleanups.push(() => window.removeEventListener("load", fn)); }
    };
    if (fine) {
      afterLoad(() => { const id = idle(go); cleanups.push(() => { if (typeof id === "number") (window.cancelIdleCallback ?? clearTimeout)(id); }); });
    } else {
      const events = ["pointerdown", "touchstart", "scroll", "keydown", "wheel"] as const;
      events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
      cleanups.push(() => events.forEach((e) => window.removeEventListener(e, go)));
      afterLoad(() => { const t = setTimeout(go, 6000); cleanups.push(() => clearTimeout(t)); });
    }
    return () => cleanups.forEach((c) => c());
  }, [mountGl]);

  // ── Lenis smooth scroll synced to the GSAP ticker (disabled for reduced motion / touch)
  useEffect(() => {
    if (reduced) return;
    let dead = false;
    let cleanup = () => {};
    (async () => {
      const [{ default: Lenis }, { gsap }] = await Promise.all([import("lenis"), import("gsap")]);
      if (dead) return;
      const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true, anchors: true });
      lenisRef.current = lenis as never;
      lenis.on("scroll", (l: { scroll: number; velocity: number }) => {
        shared.scrollY = l.scroll;
        shared.scrollVel += (Math.max(-1, Math.min(1, l.velocity / 60)) - shared.scrollVel) * 0.2;
      });
      const tick = (t: number) => { lenis.raf(t * 1000); shared.scrollVel *= 0.94; };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanup = () => { gsap.ticker.remove(tick); lenis.destroy(); lenisRef.current = null; };
    })();
    return () => { dead = true; cleanup(); };
  }, [reduced]);

  // ── pointer → shared uniforms + CSS vars for the fluid gradient; spotlight + magnetic (delegated)
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0, lx = 0, ly = 0, mag: HTMLElement | null = null, lastTilt: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1, ny = -((e.clientY / window.innerHeight) * 2 - 1);
      shared.pvel = Math.min(1, Math.hypot(e.clientX - lx, e.clientY - ly) / 60);
      lx = e.clientX; ly = e.clientY; shared.mx = nx; shared.my = ny;
      const t = e.target as HTMLElement | null;
      const spot = t?.closest?.<HTMLElement>(".spot");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--sx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--sy", `${e.clientY - r.top}px`);
        spot.style.setProperty("--sa", `${(Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180) / Math.PI}`);
      }
      // [data-tilt] and .spot cards: normalised pointer position (-0.5..0.5) as --px / --py, for CSS 3D tilts
      const tilt = t?.closest?.<HTMLElement>("[data-tilt], .spot") ?? null;
      if (lastTilt && lastTilt !== tilt) { lastTilt.style.removeProperty("--px"); lastTilt.style.removeProperty("--py"); }
      lastTilt = tilt;
      if (tilt && !reduced) {
        const r = tilt.getBoundingClientRect();
        tilt.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        tilt.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      }
      if (!reduced && e.pointerType === "mouse") {
        const m = t?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
        if (mag && mag !== m) { mag.style.transform = ""; }
        mag = m;
        if (m) {
          const r = m.getBoundingClientRect(), k = Number(m.dataset.magnetic) || 0.25;
          m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * k}px, ${(e.clientY - r.top - r.height / 2) * k}px)`;
        }
      }
      // the fluid background follows the pointer only where compositing is cheap
      if (!raf && root.dataset.gpu !== "low" && root.dataset.gpu !== "none") raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty("--mx", nx.toFixed(3));
      });
    };
    const onScroll = () => {
      if (!lenisRef.current) shared.scrollY = window.scrollY;
      if (root.dataset.gpu === "low" || root.dataset.gpu === "none") return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty("--sy", max > 0 ? (window.scrollY / max).toFixed(2) : "0");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [reduced]);

  // ── scroll reveals: [data-reveal] → .in (re-scanned on route change)
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      // Blocks taller than the screen (forms, tools) are marked so the CSS only fades them in: tilting them through
      // the viewport would magnify their near edge past the screen and fade them while they are still in use.
      if (e.rootBounds && e.boundingClientRect.height > e.rootBounds.height) (e.target as HTMLElement).dataset.tall = "1";
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    const scan = () => document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);

  // ── on route change: scroll to top through Lenis, refresh ScrollTrigger
  useEffect(() => {
    captureAttribution();
    if (!window.location.hash) lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  // ── Calendly: every calendly link opens the modal (plain link remains the no-JS fallback)
  const openCalendly = useCallback((location = "unknown") => {
    setCalendlyLoaded(true); setCalendly(true);
    track("calendly_open", { location });
    track("book_call_click", { location });
  }, []);
  const openPalette = useCallback(() => { setPaletteLoaded(true); setPalette(true); }, []);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const label = (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
      const location = a.closest<HTMLElement>("[data-loc]")?.dataset.loc || a.closest("header,footer,nav")?.tagName.toLowerCase() || "page";
      if (a.classList.contains("btn") || a.dataset.cta) track("cta_click", { location, label });
      if (href.startsWith(site.calendly) && !a.dataset.noModal && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
        e.preventDefault();
        openCalendly(location);
      }
    };
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); } };
    const onMsg = (e: MessageEvent) => {
      if (e.origin === "https://calendly.com" && e.data?.event === "calendly.event_scheduled") track("calendly_booked", {});
    };
    document.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    window.addEventListener("message", onMsg);
    return () => { document.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey); window.removeEventListener("message", onMsg); };
  }, [openCalendly, openPalette]);

  // ── scroll depth: one event per page at 50% and 90%, so a visitor who reads is not counted as a bounce
  useEffect(() => {
    const sent = new Set<number>();
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      for (const mark of [50, 90]) if (pct >= mark && !sent.has(mark)) { sent.add(mark); track("scroll_depth", { percent: mark, page: pathname }); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => { const l = lenisRef.current; if (!l) return; if (calendly || palette) l.stop(); else l.start(); }, [calendly, palette]);

  const value = useMemo(() => ({ reduced, setReduced: prefs.setReduced, tier, gl, expectGl, openCalendly, openPalette, theme, toggleTheme: prefs.toggleTheme }), [reduced, tier, gl, expectGl, openCalendly, openPalette, theme]);

  return (
    <AppCtx.Provider value={value}>
      {gl && <GLRoot tier={tier} onTier={(t) => { document.documentElement.dataset.gpu = t; setDetected(t); }} />}
      {children}
      {calendlyLoaded && <CalendlyModal open={calendly} onClose={() => setCalendly(false)} />}
      {paletteLoaded && <CommandPalette open={palette} onClose={() => setPalette(false)} />}
      {!reduced && <EasterEgg />}
    </AppCtx.Provider>
  );
}
