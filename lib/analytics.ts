"use client";
/**
 * Event names (brief §10): cta_click{location,label}, calc_complete{config}, form_submit{form},
 * guide_download, calendly_open, calendly_booked.
 * book_call_click, tool_complete, form_start and scroll_depth keep the names the previous site sent, so the GA4
 * key events and history built on them carry on unbroken.
 * generate_lead (a lead form delivered), book_call (a Calendly open, alongside book_call_click) and calculator_complete
 * (first estimate from the app cost calculator) are the GA4 key events; each carries page_path and no personal data.
 * GA4 only loads after consent; Vercel Analytics is cookieless and always on.
 */
export type EventName = "generate_lead" | "book_call" | "calculator_complete" | "cta_click" | "calc_complete" | "form_submit" | "guide_download" | "calendly_open" | "calendly_booked" | "calculator_estimate" | "post_feedback" | "book_call_click" | "tool_complete" | "form_start" | "scroll_depth";

import { site } from "@/content/site";

/** GA4 / Tag Manager only ever receive events from the production hostname, never localhost, previews or dev hosts. */
const PROD_HOST = new URL(site.url).hostname;
export const isProdHost = () => typeof location !== "undefined" && (location.hostname === PROD_HOST || location.hostname === `www.${PROD_HOST}`);

declare global {
  interface Window { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[]; va?: (e: string, p?: unknown) => void }
}

export function track(name: EventName, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    if (isProdHost()) {
      window.gtag?.("event", name, params);
      // the same event as a plain dataLayer object, which is the form Tag Manager triggers ("Custom Event") read
      if (process.env.NEXT_PUBLIC_GTM_ID) window.dataLayer?.push({ event: name, ...params });
    }
    window.va?.("event", { name, data: flatten(params) });
  } catch {}
}
function flatten(p: Record<string, unknown>) {
  const o: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(p)) o[k] = typeof v === "object" ? JSON.stringify(v) : (v as string | number | boolean);
  return o;
}
