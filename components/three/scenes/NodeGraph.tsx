"use client";
/** MERN backend as a layered node graph with data packets travelling along the edges. */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Glow, Rig, Studio, glowBlend, rng, useLineAlpha, usePalette } from "../kit";
import type { SceneProps } from "../GLRoot";

const LAYERS = [1, 3, 4, 3, 2]; // client → edge → services → data → infra
export default function NodeGraph({ tier }: SceneProps) {
  const HEX = usePalette(), A = useLineAlpha();
  const packets = useRef<THREE.InstancedMesh>(null);
  const { nodes, edges, lineGeo } = useMemo(() => {
    const rand = rng(11), nodes: THREE.Vector3[] = [], idx: number[][] = [];
    LAYERS.forEach((n, li) => {
      const row: number[] = [];
      for (let i = 0; i < n; i++) { row.push(nodes.length); nodes.push(new THREE.Vector3((li - 2) * 1.25, (i - (n - 1) / 2) * 0.95 + (rand() - 0.5) * 0.2, (rand() - 0.5) * 0.9)); }
      idx.push(row);
    });
    const edges: [number, number][] = [];
    for (let l = 0; l < idx.length - 1; l++) idx[l].forEach((a) => idx[l + 1].forEach((b) => { if (rand() < 0.75 || idx[l].length === 1) edges.push([a, b]); }));
    const pts: number[] = [];
    edges.forEach(([a, b]) => pts.push(...nodes[a].toArray(), ...nodes[b].toArray()));
    const lineGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return { nodes, edges, lineGeo };
  }, []);
  const n = tier === "low" ? edges.length : edges.length * 2;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    if (!packets.current) return;
    for (let i = 0; i < n; i++) {
      const [a, b] = edges[i % edges.length];
      const t = (clock.elapsedTime * (0.25 + (i % 5) * 0.06) + i * 0.37) % 1;
      dummy.position.lerpVectors(nodes[a], nodes[b], t);
      dummy.scale.setScalar(0.6 + Math.sin(t * Math.PI) * 0.8);
      dummy.updateMatrix(); packets.current.setMatrixAt(i, dummy.matrix);
    }
    packets.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <Rig strength={0.35} spin={0.05}>
      <Studio />
      <Glow color={HEX.champagne} scale={4.4} opacity={0.3} />
      <lineSegments geometry={lineGeo}><lineBasicMaterial color={HEX.gold} transparent opacity={A(0.45)} /></lineSegments>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.34, 0.2, 0.34]} />
          <meshPhysicalMaterial color={HEX.steel} metalness={0.8} roughness={0.25} clearcoat={1} emissive={i % 3 ? HEX.gold : HEX.champagne} emissiveIntensity={0.35} />
        </mesh>
      ))}
      <instancedMesh ref={packets} args={[undefined, undefined, n]}>
        <sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color={HEX.champagne} toneMapped={false} blending={glowBlend()} transparent />
      </instancedMesh>
    </Rig>
  );
}
