"use client";
import type { Tier } from "./motion";

/**
 * Lightweight GPU tiering (no network benchmark download). Combines the unmasked
 * renderer string with device hints. drei's PerformanceMonitor then steps the
 * tier down at runtime if the frame rate declines.
 *
 * Creating a WebGL context just to read the renderer string can block for 100 ms or more, so the probe
 * runs in a Web Worker (OffscreenCanvas) and its answer is remembered for the tab session. Browsers
 * without WebGL on OffscreenCanvas fall back to a throwaway context on the main thread.
 */
const KEY = "scs-gpu";
type GL = WebGLRenderingContext | WebGL2RenderingContext;
const read = (gl: GL | null): string => {
  if (!gl) return "";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return `gl:${r}`;
};
// The same probe as `read`, written out as plain source for the worker (it cannot share bundled code).
const WORKER = `self.onmessage=function(){var r=null;try{var c=new OffscreenCanvas(1,1),g=c.getContext("webgl2")||c.getContext("webgl");if(g){var e=g.getExtension("WEBGL_debug_renderer_info");r="gl:"+(e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):"");var l=g.getExtension("WEBGL_lose_context");if(l)l.loseContext()}}catch(x){}self.postMessage(r)}`;
/** "gl:<renderer>" when WebGL works, "" when it does not. */
function probeMain(): string {
  try {
    const c = document.createElement("canvas");
    return read((c.getContext("webgl2") || c.getContext("webgl")) as GL | null);
  } catch { return ""; }
}
/** Same answer from a worker, or null when the worker cannot tell (no OffscreenCanvas WebGL, blocked workers, timeout). */
function probeWorker(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return resolve(null);
    let url = "";
    try {
      url = URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" }));
      const w = new Worker(url);
      const done = (v: string | null) => { clearTimeout(t); w.terminate(); URL.revokeObjectURL(url); resolve(v); };
      const t = setTimeout(() => done(null), 1500);
      w.onmessage = (e) => done(typeof e.data === "string" ? e.data : null);
      w.onerror = () => done(null);
      w.postMessage(0);
    } catch { if (url) URL.revokeObjectURL(url); resolve(null); }
  });
}

/** Tier from the renderer string plus cheap device hints (re-evaluated on every load; only the probe is cached). */
export function classify(probe: string): Tier {
  if (!probe.startsWith("gl:")) return "none";
  const r = probe.slice(3).toLowerCase();
  if (/swiftshader|llvmpipe|software|basic render/.test(r)) return "none";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "none";
  const mobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
  const mem = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (mem <= 2 || cores <= 2) return "low";
  if (/mali-(4|t6|t7|g5[0-2])|adreno \(tm\) (3|4|50)|powervr|intel(\(r\))? (hd|uhd) graphics (4|5|6)\d\d\b/.test(r)) return "low";
  if (mobile) return /apple gpu|apple a1[4-9]|apple m|adreno \(tm\) (7|8)|mali-g7[1-9]|mali-g[6-9]1\d/.test(r) && mem >= 4 ? "mid" : "low";
  if (/apple m\d|rtx|radeon rx|geforce gtx 1[0-9]|geforce (rtx|gtx)|arc\b/.test(r) && cores >= 8) return "high";
  return "mid";
}

export async function detectTier(): Promise<Tier> {
  if (typeof window === "undefined") return "none";
  try {
    let probe: string | null = null;
    try { probe = sessionStorage.getItem(KEY); } catch {}
    if (probe === null) {
      probe = (await probeWorker()) ?? probeMain();
      try { sessionStorage.setItem(KEY, probe); } catch {}
    }
    return classify(probe);
  } catch {
    return "none";
  }
}
export const stepDown = (t: Tier): Tier => (t === "high" ? "mid" : t === "mid" ? "low" : t);
