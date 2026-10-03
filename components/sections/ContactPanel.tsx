"use client";
import { useRef, useState } from "react";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";
import LeadForm from "@/components/ui/LeadForm";
import type { FieldDef } from "@/content/forms";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";

type Opt = { lab: string; t: string; d: string; href: string };
/**
 * Inline Calendly embed, loaded on request. Calendly sets its own cookies as soon as its iframe loads, so the
 * scheduler appears in place when the visitor asks for it and never by itself.
 */
function InlineCalendly() {
  const [open, setOpen] = useState(false);
  const newTab = { href: site.calendly, "data-no-modal": true, target: "_blank", rel: "noopener", className: "text-accent-2 underline underline-offset-4" };
  if (!open) {
    return (
      <div className="grid min-h-[340px] place-items-center p-8 text-center">
        <div>
          <p className="font-display text-[22px] font-semibold tracking-tight">Pick a time that suits you</p>
          <p className="muted mx-auto mt-2 max-w-[40ch] text-[15px]">The calendar is provided by Calendly and loads here when you ask for it.</p>
          <button type="button" className="btn btn-primary btn-lg mt-6" data-cta data-magnetic="0.2" onClick={() => { setOpen(true); track("calendly_open", { location: "contact-inline" }); }}>Show available times</button>
          <p className="dim mt-4 text-[13px]">Calendly sets its own cookies. Prefer a separate tab? <a {...newTab}>Open Calendly</a>.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-[660px] w-full">
      <p className="muted absolute inset-0 grid place-items-center p-6 text-center text-[15px]">Loading the scheduler… If it doesn&apos;t appear, <a {...newTab}>open Calendly in a new tab</a>.</p>
      <iframe src={`${site.calendly}?hide_gdpr_banner=1&background_color=0b0c10&text_color=f4f5f7&primary_color=7c5cff`} title="Book a free 30-minute call with Het Soni" className="relative h-full w-full" />
    </div>
  );
}

/** Left: Calendly inline + direct options. Right: brief form; on success the 3D orb "sends" with a particle burst. */
export default function ContactPanel({ options, times, fields, submit, success, formTitle, formSub }: {
  options: Opt[]; times: [string, string][]; fields: FieldDef[]; submit: string; success: string; formTitle: string; formSub: string;
}) {
  const state = useRef({ sent: 0 });
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2 [&>*]:min-w-0">
      <div className="grid gap-4 [&>*]:min-w-0">
        <div className="glass overflow-hidden" data-reveal>
          <div className="flex items-center justify-between border-b border-line px-6 py-4"><div><p className="eyebrow">{options[0]?.lab}</p><h2 className="h3 mt-1">{options[0]?.t}</h2></div><a href={site.calendly} data-no-modal target="_blank" rel="noopener" className="text-[13px] text-accent-2 underline underline-offset-4">Open in new tab</a></div>
          <InlineCalendly />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {options.slice(1).map((o, i) => (
            <li key={o.href} className="min-w-0" data-reveal style={{ "--i": i } as React.CSSProperties}>
              <a href={o.href} className="glass spot block h-full p-6" {...(o.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
                <span className="eyebrow">{o.lab}</span><span className="h3 mt-2 block !text-[18px] [overflow-wrap:anywhere]">{o.t}</span><span className="muted mt-2 block text-[15px]">{o.d}</span>
              </a>
            </li>
          ))}
        </ul>
        <table className="glass w-full overflow-hidden text-left text-[15px]" data-reveal>
          <caption className="eyebrow px-6 pt-5 text-left">Response times</caption>
          <tbody>{times.map(([k, v]) => <tr key={k} className="border-t border-line first:border-t-0"><th scope="row" className="px-6 py-3.5 font-normal text-mid">{k}</th><td className="px-6 py-3.5 text-right font-medium text-hi">{v}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="glass spot p-7 md:p-9 lg:sticky lg:top-[calc(var(--nav-h)+24px)]" data-reveal>
        <ViewSlot scene="orb" props={{ state }} className="mx-auto -mt-2 mb-2 aspect-[2/1] w-full max-w-[420px]" poster={<Poster />} />
        <h2 className="h3 !text-[28px]">{formTitle}</h2>
        <p className="muted mt-2">{formSub}</p>
        <div className="mt-6"><LeadForm kind="contact" fields={fields} submit={submit} success={success} note="No pitch deck. An honest reply within one business day." onSuccess={() => { state.current.sent = 1; }} /></div>
      </div>
    </div>
  );
}
