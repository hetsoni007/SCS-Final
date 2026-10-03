import PageView from "@/components/sections/PageView";
import ContactPanel from "@/components/sections/ContactPanel";
import { formFields } from "@/components/sections/Blocks";
import { stripTags } from "@/components/ui/Rich";
import { findBlock, getPage, pageMetadata, type Block } from "@/lib/content";

const page = getPage("contact");
export const metadata = pageMetadata(page.meta, page.path);

export default function Page() {
  const grid = page.sections[1].blocks[0] as Extract<Block, { t: "group" }>;
  const txt = (b: Block[], cls: string) => stripTags((b.find((x) => x.t === "text" && x.cls === cls) as { html: string } | undefined)?.html ?? "");
  const options = grid.blocks.filter((b): b is Extract<Block, { t: "panel" }> => b.t === "panel" && !!b.href).map((p) => ({ lab: txt(p.blocks, "lab"), t: txt(p.blocks, "t"), d: txt(p.blocks, "d"), href: p.href! }));
  const timesGrid = grid.blocks.find((b) => b.t === "grid") as Extract<Block, { t: "grid" }>;
  const times = timesGrid.items.slice(1).map((it) => it.blocks.map((b) => stripTags((b as { html: string }).html)) as [string, string]);
  const form = findBlock(grid.blocks, "form")!, card = grid.blocks.find((b) => b.t === "panel" && /form-card/.test(b.cls ?? "")) as Extract<Block, { t: "panel" }>;
  return (
    <PageView page={page} replace={{
      1: <section className="pb-10" data-loc="contact"><div className="wrap">
        <ContactPanel options={options} times={times} fields={formFields(form)} submit={form.submit} success={form.success ?? ""} formTitle={stripTags((card.blocks.find((b) => b.t === "h") as { html: string }).html)} formSub={stripTags((card.blocks.find((b) => b.t === "p") as { html: string }).html)} />
      </div></section>,
    }} />
  );
}
