import SceneBox from "@/components/sections/SceneBox";
import { Counter, FaqItem, Marquee } from "@/components/ui/Bits";
import { duration, ease, morph, particleBudget, stagger } from "@/lib/motion";
import type { SceneKey } from "@/lib/gl-store";

export const metadata = { title: "Lab — design system & 3D scenes", robots: { index: false, follow: false } };

const SCENES: { key: SceneKey; note: string; props?: Record<string, unknown> }[] = [
  { key: "codeSplit", note: "One codebase → iOS + Android" }, { key: "nodeGraph", note: "MERN node graph with packets" }, { key: "neural", note: "Neural sphere (displacement shader)" },
  { key: "globe", note: "Markets globe with arcs", props: { orbit: true } }, { key: "exploded", note: "Exploded phone layers (scroll)" }, { key: "cloud", note: "Cloud diorama (scroll → cost needle)" },
  { key: "constellation", note: "AI idea constellation" }, { key: "calcPhone", note: "Calculator chassis (modules snap on in the tool)" }, { key: "booklet", note: "8-page booklet (scroll)" },
  { key: "orb", note: "Message orb + paper plane" }, { key: "vault", note: "FinTech vault" }, { key: "shelf", note: "Retail shelf + checklist" }, { key: "city", note: "Ride-hailing city grid" }, { key: "ledger", note: "HR pin, scanner, ledger" },
  { key: "browser", note: "WordPress browser blocks" }, { key: "pods", note: "Hire pods" }, { key: "blocks", note: "MVP tier blocks" }, { key: "astronaut", note: "404 phone" }, { key: "pages", note: "Blog pages" },
  { key: "device", note: "Case-study device", props: { screens: ["/assets/portfolio/creator-marketplace-1.webp", "/assets/portfolio/retail-ops-1.webp"] } }, { key: "portal", note: "CTA portal" },
];
const SWATCH = ["--bg-0", "--bg-1", "--bg-2", "--text-hi", "--text-mid", "--text-lo", "--accent", "--accent-ink", "--accent-2", "--accent-3", "--success", "--danger"];

/** /lab — every 3D scene and core component in isolation (noindex). The hero, pipeline and carousel scenes are scroll/drag driven and live on the home page. */
export default function Lab() {
  return (
    <div className="wrap pb-24 pt-[calc(var(--nav-h)+72px)]">
      <p className="eyebrow">Internal</p>
      <h1 className="h1 mt-4">Lab</h1>
      <p className="lead mt-4">Design tokens, motion presets, components and every 3D scene. Each scene falls back to its static poster when WebGL is unavailable or “Reduce motion” is on.</p>

      <h2 className="h2 mt-20">Tokens</h2>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{SWATCH.map((v) => <li key={v} className="glass p-3"><span className="block h-14 rounded-xl border border-line" style={{ background: `var(${v})` }} /><code className="mono mt-2 block text-[12px] text-mid">{v}</code></li>)}</ul>

      <h2 className="h2 mt-20">Type</h2>
      <div className="mt-8 grid gap-6"><p className="display">Display</p><p className="h1">Heading one</p><p className="h2">Heading two</p><p className="h3">Heading three</p><p className="lead">Lead paragraph — Inter, 17–21px, 1.55 line height.</p><p className="mono text-accent-2">MONO · 01 · JetBrains Mono</p></div>

      <h2 className="h2 mt-20">Motion presets <span className="mono text-[14px] text-mid">lib/motion.ts</span></h2>
      <pre className="glass mono mt-8 overflow-x-auto p-6 text-[13px] text-mid">{JSON.stringify({ ease, duration, stagger, morph, particleBudget }, null, 2)}</pre>

      <h2 className="h2 mt-20">Components</h2>
      <div className="mt-8 flex flex-wrap items-center gap-3"><button className="btn btn-primary btn-lg" data-magnetic="0.3">Primary (magnetic)</button><button className="btn btn-glass btn-lg">Glass</button><span className="chip">Chip</span><span className="chip on">Chip on</span><span className="font-display text-[48px] font-bold"><Counter value={97} suffix="%" /></span></div>
      <div className="mt-8"><Marquee>{["React Native", "Expo", "TypeScript", "Node.js", "MongoDB", "Next.js", "AWS", "Claude"].map((t) => <span key={t} className="chip !px-5 !py-2.5">{t}</span>)}</Marquee></div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="glass spot p-7" data-reveal style={{ "--i": i } as React.CSSProperties}><span className="step-n">0{i + 1}</span><h3 className="h3 mt-2">Glass card</h3><p className="muted mt-2">Mouse-tracked spotlight and conic hover rim.</p></div>)}</div>
      <div className="mt-8 max-w-[720px] border-t border-line"><FaqItem q="How does the accordion animate?">A CSS grid-row transition on the expo ease — no animation library in the page shell. Instant under reduced motion.</FaqItem><FaqItem q="Keyboard accessible?">Buttons with aria-expanded and labelled regions.</FaqItem></div>

      <h2 className="h2 mt-20">3D scenes</h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SCENES.map((s) => <li key={s.key} className="glass overflow-hidden"><SceneBox scene={s.key} sceneProps={s.props} className="aspect-square w-full" /><p className="border-t border-line p-4 text-[14px]"><code className="mono text-accent-2">{s.key}</code><span className="muted block">{s.note}</span></p></li>)}
      </ul>
    </div>
  );
}
