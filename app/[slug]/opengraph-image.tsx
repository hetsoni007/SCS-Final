import { templatePages } from "@/content/page-config";
import { getPage } from "@/lib/content";
import { ogContentType, ogImage, ogSize } from "@/lib/og";
export const alt = "Soni Consultancy Services";
export const size = ogSize;
export const contentType = ogContentType;
export const generateStaticParams = () => templatePages.map((slug) => ({ slug }));
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = templatePages.includes(slug) ? getPage(slug) : null;
  return ogImage(p?.h1 ?? "Soni Consultancy Services", p?.breadcrumb?.split("›").pop()?.trim());
}
