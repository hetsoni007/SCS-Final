/** Joins class names, skipping falsy values. */
export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");
