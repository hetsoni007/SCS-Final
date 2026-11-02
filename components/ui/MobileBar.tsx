"use client";
import WhatsAppLink from "@/components/inquiry/WhatsAppLink";

/**
 * Sticky CTA bar on small screens, on every page: WhatsApp, and the two-step proposal form (opened as a sheet by
 * AppProviders; Calendly stays in the header).
 */
export default function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] flex gap-2 border-t border-line bg-bg-0/85 p-2 backdrop-blur-xl md:hidden" data-loc="mobile-bar">
      <WhatsAppLink className="btn btn-glass flex-1 !min-h-[46px] !gap-2 !px-3 !text-[15px]" />
      <button type="button" data-inquiry className="btn btn-primary flex-1 !min-h-[46px] !px-3 !text-[15px]">Get a proposal</button>
    </div>
  );
}
