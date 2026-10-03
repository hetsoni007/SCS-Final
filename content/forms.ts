/** Form definitions shared by server and client components (kept out of "use client" files on purpose). */
export type FieldDef = { name: string; label: string; type?: "text" | "email" | "textarea" | "select"; options?: string[]; placeholder?: string; required?: boolean; half?: boolean; autoComplete?: string };

/** "Start here" form used on most service pages (Appendix B of the brief / the live `leadForm`). */
export const START_FIELDS: FieldDef[] = [
  { name: "name", label: "Your name", required: true, half: true, autoComplete: "name" },
  { name: "email", label: "Work email", type: "email", half: true, autoComplete: "email" },
  { name: "message", label: "What are you building?", type: "textarea", required: true },
  { name: "budget", label: "Budget", type: "select", options: ["Not sure yet", "<$10k", "$10-25k", "$25-60k", "$60k+"], half: true },
  { name: "timeline", label: "Timeline", type: "select", options: ["ASAP", "1-3 months", "3-6 months", "Just exploring"], half: true },
];
export const START_CONSENT = "I agree to Soni Consultancy Services storing these details to reply to my enquiry. No newsletter, no sharing with anyone else. Privacy.";
export const START_SUCCESS = "✓ Thanks — that’s with Het. You’ll get a reply within one business day, usually with either a straight answer or the two or three questions needed to scope it properly.";
export const START_NOTE = "Replies within one business day · no upfront fee to talk";
