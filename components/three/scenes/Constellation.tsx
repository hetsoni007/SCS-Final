"use client";
/** AI page: 12 idea nodes in a neural constellation. state.active (index, -1 none) pulls the camera to a node. */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Glow, damp, glowBlend, readNum, rng, useLineAlpha, usePalette } from "../kit";
import { shared } from "@/lib/gl-store";
import type { SceneProps } from "../GLRoot";

export default function Constellation({ state, count = 12 }: SceneProps) {
  const HEX = usePalette(), A = useLineAlpha();
  const n = count as number;
  const { camera } = useThree();
  const g = useRef<THREE.Group>(null), meshes = useRef<(THREE.Mesh | null)[]>([]);
  const { nodes, lines, dust } = useMemo(() => {
    const r = rng(21), nodes: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, rad = 2.1 + (r() - 0.5) * 1.2; nodes.push(new THREE.Vector3(Math.cos(a) * rad * 1.35, Math.sin(a) * rad * 0.8, (r() - 0.5) * 2.2)); }
    const pts: number[] = [];
    nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j > i && a.distanceTo(b) < 2.7) pts.push(...a.toArray(), ...b.toArray()); }));
    nodes.forEach((a) => pts.push(...a.toArray(), 0, 0, 0));
    const d: number[] = []; for (let i = 0; i < 400; i++) d.push((r() - 0.5) * 12, (r() - 0.5) * 7, (r() - 0.5) * 6);
    return { nodes, lines: new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)), dust: new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(d, 3)) };
  }, [n]);
  const target = useMemo(() => new THREE.Vector3(), []), lookAt = useMemo(() => new THREE.Vector3(), []), tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }, dt) => {
    const act = readNum(state, "active", -1);
    if (g.current) g.current.rotation.z = Math.sin(clock.elapsedTime * 0.1) * 0.08;
    if (act >= 0 && nodes[act] && g.current) { tmp.copy(nodes[act]).applyEuler(g.current.rotation); target.set(tmp.x * 0.75, tmp.y * 0.75, tmp.z + 3.6); lookAt.lerp(tmp, 1 - Math.exp(-4 * dt)); }
    else { target.set(shared.mx * 0.6, shared.my * 0.4, 9); lookAt.lerp(tmp.set(0, 0, 0), 1 - Math.exp(-4 * dt)); }
    camera.position.lerp(target, 1 - Math.exp(-3 * dt)); camera.lookAt(lookAt);
    meshes.current.forEach((m, i) => { if (!m) return; const on = act === i; m.scale.setScalar(damp(m.scale.x, on ? 1.9 : 1 + Math.sin(clock.elapsedTime * 1.5 + i) * 0.12, 6, dt)); });
  });
  return (
    <group ref={g}>
      <Glow color={HEX.gold} scale={5} opacity={0.6} />
      <mesh><icosahedronGeometry args={[0.42, 2]} /><meshBasicMaterial color={HEX.gold} wireframe transparent opacity={A(0.6)} /></mesh>
      <lineSegments geometry={lines}><lineBasicMaterial color={HEX.gold} transparent opacity={A(0.3)} blending={glowBlend()} /></lineSegments>
      <points geometry={dust}><pointsMaterial color={HEX.champagne} size={0.03} transparent opacity={A(0.5)} /></points>
      {nodes.map((p, i) => (
        <group key={i} position={p}>
          <mesh ref={(m) => { meshes.current[i] = m; }}><sphereGeometry args={[0.11, 16, 16]} /><meshBasicMaterial color={i % 2 ? HEX.champagne : HEX.white} toneMapped={false} /></mesh>
          <Glow color={i % 2 ? HEX.champagne : HEX.gold} scale={1.1} opacity={0.7} />
        </group>
      ))}
    </group>
  );
}
