"use client";
import { useRef, useState } from "react";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";
import Rich from "@/components/ui/Rich";
import { site } from "@/content/site";
import { useHoverPick } from "@/lib/use-hover-pick";

export type Region = { flag: string; country: string; focus: string };
// country names as written on the About page → the market markers on the globe (content/site.ts)
const CODE: Record<string, string> = { "United Kingdom": "GB", "United States": "US", UAE: "AE", India: "IN", Canada: "CA", Australia: "AU" };

/** "Where we work": pick a country and the globe turns to it. */
export default function RegionsGlobe({ eyebrow, title, regions }: { eyebrow: string; title: string; regions: Region[] }) {
  const [i, setI] = useState(-1);
  const state = useRef({ focus: -1 });
  const pick = (k: number) => { setI(k); state.current.focus = k < 0 ? -1 : site.markets.findIndex((m) => m.code === CODE[regions[k].country]); };
  const hover = useHoverPick(pick, 80);
  return (
    <section className="section" data-loc="regions">
      <div className="wrap grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow" data-reveal>{eyebrow}</p>
          <h2 className="h2 mt-4" data-reveal><Rich html={title} hyphens /></h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2" onPointerLeave={(e) => { hover.cancel(); if (e.pointerType === "mouse") pick(-1); }}>
            {regions.map((r, k) => (
              <li key={r.country} data-reveal style={{ "--i": k } as React.CSSProperties}>
                <button type="button" aria-pressed={k === i} onClick={() => { hover.cancel(); pick(k); }} onPointerMove={k === i ? undefined : hover.over(k)} onFocus={() => pick(k)} onBlur={() => pick(-1)}
                  className={`glass spot flex w-full items-center gap-4 p-5 text-left transition-[border-color] duration-300 ${k === i ? "!border-accent" : ""}`}>
                  <span className="text-[28px] leading-none" aria-hidden>{r.flag}</span>
                  <span><span className="block text-[17px] font-semibold text-hi">{r.country}</span><span className="dim block">{r.focus}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <ViewSlot scene="globe" props={{ state, orbit: true }} className="mx-auto aspect-square w-full max-w-[560px]" poster={<Poster kind="globe" />} />
      </div>
    </section>
  );
}
