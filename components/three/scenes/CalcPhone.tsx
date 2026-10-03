"use client";
/**
 * Cost calculator: feature modules snap onto a phone chassis as they are toggled.
 * state.current.features = boolean[10] in the calculator's feature order (the timeline bar is DOM, next to the price).
 */
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Glow, Phone, Rig, Studio, damp, useView, usePalette } from "../kit";
import type { SceneProps } from "../GLRoot";

/* accounts, payments, chat, maps, push, admin, ai, offline, analytics, social */
const SLOTS: { p: [number, number, number]; c: "gold" | "champagne" | "amber"; shape: "card" | "bubble" | "pin" | "chip" | "ring" | "bars" | "box" }[] = [
  { p: [-1.25, 1.1, 0.3], c: "gold", shape: "ring" }, { p: [1.3, 0.9, 0.35], c: "champagne", shape: "card" },
  { p: [-1.35, 0.1, 0.4], c: "champagne", shape: "bubble" }, { p: [1.25, -0.1, 0.45], c: "amber", shape: "pin" },
  { p: [0, 1.95, 0.2], c: "amber", shape: "ring" }, { p: [-1.3, -0.95, 0.3], c: "gold", shape: "box" },
  { p: [1.3, -1.1, 0.3], c: "gold", shape: "chip" }, { p: [0, -1.95, 0.2], c: "champagne", shape: "box" },
  { p: [-0.75, 1.8, 0.5], c: "champagne", shape: "bars" }, { p: [0.8, -1.9, 0.5], c: "gold", shape: "bubble" },
];
function Module({ shape, color }: { shape: (typeof SLOTS)[number]["shape"]; color: string }) {
  const HEX = usePalette();
  const m = <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.2} clearcoat={1} emissive={color} emissiveIntensity={0.35} />;
  switch (shape) {
    case "card": return <mesh><boxGeometry args={[0.62, 0.4, 0.04]} />{m}</mesh>;
    case "bubble": return <group><mesh><sphereGeometry args={[0.26, 20, 16]} />{m}</mesh><mesh position={[-0.16, -0.24, 0]} rotation-z={0.6}><coneGeometry args={[0.09, 0.2, 10]} />{m}</mesh></group>;
    case "pin": return <group><mesh position-y={0.12}><sphereGeometry args={[0.2, 20, 16]} />{m}</mesh><mesh position-y={-0.16} rotation-z={Math.PI}><coneGeometry args={[0.15, 0.36, 16]} />{m}</mesh></group>;
    case "chip": return <group><mesh><boxGeometry args={[0.44, 0.44, 0.08]} />{m}</mesh><mesh position-z={0.05}><boxGeometry args={[0.22, 0.22, 0.04]} /><meshBasicMaterial color={HEX.white} /></mesh></group>;
    case "ring": return <mesh><torusGeometry args={[0.2, 0.07, 12, 28]} />{m}</mesh>;
    case "bars": return <group>{[0.18, 0.3, 0.44].map((h, i) => <mesh key={h} position={[(i - 1) * 0.15, h / 2 - 0.2, 0]}><boxGeometry args={[0.1, h, 0.1]} />{m}</mesh>)}</group>;
    default: return <mesh><boxGeometry args={[0.36, 0.36, 0.36]} />{m}</mesh>;
  }
}
export default function CalcPhone({ state }: SceneProps) {
  const HEX = usePalette();
  const refs = useRef<(THREE.Group | null)[]>([]);
  const viewport = useView();
  const s = Math.min(viewport.height / 4.6, viewport.width / 4.4);
  useFrame(({ clock }, dt) => {
    const st = (state as { current?: { features?: boolean[]; weeks?: number } })?.current;
    SLOTS.forEach((sl, i) => {
      const g = refs.current[i]; if (!g) return;
      const on = st?.features?.[i] ? 1 : 0;
      const k = damp(g.userData.k ?? 0, on, 7, dt); g.userData.k = k;
      g.scale.setScalar(0.001 + k); g.position.set(sl.p[0] * (1.6 - 0.6 * k), sl.p[1] * (1.6 - 0.6 * k), sl.p[2]);
      g.rotation.y = clock.elapsedTime * 0.6 + i; g.position.y += Math.sin(clock.elapsedTime * 1.2 + i) * 0.04;
    });
  });
  return (
    <Rig strength={0.3} scale={s}>
      <Studio />
      <Glow color={HEX.gold} scale={4.4} opacity={0.4} position={[0, 0, -1.2]} />
      <Phone rotation={[0, -0.2, 0]} screenColor="#14110b" />
      {SLOTS.map((sl, i) => (<group key={i} ref={(g) => { refs.current[i] = g; }} scale={0.001}><Module shape={sl.shape} color={HEX[sl.c]} /></group>))}
    </Rig>
  );
}
