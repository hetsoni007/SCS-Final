"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { inquiry } from "@/content/inquiry";

/** Fires the conversion once per submission: form_submit (GA4 key event) + generate_lead + Meta Lead with the same event_id. */
export default function ThanksTracker() {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(inquiry.doneKey);
      if (!raw) return; // direct visit or reload: nothing to count
      sessionStorage.removeItem(inquiry.doneKey);
      const { event_id, what, budget, location } = JSON.parse(raw) as Record<string, string>;
      track("form_submit", { form: "inquiry", what, budget, location, event_id }, event_id);
      track("generate_lead", { form: "inquiry", page_path: "/thanks/", event_id });
    } catch {}
  }, []);
  return null;
}
