import { caseBySlug, cases } from "@/content/work";
import { ogContentType, ogImage, ogSize } from "@/lib/og";
export const alt = "Soni Consultancy Services — Work";
export const size = ogSize;
export const contentType = ogContentType;
export const generateStaticParams = () => cases.map((c) => ({ slug: c.slug }));
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const c = caseBySlug((await params).slug);
  return ogImage(c?.title ?? "Work", c ? `${c.kind === "concept" ? "Design concept" : "Case study"} · ${c.industry}` : "Work");
}
