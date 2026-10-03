"use client";
/** One codebase (a glowing cube of code) splitting into an iOS and an Android phone. */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { Glow, Phone, Rig, Studio, damp, readNum, rng, smooth, usePalette } from "../kit";
import type { SceneProps } from "../GLRoot";

export default function CodeSplit({ state, auto = true }: SceneProps) {
  const HEX = usePalette();
  const cube = useRef<THREE.Group>(null), l = useRef<THREE.Group>(null), r = useRef<THREE.Group>(null), inst = useRef<THREE.InstancedMesh>(null);
  const t = useRef(0);
  const lo = useRef(0), ro = useRef(0);
  const lines = useMemo(() => {
    const rand = rng(3), a: { p: [number, number, number]; w: number }[] = [];
    for (let i = 0; i < 46; i++) a.push({ p: [(rand() - 0.5) * 1.1, (rand() - 0.5) * 1.5, (rand() - 0.5) * 1.5], w: 0.25 + rand() * 0.7 });
    return a;
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }, dt) => {
    // 0 = cube, 1 = split. Auto ping-pongs; a page can drive it through state.split.
    const target = auto ? smooth(0.25, 0.75, (Math.sin(clock.elapsedTime * 0.55) + 1) / 2) : readNum(state, "split", 1);
    t.current = damp(t.current, target, 4, dt);
    const k = t.current, platform = readNum(state, "platform", -1);
    if (cube.current) { cube.current.scale.setScalar(1 - k * 0.95); cube.current.rotation.y += dt * 0.6; cube.current.rotation.x += dt * 0.25; cube.current.visible = k < 0.98; }
    lo.current = k * (platform === 1 ? 0.25 : 1); ro.current = k * (platform === 0 ? 0.25 : 1);
    if (l.current) { l.current.position.x = -1.05 * k; l.current.rotation.y = 0.5 * k; l.current.scale.setScalar(0.3 + k * 0.5); }
    if (r.current) { r.current.position.x = 1.05 * k; r.current.rotation.y = -0.5 * k; r.current.scale.setScalar(0.3 + k * 0.5); }
    if (inst.current) {
      lines.forEach((ln, i) => {
        dummy.position.set(ln.p[0], ln.p[1], ln.p[2]);
        dummy.scale.set(ln.w * (0.7 + 0.3 * Math.sin(clock.elapsedTime * 2 + i)), 1, 1);
        dummy.updateMatrix(); inst.current!.setMatrixAt(i, dummy.matrix);
      });
      inst.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <Rig strength={0.3}>
      <Studio />
      <Glow color={HEX.gold} scale={4.4} opacity={0.4} position={[0, 0, -1]} />
      <group ref={cube}>
        <mesh><boxGeometry args={[1.8, 1.8, 1.8]} /><meshPhysicalMaterial color={HEX.gold} transparent opacity={0.12} roughness={0.1} transmission={0.6} thickness={0.6} /><Edges color={HEX.champagne} /></mesh>
        <instancedMesh ref={inst} args={[undefined, undefined, lines.length]}>
          <boxGeometry args={[0.6, 0.045, 0.045]} /><meshBasicMaterial color={HEX.champagne} toneMapped={false} />
        </instancedMesh>
      </group>
      <group ref={l}><Phone platform="ios" opacityRef={lo} screenColor="#1f190d"><PlatformGlyph color={HEX.gold} /></Phone></group>
      <group ref={r}><Phone platform="android" opacityRef={ro} screenColor="#151824"><PlatformGlyph color={HEX.champagne} android /></Phone></group>
    </Rig>
  );
}
/** Abstract UI on the screen: same layout, platform-flavoured accent. */
function PlatformGlyph({ color, android = false }: { color: string; android?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.95, 0]}><planeGeometry args={[1.1, 0.5]} /><meshBasicMaterial color={color} transparent opacity={0.85} /></mesh>
      {[0.35, 0.05, -0.25, -0.55].map((y, i) => (
        <mesh key={y} position={[i % 2 && android ? 0.08 : -0.08, y, 0]}><planeGeometry args={[0.95, 0.18]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.14} /></mesh>
      ))}
      <mesh position={[android ? 0.42 : 0, -1.1, 0]}><circleGeometry args={[android ? 0.16 : 0.12, 24]} /><meshBasicMaterial color={color} /></mesh>
    </group>
  );
}
