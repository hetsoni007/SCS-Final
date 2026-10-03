"use server";
import { z } from "zod";
import { headers } from "next/headers";
import { site } from "@/content/site";

/**
 * One server action for every form on the site.
 * Delivery: Resend email (RESEND_API_KEY) and/or a JSON webhook (LEAD_WEBHOOK_URL — the live site's
 * lead API accepts the same `{ kind, name, email, … }` payload). Anti-spam: honeypot + Cloudflare
 * Turnstile (when TURNSTILE_SECRET_KEY is set) + a small in-memory rate limit.
 * Nothing is persisted by this app.
 */
const schema = z.object({
  kind: z.enum(["lead", "contact", "calculator", "guide", "newsletter", "wordpress", "cloud-calculator", "devops-assessment"]),
  email: z.email().max(200),
  name: z.string().trim().max(200).optional(),
  fields: z.record(z.string().max(60), z.string().max(4000)).default({}),
  page: z.string().max(300).optional(),
  attribution: z.record(z.string().max(40), z.string().max(300)).optional(),
  hp: z.string().max(0).optional(), // honeypot must stay empty
  turnstile: z.string().max(4000).optional(),
});
export type LeadInput = z.input<typeof schema>;
export type LeadResult = { ok: true } | { ok: false; error: string };

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > 6;
}
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    // A filled honeypot is treated as success so bots get no signal.
    if (input?.hp) return { ok: true };
    return { ok: false, error: "Please check the form and try again." };
  }
  const d = parsed.data;
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return { ok: false, error: "Too many requests. Please try again in a minute." };

  if (process.env.TURNSTILE_SECRET_KEY) {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: d.turnstile ?? "", remoteip: ip }),
    }).then((x) => x.json() as Promise<{ success: boolean }>).catch(() => ({ success: false }));
    if (!r.success) return { ok: false, error: "Verification failed. Please try again." };
  }

  const payload = { kind: d.kind, name: d.name ?? "", email: d.email, ...d.fields, page: d.page, ...(d.attribution ?? {}) };
  const tasks: Promise<unknown>[] = [];

  if (process.env.RESEND_API_KEY) {
    const rows = Object.entries(payload).filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td>${esc(String(v))}</td></tr>`).join("");
    tasks.push((async () => {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: process.env.LEAD_FROM_EMAIL ?? "Website <onboarding@resend.dev>",
        to: process.env.LEAD_TO_EMAIL ?? site.email,
        replyTo: d.email,
        subject: `[${d.kind}] ${d.name || d.email} — ${site.name}`,
        html: `<table style="font:14px system-ui">${rows}</table>`,
      });
      if (error) throw new Error(error.message);
    })());
  }
  if (process.env.LEAD_WEBHOOK_URL) {
    tasks.push(fetch(process.env.LEAD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => { if (!r.ok) throw new Error(`webhook ${r.status}`); }));
  }
  if (process.env.LEAD_DRY_RUN === "1") {
    // Test / preview mode: accept the submission without delivering it anywhere.
    console.info("[lead] dry run:", payload.kind);
    return { ok: true };
  }
  if (!tasks.length) {
    // No provider configured (local dev / preview): log instead of failing silently.
    console.info("[lead] no RESEND_API_KEY or LEAD_WEBHOOK_URL set — payload:", payload);
    return process.env.NODE_ENV === "production" ? { ok: false, error: `Form delivery is not configured. Please email ${site.email}.` } : { ok: true };
  }
  const results = await Promise.allSettled(tasks);
  if (results.every((r) => r.status === "rejected")) {
    console.error("[lead] delivery failed", results);
    return { ok: false, error: `Something went wrong sending that. Please email ${site.email}.` };
  }
  return { ok: true };
}
