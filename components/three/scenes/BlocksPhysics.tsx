"use client";
/**
 * MVP scoper: feature blocks in three bins (Core / Supporting / Later) with Rapier physics.
 * Blocks can be dragged between bins with the pointer; the DOM controls (keyboard-accessible)
 * move them too by writing `state.current.tiers`. The scene reports back through
 * `state.current.onMove(index, tier)` and `state.current.onHover(index)`.
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { CuboidCollider, Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { Glow, Studio, useView, usePalette } from "../kit";
import type { SceneProps } from "../GLRoot";

type ScopeState = { tiers: number[]; onMove?: (i: number, tier: number) => void; onHover?: (i: number) => void };
const BIN_X = [-2.4, 0, 2.4], BIN_W = 2.1, FLOOR_Y = -1.7, SIZE = 0.62, CAM_Y = -0.3, DROP_Y = 1.2;
const DYNAMIC = 0, KINEMATIC = 2; // rapier RigidBodyType
const tierOfX = (x: number) => (x < -BIN_W / 2 - 0.15 ? 0 : x > BIN_W / 2 + 0.15 ? 2 : 1);

export default function BlocksPhysics({ state, count = 10 }: SceneProps) {
  const HEX = usePalette();
  const TINT = useMemo(() => [new THREE.Color(HEX.champagne), new THREE.Color(HEX.gold), new THREE.Color("#6b665c")], [HEX]);
  const n = count as number;
  const st = (state as { current: ScopeState }).current;
  const { camera } = useThree();
  const viewport = useView();
  const bodies = useRef<(RapierRigidBody | null)[]>([]), mats = useRef<(THREE.MeshPhysicalMaterial | null)[]>([]);
  const drag = useRef<{ i: number; id: number } | null>(null), last = useRef<number[]>([...st.tiers]);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []), hit = useMemo(() => new THREE.Vector3(), []);
  // spawn each block above its starting bin; gravity settles them into a stack
  const spawn = useMemo(() => { const seen = [0, 0, 0]; return st.tiers.slice(0, n).map((t) => { const k = seen[t]++; return [BIN_X[t] + ((k % 3) - 1) * 0.66, FLOOR_Y + 0.5 + Math.floor(k / 3) * 0.75, 0] as [number, number, number]; }); }, [n]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    // frame the three bins regardless of the slot's aspect ratio
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180, aspect = viewport.aspect;
    camera.position.set(0, CAM_Y, Math.max(2.0 / Math.tan(fov / 2), 3.9 / (Math.tan(fov / 2) * aspect)));
    camera.lookAt(0, CAM_Y, 0);
    st.tiers.slice(0, n).forEach((t, i) => {
      const b = bodies.current[i], m = mats.current[i];
      if (m) { m.color.lerp(TINT[t], 0.12); m.emissive.copy(m.color); m.opacity += ((t === 2 ? 0.55 : 1) - m.opacity) * 0.12; }
      // tier changed from the DOM controls: lift the block over its new bin and let it drop
      if (b && last.current[i] !== t && drag.current?.i !== i) {
        b.setTranslation({ x: BIN_X[t] + (Math.random() - 0.5) * 0.9, y: DROP_Y, z: 0 }, true);
        b.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
      last.current[i] = t;
    });
  });

  const down = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    try { (e.target as Element).setPointerCapture(e.pointerId); } catch {}
    drag.current = { i, id: e.pointerId };
    bodies.current[i]?.setBodyType(KINEMATIC, true);
  };
  const move = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    if (drag.current?.i !== i || !e.ray.intersectPlane(plane, hit)) return;
    bodies.current[i]?.setNextKinematicTranslation({ x: THREE.MathUtils.clamp(hit.x, -3.6, 3.6), y: THREE.MathUtils.clamp(hit.y, FLOOR_Y + SIZE / 2, DROP_Y + 0.2), z: 0 });
  };
  const up = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    if (drag.current?.i !== i) return;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
    drag.current = null;
    const b = bodies.current[i];
    if (!b) return;
    const t = tierOfX(b.translation().x);
    b.setBodyType(DYNAMIC, true);
    last.current[i] = t;
    st.onMove?.(i, t);
  };

  return (
    <>
      <Studio />
      <Glow color={HEX.gold} scale={4.4} opacity={0.3} position={[0, 0, -2]} />
      <Physics gravity={[0, -14, 0]}>
        {BIN_X.map((x, t) => (
          <RigidBody key={x} type="fixed" colliders={false} position={[x, 0, 0]}>
            <CuboidCollider args={[BIN_W / 2, 0.05, 0.5]} position={[0, FLOOR_Y - 0.05, 0]} />
            <CuboidCollider args={[0.04, 2.4, 0.5]} position={[-BIN_W / 2 - 0.08, 0.6, 0]} />
            <CuboidCollider args={[0.04, 2.4, 0.5]} position={[BIN_W / 2 + 0.08, 0.6, 0]} />
            <mesh position={[0, FLOOR_Y - 0.05, 0]}><boxGeometry args={[BIN_W, 0.06, 0.9]} /><meshBasicMaterial color={TINT[t]} transparent opacity={0.6} /></mesh>
            <mesh position={[0, -0.2, -0.5]}><planeGeometry args={[BIN_W, 3.1]} /><meshBasicMaterial color={TINT[t]} transparent opacity={0.05} /></mesh>
          </RigidBody>
        ))}
        {spawn.map((p, i) => (
          <RigidBody key={i} ref={(b) => { bodies.current[i] = b; }} position={p} colliders="cuboid" enabledTranslations={[true, true, false]} lockRotations linearDamping={0.6} friction={0.9} restitution={0.05} canSleep={false}>
            <mesh onPointerDown={down(i)} onPointerMove={move(i)} onPointerUp={up(i)} onPointerCancel={up(i)} onPointerOver={(e) => { e.stopPropagation(); st.onHover?.(i); }} onPointerOut={() => st.onHover?.(-1)}>
              <boxGeometry args={[SIZE, SIZE, SIZE]} />
              <meshPhysicalMaterial ref={(m) => { mats.current[i] = m; }} color={HEX.gold} metalness={0.4} roughness={0.25} clearcoat={1} emissiveIntensity={0.3} transparent />
              <Edges color="#ffffff" />
            </mesh>
          </RigidBody>
        ))}
      </Physics>
    </>
  );
}
