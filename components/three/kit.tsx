"use client";
/** Shared 3D primitives. Everything is procedural: no model or HDRI downloads. */
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import { getStudioEnv } from "./studio-env";
import { shared } from "@/lib/gl-store";
import { BRAND } from "@/lib/brand";
import { prefs } from "@/lib/prefs";

// Scene colours come from the brand palette (lib/brand.ts). There are two sets: on the dark theme scenes glow in
// gold, champagne and cream; on the light theme the same roles use deep gold, bronze and charcoal, so every
// line, particle and label stays clearly visible on a white page. Components read them with `usePalette()`.
const DARK = { gold: BRAND.gold as string, champagne: BRAND.champagne as string, amber: BRAND.amber as string, bronze: BRAND.bronze as string, cream: BRAND.cream as string, white: "#f5f5f7", ink: "#0b0b0d", steel: "#1b1a18", green: "#34d399" };
const LIGHT: typeof DARK = { gold: "#a8790f", champagne: "#c2962f", amber: "#b8610c", bronze: "#6e5210", cream: "#7c6a40", white: "#22201b", ink: "#19181a", steel: "#2b2925", green: "#0b7f57" };
export type Palette = typeof DARK;
/** The dark palette. Inside a component use `const HEX = usePalette()` instead, which follows the theme. */
export const HEX = DARK;
export const C = {
  gold: new THREE.Color(HEX.gold),
  champagne: new THREE.Color(HEX.champagne),
  amber: new THREE.Color(HEX.amber),
  bronze: new THREE.Color(HEX.bronze),
  cream: new THREE.Color(HEX.cream),
  white: new THREE.Color(HEX.white),
  ink: new THREE.Color(HEX.ink),
  steel: new THREE.Color(HEX.steel),
};

/**
 * True in the light theme. Scenes use it to switch to their "porcelain and gold" look: light bodies, no glow
 * halos, softer particles. Reads the same external store as the DOM, so a theme toggle re-renders the scene.
 */
const isLight = () => prefs.theme() === "light";
export const useLight = () => useSyncExternalStore(prefs.subscribe, isLight, () => false);
/** The scene palette for the current theme. */
export const usePalette = (): Palette => (useLight() ? LIGHT : DARK);

/**
 * Constructor arguments for a <shaderMaterial>. React Three Fiber copies a `uniforms` *prop* into the material, so
 * values written each frame to the object you passed never reach the shader. Passed through `args` instead, the
 * material keeps the very same object: `uniforms.uTime.value = t` in useFrame just works.
 */
export function useShaderArgs<U extends Record<string, { value: unknown }>>(uniforms: U, vertexShader: string, fragmentShader: string) {
  return useMemo(() => [{ uniforms, vertexShader, fragmentShader }] as [THREE.ShaderMaterialParameters], [uniforms, vertexShader, fragmentShader]);
}

/**
 * Opacity for thin geometry (lines, wireframes, points). The values in the scenes are tuned for the dark theme,
 * where gold adds up on black. On a white page a hairline at 25% all but disappears, so the light theme draws the
 * same geometry about two and a half times stronger: `opacity={A(0.28)}` with `const A = useLineAlpha()`.
 */
export const useLineAlpha = () => { const light = useLight(); return (a: number) => (light ? Math.min(1, a * 2.5) : a); };

/** Additive in dark theme, normal in light (additive washes out on white). */
export const glowBlend = () => (shared.light ? THREE.NormalBlending : THREE.AdditiveBlending);

export const damp = THREE.MathUtils.damp;
export const lerp = THREE.MathUtils.lerp;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (a: number, b: number, v: number) => THREE.MathUtils.smoothstep(v, a, b);
/** Read a mutable `{ current: { progress } }`-style ref passed through ViewSlot props. */
export const readNum = (ref: unknown, key = "progress", fallback = 0) => {
  const v = (ref as { current?: Record<string, unknown> } | undefined)?.current?.[key];
  return typeof v === "number" ? v : fallback;
};

/** Procedural studio lighting + reflections (replaces an HDRI). The reflections are shared by all scenes (studio-env.ts). */
export function Studio({ intensity = 1 }: { intensity?: number }) {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene);
  const light = useLight(), HEX = usePalette();
  useEffect(() => {
    let dead = false;
    const prev = scene.environment;
    getStudioEnv(gl).then((env) => { if (!dead && env) scene.environment = env; });
    return () => { dead = true; scene.environment = prev; };
  }, [gl, scene]);
  // light theme: dimmer reflections, so metal reads as solid colour instead of mirroring the bright panels
  useEffect(() => { scene.environmentIntensity = light ? 0.28 : 1; return () => { scene.environmentIntensity = 1; }; }, [scene, light]);
  return (
    <>
      <ambientLight intensity={0.35 * intensity} />
      <directionalLight position={[4, 6, 5]} intensity={1.6 * intensity} />
      <pointLight position={[-5, -2, 3]} intensity={30 * intensity} color={HEX.gold} />
      <pointLight position={[5, 2, 2]} intensity={24 * intensity} color={HEX.champagne} />
    </>
  );
}

/**
 * Content that arrives after its scene (e.g. behind its own Suspense boundary) stays hidden until its shaders
 * have compiled in parallel, so it never stalls the frame it first appears in.
 */
export function Compiled({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene), camera = useThree((s) => s.camera);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    let dead = false;
    const done = () => { if (!dead) setReady(true); };
    // after the shared environment is in place, so physical materials compile in their final variant
    getStudioEnv(gl).then(() => gl.compileAsync(g, camera, scene)).then(done, done);
    return () => { dead = true; };
  }, [gl, scene, camera]);
  return <group ref={group} visible={ready}>{children}</group>;
}

/** Group that leans toward the pointer (window-normalised) with damping, plus an optional idle spin. */
export function Rig({ children, strength = 0.25, spin = 0, ...rest }: { children: ReactNode; strength?: number; spin?: number } & Record<string, unknown>) {
  const g = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!g.current) return;
    t.current += dt * spin;
    g.current.rotation.y = damp(g.current.rotation.y, shared.mx * strength + t.current, 4, dt);
    g.current.rotation.x = damp(g.current.rotation.x, -shared.my * strength * 0.6, 4, dt);
  });
  return <group ref={g} {...rest}>{children}</group>;
}

let glowTex: THREE.Texture | null = null;
export function getGlowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}
/** Cheap bloom stand-in: an additive billboard. */
export function Glow({ color = HEX.gold, scale = 2, opacity = 0.6, ...rest }: { color?: string; scale?: number; opacity?: number } & Record<string, unknown>) {
  const map = useMemo(() => getGlowTexture(), []);
  // glow halos read as smudges on a light page: the light theme relies on the studio lighting alone
  if (useLight()) return null;
  return (
    <sprite scale={scale} {...rest}>
      <spriteMaterial map={map} color={color} transparent opacity={shared.light ? opacity * 0.35 : opacity} depthWrite={false} blending={glowBlend()} />
    </sprite>
  );
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
/** Flat rounded rectangle with 0..1 UVs (screens, cards, pages). */
export function useRoundedPlane(w: number, h: number, r: number) {
  return useMemo(() => {
    const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 8);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
    return g;
  }, [w, h, r]);
}

export const PHONE = { w: 1.5, h: 3.1, d: 0.16, r: 0.2 };

function coverFit(tex: THREE.Texture, aspect: number) {
  const img = tex.image as { width: number; height: number } | undefined;
  if (!img?.width) return;
  const ia = img.width / img.height;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (ia > aspect) { tex.repeat.set(aspect / ia, 1); tex.offset.set((1 - aspect / ia) / 2, 0); }
  else { tex.repeat.set(1, ia / aspect); tex.offset.set(0, 1 - ia / aspect); } // anchor to top of the screenshot
}

function ScreenImages({ srcs, w, h, interval, opacityRef }: { srcs: string[]; w: number; h: number; interval: number; opacityRef?: { current: number } }) {
  const textures = useTexture(srcs) as THREE.Texture[];
  const geo = useRoundedPlane(w, h, 0.12);
  const a = useRef<THREE.MeshBasicMaterial>(null), b = useRef<THREE.MeshBasicMaterial>(null);
  useEffect(() => { textures.forEach((t) => { coverFit(t, w / h); t.needsUpdate = true; }); }, [textures, w, h]);
  useFrame(({ clock }) => {
    if (!a.current || !b.current) return;
    const n = textures.length, t = clock.elapsedTime / interval, i = Math.floor(t) % n, f = smooth(0.8, 1, t % 1);
    a.current.map = textures[i]; b.current.map = textures[(i + 1) % n];
    const o = opacityRef?.current ?? 1;
    a.current.opacity = o; b.current.opacity = n > 1 ? f * o : 0;
  });
  return (
    <>
      <mesh geometry={geo}><meshBasicMaterial ref={a} map={textures[0]} transparent toneMapped={false} /></mesh>
      <mesh geometry={geo} position-z={0.001}><meshBasicMaterial ref={b} map={textures[0]} transparent opacity={0} toneMapped={false} /></mesh>
    </>
  );
}

/**
 * Procedural phone: clearcoat body, glass front, screen showing real app screenshots
 * (cross-fading). `platform` only changes the camera cut-out.
 */
export function Phone({
  screens, platform = "ios", interval = 3.2, opacityRef, screenColor = "#0d0f16", children, ...rest
}: {
  screens?: string[]; platform?: "ios" | "android"; interval?: number; opacityRef?: { current: number }; screenColor?: string; children?: ReactNode;
} & Record<string, unknown>) {
  const { w, h, d, r } = PHONE;
  const sw = w - 0.12, sh = h - 0.12;
  const blank = useRoundedPlane(sw, sh, 0.12);
  const body = useRef<THREE.MeshPhysicalMaterial>(null);
  const light = useLight();
  useFrame(() => { if (body.current && opacityRef) { body.current.opacity = opacityRef.current; body.current.visible = opacityRef.current > 0.01; } });
  return (
    <group {...rest}>
      <RoundedBox args={[w, h, d]} radius={r * 0.4} smoothness={4}>
        <meshPhysicalMaterial ref={body} color={HEX.steel} metalness={light ? 0.5 : 0.85} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} transparent={!!opacityRef} />
      </RoundedBox>
      <group position-z={d / 2 + 0.002}>
        <mesh geometry={blank}><meshBasicMaterial color={screenColor} transparent opacity={1} /></mesh>
        <group position-z={0.002}>
          {screens?.length ? <ScreenImages srcs={screens} w={sw} h={sh} interval={interval} opacityRef={opacityRef} /> : null}
          {children}
        </group>
        {/* camera cut-out — only on blank screens; real screenshots already include their own status bar */}
        {screens?.length ? null : platform === "ios" ? (
          <mesh position={[0, sh / 2 - 0.14, 0.006]} rotation-z={Math.PI / 2}><capsuleGeometry args={[0.045, 0.22, 4, 12]} /><meshBasicMaterial color="#000" /></mesh>
        ) : (
          <mesh position={[0, sh / 2 - 0.13, 0.006]}><circleGeometry args={[0.045, 20]} /><meshBasicMaterial color="#000" /></mesh>
        )}
        {/* glass sheen */}
        <mesh geometry={blank} position-z={0.008}>
          <meshPhysicalMaterial transparent opacity={0.12} roughness={0.05} metalness={0} clearcoat={1} color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

/** The DOM element a scene is attached to (provided by GLRoot for every slot). */
export const SlotEl = createContext<HTMLElement | null>(null);
/** Default slot camera: fov 35 at z = 8 (see GLRoot). */
export const VIEW_H = 2 * Math.tan((35 * Math.PI) / 360) * 8;
/**
 * World-space size of the slot at z = 0 for the default camera. Derived from the slot's own
 * element (ResizeObserver) rather than `useThree().viewport`, which inside a <View> portal can
 * lag behind the per-view camera and the element's current size.
 */
export function useView() {
  const el = useContext(SlotEl);
  const read = () => { const r = el?.getBoundingClientRect(); return r && r.height > 0 ? r.width / r.height : 1; };
  const [aspect, setAspect] = useState(read);
  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(() => setAspect(read()));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]); // eslint-disable-line react-hooks/exhaustive-deps
  return { width: VIEW_H * aspect, height: VIEW_H, aspect };
}

/** Deterministic pseudo-random (scenes must look the same on every load). */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
