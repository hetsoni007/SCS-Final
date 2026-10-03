"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import Script from "next/script";
import { submitLead, type LeadInput } from "@/app/actions/lead";
import { track } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import { parseInline } from "./Rich";
import type { FieldDef } from "@/content/forms";

const TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// The pattern Zod's `z.email()` applies in the server action, so the browser and the server agree.
const EMAIL = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
const rules = (f: FieldDef) =>
  f.type === "email" ? { validate: (v: unknown) => EMAIL.test(String(v ?? "").trim()) || "Enter a valid email address" }
  : f.type === "select" && f.required ? { validate: (v: unknown) => !!v || `Choose an option for ${f.label.toLowerCase()}` }
  : f.required ? { validate: (v: unknown) => String(v ?? "").trim().length > 0 || `${f.label} is required` }
  : {};

/**
 * Generic form: React Hook Form validates in the browser, then the `submitLead` server action
 * validates again with Zod (the source of truth) and delivers the lead.
 * Success replaces the form in place (no reload) and is announced via aria-live.
 */
export default function LeadForm({
  kind, fields, submit = "Send →", note, consent, success, extra, onSuccess, className = "", successSlot, alwaysSucceed = false,
}: {
  kind: LeadInput["kind"]; fields: FieldDef[]; submit?: string; note?: string; consent?: string; success?: string;
  /** extra key/values merged into the payload (e.g. calculator config) — may be a getter */
  extra?: Record<string, string> | (() => Record<string, string>);
  onSuccess?: (values: Record<string, string>) => void; className?: string; successSlot?: ReactNode;
  /** reveal the success state even if delivery fails (used for the instant guide download) */
  alwaysSucceed?: boolean;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Record<string, string | boolean>>({ mode: "onBlur" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const hp = useRef<HTMLInputElement>(null), form = useRef<HTMLFormElement>(null), status = useRef<HTMLDivElement>(null);
  useEffect(() => { if (done) status.current?.focus(); }, [done]);

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => handleSubmit(async (raw) => {
    setError("");
    const v = raw as Record<string, string | boolean | undefined>;
    const values: Record<string, string> = {};
    for (const f of fields) values[f.name] = f.type === "email" ? String(v[f.name] ?? "").trim() : String(v[f.name] ?? "");
    const email = values[fields.find((f) => f.type === "email")?.name ?? "email"] ?? "";
    const name = [values.name, values.firstName, values.lastName].filter(Boolean).join(" ").trim();
    const ex = typeof extra === "function" ? extra() : (extra ?? {});
    const token = form.current?.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value;
    const res = await submitLead({ kind, email, name, fields: { ...values, ...ex }, page: location.pathname, attribution: getAttribution(), hp: hp.current?.value || undefined, turnstile: token }).catch(() => ({ ok: false as const, error: "Network error. Please try again." }));
    if (!res.ok && !alwaysSucceed) { setError(res.error); return; }
    track("form_submit", { form: kind });
    setDone(true);
    onSuccess?.(values);
  })(ev);

  if (done) {
    return (
      <div ref={status} tabIndex={-1} role="status" aria-live="polite" className={`outline-none ${className}`}>
        {successSlot ?? <p className="rich text-[17px] text-hi">{parseInline(success ?? "✓ Thanks — that’s with Het. You’ll get a reply within one business day.")}</p>}
      </div>
    );
  }
  const err = errors as Record<string, { message?: string } | undefined>;
  return (
    <form ref={form} onSubmit={onSubmit} noValidate className={`grid gap-4 sm:grid-cols-2 ${className}`}>
      {fields.map((f) => {
        const id = `${kind}-${f.name}`, e = err[f.name]?.message, common = { id, "aria-invalid": !!e, "aria-describedby": e ? `${id}-err` : undefined, className: "field", placeholder: f.placeholder, autoComplete: f.autoComplete, ...register(f.name, rules(f)) };
        return (
          <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
            <label htmlFor={id} className="label">{f.label}{f.required || f.type === "email" ? <span aria-hidden className="text-accent-2"> *</span> : null}</label>
            {f.type === "textarea" ? <textarea rows={4} {...common} /> : f.type === "select" ? (
              <select {...common} defaultValue="">
                <option value="" disabled>Select…</option>
                {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : <input type={f.type ?? "text"} {...common} />}
            {e && <p id={`${id}-err`} role="alert" className="mt-1.5 text-[13px] text-danger">{e}</p>}
          </div>
        );
      })}
      {/* honeypot: hidden from people and assistive tech, attractive to bots */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden"><label>Leave this empty<input ref={hp} type="text" name="company_url" tabIndex={-1} autoComplete="off" /></label></div>
      {consent && (
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-relaxed text-mid">
            <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" aria-invalid={!!err.consent} {...register("consent", { validate: (v) => v === true || "Please tick the box so we can reply" })} />
            <span className="rich">{parseInline(consent.replace(/\bPrivacy\b\.?$/, '<a href="/privacy/">Privacy</a>.'))}</span>
          </label>
          {err.consent && <p role="alert" className="mt-1.5 text-[13px] text-danger">{err.consent.message}</p>}
        </div>
      )}
      {TURNSTILE && (<div className="sm:col-span-2"><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" /><div className="cf-turnstile" data-sitekey={TURNSTILE} data-theme="dark" data-size="flexible" /></div>)}
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg disabled:opacity-60" data-magnetic="0.2">{isSubmitting ? "Sending…" : submit}</button>
        {note && <span className="text-[13.5px] text-lo">{note}</span>}
      </div>
      <div aria-live="assertive" className="sm:col-span-2">{error && <p className="text-[14px] text-danger">{error}</p>}</div>
    </form>
  );
}
