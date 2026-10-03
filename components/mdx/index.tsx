import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { codeToHtml } from "shiki";
import { FaqItem } from "@/components/ui/Bits";
import { readEmbed, slugifyHeading } from "@/lib/content";
import { ArchTabs, ChatDemo, Checklist, ComplianceScore, CostCalculator, DecisionHelper, DecisionTool, DecisionWizard, KeyToggle, StreamDemo, TierSelector } from "@/components/lazy";

const text = (n: ReactNode): string => (typeof n === "string" || typeof n === "number" ? String(n) : Array.isArray(n) ? n.map(text).join("") : n && typeof n === "object" && "props" in n ? text((n as { props: { children?: ReactNode } }).props.children) : "");
/** Ported SVG artwork already uses the brand gold; only the live site's reveal attributes are removed. */
const recolor = (s: string) => s.replace(/\sdata-reveal(="")?/g, "");

export function Callout({ children }: { children: ReactNode }) {
  return <aside className="glass my-8 border-l-2 !border-l-accent p-5 text-[16.5px] [&>p]:m-0">{children}</aside>;
}

/** <Widget post="slug" /> — picks the widget family from content/widgets/<slug>.json. */
export function Widget({ post }: { post: string }) {
  let data;
  try { data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "widgets", `${post}.json`), "utf8")); } catch { return null; }
  switch (data.type) {
    case "quiz": return <DecisionTool data={data} title={post} />;
    case "wizard": return <DecisionWizard data={data} />;
    case "checklist": return <ComplianceScore data={data} />;
    case "audit": return <Checklist data={data} />;
    case "custom": return <CostCalculator slug={post} data={data} />;
    default: return null;
  }
}

const DEMOS: Record<string, () => ReactNode> = {
  "ai-chatbot-app-react-native-1": () => <ChatDemo />,
  "ai-chatbot-app-react-native-2": () => <TierSelector />,
  "on-device-ai-react-native-2": () => <DecisionHelper />,
  "react-native-chatgpt-integration-1": () => <KeyToggle />,
  "react-native-chatgpt-integration-2": () => <StreamDemo />,
};
/** <Embed id="…" /> — interactive demo if one is registered, otherwise the static figure from content/blog-embeds. */
export function Embed({ id }: { id: string }) {
  if (DEMOS[id]) return DEMOS[id]();
  const html = recolor(readEmbed(id));
  if (!html) return null;
  if (id === "ai-react-native-app-development-1") return <ArchTabs svg={/<svg[\s\S]*<\/svg>/.exec(html)?.[0] ?? ""} />;
  // Static SVG figures authored by us (ported verbatim from the live site).
  return <div className="legacy-art figure not-prose my-8 mx-auto max-w-[720px]" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function FaqList({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 border-t border-line">{children}</div>;
}
export function Faq({ q, children }: { q: string; children: ReactNode }) {
  return <FaqItem q={q}><div className="[&_a]:text-accent-2 [&_a]:underline [&_p+p]:mt-3">{children}</div></FaqItem>;
}

async function Pre({ children }: ComponentProps<"pre">) {
  const code = children as { props?: { className?: string; children?: string } };
  const src = String(code?.props?.children ?? "").replace(/\n$/, ""), lang = /language-(\w+)/.exec(code?.props?.className ?? "")?.[1] ?? "tsx";
  let html: string;
  try { html = await codeToHtml(src, { lang, theme: "github-dark-default" }); } catch { html = await codeToHtml(src, { lang: "text", theme: "github-dark-default" }); }
  return <div className="not-prose my-6 overflow-x-auto rounded-2xl border border-line text-[14px] leading-relaxed [&_pre]:!bg-[#0b0c10] [&_pre]:p-5" tabIndex={0} role="region" aria-label="Code example" dangerouslySetInnerHTML={{ __html: html }} />;
}

export const mdxComponents = {
  Callout, Widget, Embed, FaqList, Faq,
  h2: ({ children }: ComponentProps<"h2">) => <h2 id={slugifyHeading(text(children))} className="scroll-mt-28">{children}</h2>,
  a: ({ href = "", children }: ComponentProps<"a">) => href.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href} {...(href.startsWith("http") && !href.includes("calendly.com") ? { target: "_blank", rel: "noopener" } : {})}>{children}</a>,
  pre: Pre,
  table: (p: ComponentProps<"table">) => <div className="not-prose my-6 overflow-x-auto rounded-2xl border border-line"><table className="w-full border-collapse text-left text-[15px] [&_td]:border-t [&_td]:border-line [&_td]:p-3.5 [&_td]:align-top [&_td]:text-mid [&_th]:bg-bg-2 [&_th]:p-3.5 [&_th]:text-[13px] [&_th]:text-hi [&_strong]:text-hi" {...p} /></div>,
};
