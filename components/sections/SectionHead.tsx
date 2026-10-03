import Rich from "@/components/ui/Rich";

export function SectionHead({ eyebrow, title, lead, as: H = "h2", center = false, className = "" }: { eyebrow?: string; title: string; lead?: string; as?: "h1" | "h2"; center?: boolean; className?: string }) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-[980px] ${className}`}>
      {eyebrow && <p className="eyebrow" data-reveal>{eyebrow}</p>}
      <H className={`${H === "h1" ? "h1" : "h2"} mt-4`} data-reveal style={{ "--i": 1 } as React.CSSProperties}><Rich html={title} hyphens /></H>
      {lead && <p className={`lead mt-5 ${center ? "mx-auto" : ""}`} data-reveal style={{ "--i": 2 } as React.CSSProperties}><Rich html={lead} /></p>}
    </div>
  );
}

const CtaLink = ({ b, cls }: { b: { label: string; href: string }; cls: string }) => <a href={b.href} className={cls} data-magnetic="0.2" data-cta>{b.label}</a>;

/** Closing CTA band used at the bottom of every page. */
export function CtaBand({ title, lead, primary, secondary, note, loc = "cta-band" }: { title: string; lead?: string; primary: { label: string; href: string }; secondary?: { label: string; href: string }; note?: string; loc?: string }) {
  return (
    <section className="section" data-loc={loc}>
      <div className="wrap">
        <div className="glass spot overflow-hidden px-6 py-14 text-center md:px-16 md:py-20" data-reveal>
          <h2 className="h2 mx-auto max-w-[18ch]"><Rich html={title} /></h2>
          {lead && <p className="lead mx-auto mt-5"><Rich html={lead} /></p>}
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CtaLink b={primary} cls="btn btn-primary btn-lg" />
            {secondary && <CtaLink b={secondary} cls="btn btn-glass btn-lg" />}
          </div>
          {note && <p className="dim mt-6">{note}</p>}
        </div>
      </div>
    </section>
  );
}
