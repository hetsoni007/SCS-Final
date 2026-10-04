import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Check } from "lucide-react";
import Rich, { stripTags } from "@/components/ui/Rich";
import { FaqItem } from "@/components/ui/Bits";
import { PhoneFrame } from "@/components/ui/Poster";
import { LeadForm } from "@/components/lazy";
import { START_CONSENT, START_FIELDS, START_NOTE, START_SUCCESS, type FieldDef } from "@/content/forms";
import type { Block, FormField } from "@/lib/content";

/** Renders the typed block tree in content/pages/*.json. One renderer keeps every ported page visually consistent. */

const COLS: Record<number, string> = { 1: "", 2: "md:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4", 5: "sm:grid-cols-2 lg:grid-cols-5" };
function cols(cls = "", n: number) {
  if (/\bg5\b/.test(cls)) return 5;
  if (/\bg4\b|dora-grid|svc-row|\bpipe\b/.test(cls)) return 4;
  if (/\bg2\b|gauto|benefit-grid|obs-low/.test(cls)) return 2;
  if (/proc-grid/.test(cls)) return Math.min(n, 5);
  if (/why-grid|case-strip/.test(cls)) return Math.min(n, 4);
  if (/\btl\b/.test(cls)) return 1;
  if (/idea-grid/.test(cls)) return 3;
  return Math.min(n, 3);
}
const isCard = (cls = "") => /glass|feat|proc|idea|model|tier|why|benefit|case-card|region|scope|role|step|svc|dora|obs-card/.test(cls);
const A = ({ href, className, children, ...rest }: { href: string; className?: string; children: ReactNode } & Record<string, unknown>) =>
  href.startsWith("/") || href.startsWith("#") ? <Link href={href} className={className} {...rest}>{children}</Link>
    : <a href={href} className={className} {...(href.startsWith("http") && !href.includes("calendly.com") ? { target: "_blank", rel: "noopener" } : {})} {...rest}>{children}</a>;

const TEXT_CLS: Record<string, string> = {
  n: "step-n block", num: "step-n block text-[15px]", nm: "h3 block", t: "h3 block mt-2 [overflow-wrap:anywhere]", c: "h3 block mt-3", ds: "muted block mt-2 text-[15.5px]", d: "muted block mt-2 text-[15px]", i: "dim block mt-1",
  lk: "mt-4 block text-[15px] text-accent-2", lab: "eyebrow", fl: "block text-[34px] leading-none", tag: "chip mt-4", badge: "chip on mb-3", hot: "chip on", wk: "mono block text-[15px] text-accent-2 md:w-[170px] md:shrink-0",
  bd: "muted block", pr: "font-display mt-2 block text-[28px] font-semibold text-hi [&_small]:text-[14px] [&_small]:font-normal [&_small]:text-mid", lbl: "eyebrow", muted: "muted", "lead-sm": "muted",
  "article-callout": "glass block border-l-2 !border-l-accent p-5 text-[16px] text-mid", "article-cat": "eyebrow", "article-meta": "dim block mt-4", ti: "h3 block", "demo-badge": "chip",
};

export function formFields(f: Extract<Block, { t: "form" }>): FieldDef[] {
  if (f.id === "leadForm") return START_FIELDS;
  const pair = new Set(["fn", "ln", "em2", "co", "wpName", "wpPhone", "wpEmail", "wpBiz"]);
  const canon: Record<string, string> = { fn: "firstName", ln: "lastName", co: "company", svc: "service", msg: "message", wpName: "name", wpPhone: "phone", wpBiz: "business", wpType: "need", wpMsg: "message", sgName: "name", sgCompany: "company", sgStage: "stage" };
  return f.fields.filter((x: FormField) => x.type !== "checkbox" && x.type !== "submit").map((x: FormField) => {
    const type = x.type === "email" ? "email" : x.type === "textarea" ? "textarea" : x.type === "select" ? "select" : "text";
    const name = type === "email" ? "email" : canon[x.id ?? ""] ?? (x.name || x.id || x.label).replace(/[^a-zA-Z0-9]+/g, "_");
    // the live forms require a name and a valid email; everything else is optional
    const required = type !== "email" && (x.required || ["fn", "wpName", "sgName"].includes(x.id ?? ""));
    return { name, label: x.label || x.placeholder || name, type, placeholder: x.placeholder, required, options: x.options?.filter((o) => !/^select/i.test(o)), half: pair.has(x.id ?? "") || (type !== "textarea" && f.fields.length <= 4 && false), autoComplete: name === "name" || name === "firstName" ? "given-name" : name === "lastName" ? "family-name" : type === "email" ? "email" : name === "phone" ? "tel" : name === "company" || name === "business" ? "organization" : undefined } as FieldDef;
  });
}

export function RenderForm({ b, kind }: { b: Extract<Block, { t: "form" }>; kind?: "lead" | "contact" | "wordpress" | "guide" | "newsletter" }) {
  const k = kind ?? (b.id === "contactForm" ? "contact" : b.id === "wpForm" ? "wordpress" : "lead");
  const std = b.id === "leadForm";
  return (
    <div id={std ? "start" : undefined} className={std ? "glass spot mx-auto max-w-[880px] p-7 md:p-10" : ""}>
      {std && (<><p className="eyebrow">{b.kick ?? "Start here"}</p><h2 className="h3 mt-3 !text-[clamp(26px,3vw,38px)]">{b.title}</h2>{b.sub && <p className="muted mt-3">{b.sub}</p>}{b.price && <p className="mono mt-4 text-[13px] uppercase tracking-[.12em] text-accent-2">{b.price}</p>}<div className="h-7" /></>)}
      {!std && b.price && <p className="mono mb-5 text-[13px] uppercase tracking-[.12em] text-accent-2">{b.price}</p>}
      <LeadForm kind={k} fields={formFields(b)} submit={b.submit || "Send →"} note={std ? START_NOTE : b.note} consent={std ? START_CONSENT : b.consent} success={std ? START_SUCCESS : b.success} />
    </div>
  );
}

function Card({ item, i, children }: { item: { cls?: string; href?: string; id?: string }; i: number; children: ReactNode }) {
  const card = isCard(item.cls);
  const cls = `${card ? "glass spot p-6 md:p-7" : ""} ${/\btl-row\b/.test(item.cls ?? "") ? "flex flex-col gap-2 border-b border-line py-5 md:flex-row md:gap-8" : ""} block h-full`;
  const props = { id: item.id, "data-reveal": true, style: { "--i": i % 6 } as CSSProperties };
  return item.href ? <A href={item.href} className={cls} data-cursor="View" {...props}>{children}</A> : <div className={cls} {...props}>{children}</div>;
}

/**
 * `hLevel` forces the level of headings in this list; `cardLevel` is the level used for headings inside
 * cards and panels (3 by default, 2 when the section has no heading of its own, so the outline never skips).
 */
export function Blocks({ blocks, inCard = false, hLevel, cardLevel = 3 }: { blocks: Block[]; inCard?: boolean; hLevel?: number; cardLevel?: number }) {
  let plain = 0; // order of class-less text blocks inside a card: kicker → title → call to action
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "eyebrow": return <p key={i} className="eyebrow" data-reveal>{b.text}</p>;
          case "h": {
            const lvl = hLevel ?? b.level, T = `h${Math.min(lvl, 4)}` as "h1" | "h2" | "h3" | "h4";
            const long = stripTags(b.html).length > 36;
            const cls = inCard ? (b.cls?.includes("h2") ? "h2" : "h3 mt-3") : lvl === 1 ? `h1 h1-hero mt-5 ${long ? "h1-long" : ""}` : lvl === 2 ? "h2 mt-4 max-w-[22ch]" : "h3 mt-6";
            return <T key={i} className={cls} data-reveal><Rich html={b.html} hyphens={lvl <= 2} /></T>;
          }
          case "p": return <p key={i} className={`${b.cls?.includes("lead") ? "lead mt-5" : b.cls?.includes("dim") || b.cls?.includes("legal") ? "dim mt-5" : `muted mt-3 ${inCard ? "text-[15.5px]" : "max-w-[70ch]"}`}`} data-reveal><Rich html={b.html} /></p>;
          case "text": {
            const key = (b.cls ?? "").split(" ").find((c) => TEXT_CLS[c]);
            if (key) return b.href ? <A key={i} href={b.href} className={TEXT_CLS[key]}><Rich html={b.html} /></A> : <span key={i} className={TEXT_CLS[key]}><Rich html={b.html} /></span>;
            const n = plain++;
            const cls = !inCard ? "muted block mt-3" : n === 0 && blocks.length > 1 ? "mono block text-[11px] uppercase tracking-widest text-accent-2" : n === 1 ? "h3 mt-2 block" : "mt-3 block text-[15px] text-accent-2";
            return b.href ? <A key={i} href={b.href} className={cls}><Rich html={b.html} /></A> : <span key={i} className={cls}><Rich html={b.html} /></span>;
          }
          case "list": {
            const L = b.ordered ? "ol" : "ul";
            return <L key={i} className="mt-4 grid gap-2.5 text-[15.5px] text-mid">{b.items.map((it, j) => <li key={j} className="flex gap-3">{b.ordered ? <span className="step-n mt-0.5">{String(j + 1).padStart(2, "0")}</span> : <Check size={16} className="mt-1 shrink-0 text-accent-2" aria-hidden />}<Rich html={it} /></li>)}</L>;
          }
          case "table": return (
            <div key={i} className="mt-6 overflow-x-auto"><table className="w-full text-left text-[15px]"><thead><tr>{b.head.map((h, j) => <th key={j} className="mono border-b border-line p-3 text-[12px] uppercase tracking-wider text-hi"><Rich html={h} /></th>)}</tr></thead>
              <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k} className="border-b border-line p-3 align-top text-mid"><Rich html={c} /></td>)}</tr>)}</tbody></table></div>);
          case "img": return /portfolio/.test(b.src) ? <PhoneFrame key={i} src={b.src} alt={b.alt} className="mx-auto w-[58%] max-w-[220px]" /> : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={b.src} alt={b.alt} loading="lazy" className="rounded-2xl" />);
          case "buttons": return <div key={i} className="mt-8 flex flex-wrap gap-3" data-reveal>{b.items.map((x, j) => x.href ? <A key={j} href={x.href} className={`btn ${inCard ? "" : "btn-lg"} ${x.variant === "primary" ? "btn-primary" : "btn-glass"}`} data-magnetic="0.2" data-cta>{x.label}</A> : null)}</div>;
          case "chips": return <ul key={i} className="mt-5 flex flex-wrap gap-2" data-reveal>{b.items.map((c, j) => <li key={j}>{c.href ? <A href={c.href} className="chip">{c.label}</A> : <span className="chip">{c.label}</span>}</li>)}</ul>;
          case "metric": return <div key={i}><span className="font-display block text-[clamp(44px,5vw,72px)] font-bold leading-none tracking-tighter"><span className="grad-text">{b.num}</span></span><span className="muted mt-3 block text-[15px]">{b.lbl}</span></div>;
          case "quote": return <blockquote key={i} className="font-display mt-6 border-l-2 border-accent pl-5 text-[20px] text-hi"><Rich html={b.html} /></blockquote>;
          case "faq": return <div key={i} className="mt-10 max-w-[900px] border-t border-line">{b.items.map((f, j) => <FaqItem key={j} q={f.q}><Rich html={f.a} as="p" /></FaqItem>)}</div>;
          case "form": return <RenderForm key={i} b={b} />;
          case "grid": {
            const c = cols(b.cls, b.items.length);
            if (b.items.every((it) => it.blocks.length === 0)) return null;
            return (
              <div key={i} className={`grid gap-4 ${inCard ? "mt-5" : "mt-12"} ${COLS[c]}`}>
                {b.items.filter((it) => it.blocks.length).map((it, j) => {
                  // stat tiles: a number + label pair (the same `.num` class is a step number elsewhere)
                  const num = it.blocks.find((x) => x.t === "text" && x.cls === "num"), lbl = it.blocks.find((x) => x.t === "text" && x.cls === "lbl");
                  if (/\bmetric\b/.test(it.cls ?? "") && num && lbl) {
                    return <Card key={j} item={{ ...it, cls: "glass" }} i={j}><Blocks blocks={[{ t: "metric", num: stripTags((num as { html: string }).html), lbl: stripTags((lbl as { html: string }).html) }]} inCard /></Card>;
                  }
                  return <Card key={j} item={it} i={j}><Blocks blocks={it.blocks} inCard hLevel={cardLevel} /></Card>;
                })}
              </div>
            );
          }
          case "panel": {
            const cls = `glass spot block p-6 md:p-8 ${inCard ? "" : "mt-6"}`;
            return b.href ? <A key={i} href={b.href} className={cls}><Blocks blocks={b.blocks} inCard hLevel={cardLevel} /></A> : <div key={i} id={b.id} className={cls} data-reveal><Blocks blocks={b.blocks} inCard hLevel={/form-card/.test(b.cls ?? "") ? 2 : cardLevel} /></div>;
          }
          case "group": {
            const layout = /contact-grid|lead-grid|scoping-grid/.test(b.cls ?? "") ? "grid gap-5 lg:grid-cols-2 [&>*]:mt-0" : /cred-bar|trust-row/.test(b.cls ?? "") ? "flex flex-wrap items-center gap-x-6 gap-y-2 [&>*]:mt-0" : "";
            return <div key={i} id={b.id} className={`${layout} ${inCard ? "" : "mt-6"}`}><Blocks blocks={b.blocks} inCard={inCard} hLevel={hLevel} cardLevel={cardLevel} /></div>;
          }
        }
      })}
    </>
  );
}
export const blockText = (b: Block): string => ("html" in b ? stripTags(b.html) : "text" in b ? b.text : "");
