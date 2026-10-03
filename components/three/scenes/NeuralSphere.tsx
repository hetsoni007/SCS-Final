"use client";
/** AI: an icosphere whose surface is displaced by noise; filaments pulse when the panel is hovered. */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { snoise } from "../shaders/noise";
import { Glow, Rig, damp, glowBlend, readNum, useShaderArgs, usePalette, type Palette } from "../kit";
import type { SceneProps } from "../GLRoot";

const vert = /* glsl */ `
uniform float uTime, uPulse; varying float vN;
${snoise}
void main(){
  float n = snoise(normal * 1.6 + uTime * .25);
  float ripple = sin(length(position.xy) * 6. - uTime * 5.) * .06 * uPulse;
  vN = n;
  vec3 p = position + normal * (n * (.22 + uPulse * .18) + ripple);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (14. + uPulse * 14.) / -mv.z;
}`;
const frag = /* glsl */ `
uniform vec3 uA, uB; uniform float uPulse, uPoints; varying float vN;
void main(){
  if (uPoints > .5 && length(gl_PointCoord - .5) > .5) discard;
  vec3 c = mix(uA, uB, smoothstep(-.6, .6, vN));
  gl_FragColor = vec4(c, (uPoints > .5 ? .9 : .28) + uPulse * .25);
}`;
const uniformsFor = (points: number, p: Palette) => ({ uTime: { value: 0 }, uPulse: { value: 0 }, uPoints: { value: points }, uA: { value: new THREE.Color(p.gold) }, uB: { value: new THREE.Color(p.champagne) } });
export default function NeuralSphere({ tier, state }: SceneProps) {
  const HEX = usePalette();
  const detail = tier === "high" ? 10 : tier === "mid" ? 6 : 4;
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1.45, detail), [detail]);
  const u1 = useMemo(() => uniformsFor(0, HEX), [HEX]), u2 = useMemo(() => uniformsFor(1, HEX), [HEX]);
  const s1 = useShaderArgs(u1, vert, frag), s2 = useShaderArgs(u2, vert, frag);
  const pulse = useRef(0);
  useFrame(({ clock }, dt) => {
    pulse.current = damp(pulse.current, readNum(state, "hover", 0) > 0 ? 1 : 0.15 + 0.15 * Math.sin(clock.elapsedTime), 4, dt);
    for (const u of [u1, u2]) { u.uTime.value = clock.elapsedTime; u.uPulse.value = pulse.current; }
  });
  return (
    <Rig strength={0.4} spin={0.12}>
      <Glow color={HEX.gold} scale={4.4} opacity={0.5} />
      <mesh geometry={geo}><shaderMaterial args={s1} wireframe transparent depthWrite={false} blending={glowBlend()} /></mesh>
      <points geometry={geo}><shaderMaterial args={s2} transparent depthWrite={false} blending={glowBlend()} /></points>
      <mesh><icosahedronGeometry args={[0.55, 2]} /><meshBasicMaterial color={HEX.champagne} transparent opacity={0.18} /></mesh>
    </Rig>
  );
}
