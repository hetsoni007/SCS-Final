"use client";
/** Scoping guide: an 8-page booklet that opens and fans its pages with scroll (state.progress). */
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Glow, Rig, Studio, damp, readNum, useRoundedPlane, useView, usePalette } from "../kit";
import type { SceneProps } from "../GLRoot";

export default function Booklet({ state, pages = 8 }: SceneProps) {
  const HEX = usePalette();
  const n = pages as number, refs = useRef<(THREE.Group | null)[]>([]), k = useRef(0);
  const geo = useRoundedPlane(1.5, 2.1, 0.05);
  const viewport = useView();
  const s = Math.min(viewport.height / 3.9, viewport.width / 5);
  useFrame(({ clock }, dt) => {
    k.current = damp(k.current, 0.35 + readNum(state) * 0.65 + Math.sin(clock.elapsedTime * 0.7) * 0.04, 4, dt);
    refs.current.forEach((g, i) => { if (g) g.rotation.y = -((n - 1 - i) / (n - 1)) * Math.PI * 0.82 * k.current; });
  });
  return (
    <Rig strength={0.3} scale={s}>
      <Studio />
      <Glow color={HEX.gold} scale={4.4} opacity={0.4} position={[0, 0, -1]} />
      <group rotation={[0.25, 0.55, 0]} position-x={0.15}>
        {Array.from({ length: n }, (_, i) => (
          <group key={i} ref={(g) => { refs.current[i] = g; }}>
            <mesh geometry={geo} position={[0.75, 0, (n - 1 - i) * 0.006]}>
              <meshPhysicalMaterial color={i === 0 ? HEX.gold : "#eef0f6"} roughness={0.6} side={THREE.DoubleSide} emissive={i === 0 ? HEX.gold : "#000"} emissiveIntensity={0.3} />
            </mesh>
            {i > 0 && [0.6, 0.35, 0.1, -0.15, -0.4].map((y, j) => (
              <mesh key={y} position={[0.75 - (j % 2) * 0.1, y, (n - 1 - i) * 0.006 + 0.003]}><planeGeometry args={[1.1 - (j % 2) * 0.2, j ? 0.05 : 0.12]} /><meshBasicMaterial color={j ? "#9aa0b0" : HEX.gold} /></mesh>
            ))}
          </group>
        ))}
      </group>
    </Rig>
  );
}
