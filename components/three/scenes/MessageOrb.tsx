"use client";
/** Contact: a message orb and paper plane. state.current.sent → 1 fires a particle burst and the plane departs. */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Glow, Rig, damp, glowBlend, readNum, rng, useView, usePalette } from "../kit";
import type { SceneProps } from "../GLRoot";

const N = 260;
export default function MessageOrb({ state }: SceneProps) {
  const HEX = usePalette();
  const plane = useRef<THREE.Group>(null), pts = useRef<THREE.Points>(null), orb = useRef<THREE.Mesh>(null), k = useRef(0);
  const viewport = useView();
  const s = Math.min(viewport.height / 3.2, viewport.width / 5);
  const { geo, dirs } = useMemo(() => {
    const r = rng(5), dirs = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(0.6 + r() * 2.6); dirs.set(v.toArray(), i * 3); }
    return { dirs, geo: new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3)) };
  }, []);
  const paper = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0.9, -0.6, 0, -0.6, 0, 0.12, -0.4, 0, 0, 0.9, 0.6, 0, -0.6, 0, 0.12, -0.4, 0, 0, 0.9, 0, -0.3, -0.5, 0, 0.12, -0.4], 3));
    g.computeVertexNormals(); return g;
  }, []);
  useFrame(({ clock }, dt) => {
    const sent = readNum(state, "sent", 0);
    k.current = sent ? Math.min(1, k.current + dt * 0.7) : damp(k.current, 0, 6, dt);
    const t = clock.elapsedTime, e = 1 - Math.pow(1 - k.current, 3);
    if (plane.current) {
      plane.current.position.set(Math.cos(t * 0.6) * 1.9 * (1 - e) + e * 6, Math.sin(t * 0.9) * 0.4 + e * 3, Math.sin(t * 0.6) * 1.9 * (1 - e) - e * 4);
      plane.current.rotation.set(-0.2 - e * 0.5, -t * 0.6 + Math.PI + e, 0.25);
    }
    if (orb.current) orb.current.scale.setScalar(1 + Math.sin(t * 2) * 0.04 + e * 0.5);
    const a = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) a.setXYZ(i, dirs[i * 3] * e, dirs[i * 3 + 1] * e, dirs[i * 3 + 2] * e);
    a.needsUpdate = true;
    if (pts.current) (pts.current.material as THREE.PointsMaterial).opacity = k.current > 0 ? 1 - Math.max(0, k.current - 0.6) / 0.4 : 0;
  });
  return (
    <Rig strength={0.3} scale={s}>
      <ambientLight intensity={0.6} /><directionalLight position={[3, 4, 5]} intensity={2} />
      <Glow color={HEX.gold} scale={4.4} opacity={0.6} />
      <mesh ref={orb}><icosahedronGeometry args={[0.9, 3]} /><meshBasicMaterial color={HEX.gold} wireframe transparent opacity={0.55} /></mesh>
      <mesh><sphereGeometry args={[0.5, 24, 24]} /><meshBasicMaterial color={HEX.champagne} transparent opacity={0.25} /></mesh>
      <group ref={plane} scale={0.55}><mesh geometry={paper}><meshStandardMaterial color={HEX.white} side={THREE.DoubleSide} flatShading emissive={HEX.champagne} emissiveIntensity={0.25} /></mesh></group>
      <points ref={pts} geometry={geo}><pointsMaterial color={HEX.champagne} size={0.07} transparent opacity={0} depthWrite={false} blending={glowBlend()} /></points>
    </Rig>
  );
}
