import type { Metadata } from "next";
import Link from "next/link";
import InquiryPanel from "@/components/inquiry/InquiryPanel";
import WhatsAppLink from "@/components/inquiry/WhatsAppLink";
import ChatLauncher from "@/components/chat/ChatLauncher";
import { inquiry } from "@/content/inquiry";
import { SectionHead } from "@/components/sections/SectionHead";
import { faqs, pains, steps } from "@/content/app-quote";
import { caseBySlug, projectsDelivered, storeAppCount } from "@/content/work";
import { site } from "@/content/site";

// Paid-traffic landing page: kept out of search results and the sitemap so it never competes with the service pages.
export const metadata: Metadata = {
  title: "Fixed-price iOS & Android MVPs — proposal in 48 hours",
  description: "Fixed-price iOS & Android MVPs from 8 weeks. Senior engineers, a written proposal in 48 hours.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/app-quote/" },
};

const cases = ["hr-payroll", "ride-hailing"].map((s) => caseBySlug(s)!);

export default function AppQuote() {
  return (
    <>
      <section className="relative pt-[calc(var(--nav-h)+28px)] md:pt-[calc(var(--nav-h)+64px)]" data-loc="hero">
        <div className="wrap pb-10 md:pb-16">
          <p className="eyebrow">{site.positioning}</p>
          <h1 className="display mt-3 !text-[clamp(30px,8.4vw,72px)] !leading-[1.04] md:mt-5 md:max-w-[18ch]">Fixed-price iOS &amp; Android MVPs from 8 weeks. <span className="grad-text">Proposal in 48 hours.</span></h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#proposal" data-inquiry className="btn btn-primary btn-lg !min-h-[52px] !px-6" data-cta>Get my fixed-price proposal</a>
            <WhatsAppLink className="btn btn-glass btn-lg !min-h-[52px] !gap-2 !px-6" />
          </div>
          <p className="dim mt-4 flex flex-wrap items-center gap-x-2">
            <span className="inline-block h-2 w-2 rounded-full bg-success" aria-hidden />
            GoodFirms 5.0 · {projectsDelivered} projects delivered, {storeAppCount} apps live in the app stores
          </p>
        </div>
      </section>

      <section className="section" data-loc="pains">
        <div className="wrap">
          <SectionHead eyebrow="Why founders hesitate" title="Three things that go wrong with app builds." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {pains.map((p) => (<div key={p.t} className="glass spot p-6 md:p-7" data-reveal><h3 className="font-display text-[22px] font-semibold tracking-tight">{p.t}</h3><p className="muted mt-3">{p.b}</p></div>))}
          </div>
        </div>
      </section>

      <section className="section" data-loc="process">
        <div className="wrap">
          <SectionHead eyebrow="How it works" title="Five steps, from idea to App Store." />
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {steps.map((s) => (<li key={s.n} className="glass p-5" data-reveal><span className="step-n">{s.n}</span><h3 className="font-display mt-2 text-[20px] font-semibold">{s.t}</h3><p className="muted mt-2 text-[15px]">{s.b}</p></li>))}
          </ol>
        </div>
      </section>

      <section className="section" data-loc="cases">
        <div className="wrap">
          <SectionHead eyebrow="Real builds" title="Live in users’ hands." lead="Product names are withheld under client NDAs. The numbers are real." />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {cases.map((c) => (
              <Link key={c.slug} href={`/work/${c.slug}/`} className="glass spot block p-6 md:p-8" data-reveal data-cta>
                <p className="eyebrow">{c.industry} · {c.duration}</p>
                <h3 className="font-display mt-3 text-[26px] font-semibold tracking-tight">{c.title}</h3>
                <p className="muted mt-3">{c.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {c.metrics.map((m) => (<li key={m.lbl} className="chip"><b className="mr-1.5 text-hi">{m.num}</b>{m.lbl}</li>))}
                </ul>
                <p className="mt-5 text-accent-2">See the case study →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" data-loc="founder">
        <div className="wrap grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div aria-hidden className="font-display grid h-28 w-28 place-items-center rounded-3xl border border-line-strong bg-bg-2 text-[44px] font-bold text-accent-2">{site.founder.initials}</div>
          <div>
            <p className="eyebrow">Who you’ll work with</p>
            <h2 className="h3 mt-3">{site.founder.name} — {site.founder.role}</h2>
            <p className="muted mt-4 max-w-[62ch]">5+ years building and shipping commercial apps — React Native, MERN and AI — live on the App Store and Google Play. The senior engineer who scopes, builds and ships your product is the person you talk to, not a sales rep who hands it to juniors.</p>
          </div>
        </div>
      </section>

      <section className="section" data-loc="faq">
        <div className="wrap max-w-[860px]">
          <SectionHead eyebrow="Questions" title="Before you ask." />
          <div className="mt-8 grid gap-3">
            {faqs.map((f) => (
              <details key={f.q} className="glass group p-5">
                <summary className="cursor-pointer list-none text-[17px] font-semibold text-hi">{f.q}</summary>
                <p className="muted mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {inquiry.chatEnabled && (
        <section className="section !py-10" data-loc="chat-launcher" aria-label="Ask a question"><div className="wrap"><ChatLauncher /></div></section>
      )}

      <section className="section" data-loc="final-cta">
        <div className="wrap"><InquiryPanel location="final-cta" /></div>
      </section>
    </>
  );
}
