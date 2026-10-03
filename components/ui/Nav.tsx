"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Blocks, Brain, Car, ChevronDown, Cloud, Fingerprint, LayoutTemplate, Menu, Moon, Search, Server, Smartphone, Store, Sun, Users, Vault, X } from "lucide-react";
import Logo from "./Logo";
import { industries, megaServices, nav, site } from "@/content/site";
import { useApp } from "@/components/providers/AppProviders";

const ICONS: Record<string, typeof Blocks> = { phone: Smartphone, blocks: Blocks, server: Server, brain: Brain, cloud: Cloud, users: Users, layout: LayoutTemplate, vault: Vault, store: Store, car: Car, fingerprint: Fingerprint };

export default function Nav() {
  const pathname = usePathname();
  const { openPalette, theme, toggleTheme, reduced } = useApp();
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [open, setOpen] = useState(false);
  const megaRef = useRef<HTMLLIElement>(null);

  // hide on scroll down, show on scroll up
  useEffect(() => {
    let last = window.scrollY;
    const on = () => { const y = window.scrollY; setHidden(y > 140 && y > last + 4 ? true : y < last - 4 ? false : (h) => h); last = y; };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) { setSeenPath(pathname); setOpen(false); setMega(false); }
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setMega(false); } };
    const c = (e: MouseEvent) => { if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMega(false); };
    window.addEventListener("keydown", k); document.addEventListener("mousedown", c);
    return () => { window.removeEventListener("keydown", k); document.removeEventListener("mousedown", c); document.documentElement.style.overflow = ""; };
  }, [open]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, "")));
  return (
    <header className="fixed inset-x-0 top-0 z-[100] px-3 pt-3 transition-transform duration-500 ease-[var(--ease-expo)]" style={{ transform: hidden && !open && !mega ? "translateY(-120%)" : "none" }} data-loc="nav">
      <nav aria-label="Primary" className="glass mx-auto flex h-[var(--nav-h)] max-w-[1440px] items-center justify-between gap-4 !rounded-full px-4 md:px-6">
        <Link href="/" aria-label={`${site.name} — home`} className="shrink-0"><Logo /></Link>
        <ul className="hidden items-center gap-1 xl:flex">
          {nav.map((n) => n.mega === "services" ? (
            <li key={n.href} ref={megaRef} className="relative" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
              <span className="flex items-center">
                <Link href={n.href} className={`rounded-full px-3 py-2 text-[14.5px] transition-colors hover:text-hi ${active(n.href) ? "text-hi" : "text-mid"}`} aria-current={active(n.href) ? "page" : undefined}>{n.label}</Link>
                <button aria-expanded={mega} aria-controls="mega" aria-label="Open services and industries menu" onClick={() => setMega((m) => !m)} className="-ml-2 rounded-full p-1.5 text-mid hover:text-hi"><ChevronDown size={14} className={`transition-transform ${mega ? "rotate-180" : ""}`} /></button>
              </span>
                {mega && (
                  <div id="mega" className="absolute left-0 top-full w-[760px] pt-4 [perspective:900px]"><div className="menu-in">
                    <div className="glass grid grid-cols-[1.5fr_1fr] gap-6 !bg-bg-1/95 p-6">
                      <div>
                        <p className="eyebrow mb-3">Services</p>
                        <ul className="grid gap-1">{megaServices.map((s) => { const I = ICONS[s.icon]; return (
                          <li key={s.href}><Link href={s.href} className="group flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5">
                            <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-bg-2 text-accent-2 transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)_scale(1.08)]"><I size={18} strokeWidth={1.5} /></span>
                            <span className="text-[14.5px] text-hi"><span className="step-n mr-2">{s.n}</span>{s.label}</span>
                          </Link></li>); })}</ul>
                      </div>
                      <div>
                        <p className="eyebrow mb-3">Industries</p>
                        <ul className="grid gap-1">{industries.map((s) => { const I = ICONS[s.icon]; return (
                          <li key={s.href}><Link href={s.href} className="group flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5">
                            <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-bg-2 text-accent-ink transition-transform duration-500 group-hover:[transform:rotateY(180deg)_scale(1.08)]"><I size={18} strokeWidth={1.5} /></span>
                            <span className="text-[14.5px] text-hi">{s.label}</span>
                          </Link></li>); })}</ul>
                        <Link href="/hire/" className="mt-4 block rounded-xl border border-line p-3 text-[13.5px] text-mid hover:text-hi">Need engineers, not a project? <span className="text-accent-2">See engagement models →</span></Link>
                      </div>
                    </div>
                  </div></div>
                )}
            </li>
          ) : (
            <li key={n.href}><Link href={n.href} className={`rounded-full px-3 py-2 text-[14.5px] transition-colors hover:text-hi ${active(n.href) ? "text-hi" : "text-mid"}`} aria-current={active(n.href) ? "page" : undefined}>{n.label}</Link></li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5">
          <button onClick={openPalette} aria-label="Search the site (Ctrl or Command + K)" className="hidden h-10 items-center gap-2 rounded-full border border-line px-3 text-[13px] text-mid hover:text-hi md:flex"><Search size={15} /><kbd className="mono text-[11px]">⌘K</kbd></button>
          <button onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className="grid h-10 w-10 place-items-center rounded-full text-mid hover:text-hi">{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
          <a href={site.calendly} className="btn btn-primary hidden !min-h-[42px] !px-5 !text-[14px] sm:inline-flex" data-magnetic="0.2" data-cursor="Book" data-cta>Book a Call</a>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} className="grid h-10 w-10 place-items-center rounded-full border border-line xl:hidden">{open ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </nav>
        {open && (
          <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fade-in fixed inset-0 -z-10 overflow-y-auto bg-bg-0/97 px-6 pb-28 pt-28 backdrop-blur-2xl xl:hidden">
            <div aria-hidden className="pointer-events-none absolute right-[-20%] top-[12%] h-[60vw] w-[60vw] rounded-full opacity-60 blur-3xl" style={{ background: "conic-gradient(from 0deg,#C9A24B,#F2DA8C,#C9A24B)", animation: reduced ? undefined : "spin 14s linear infinite" }} />
            <ul className="relative grid gap-1">
              {[...nav, { label: "Hire a Developer", href: "/hire/" }, { label: "App Cost Calculator", href: "/app-cost-calculator/" }].map((n, i) => (
                <li key={n.href} className="rise-in" style={{ "--i": i } as React.CSSProperties}>
                  <Link href={n.href} className="font-display block py-2 text-[34px] font-semibold tracking-tight">{n.label}</Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow relative mt-8">Industries</p>
            <ul className="relative mt-3 flex flex-wrap gap-2">{industries.map((s) => <li key={s.href}><Link href={s.href} className="chip !text-[14px]">{s.label}</Link></li>)}</ul>
            <a href={site.calendly} className="btn btn-primary btn-lg relative mt-10 w-full" data-cta>Book a Call</a>
          </div>
        )}
    </header>
  );
}
