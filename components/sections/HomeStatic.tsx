/**
 * Home sections with no client-side state. They are server components: their markup ships as HTML only.
 * Cursor tilt comes from the delegated [data-tilt] handler in AppProviders, the loops are CSS.
 */
import Link from "next/link";
import { BadgeDollarSign, KeyRound, PhoneCall, ShieldCheck, Timer, UsersRound } from "lucide-react";
import { Counter } from "@/components/ui/Bits";
import { SectionHead } from "./SectionHead";
import { site } from "@/content/site";
import { guarantees, stats, tools, values } from "@/content/home";

/* S3 — stats: extruded-looking numbers that tilt with the cursor (CSS 3D; the numbers stay real text) */
export function Stats() {
  return (
    <section className="section" data-loc="stats">
      <div className="wrap">
        <SectionHead eyebrow="Proof, not promises" title="Real apps. Real results.<br>Live on the stores today." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Link key={s.label} href={s.href} className="glass spot group block p-7 [perspective:800px]" data-tilt data-reveal data-cursor="View" style={{ "--i": i } as React.CSSProperties}>
              <div className="tilt-3d stat-num font-display text-[clamp(64px,7vw,112px)] font-bold leading-none tracking-tighter">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <p className="muted mt-5 text-[15px]">{s.label}</p>
              <p className="mt-4 text-[14px] text-accent-2 opacity-70 transition-[opacity,transform] duration-300 group-hover:translate-x-1 group-hover:opacity-100">{s.more} →</p>
            </Link>
          ))}
        </div>
        <p className="dim mt-6" data-reveal>
          <a href="https://www.goodfirms.co/" target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-hi">Reviewed on GoodFirms</a> · ★★★★★ 5.0 verified client review
        </p>
      </div>
    </section>
  );
}

/* Manifesto — the three values from the About page, set large; each line fills in as it scrolls into view */
export function Manifesto() {
  return (
    <section className="section" data-loc="manifesto" aria-labelledby="manifesto-h">
      <div className="wrap">
        <p className="eyebrow" data-reveal>What we value</p>
        <h2 id="manifesto-h" className="sr-only">How we work.</h2>
        <ol className="mt-10 grid gap-10 md:gap-14">
          {values.map((v) => (
            <li key={v.title} className="grid items-end gap-3 border-b border-line pb-10 md:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] md:gap-10 md:pb-14">
              <p className="manifesto-line font-display text-[clamp(40px,7.2vw,120px)] font-semibold leading-[0.98] tracking-[-0.03em]">{v.title}</p>
              <p className="muted max-w-[34ch] text-[17px] md:pb-3" data-reveal>{v.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* S7 — why us: bento of the six guarantees, each with a looping micro-animation */
const BENTO: Record<string, { icon: typeof Timer; anim: string; span: string }> = {
  weeks: { icon: Timer, anim: "bento-tick 2.4s steps(12) infinite", span: "lg:col-span-2" },
  senior: { icon: UsersRound, anim: "bento-float 3s ease-in-out infinite", span: "" },
  price: { icon: BadgeDollarSign, anim: "bento-lock 3s ease-in-out infinite", span: "" },
  ip: { icon: KeyRound, anim: "bento-turn 3.2s ease-in-out infinite", span: "" },
  nda: { icon: ShieldCheck, anim: "bento-pulse 2.6s ease-in-out infinite", span: "" },
  free: { icon: PhoneCall, anim: "bento-ring 2.2s ease-in-out infinite", span: "lg:col-span-2" },
};
export function Bento() {
  return (
    <section className="section" data-loc="why">
      <div className="wrap">
        <SectionHead eyebrow="Why founders pick us" title="Less risk. Faster ship.<br>Senior hands only." />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map((g, i) => { const b = BENTO[g.key], I = b.icon; return (
            <li key={g.key} className={`glass spot flex min-h-[210px] flex-col justify-between p-7 ${b.span}`} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-bg-2 text-accent-2 [perspective:300px]"><I size={26} strokeWidth={1.5} style={{ animation: b.anim }} aria-hidden /></span>
              <div><h3 className="h3 mt-6">{g.title}</h3>{g.body && <p className="muted mt-2 text-[15.5px]">{g.body}</p>}</div>
            </li>); })}
        </ul>
      </div>
    </section>
  );
}

/* S8 — founder. No portrait photo exists on the live site; a monogram tile with layered parallax stands in (see CONTENT-QUESTIONS.md). */
export function Founder() {
  return (
    <section className="section" data-loc="founder">
      <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="glass spot relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden [perspective:900px]" data-tilt data-reveal>
          <div aria-hidden className="absolute inset-[-10%] opacity-70 blur-2xl transition-transform duration-300" style={{ background: "radial-gradient(closest-side at 30% 30%,#C9A24B,transparent),radial-gradient(closest-side at 70% 70%,#F2DA8C88,transparent)", transform: "translate(calc(var(--px,0)*-30px),calc(var(--py,0)*-30px))" }} />
          <div aria-hidden className="font-display absolute inset-0 grid place-items-center text-[180px] font-bold tracking-tighter text-hi/90 transition-transform duration-300" style={{ transform: "translate(calc(var(--px,0)*24px),calc(var(--py,0)*24px)) rotateY(calc(var(--px,0)*18deg)) rotateX(calc(var(--py,0)*-18deg))" }}>{site.founder.initials}</div>
          <p className="mono absolute bottom-5 left-5 text-[11px] uppercase tracking-widest text-mid">{site.founder.name} · {site.founder.role}</p>
        </div>
        <div>
          <p className="eyebrow" data-reveal>Who you&apos;ll work with</p>
          <h2 className="h2 mt-4" data-reveal>{site.founder.name} — {site.founder.role}</h2>
          <blockquote className="font-display mt-6 text-[clamp(28px,3.4vw,48px)] font-semibold leading-tight tracking-tight" data-reveal><span className="grad-text">“Ship over slideware.”</span></blockquote>
          <p className="muted mt-6 max-w-[62ch]" data-reveal>5+ years building and shipping commercial apps — React Native, MERN and AI — live on the App Store and Google Play. The senior engineer who scopes, builds and ships your product is the person you talk to, not a sales rep who hands it to juniors.</p>
          <p className="muted mt-4 max-w-[62ch]" data-reveal>Working across UK, US, UAE and India time zones for real-time collaboration, with transparent fixed pricing agreed before a line of code is written. <Link href="/about/" className="text-accent-2 underline underline-offset-4">More about how we work →</Link></p>
          <a href={site.founder.linkedin} target="_blank" rel="noopener" className="btn btn-glass mt-8" data-reveal>Connect on LinkedIn →</a>
        </div>
      </div>
    </section>
  );
}

/* S10 — free tools teaser with mini animated previews */
function ToolViz({ kind }: { kind: string }) {
  const bar = (h: number, d: number, c = "#C9A24B") => <span key={d} className="w-3 origin-bottom rounded-t" style={{ height: `${h}%`, background: c, animation: `viz-grow 2.4s ${d}s ease-in-out infinite alternate` }} />;
  return (
    <div aria-hidden className="relative flex h-[110px] items-end justify-center gap-2 overflow-hidden rounded-2xl border border-line bg-bg-0/60 p-4">
      {kind === "calc" && <span className="font-display self-center text-[30px] font-bold tracking-tight"><span className="grad-text">$14k – $26k</span></span>}
      {kind === "guide" && [0, 1, 2].map((i) => <span key={i} className="absolute h-[78px] w-[58px] rounded-md border border-line-strong bg-bg-2" style={{ transform: `translateX(${(i - 1) * 26}px) rotate(${(i - 1) * 9}deg)`, animation: `viz-fan 3s ${i * 0.15}s ease-in-out infinite alternate` }} />)}
      {kind === "stack" && ["RN", "API", "DB"].map((t, i) => <span key={t} className="mono absolute w-[120px] rounded-md border border-line-strong bg-bg-2 py-1 text-center text-[11px] text-accent-2" style={{ bottom: 16 + i * 26, animation: `viz-fan 2.6s ${i * 0.2}s ease-in-out infinite alternate` }}>{t}</span>)}
      {kind === "fork" && <svg viewBox="0 0 120 70" className="h-full"><path d="M60 66V40M60 40L22 10M60 40V8M60 40L98 10" fill="none" stroke="#F2DA8C" strokeWidth="2" strokeDasharray="90" style={{ animation: "viz-draw 3s ease-in-out infinite alternate" }} /><circle cx="22" cy="10" r="5" fill="#C9A24B" /><circle cx="60" cy="8" r="5" fill="#F2DA8C" /><circle cx="98" cy="10" r="5" fill="#E8A33D" /></svg>}
      {kind === "shield" && <span className="font-display self-center text-[34px] font-bold text-success">8<span className="text-[18px] text-mid">/10</span></span>}
      {kind === "bars" && [35, 55, 48, 80, 66].map((h, i) => bar(h, i * 0.15, i === 3 ? "#F2DA8C" : "#C9A24B"))}
    </div>
  );
}
export function ToolsTeaser() {
  return (
    <section className="section" data-loc="tools">
      <div className="wrap">
        <SectionHead eyebrow="Free guides & tools" title="Scope it before you build it." />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t, i) => (
            <li key={t.href} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <Link href={t.href} className="glass spot block h-full p-6" data-cursor="View">
                <ToolViz kind={t.viz} />
                <p className="eyebrow mt-6">{t.kick}</p>
                <h3 className="h3 mt-2">{t.title}</h3>
                <p className="mt-3 text-[15px] text-accent-2">{t.cta}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
