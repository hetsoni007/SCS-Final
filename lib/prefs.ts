"use client";
/**
 * Browser-held preferences (motion, theme, analytics consent) exposed as an external store,
 * so components read them with useSyncExternalStore and stay hydration-safe.
 */
export type Consent = "granted" | "denied";
export const CONSENT_KEY = "scs-consent";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const ls = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };

export const prefs = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", cb);
    window.addEventListener("storage", cb);
    return () => { listeners.delete(cb); mq.removeEventListener("change", cb); window.removeEventListener("storage", cb); };
  },
  /** OS setting, unless the footer toggle has stored an explicit choice. */
  reduced: () => { const s = ls("scs-motion"); return s ? s === "reduce" : window.matchMedia("(prefers-reduced-motion: reduce)").matches; },
  theme: (): "dark" | "light" => (document.documentElement.dataset.theme === "light" ? "light" : "dark"),
  consent: (): Consent | "unset" => (ls(CONSENT_KEY) as Consent | null) ?? "unset",
  setReduced(v: boolean) { set("scs-motion", v ? "reduce" : "full"); document.documentElement.dataset.motion = v ? "reduce" : "full"; emit(); },
  toggleTheme() { const n = prefs.theme() === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = n; set("scs-theme", n); emit(); },
  setConsent(c: Consent) {
    set(CONSENT_KEY, c);
    // Consent Mode: tell Google Tag Manager straight away, before anything that loads on consent runs
    (window as { gtag?: (...a: unknown[]) => void }).gtag?.("consent", "update", { analytics_storage: c });
    emit();
  },
};
/** Server snapshots: nothing is known before hydration. */
export const serverPrefs = { reduced: () => false, theme: () => "dark" as const, consent: () => "pending" as const };
