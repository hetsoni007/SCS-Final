import { Blocks } from "@/components/sections/Blocks";
import { Breadcrumb } from "@/components/sections/PageView";
import SceneBox from "@/components/sections/SceneBox";
import { ConsentControls } from "@/components/lazy";
import { getPage, pageMetadata, type Block } from "@/lib/content";
import { JsonLd, breadcrumbSchema } from "@/lib/schema";

const page = getPage("privacy");
export const metadata = pageMetadata(page.meta, page.path);

/** The policy text is ported verbatim. Around it: a 3D shield in the header and live cookie controls. */
export default function Page() {
  const [head, body] = page.sections.map((s) => (s.blocks[0] as Extract<Block, { t: "group" }>).blocks);
  return (
    <>
      <article className="wrap-narrow pb-24 pt-[calc(var(--nav-h)+72px)]">
        <Breadcrumb trail={[{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy/" }]} />
        <header className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_240px]" data-loc="hero">
          <div><Blocks blocks={head} /></div>
          <SceneBox scene="shield" className="mx-auto hidden aspect-square w-full max-w-[240px] md:block" />
        </header>
        <ConsentControls />
        <div className="mt-10 [&_h2]:!mt-12 [&_h2]:!text-[28px] [&_p]:!max-w-none [&_p]:!text-[17px] [&_ul]:!text-[17px]"><Blocks blocks={body} /></div>
      </article>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy/" }])} />
    </>
  );
}
