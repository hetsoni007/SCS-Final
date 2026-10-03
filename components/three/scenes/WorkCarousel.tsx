"use client";
/**
 * Selected work: phones fanned on an arc of a cylinder. The DOM layer owns drag/keyboard and writes
 * `state.current.angle` (radians, one item = SPREAD) and `state.current.hover`; this scene just follows.
 */
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Glow, Phone, Studio, damp, readNum, useView, usePalette } from "../kit";
import { shared } from "@/lib/gl-store";
import type { SceneProps } from "../GLRoot";

export const SPREAD = 0.62;
export default function WorkCarousel({ state, items }: SceneProps) {
  const HEX = usePalette();
  const list = (items as { screens: string[] }[]) ?? [];
  const slots = useRef<(THREE.Group | null)[]>([]), a = useRef(0), root = useRef<THREE.Group>(null);
  const viewport = useView();
  const n = list.length, R = 4.2;
  const fit = Math.min(1.3, viewport.width / 5.6, viewport.height / 3.7);
  useFrame((_, dt) => {
    a.current = damp(a.current, readNum(state, "angle", 0), 6, dt);
    if (root.current) root.current.rotation.x = 0.05 - shared.my * 0.05;
    slots.current.forEach((g, i) => {
      if (!g) return;
      let d = i + a.current / SPREAD;                      // position relative to the front, in items
      d = ((((d + n / 2) % n) + n) % n) - n / 2;           // wrap so the list loops
      const th = d * SPREAD, front = Math.max(0, 1 - Math.abs(d));
      g.position.set(Math.sin(th) * R, 0, Math.cos(th) * R - R);
      g.rotation.y = th + shared.mx * 0.15 * front;
      g.scale.setScalar(0.78 + front * 0.26);
      g.visible = Math.abs(d) < n / 2 - 0.15;
    });
  });
  return (
    <group ref={root} scale={fit}>
      <Studio />
      <Glow color={HEX.gold} scale={3.4} opacity={0.45} position={[0, 0, -2.5]} />
      {list.map((it, i) => (
        <group key={i} ref={(g) => { slots.current[i] = g; }}>
          <Phone platform={i % 2 ? "android" : "ios"} screens={it.screens} interval={3 + i * 0.4} />
        </group>
      ))}
    </group>
  );
}
