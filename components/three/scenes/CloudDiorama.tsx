"use client";
/**
 * DevOps: isometric infrastructure diorama — containers auto-scaling with load,
 * a CI/CD belt carrying commits through test → scan → build → deploy, pods as hexagons,
 * and a cost-meter needle that drops as the page scrolls (state.progress).
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Glow, Studio, damp, glowBlend, readNum, useView, useLineAlpha, usePalette } from "../kit";
import { shared } from "@/lib/gl-store";
import type { SceneProps } from "../GLRoot";

const MAX = 36;
export default function CloudDiorama({ state }: SceneProps) {
  const HEX = usePalette(), A = useLineAlpha();
  const boxes = useRef<THREE.InstancedMesh>(null), commits = useRef<THREE.InstancedMesh>(null), needle = useRef<THREE.Group>(null), root = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const viewport = useView();
  const s = Math.min(viewport.width / 9.5, viewport.height / 6.9);
  const cost = useRef(0);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, load = (Math.sin(t * 0.5) + 1) / 2;
    if (boxes.current) {
      const live = 10 + Math.round(load * (MAX - 10));
      for (let i = 0; i < MAX; i++) {
        const x = (i % 6) - 2.5, z = Math.floor(i / 6) - 2.5, on = i < live ? 1 : 0;
        dummy.position.set(x * 0.5 - 1.6, 0.18, z * 0.5);
        const cur = boxes.current.userData[i] ?? 0, nx = damp(cur, on, 8, dt);
        boxes.current.userData[i] = nx; dummy.scale.setScalar(0.001 + nx);
        dummy.updateMatrix(); boxes.current.setMatrixAt(i, dummy.matrix);
      }
      boxes.current.instanceMatrix.needsUpdate = true;
    }
    if (commits.current) {
      for (let i = 0; i < 6; i++) {
        const u = (t * 0.12 + i / 6) % 1;
        dummy.position.set(-2.6 + u * 6.6, 0.16, 2.3); dummy.scale.setScalar(1); dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix(); commits.current.setMatrixAt(i, dummy.matrix);
      }
      commits.current.instanceMatrix.needsUpdate = true;
    }
    cost.current = damp(cost.current, readNum(state), 3, dt);
    if (needle.current) needle.current.rotation.z = 1.1 - cost.current * 1.9 + Math.sin(t * 3) * 0.02;
    if (root.current) root.current.rotation.y = -0.75 + shared.mx * 0.15;
  });
  return (
    <group scale={s}>
      <Studio />
      <Glow color={HEX.champagne} scale={4.4} opacity={0.25} />
      <group ref={root} rotation={[0.55, -0.75, 0]} position-y={-0.3}>
        <mesh rotation-x={-Math.PI / 2}><planeGeometry args={[8, 6.4, 16, 12]} /><meshBasicMaterial color={HEX.gold} wireframe transparent opacity={A(0.16)} /></mesh>
        <instancedMesh ref={boxes} args={[undefined, undefined, MAX]}>
          <boxGeometry args={[0.36, 0.36, 0.36]} /><meshPhysicalMaterial color={HEX.gold} metalness={0.5} roughness={0.25} clearcoat={1} emissive={HEX.gold} emissiveIntensity={0.3} />
        </instancedMesh>
        {/* Kubernetes pods */}
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[1.4 + (i % 3) * 0.62 + (Math.floor(i / 3) % 2) * 0.31, 0.12, -1.6 + Math.floor(i / 3) * 0.54]}>
            <cylinderGeometry args={[0.28, 0.28, 0.24, 6]} /><meshPhysicalMaterial color={HEX.champagne} metalness={0.4} roughness={0.2} clearcoat={1} emissive={HEX.champagne} emissiveIntensity={0.45} transparent opacity={0.9} />
          </mesh>
        ))}
        {/* CI/CD belt + four gates */}
        <mesh position={[0.7, 0.03, 2.3]}><boxGeometry args={[6.8, 0.06, 0.5]} /><meshStandardMaterial color={HEX.steel} metalness={0.7} roughness={0.4} /></mesh>
        {[-1.6, 0, 1.6, 3.2].map((x, i) => (
          <mesh key={x} position={[x, 0.42, 2.3]}><torusGeometry args={[0.36, 0.03, 8, 4]} /><meshBasicMaterial color={i === 3 ? HEX.green : HEX.champagne} toneMapped={false} /></mesh>
        ))}
        <instancedMesh ref={commits} args={[undefined, undefined, 6]}><boxGeometry args={[0.22, 0.22, 0.22]} /><meshBasicMaterial color={HEX.white} toneMapped={false} blending={glowBlend()} transparent opacity={0.9} /></instancedMesh>
        {/* cost meter */}
        <group position={[2.4, 1.3, 0.6]} rotation-y={0.75}>
          <mesh><torusGeometry args={[0.7, 0.04, 8, 40, Math.PI]} /><meshBasicMaterial color={HEX.white} transparent opacity={A(0.5)} /></mesh>
          <group ref={needle}><mesh position={[0, 0.32, 0]}><boxGeometry args={[0.035, 0.64, 0.035]} /><meshBasicMaterial color={HEX.amber} toneMapped={false} /></mesh></group>
          <mesh><sphereGeometry args={[0.07, 12, 12]} /><meshBasicMaterial color={HEX.amber} /></mesh>
        </group>
      </group>
    </group>
  );
}
