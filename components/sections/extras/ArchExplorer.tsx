"use client";
import { useState } from "react";
import Rich from "@/components/ui/Rich";
import arch from "@/content/devops-arch.json";

/* ───────────────────────── DevOps: reference architecture explorer ───────────────────────── */
type Node = { label: string; small?: string; k: string; t: string; d: string };
export default function ArchExplorer({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  const [cur, setCur] = useState<Node | null>(null);
  const cap = cur ?? { k: arch.cap.k, t: arch.cap.t, d: arch.cap.d };
  return (
    <section className="section" data-loc="arch">
      <div className="wrap">
        <p className="eyebrow" data-reveal>{eyebrow}</p>
        <h2 className="h2 mt-4 max-w-[20ch]" data-reveal><Rich html={title} /></h2>
        <p className="lead mt-5" data-reveal>{lead}</p>
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
          <div className="grid gap-2 [perspective:1100px]">
            {(arch.tiers as Node[][]).map((tier, ti) => (
              <div key={ti} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${tier.length}, minmax(0, 1fr))`, transform: `rotateX(18deg) translateZ(${ti * -6}px)` }}>
                {tier.map((n) => (
                  <button key={n.label} type="button" aria-pressed={cur?.label === n.label} onClick={() => setCur(n)} onPointerEnter={() => setCur(n)} onFocus={() => setCur(n)}
                    className={`glass spot px-4 py-4 text-center text-[15px] transition-all duration-300 hover:-translate-y-1 ${cur?.label === n.label ? "!border-accent-2 -translate-y-1" : ""}`}>
                    {n.label}{n.small && <small className="mono mt-1 block text-[11px] text-lo">{n.small}</small>}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="glass p-7 lg:sticky lg:top-[calc(var(--nav-h)+24px)]" aria-live="polite">
            <p className="eyebrow">{cap.k}</p>
            <h3 className="h3 mt-3 !text-[28px]">{cap.t}</h3>
            <p className="muted mt-3"><Rich html={cap.d} /></p>
          </div>
        </div>
      </div>
    </section>
  );
}
