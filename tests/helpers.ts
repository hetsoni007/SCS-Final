import type { Page } from "@playwright/test";

/** Skip the first-visit intro, the consent banner and the exit-intent offer so they never cover the UI under test. */
export async function quiet(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("scs-consent", "denied");
      sessionStorage.setItem("scs-intro-seen", "1");
      sessionStorage.setItem("scs-exit", "1");
    } catch {}
  });
}
/** Collect console errors, ignoring noise that only exists off-Vercel (analytics script) or from third parties. */
export function watchConsole(page: Page) {
  const errors: string[] = [];
  const noise = /_vercel|insights|calendly|favicon|googletagmanager/i;
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const where = m.location().url ?? "";
    if (noise.test(m.text()) || noise.test(where)) return; // e.g. /_vercel/insights/script.js only exists on Vercel
    errors.push(`${m.text()} ${where}`.trim());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}
export const norm = (s: string) => s.replace(/\s+/g, " ").trim();
