import PageView from "@/components/sections/PageView";
import { DevOpsAssessment } from "@/components/tools/Calculators";
import { getPage, pageMetadata } from "@/lib/content";

const page = getPage("devops-maturity-assessment");
export const metadata = pageMetadata(page.meta, page.path);

export default function Page() {
  return <PageView page={page} replace={{ 1: <section className="pb-10" data-loc="devops-maturity-assessment"><div className="wrap"><DevOpsAssessment /></div></section> }} />;
}
