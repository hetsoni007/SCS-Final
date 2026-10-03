"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { site } from "@/content/site";

type Msg = { role: "user" | "assistant"; content: string };
const MAX_TURNS = 6;
const STARTERS = ["Does my marketplace idea need AI at all?", "What should an MVP for a fitness app include?", "React Native or native for a booking app?"];

/** Optional live demo on the AI page. Rendered only when NEXT_PUBLIC_ASSISTANT_ENABLED === "true". */
export default function AssistantDemo() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ctl = useRef<AbortController | null>(null), log = useRef<HTMLDivElement>(null);
  useEffect(() => () => ctl.current?.abort(), []);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [msgs]);

  const turns = msgs.filter((m) => m.role === "user").length, capped = turns >= MAX_TURNS;
  async function ask(q: string) {
    const text = q.trim();
    if (!text || busy || capped) return;
    setError(""); setInput(""); setBusy(true);
    const history: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    track("cta_click", { location: "assistant", label: "ask" });
    const set = (fn: (prev: string) => string) => setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content: fn(x.content) } : x)));
    try {
      ctl.current = new AbortController();
      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }), signal: ctl.current.signal });
      if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? "The assistant is unavailable right now."); }
      const reader = res.body.getReader(), dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const l of lines) {
          if (!l) continue;
          const ev = JSON.parse(l) as { t: string; v?: string; truncated?: boolean };
          if (ev.t === "delta") set((p) => p + (ev.v ?? ""));
          else if (ev.t === "reset") set(() => "");
          else if (ev.t === "refusal") set(() => "I can't help with that one here. For anything about your app idea, the free call is the best next step.");
          else if (ev.t === "error") { setError(ev.v ?? "Something went wrong."); setMsgs((m) => (m.at(-1)?.content ? m : m.slice(0, -1))); }
          else if (ev.t === "done" && ev.truncated) set((p) => p + " …");
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") { setError((e as Error).message); setMsgs((m) => (m.at(-1)?.content ? m : m.slice(0, -1))); }
    } finally { setBusy(false); }
  }

  return (
    <section className="section !pt-0" data-loc="assistant" aria-labelledby="assistant-h">
      <div className="wrap">
        <div className="glass spot mx-auto max-w-[860px] p-6 md:p-9">
          <p className="eyebrow">Live demo · Claude inside</p>
          <h2 id="assistant-h" className="h3 mt-3 !text-[clamp(24px,3vw,34px)]">Ask about your app idea</h2>
          <p className="muted mt-2 text-[15px]">A small assistant running on our own stack. Answers are AI-generated and can be wrong — it is a demo, not a quote. Please don&apos;t share confidential details.</p>
          <div ref={log} role="log" aria-live="polite" aria-label="Conversation" className="mt-5 flex max-h-[360px] min-h-[120px] flex-col gap-3 overflow-y-auto rounded-2xl border border-line bg-bg-0/50 p-4" data-lenis-prevent>
            {msgs.length === 0 && <p className="dim m-auto text-center">Try one of the starters below, or describe what you want to build.</p>}
            {msgs.map((m, i) => <p key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${m.role === "user" ? "self-end bg-accent text-white" : "self-start bg-bg-2 text-hi"}`}>{m.content || (busy ? "…" : "")}</p>)}
          </div>
          {msgs.length === 0 && <div className="mt-4 flex flex-wrap gap-2">{STARTERS.map((s) => <button key={s} type="button" className="chip !whitespace-normal !text-left" onClick={() => ask(s)}>{s}</button>)}</div>}
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
            <label className="sr-only" htmlFor="assistant-q">Your question</label>
            <input id="assistant-q" className="field" value={input} onChange={(e) => setInput(e.target.value)} maxLength={600} placeholder={capped ? "That's the demo limit — book a call to keep going" : "What are you thinking of building?"} disabled={busy || capped} autoComplete="off" />
            <button type="submit" className="btn btn-primary shrink-0" disabled={busy || capped || !input.trim()}>{busy ? "Thinking…" : "Ask"}</button>
          </form>
          <div aria-live="assertive">{error && <p className="mt-3 text-[14px] text-danger">{error}</p>}</div>
          <p className="dim mt-4">Want a real answer for your product? <a href={site.calendly} className="text-accent-2 underline underline-offset-4">Book a free 30-minute call with a senior engineer →</a></p>
        </div>
      </div>
    </section>
  );
}
