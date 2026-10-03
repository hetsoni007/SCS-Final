import PageView from "@/components/sections/PageView";
import { AppCostCalculator } from "@/components/tools/Calculators";
import { getPage, pageMetadata } from "@/lib/content";

const page = getPage("app-cost-calculator");
export const metadata = pageMetadata(page.meta, page.path);

export default function Page() {
  return <PageView page={page} replace={{ 1: <section className="pb-10" data-loc="app-cost-calculator"><div className="wrap"><AppCostCalculator /></div></section> }} />;
}
