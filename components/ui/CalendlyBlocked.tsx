"use client";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

/**
 * True once the browser reports that a Calendly frame was blocked by the host's Content-Security-Policy
 * (`frame-src`). The embeds then show `CalendlyBlocked` instead of an empty frame. Mount it before the iframe renders.
 */
export function useCalendlyBlocked() {
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const on = (e: SecurityPolicyViolationEvent) => {
      if (e.violatedDirective.startsWith("frame-src") && e.blockedURI.includes("calendly.com")) setBlocked(true);
    };
    document.addEventListener("securitypolicyviolation", on);
    return () => document.removeEventListener("securitypolicyviolation", on);
  }, []);
  return blocked;
}

/** Shown in place of the scheduler when it cannot be embedded: the booking page opens in a new tab instead. */
export default function CalendlyBlocked({ className = "" }: { className?: string }) {
  return (
    <div className={`grid place-items-center p-8 text-center ${className}`}>
      <div>
        <p className="font-display text-[22px] font-semibold tracking-tight">Booking opens on Calendly</p>
        <p className="muted mx-auto mt-2 max-w-[40ch] text-[15px]">The calendar can&apos;t load inside this page, so it opens in a new tab.</p>
        <a href={site.calendly} target="_blank" rel="noopener" data-no-modal data-cta className="btn btn-primary btn-lg mt-6">Open Calendly</a>
      </div>
    </div>
  );
}
