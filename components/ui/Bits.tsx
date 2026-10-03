"use client";
/** Small interactive primitives: Counter, Marquee, Faq accordion, SplitText heading. */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { shared } from "@/lib/gl-store";
import { useApp } from "@/components/providers/AppProviders";

/** Counts up when scrolled into view. Server-renders the final value, so no-JS and crawlers see real numbers. */
export function Counter({ value, prefix = "", suffix = "", className }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useApp();
  useEffect(() => {
    const el = ref.current; if (!el || reduced) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const step = (now: number) => { const k = Math.min(1, (now - t0) / dur), v = Math.round(value * (1 - Math.pow(1 - k, 4))); el.textContent = `${prefix}${v}${suffix}`; if (k < 1) raf = requestAnimationFrame(step); };
      el.textContent = `${prefix}0${suffix}`; raf = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, prefix, suffix, reduced]);
  return <span ref={ref} className={className}>{prefix}{value}{suffix}</span>;
}

/** Infinite marquee that speeds up with scroll velocity. Static (wrapping) row under reduced motion. */
export function Marquee({ children, dir = 1, speed = 40 }: { children: ReactNode; dir?: 1 | -1; speed?: number }) {
  const track = useRef<HTMLDivElement>(null);
  const { reduced } = useApp();
  useEffect(() => {
    const el = track.current; if (!el || reduced) return;
    let x = 0, raf = 0, last = performance.now(), half = el.scrollWidth / 2, visible = false;
    // The loop width is measured on resize only: reading scrollWidth every frame would force a layout per frame.
    const ro = new ResizeObserver(() => { half = el.scrollWidth / 2; });
    ro.observe(el);
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      x += dir * speed * dt * (1 + Math.abs(shared.scrollVel) * 6);
      if (half > 0) x = ((x % half) + half) % half;
      el.style.transform = `translate3d(${-x}px,0,0)`;
      raf = requestAnimationFrame(loop);
    };
    // only animate while on screen
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible) { visible = true; last = performance.now(); raf = requestAnimationFrame(loop); }
      else if (!e.isIntersecting && visible) { visible = false; cancelAnimationFrame(raf); }
    });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [dir, speed, reduced]);
  if (reduced) return <div className="flex flex-wrap justify-center gap-3">{children}</div>;
  return (
    <div className="marquee">
      <div ref={track} className="marquee-track">
        {children}
        <span aria-hidden className="contents">{children}</span>
      </div>
    </div>
  );
}

export function FaqItem({ q, children, defaultOpen = false }: { q: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-b border-line">
      <h3>
        <button aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[18px] font-medium text-hi">
          {q}
          <Plus size={20} className={`shrink-0 text-accent-2 transition-transform duration-300 ${open ? "rotate-45" : ""}`} aria-hidden />
        </button>
      </h3>
      {/* height animates via grid rows (spring-like expo ease); the answer stays in the DOM for search engines */}
      <div id={id} role="region" aria-hidden={!open} inert={!open} className="faq-panel grid" style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}>
        <div className="overflow-hidden"><div className="rich max-w-[70ch] pb-6 text-mid">{children}</div></div>
      </div>
    </div>
  );
}

/**
 * Split-text reveal. The text is server-rendered as real words (screen readers get the aria-label),
 * and each character animates with a slight 3D rotateX when the heading enters the viewport.
 */
export function SplitText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useApp();
  useEffect(() => {
    const el = ref.current; if (!el || reduced) return;
    const chars = el.querySelectorAll<HTMLElement>(".split-char");
    let ctx: { revert: () => void } | undefined, dead = false;
    import("gsap").then(({ gsap }) => {
      if (dead) return;
      ctx = gsap.context(() => {
        gsap.fromTo(chars, { opacity: 0, yPercent: 60, rotateX: -80 }, { opacity: 1, yPercent: 0, rotateX: 0, duration: 1.1, ease: "expo.out", stagger: 0.022, delay, scrollTrigger: undefined });
      }, el);
    });
    return () => { dead = true; ctx?.revert(); };
  }, [reduced, delay, text]);
  return (
    <span ref={ref} className={className} aria-label={text} style={{ perspective: 800 }}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="split-word" aria-hidden>
          {[...w].map((c, j) => <span key={j} className="split-char">{c}</span>)}
          {" "}
        </span>
      ))}
    </span>
  );
}
