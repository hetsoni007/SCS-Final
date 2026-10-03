import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** Branded Open Graph card, generated per page at build time (replaces the single /assets/og.png). */
export function ogImage(title: string, eyebrow = "React Native · MERN · AI Integration") {
  const size = title.length > 70 ? 54 : title.length > 44 ? 66 : 82;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#060607", color: "#f4f5f7", fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: -220, left: -160, width: 760, height: 760, borderRadius: 760, background: "radial-gradient(circle, rgba(201,162,75,.55), rgba(201,162,75,0) 65%)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -300, right: -200, width: 820, height: 820, borderRadius: 820, background: "radial-gradient(circle, rgba(242,218,140,.38), rgba(242,218,140,0) 65%)", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, letterSpacing: 4, color: "#a6abb8" }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#F2DA8C", display: "flex" }} />
          {eyebrow.toUpperCase()}
        </div>
        <div style={{ display: "flex", fontSize: size, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2.5, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24 }}>
          <div style={{ display: "flex", fontWeight: 700, letterSpacing: 3 }}>SONI <span style={{ color: "#a6abb8", fontWeight: 400, marginLeft: 12 }}>CONSULTANCY SERVICES</span></div>
          <div style={{ display: "flex", padding: "12px 26px", borderRadius: 999, background: "linear-gradient(110deg,#F2DA8C,#C9A24B 55%,#9A7B2E)", color: "#060607", fontWeight: 700 }}>soniconsultancyservices.com</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
