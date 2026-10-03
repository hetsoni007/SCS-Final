"use client";
import { useSyncExternalStore } from "react";
import { prefs, serverPrefs } from "@/lib/prefs";

/** Lets a visitor see and change the analytics-cookie choice at any time (the same store the banner writes to). */
export default function ConsentControls() {
  const consent = useSyncExternalStore(prefs.subscribe, prefs.consent, serverPrefs.consent);
  const on = consent === "granted";
  return (
    <aside className="glass spot mt-10 p-7" aria-labelledby="consent-h" data-loc="consent-controls">
      <p className="eyebrow">Your choice</p>
      <h2 id="consent-h" className="h3 mt-3">Analytics cookies</h2>
      <p className="muted mt-2 text-[15.5px]">Google Analytics, which sets cookies, loads only if you accept. You can change your choice here at any time.</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" role="switch" aria-checked={on} onClick={() => prefs.setConsent(on ? "denied" : "granted")}
          className={`relative h-8 w-[58px] rounded-full border-2 transition-colors duration-300 ${on ? "border-accent bg-accent" : "border-[color:var(--text-lo)] bg-transparent"}`}>
          <span className={`absolute top-[3px] h-[22px] w-[22px] rounded-full transition-[left,background-color] duration-300 ${on ? "left-[29px] bg-[color:var(--on-accent)]" : "left-[3px] bg-[color:var(--text-lo)]"}`} />
          <span className="sr-only">Analytics cookies</span>
        </button>
        <span role="status" aria-live="polite" className="text-[15px] text-hi">{consent === "pending" ? "…" : on ? "On — analytics cookies are allowed" : consent === "denied" ? "Off — analytics cookies are declined" : "Off — no choice made yet"}</span>
      </div>
    </aside>
  );
}
