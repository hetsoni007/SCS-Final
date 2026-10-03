import PageView from "@/components/sections/PageView";
import { CloudCostCalculator } from "@/components/tools/Calculators";
import { getPage, pageMetadata } from "@/lib/content";

const page = getPage("cloud-cost-calculator");
export const metadata = pageMetadata(page.meta, page.path);

export default function Page() {
  return <PageView page={page} replace={{ 1: <section className="pb-10" data-loc="cloud-cost-calculator"><div className="wrap"><CloudCostCalculator /></div></section> }} />;
}
