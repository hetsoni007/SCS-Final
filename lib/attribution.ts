"use client";
/** UTM / lead-source attribution, ported from the live site's utm.js. Session-scoped, first touch wins. */
const KEY = "scs_attr";
export function captureAttribution() {
  try {
    const cur = JSON.parse(sessionStorage.getItem(KEY) || "{}");
    const q = new URLSearchParams(location.search), o: Record<string, string> = { ...cur };
    for (const k of ["utm_source", "utm_medium", "utm_campaign"]) { const v = q.get(k); if (v) o[k] = v.slice(0, 120); }
    const blog = /^\/blog\/([^/]+)/.exec(location.pathname);
    if (!o.utm_source && blog) { o.utm_source = "blog"; o.utm_medium = "content"; o.utm_campaign = blog[1]; o.source = "blog"; o.blog_post_title = (document.title || "").split(/[|—]/)[0].trim(); }
    if (!o.landing) o.landing = location.pathname;
    sessionStorage.setItem(KEY, JSON.stringify(o));
  } catch {}
}
export function getAttribution(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
