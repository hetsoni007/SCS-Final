import type { CSSProperties } from "react";

/**
 * Static stand-ins for 3D scenes. Shown before WebGL mounts and permanently for
 * reduced-motion / no-GPU visitors. Pure CSS/SVG, so they cost nothing to load.
 */
export function PhoneFrame({ src, alt = "", className = "", style, eager = false }: { src?: string; alt?: string; className?: string; style?: CSSProperties; eager?: boolean }) {
  return (
    <div className={`phone-frame relative aspect-[1.5/3.1] overflow-hidden rounded-[13%/6.4%] border border-line-strong bg-[#12141a] p-[3.5%] shadow-[0_40px_120px_-30px_rgba(201,162,75,.6)] ${className}`} style={style}>
      <div className="relative h-full w-full overflow-hidden rounded-[10%/5%] bg-[#0d0f16]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover object-top" />
        ) : null}
        <span className="absolute left-1/2 top-[2.2%] h-[2.4%] w-[26%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

const orb = (a: string, b: string): CSSProperties => ({ background: `radial-gradient(closest-side, ${a}, transparent 70%), radial-gradient(closest-side at 65% 60%, ${b}, transparent 70%)` });

export function Poster({ kind = "orb", screens }: { kind?: "orb" | "globe" | "phones" | "device" | "portal" | "grid"; screens?: string[] }) {
  if (kind === "phones" || kind === "device") {
    const s = screens ?? [];
    return (
      // a size container, so the phones are limited by the slot's width as well as its height (narrow phones)
      <div className="absolute inset-0 grid place-items-center [container-type:size]">
        <div className="poster-orb absolute inset-[10%] opacity-70 blur-2xl" style={orb("rgba(201,162,75,.5)", "rgba(242,218,140,.35)")} />
        <div className="relative flex h-[min(78cqh,84cqw)] items-center justify-center gap-[4cqw]">
          <PhoneFrame src={s[0]} className="h-full" style={{ transform: kind === "phones" ? "perspective(900px) rotateY(18deg) rotateZ(3deg)" : "perspective(900px) rotateY(-12deg)" }} />
          {kind === "phones" && <PhoneFrame src={s[1]} className="h-full" style={{ transform: "perspective(900px) rotateY(-18deg) rotateZ(-3deg)" }} />}
        </div>
      </div>
    );
  }
  if (kind === "globe") {
    return (
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs><radialGradient id="pg"><stop offset="0" stopColor="#C9A24B" stopOpacity=".35" /><stop offset="1" stopColor="#C9A24B" stopOpacity="0" /></radialGradient></defs>
        <circle cx="100" cy="100" r="95" fill="url(#pg)" />
        <g fill="none" stroke="#C9A24B" strokeOpacity=".45" strokeWidth=".5">
          <circle cx="100" cy="100" r="62" />
          {[14, 30, 46].map((r) => <ellipse key={r} cx="100" cy="100" rx={r} ry="62" />)}
          {[20, 40].map((y) => <g key={y}><ellipse cx="100" cy={100 - y} rx={Math.sqrt(62 * 62 - y * y)} ry="5" /><ellipse cx="100" cy={100 + y} rx={Math.sqrt(62 * 62 - y * y)} ry="5" /></g>)}
          <ellipse cx="100" cy="100" rx="62" ry="6" />
        </g>
        <g fill="none" stroke="#F2DA8C" strokeWidth=".8"><path d="M118 96 Q95 50 72 78" /><path d="M118 96 Q150 60 60 92" /><path d="M118 96 Q140 120 138 132" /><path d="M118 96 Q112 84 106 92" /></g>
        <circle cx="118" cy="96" r="2.4" fill="#E8A33D" />
      </svg>
    );
  }
  if (kind === "portal") {
    return <div className="absolute inset-0 grid place-items-center"><div className="aspect-square h-[78%] rounded-full" style={{ background: "conic-gradient(from 40deg,#C9A24B,#F2DA8C,#0b0c10,#C9A24B)", maskImage: "radial-gradient(closest-side, transparent 62%, #000 64%, #000 96%, transparent 100%)", filter: "blur(.5px)" }} /><div className="absolute aspect-square h-[70%] rounded-full opacity-50 blur-2xl" style={orb("rgba(201,162,75,.6)", "rgba(242,218,140,.4)")} /></div>;
  }
  if (kind === "grid") {
    return <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(closest-side,#000,transparent)" }} />;
  }
  return <div className="poster-orb absolute inset-[8%] opacity-80 blur-2xl" style={orb("rgba(201,162,75,.5)", "rgba(242,218,140,.35)")} />;
}
