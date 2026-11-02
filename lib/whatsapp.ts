import { inquiry } from "@/content/inquiry";
import { getAttribution } from "@/lib/attribution";

/** wa.me link with a pre-filled message naming the page and the ad campaign. Rebuilt at click time (see AppProviders). */
export function waHref(page?: string): string {
  const num = inquiry.whatsapp.replace(/\D/g, "");
  const campaign = getAttribution().utm_campaign;
  const where = page ? ` (page: ${page}${campaign ? `, campaign: ${campaign}` : ""})` : "";
  const text = `Hi Het, I'd like a fixed-price proposal for my app${where}.`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
