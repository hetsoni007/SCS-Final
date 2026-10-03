"use client";
import { useRef, useState } from "react";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";
import Rich, { stripTags } from "@/components/ui/Rich";

/* ───────────────────────── AI: 12 ideas as a constellation ───────────────────────── */
type Idea = { title: string; body: string; tag: string };
const DEMO: ("chat" | "graph" | "match" | "scan" | "wave" | "bars")[] = ["chat", "graph", "match", "scan", "wave", "bars", "chat", "graph", "bars", "chat", "match", "scan"];
function MiniDemo({ kind, i }: { kind: (typeof DEMO)[number]; i: number }) {
  return (
    <div aria-hidden className="relative h-[92px] overflow-hidden rounded-xl border border-line bg-bg-0/60 p-3" key={i}>
      {kind === "chat" && <div className="grid gap-1.5 text-[11.5px]"><span className="w-fit rounded-lg bg-accent px-2.5 py-1 text-white">How do I reset my plan?</span><span className="idea-type w-fit max-w-full overflow-hidden whitespace-nowrap rounded-lg bg-bg-2 px-2.5 py-1 text-hi">Settings → Billing → Change plan. Want me to open it?</span></div>}
      {kind === "graph" && <svg viewBox="0 0 200 70" className="h-full w-full"><path d="M0 60 C30 55 40 30 70 34 S110 12 140 22 S180 8 200 14" fill="none" stroke="#F2DA8C" strokeWidth="2" strokeDasharray="260" className="idea-draw" /><circle cx="140" cy="22" r="4" fill="#E8A33D" /><text x="146" y="18" fontSize="10" fill="#f4f5f7" fontFamily="monospace">£12.40</text></svg>}
      {kind === "match" && <svg viewBox="0 0 200 70" className="h-full w-full">{[14, 35, 56].map((y, j) => <g key={y}><circle cx="24" cy={y} r="6" fill="#C9A24B" /><circle cx="176" cy={[35, 56, 14][j]} r="6" fill="#F2DA8C" /><line x1="30" y1={y} x2="170" y2={[35, 56, 14][j]} stroke="#f4f5f7" strokeOpacity=".5" strokeDasharray="150" className="idea-draw" style={{ animationDelay: `${j * 0.25}s` }} /></g>)}</svg>}
      {kind === "scan" && <div className="relative mx-auto h-full w-[92px] rounded-md border border-line-strong bg-bg-2 p-2">{[0, 1, 2, 3].map((r) => <span key={r} className="mb-1.5 block h-1.5 rounded bg-white/20" style={{ width: `${[90, 60, 80, 45][r]}%` }} />)}<span className="idea-scan absolute inset-x-0 top-0 h-0.5 bg-accent-2 shadow-[0_0_10px_var(--accent-2)]" /></div>}
      {kind === "wave" && <div className="flex h-full items-center justify-center gap-1">{Array.from({ length: 18 }, (_, k) => <span key={k} className="idea-wave w-1 rounded-full bg-accent-2" style={{ animationDelay: `${k * 0.07}s` }} />)}</div>}
      {kind === "bars" && <div className="flex h-full items-end justify-center gap-2">{[40, 65, 52, 88, 70].map((h, k) => <span key={k} className="idea-bar w-4 origin-bottom rounded-t" style={{ height: `${h}%`, background: k === 3 ? "#F2DA8C" : "#C9A24B", animationDelay: `${k * 0.1}s` }} />)}</div>}
      <span className="mono absolute bottom-1.5 right-2 text-[9px] uppercase tracking-widest text-lo">Illustrative</span>
    </div>
  );
}
export default function IdeaConstellation({ eyebrow, title, lead, ideas }: { eyebrow: string; title: string; lead: string; ideas: Idea[] }) {
  const state = useRef({ active: -1 });
  const [active, setActive] = useState(-1);
  const pick = (i: number) => { state.current.active = i; setActive(i); };
  return (
    <section className="section" data-loc="ai-ideas" aria-labelledby="ideas-h">
      <div className="wrap">
        <p className="eyebrow" data-reveal>{eyebrow}</p>
        <h2 id="ideas-h" className="h2 mt-4 max-w-[20ch]" data-reveal><Rich html={title} /></h2>
        <p className="lead mt-5" data-reveal><Rich html={lead} /></p>
        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+24px)] lg:self-start">
            <div className="glass relative overflow-hidden">
              <ViewSlot scene="constellation" props={{ state, count: ideas.length }} className="aspect-[4/3] w-full" poster={<Poster />} />
              <p className="mono pointer-events-none absolute left-4 top-4 text-[11px] uppercase tracking-widest text-lo">{active >= 0 ? `Node ${String(active + 1).padStart(2, "0")} / ${ideas.length}` : "Hover an idea →"}</p>
            </div>
            <div className="glass mt-4 min-h-[210px] p-5" aria-live="polite">
              {active >= 0 ? (<><p className="mono text-[11px] uppercase tracking-widest text-accent-2">{stripTags(ideas[active].tag)}</p><h3 className="h3 mt-1"><Rich html={ideas[active].title} /></h3><div className="mt-3"><MiniDemo kind={DEMO[active % DEMO.length]} i={active} /></div></>)
                : <p className="muted grid h-[170px] place-items-center text-center text-[15px]">Each node is one of the {ideas.length} ideas. Pick one to see what it looks like in an app.</p>}
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2" onPointerLeave={() => pick(-1)}>
            {ideas.map((it, i) => (
              <li key={it.title}>
                <article tabIndex={0} onPointerEnter={() => pick(i)} onFocus={() => pick(i)} onBlur={() => pick(-1)} className={`glass spot h-full p-5 outline-offset-2 transition-colors ${active === i ? "!border-accent" : ""}`}>
                  <span className="step-n">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="h3 mt-2"><Rich html={it.title} /></h3>
                  <p className="muted mt-2 text-[15px]"><Rich html={it.body} /></p>
                  <p className="chip mt-4">{stripTags(it.tag)}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <style>{`.idea-type{animation:idea-type 2.4s steps(40) infinite alternate}.idea-draw{animation:idea-draw 2.2s ease-in-out infinite alternate}.idea-scan{animation:idea-scan 1.8s ease-in-out infinite alternate}.idea-wave{height:20%;animation:idea-wave 1s ease-in-out infinite alternate}.idea-bar{animation:idea-bar 1.6s ease-in-out infinite alternate}
      @keyframes idea-type{from{max-width:0}to{max-width:100%}}@keyframes idea-draw{from{stroke-dashoffset:260}to{stroke-dashoffset:0}}@keyframes idea-scan{from{top:0}to{top:calc(100% - 2px)}}@keyframes idea-wave{to{height:85%}}@keyframes idea-bar{from{transform:scaleY(.5)}to{transform:scaleY(1)}}
      @media (prefers-reduced-motion: reduce){[data-loc="ai-ideas"] [class^="idea-"]{animation:none!important;max-width:100%}}:root[data-motion="reduce"] [data-loc="ai-ideas"] [class^="idea-"]{animation:none!important;max-width:100%}`}</style>
    </section>
  );
}
