"use client";
import { useRef, useState } from "react";
import { Check } from "lucide-react";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";
import Rich from "@/components/ui/Rich";
import { useHoverPick } from "@/lib/use-hover-pick";

export type Model = { title: string; body: string; points: string[]; chips: string[]; badge?: string };

/** The three ways to work together. Selecting a card brings its figure forward in the 3D scene above. */
export default function EngagementModels({ eyebrow, title, models }: { eyebrow: string; title: string; models: Model[] }) {
  const [i, setI] = useState(1);
  const state = useRef({ active: 1 });
  const pick = (k: number) => { setI(k); state.current.active = k; };
  const hover = useHoverPick(pick);
  return (
    <section className="section" data-loc="engagement-models">
      <div className="wrap">
        <p className="eyebrow" data-reveal>{eyebrow}</p>
        <h2 className="h2 mt-4 max-w-[22ch]" data-reveal><Rich html={title} hyphens /></h2>
        <ViewSlot scene="pods" props={{ state }} className="mx-auto mt-8 aspect-[21/9] w-full max-w-[980px]" poster={<Poster />} />
        <ul className="mt-2 grid gap-4 lg:grid-cols-3">
          {models.map((m, k) => (
            <li key={m.title} data-reveal style={{ "--i": k } as React.CSSProperties}>
              {/* the whole card selects (the title button stretches over it); links inside stay clickable above it */}
              <div onPointerMove={k === i ? undefined : hover.over(k)} onPointerLeave={hover.cancel}
                className={`glass spot relative h-full p-7 transition-[border-color] duration-300 [&_a]:relative [&_a]:z-[1] ${k === i ? "!border-accent" : ""}`}>
                {m.badge && <p className="chip on mb-3">{m.badge}</p>}
                <h3 className="h3"><button type="button" aria-pressed={k === i} onClick={() => { hover.cancel(); pick(k); }} onFocus={() => pick(k)} className="text-left after:absolute after:inset-0 after:rounded-[inherit]">{m.title}</button></h3>
                <p className="muted mt-3 text-[15.5px]"><Rich html={m.body} /></p>
                <ul className="mt-5 grid gap-2.5 text-[15px] text-mid">{m.points.map((p) => <li key={p} className="flex gap-3"><Check size={16} className="mt-1 shrink-0 text-accent-2" aria-hidden /><Rich html={p} /></li>)}</ul>
                <ul className="mt-5 flex flex-wrap gap-2">{m.chips.map((c) => <li key={c} className="chip">{c}</li>)}</ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
