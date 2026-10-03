"use client";
import { useRef, useState } from "react";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";

/* ───────────────────────── React Native: one codebase, platform switch ───────────────────────── */
export default function PlatformToggle() {
  const state = useRef({ split: 1, platform: -1 });
  const [p, setP] = useState(-1);
  const set = (v: number) => { state.current.platform = v; setP(v); };
  return (
    <section className="py-10" data-loc="platform-toggle">
      <div className="wrap">
        <div className="glass grid items-center gap-6 overflow-hidden p-6 md:grid-cols-2 md:p-8" data-reveal>
          <div>
            <p className="eyebrow">One codebase</p>
            <h2 className="h3 mt-3 !text-[clamp(24px,3vw,36px)]">The same screens, native on both platforms.</h2>
            <p className="muted mt-2 text-[15.5px]">Switch platforms: the layout and logic are shared, the platform conventions are not.</p>
            <div role="group" aria-label="Platform" className="mt-5 flex flex-wrap gap-2">
              {[["Both", -1], ["iOS", 0], ["Android", 1]].map(([l, v]) => <button key={l} type="button" aria-pressed={p === v} onClick={() => set(v as number)} className="chip !px-5 !py-2.5 !text-[13px]">{l}</button>)}
            </div>
          </div>
          <ViewSlot scene="codeSplit" props={{ state, auto: false }} className="aspect-[4/3] w-full" poster={<Poster />} />
        </div>
      </div>
    </section>
  );
}
