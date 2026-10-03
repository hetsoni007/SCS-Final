"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PhoneFrame } from "@/components/ui/Poster";

export type TourShot = { src: string; alt: string; cap?: string };

/**
 * Interactive tour of real app screens: a device that leans toward the pointer, with thumbnails, arrows and a
 * live caption. Every screen and caption comes from content/work.ts.
 */
export default function ScreenTour({ shots, title, eyebrow, lead, flush = false }: { shots: TourShot[]; title: string; eyebrow?: string; lead?: string; flush?: boolean }) {
  const [i, setI] = useState(0);
  const n = shots.length, cur = shots[i];
  if (!n) return null;
  const go = (d: number) => setI((v) => (v + d + n) % n);
  return (
    <section className={`section ${flush ? "!pt-0" : ""}`} data-loc="screen-tour">
      <div className="wrap">
        {eyebrow && <p className="eyebrow" data-reveal>{eyebrow}</p>}
        <h2 className={`h2 ${eyebrow ? "mt-4" : ""}`} data-reveal>{title}</h2>
        {lead && <p className="lead mt-5" data-reveal>{lead}</p>}
        <div className="mt-10 grid items-center gap-7 sm:gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* on phones the device is smaller, so it and its controls share one screen; clicking it steps forward
              (a pointer shortcut: the arrows and thumbnails are the keyboard path) */}
          <div className="mx-auto w-full max-w-[210px] cursor-pointer [perspective:1100px] sm:max-w-[290px]" data-tilt data-cursor="Next" onClick={() => go(1)}>
            <div className="tilt-3d relative">
              {shots.map((s, k) => (
                <PhoneFrame key={s.src} src={s.src} alt={k === i ? s.alt : ""} eager={k === 0}
                  className={`${k ? "!absolute inset-0" : ""} transition-opacity duration-500 ${k === i ? "opacity-100" : "opacity-0"}`} />
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <p className="mono text-[12px] uppercase tracking-widest text-accent-2">Screen {i + 1} of {n}</p>
            <p role="status" aria-live="polite" className="font-display mt-3 text-[clamp(22px,2.4vw,32px)] font-semibold leading-tight tracking-tight">{cur.cap ?? cur.alt}</p>
            <ul className="mt-6 grid grid-cols-5 gap-2.5 sm:mt-7 sm:grid-cols-6 sm:gap-3 lg:grid-cols-7">
              {shots.map((s, k) => (
                <li key={s.src}>
                  <button type="button" aria-pressed={k === i} aria-label={`Show screen ${k + 1}: ${s.cap ?? s.alt}`} onClick={() => setI(k)}
                    className={`block w-full overflow-hidden rounded-xl border transition-[border-color,transform,opacity] duration-300 hover:-translate-y-1 ${k === i ? "border-accent opacity-100" : "border-line opacity-60 hover:opacity-100"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt="" loading="lazy" decoding="async" className="aspect-[1.5/3.1] w-full object-cover object-top" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-2 sm:mt-7">
              <button type="button" onClick={() => go(-1)} aria-label="Previous screen" className="grid h-12 w-12 place-items-center rounded-full border border-line-strong hover:bg-white/10"><ChevronLeft size={20} /></button>
              <button type="button" onClick={() => go(1)} aria-label="Next screen" className="grid h-12 w-12 place-items-center rounded-full border border-line-strong hover:bg-white/10"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
