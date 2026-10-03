import { getPost, getPosts } from "@/lib/content";
import { ogContentType, ogImage, ogSize } from "@/lib/og";
export const alt = "Soni Consultancy Services — Blog";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static"; // required for the static export
export const generateStaticParams = () => getPosts().map((p) => ({ slug: p.slug }));
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPost((await params).slug);
  return ogImage(p?.title ?? "Blog", p ? `Blog · ${p.categories.join(" · ")}` : "Blog");
}
