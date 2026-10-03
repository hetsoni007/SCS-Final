"use client";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";
import Rich from "@/components/ui/Rich";
import type { SceneKey } from "@/lib/gl-store";
import { useHoverPick } from "@/lib/use-hover-pick";

export type ServiceItem = { n: string; title: string; body: string; points: string[]; chips: string[]; href?: string; scene: SceneKey; sceneProps?: Record<string, unknown> };

/**
 * The services list as an explorer: pick a service and its own 3D scene, description and details come forward.
 * All seven descriptions stay in the DOM (inactive ones are only hidden), so nothing is lost to crawlers.
 */
export default function ServiceExplorer({ items }: { items: ServiceItem[] }) {
  const [i, setI] = useState(0);
  const cur = items[i];
  const hover = useHoverPick(setI, 140); // a pause before switching: each service mounts its own 3D scene
  return (
    <section className="py-10" data-loc="service-explorer">
      <div className="wrap grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* phones: a wrap of compact chips with the detail panel straight below; desktop: a list beside a sticky panel */}
        <ul className="flex flex-wrap content-start gap-2 lg:grid" aria-label="Services">
          {items.map((s, k) => (
            <li key={s.title} data-reveal style={{ "--i": k } as React.CSSProperties}>
              <button type="button" aria-pressed={k === i} onClick={() => { hover.cancel(); setI(k); }} onPointerMove={k === i ? undefined : hover.over(k)} onPointerLeave={hover.cancel}
                className={`group flex min-h-11 w-full items-center gap-3 rounded-full border px-4 py-2 text-left transition-[border-color,background-color] duration-300 lg:items-baseline lg:gap-4 lg:rounded-2xl lg:px-5 lg:py-4 ${k === i ? "border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]" : "border-line hover:border-line-strong"}`}>
                <span className="mono text-[12px] text-accent-2">{s.n}</span>
                <span className={`font-display text-[15px] font-semibold leading-tight tracking-tight transition-transform duration-500 lg:text-[clamp(19px,1.7vw,25px)] ${k === i ? "lg:translate-x-1" : "lg:group-hover:translate-x-1"}`}>{s.title}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="glass spot overflow-hidden lg:sticky lg:top-[calc(var(--nav-h)+24px)] lg:self-start" data-reveal>
          <ViewSlot key={cur.scene} scene={cur.scene} props={cur.sceneProps} className="aspect-[16/9] w-full" poster={<Poster />} />
          {items.map((s, k) => (
            <div key={s.title} hidden={k !== i} className="border-t border-line p-7 md:p-9">
              <h2 className="h3 !text-[clamp(24px,2.4vw,34px)]">{s.title}</h2>
              <p className="muted mt-3"><Rich html={s.body} /></p>
              <ul className="mt-5 grid gap-2.5 text-[15.5px] text-mid sm:grid-cols-2">{s.points.map((p) => <li key={p} className="flex gap-3"><Check size={16} className="mt-1 shrink-0 text-accent-2" aria-hidden /><Rich html={p} /></li>)}</ul>
              <ul className="mt-5 flex flex-wrap gap-2">{s.chips.map((c) => <li key={c} className="chip">{c}</li>)}</ul>
              {s.href && <Link href={s.href} className="btn btn-glass mt-7" aria-label={`Full details: ${s.title}`} data-cta>Full details →</Link>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
