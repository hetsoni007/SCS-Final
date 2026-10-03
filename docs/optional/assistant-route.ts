import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { appCalc } from "@/content/tools";
import { site } from "@/content/site";
import { process as steps } from "@/content/home";

/**
 * Optional on-page assistant ("Ask about your app idea") for /ai-app-development/.
 *
 * Off by default. Enable with ASSISTANT_ENABLED=true (server) and NEXT_PUBLIC_ASSISTANT_ENABLED=true
 * (shows the UI); credentials are resolved by the SDK from the environment (ANTHROPIC_API_KEY).
 * Responses stream as NDJSON lines: {t:"delta",v} | {t:"reset"} | {t:"refusal"} | {t:"error",v} | {t:"done"}.
 */
export const maxDuration = 60;

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(1200) })).min(1).max(12),
});

// Small in-memory limiter. On serverless this is per-instance, so treat it as a courtesy limit and
// put a durable limiter (e.g. Upstash, Vercel WAF rate limiting) in front before enabling at scale.
const WINDOW_MS = 10 * 60_000, MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

// Stable system prompt (no timestamps or per-request values, so the prefix stays cacheable).
const SYSTEM = `You are the website assistant for ${site.name}, a boutique, senior-only studio that builds React Native, MERN and AI-powered apps and does DevOps/cloud engineering. You help founders think through an app idea.

What you can rely on (do not go beyond it):
- Services: React Native app development, MVP development, MERN-stack & web development, AI integration (Claude & GPT: assistants, matching, prediction, RAG), DevOps & cloud, hiring a senior developer, WordPress websites for Indian businesses.
- Process: ${steps.map((s) => `${s.title} (${s.body})`).join(" ")}
- Terms: free intro call with no upfront fee, a fixed-price proposal within 48 hours of the call, NDA on request, the client owns all code and IP, senior engineers only.
- Founder: ${site.founder.name}, ${site.founder.role}.
- Indicative effort: the site's cost calculator uses a base of ${appCalc.stages.map((s) => `${s.base} weeks for ${s.label}`).join(", ")}, plus weeks per feature, and an indicative ${"$"}${appCalc.rateLo}-${"$"}${appCalc.rateHi} per week. Send people to /app-cost-calculator/ for a number rather than quoting one yourself.

How to answer:
- Be concrete and brief: under 120 words, plain sentences, no headings or bullet lists unless the visitor asks for a list.
- Help with scoping: what the core feature is, what can wait, which stack fits, where AI genuinely earns its place and where it does not. Say so honestly when an idea does not need AI or does not need a custom app.
- Never invent clients, case studies, metrics, prices, timelines, awards or team members. If you do not know, say so and suggest the free call.
- You are not giving a quote, legal advice or compliance advice. Real numbers come from the fixed-price proposal after a call.
- Stay on the topic of building software products with this studio. For anything else, say briefly that it is outside what you can help with here.
- When it is useful, point to one next step: the free call (${site.calendly}), /app-cost-calculator/ or /app-scoping-guide/.`;

const line = (o: Record<string, unknown>) => new TextEncoder().encode(JSON.stringify(o) + "\n");

export async function POST(req: Request) {
  if (process.env.ASSISTANT_ENABLED !== "true") return Response.json({ error: "Not enabled" }, { status: 404 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return Response.json({ error: "Too many questions for now. Please try again in a few minutes, or book a call." }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success || parsed.data.messages[0].role !== "user" || parsed.data.messages.at(-1)!.role !== "user") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const client = new Anthropic();
  // Thinking is always on for this model (the parameter is omitted); depth is set with effort.
  // Server-side fallback is opted in: a policy decline is re-run on Anthropic's recommended model inside the same call.
  const stream = client.beta.messages.stream(
    {
      model: "claude-opus-5-5",
      max_tokens: 4000, // answers are short by instruction; the headroom is for thinking
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: parsed.data.messages,
    },
    { signal: req.signal },
  );

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_start" && event.content_block.type === "fallback") {
            controller.enqueue(line({ t: "reset" })); // a model declined mid-answer: discard its partial text
          } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(line({ t: "delta", v: event.delta.text }));
          }
        }
        const final = await stream.finalMessage();
        // Check the stop reason before treating the text as an answer.
        if (final.stop_reason === "refusal") controller.enqueue(line({ t: "refusal" }));
        else controller.enqueue(line({ t: "done", truncated: final.stop_reason === "max_tokens" }));
      } catch (err) {
        let msg = "Something went wrong. Please try again, or book a call instead.";
        if (err instanceof Anthropic.RateLimitError) msg = "The assistant is busy right now. Please try again in a minute.";
        else if (err instanceof Anthropic.AuthenticationError) msg = "The assistant is not configured yet.";
        else if (err instanceof Anthropic.APIConnectionError) msg = "Could not reach the assistant. Please check your connection and try again.";
        else if (err instanceof Anthropic.APIError) console.error("[assistant] API error", err.status, err.message);
        else console.error("[assistant]", err);
        try { controller.enqueue(line({ t: "error", v: msg })); } catch {}
      } finally {
        try { controller.close(); } catch {}
      }
    },
    cancel() { stream.abort(); },
  });
  return new Response(body, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
}
