import { Blocks } from "@/components/sections/Blocks";
import { Breadcrumb } from "@/components/sections/PageView";
import { getPage, pageMetadata, type Block } from "@/lib/content";
import { JsonLd, breadcrumbSchema } from "@/lib/schema";

const page = getPage("privacy");
export const metadata = pageMetadata(page.meta, page.path);

/** Ported verbatim. Deliberately plain: clean typography, no 3D. */
export default function Page() {
  const [head, body] = page.sections.map((s) => (s.blocks[0] as Extract<Block, { t: "group" }>).blocks);
  return (
    <>
      <article className="wrap-narrow pb-24 pt-[calc(var(--nav-h)+72px)]">
        <Breadcrumb trail={[{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy/" }]} />
        <header><Blocks blocks={head} /></header>
        <div className="mt-10 [&_h2]:!mt-12 [&_h2]:!text-[28px] [&_p]:!max-w-none [&_p]:!text-[17px] [&_ul]:!text-[17px]"><Blocks blocks={body} /></div>
      </article>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy/" }])} />
    </>
  );
}
