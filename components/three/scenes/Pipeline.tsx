"use client";
/**
 * Process pipeline: a glowing track through space with five stations
 * (Discover → Design → Build → Launch → Scale). The camera flies along it with scroll.
 * `compact` keeps the camera fixed and just lights stations in turn (used on /services/).
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { Glow, Studio, clamp01, damp, glowBlend, readNum, smooth, useView, usePalette } from "../kit";
import { shared } from "@/lib/gl-store";
import type { SceneProps } from "../GLRoot";

const PTS = [[-9, 0.6, 0], [-6, -0.8, -2], [-3, 0.9, 0.5], [0, -0.5, -1.5], [3, 0.8, 0.6], [6, -0.6, -1.2], [9, 0.5, 0]].map((p) => new THREE.Vector3(...(p as [number, number, number])));
const STOPS = [0.14, 0.32, 0.5, 0.68, 0.86];

export default function Pipeline({ state, compact = false, tier }: SceneProps) {
  const HEX = usePalette();
  const { camera } = useThree();
  const view = useView();
  const back = 3.4 / Math.min(1, Math.max(0.42, view.aspect * 0.9)); // pull the camera back on portrait screens
  const curve = useMemo(() => new THREE.CatmullRomCurve3(PTS, false, "catmullrom", 0.5), []);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, tier === "low" ? 120 : 260, 0.018, 8, false), [curve, tier]);
  const stations = useMemo(() => STOPS.map((t) => ({ p: curve.getPointAt(t), tan: curve.getTangentAt(t) })), [curve]);
  const pulses = useRef<THREE.InstancedMesh>(null), groups = useRef<(THREE.Group | null)[]>([]);
  const prog = useRef(0), look = useMemo(() => new THREE.Vector3(), []), pos = useMemo(() => new THREE.Vector3(), []), dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }, dt) => {
    prog.current = damp(prog.current, clamp01(readNum(state)), 4, dt);
    const p = prog.current, t = 0.06 + p * 0.86;
    if (compact) { camera.position.set(0, 2.2, 15); camera.lookAt(0, 0, 0); }
    else {
      curve.getPointAt(clamp01(t - 0.07), pos); curve.getPointAt(clamp01(t + 0.03), look);
      camera.position.lerp(pos.add(new THREE.Vector3(shared.mx * 0.3, 0.9 + shared.my * 0.2, back)), 1 - Math.exp(-6 * dt));
      camera.lookAt(look);
    }
    stations.forEach((s, i) => {
      const g = groups.current[i]; if (!g) return;
      const a = smooth(STOPS[i] - 0.13, STOPS[i] - 0.02, t); // assembles as the camera arrives
      g.scale.setScalar(0.001 + a); g.rotation.y = clock.elapsedTime * 0.4 + i; g.position.y = s.p.y + 0.75 + Math.sin(clock.elapsedTime + i) * 0.06;
      g.userData.a = a;
    });
    if (pulses.current) {
      for (let i = 0; i < 14; i++) { curve.getPointAt((clock.elapsedTime * 0.06 + i / 14) % 1, dummy.position); dummy.updateMatrix(); pulses.current.setMatrixAt(i, dummy.matrix); }
      pulses.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <>
      <Studio intensity={0.9} />
      <mesh geometry={tube}><meshBasicMaterial color={HEX.gold} toneMapped={false} /></mesh>
      <instancedMesh ref={pulses} args={[undefined, undefined, 14]}><sphereGeometry args={[0.07, 8, 8]} /><meshBasicMaterial color={HEX.champagne} toneMapped={false} blending={glowBlend()} transparent /></instancedMesh>
      {stations.map((s, i) => (
        <group key={i} position={[s.p.x, s.p.y, s.p.z]}>
          <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.32, 0.02, 8, 40]} /><meshBasicMaterial color={HEX.champagne} toneMapped={false} /></mesh>
          <Glow color={i % 2 ? HEX.champagne : HEX.gold} scale={2.6} opacity={0.5} />
        </group>
      ))}
      {/* 01 Discover — magnifier */}
      <group ref={(g) => { groups.current[0] = g; }} position={stations[0].p}>
        <mesh><torusGeometry args={[0.32, 0.05, 12, 40]} /><meshPhysicalMaterial color={HEX.champagne} metalness={0.7} roughness={0.2} clearcoat={1} /></mesh>
        <mesh><circleGeometry args={[0.3, 32]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.12} roughness={0} /></mesh>
        <mesh position={[0.36, -0.36, 0]} rotation-z={Math.PI / 4}><cylinderGeometry args={[0.04, 0.04, 0.42, 10]} /><meshPhysicalMaterial color={HEX.steel} metalness={0.9} roughness={0.3} /></mesh>
      </group>
      {/* 02 Design — wireframe UI becoming solid */}
      <group ref={(g) => { groups.current[1] = g; }} position={stations[1].p}>
        <mesh><boxGeometry args={[0.6, 0.95, 0.04]} /><meshPhysicalMaterial color={HEX.steel} metalness={0.6} roughness={0.3} transparent opacity={0.85} /><Edges color={HEX.champagne} /></mesh>
        {[0.28, 0.05, -0.18].map((y, j) => (<mesh key={y} position={[0, y, 0.03]}><boxGeometry args={[0.44, j ? 0.14 : 0.2, 0.02]} /><meshBasicMaterial color={j ? HEX.white : HEX.gold} transparent opacity={j ? 0.25 : 0.9} /></mesh>))}
      </group>
      {/* 03 Build — stacking code blocks */}
      <group ref={(g) => { groups.current[2] = g; }} position={stations[2].p}>
        {[0, 1, 2, 3, 4, 5].map((j) => (<mesh key={j} position={[((j % 2) - 0.5) * 0.36, Math.floor(j / 2) * 0.26 - 0.3, 0]}><boxGeometry args={[0.32, 0.22, 0.32]} /><meshPhysicalMaterial color={j % 3 ? HEX.gold : HEX.champagne} metalness={0.4} roughness={0.25} clearcoat={1} emissive={j % 3 ? HEX.gold : HEX.champagne} emissiveIntensity={0.25} /></mesh>))}
      </group>
      {/* 04 Launch — phone lifting off */}
      <group ref={(g) => { groups.current[3] = g; }} position={stations[3].p}>
        <mesh rotation-z={-0.35}><boxGeometry args={[0.36, 0.74, 0.05]} /><meshPhysicalMaterial color={HEX.steel} metalness={0.9} roughness={0.2} clearcoat={1} /><Edges color={HEX.champagne} /></mesh>
        <mesh position={[0.16, -0.5, 0]} rotation-z={-0.35}><coneGeometry args={[0.12, 0.42, 16]} /><meshBasicMaterial color={HEX.amber} transparent opacity={0.85} blending={glowBlend()} /></mesh>
      </group>
      {/* 05 Scale — growing bar chart */}
      <group ref={(g) => { groups.current[4] = g; }} position={stations[4].p}>
        {[0.25, 0.42, 0.6, 0.85].map((h, j) => (<mesh key={h} position={[(j - 1.5) * 0.22, h / 2 - 0.4, 0]}><boxGeometry args={[0.16, h, 0.16]} /><meshPhysicalMaterial color={j === 3 ? HEX.champagne : HEX.gold} metalness={0.5} roughness={0.25} clearcoat={1} emissive={j === 3 ? HEX.champagne : HEX.gold} emissiveIntensity={0.3} /></mesh>))}
      </group>
    </>
  );
}
