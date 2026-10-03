"use client";
import { Children, useEffect, useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";

/** Blog index filtering: category chips + text search. Cards are server-rendered and just shown/hidden. */
export function FilterGrid({ items, children }: { items: { cats: string[]; text: string }[]; children: ReactNode }) {
  const cats = useMemo(() => { const c = new Map<string, number>(); items.forEach((i) => i.cats.forEach((x) => c.set(x, (c.get(x) ?? 0) + 1))); return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k); }, [items]);
  const [cat, setCat] = useState("All"), [q, setQ] = useState("");
  const kids = Children.toArray(children), t = q.trim().toLowerCase();
  const match = items.map((i) => (cat === "All" || i.cats.includes(cat)) && (!t || i.text.includes(t)));
  const count = match.filter(Boolean).length;
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full sm:w-[300px]"><span className="sr-only">Search posts</span><Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lo" aria-hidden /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" className="field !min-h-[44px] !rounded-full !pl-11" /></label>
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">{["All", ...cats].map((c) => <button key={c} type="button" className="chip !px-4 !py-2 !text-[12.5px]" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}</div>
      </div>
      <p className="dim mt-4" role="status">{count} {count === 1 ? "post" : "posts"}</p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{kids.map((k, i) => <li key={i} hidden={!match[i]}>{k}</li>)}</ul>
      {count === 0 && <p className="muted mt-6">Nothing matches that yet. Try a different category or search term.</p>}
    </>
  );
}

/** Reading progress bar + auto table of contents with scroll spy. */
export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => { const a = document.getElementById("article"); if (!a) return; const r = a.getBoundingClientRect(); setP(Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)))); };
    on(); window.addEventListener("scroll", on, { passive: true });
    document.documentElement.dataset.article = "1"; // the page-level scroll line steps aside (see .scroll-progress)
    return () => { window.removeEventListener("scroll", on); delete document.documentElement.dataset.article; };
  }, []);
  return <div className="reading-progress fixed inset-x-0 top-0 z-[110] h-[3px]" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)}><div className="h-full origin-left" style={{ transform: `scaleX(${p})`, background: "var(--grad)" }} /></div>;
}
export function Toc({ headings }: { headings: { id: string; text: string }[] }) {
  const [active, setActive] = useState(headings[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver((es) => { const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setActive(v.target.id); }, { rootMargin: "-90px 0px -65% 0px" });
    headings.forEach((h) => { const el = document.getElementById(h.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [headings]);
  if (headings.length < 2) return null;
  return (
    <nav aria-label="On this page" className="text-[14px]">
      <p className="eyebrow mb-4">On this page</p>
      <ol className="grid gap-2.5 border-l border-line">
        {headings.map((h) => <li key={h.id}><a href={`#${h.id}`} aria-current={active === h.id ? "location" : undefined} className={`-ml-px block border-l-2 pl-4 leading-snug transition-colors ${active === h.id ? "border-accent-2 text-hi" : "border-transparent text-lo hover:text-hi"}`}>{h.text}</a></li>)}
      </ol>
    </nav>
  );
}
export function ShareRow({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const e = encodeURIComponent;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-2">Share</span>
      <a className="chip" target="_blank" rel="noopener" href={`https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`}>LinkedIn</a>
      <a className="chip" target="_blank" rel="noopener" href={`https://twitter.com/intent/tweet?url=${e(url)}&text=${e(title)}`}>X</a>
      <a className="chip" target="_blank" rel="noopener" href={`https://wa.me/?text=${e(`${title} ${url}`)}`}>WhatsApp</a>
      <a className="chip" href={`mailto:?subject=${e(title)}&body=${e(url)}`}>Email</a>
      <button type="button" className="chip" onClick={() => navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })}><span aria-live="polite">{copied ? "Copied ✓" : "Copy link"}</span></button>
    </div>
  );
}
