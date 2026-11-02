/** Inquiry funnel config: single source of truth for the form options, WhatsApp number and reply promise. */
export const WHAT = ["Mobile app", "Web app", "AI feature", "Not sure"] as const;
export const BUDGETS = ["Not sure yet", "Under $5k", "$10-25k", "$25-60k", "$60k+"] as const;
export const TIMELINES = ["ASAP", "1-3 months", "3-6 months", "Just exploring"] as const;

export const inquiry = {
  /** TODO(owner): set NEXT_PUBLIC_WHATSAPP_NUMBER (digits with country code, e.g. 919876543210). Empty => wa.me opens WhatsApp's contact picker. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  /** TODO(owner): confirm a faster promise, then set NEXT_PUBLIC_REPLY_PROMISE (e.g. "within 4 working hours"). */
  replyPromise: process.env.NEXT_PUBLIC_REPLY_PROMISE || "within 1 business day",
  /** Build-time URL of POST /inquiry (API Gateway -> scs-inquiry Lambda, source in backend/inquiry). Empty => dry run. */
  endpoint: process.env.NEXT_PUBLIC_INQUIRY_ENDPOINT || (process.env.NEXT_PUBLIC_LEAD_ENDPOINT ? `${process.env.NEXT_PUBLIC_LEAD_ENDPOINT.replace(/\/$/, "")}/inquiry` : ""),
  /** Phase 3 assistant on /app-quote: off unless NEXT_PUBLIC_CHAT_ENABLED === "true" at build time. */
  chatEnabled: process.env.NEXT_PUBLIC_CHAT_ENABLED === "true",
  chatEndpoint: process.env.NEXT_PUBLIC_CHAT_ENDPOINT || (process.env.NEXT_PUBLIC_LEAD_ENDPOINT ? `${process.env.NEXT_PUBLIC_LEAD_ENDPOINT.replace(/\/$/, "")}/chat` : ""),
  /** Inquiry done flag read by /thanks (session only; carries no personal data). */
  doneKey: "scs_inquiry_done",
};
