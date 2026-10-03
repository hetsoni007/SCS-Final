"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";
import { LeadForm } from "@/components/lazy";
import { useApp } from "@/components/providers/AppProviders";
import { track } from "@/lib/analytics";
import { morph } from "@/lib/motion";
import { GATE_FIELDS, appCalc, appCalcDefault, cloudCalc, devopsAssessment, estimateApp, estimateCloud, fmtK, fmtMoney, type AppCalcConfig } from "@/content/tools";

/* ───── shared pieces ───── */
function Pill({ type, name, checked, onChange, children, hint, block = false }: { type: "radio" | "checkbox"; name: string; checked: boolean; onChange: () => void; children: ReactNode; hint?: string; block?: boolean }) {
  return (
    <label className={`chip cursor-pointer select-none !whitespace-normal !px-4 !py-2.5 text-left !font-sans !text-[14.5px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-2 ${checked ? "on" : ""} ${block ? "!flex w-full !justify-start !rounded-2xl !whitespace-normal" : ""}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
      {hint && <span className={`mono ml-1 text-[11px] ${checked ? "text-hi" : "text-mid"}`}>{hint}</span>}
    </label>
  );
}
function Group({ title, hint, children, kick }: { title: string; hint?: string; children: ReactNode; kick?: string }) {
  return (
    <fieldset className="glass p-6" data-reveal>
      {kick && <span className="step-n">{kick}</span>}
      <legend className="h3 float-left mb-4 w-full">{title}</legend>
      {hint && <p className="muted mb-4 clear-both text-[14.5px]">{hint}</p>}
      <div className="clear-both flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
const Line = ({ k, v }: { k: string; v: ReactNode }) => <div className="flex items-center justify-between gap-4 border-t border-line py-3 text-[15px]"><span className="muted">{k}</span><span className="text-right font-medium text-hi">{v}</span></div>;

/**
 * A number that morphs to its new value (instant under reduced motion). Motion's `animate` is fetched
 * after hydration, so it stays out of the initial bundle; until it arrives the value simply updates.
 */
let animateFn: typeof import("motion").animate | null = null;
function Num({ value, format }: { value: number; format: (n: number) => string }) {
  const { reduced } = useApp();
  const el = useRef<HTMLSpanElement>(null), shown = useRef(value);
  useEffect(() => { if (!animateFn) import("@/lib/motion-animate").then((m) => { animateFn = m.animate; }); }, []);
  useLayoutEffect(() => {
    const from = shown.current, node = el.current;
    if (from === value) return;
    if (reduced || !animateFn || !node) { shown.current = value; return; }
    node.textContent = format(from);
    const c = animateFn(from, value, { duration: morph.duration, ease: [...morph.ease], onUpdate: (v) => { shown.current = v; node.textContent = format(v); } });
    return () => c.stop();
  }, [value, reduced, format]);
  return <span ref={el}>{format(value)}</span>;
}
function Result({ label, children, disclaimer }: { label: string; children: ReactNode; disclaimer: string }) {
  return (
    <div className="lg:sticky lg:top-[calc(var(--nav-h)+28px)]">
      <div className="glass spot p-6 md:p-8" aria-live="polite">
        <p className="eyebrow">{label}</p>
        {children}
      </div>
      <p className="dim mt-4">{disclaimer}</p>
    </div>
  );
}

const fmtWeeks = (n: number) => String(Math.round(n));

/* ───── App cost calculator ───── */
export function AppCostCalculator() {
  const [c, setC] = useState<AppCalcConfig>(appCalcDefault);
  const est = useMemo(() => estimateApp(c), [c]);
  const scene = useRef<{ features: boolean[]; weeks: number }>({ features: appCalcDefault.features, weeks: 0 });
  useEffect(() => { scene.current.features = c.features; scene.current.weeks = est.weeks; }, [c.features, est.weeks]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => track("calculator_estimate", { weeks: est.weeks, low: est.lo, high: est.hi }), 800);
    return () => clearTimeout(t);
  }, [est]);
  const chosen = appCalc.features.filter((_, i) => c.features[i]).map((f) => f.label);
  const tags = [appCalc.platforms[c.platform].label, appCalc.stages[c.stage].label, ...chosen].slice(0, 8);
  const summary = () => ({
    message: `App cost estimate — ${appCalc.platforms[c.platform].label}, ${appCalc.stages[c.stage].label}, ~${est.weeks} weeks, $${est.lo}–$${est.hi}. Features: ${chosen.join(", ") || "core only"}. Design: ${appCalc.designs[c.design].value}, backend: ${appCalc.backends[c.backend].value}.`,
  });
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] [&>*]:min-w-0">
      <div className="grid gap-4">
        <Group title="Platforms">{appCalc.platforms.map((p, i) => <Pill key={p.value} type="radio" name="platform" checked={c.platform === i} onChange={() => setC({ ...c, platform: i })}>{p.label}</Pill>)}</Group>
        <Group title="Build stage">{appCalc.stages.map((p, i) => <Pill key={p.value} type="radio" name="stage" checked={c.stage === i} onChange={() => setC({ ...c, stage: i })} hint={p.hint}>{p.label}</Pill>)}</Group>
        <Group title="Features" hint="Weeks of engineering each adds.">{appCalc.features.map((f, i) => <Pill key={f.label} type="checkbox" name="features" checked={c.features[i]} onChange={() => setC({ ...c, features: c.features.map((v, j) => (j === i ? !v : v)) })} hint={String(f.weeks)}>{f.label}</Pill>)}</Group>
        <Group title="Design">{appCalc.designs.map((p, i) => <Pill key={p.value} type="radio" name="design" checked={c.design === i} onChange={() => setC({ ...c, design: i })}>{p.label}</Pill>)}</Group>
        <Group title="Backend">{appCalc.backends.map((p, i) => <Pill key={p.value} type="radio" name="backend" checked={c.backend === i} onChange={() => setC({ ...c, backend: i })} hint={p.hint}>{p.label}</Pill>)}</Group>
      </div>
      <Result label="Indicative estimate" disclaimer={appCalc.disclaimer}>
        <ViewSlot scene="calcPhone" props={{ state: scene }} className="mx-auto -mb-2 aspect-[5/4] w-full max-w-[420px]" poster={<Poster />} />
        <p className="font-display text-[clamp(40px,5vw,64px)] font-bold leading-none tracking-tighter"><span className="grad-text"><Num value={est.lo} format={fmtK} /> – <Num value={est.hi} format={fmtK} /></span></p>
        <p className="dim mt-2">Typical range for this scope · USD</p>
        <ul className="my-5 flex flex-wrap gap-1.5" aria-label="Selected scope">{tags.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
        <Line k="Timeline" v={<>~<Num value={est.weeks} format={fmtWeeks} /> weeks</>} />
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden><div className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-expo)]" style={{ width: `${Math.min(100, (est.weeks / 40) * 100)}%`, background: "var(--grad)" }} /></div>
        <Line k="Team" v={appCalc.team} />
        <Line k="Pricing model" v={appCalc.pricingModel} />
        <div className="mt-5 border-t border-line pt-5">
          <LeadForm kind="calculator" fields={GATE_FIELDS} submit={appCalc.submit} note={appCalc.gateNote} success={appCalc.success} extra={summary}
            onSuccess={() => track("calc_complete", { config: { platform: appCalc.platforms[c.platform].value, stage: appCalc.stages[c.stage].value, features: chosen, design: appCalc.designs[c.design].value, backend: appCalc.backends[c.backend].value, weeks: est.weeks, low: est.lo, high: est.hi } })} />
        </div>
      </Result>
    </div>
  );
}

/* ───── Cloud cost calculator ───── */
export function CloudCostCalculator() {
  const [spend, setSpend] = useState(cloudCalc.spend.initial);
  const [cloud, setCloud] = useState(0);
  const [picked, setPicked] = useState(cloudCalc.waste.map((w) => !!w.on));
  const e = useMemo(() => estimateCloud(spend, picked), [spend, picked]);
  const scene = useRef({ progress: 0 });
  useEffect(() => { scene.current.progress = e.hi / cloudCalc.capHi; }, [e.hi]);
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] [&>*]:min-w-0">
      <div className="grid gap-4">
        <div className="glass p-6" data-reveal>
          <label htmlFor="spend" className="h3 block">Current cloud spend</label>
          <p className="font-display mt-3 text-[clamp(40px,5vw,64px)] font-bold leading-none tracking-tighter">{fmtMoney(spend)}<span className="text-[.4em] font-medium text-mid"> / mo</span></p>
          <input id="spend" type="range" min={cloudCalc.spend.min} max={cloudCalc.spend.max} step={cloudCalc.spend.step} value={spend} onChange={(ev) => setSpend(Number(ev.target.value))} className="mt-5 w-full accent-[var(--accent)]" aria-valuetext={`${fmtMoney(spend)} per month`} />
          <div className="dim mt-1 flex justify-between"><span>$1k</span><span>$250k+ / mo</span></div>
        </div>
        <Group title="Primary cloud">{cloudCalc.clouds.map((p, i) => <Pill key={p} type="radio" name="cloud" checked={cloud === i} onChange={() => setCloud(i)}>{p}</Pill>)}</Group>
        <Group title="What's true today?" hint="Tick what applies — each is a common source of cloud waste.">{cloudCalc.waste.map((w, i) => <Pill key={w.label} type="checkbox" name="waste" checked={picked[i]} onChange={() => setPicked(picked.map((v, j) => (j === i ? !v : v)))} hint={`${w.lo}–${w.hi}%`}>{w.label}</Pill>)}</Group>
      </div>
      <Result label="Indicative annual savings" disclaimer={cloudCalc.disclaimer}>
        <ViewSlot scene="cloud" props={{ state: scene }} className="mx-auto aspect-[5/4] w-full max-w-[420px]" poster={<Poster kind="grid" />} />
        <p className="font-display text-[clamp(36px,4.6vw,58px)] font-bold leading-none tracking-tighter"><span className="grad-text">{fmtMoney(e.saveLo)} – {fmtMoney(e.saveHi)}</span></p>
        <p className="dim mt-2">Estimated reduction on your annual cloud bill · USD</p>
        <div className="my-5 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden><div className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-expo)]" style={{ width: `${e.bar}%`, background: "var(--grad)" }} /></div>
        <Line k="Savings range" v={`${e.lo} – ${e.hi}%`} />
        <Line k="Per month" v={`~${fmtMoney(e.moLo)} – ${fmtMoney(e.moHi)}`} />
        <Line k="Engagement" v="Cloud Cost Audit" />
        <div className="mt-5 border-t border-line pt-5">
          <LeadForm kind="cloud-calculator" fields={GATE_FIELDS} submit={cloudCalc.submit} note={cloudCalc.gateNote} success={cloudCalc.success}
            extra={() => ({ message: `Cloud cost calculator — ${cloudCalc.cloudValues[cloud]}, ~$${spend}/mo spend, indicative savings ${e.lo}–${e.hi}% ($${Math.round(e.saveLo)}–$${Math.round(e.saveHi)}/yr).` })}
            onSuccess={() => track("calc_complete", { config: { tool: "cloud", spend, lo: e.lo, hi: e.hi, cloud: cloudCalc.cloudValues[cloud] } })} />
        </div>
      </Result>
    </div>
  );
}

/* ───── DevOps maturity assessment ───── */
const CIRC = 402;
export function DevOpsAssessment() {
  const [a, setA] = useState(devopsAssessment.questions.map(() => devopsAssessment.initial));
  const score = a.reduce((s, v) => s + v, 0), band = devopsAssessment.bands.find((b) => score >= b.min)!;
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] [&>*]:min-w-0">
      <div className="grid gap-4">
        {devopsAssessment.questions.map((q, qi) => (
          <fieldset key={q.kick} className="glass p-6" data-reveal>
            <span className="step-n">{q.kick}</span>
            <legend className="h3 float-left mb-4 mt-1 w-full">{q.q}</legend>
            <div className="clear-both grid gap-2">{q.options.map((o, oi) => <Pill key={o} type="radio" name={`q${qi + 1}`} block checked={a[qi] === oi} onChange={() => setA(a.map((v, j) => (j === qi ? oi : v)))}>{o}</Pill>)}</div>
          </fieldset>
        ))}
      </div>
      <Result label="Your maturity score" disclaimer={devopsAssessment.disclaimer}>
        <div className="relative mx-auto my-6 h-[180px] w-[180px]">
          <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90" aria-hidden>
            <defs><linearGradient id="ring-g" x1="0" x2="1"><stop offset="0" stopColor="#C9A24B" /><stop offset="1" stopColor="#F2DA8C" /></linearGradient></defs>
            <circle cx="75" cy="75" r="64" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
            <circle cx="75" cy="75" r="64" fill="none" stroke="url(#ring-g)" strokeWidth="10" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - score / devopsAssessment.max)} style={{ transition: "stroke-dashoffset .7s cubic-bezier(.16,1,.3,1)" }} />
          </svg>
          <p className="absolute inset-0 grid place-content-center text-center"><b className="font-display text-[56px] leading-none">{score}</b><small className="mono text-[12px] text-mid">/ {devopsAssessment.max}</small></p>
        </div>
        <p className="h3 text-center !text-[30px]"><span className="grad-text">{band.name}</span></p>
        <p className="muted mt-3 text-center text-[15.5px]">{band.sub}</p>
        <div className="mt-5 border-t border-line pt-5">
          <LeadForm kind="devops-assessment" fields={GATE_FIELDS} submit={devopsAssessment.submit} note={devopsAssessment.gateNote} success={devopsAssessment.success}
            extra={() => ({ message: `DevOps maturity assessment — score ${score}/${devopsAssessment.max}, band: ${band.name}.` })}
            onSuccess={() => track("calc_complete", { config: { tool: "devops", score, band: band.name } })} />
        </div>
      </Result>
    </div>
  );
}
