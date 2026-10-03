/** Single place to tune motion for the whole site (Section 3.5 of the brief). */
export const ease = {
  reveal: "expo.out",
  transition: "power3.inOut",
  css: { expo: [0.16, 1, 0.3, 1] as const, power3: [0.65, 0, 0.35, 1] as const },
};
export const duration = { hover: 0.25, reveal: 0.9, revealLong: 1.2, transition: 0.6 };
export const stagger = { chars: 0.04, words: 0.06, items: 0.08 };
/** Number morph in the calculators (Motion `animate`). Menus, accordions and the card deck use the CSS easings in app/globals.css. */
export const morph = { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const };
/**
 * First-visit intro. `maxMs` is the hard cap counted from first paint. The cover is plain HTML/CSS; the particle
 * animation only takes it over when JavaScript is ready within `takeoverMs`, otherwise the cover fades out on its
 * own after `fallbackMs` (keep that value in sync with `intro-auto-out` in app/globals.css).
 */
export const preloader = { maxMs: 2200, takeoverMs: 900, fallbackMs: 1200, storageKey: "scs-intro-seen" };
/** Particle budgets per GPU tier (Section 7). */
export const particleBudget = { high: 40000, mid: 15000, low: 4000, none: 0 } as const;
export type Tier = keyof typeof particleBudget;
