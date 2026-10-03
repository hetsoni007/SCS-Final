"use client";
/**
 * Interactive blog widgets, rebuilt as reusable components. Scoring logic mirrors the live site's
 * scripts exactly; questions/weights/verdicts come from content/widgets/<post-slug>.json.
 *   <DecisionTool>   — weighted quiz with result breakdown bars   (quiz)
 *   <DecisionWizard> — weighted questions → single recommendation (wizard)
 *   <ComplianceScore>— tick-list readiness score with bands       (checklist)
 *   <Checklist>      — Yes/Partly/No self-audit out of 100        (audit)
 *   <CostCalculator> — slider-driven calculators                  (custom)
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { track } from "@/lib/analytics";
import { parseInline } from "@/components/ui/Rich";

type Cta = { label: string; href: string; primary?: boolean };
export function Shell({ kick, children }: { kick: string; children: ReactNode }) {
  return (
    <div className="glass not-prose my-8 p-6 md:p-8" aria-live="polite">
      <p className="mono text-[11px] uppercase tracking-widest text-accent-2">{kick.replace(/^✦\s*/, "✦ ")}</p>
      <div className="mt-5 text-hi">{children}</div>
    </div>
  );
}
const Bar = ({ pct }: { pct: number }) => <span className="block h-1.5 overflow-hidden rounded-full bg-white/10"><i className="block h-full rounded-full transition-[width] duration-700 ease-[var(--ease-expo)]" style={{ width: `${pct}%`, background: "var(--grad)" }} /></span>;
const CtaRow = ({ ctas }: { ctas: Cta[] }) => (
  <div className="mt-6 flex flex-wrap gap-3">{ctas.map((c, i) => <a key={c.href + i} href={c.href} className={`btn ${c.primary ?? i === 0 ? "btn-primary" : "btn-glass"}`} data-cta>{c.label}</a>)}</div>
);
const Opt = ({ children, onClick, small }: { children: ReactNode; onClick: () => void; small?: string }) => (
  <button type="button" onClick={onClick} className="rounded-2xl border border-line-strong bg-bg-0/40 px-5 py-3.5 text-left text-[15.5px] transition-colors hover:border-accent hover:bg-accent/10">
    {children}{small && <small className="mt-0.5 block text-[13px] text-lo">{small}</small>}
  </button>
);

/* ───── quiz ───── */
type QuizData = { kick: string; keys: string[]; badge: string; cta: Cta; results: Record<string, { label: string; name: string; why: string; note: string }>; questions: { q: string; a: { t: string; s?: string; w?: Record<string, number> }[] }[] };
export function DecisionTool({ data, title }: { data: QuizData; title: string }) {
  const [picks, setPicks] = useState<number[]>([]);
  const i = picks.length, Q = data.questions, done = i >= Q.length;
  const score = useMemo(() => { const s: Record<string, number> = {}; data.keys.forEach((k) => (s[k] = 0)); picks.forEach((n, qi) => Object.entries(Q[qi].a[n].w ?? {}).forEach(([k, v]) => (s[k] += v))); return s; }, [picks, Q, data.keys]);
  const max = [...data.keys].sort((a, b) => score[b] - score[a])[0];
  const total = data.keys.reduce((s, k) => s + Math.max(0, score[k]), 0) || 1;
  useEffect(() => { if (done) track("cta_click", { location: "tool_complete", label: `${title.slice(0, 60)}: ${max}` }); }, [done, max, title]);
  return (
    <Shell kick={data.kick}>
      <Bar pct={done ? 100 : (i / Q.length) * 100} />
      {!done ? (
        <div className="mt-6">
          <p className="font-display text-[22px] font-semibold">{Q[i].q}</p>
          <div className="mt-4 grid gap-2.5">{Q[i].a.map((o, n) => <Opt key={o.t} small={o.s} onClick={() => setPicks([...picks, n])}>{o.t}</Opt>)}</div>
          <div className="mt-5 flex items-center justify-between text-[13.5px] text-lo"><span>Question {i + 1} of {Q.length}</span>{i > 0 && <button type="button" className="underline underline-offset-4 hover:text-hi" onClick={() => setPicks(picks.slice(0, -1))}>← Back</button>}</div>
        </div>
      ) : (
        <div className="mt-6">
          <span className="chip on">{data.badge}</span>
          <h3 className="font-display mt-3 text-[26px] font-semibold leading-tight">{data.results[max].name}</h3>
          <p className="mt-3 text-[16px] leading-relaxed text-mid">{data.results[max].why}</p>
          <div className="mt-5 grid gap-3">{data.keys.map((k) => { const pct = Math.round((Math.max(0, score[k]) / total) * 100); return (
            <div key={k} className="grid grid-cols-[minmax(0,150px)_1fr_44px] items-center gap-3 text-[14px]"><span className="text-mid">{data.results[k].label}</span><Bar pct={pct} /><span className="text-right text-mid">{pct}%</span></div>); })}</div>
          <p className="mt-5 text-[13.5px] leading-relaxed text-lo">{data.results[max].note}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4"><CtaRow ctas={[{ ...data.cta, primary: true }]} /><button type="button" className="mt-6 text-[14px] text-mid underline underline-offset-4 hover:text-hi" onClick={() => setPicks([])}>Start over</button></div>
        </div>
      )}
    </Shell>
  );
}

/* ───── wizard ───── */
type WizardData = { kick: string; badge: string; ctas: Cta[]; barLabels?: Record<string, string>; questions: { q: string; a: { t: string; s: Record<string, number> }[] }[]; verdicts: Record<string, { name: string; why: string; l?: Record<string, string> }> };
export function DecisionWizard({ data }: { data: WizardData }) {
  const [picks, setPicks] = useState<number[]>([]);
  const Q = data.questions, i = picks.length, done = i >= Q.length;
  const keys = Object.keys(data.verdicts);
  const tot = useMemo(() => { const t: Record<string, number> = {}; keys.forEach((k) => (t[k] = 0)); picks.forEach((n, qi) => Object.entries(Q[qi].a[n].s).forEach(([k, v]) => (t[k] = (t[k] ?? 0) + v))); return t; }, [picks, Q, keys]);
  const win = [...keys].sort((a, b) => tot[b] - tot[a])[0], v = data.verdicts[win];
  const maxScore = Math.max(...keys.map((k) => tot[k])) || 1;
  useEffect(() => { if (done) track("cta_click", { location: "decision_tool_result", label: win }); }, [done, win]);
  return (
    <Shell kick={data.kick}>
      <Bar pct={done ? 100 : (i / Q.length) * 100} />
      {!done ? (
        <div className="mt-6">
          <p className="font-display text-[22px] font-semibold">{Q[i].q}</p>
          <div className="mt-4 grid gap-2.5">{Q[i].a.map((o, n) => <Opt key={o.t} onClick={() => setPicks([...picks, n])}>{o.t}</Opt>)}</div>
          <div className="mt-5 flex items-center justify-between text-[13.5px] text-lo"><button type="button" className={`underline underline-offset-4 hover:text-hi ${i ? "" : "invisible"}`} onClick={() => setPicks(picks.slice(0, -1))}>← Back</button><span>Question {i + 1} of {Q.length}</span></div>
        </div>
      ) : (
        <div className="mt-6">
          <span className="chip on">{data.badge}</span>
          <h3 className="font-display mt-3 text-[26px] font-semibold leading-tight">{v.name}</h3>
          <p className="mt-3 text-[15.5px] leading-relaxed text-mid">{v.why}</p>
          {v.l && <dl className="mt-5 grid gap-2">{Object.entries(v.l).map(([k, val]) => <div key={k} className="flex justify-between gap-4 rounded-xl border border-line px-4 py-3 text-[14.5px]"><dt className="text-lo">{k}</dt><dd className="text-right">{val}</dd></div>)}</dl>}
          {data.barLabels && <div className="mt-5 grid gap-3">{Object.keys(data.barLabels).map((k) => { const pct = Math.round((tot[k] / maxScore) * 100); return <div key={k} className="grid grid-cols-[minmax(0,130px)_1fr_44px] items-center gap-3 text-[14px]"><span className="text-mid">{data.barLabels![k]}</span><Bar pct={pct} /><span className="text-right text-mid">{pct}%</span></div>; })}</div>}
          <CtaRow ctas={data.ctas} />
          <button type="button" className="mt-4 text-[14px] text-mid underline underline-offset-4 hover:text-hi" onClick={() => setPicks([])}>↺ Start over</button>
        </div>
      )}
    </Shell>
  );
}

/* ───── checklist score ───── */
type ChecklistData = { kick: string; footnote: string; items: { t: string; s: string }[]; bands: { min: number; t: string; d: string }[] };
export function ComplianceScore({ data }: { data: ChecklistData }) {
  const [on, setOn] = useState<boolean[]>(data.items.map(() => false));
  const done = on.filter(Boolean).length, n = data.items.length, pct = Math.round((done / n) * 100);
  const band = data.bands.find((b) => pct >= b.min)!;
  return (
    <Shell kick={data.kick}>
      <Bar pct={pct} />
      <ul className="mt-5 grid gap-2">
        {data.items.map((it, i) => (
          <li key={it.t}>
            <label className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border px-4 py-3.5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-2 ${on[i] ? "border-accent bg-accent/10" : "border-line-strong bg-bg-0/40"}`}>
              <input type="checkbox" className="sr-only" checked={on[i]} onChange={() => setOn(on.map((v, j) => (j === i ? !v : v)))} />
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${on[i] ? "border-transparent bg-accent text-white" : "border-line-strong"}`} aria-hidden>{on[i] && <Check size={14} strokeWidth={3} />}</span>
              <span className="text-[15.5px]">{it.t}<small className="mt-0.5 block text-[13px] text-lo">{it.s}</small></span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-2xl border border-line bg-bg-0/50 p-5">
        <p className="font-display text-[48px] font-bold leading-none"><span className="grad-text">{pct}</span><span className="text-[.42em] text-mid">/100</span></p>
        <p className="mt-3 font-semibold">{band.t}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-mid">{band.d}</p>
        <p className="mt-3 text-[13px] text-lo">{done} of {n} controls in place</p>
      </div>
      <p className="mt-4 text-[13px] text-lo">{data.footnote}</p>
    </Shell>
  );
}

/* ───── self-audit ───── */
type AuditData = { kick: string; ctas: Cta[]; items: { t: string; d: string }[]; options: [string, number][]; verdicts: { min: number; title: string; text: string }[] };
export function Checklist({ data }: { data: AuditData }) {
  const [ans, setAns] = useState<(number | null)[]>(data.items.map(() => null));
  const n = data.items.length, done = ans.filter((a) => a !== null).length;
  const pts = ans.reduce<number>((s, a) => s + (a ?? 0), 0), pct = Math.round((pts / (n * 2)) * 100), complete = done === n;
  const v = data.verdicts.find((x) => pct >= x.min)!;
  useEffect(() => { if (complete) track("cta_click", { location: "audit_result", label: String(pct) }); }, [complete, pct]);
  return (
    <Shell kick={data.kick}>
      <ol className="grid gap-3">
        {data.items.map((it, i) => (
          <li key={it.t} className="rounded-2xl border border-line bg-bg-0/40 p-4">
            <fieldset>
              <legend className="text-[15.5px] font-medium">{i + 1}. {it.t}</legend>
              <p className="mt-1 text-[13.5px] text-lo">{it.d}</p>
              <div className="mt-3 flex gap-2">{data.options.map(([label, val]) => (
                <label key={label} className={`chip cursor-pointer !px-4 !py-2 !font-sans !text-[13.5px] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-2 ${ans[i] === val ? "on" : ""}`}>
                  <input type="radio" name={`audit-${i}`} className="sr-only" checked={ans[i] === val} onChange={() => setAns(ans.map((a, j) => (j === i ? val : a)))} />{label}
                </label>))}</div>
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-4 text-[13px] text-lo"><span className="font-semibold">{done}/{n} answered</span><Bar pct={done ? pct : 0} /><span className="font-display text-[18px] text-hi">{complete ? `${pct}/100` : done ? "…" : "—"}</span></div>
      {complete && (
        <div className="mt-5 rounded-2xl border border-accent bg-accent/10 p-5">
          <h3 className="font-display text-[22px] font-semibold">{v.title}{pct}/100</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-mid">{v.text}</p>
          <CtaRow ctas={data.ctas} />
        </div>
      )}
    </Shell>
  );
}

/* ───── slider calculators ───── */
type Input = { k: string; l: string; min: number; max: number; step: number; v: number; f: (x: number) => string };
function Slider({ inp, value, onChange }: { inp: Input; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="flex items-baseline justify-between gap-4 text-[14.5px]" aria-hidden><span className="text-mid">{inp.l}</span><b className="font-display text-[17px]">{inp.f(value)}</b></p>
      <input type="range" min={inp.min} max={inp.max} step={inp.step} value={value} aria-label={inp.l} aria-valuetext={inp.f(value)} onChange={(e) => onChange(+e.target.value)} className="mt-2 w-full accent-[var(--accent)]" />
    </div>
  );
}
const en = (x: number) => x.toLocaleString("en-US"), inr = (x: number) => x.toLocaleString("en-IN");
const fmtRev = (n: number) => (n >= 1e7 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `$${Math.round(n / 1e3)}K` : `$${en(Math.round(n))}`);
const MONETIZATION: Record<string, { name: string; fit: string; inputs: Input[]; calc: (v: Record<string, number>) => number }> = {
  sub: { name: "Subscription", fit: "<b>Fits:</b> recurring-value products — tools, content, communities. Revenue compounds with retention; churn is the real battle.",
    inputs: [{ k: "mau", l: "Monthly active users", min: 1000, max: 500000, step: 1000, v: 20000, f: en }, { k: "conv", l: "% of users on a paid plan", min: 0.5, max: 20, step: 0.5, v: 4, f: (x) => `${x}%` }, { k: "price", l: "Monthly price", min: 1, max: 50, step: 1, v: 9, f: (x) => `$${x}` }, { k: "cut", l: "Store cut (in-app billing)", min: 0, max: 30, step: 15, v: 15, f: (x) => `${x}%` }],
    calc: (v) => v.mau * (v.conv / 100) * v.price * (1 - v.cut / 100) },
  iap: { name: "Freemium + IAP", fit: "<b>Fits:</b> apps with a natural 'more' to sell — features, capacity, content. The craft is the free/paid split.",
    inputs: [{ k: "mau", l: "Monthly active users", min: 1000, max: 500000, step: 1000, v: 30000, f: en }, { k: "buy", l: "% of users buying each month", min: 0.5, max: 15, step: 0.5, v: 2.5, f: (x) => `${x}%` }, { k: "avg", l: "Average purchase", min: 1, max: 50, step: 1, v: 6, f: (x) => `$${x}` }, { k: "cut", l: "Store cut (in-app billing)", min: 0, max: 30, step: 15, v: 15, f: (x) => `${x}%` }],
    calc: (v) => v.mau * (v.buy / 100) * v.avg * (1 - v.cut / 100) },
  ads: { name: "Advertising", fit: "<b>Fits:</b> broad, high-frequency consumer apps. The math is honest — without big engaged scale, ads earn pocket change.",
    inputs: [{ k: "mau", l: "Monthly active users", min: 5000, max: 2000000, step: 5000, v: 100000, f: en }, { k: "imp", l: "Ad impressions / user / month", min: 5, max: 300, step: 5, v: 60, f: en }, { k: "ecpm", l: "eCPM (per 1,000 impressions)", min: 0.5, max: 20, step: 0.5, v: 3, f: (x) => `$${x}` }],
    calc: (v) => (v.mau * v.imp) / 1000 * v.ecpm },
  fee: { name: "Commission", fit: "<b>Fits:</b> marketplaces and service platforms — rides, bookings, orders. Scales with transaction volume, needs liquidity.",
    inputs: [{ k: "tx", l: "Transactions / month", min: 100, max: 200000, step: 100, v: 8000, f: en }, { k: "aov", l: "Average order value", min: 2, max: 200, step: 1, v: 18, f: (x) => `$${x}` }, { k: "take", l: "Your take-rate", min: 1, max: 30, step: 0.5, v: 12, f: (x) => `${x}%` }],
    calc: (v) => v.tx * v.aov * (v.take / 100) },
};
const fmtINRk = (n: number) => { n = Math.round(n / 1000) * 1000; return n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${inr(n)}`; };
const WP: Record<string, { name: string; inputs: Input[]; calc: (v: Record<string, number>) => [number, number]; fit: (v: Record<string, number>) => string }> = {
  biz: { name: "Business Website",
    inputs: [{ k: "pages", l: "Number of pages", min: 3, max: 25, step: 1, v: 8, f: (x) => `${x} pages` }, { k: "tier", l: "Design level", min: 0, max: 2, step: 1, v: 0, f: (x) => ["Template-based", "Semi-custom", "Fully custom"][x] }],
    calc: (v) => { const t = [{ base: 22000, per: 2500 }, { base: 45000, per: 4200 }, { base: 95000, per: 7000 }][v.tier]; return [t.base + v.pages * t.per * 0.75, t.base + v.pages * t.per * 1.6]; },
    fit: (v) => `<b>At ${v.pages} pages with ${["a template-based site", "a semi-custom design", "a fully custom design"][v.tier]}:</b> this is a typical range for a business website of this scope in the current India market.` },
  store: { name: "WooCommerce Store",
    inputs: [{ k: "products", l: "Number of products", min: 10, max: 500, step: 10, v: 50, f: inr }, { k: "custom", l: "Custom features (multiple gateways, shipping rules, integrations)", min: 0, max: 1, step: 1, v: 0, f: (x) => (x ? "Yes" : "No, standard setup") }],
    calc: (v) => [65000 + v.products * 450 + (v.custom ? 30000 : 0), 140000 + v.products * 950 + (v.custom ? 70000 : 0)],
    fit: (v) => `<b>At ${inr(v.products)} products${v.custom ? " with custom integrations" : ""}:</b> this reflects typical India pricing for a WooCommerce build of this scope, including payment gateway setup.` },
};
type CustomData = { kick: string; note: string; ctas: Cta[]; cards: { id: string; name: string; sub: string }[]; out: string[] };
function Tabs({ models, cur, set }: { models: Record<string, { name: string }>; cur: string; set: (k: string) => void }) {
  return <div role="tablist" className="flex flex-wrap gap-2">{Object.entries(models).map(([k, m]) => <button key={k} role="tab" aria-selected={cur === k} type="button" className={`chip !px-4 !py-2 !font-sans !text-[14px] ${cur === k ? "on" : ""}`} onClick={() => set(k)}>{m.name}</button>)}</div>;
}
const OutCard = ({ k, v }: { k: string; v: string }) => <div className="rounded-2xl border border-line bg-bg-0/50 p-5"><p className="text-[13px] text-lo">{k}</p><p className="font-display mt-1 text-[34px] font-bold leading-none"><span className="grad-text">{v}</span></p></div>;
const defaults = (inputs: Input[]) => Object.fromEntries(inputs.map((i) => [i.k, i.v]));

export function CostCalculator({ slug, data }: { slug: string; data: CustomData }) {
  const models = slug === "app-monetization-models" ? MONETIZATION : slug === "wordpress-website-cost-india" ? WP : null;
  const [cur, setCur] = useState(models ? Object.keys(models)[0] : "");
  const [vals, setVals] = useState<Record<string, number>>(models ? defaults(models[Object.keys(models)[0]].inputs) : { mau: 10000, vol: 300000, aov: 1200 });
  const pick = (k: string) => { setCur(k); setVals(defaults(models![k].inputs)); };
  if (slug === "app-monetization-models") {
    const m = MONETIZATION[cur], mo = m.calc(vals);
    return (<Shell kick={data.kick}><Tabs models={MONETIZATION} cur={cur} set={pick} />
      <div className="mt-5 grid gap-4">{m.inputs.map((inp) => <Slider key={cur + inp.k} inp={inp} value={vals[inp.k]} onChange={(v) => setVals({ ...vals, [inp.k]: v })} />)}</div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><OutCard k={data.out[0]} v={fmtRev(mo)} /><OutCard k={data.out[1]} v={fmtRev(mo * 12)} /></div>
      <p className="rich mt-4 text-[14.5px] text-mid">{parseInline(m.fit)}</p><p className="mt-2 text-[13px] text-lo">Defaults are editable assumptions, not benchmarks — drag every slider to your own numbers.</p><CtaRow ctas={data.ctas} /></Shell>);
  }
  if (slug === "wordpress-website-cost-india") {
    const m = WP[cur], r = m.calc(vals);
    return (<Shell kick={data.kick}><Tabs models={WP} cur={cur} set={pick} />
      <div className="mt-5 grid gap-4">{m.inputs.map((inp) => <Slider key={cur + inp.k} inp={inp} value={vals[inp.k]} onChange={(v) => setVals({ ...vals, [inp.k]: v })} />)}</div>
      <div className="mt-5"><OutCard k={data.out[0]} v={`${fmtINRk(r[0])} – ${fmtINRk(r[1])}`} /></div>
      <p className="rich mt-4 text-[14.5px] text-mid">{parseInline(m.fit(vals))}</p><p className="mt-2 text-[13px] text-lo">Drag the sliders to match your project — this is a market-range estimate, not our quote.</p><CtaRow ctas={data.ctas} /></Shell>);
  }
  // provider fee comparisons
  const push = slug === "react-native-push-notifications";
  const fmtUSD = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  const fmtINR = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")}L` : `₹${inr(Math.round(n))}`);
  let fees: Record<string, number>, shown: Record<string, string>, win: string;
  if (push) {
    const v = vals.mau, os = v <= 1000 ? 0 : 19 + v * 0.012;
    fees = { gc_fcm: 0, gc_os: os }; shown = { gc_fcm: "Free", gc_os: os === 0 ? "Free" : `${fmtUSD(os)}/mo` }; win = 0 <= os ? "gc_fcm" : "gc_os";
  } else {
    const v = vals.vol; fees = { gc_rz: v * 0.02, gc_cf: v * 0.0195, gc_pu: v * 0.02 + 4999 / 12 };
    shown = Object.fromEntries(Object.entries(fees).map(([k, f]) => [k, `${fmtINR(f)}/mo`])); win = Object.keys(fees).sort((a, b) => fees[a] - fees[b])[0];
  }
  const inputs: Input[] = push ? [{ k: "mau", l: "Monthly active users", min: 500, max: 200000, step: 500, v: 10000, f: en }]
    : [{ k: "vol", l: "Monthly sales volume", min: 50000, max: 5000000, step: 50000, v: 300000, f: fmtINR }, { k: "aov", l: "Average order value", min: 200, max: 10000, step: 100, v: 1200, f: (x) => `₹${inr(x)}` }];
  return (<Shell kick={data.kick}>
    <div className="grid gap-4">{inputs.map((inp) => <Slider key={inp.k} inp={inp} value={vals[inp.k]} onChange={(v) => setVals({ ...vals, [inp.k]: v })} />)}</div>
    <div className={`mt-5 grid gap-3 ${data.cards.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>{data.cards.map((c) => (
      <div key={c.id} className={`relative rounded-2xl border p-5 ${win === c.id ? "border-accent bg-accent/10" : "border-line bg-bg-0/50"}`}>
        <p className="text-[14px] font-semibold">{c.name}</p><p className="font-display mt-1 text-[28px] font-bold leading-none">{shown[c.id]}</p>
        <p className="rich mt-2 text-[12.5px] leading-snug text-lo">{parseInline(c.sub)}</p>{win === c.id && <span className="chip on mt-3">Lowest cost</span>}
      </div>))}</div>
    <p className="mt-4 text-[13px] text-lo">{data.note}</p><CtaRow ctas={data.ctas} /></Shell>);
}
