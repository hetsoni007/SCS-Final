import test from "node:test";
import assert from "node:assert/strict";
import { createHandler, sanitizeMessages, SYSTEM } from "./index.mjs";

const env = { ANTHROPIC_API_KEY: "k", CHAT_MODEL: "m", CHAT_PRICE_IN_PER_MTOK: "3", CHAT_PRICE_OUT_PER_MTOK: "15", CHAT_DAILY_CAP_USD: "1", CHAT_IP_LIMIT: "2", RATE_TABLE: "t" };
const mk = (over = {}) => {
  const store = new Map(), sent = [], calls = [];
  const h = createHandler({ env: { ...env, ...over }, now: () => 1e12, send: async (m) => sent.push(m),
    ddb: { add: async (_t, pk, d) => { store.set(pk, (store.get(pk) ?? 0) + d); return store.get(pk); } },
    complete: async (a) => { calls.push(a); return { text: "Hello", input_tokens: 1000, output_tokens: 100 }; } });
  return { h, store, sent, calls };
};
const ev = (b, ip = "1.1.1.1") => ({ body: JSON.stringify(b), requestContext: { http: { sourceIp: ip } } });
const msgs = [{ role: "user", content: "How does it work?" }];

test("chat returns a reply, sends the fixed system prompt and records spend", async () => {
  const { h, calls, store } = mk(); const r = await h(ev({ action: "chat", messages: msgs }));
  assert.equal(r.statusCode, 200); assert.equal(JSON.parse(r.body).reply, "Hello");
  assert.equal(calls[0].system, SYSTEM); assert.equal(calls[0].model, "m");
  assert.equal([...store].find(([k]) => k.startsWith("chatspend"))[1], 3000 + 1500); // 1000*3 + 100*15 (USD×1e6)
});
test("system prompt forbids prices and deadlines", () => { assert.match(SYSTEM, /never state or estimate any price/); assert.match(SYSTEM, /Never promise a deadline/); });
test("daily spend cap stops the model call", async () => {
  const { h, store, calls } = mk(); store.set("chatspend#2001-09-09", 2e6);
  const r = await h(ev({ action: "chat", messages: msgs })); assert.equal(r.statusCode, 429); assert.equal(calls.length, 0);
});
test("per-IP limit", async () => {
  const { h } = mk();
  assert.equal((await h(ev({ messages: msgs }, "5.5.5.5"))).statusCode, 200); assert.equal((await h(ev({ messages: msgs }, "5.5.5.5"))).statusCode, 200);
  assert.equal((await h(ev({ messages: msgs }, "5.5.5.5"))).statusCode, 429);
});
test("fails closed without price env or key", async () => {
  assert.equal((await mk({ CHAT_PRICE_IN_PER_MTOK: "" }).h(ev({ messages: msgs }))).statusCode, 503);
  assert.equal((await mk({ ANTHROPIC_API_KEY: "" }).h(ev({ messages: msgs }))).statusCode, 503);
});
test("handoff emails the transcript, needs consent and a contact", async () => {
  const { h, sent } = mk(); const body = { action: "handoff", messages: msgs, name: "Asha", whatsapp: "+91 98765 43210", consent: true, utm_campaign: "nov-india" };
  assert.equal((await h(ev(body, "7.0.0.1"))).statusCode, 200); assert.match(sent[0].subject, /New chat lead: Asha - nov-india/); assert.match(sent[0].text, /Visitor: How does it work/);
  assert.equal((await h(ev({ ...body, consent: false }, "7.0.0.2"))).statusCode, 400);
  assert.equal((await h(ev({ ...body, whatsapp: "" }, "7.0.0.3"))).statusCode, 400);
});
test("message sanitising: roles, alternation, length, count", () => {
  assert.equal(sanitizeMessages([{ role: "system", content: "x" }]), null);
  assert.equal(sanitizeMessages([{ role: "user", content: "a" }, { role: "user", content: "b" }]), null);
  assert.equal(sanitizeMessages([{ role: "assistant", content: "a" }]), null);
  assert.equal(sanitizeMessages([{ role: "user", content: "x".repeat(900) }])[0].content.length, 500);
});
