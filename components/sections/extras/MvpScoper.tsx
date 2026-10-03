"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";
import { appCalc } from "@/content/tools";

/* ───────────────────────── MVP: Core / Supporting / Later scoper with physics ───────────────────────── */
const TIERS = ["Core", "Supporting", "Later"] as const;
const START = [0, 0, 2, 1, 1, 1, 2, 2, 2, 2]; // example split of the cost calculator's ten features
export default function MvpScoper() {
  const feats = appCalc.features, base = appCalc.stages[0].base;
  const [tiers, setTiers] = useState<number[]>(START);
  const [hover, setHover] = useState(-1);
  const state = useRef<{ tiers: number[]; onMove?: (i: number, t: number) => void; onHover?: (i: number) => void }>({ tiers: START });
  const move = useCallback((i: number, t: number) => setTiers((cur) => { if (t < 0 || t > 2 || cur[i] === t) return cur; const n = cur.map((v, j) => (j === i ? t : v)); state.current.tiers = n; return n; }), []);
  useEffect(() => { state.current.onMove = move; state.current.onHover = setHover; }, [move]);
  const weeks = (t: number) => feats.reduce((s, f, i) => s + (tiers[i] === t ? f.weeks : 0), 0);
  const first = Math.max(appCalc.minWeeks, Math.round(base + weeks(0) + weeks(1))), coreOnly = Math.max(appCalc.minWeeks, Math.round(base + weeks(0)));
  return (
    <section className="section !pt-0" data-loc="mvp-scoper" aria-labelledby="scoper-h">
      <div className="wrap">
        <div className="glass p-6 md:p-8" data-reveal>
          <p className="eyebrow">Try it</p>
          <h2 id="scoper-h" className="h3 mt-3 !text-[clamp(24px,3vw,36px)]">Sort a feature list into Core, Supporting and Later.</h2>
          <p className="muted mt-2 max-w-[70ch] text-[15.5px]">Drag a block between bins, or use the arrows. The readout uses the same indicative week weights as the <Link href="/app-cost-calculator/" className="text-accent-2 underline underline-offset-4">cost calculator</Link> — it is an illustration of how scope moves a timeline, not a quote.</p>
          <div className="relative mt-6">
            <ViewSlot scene="blocksPhysics" props={{ state, count: feats.length }} interactive className={`aspect-[16/8] w-full touch-pan-y rounded-2xl border border-line bg-bg-0/40 max-md:aspect-[4/3] ${hover >= 0 ? "cursor-grab" : ""}`} poster={<Poster kind="grid" />} />
            <div className="pointer-events-none absolute inset-x-0 top-3 grid grid-cols-3 text-center" aria-hidden>{TIERS.map((t) => <span key={t} className="mono text-[11px] uppercase tracking-widest text-mid">{t}</span>)}</div>
            {hover >= 0 && <p className="chip on pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2" aria-hidden>{feats[hover].label} · {feats[hover].weeks} wk</p>}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {TIERS.map((name, t) => (
              <div key={name} className="rounded-2xl border border-line bg-bg-0/40 p-4">
                <h3 className="flex items-baseline justify-between text-[15px] font-semibold"><span>{name}</span><span className="mono text-[12px] text-lo">{weeks(t)} wk</span></h3>
                <ul className="mt-3 grid gap-2">
                  {feats.map((f, i) => tiers[i] === t ? (
                    <li key={f.label} className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[14px] ${hover === i ? "border-accent" : "border-line"}`}>
                      <span>{f.label} <span className="mono text-[11px] text-lo">{f.weeks}</span></span>
                      <span className="flex shrink-0 gap-1">
                        <button type="button" disabled={t === 0} onClick={() => move(i, t - 1)} aria-label={`Move ${f.label} to ${TIERS[t - 1] ?? ""}`} className="grid h-7 w-7 place-items-center rounded-full border border-line disabled:opacity-25 hover:bg-white/10"><ArrowLeft size={13} /></button>
                        <button type="button" disabled={t === 2} onClick={() => move(i, t + 1)} aria-label={`Move ${f.label} to ${TIERS[t + 1] ?? ""}`} className="grid h-7 w-7 place-items-center rounded-full border border-line disabled:opacity-25 hover:bg-white/10"><ArrowRight size={13} /></button>
                      </span>
                    </li>
                  ) : null)}
                  {!feats.some((_, i) => tiers[i] === t) && <li className="dim">Nothing here.</li>}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-[15px]" aria-live="polite">
            <span>First release (Core + Supporting): <b className="font-display text-[24px] text-hi">~{first} weeks</b></span>
            <span className="muted">Core only: ~{coreOnly} weeks</span>
            <span className="muted">Deferred to Later: {weeks(2)} weeks of work</span>
          </p>
        </div>
      </div>
    </section>
  );
}
