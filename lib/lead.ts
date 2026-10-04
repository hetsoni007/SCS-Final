import { site } from "@/content/site";

/**
 * Form delivery for the static site. Every form calls `submitLead`, which POSTs one JSON object
 * `{ kind, name, email, …fields, page, …attribution }` straight from the browser to the lead API
 * (API Gateway → the `scs-lead-mailer` Lambda, which emails the owner and stores the lead).
 * The old site posted the same shape to the same endpoint.
 *
 * NEXT_PUBLIC_LEAD_ENDPOINT is read at build time. When it is empty (local dev, tests, previews)
 * nothing is sent: the submission is accepted and logged, so tests can never create a real lead.
 * The AWS deploy script refuses to ship a build that does not contain the endpoint.
 */
export type LeadKind = "lead" | "contact" | "calculator" | "guide" | "newsletter" | "wordpress" | "cloud-calculator" | "devops-assessment";
export type LeadInput = {
  kind: LeadKind;
  email: string;
  name?: string;
  fields?: Record<string, string>;
  page?: string;
  attribution?: Record<string, string>;
  hp?: string; // honeypot: must stay empty
  turnstile?: string; // Cloudflare Turnstile token; the lead API verifies it when its TURNSTILE_SECRET is set
};
export type LeadResult = { ok: true } | { ok: false; error: string };

const ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT ?? "";
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n);

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  // A filled honeypot is treated as success so bots get no signal.
  if (input.hp) return { ok: true };
  const email = clip(input.email, 200).trim();
  if (!EMAIL.test(email)) return { ok: false, error: "Please check the form and try again." };

  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.fields ?? {})) fields[clip(k, 60)] = clip(v, 4000);
  const attribution: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.attribution ?? {})) attribution[clip(k, 40)] = clip(v, 300);
  const payload = { kind: input.kind, name: clip(input.name, 200).trim(), email, ...fields, page: clip(input.page, 300), ...attribution, ...(input.turnstile ? { turnstile_token: clip(input.turnstile, 2100) } : {}) };

  if (!ENDPOINT) {
    console.info("[lead] dry run (NEXT_PUBLIC_LEAD_ENDPOINT is empty):", payload.kind);
    return { ok: true };
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) return { ok: true };
  } catch {
    /* fall through to the shared error below */
  }
  return { ok: false, error: `Something went wrong sending that. Please email ${site.email}.` };
}
