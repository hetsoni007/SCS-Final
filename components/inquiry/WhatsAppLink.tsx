"use client";
import { MessageCircle } from "lucide-react";
import { waHref } from "@/lib/whatsapp";

/** WhatsApp link. The href is rebuilt at click time with the current page and utm_campaign (see AppProviders). */
export default function WhatsAppLink({ className, children = "Chat on WhatsApp", icon = true, loc }: { className?: string; children?: React.ReactNode; icon?: boolean; loc?: string }) {
  return (
    <a href={waHref()} data-wa data-loc={loc} target="_blank" rel="noopener" className={className}>
      {icon && <MessageCircle size={17} aria-hidden />}{children}
    </a>
  );
}
