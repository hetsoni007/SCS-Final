"use client";
/**
 * First-visit intro (≤ 2.2 s from first paint, skippable): particles converge into the SCS monogram, then scatter
 * outward and hand over to the page. 2D canvas — no WebGL, so it never competes with the work that paints the page.
 *
 * The cover itself is server-rendered (app/layout.tsx) and switched on by the boot script, so the intro is the
 * first thing painted. This component only animates it, and only when it gets there in time: if JavaScript arrives
 * later than `preloader.takeoverMs`, the cover is already fading out on its own (CSS) and the animation is skipped.
 */
import { useEffect, useRef, useState } from "react";
import { preloader } from "@/lib/motion";
import { useApp } from "@/components/providers/AppProviders";

export default function Preloader() {
  const { reduced } = useApp();
  // Client-only (next/dynamic, ssr: false), so reading the document here cannot cause a hydration mismatch.
  const [timing] = useState(() => {
    try {
      if (document.documentElement.dataset.intro !== "1") return null;
      const elapsed = performance.now() - (performance.getEntriesByName("first-paint")[0]?.startTime ?? 0);
      return elapsed < preloader.takeoverMs ? { total: Math.max(900, preloader.maxMs - elapsed) } : null;
    } catch { return null; }
  });
  const [show, setShow] = useState(timing !== null);
  const [out, setOut] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null), pct = useRef<HTMLDivElement>(null), finishNow = useRef(() => {});

  // Too late to take over: let the cover's own fade finish, then clear the flag.
  useEffect(() => {
    const d = document.documentElement;
    if (timing || d.dataset.intro !== "1") return;
    const t = setTimeout(() => { delete d.dataset.intro; }, preloader.fallbackMs + 500);
    return () => clearTimeout(t);
  }, [timing]);

  useEffect(() => {
    if (!show || !timing) return;
    const d = document.documentElement, c = canvas.current!, ctx = c.getContext("2d")!;
    let done = false, raf = 0, timer = 0;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      d.dataset.intro = "out"; // the cover fades and the hero entrance starts (app/globals.css)
      setOut(true);
      timer = window.setTimeout(() => { delete d.dataset.intro; setShow(false); }, 450);
    };
    finishNow.current = finish;
    d.dataset.intro = "live";

    const dpr = Math.min(2, devicePixelRatio), W = (c.width = innerWidth * dpr), H = (c.height = innerHeight * dpr);
    // sample monogram pixels
    const off = document.createElement("canvas"); off.width = 600; off.height = 220;
    const o = off.getContext("2d")!; o.fillStyle = "#fff"; o.font = "700 200px system-ui, sans-serif"; o.textAlign = "center"; o.textBaseline = "middle"; o.fillText("SCS", 300, 118);
    const img = o.getImageData(0, 0, 600, 220).data, targets: [number, number][] = [];
    for (let y = 0; y < 220; y += 5) for (let x = 0; x < 600; x += 5) if (img[(y * 600 + x) * 4 + 3] > 128) targets.push([x - 300, y - 110]);
    const sc = Math.min(W / 760, H / 420);
    const P = targets.map(([tx, ty], i) => { const a = Math.random() * 6.283, r = Math.max(W, H) * (0.4 + Math.random() * 0.5); return { x: W / 2 + Math.cos(a) * r, y: H / 2 + Math.sin(a) * r, tx: W / 2 + tx * sc, ty: H / 2 + ty * sc, a, d: Math.random() * 0.25, c: i % 3 ? "#C9A24B" : "#F2DA8C" }; });
    const start = performance.now();
    let shown = -1;
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / timing.total);
      // the counter is written straight to the DOM: a React render per frame would compete with page start-up
      const n = Math.round(Math.min(1, t / 0.7) * 100);
      if (n !== shown && pct.current) { shown = n; pct.current.textContent = `${String(n).padStart(3, "0")}%`; }
      ctx.clearRect(0, 0, W, H);
      const conv = Math.min(1, t / 0.6), burst = Math.max(0, (t - 0.72) / 0.28);
      for (const p of P) {
        const k = Math.min(1, Math.max(0, (conv - p.d) / (1 - p.d))), e = 1 - Math.pow(1 - k, 4);
        let x = p.x + (p.tx - p.x) * e, y = p.y + (p.ty - p.y) * e;
        if (burst > 0) { const b = burst * burst * Math.max(W, H) * 0.7; x += Math.cos(p.a) * b; y += Math.sin(p.a) * b; }
        ctx.globalAlpha = (0.35 + 0.65 * e) * (1 - burst);
        ctx.fillStyle = p.c; ctx.fillRect(x, y, 2.2 * dpr, 2.2 * dpr);
      }
      if (t < 1) raf = requestAnimationFrame(frame); else finish();
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener("keydown", finish, { once: true });
    window.addEventListener("pointerdown", finish, { once: true });
    window.addEventListener("wheel", finish, { once: true, passive: true });
    return () => {
      cancelAnimationFrame(raf); clearTimeout(timer);
      window.removeEventListener("keydown", finish); window.removeEventListener("pointerdown", finish); window.removeEventListener("wheel", finish);
      // unmounted mid-intro: never leave the cover up
      if (d.dataset.intro === "live" || d.dataset.intro === "out") delete d.dataset.intro;
    };
  }, [show, timing]);
  // "Reduce motion" switched on while the intro plays: end it now
  useEffect(() => { if (reduced) finishNow.current(); }, [reduced]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[180] transition-opacity duration-500" style={{ opacity: out ? 0 : 1, pointerEvents: out ? "none" : "auto" }} aria-hidden>
      <canvas ref={canvas} className="h-full w-full" />
      <div ref={pct} className="mono absolute bottom-8 left-8 text-[13px] tracking-widest text-mid">000%</div>
      <span className="mono absolute bottom-8 right-8 text-[12px] uppercase tracking-widest text-lo">Skip ↵</span>
    </div>
  );
}
