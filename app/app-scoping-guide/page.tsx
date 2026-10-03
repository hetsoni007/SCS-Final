import PageView, { Breadcrumb } from "@/components/sections/PageView";
import { Blocks, formFields } from "@/components/sections/Blocks";
import SceneBox from "@/components/sections/SceneBox";
import GuideForm from "@/components/sections/GuideForm";
import { findBlock, getPage, pageMetadata, type Block } from "@/lib/content";

const page = getPage("app-scoping-guide");
export const metadata = pageMetadata(page.meta, page.path);

export default function Page() {
  const group = page.sections[0].blocks[0] as Extract<Block, { t: "group" }>;
  const form = findBlock(group.blocks, "form")!;
  const copy = group.blocks.filter((b) => b.t !== "form");
  return (
    <PageView page={page} replace={{
      0: (
        <section className="relative overflow-hidden pb-16 pt-[calc(var(--nav-h)+72px)]" data-loc="guide-hero">
          <div className="wrap grid items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <Breadcrumb trail={[{ name: "Home", path: "/" }, { name: "App Scoping Guide", path: page.path }]} />
              <Blocks blocks={copy} />
            </div>
            <div>
              <SceneBox scene="booklet" className="mx-auto aspect-[4/3] w-full max-w-[460px]" />
              <div id="form" className="glass spot scroll-mt-28 p-7 md:p-8">
                <h2 className="h3 !text-[26px]">{form.title}</h2>
                <p className="muted mt-2 text-[15.5px]">{form.sub}</p>
                <div className="mt-6"><GuideForm fields={formFields(form)} submit={form.submit} note={form.note} /></div>
              </div>
            </div>
          </div>
        </section>
      ),
    }} />
  );
}
