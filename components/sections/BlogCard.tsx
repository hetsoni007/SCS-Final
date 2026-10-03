import Link from "next/link";
import { postDate, readThumb, type PostMeta } from "@/lib/content";

/** SVG displacement filter used for the thumbnail hover distortion. Render once per page. */
export function ThumbWarpFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter id="thumb-warp"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" /></filter>
    </svg>
  );
}

export default function BlogCard({ post, i = 0, featured = false }: { post: PostMeta; i?: number; featured?: boolean }) {
  const thumb = readThumb(post.slug);
  return (
    <Link href={`/blog/${post.slug}`} className={`glass spot group block h-full overflow-hidden ${featured ? "md:grid md:grid-cols-2" : ""}`} data-cursor="View" data-reveal style={{ "--i": i % 6 } as React.CSSProperties}>
      <div className={`thumb border-b border-line bg-bg-0/50 ${featured ? "min-h-[220px] md:order-2 md:border-b-0 md:border-l" : "aspect-[16/8]"}`}>
        {/* Artwork is our own static SVG from /content/blog-embeds (ported from the live site). */}
        <div className="legacy-art absolute inset-0 p-6" dangerouslySetInnerHTML={{ __html: thumb }} />
      </div>
      <div className={featured ? "p-8 md:p-10" : "p-6"}>
        <p className="mono text-[11px] uppercase tracking-widest text-accent-2">{featured ? "✦ Featured · " : ""}{post.categories.join(" · ")}</p>
        {featured ? <h2 className="h3 mt-3 !text-[clamp(24px,2.6vw,36px)]">{post.title}</h2> : <h3 className="h3 mt-3">{post.title}</h3>}
        <p className="muted mt-3 text-[15.5px]">{post.excerpt ?? post.description}</p>
        <p className="dim mt-5">{[post.readTime, postDate(post)].filter(Boolean).join(" · ")} <span className="ml-2 text-accent-2 transition-transform group-hover:translate-x-1">Read more →</span></p>
      </div>
    </Link>
  );
}
