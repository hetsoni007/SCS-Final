import { inquiry } from "@/content/inquiry";
import { site } from "@/content/site";

export type InquiryPayload = {
  what: string; description: string; name: string; email: string; whatsapp: string; budget: string; timeline: string;
  consent: boolean; hp: string; event_id: string; page: string; location: string; attribution: Record<string, string>;
};
export type InquiryResult = { ok: true } | { ok: false; error: string };

const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n);
const device = () => (/Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop") + ` ${innerWidth}x${innerHeight}`;

/** POST one inquiry to the Lambda route. With no endpoint configured (dev, tests, previews) it is accepted and logged, never sent. */
export async function sendInquiry(p: InquiryPayload): Promise<InquiryResult> {
  if (p.hp) return { ok: true };
  const body = {
    what: clip(p.what, 30), description: clip(p.description, 300), name: clip(p.name, 100).trim(), email: clip(p.email, 200).trim(),
    whatsapp: clip(p.whatsapp, 30).trim(), budget: clip(p.budget, 30), timeline: clip(p.timeline, 30), consent: p.consent === true,
    event_id: clip(p.event_id, 64), page: clip(p.page, 300), location: clip(p.location, 60), device: device(), ts: new Date().toISOString(),
    ...Object.fromEntries(Object.entries(p.attribution).map(([k, v]) => [clip(k, 40), clip(v, 300)])),
  };
  if (!inquiry.endpoint) { console.info("[inquiry] dry run (no endpoint configured)"); return { ok: true }; }
  try {
    const res = await fetch(inquiry.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true, signal: AbortSignal.timeout(15_000) });
    if (res.ok) return { ok: true };
    if (res.status === 429) return { ok: false, error: `Too many requests from your network. Please WhatsApp or email ${site.email}.` };
    if (res.status === 400) return { ok: false, error: "Please check the highlighted details and try again." };
  } catch {}
  return { ok: false, error: `Something went wrong sending that. Please email ${site.email}.` };
}
