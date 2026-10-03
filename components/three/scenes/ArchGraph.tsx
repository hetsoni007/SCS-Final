"use client";
/**
 * Work page "Platform engineering": nodes are enterprise projects, edges connect projects that share tech.
 * props.nodes = { id, group }[]; props.links = [a, b][] (indices). state.current.active highlights a node.
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Glow, damp, glowBlend, readNum, useView, usePalette } from "../kit";
import { shared } from "@/lib/gl-store";
import type { SceneProps } from "../GLRoot";

export default function ArchGraph({ state, nodes, links }: SceneProps) {
  const HEX = usePalette();
  const PALETTE = [HEX.gold, HEX.champagne, HEX.amber, HEX.green, HEX.cream];
  const ns = useMemo(() => (nodes as { id: string; group: number }[]) ?? [], [nodes]);
  const ls = useMemo(() => (links as [number, number][]) ?? [], [links]);
  const g = useRef<THREE.Group>(null), meshes = useRef<(THREE.Mesh | null)[]>([]);
  const viewport = useView();
  const s = Math.min(viewport.width / 8, viewport.height / 6);
  const { pos, geo } = useMemo(() => {
    const pos = ns.map((n, i) => { const a = (i / ns.length) * Math.PI * 2, r = 2.3 + (n.group % 2) * 0.6; return new THREE.Vector3(Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.85, Math.sin(a * 3 + n.group) * 0.9); });
    const pts: number[] = []; ls.forEach(([a, b]) => { if (pos[a] && pos[b]) pts.push(...pos[a].toArray(), ...pos[b].toArray()); });
    return { pos, geo: new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)) };
  }, [ns, ls]);
  useFrame(({ clock }, dt) => {
    const act = readNum(state, "active", -1);
    if (g.current) { g.current.rotation.y = damp(g.current.rotation.y, shared.mx * 0.3 + Math.sin(clock.elapsedTime * 0.15) * 0.15, 3, dt); g.current.rotation.x = damp(g.current.rotation.x, -shared.my * 0.15, 3, dt); }
    meshes.current.forEach((m, i) => { if (m) m.scale.setScalar(damp(m.scale.x, act === i ? 2.1 : 1, 7, dt)); });
  });
  return (
    <group ref={g} scale={s}>
      <Glow color={HEX.gold} scale={4.4} opacity={0.3} />
      <lineSegments geometry={geo}><lineBasicMaterial color={HEX.gold} transparent opacity={0.22} blending={glowBlend()} /></lineSegments>
      {pos.map((p, i) => (
        <group key={ns[i].id} position={p}>
          <mesh ref={(m) => { meshes.current[i] = m; }}><octahedronGeometry args={[0.16, 0]} /><meshBasicMaterial color={PALETTE[ns[i].group % PALETTE.length]} toneMapped={false} /></mesh>
          <Glow color={PALETTE[ns[i].group % PALETTE.length]} scale={1.2} opacity={0.6} />
        </group>
      ))}
    </group>
  );
}
