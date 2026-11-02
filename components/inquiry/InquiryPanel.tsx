import InquiryForm from "./InquiryForm";

/** In-page inquiry form (the home page uses it where the old "Start here" form was). */
export default function InquiryPanel({ price, location = "home-form" }: { price?: string; location?: string }) {
  return (
    <div id="proposal" className="glass spot mx-auto max-w-[880px] scroll-mt-24 p-6 md:p-10">
      <p className="eyebrow">Start here</p>
      <h2 className="h3 mt-3 !text-[clamp(26px,3vw,38px)]">Get my fixed-price proposal.</h2>
      <p className="muted mt-3">Two quick steps. You get a straight answer on scope and a fixed price within 48 hours — or an honest no if it isn’t a fit.</p>
      {price && <p className="mono mt-4 text-[13px] uppercase tracking-[.12em] text-accent-2">{price}</p>}
      <div className="mt-6"><InquiryForm location={location} /></div>
    </div>
  );
}
