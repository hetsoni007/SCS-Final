"use client";
/**
 * Event names (brief §10): cta_click{location,label}, calc_complete{config}, form_submit{form},
 * guide_download, calendly_open, calendly_booked.
 * GA4 only loads after consent; Vercel Analytics is cookieless and always on.
 */
export type EventName = "cta_click" | "calc_complete" | "form_submit" | "guide_download" | "calendly_open" | "calendly_booked" | "calculator_estimate";

declare global {
  interface Window { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[]; va?: (e: string, p?: unknown) => void }
}

export function track(name: EventName, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", name, params);
    window.va?.("event", { name, data: flatten(params) });
  } catch {}
}
function flatten(p: Record<string, unknown>) {
  const o: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(p)) o[k] = typeof v === "object" ? JSON.stringify(v) : (v as string | number | boolean);
  return o;
}
