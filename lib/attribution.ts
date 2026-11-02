"use client";
/** UTM / lead-source attribution. Session-scoped, FIRST touch wins: later page views never overwrite what the ad click set. */
const KEY = "scs_attr";
export function captureAttribution() {
  try {
    const o: Record<string, string> = JSON.parse(sessionStorage.getItem(KEY) || "{}");
    const q = new URLSearchParams(location.search);
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"]) { const v = q.get(k); if (v && !o[k]) o[k] = v.slice(0, 120); }
    const blog = /^\/blog\/([^/]+)/.exec(location.pathname);
    if (!o.utm_source && blog) { o.utm_source = "blog"; o.utm_medium = "content"; o.utm_campaign = blog[1]; o.source = "blog"; o.blog_post_title = (document.title || "").split(/[|—]/)[0].trim(); }
    if (!o.landing) { o.landing = location.pathname; o.referrer = (document.referrer || "").slice(0, 200); }
    sessionStorage.setItem(KEY, JSON.stringify(o));
  } catch {}
}
export function getAttribution(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
