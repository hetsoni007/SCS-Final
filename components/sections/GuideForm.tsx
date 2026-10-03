"use client";
import LeadForm from "@/components/ui/LeadForm";
import type { FieldDef } from "@/content/forms";
import { track } from "@/lib/analytics";
import { site } from "@/content/site";

/** Scoping-guide gate. As on the live site, the download is revealed even if delivery of the lead fails. */
export default function GuideForm({ fields, submit, note }: { fields: FieldDef[]; submit: string; note?: string }) {
  return (
    <LeadForm kind="guide" fields={fields} submit={submit} note={note} alwaysSucceed extra={{ message: "Downloaded free app scoping guide" }}
      successSlot={
        <div>
          <p className="text-[18px] font-semibold text-hi">✓ Your guide is ready.</p>
          <p className="muted mt-2">Click below to download it — it opens straight away, nothing to wait for.</p>
          <a href="/assets/app-scoping-guide.pdf" download className="btn btn-primary btn-lg mt-5" onClick={() => track("guide_download", { file_name: "app-scoping-guide.pdf" })}>Download the PDF (8 pages)</a>
          <p className="muted mt-5 text-[15px]">Prefer to talk it through? <a href={site.calendly} className="text-accent-2 underline underline-offset-4">Book a free 30-min scoping call →</a></p>
        </div>
      } />
  );
}
