import type { Metadata } from "next";
import Link from "next/link";
import ThanksTracker from "@/components/inquiry/ThanksTracker";
import WhatsAppLink from "@/components/inquiry/WhatsAppLink";
import { inquiry } from "@/content/inquiry";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Thanks — we have your request", robots: { index: false, follow: false }, alternates: { canonical: "/thanks/" } };

export default function Thanks() {
  return (
    <section className="section pt-[calc(var(--nav-h)+64px)]" data-loc="thanks">
      <div className="wrap max-w-[720px]">
        <p className="eyebrow">Request received</p>
        <h1 className="h2 mt-4">Thanks — it’s with Het.</h1>
        <p className="lead mt-5">You’ll hear back <strong className="text-hi">{inquiry.replyPromise}</strong>, usually with a straight answer on scope and a fixed price.</p>
        <p className="muted mt-8">Want to move faster? Pick a time or message directly:</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={site.calendly} className="btn btn-primary btn-lg" data-cta>Book a 20-minute call</a>
          <WhatsAppLink className="btn btn-glass btn-lg" />
        </div>
        <p className="mt-10 text-[15px] text-mid">While you wait: <Link href="/app-scoping-guide/" className="underline text-hi">the App Scoping Guide</Link> shows what to define before an app is quoted.</p>
      </div>
      <ThanksTracker />
    </section>
  );
}
