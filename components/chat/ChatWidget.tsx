"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import { waHref } from "@/lib/whatsapp";
import { inquiry } from "@/content/inquiry";

type Msg = { role: "user" | "assistant"; content: string };
const STARTERS = ["How does the 48-hour proposal work?", "Who owns the code?", "What happens after launch?"];
const MAX_USER_TURNS = 8;

/** Assistant on /app-quote (Phase 3). Server side lives in backend/chat; this only talks to that endpoint. */
export default function ChatWidget() {
  const [msgs, setMsgs] = useState<Msg[]>([]), [input, setInput] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [lead, setLead] = useState<"" | "form" | "sent">(""), [leadErr, setLeadErr] = useState("");
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [msgs, lead]);
  const turns = msgs.filter((m) => m.role === "user").length;

  async function post(body: object) {
    if (!inquiry.chatEndpoint) throw new Error("Chat isn’t connected in this build.");
    const r = await fetch(inquiry.chatEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(25_000) });
    if (!r.ok) throw new Error(r.status === 429 ? "The assistant is busy right now. WhatsApp Het instead." : "The assistant is unavailable. WhatsApp Het instead.");
    return r.json();
  }
  async function ask(q: string) {
    const text = q.trim();
    if (!text || busy || turns >= MAX_USER_TURNS) return;
    setError(""); setInput(""); setBusy(true);
    const history: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(history);
    track("cta_click", { location: "chat", label: "ask" });
    try {
      const j = await post({ action: "chat", messages: history });
      setMsgs([...history, { role: "assistant", content: String(j.reply ?? "") }]);
      if (turns + 1 >= 2 && !lead) setLead("form");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget), v = (k: string) => String(f.get(k) ?? "").trim();
    if (!v("name") || (!v("whatsapp") && !v("email")) || !f.get("consent")) { setLeadErr("Add your name, a WhatsApp number or email, and tick the box."); return; }
    setLeadErr("");
    try {
      await post({ action: "handoff", messages: msgs, name: v("name"), whatsapp: v("whatsapp"), email: v("email"), consent: true, utm_campaign: getAttribution().utm_campaign ?? "", page: location.pathname });
      setLead("sent"); track("generate_lead", { form: "chat", page_path: location.pathname });
    } catch (er) { setLeadErr((er as Error).message); }
  }

  return (
    <div className="glass mx-auto max-w-[760px] p-5 md:p-7" data-loc="chat">
      <div ref={log} role="log" aria-live="polite" className="max-h-[320px] space-y-3 overflow-y-auto pr-1" data-lenis-prevent>
        {msgs.length === 0 && <div className="flex flex-wrap gap-2">{STARTERS.map((s) => <button key={s} type="button" onClick={() => ask(s)} className="chip">{s}</button>)}</div>}
        {msgs.map((m, i) => <p key={i} className={`rounded-2xl px-4 py-2.5 text-[15px] ${m.role === "user" ? "ml-8 bg-white/5 text-hi" : "mr-8 border border-line text-mid"}`}><span className="sr-only">{m.role === "user" ? "You: " : "Assistant: "}</span>{m.content}</p>)}
        {busy && <p className="text-[14px] text-lo" role="status">Thinking…</p>}
      </div>
      {error && <p role="alert" className="mt-3 text-[14px] text-danger">{error}</p>}
      {turns < MAX_USER_TURNS ? (
        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="mt-4 flex gap-2">
          <label htmlFor="chat-in" className="sr-only">Your question</label>
          <input id="chat-in" className="field" value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Ask about the process, ownership, timeline…" />
          <button className="btn btn-primary" disabled={busy}>Ask</button>
        </form>
      ) : <p className="mt-4 text-[14px] text-mid">That’s the limit for this chat — leave your details below or WhatsApp Het.</p>}
      {lead === "form" && (
        <form onSubmit={send} className="mt-5 grid gap-3 border-t border-line pt-4">
          <p className="text-[15px] text-hi">Want Het to send your fixed-price proposal?</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label htmlFor="c-n" className="label">Name</label><input id="c-n" name="name" className="field" autoComplete="name" maxLength={100} /></div>
            <div><label htmlFor="c-w" className="label">WhatsApp</label><input id="c-w" name="whatsapp" type="tel" className="field" autoComplete="tel" maxLength={30} /></div>
            <div><label htmlFor="c-e" className="label">or email</label><input id="c-e" name="email" type="email" className="field" autoComplete="email" maxLength={200} /></div>
          </div>
          <label className="flex items-start gap-3 text-[13.5px] text-mid"><input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[var(--accent)]" />I agree to Soni Consultancy Services storing these details and this chat to reply to me. No newsletter, no sharing.</label>
          {leadErr && <p role="alert" className="text-[13px] text-danger">{leadErr}</p>}
          <button className="btn btn-primary w-fit">Send to Het →</button>
        </form>
      )}
      {lead === "sent" && <p role="status" className="mt-5 text-hi">Thanks — Het has this chat and will reply {inquiry.replyPromise}.</p>}
      <p className="mt-4 text-[13px] text-lo">AI assistant answering from this site only; it can’t quote prices or dates. Prefer a person? <a href={waHref()} data-wa target="_blank" rel="noopener" className="underline text-hi">Continue on WhatsApp</a></p>
    </div>
  );
}
