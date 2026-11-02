"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import { sendInquiry } from "@/lib/inquiry";
import { BUDGETS, TIMELINES, WHAT, inquiry } from "@/content/inquiry";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const phoneOk = (v: string) => { const d = v.replace(/\D/g, ""); return d.length >= 7 && d.length <= 15 && /^[\d\s()+.-]+$/.test(v); };

/** randomUUID needs a secure context; older browsers and plain-http previews fall back to getRandomValues. */
const uuid = () => typeof crypto.randomUUID === "function" ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16));

/**
 * Two-step inquiry form, used in the sheet and in-page. Step 1 is one tap; step 2 collects contact details.
 * Analytics: form_start (first interaction), form_step1_complete (so abandoned forms show), and form_submit/Lead
 * fire on /thanks, not here (see app/thanks).
 */
export default function InquiryForm({ location }: { location: string }) {
  const id = useId(), router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [what, setWhat] = useState(""), [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const started = useRef(false), hp = useRef<HTMLInputElement>(null), head = useRef<HTMLHeadingElement>(null);
  const onStart = () => { if (started.current) return; started.current = true; track("form_start", { form: "inquiry", location }); };
  useEffect(() => { if (step === 2) head.current?.focus(); }, [step]);

  const next = () => {
    if (!what) { setErrors({ what: "Pick one to continue" }); return; }
    setErrors({}); track("form_step1_complete", { form: "inquiry", location, what }); setStep(2);
  };
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget), v = (k: string) => String(f.get(k) ?? "").trim();
    const er: Record<string, string> = {};
    if (!v("name")) er.name = "Your name is required";
    if (!v("email") && !v("whatsapp")) er.contact = "Add a WhatsApp number or an email";
    if (v("email") && !EMAIL.test(v("email"))) er.email = "Enter a valid email address";
    if (v("whatsapp") && !phoneOk(v("whatsapp"))) er.whatsapp = "Enter a valid number, with country code";
    if (!v("budget")) er.budget = "Choose a budget range";
    if (!f.get("consent")) er.consent = "Please tick the box so we can reply";
    setErrors(er); setError("");
    if (Object.keys(er).length) { e.currentTarget.querySelector<HTMLElement>("[aria-invalid=true]")?.focus(); return; }
    setBusy(true);
    const event_id = uuid();
    const res = await sendInquiry({ what, description: desc, name: v("name"), email: v("email"), whatsapp: v("whatsapp"), budget: v("budget"), timeline: v("timeline"), consent: true, hp: hp.current?.value ?? "", event_id, page: window.location.pathname, location, attribution: getAttribution() });
    if (!res.ok) { setBusy(false); setError(res.error); return; }
    try { sessionStorage.setItem(inquiry.doneKey, JSON.stringify({ event_id, what, budget: v("budget"), location })); } catch {}
    router.push("/thanks/");
  };
  const bad = (k: string) => !!errors[k];

  return (
    <div onFocusCapture={onStart} onPointerDownCapture={onStart}>
      <p className="mono text-[12px] uppercase tracking-[.18em] text-accent-2" aria-live="polite">Step {step} of 2</p>
      {step === 1 ? (
        <div>
          <h3 id={`${id}-q`} className="font-display mt-2 text-[24px] font-semibold tracking-tight md:text-[28px]">What are you building?</h3>
          <div role="radiogroup" aria-labelledby={`${id}-q`} className="mt-4 grid grid-cols-2 gap-2.5">
            {WHAT.map((w) => (
              <button key={w} type="button" role="radio" aria-checked={what === w} onClick={() => { setWhat(w); setErrors({}); }} className="chip !min-h-[52px] !justify-center !text-[15px]" aria-pressed={undefined} data-on={what === w ? "1" : undefined} style={what === w ? { borderColor: "var(--accent)", color: "var(--text-hi)", background: "rgba(201,162,75,.14)" } : undefined}>{w}</button>
            ))}
          </div>
          {errors.what && <p role="alert" className="mt-2 text-[13px] text-danger">{errors.what}</p>}
          <label htmlFor={`${id}-d`} className="label mt-5">One line about it (optional)</label>
          <input id={`${id}-d`} className="field" maxLength={200} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. A booking app for salons" />
          <button type="button" onClick={next} className="btn btn-primary btn-lg mt-5 w-full sm:w-auto" data-cta>Continue →</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-3.5">
          <h3 ref={head} tabIndex={-1} className="font-display mt-2 text-[24px] font-semibold tracking-tight outline-none md:text-[28px]">Where should we send your proposal?</h3>
          <Field id={`${id}-n`} label="Your name" err={errors.name}><input id={`${id}-n`} name="name" className="field" autoComplete="name" maxLength={100} aria-invalid={bad("name")} aria-describedby={bad("name") ? `${id}-n-e` : undefined} /></Field>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field id={`${id}-w`} label="WhatsApp number" err={errors.whatsapp}><input id={`${id}-w`} name="whatsapp" type="tel" inputMode="tel" className="field" autoComplete="tel" placeholder="+91 …" maxLength={30} aria-invalid={bad("whatsapp") || bad("contact")} aria-describedby={bad("whatsapp") ? `${id}-w-e` : undefined} /></Field>
            <Field id={`${id}-e`} label="or email" err={errors.email}><input id={`${id}-e`} name="email" type="email" className="field" autoComplete="email" maxLength={200} aria-invalid={bad("email") || bad("contact")} aria-describedby={bad("email") ? `${id}-e-e` : undefined} /></Field>
          </div>
          <p className="-mt-1 text-[12.5px] text-lo">Either one is fine.</p>
          {errors.contact && <p role="alert" className="-mt-2 text-[13px] text-danger">{errors.contact}</p>}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field id={`${id}-b`} label="Budget" err={errors.budget}>
              <select id={`${id}-b`} name="budget" className="field" defaultValue="" aria-invalid={bad("budget")} aria-describedby={bad("budget") ? `${id}-b-e` : undefined}>
                <option value="" disabled>Select…</option>{BUDGETS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field id={`${id}-t`} label="Timeline (optional)">
              <select id={`${id}-t`} name="timeline" className="field" defaultValue=""><option value="">Select…</option>{TIMELINES.map((b) => <option key={b}>{b}</option>)}</select>
            </Field>
          </div>
          {/* honeypot: hidden from people and assistive tech, attractive to bots */}
          <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden"><label>Leave this empty<input ref={hp} type="text" name="company_url" tabIndex={-1} autoComplete="off" /></label></div>
          <label className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-relaxed text-mid">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" aria-invalid={bad("consent")} />
            <span>I agree to Soni Consultancy Services storing these details to reply to my inquiry. No newsletter, no sharing. <Link href="/privacy/" className="underline">Privacy</Link>.</span>
          </label>
          {errors.consent && <p role="alert" className="-mt-2 text-[13px] text-danger">{errors.consent}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} className="btn btn-primary btn-lg disabled:opacity-60" data-cta>{busy ? "Sending…" : "Send my request →"}</button>
            <button type="button" onClick={() => setStep(1)} className="text-[14px] text-mid underline">← Back</button>
          </div>
          <p className="text-[13.5px] text-lo">Reply {inquiry.replyPromise} · no upfront fee to talk</p>
          <div aria-live="assertive">{error && <p className="text-[14px] text-danger">{error}</p>}</div>
        </form>
      )}
    </div>
  );
}

function Field({ id, label, err, children }: { id: string; label: string; err?: string; children: React.ReactNode }) {
  return (<div><label htmlFor={id} className="label">{label}</label>{children}{err && <p id={`${id}-e`} role="alert" className="mt-1.5 text-[13px] text-danger">{err}</p>}</div>);
}
