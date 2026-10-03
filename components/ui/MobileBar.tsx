"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

/**
 * Sticky CTA bar on small screens. The home page shows its own two actions (portfolio, connect), matching the hero;
 * every other page shows "Book a Call" (upgraded to the Calendly modal by AppProviders) and "Estimate cost".
 */
export default function MobileBar() {
  const home = usePathname() === "/";
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] flex gap-2 border-t border-line bg-bg-0/85 p-2 backdrop-blur-xl md:hidden" data-loc="mobile-bar">
      {home ? (
        <>
          <Link href="/work/" className="btn btn-primary flex-1 !min-h-[46px]" data-cta>View portfolio</Link>
          <a href={site.founder.linkedin} target="_blank" rel="noopener" className="btn btn-glass flex-1 !min-h-[46px]" data-cta>Connect with me</a>
        </>
      ) : (
        <>
          <a href={site.calendly} className="btn btn-primary flex-1 !min-h-[46px]" data-cta>Book a Call</a>
          <Link href="/app-cost-calculator/" className="btn btn-glass flex-1 !min-h-[46px]" data-cta>Estimate cost</Link>
        </>
      )}
    </div>
  );
}
