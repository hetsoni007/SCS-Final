"use client";
/** Inline article demos ported from individual posts (chat demo, tier selector, architecture tabs, …). */
import { useEffect, useRef, useState } from "react";
import { parseInline } from "@/components/ui/Rich";
import { useApp } from "@/components/providers/AppProviders";

const Box = ({ children, label }: { children: React.ReactNode; label?: string }) => <div className="glass not-prose my-8 p-5 text-hi md:p-6" aria-label={label}>{children}</div>;
const Tab = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => <button type="button" aria-pressed={on} onClick={onClick} className={`chip !px-4 !py-2 !font-sans !text-[14px] ${on ? "on" : ""}`}>{children}</button>;
function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null), [seen, setSeen] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold }); io.observe(el); return () => io.disconnect(); }, [threshold]);
  return [ref, seen] as const;
}

/* animated example conversation (loops; static transcript under reduced motion) */
const CHAT = [{ who: "me", t: "What's your refund window?" }, { type: 1 }, { who: "bot", t: "You can request a refund within 30 days of purchase — want me to start one?" }, { who: "me", t: "Yes please" }, { type: 1 }, { who: "bot", t: "Done ✅ Refund initiated. You'll see it in 3–5 business days." }] as const;
export function ChatDemo() {
  const { reduced } = useApp();
  const [ref, seen] = useInView<HTMLDivElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen || reduced) return;
    const s = CHAT[n];
    const t = setTimeout(() => setN(n >= CHAT.length ? 0 : n + 1), n >= CHAT.length ? 3800 : s && "type" in s ? 1100 : s?.who === "me" ? 700 : 1200);
    return () => clearTimeout(t);
  }, [n, seen, reduced]);
  const shown = reduced ? CHAT.filter((s) => "who" in s) : CHAT.slice(0, n).filter((s, i) => "who" in s || i === n - 1);
  const typing = !reduced && n > 0 && n <= CHAT.length && "type" in CHAT[n - 1];
  return (
    <Box label="Example AI chatbot conversation">
      <div ref={ref} className="mx-auto max-w-[420px]">
        <div className="flex items-center gap-3 border-b border-line pb-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-[13px]" aria-hidden>✦</span><span className="text-[14px] font-semibold">Assistant</span><span className="ml-auto text-[12px] text-lo">{typing ? "typing…" : "online"}</span></div>
        <div className="flex min-h-[230px] flex-col gap-2.5 pt-4">
          {shown.map((s, i) => "who" in s ? <p key={i} className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-[14.5px] ${s.who === "me" ? "self-end bg-accent text-white" : "self-start bg-bg-2 text-hi"}`}>{s.t}</p> : <p key={i} className="self-start rounded-2xl bg-bg-2 px-4 py-2.5 text-lo" aria-hidden>• • •</p>)}
        </div>
      </div>
    </Box>
  );
}

const TIER_OPTS: [string, number][] = [["Answer FAQs", 0], ["Answer from my data (RAG)", 1], ["Voice in/out", 1], ["Take actions for the user", 2], ["Handle multiple languages", 1]];
const TIERS = [
  { n: "Tier 1 · Simple FAQ bot", pct: 25, time: "2–3 weeks", eng: "Prompt + chat UI", d: "Conversational answers from a fixed knowledge base. No live data, no actions — fast to ship and a solid way to validate demand." },
  { n: "Tier 2 · Grounded assistant", pct: 55, time: "4–8 weeks", eng: "+ retrieval (RAG)", d: "Answers grounded in your own documents and data via a vector store, with evaluation so it stays accurate. The most common production tier." },
  { n: "Tier 3 · Capable assistant", pct: 80, time: "8–12 weeks", eng: "+ voice / multilingual", d: "Adds voice in/out or multiple languages on top of grounded answers — more UX surface and more testing." },
  { n: "Tier 4 · Advanced / agentic", pct: 100, time: "10+ weeks", eng: "+ tool-calling & actions", d: "The bot takes real actions through your APIs — it's now part chatbot, part agent, with guardrails and human fallback front of mind." },
];
export function TierSelector() {
  const [on, setOn] = useState([true, false, false, false, false]);
  const sum = TIER_OPTS.reduce((s, [, w], i) => s + (on[i] ? w : 0), 0), t = TIERS[sum <= 0 ? 0 : sum <= 1 ? 1 : sum <= 2 ? 2 : 3];
  return (
    <Box label="Chatbot complexity selector">
      <p className="font-display text-[18px] font-semibold">My chatbot needs to…</p>
      <div className="mt-3 flex flex-wrap gap-2">{TIER_OPTS.map(([l], i) => <Tab key={l} on={on[i]} onClick={() => setOn(on.map((v, j) => (j === i ? !v : v)))}>{l}</Tab>)}</div>
      <div className="mt-5" aria-live="polite">
        <span className="block h-1.5 overflow-hidden rounded-full bg-white/10"><i className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${t.pct}%`, background: "var(--grad)" }} /></span>
        <p className="font-display mt-4 text-[20px] font-semibold">{t.n}</p>
        <p className="mt-1 flex flex-wrap gap-4 text-[14px] text-mid"><span>⏱ <b className="text-hi">{t.time}</b></span><span>🔧 <b className="text-hi">{t.eng}</b></span></p>
        <p className="mt-2 text-[15px] text-mid">{t.d}</p>
      </div>
    </Box>
  );
}

const ARCH: Record<string, { label: string; txt: string; chips: [string, string][]; lit: string[] }> = {
  device: { label: "On-device", txt: "The model lives <b>inside the app binary</b> and runs on the phone's own chip. No request ever leaves the device.", chips: [["Latency", "Instant, no round-trip"], ["Privacy", "Data never leaves device"], ["Cost", "$0 per call"], ["Offline", "Fully offline"]], lit: ["device"] },
  cloud: { label: "Cloud API", txt: "The app calls <b>your backend</b>, which calls a frontier model in the cloud and streams the answer back. Most capable, needs a connection.", chips: [["Latency", "Network round-trip"], ["Privacy", "Leaves device (your control)"], ["Cost", "Per-token"], ["Offline", "Needs connection"]], lit: ["cloud"] },
  hybrid: { label: "Hybrid", txt: "Cheap, instant work runs <b>on-device</b>; heavy reasoning routes to a <b>cloud model</b>. The default shape for most production AI apps.", chips: [["Latency", "Best of both"], ["Privacy", "Sensitive bits stay local"], ["Cost", "Lower per-token"], ["Offline", "Core works offline"]], lit: ["device", "cloud"] },
};
/** `svg` is the diagram markup from our own content file (content/blog-embeds), passed in by the server. */
export function ArchTabs({ svg }: { svg: string }) {
  const [k, setK] = useState("device"), d = ARCH[k];
  return (
    <Box label="Where the AI model runs">
      <div className="flex flex-wrap gap-2">{Object.entries(ARCH).map(([key, v]) => <Tab key={key} on={k === key} onClick={() => setK(key)}>{v.label}</Tab>)}</div>
      <div className={`legacy-art arch-svg mt-4 ${d.lit.includes("device") ? "" : "dim-device"} ${d.lit.includes("cloud") ? "" : "dim-cloud"}`} dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="rich mt-4 text-[15.5px] text-mid" aria-live="polite">{parseInline(d.txt)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">{d.chips.map(([a, b]) => <div key={a} className="rounded-xl border border-line p-3"><dt className="text-[12px] text-lo">{a}</dt><dd className="text-[14px]">{b}</dd></div>)}</dl>
    </Box>
  );
}

const DM: Record<string, { label: string; pick: string; why: string }> = {
  privacy: { label: "Data privacy", pick: "On-device", why: "When data <b>can't legally or ethically leave the phone</b> — health, finance, legal — on-device makes privacy an architectural guarantee, not a policy promise." },
  offline: { label: "Works offline", pick: "On-device", why: "Inference runs locally, so the feature <b>keeps working with no signal</b> — ideal for field tools, travel and low-connectivity markets." },
  cost: { label: "Low per-call cost", pick: "On-device", why: "There's <b>no per-call API fee</b>: the model runs on the user's hardware, so cost stays flat whether a feature is used once or a million times a day." },
  capability: { label: "Max capability", pick: "Cloud", why: "For the <b>hardest reasoning and broadest knowledge</b>, a frontier cloud model behind your backend beats anything small enough to run on a phone." },
  context: { label: "Huge context", pick: "Cloud", why: "Very large context windows need cloud models. Keep the key on your <b>backend proxy</b> and stream the result — see our LLM integration guide." },
};
export function DecisionHelper() {
  const [k, setK] = useState("privacy");
  return (
    <Box label="On-device vs cloud decision helper">
      <p className="font-display text-[18px] font-semibold">What matters most for this feature?</p>
      <div className="mt-3 flex flex-wrap gap-2">{Object.entries(DM).map(([key, v]) => <Tab key={key} on={k === key} onClick={() => setK(key)}>{v.label}</Tab>)}</div>
      <div className="mt-4" aria-live="polite"><span className="chip on">{DM[k].pick}</span><p className="rich mt-3 text-[15.5px] text-mid">{parseInline(DM[k].why)}</p></div>
    </Box>
  );
}

const KT = {
  direct: { tab: "Direct from app", good: false, label: "✗ Insecure", flow: "app  →  🤖 LLM API   (key inside the app)", pts: ["Your provider key ships inside the binary — extractable with standard tools.", "Anyone can lift it and run up your bill on your account.", "No rate limiting, no abuse protection, no caching.", "Switching providers or models means a new app-store release."] },
  proxy: { tab: "Via your backend", good: true, label: "✓ Production-ready", flow: "app  →  🛡 your backend  →  🤖 LLM API", pts: ["The key lives on your server and never reaches the device.", "Add auth, per-user rate limits and caching in one place.", "Swap providers, models or prompts without shipping an update.", "One endpoint to monitor for cost, latency and abuse."] },
};
export function KeyToggle() {
  const [k, setK] = useState<keyof typeof KT>("direct"), d = KT[k];
  return (
    <Box label="API key placement">
      <div className="flex flex-wrap gap-2">{(Object.keys(KT) as (keyof typeof KT)[]).map((key) => <Tab key={key} on={k === key} onClick={() => setK(key)}>{KT[key].tab}</Tab>)}</div>
      <div className="mt-4" aria-live="polite">
        <span className={`chip ${d.good ? "!border-success !text-success" : "!border-danger !text-danger"}`}>{d.label}</span>
        <p className="mono mt-3 whitespace-pre-wrap rounded-xl border border-line bg-bg-0/50 p-3 text-[13.5px]">{d.flow}</p>
        <ul className="mt-3 grid gap-2 text-[15px] text-mid">{d.pts.map((p) => <li key={p} className="flex gap-2.5"><span className={d.good ? "text-success" : "text-danger"} aria-hidden>{d.good ? "✓" : "✗"}</span>{p}</li>)}</ul>
      </div>
    </Box>
  );
}

const STREAM = "Yes — streaming makes the wait feel instant. The model sends tokens as it generates them, and the app appends each one to the screen, so words appear in real time instead of after a long, frozen pause.";
function Typer({ reduced }: { reduced: boolean }) {
  const [i, setI] = useState(reduced ? STREAM.length : 0);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((x) => { if (x >= STREAM.length) { clearInterval(t); return x; } return x + 1; }), 26);
    return () => clearInterval(t);
  }, [reduced]);
  return <p aria-hidden className="mt-3 min-h-[5.2em] text-[16px] leading-relaxed">{STREAM.slice(0, i)}{i < STREAM.length && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-accent-2" />}</p>;
}
export function StreamDemo() {
  const { reduced } = useApp();
  const [ref, seen] = useInView<HTMLDivElement>(0.4);
  const [run, setRun] = useState(0);
  return (
    <Box>
      <div ref={ref} className="flex items-center justify-between gap-4"><span className="text-[13px] text-lo">Streamed — tokens as they generate</span><button type="button" className="chip" onClick={() => setRun((r) => r + 1)}>▶ Replay</button></div>
      {/* full text is always present for assistive tech; the visual types it out (remounting restarts it) */}
      <p className="sr-only">{STREAM}</p>
      {seen ? <Typer key={run} reduced={reduced} /> : <p aria-hidden className="mt-3 min-h-[5.2em]" />}
    </Box>
  );
}
