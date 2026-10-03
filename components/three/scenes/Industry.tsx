"use client";
/** Industry heroes: FinTech vault, Retail shelf, Ride-hailing city, HR & payroll ledger. */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { Glow, Rig, Studio, damp, glowBlend, rng, useView, useLineAlpha, usePalette } from "../kit";
import type { SceneProps } from "../GLRoot";

const useFit = (w: number, h: number) => { const viewport = useView(); return Math.min(viewport.width / w, viewport.height / h); };
const metal = (c: string, e = 0.3) => <meshPhysicalMaterial color={c} metalness={0.6} roughness={0.22} clearcoat={1} emissive={c} emissiveIntensity={e} />;

/** A vault door with transaction particles flowing through a compliance shield. */
export function Vault() {
  const HEX = usePalette();
  const wheel = useRef<THREE.Group>(null), tx = useRef<THREE.InstancedMesh>(null), d = useMemo(() => new THREE.Object3D(), []);
  const s = useFit(6, 5);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (wheel.current) wheel.current.rotation.z = t * 0.35;
    if (tx.current) { for (let i = 0; i < 40; i++) { const u = (t * 0.18 + i / 40) % 1, a = i * 2.4; d.position.set(-3.4 + u * 6.8, Math.sin(a) * 0.9 * Math.sin(u * Math.PI), Math.cos(a) * 0.9 * Math.sin(u * Math.PI) + 0.4); d.scale.setScalar(0.5 + Math.sin(u * Math.PI)); d.updateMatrix(); tx.current.setMatrixAt(i, d.matrix); } tx.current.instanceMatrix.needsUpdate = true; }
  });
  return (
    <Rig strength={0.3} scale={s}>
      <Studio /><Glow color={HEX.gold} scale={4.4} opacity={0.4} position={[0, 0, -1]} />
      <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[1.5, 1.5, 0.4, 48]} /><meshPhysicalMaterial color={HEX.steel} metalness={0.95} roughness={0.25} clearcoat={1} /></mesh>
      <mesh position-z={0.21}><torusGeometry args={[1.25, 0.05, 10, 64]} /><meshBasicMaterial color={HEX.champagne} toneMapped={false} /></mesh>
      <group ref={wheel} position-z={0.3}>
        <mesh><torusGeometry args={[0.55, 0.06, 10, 40]} />{metal(HEX.gold)}</mesh>
        {[0, 1, 2].map((i) => <mesh key={i} rotation-z={(i * Math.PI) / 3}><boxGeometry args={[1.25, 0.07, 0.07]} />{metal(HEX.gold)}</mesh>)}
      </group>
      {/* compliance shield */}
      <mesh position={[1.75, -1.05, 0.9]} rotation={[Math.PI / 2 - 0.25, 0.35, 0]}><cylinderGeometry args={[0.5, 0.5, 0.08, 6]} /><meshPhysicalMaterial color={HEX.green} transparent opacity={0.5} roughness={0.1} clearcoat={1} emissive={HEX.green} emissiveIntensity={0.4} /><Edges color={HEX.green} /></mesh>
      <instancedMesh ref={tx} args={[undefined, undefined, 40]}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color={HEX.champagne} toneMapped={false} blending={glowBlend()} transparent /></instancedMesh>
    </Rig>
  );
}

/** Store shelving with products, a checklist board ticking itself off and an LMS badge. */
export function Shelf() {
  const HEX = usePalette();
  const ticks = useRef<(THREE.Mesh | null)[]>([]), badge = useRef<THREE.Mesh>(null);
  const s = useFit(7.6, 5.8);
  const items = useMemo(() => { const r = rng(9); return Array.from({ length: 18 }, (_, i) => ({ x: (i % 6) * 0.52 - 1.3, y: Math.floor(i / 6) * 0.95 - 0.95, h: 0.3 + r() * 0.35, c: [HEX.gold, HEX.champagne, HEX.amber][Math.floor(r() * 3)] })); }, [HEX]);
  useFrame(({ clock }) => {
    const n = Math.floor(clock.elapsedTime * 0.8) % 6;
    ticks.current.forEach((m, i) => { if (m) (m.material as THREE.MeshBasicMaterial).color.set(i < n ? HEX.green : "#3a3f4d"); });
    if (badge.current) badge.current.rotation.y = clock.elapsedTime;
  });
  return (
    <Rig strength={0.3} scale={s}>
      <Studio /><Glow color={HEX.champagne} scale={4.4} opacity={0.3} position={[0, 0, -1]} />
      <group position-x={-0.9} rotation-y={0.35}>
        {[-1.2, -0.25, 0.7, 1.65].map((y) => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[3.3, 0.06, 0.7]} /><meshStandardMaterial color={HEX.steel} metalness={0.8} roughness={0.35} /></mesh>)}
        {items.map((it, i) => <mesh key={i} position={[it.x, it.y + it.h / 2 - 0.22, 0]}><boxGeometry args={[0.34, it.h, 0.34]} />{metal(it.c, 0.2)}</mesh>)}
      </group>
      <group position={[2, 0.2, 0.6]} rotation-y={-0.5}>
        <mesh><boxGeometry args={[1.25, 1.9, 0.05]} /><meshPhysicalMaterial color={HEX.ink} roughness={0.4} clearcoat={1} /><Edges color={HEX.champagne} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <group key={i} position={[0, 0.65 - i * 0.32, 0.04]}>
            <mesh ref={(m) => { ticks.current[i] = m; }} position-x={-0.42}><circleGeometry args={[0.08, 16]} /><meshBasicMaterial color="#3a3f4d" /></mesh>
            <mesh position-x={0.12}><planeGeometry args={[0.75, 0.07]} /><meshBasicMaterial color="#fff" transparent opacity={0.25} /></mesh>
          </group>
        ))}
      </group>
      <mesh ref={badge} position={[2.2, 1.75, 0.9]}><cylinderGeometry args={[0.3, 0.3, 0.06, 8]} />{metal(HEX.amber, 0.6)}</mesh>
    </Rig>
  );
}

/** A stylised city grid, cars on routes and an AI fare heat overlay. */
export function City({ tier }: SceneProps) {
  const HEX = usePalette(), A = useLineAlpha();
  const cars = useRef<THREE.InstancedMesh>(null), heat = useRef<THREE.Mesh>(null), d = useMemo(() => new THREE.Object3D(), []);
  const s = useFit(10, 7.5);
  const G = 7, blocks = useMemo(() => { const r = rng(4), a: { x: number; z: number; h: number }[] = []; for (let x = 0; x < G; x++) for (let z = 0; z < G; z++) a.push({ x: x - (G - 1) / 2, z: z - (G - 1) / 2, h: 0.15 + r() * r() * 1.5 }); return a; }, []);
  const n = tier === "low" ? 8 : 16;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (cars.current) { for (let i = 0; i < n; i++) { const lane = (i % (G - 1)) - (G - 2) / 2, u = ((t * (0.12 + (i % 3) * 0.04) + i * 0.17) % 1) * G - G / 2, horiz = i % 2 === 0; d.position.set(horiz ? u : lane, 0.06, horiz ? lane : u); d.rotation.y = horiz ? 0 : Math.PI / 2; d.updateMatrix(); cars.current.setMatrixAt(i, d.matrix); } cars.current.instanceMatrix.needsUpdate = true; }
    if (heat.current) { heat.current.position.set(Math.sin(t * 0.3) * 1.6, 0.03, Math.cos(t * 0.4) * 1.6); heat.current.scale.setScalar(1.2 + Math.sin(t * 1.5) * 0.25); }
  });
  return (
    <Rig strength={0.25} scale={s}>
      <Studio /><Glow color={HEX.gold} scale={4.4} opacity={0.25} />
      <group rotation={[0.7, 0.7, 0]} position-y={-0.3}>
        <mesh rotation-x={-Math.PI / 2}><planeGeometry args={[G, G, G, G]} /><meshBasicMaterial color={HEX.gold} wireframe transparent opacity={A(0.25)} /></mesh>
        {blocks.map((b, i) => <mesh key={i} position={[b.x, b.h / 2, b.z]}><boxGeometry args={[0.62, b.h, 0.62]} /><meshPhysicalMaterial color={HEX.steel} metalness={0.7} roughness={0.3} clearcoat={1} transparent opacity={0.92} /><Edges color={HEX.gold} /></mesh>)}
        <instancedMesh ref={cars} args={[undefined, undefined, n]}><boxGeometry args={[0.22, 0.08, 0.1]} /><meshBasicMaterial color={HEX.champagne} toneMapped={false} /></instancedMesh>
        <mesh ref={heat} rotation-x={-Math.PI / 2}><circleGeometry args={[1, 32]} /><meshBasicMaterial color={HEX.amber} transparent opacity={0.28} blending={glowBlend()} depthWrite={false} /></mesh>
      </group>
    </Rig>
  );
}

/** GPS pin + fingerprint scanner, and a payroll ledger whose rows morph from chaos to order. */
export function Ledger() {
  const HEX = usePalette();
  const rows = useRef<(THREE.Mesh | null)[]>([]), scan = useRef<THREE.Mesh>(null), pin = useRef<THREE.Group>(null);
  const s = useFit(5.4, 4.2);
  const chaos = useMemo(() => { const r = rng(13); return Array.from({ length: 9 }, () => ({ x: (r() - 0.5) * 1.6, y: (r() - 0.5) * 1.2, z: (r() - 0.5) * 1.4, rz: (r() - 0.5) * 1.6 })); }, []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, k = (Math.sin(t * 0.6) + 1) / 2 > 0.35 ? 1 : 0; // mostly ordered, periodically scrambles
    rows.current.forEach((m, i) => { if (!m) return; const c = chaos[i]; m.position.x = damp(m.position.x, k ? 0 : c.x, 4, dt); m.position.y = damp(m.position.y, k ? 0.75 - i * 0.19 : c.y, 4, dt); m.position.z = damp(m.position.z, k ? 0.04 : c.z, 4, dt); m.rotation.z = damp(m.rotation.z, k ? 0 : c.rz, 4, dt); });
    if (scan.current) scan.current.position.z = Math.sin(t * 2) * 0.4;
    if (pin.current) pin.current.position.y = 0.75 + Math.abs(Math.sin(t * 1.6)) * 0.18;
  });
  return (
    <Rig strength={0.3} scale={s}>
      <Studio /><Glow color={HEX.gold} scale={4.4} opacity={0.35} position={[0, 0, -1]} />
      <group position-x={1.1} rotation-y={-0.4}>
        <mesh><boxGeometry args={[1.9, 2.1, 0.05]} /><meshPhysicalMaterial color={HEX.ink} roughness={0.4} clearcoat={1} /><Edges color={HEX.gold} /></mesh>
        {chaos.map((_, i) => <mesh key={i} ref={(m) => { rows.current[i] = m; }}><boxGeometry args={[1.55, 0.11, 0.02]} /><meshBasicMaterial color={i % 3 === 0 ? HEX.champagne : "#ffffff"} transparent opacity={i % 3 === 0 ? 0.9 : 0.3} /></mesh>)}
      </group>
      <group position={[-1.6, -0.75, 0.4]} rotation={[1.05, 0, -0.15]}>
        <mesh><cylinderGeometry args={[0.55, 0.55, 0.08, 40]} /><meshPhysicalMaterial color={HEX.steel} metalness={0.9} roughness={0.25} clearcoat={1} /></mesh>
        {[0.14, 0.24, 0.34, 0.44].map((r) => <mesh key={r} position-y={0.05} rotation-x={-Math.PI / 2}><torusGeometry args={[r, 0.012, 6, 40, Math.PI * 1.5]} /><meshBasicMaterial color={HEX.champagne} toneMapped={false} /></mesh>)}
        <mesh ref={scan} rotation-x={-Math.PI / 2} position-y={0.07}><planeGeometry args={[1, 0.03]} /><meshBasicMaterial color={HEX.green} toneMapped={false} /></mesh>
      </group>
      <group ref={pin} position={[-1.6, 0.75, 0.4]}>
        <mesh><sphereGeometry args={[0.2, 20, 16]} />{metal(HEX.amber, 0.6)}</mesh>
        <mesh position-y={-0.3} rotation-z={Math.PI}><coneGeometry args={[0.15, 0.4, 16]} />{metal(HEX.amber, 0.6)}</mesh>
      </group>
    </Rig>
  );
}
