"use client";
/**
 * Home hero — "Idea → App Store".
 * GPU particles drift on curl noise as "ideas", get pulled toward the cursor, and on scroll
 * stream into the centre and assemble into an iOS + Android device pair showing real app screens.
 * Driven by `state.current.progress` (0..1) from the Hero section's ScrollTrigger.
 */
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { particleBudget } from "@/lib/motion";
import { shared } from "@/lib/gl-store";
import { snoise } from "../shaders/noise";
import { Compiled, Glow, PHONE, Phone, Studio, damp, glowBlend, readNum, rng, smooth, useShaderArgs, useView, usePalette } from "../kit";
import type { SceneProps } from "../GLRoot";

const SCREENS_IOS = ["/assets/portfolio/creator-marketplace-1.webp", "/assets/portfolio/hr-payroll-sim-punch.webp", "/assets/portfolio/retail-ops-1.webp"];
const SCREENS_ANDROID = ["/assets/portfolio/ride-hailing-teaser.webp", "/assets/portfolio/retail-ops-sim-menu.webp", "/assets/portfolio/hr-payroll-teaser.webp"];
const LEFT = { x: -1.05, rot: 0.32 }, RIGHT = { x: 1.05, rot: -0.32 };

const vert = /* glsl */ `
uniform float uTime, uProgress, uVel, uSize, uPull;
uniform vec3 uMouse;
attribute vec3 aTarget; attribute vec4 aSeed;
varying float vMix; varying float vSeed; varying float vNear; varying float vKeep;
${snoise}
void main(){
  vec3 p = position;
  // idle drift
  vec3 flow = curl(p * .22 + uTime * .05 + aSeed.x * 3.);
  p += flow * (.55 + aSeed.y * .6);
  // cursor attraction: nearby ideas gather into a tight orbit around the pointer
  vec3 d = uMouse - p; float dist = length(d.xy);
  float near = smoothstep(2.4, 0., dist) * uPull;
  float ang = aSeed.z * 6.2831 + uTime * (1. + aSeed.y);
  p.xy += d.xy * near * .65 + vec2(cos(ang), sin(ang)) * near * .18;
  // assemble: staggered per particle so the stream reads as a flow, not a cut
  float t = clamp((uProgress - aSeed.w * .45) / .55, 0., 1.);
  t = t * t * (3. - 2. * t);
  vec3 mid = mix(p, aTarget, t);
  mid += flow * sin(t * 3.14159) * 1.4;         // swirl while travelling
  mid.z += sin(t * 3.14159) * (aSeed.x - .5) * 3.;
  vMix = t; vSeed = aSeed.x; vNear = near; vKeep = aSeed.z; // .z: independent of size (.y), so all sizes survive
  vec4 mv = modelViewMatrix * vec4(mid, 1.);
  gl_Position = projectionMatrix * mv;
  float size = uSize * (.6 + aSeed.y * 1.4) * mix(1., .5, t) * (1. + abs(uVel) * 1.8 + near * 1.5);
  gl_PointSize = size * (1. / -mv.z);
}`;
const frag = /* glsl */ `
uniform vec3 uA, uB; uniform float uAlpha, uLight, uRes;
varying float vMix; varying float vSeed; varying float vNear; varying float vKeep;
void main(){
  // light theme: a sparse accent instead of a full field (the assembled devices keep all their points), and none
  // behind the headline column, so the page reads clean
  if (uLight > .5 && vKeep > .3 && vMix < .5) discard;
  float clear = mix(1., smoothstep(.36, .58, gl_FragCoord.x / max(uRes, 1.)), uLight * (1. - vMix));
  vec2 c = gl_PointCoord - .5; float r = length(c);
  float a = smoothstep(.5, .05, r);
  vec3 col = mix(uA, uB, vSeed);
  col = mix(col, vec3(1.), (vNear * .6 + vMix * .25) * (1. - uLight));
  col = mix(col, vec3(.6, .45, .16), uLight * .7);   // deeper bronze on white
  gl_FragColor = vec4(col, a * uAlpha * mix(.55, .9, vMix) * mix(1., .85, uLight) * clear);
}`;

function phonePoints(n: number, rand: () => number) {
  const out = new Float32Array(n * 3);
  const { w, h, d } = PHONE, e = new THREE.Euler(), v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const side = i % 2 === 0 ? LEFT : RIGHT;
    const edge = rand() < 0.45;
    let x: number, y: number, z: number;
    if (edge) {
      // perimeter of the body
      const t = rand() * 2 * (w + h);
      if (t < w) { x = t - w / 2; y = h / 2; } else if (t < w + h) { x = w / 2; y = h / 2 - (t - w); }
      else if (t < 2 * w + h) { x = w / 2 - (t - w - h); y = -h / 2; } else { x = -w / 2; y = -h / 2 + (t - 2 * w - h); }
      z = (rand() - 0.5) * d;
    } else { x = (rand() - 0.5) * w; y = (rand() - 0.5) * h; z = (rand() < 0.5 ? 1 : -1) * d * 0.5; }
    e.set(0, side.rot, side === LEFT ? 0.06 : -0.06);
    v.set(x, y, z).applyEuler(e);
    out[i * 3] = v.x + side.x; out[i * 3 + 1] = v.y; out[i * 3 + 2] = v.z;
  }
  return out;
}

export default function HeroScene({ tier, state }: SceneProps) {
  const HEX = usePalette();
  const viewport = useView();
  // Portrait phones: fewer, smaller particles and no idle cluster, so the headline stays easy to read.
  const narrow = viewport.aspect < 0.8;
  const count = narrow ? Math.min(particleBudget[tier], 9000) : particleBudget[tier];
  const mat = useRef<THREE.ShaderMaterial>(null);
  const phones = useRef<THREE.Group>(null);
  const opacity = useRef(0);
  const prog = useRef(0);

  const geo = useMemo(() => {
    const r = rng(7), g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), seed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      // wide, shallow volume so the field fills the viewport behind the headline
      pos[i * 3] = (r() - 0.5) * 22; pos[i * 3 + 1] = (r() - 0.5) * 12; pos[i * 3 + 2] = (r() - 0.5) * 8 - 1.5;
      seed[i * 4] = r(); seed[i * 4 + 1] = r(); seed[i * 4 + 2] = r(); seed[i * 4 + 3] = r();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(phonePoints(count, r), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
    return g;
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uProgress: { value: 0 }, uVel: { value: 0 }, uPull: { value: 1 },
    uSize: { value: (tier === "high" ? 26 : tier === "mid" ? 34 : 48) * (narrow ? 0.62 : 1) },
    uMouse: { value: new THREE.Vector3() }, uA: { value: new THREE.Color(HEX.gold) }, uB: { value: new THREE.Color(HEX.champagne) },
    uAlpha: { value: 1 }, uLight: { value: 0 }, uRes: { value: 1 },
  }), [tier, narrow, HEX]);

  const shader = useShaderArgs(uniforms, vert, frag);

  useFrame(({ clock, gl }, dt) => {
    const target = readNum(state);
    prog.current = damp(prog.current, target, 5, dt);
    const p = prog.current;
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uProgress.value = p;
    uniforms.uVel.value = shared.scrollVel;
    uniforms.uPull.value = narrow ? 0 : 1 - smooth(0.05, 0.4, p);
    uniforms.uLight.value = shared.light ? 1 : 0;
    uniforms.uRes.value = gl.domElement.width; // drawing-buffer width, for the light-theme fade behind the copy
    uniforms.uMouse.value.set((shared.mx * viewport.width) / 2, (shared.my * viewport.height) / 2, 0);
    // particles hand over to the solid devices near the end
    uniforms.uAlpha.value = (1 - smooth(0.82, 1, p) * 0.75) * (narrow ? 0.7 : 1);
    opacity.current = smooth(0.72, 0.96, p);
    if (phones.current) {
      const s = 0.86 + opacity.current * 0.14;
      phones.current.scale.setScalar(s * Math.min(1, viewport.width / 5.2));
      phones.current.rotation.y = damp(phones.current.rotation.y, shared.mx * 0.22 + Math.sin(clock.elapsedTime * 0.3) * 0.08, 3, dt);
      phones.current.rotation.x = damp(phones.current.rotation.x, -shared.my * 0.12, 3, dt);
      phones.current.visible = opacity.current > 0.01;
    }
    if (mat.current) mat.current.blending = glowBlend();
  });

  const fit = Math.min(1, viewport.width / 5.2);
  return (
    <>
      <Studio />
      <points geometry={geo} scale={[fit, fit, 1]} frustumCulled={false}>
        <shaderMaterial ref={mat} args={shader} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {/* the particle field must not wait for the screenshots: phones suspend on their own */}
      <Suspense fallback={null}>
      <Compiled>
      <group ref={phones} visible={false}>
        <Phone position={[LEFT.x, 0, 0]} rotation={[0, LEFT.rot, 0.06]} platform="ios" screens={SCREENS_IOS} opacityRef={opacity} />
        <Phone position={[RIGHT.x, 0, 0]} rotation={[0, RIGHT.rot, -0.06]} platform="android" screens={SCREENS_ANDROID} interval={3.8} opacityRef={opacity} />
        <Glow color={HEX.gold} scale={7} opacity={0.35} position={[-1, 0, -1.5]} />
        <Glow color={HEX.champagne} scale={6} opacity={0.3} position={[1.2, -0.4, -1.5]} />
      </group>
      </Compiled>
      </Suspense>
    </>
  );
}
