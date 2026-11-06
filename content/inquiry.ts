/** Inquiry funnel config: single source of truth for the form options, WhatsApp number and reply promise. */
export const WHAT = ["Mobile app", "Web app", "AI feature", "Not sure"] as const;
export const BUDGETS = ["Not sure yet", "Under $10k", "$10-25k", "$25-60k", "$60k+"] as const;
export const TIMELINES = ["ASAP", "1-3 months", "3-6 months", "Just exploring"] as const;

export const inquiry = {
  /** Owner WhatsApp number: digits with country code. Set with NEXT_PUBLIC_WHATSAPP_NUMBER at build time (scripts/deploy-aws.sh passes 918160682185). Public, not a secret. Empty => wa.me opens WhatsApp's contact picker. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  /** Reply promise shown on /thanks. Set with NEXT_PUBLIC_REPLY_PROMISE at build time; defaults to "within 1 business day". */
  replyPromise: process.env.NEXT_PUBLIC_REPLY_PROMISE || "within 1 business day",
  /** Build-time URL of POST /inquiry (API Gateway -> scs-inquiry Lambda, source in backend/inquiry). Empty => dry run. */
  endpoint: process.env.NEXT_PUBLIC_INQUIRY_ENDPOINT || (process.env.NEXT_PUBLIC_LEAD_ENDPOINT ? `${process.env.NEXT_PUBLIC_LEAD_ENDPOINT}/inquiry` : ""),
  /** Inquiry done flag read by /thanks (session only; carries no personal data). */
  doneKey: "scs_inquiry_done",
};
