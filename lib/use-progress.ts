"use client";
import { useEffect, type RefObject } from "react";

/**
 * Scroll progress of a tall "track" element whose child is position:sticky (0 at the moment the
 * track's top hits the viewport top, 1 when its bottom hits the viewport bottom).
 * `mode: "through"` instead measures an ordinary element passing through the viewport.
 * Scroll-linked and reversible; the callback runs inside rAF and should only mutate refs/styles.
 */
export function useProgress(ref: RefObject<HTMLElement | null>, cb: (p: number) => void, mode: "track" | "through" = "track") {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, visible = true;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      const p = mode === "track" ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height);
      cb(Math.min(1, Math.max(0, p)));
    };
    const on = () => { if (visible && !raf) raf = requestAnimationFrame(update); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; on(); }, { rootMargin: "100px" });
    io.observe(el);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    update();
    return () => { io.disconnect(); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [ref, cb, mode]);
}
