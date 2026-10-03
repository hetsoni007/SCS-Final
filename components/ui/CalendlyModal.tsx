"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { site } from "@/content/site";
import CalendlyBlocked, { useCalendlyBlocked } from "./CalendlyBlocked";

/** Calendly inline in a modal: focus-trapped, Esc to close, scroll locked by the provider (Lenis stop). */
export default function CalendlyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null), last = useRef<Element | null>(null);
  const blocked = useCalendlyBlocked();
  useEffect(() => {
    if (!open) return;
    last.current = document.activeElement;
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") { const f = ref.current!.querySelectorAll<HTMLElement>("button,iframe,a[href]"); const first = f[0], end = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); } else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); } }
    };
    window.addEventListener("keydown", k);
    document.documentElement.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.documentElement.style.overflow = ""; (last.current as HTMLElement | null)?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  const src = `${site.calendly}?embed_domain=${typeof window !== "undefined" ? window.location.hostname : ""}&embed_type=Inline&hide_gdpr_banner=1&background_color=0b0c10&text_color=f4f5f7&primary_color=7c5cff`;
  return (
    <div className="fixed inset-0 z-[160] grid place-items-center bg-black/70 p-3 backdrop-blur-md" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Book a call with Het Soni" className="glass relative h-[min(760px,92vh)] w-full max-w-[980px] overflow-hidden !bg-bg-1" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <div className="flex h-14 items-center justify-between border-b border-line px-5">
          <p className="text-[14px] text-mid"><span className="text-hi">Book Your Free Call</span> · 30 minutes with a senior engineer</p>
          <button onClick={onClose} aria-label="Close booking dialog" className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-white/5"><X size={16} /></button>
        </div>
        {blocked ? <CalendlyBlocked className="h-[calc(100%-56px)]" /> : (
          <>
            <iframe src={src} title="Calendly scheduling" className="h-[calc(100%-56px)] w-full" loading="lazy" />
            <a href={site.calendly} target="_blank" rel="noopener" data-no-modal className="sr-only focus:not-sr-only focus:absolute focus:bottom-3 focus:left-3 focus:rounded focus:bg-bg-2 focus:p-2">Open Calendly in a new tab</a>
          </>
        )}
      </div>
    </div>
  );
}
