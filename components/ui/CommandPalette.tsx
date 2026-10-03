"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Item = { title: string; href: string; group: string; kw?: string };
/** ⌘K site search. The index (pages + posts) is fetched once from /search-index.json. */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => { fetch("/search-index.json").then((r) => r.json()).then(setItems).catch(() => {}); }, []);
  // The dialog mounts fresh on every open, which resets the query and selection.
  return open ? <PaletteDialog items={items} onClose={onClose} /> : null;
}

function PaletteDialog({ items, onClose }: { items: Item[]; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null), list = useRef<HTMLUListElement>(null);
  useEffect(() => { input.current?.focus(); }, []);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const r = !t.length ? items.filter((i) => i.group !== "Blog") : items.filter((i) => t.every((w) => `${i.title} ${i.group} ${i.kw ?? ""}`.toLowerCase().includes(w)));
    return r.slice(0, 12);
  }, [q, items]);
  useEffect(() => { list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" }); }, [sel]);
  const go = (i: Item) => { onClose(); router.push(i.href); };
  return (
    <div className="fixed inset-0 z-[165] bg-black/60 p-4 pt-[14vh] backdrop-blur-md" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Search the site" className="glass mx-auto max-w-[620px] overflow-hidden !bg-bg-1" onClick={(e) => e.stopPropagation()} data-lenis-prevent
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
          if (e.key === "Enter" && results[sel]) go(results[sel]);
          if (e.key === "Tab") e.preventDefault(); // single focusable control: keep focus in the dialog
        }}>
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search size={18} className="text-mid" aria-hidden />
          <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} placeholder="Search pages, services, posts…" aria-label="Search" role="combobox" aria-expanded aria-controls="cmd-list" aria-activedescendant={results[sel] ? `cmd-${sel}` : undefined} className="h-14 w-full bg-transparent text-[16px] outline-none placeholder:text-lo" />
          <kbd className="mono rounded border border-line px-1.5 py-0.5 text-[11px] text-lo">Esc</kbd>
        </div>
        <ul ref={list} id="cmd-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="p-4 text-[14px] text-mid">No matches. Try “React Native”, “cost” or “AI”.</li>}
          {results.map((r, i) => (
            <li key={r.href} id={`cmd-${i}`} role="option" aria-selected={i === sel} onMouseEnter={() => setSel(i)} onClick={() => go(r)} className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 text-[15px] ${i === sel ? "bg-white/8 text-hi" : "text-mid"}`}>
              <span className="truncate">{r.title}</span><span className="mono shrink-0 text-[11px] uppercase tracking-wider text-lo">{r.group}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
