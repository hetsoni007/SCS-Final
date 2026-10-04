"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Rich from "@/components/ui/Rich";
import { testimonials } from "@/content/home";

/* S9 — testimonials: a stacked 3D card deck you can swipe, with arrow buttons; all quotes stay in the DOM */
export default function Testimonials() {
  const [top, setTop] = useState(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef(0);
  const n = testimonials.length, next = (d: number) => setTop((t) => (t + d + n) % n);
  return (
    <section className="section" data-loc="testimonials" aria-labelledby="t-h">
      <div className="wrap grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow" data-reveal>What people say</p>
          <h2 id="t-h" className="h2 mt-4" data-reveal>Trusted by clients<br />and collaborators.</h2>
          <a href="https://www.goodfirms.co/company/soni-consultancy-services" target="_blank" rel="noopener" className="glass mt-8 inline-flex items-center gap-4 p-4 pr-6 [perspective:600px]" data-reveal>
            <span className="font-display grid h-16 w-16 place-items-center rounded-2xl text-[22px] font-bold text-on-accent" style={{ background: "var(--grad)", transform: "rotateY(-18deg) rotateX(8deg)", boxShadow: "8px 10px 0 rgba(201,162,75,.35)" }}>5.0</span>
            <span><span className="block text-[15px] text-hi">GoodFirms · ★★★★★</span><span className="dim">Verified client review · read it on GoodFirms ↗</span></span>
          </a>
          <div className="mt-8 flex gap-2">
            <button onClick={() => next(-1)} aria-label="Previous testimonial" className="grid h-12 w-12 place-items-center rounded-full border border-line-strong hover:bg-white/10"><ChevronLeft size={20} /></button>
            <button onClick={() => next(1)} aria-label="Next testimonial" className="grid h-12 w-12 place-items-center rounded-full border border-line-strong hover:bg-white/10"><ChevronRight size={20} /></button>
          </div>
        </div>
        <ul className="relative mx-auto h-[380px] w-full max-w-[520px] [perspective:1200px]" data-cursor="Drag">
          {testimonials.map((t, i) => {
            const pos = (i - top + n) % n;
            return (
              <li key={t.name} className="deck-card glass absolute inset-0 touch-pan-y !bg-bg-1 p-8" aria-hidden={pos !== 0}
                style={{ transform: `translate3d(${pos === 0 ? dx : 0}px, ${pos * 18}px, 0) scale(${1 - pos * 0.06}) rotateX(${pos * -4}deg) rotateZ(${pos === 0 ? dx * 0.03 : 0}deg)`, opacity: pos > 2 ? 0 : 1, zIndex: n - pos, transformOrigin: "50% 100%", transition: dragging && pos === 0 ? "none" : undefined }}
                onPointerDown={(e) => { if (pos !== 0) return; start.current = e.clientX; setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); }}
                onPointerMove={(e) => { if (dragging && pos === 0) setDx(e.clientX - start.current); }}
                onPointerUp={() => { if (!dragging) return; setDragging(false); if (Math.abs(dx) > 90) next(1); setDx(0); }}
                onPointerCancel={() => { setDragging(false); setDx(0); }}>
                <figure className="flex h-full flex-col justify-between">
                  <blockquote className="text-[19px] leading-relaxed text-hi">{t.rating && <span className="mb-3 block text-accent-3" aria-label={`${t.rating} out of 5`}>★★★★★ <b>{t.rating}</b></span>}<Rich html={t.html} /></blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-bg-2 font-semibold text-accent-2" aria-hidden>{t.initials}</span>
                    <span><span className="block text-[15px] text-hi">{t.name}</span><span className="dim">{t.role} · {t.source}</span></span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
