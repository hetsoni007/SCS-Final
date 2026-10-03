import Link from "next/link";
import { createElement, type ElementType, type ReactNode } from "react";

/**
 * Renders the limited inline HTML produced by the content extractor (a, strong, b, em, i, br, code).
 * Parsed to React nodes — never injected raw — and internal links become <Link>.
 */
const TOKEN = /<(\/?)(a|strong|b|em|i|br|code|u|small|sup|sub|mark)(\s[^>]*)?>/gi;
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

/** Wraps hyphenated words so a display heading never breaks right after the hyphen ("senior-" / "only"). */
function keepHyphens(text: string, key: () => number): ReactNode[] {
  return text.split(/([A-Za-z0-9]+(?:-[A-Za-z0-9]+)+)/g).map((part, i) => (i % 2 ? <span key={`h${key()}`} className="whitespace-nowrap">{part}</span> : part)).filter((p) => p !== "");
}

export function parseInline(html: string, opts: { hyphens?: boolean } = {}): ReactNode[] {
  type Frame = { tag: string; href?: string; kids: ReactNode[] };
  const root: Frame = { tag: "root", kids: [] }, stack = [root];
  let last = 0, key = 0, m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  const push = (n: ReactNode) => { if (opts.hyphens && typeof n === "string") stack[stack.length - 1].kids.push(...keepHyphens(n, () => key++)); else stack[stack.length - 1].kids.push(n); };
  while ((m = TOKEN.exec(html))) {
    if (m.index > last) push(decode(html.slice(last, m.index)));
    last = TOKEN.lastIndex;
    const [, close, rawTag, attrs] = m, tag = rawTag.toLowerCase();
    if (tag === "br") { push(<br key={key++} />); continue; }
    if (!close) { stack.push({ tag, href: /href="([^"]*)"/.exec(attrs ?? "")?.[1], kids: [] }); continue; }
    if (stack.length > 1) {
      const f = stack.pop()!;
      if (f.tag === "a") {
        const href = decode(f.href ?? "#");
        push(href.startsWith("/") ? <Link key={key++} href={href}>{f.kids}</Link> : <a key={key++} href={href} {...(href.startsWith("http") && !href.includes("calendly.com") ? { target: "_blank", rel: "noopener" } : {})}>{f.kids}</a>);
      } else push(createElement(f.tag === "b" ? "strong" : f.tag, { key: key++ }, ...f.kids));
    }
  }
  if (last < html.length) push(decode(html.slice(last)));
  while (stack.length > 1) { const f = stack.pop()!; stack[stack.length - 1].kids.push(...f.kids); }
  return root.kids;
}
export const stripTags = (html: string) => decode(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

export default function Rich({ html, as: T = "span", className, hyphens }: { html: string; as?: ElementType; className?: string; hyphens?: boolean }) {
  return createElement(T, { className: className ? `rich ${className}` : "rich" }, ...parseInline(html, { hyphens }));
}
