import test from "node:test";
import assert from "node:assert/strict";
import { createHandler, validate } from "./index.mjs";

const good = { what: "Mobile app", description: "Salon booking", name: "Asha", email: "asha@example.com", whatsapp: "", budget: "$10-25k", timeline: "", consent: true, event_id: "e1", page: "/", location: "home-form", utm_campaign: "nov-india", landing: "/", device: "mobile 360x640", ts: "2026-11-03T10:00:00Z" };
const mk = () => { const sent = []; const h = createHandler({ env: { RATE_LIMIT: "2" }, now: () => 1e12, send: async (m) => { sent.push(m); } }); return { sent, h }; };
const ev = (b, ip = "1.1.1.1") => ({ body: JSON.stringify(b), requestContext: { http: { sourceIp: ip } } });

test("valid inquiry emails owner with the required subject and auto-replies", async () => {
  const { h, sent } = mk(); const r = await h(ev(good));
  assert.equal(r.statusCode, 200); assert.equal(sent.length, 2);
  assert.equal(sent[0].subject, "New inquiry: Mobile app - $10-25k - nov-india");
  assert.equal(sent[0].to, "het.soni@soniconsultancyservices.com"); assert.match(sent[0].text, /utm_campaign: nov-india/);
  assert.equal(sent[1].to, "asha@example.com");
});
test("whatsapp only: owner mail, no auto-reply", async () => {
  const { h, sent } = mk(); const r = await h(ev({ ...good, email: "", whatsapp: "+91 98765 43210" }));
  assert.equal(r.statusCode, 200); assert.equal(sent.length, 1);
});
test("needs a contact, consent, valid enums", async () => {
  const { h } = mk();
  assert.equal((await h(ev({ ...good, email: "" }, "2.0.0.1"))).statusCode, 400);
  assert.equal((await h(ev({ ...good, consent: false }, "2.0.0.2"))).statusCode, 400);
  assert.equal((await h(ev({ ...good, budget: "free" }, "2.0.0.3"))).statusCode, 400);
});
test("honeypot returns 200 and sends nothing", async () => {
  const { h, sent } = mk(); assert.equal((await h(ev({ ...good, hp: "x" }))).statusCode, 200); assert.equal(sent.length, 0);
});
test("rate limit per IP", async () => {
  const { h } = mk();
  assert.equal((await h(ev(good, "9.9.9.9"))).statusCode, 200); assert.equal((await h(ev(good, "9.9.9.9"))).statusCode, 200);
  assert.equal((await h(ev(good, "9.9.9.9"))).statusCode, 429); assert.equal((await h(ev(good, "8.8.8.8"))).statusCode, 200);
});
test("header injection and length limits are neutralised", () => {
  const v = validate({ ...good, utm_campaign: "a\r\nBcc: x@y.z", name: "n".repeat(500) });
  assert.ok(v.ok); assert.ok(!/[\r\n]/.test(v.data.utm_campaign)); assert.equal(v.data.name.length, 100);
});
test("oversized and malformed bodies rejected", async () => {
  const { h } = mk();
  assert.equal((await h({ body: "x".repeat(9000), requestContext: {} })).statusCode, 413);
  assert.equal((await h({ body: "{nope", requestContext: {} })).statusCode, 400);
});
