import Link from "next/link";
import { Widget } from "@/components/mdx";
import { getPost } from "@/lib/content";

/**
 * Puts one of the interactive tools that ship with a blog post onto a related service page.
 * The heading is the post's own title and the tool's questions, weights and results come from
 * content/widgets/<post>.json, so nothing here is new copy.
 */
export default function ToolSection({ post, eyebrow = "Try it yourself" }: { post: string; eyebrow?: string }) {
  const p = getPost(post);
  if (!p) return null;
  return (
    <section className="section" data-loc="tool">
      <div className="wrap-narrow">
        <p className="eyebrow" data-reveal>{eyebrow}</p>
        <h2 className="h2 mt-4 !text-[clamp(28px,3.6vw,48px)]" data-reveal>{p.title}</h2>
        <p className="muted mt-4" data-reveal>An interactive tool from our guide. <Link href={`/blog/${post}`} className="text-accent-2 underline underline-offset-4">Read the full guide →</Link></p>
        {/* taller than a phone screen and used in place, so it stays out of the scroll-linked motion */}
        <div className="mt-8"><Widget post={post} /></div>
      </div>
    </section>
  );
}
