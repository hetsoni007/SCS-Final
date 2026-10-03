/** Emblem from the live site's favicon mark, in the logo's gold gradient. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-8 w-8 shrink-0" aria-hidden>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F2DA8C" /><stop offset=".5" stopColor="#C9A24B" /><stop offset="1" stopColor="#9A7B2E" /></linearGradient></defs>
        <g fill="none" stroke="url(#lg)" strokeWidth="2.6" strokeLinejoin="round"><path d="M24 13H13V24M87 13H76M87 13V24M24 87H13V76M76 87H87V76" /><circle cx="50" cy="48" r="27" /></g>
        <circle cx="59" cy="37" r="5.4" fill="url(#lg)" />
        <g stroke="url(#lg)" strokeWidth="2.6" strokeLinecap="round"><path d="M38 63V49M43 63V43M48 63V36M53 63V46M58 63V53M40 68H64M44 72H61" /></g>
      </svg>
      {/* stacks onto two lines on small phones so the menu button always fits */}
      <span className="font-display text-[15px] font-semibold leading-none tracking-[0.04em] max-[520px]:flex max-[520px]:flex-col max-[520px]:gap-[3px] max-[520px]:text-[14px]">
        SONI{" "}<span className="font-normal tracking-[0.12em] text-accent-ink max-[520px]:text-[9.5px]">CONSULTANCY SERVICES</span>
      </span>
    </span>
  );
}
