"use client";
/** Services hero: a phone whose layers (UI, logic, API, DB, cloud) separate with scroll. */
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { Glow, PHONE, Rig, Studio, damp, readNum, useRoundedPlane, useView, usePalette, useLight } from "../kit";
import type { SceneProps } from "../GLRoot";

const LAYERS = ["champagne", "cream", "gold", "bronze", "amber"] as const;
export default function ExplodedPhone({ state }: SceneProps) {
  const HEX = usePalette(), light = useLight();
  const refs = useRef<(THREE.Mesh | null)[]>([]), k = useRef(0.25);
  const geo = useRoundedPlane(PHONE.w, PHONE.h, 0.2);
  const viewport = useView();
  const s = Math.min(viewport.height / 5.2, viewport.width / 4.6);
  useFrame(({ clock }, dt) => {
    k.current = damp(k.current, 0.3 + readNum(state) * 1.1 + Math.sin(clock.elapsedTime * 0.6) * 0.05, 4, dt);
    refs.current.forEach((m, i) => { if (m) m.position.z = (2 - i) * 0.62 * k.current; });
  });
  return (
    <Rig strength={0.3} scale={s} rotation={[0, 0, 0]}>
      <Studio />
      <Glow color={HEX.gold} scale={4.4} opacity={0.4} position={[0, 0, -2]} />
      <group rotation={[-0.25, -0.75, 0.12]}>
        {LAYERS.map((role, i) => { const c = HEX[role]; return (
          <mesh key={role} ref={(m) => { refs.current[i] = m; }} geometry={geo}>
            <meshPhysicalMaterial color={c} transparent opacity={(i === 0 ? 0.55 : 0.28) + (light ? 0.25 : 0)} roughness={0.15} metalness={0.2} clearcoat={1} side={THREE.DoubleSide} emissive={c} emissiveIntensity={0.25} />
            <Edges color={c} threshold={30} />
          </mesh>
        ); })}
      </group>
    </Rig>
  );
}
