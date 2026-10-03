"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProviders";

/* ───────────────────────── DevOps: illustrative ops dashboard ───────────────────────── */
type Dora = { l: string; v: string; t: string };
const STAGES = ["Build", "Test", "Scan", "Deploy"], SERVICES = ["api-gateway", "auth-service", "payments", "worker-queue"];
export default function OpsDashboard({ title, sub, badge, dora, note }: { title: string; sub: string; badge: string; dora: Dora[]; note: string }) {
  const { reduced } = useApp();
  const [idx, setIdx] = useState(2), [deploys, setDeploys] = useState(dora[0]?.v ?? ""), [warn, setWarn] = useState(true);
  // deterministic sparkline (the live site randomises; fixed values avoid hydration drift)
  const [bars, setBars] = useState(() => Array.from({ length: 14 }, (_, i) => Math.min(100, (6 + Math.round(Math.abs(Math.sin(i * 1.3) * 9) + ((i * 7) % 4))) * 6)));
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setIdx((i) => {
      const n = (i + 1) % STAGES.length;
      if (n === 0) { setDeploys(`${12 + Math.floor(Math.random() * 6)} / day`); setBars((b) => [...b.slice(1), Math.min(100, (6 + Math.floor(Math.random() * 12)) * 6)]); }
      return n;
    }), 2400);
    const w = setTimeout(() => setWarn(false), 6000);
    return () => { clearInterval(t); clearTimeout(w); };
  }, [reduced]);
  return (
    <section className="py-10" data-loc="ops-dashboard">
      <div className="wrap">
        <div className="glass p-6 md:p-8" data-reveal>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="h3">{title}</h2><p className="muted mt-1 text-[14.5px]">{sub}</p></div>
            <span className="chip"><span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent-3" aria-hidden />{badge}</span>
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dora.map((d, i) => <div key={d.l} className="rounded-2xl border border-line bg-bg-0/50 p-4"><dt className="text-[13px] text-lo">{d.l}</dt><dd className="font-display mt-1 text-[30px] font-bold leading-none">{i === 0 ? deploys : d.v}</dd><dd className="mono mt-2 text-[11.5px] text-success">{d.t}</dd></div>)}
          </dl>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-bg-0/50 p-4"><p className="text-[13px] text-lo">Deployments — last 14 days</p><div className="mt-3 flex h-[84px] items-end gap-1.5" aria-hidden>{bars.map((h, i) => <span key={i} className="flex-1 rounded-t transition-[height] duration-700" style={{ height: `${h}%`, background: "var(--grad)" }} />)}</div></div>
            <div className="flex items-center gap-5 rounded-2xl border border-line bg-bg-0/50 p-4">
              <svg viewBox="0 0 80 80" className="h-[84px] w-[84px] -rotate-90" aria-hidden><circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8" /><circle cx="40" cy="40" r="32" fill="none" stroke="#34d399" strokeWidth="8" strokeLinecap="round" strokeDasharray="201" strokeDashoffset="1" /></svg>
              <div><p className="text-[13px] text-lo">Uptime · 30 days</p><p className="font-display text-[26px] font-bold leading-none">99.98% <small className="text-[12px] font-normal text-success">SLA met</small></p><p className="muted mt-1 text-[13.5px]">Error budget healthy.<br />2 alerts auto-resolved this week.</p></div>
            </div>
          </div>
          <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Pipeline stages">
            {STAGES.map((s, i) => <li key={s} className={`mono rounded-xl border px-4 py-3 text-[12.5px] transition-colors ${i === idx ? "border-accent-2 text-accent-2" : i < idx ? "border-success/40 text-success" : "border-line text-lo"}`}>{i < idx ? "✓ " : i === idx ? "● " : "○ "}{s}</li>)}
          </ol>
          <ul className="mt-3 flex flex-wrap gap-2">{SERVICES.map((s) => <li key={s} className="chip"><span className={`inline-block h-1.5 w-1.5 rounded-full ${s === "payments" && warn ? "bg-accent-3" : "bg-success"}`} aria-hidden />{s}</li>)}</ul>
        </div>
        <p className="dim mt-4">{note}</p>
      </div>
    </section>
  );
}
