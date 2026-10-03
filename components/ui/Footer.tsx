"use client";
import Link from "next/link";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";
import Logo from "./Logo";
import { footer, site } from "@/content/site";
import { useApp } from "@/components/providers/AppProviders";

function Col({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="eyebrow mb-4">{title}</h2>
      <ul className="grid gap-2.5 text-[15px]">
        {items.map((i) => (
          <li key={i.href + i.label}>
            {i.href.startsWith("/") ? <Link href={i.href} className="text-mid hover:text-hi">{i.label}</Link> : <a href={i.href} className="text-mid hover:text-hi" {...(i.href.startsWith("http") && !i.href.startsWith(site.calendly) ? { target: "_blank", rel: "noopener" } : {})}>{i.label}</a>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { reduced, setReduced } = useApp();
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line pb-24 md:pb-10" data-loc="footer">
      <div className="wrap relative grid items-center gap-6 pt-20 md:grid-cols-2 md:pt-28">
        <div>
          <p className="eyebrow">React Native · MERN · AI</p>
          <p className="display mt-5 !text-[clamp(56px,9vw,150px)]">Let&apos;s <span className="grad-text">ship it.</span></p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.calendly} className="btn btn-primary btn-lg" data-magnetic="0.25" data-cursor="Book" data-cta>Book a Free Call →</a>
            <a href={`mailto:${site.email}`} className="btn btn-glass btn-lg">{site.email}</a>
          </div>
        </div>
        <ViewSlot scene="globe" className="mx-auto aspect-square w-full max-w-[560px]" poster={<Poster kind="globe" />} />
      </div>
      <div className="wrap mt-16 grid gap-10 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="muted mt-4 max-w-[34ch] text-[15px]">A boutique, senior-only studio building React Native, MERN and AI-powered apps. Serving the UK, US, UAE, India, Canada and Australia.</p>
          <label className="mt-6 flex cursor-pointer items-center gap-3 text-[14px] text-mid">
            <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" checked={reduced} onChange={(e) => setReduced(e.target.checked)} />
            Reduce motion
          </label>
        </div>
        <Col title="Explore" items={footer.explore} />
        <Col title="Industries" items={[...footer.industries, ...footer.regions]} />
        <Col title="Company" items={footer.company} />
        <Col title="Start" items={[...footer.start, ...footer.tools]} />
      </div>
      <div className="wrap mt-12 text-[13px] text-lo">{site.footerLine}</div>
      {/* oversized brand mark: decorative, rises into place as the page ends */}
      <div aria-hidden className="footer-mark wrap mt-10 select-none overflow-hidden">
        <span className="font-display block text-center text-[clamp(96px,40vw,420px)] font-bold leading-[0.78] tracking-[-0.04em]"><span className="grad-text">SONI</span></span>
      </div>
    </footer>
  );
}
