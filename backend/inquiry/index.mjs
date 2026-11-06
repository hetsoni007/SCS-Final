// POST /inquiry — API Gateway HTTP API -> Lambda `scs-inquiry` (Node 20, AWS SDK v3 is in the runtime).
// Validates and sanitises the two-step inquiry, drops honeypot hits, rate-limits per IP, emails the owner and
// auto-replies to the visitor when they gave an email. Returns NO CORS headers: API Gateway owns CORS.
// Env: OWNER_EMAIL, FROM_EMAIL, REPLY_PROMISE, RATE_TABLE (DynamoDB, key `pk` string, TTL attribute `ttl`), RATE_LIMIT (default 5 per hour).
import { createHash } from "node:crypto";

export const WHAT = ["Mobile app", "Web app", "AI feature", "Not sure"];
export const BUDGETS = ["Not sure yet", "Under $10k", "$10-25k", "$25-60k", "$60k+"];
export const TIMELINES = ["ASAP", "1-3 months", "3-6 months", "Just exploring"];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const clean = (s, n) => String(s ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Returns { ok:true, data } or { ok:false, errors } */
export function validate(b) {
  const e = {};
  const d = {
    what: clean(b.what, 30), description: clean(b.description, 300), name: clean(b.name, 100), email: clean(b.email, 200).toLowerCase(),
    whatsapp: clean(b.whatsapp, 30), budget: clean(b.budget, 30), timeline: clean(b.timeline, 30), event_id: clean(b.event_id, 64),
    page: clean(b.page, 300), location: clean(b.location, 60), device: clean(b.device, 60), ts: clean(b.ts, 40),
    utm_source: clean(b.utm_source, 120), utm_medium: clean(b.utm_medium, 120), utm_campaign: clean(b.utm_campaign, 120),
    utm_content: clean(b.utm_content, 120), utm_term: clean(b.utm_term, 120), fbclid: clean(b.fbclid, 120),
    landing: clean(b.landing, 300), referrer: clean(b.referrer, 200),
  };
  if (!WHAT.includes(d.what)) e.what = "invalid";
  if (!BUDGETS.includes(d.budget)) e.budget = "invalid";
  if (d.timeline && !TIMELINES.includes(d.timeline)) e.timeline = "invalid";
  if (!d.name) e.name = "required";
  if (d.email && !EMAIL.test(d.email)) e.email = "invalid";
  if (d.whatsapp) { const digits = d.whatsapp.replace(/\D/g, ""); if (!/^[\d\s()+.-]+$/.test(d.whatsapp) || digits.length < 7 || digits.length > 15) e.whatsapp = "invalid"; }
  if (!d.email && !d.whatsapp) e.contact = "required";
  if (b.consent !== true) e.consent = "required";
  return Object.keys(e).length ? { ok: false, errors: e } : { ok: true, data: d };
}

export function ownerMail(d, ip) {
  const campaign = d.utm_campaign || "direct";
  const subject = `New inquiry: ${d.what} - ${d.budget} - ${campaign}`;
  const rows = [
    ["Name", d.name], ["WhatsApp", d.whatsapp], ["Email", d.email], ["Building", d.what], ["Description", d.description], ["Budget", d.budget], ["Timeline", d.timeline],
    ["utm_source", d.utm_source], ["utm_medium", d.utm_medium], ["utm_campaign", d.utm_campaign], ["utm_content", d.utm_content], ["utm_term", d.utm_term], ["fbclid", d.fbclid],
    ["Landing path", d.landing], ["Referrer", d.referrer], ["Submitted from", `${d.page} (${d.location})`], ["Device", d.device], ["Browser time", d.ts], ["IP", ip],
  ].filter(([, v]) => v);
  return {
    subject,
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: `<table cellpadding="6" style="font:14px/1.4 Arial,sans-serif">${rows.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(String(v))}</td></tr>`).join("")}</table>`,
  };
}

export function visitorMail(d, promise) {
  const text = `Hi ${d.name},\n\nThanks — your request for a fixed-price proposal is with Het Soni. You'll hear back ${promise}.\n\nWant to move faster? Book a 20-minute call: https://calendly.com/het-soni-soniconsultancyservices/introductory\n\nSoni Consultancy Services\nsoniconsultancyservices.com`;
  return { subject: "We've got your request — Soni Consultancy Services", text, html: `<p>${esc(text).replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>` };
}

async function overLimit(mem, ddb, ip, limit, now, table) {
  const hour = Math.floor(now / 3_600_000), key = `ip#${createHash("sha256").update(ip).digest("hex").slice(0, 24)}#${hour}`;
  try {
    if (table && ddb) {
      const n = await ddb.increment(table, key, Math.floor(now / 1000) + 7200);
      return n > limit;
    }
  } catch { return false; } // fail open: never lose a real lead to a rate-limiter outage
  mem.set(key, (mem.get(key) ?? 0) + 1);
  return mem.get(key) > limit;
}

const res = (status, body) => ({ statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function createHandler(deps) {
  const mem = new Map(); // per-instance fallback when no RATE_TABLE
  return async (event) => {
    const env = deps.env, now = deps.now?.() ?? Date.now();
    const ip = event.requestContext?.http?.sourceIp ?? "unknown";
    let raw = event.body ?? "";
    if (event.isBase64Encoded) raw = Buffer.from(raw, "base64").toString("utf8");
    if (raw.length > 8000) return res(413, { ok: false });
    let b;
    try { b = JSON.parse(raw); } catch { return res(400, { ok: false }); }
    if (!b || typeof b !== "object") return res(400, { ok: false });
    if (clean(b.hp ?? b.company_url, 50)) return res(200, { ok: true }); // honeypot: bots get no signal
    if (await overLimit(mem, deps.ddb, ip, Number(env.RATE_LIMIT) || 5, now, env.RATE_TABLE)) return res(429, { ok: false, error: "rate_limited" });
    const v = validate(b);
    if (!v.ok) return res(400, { ok: false, errors: v.errors });
    const d = v.data, owner = env.OWNER_EMAIL || "het.soni@soniconsultancyservices.com", from = env.FROM_EMAIL || owner;
    const om = ownerMail(d, ip);
    try {
      await deps.send({ from, to: owner, replyTo: d.email || undefined, ...om });
    } catch (err) {
      console.error("owner email failed", err?.name);
      return res(502, { ok: false });
    }
    let visitor = false;
    if (d.email) {
      try { await deps.send({ from, to: d.email, ...visitorMail(d, env.REPLY_PROMISE || "within 1 business day") }); visitor = true; } catch (err) { console.error("auto-reply failed", err?.name); }
    }
    return res(200, { ok: true, visitor });
  };
}

let handlerPromise;
export const handler = async (event) => {
  handlerPromise ??= (async () => {
    const { SESv2Client, SendEmailCommand } = await import("@aws-sdk/client-sesv2");
    const { DynamoDBClient, UpdateItemCommand } = await import("@aws-sdk/client-dynamodb");
    const ses = new SESv2Client({}), db = new DynamoDBClient({});
    return createHandler({
      env: process.env,
      send: ({ from, to, replyTo, subject, text, html }) => ses.send(new SendEmailCommand({
        FromEmailAddress: from, Destination: { ToAddresses: [to] }, ReplyToAddresses: replyTo ? [replyTo] : undefined,
        Content: { Simple: { Subject: { Data: subject, Charset: "UTF-8" }, Body: { Text: { Data: text, Charset: "UTF-8" }, Html: { Data: html, Charset: "UTF-8" } } } },
      })),
      ddb: { increment: async (table, pk, ttl) => {
        const r = await db.send(new UpdateItemCommand({ TableName: table, Key: { pk: { S: pk } }, UpdateExpression: "ADD n :one SET #t = :ttl", ExpressionAttributeNames: { "#t": "ttl" }, ExpressionAttributeValues: { ":one": { N: "1" }, ":ttl": { N: String(ttl) } }, ReturnValues: "UPDATED_NEW" }));
        return Number(r.Attributes.n.N);
      } },
    });
  })();
  return (await handlerPromise)(event);
};
