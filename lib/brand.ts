/**
 * Brand palette for code that cannot read CSS variables (3D scenes, canvas drawing, OG images).
 * Gold on near-black, from the logo and the live site's stylesheet (liquid.css). CSS tokens live in app/globals.css.
 */
export const BRAND = {
  gold: "#C9A24B", // --gold
  goldLight: "#E8CD7E", // --gold-light
  champagne: "#F2DA8C", // first stop of --gold-grad
  bronze: "#9A7B2E", // --gold-dim
  amber: "#E8A33D", // warm accent for ratings and alerts
  cream: "#F3EAD8", // the logo's wordmark white
  ink: "#0A0A0C",
  slate: "#2E344A", // the live site's cool background glow
} as const;
export const GOLD_GRADIENT = `linear-gradient(110deg, ${BRAND.champagne}, ${BRAND.gold} 55%, ${BRAND.bronze})`;
