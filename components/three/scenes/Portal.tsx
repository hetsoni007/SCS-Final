"use client";
/** Final CTA: a ring of light with a shader vortex. state.zoom (0..1) flies the camera into it. */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { snoise } from "../shaders/noise";
import { Glow, damp, glowBlend, readNum, useLight, useShaderArgs, useView, usePalette } from "../kit";
import { shared } from "@/lib/gl-store";
import type { SceneProps } from "../GLRoot";

const frag = /* glsl */ `
uniform float uTime, uZoom; uniform vec3 uA, uB; varying vec2 vUv;
${snoise}
void main(){
  vec2 p = vUv - .5; float r = length(p) * 2.; float a = atan(p.y, p.x);
  float swirl = a + (1. / (r + .15)) * .9 - uTime * .6;
  float n = snoise(vec3(cos(swirl) * 1.5, sin(swirl) * 1.5, r * 3. - uTime * .8));
  float band = smoothstep(.0, .9, n * .5 + .5);
  vec3 c = mix(uA, uB, band);
  float mask = smoothstep(1., .82, r) * mix(smoothstep(.25, .95, r) * .75 + .08, 1., uZoom);
  float core = smoothstep(.35, 0., r) * .6;
  gl_FragColor = vec4(c * (band * 1.1 + .1) + core * uZoom, mask * (.32 + uZoom * .68));
}`;
const vert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
export default function Portal({ state }: SceneProps) {
  const HEX = usePalette();
  const { camera } = useThree();
  const viewport = useView();
  const ring = useRef<THREE.Group>(null), z = useRef(0);
  const light = useLight();
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uZoom: { value: 0 }, uA: { value: new THREE.Color(HEX.gold) }, uB: { value: new THREE.Color(HEX.champagne) } }), [HEX]);
  const shader = useShaderArgs(uniforms, vert, frag);
  // A gate that frames the copy: wider than the text block on desktop, fitted to the width on phones.
  const R = Math.min(3.1, Math.max(1.5, viewport.width * 0.46));
  useFrame(({ clock }, dt) => {
    z.current = damp(z.current, readNum(state, "zoom", 0), 3.5, dt);
    uniforms.uTime.value = clock.elapsedTime; uniforms.uZoom.value = z.current;
    camera.position.z = 8 - z.current * 7.2;
    if (ring.current) { ring.current.rotation.z = clock.elapsedTime * 0.08; ring.current.rotation.y = shared.mx * 0.12; ring.current.rotation.x = -shared.my * 0.1; }
  });
  return (
    <group ref={ring}>
      <Glow color={HEX.gold} scale={R * 2.4} opacity={0.3} position={[0, 0, -0.5]} />
      {/* the vortex is a light effect: on a light page it would read as a smudge, so only the rings remain */}
      <mesh visible={!light}><circleGeometry args={[R, 72]} /><shaderMaterial args={shader} transparent depthWrite={false} blending={glowBlend()} /></mesh>
      <mesh><torusGeometry args={[R, 0.012, 10, 160]} /><meshBasicMaterial color={light ? HEX.gold : HEX.champagne} toneMapped={false} transparent opacity={0.85} /></mesh>
      <mesh rotation-z={1}><torusGeometry args={[R + 0.14, 0.008, 8, 160, Math.PI * 1.3]} /><meshBasicMaterial color={light ? HEX.bronze : HEX.gold} toneMapped={false} /></mesh>
      <mesh rotation-z={3.4}><torusGeometry args={[R + 0.28, 0.005, 8, 160, Math.PI * 0.8]} /><meshBasicMaterial color={light ? HEX.gold : HEX.white} transparent opacity={0.5} /></mesh>
    </group>
  );
}
