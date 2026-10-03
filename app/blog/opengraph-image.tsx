import { getPage } from "@/lib/content";
import { ogContentType, ogImage, ogSize } from "@/lib/og";
export const alt = "Soni Consultancy Services";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static"; // required for the static export
export default function Image() { const p = getPage("blog"); return ogImage(p.h1, p.breadcrumb?.split("›").pop()?.trim()); }
