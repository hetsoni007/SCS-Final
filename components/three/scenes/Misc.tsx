"use client";
/** Lighter scenes: WordPress browser, hire pods, MVP blocks, 404 astronaut-phone, blog pages. */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { Glow, Phone, Rig, Studio, damp, glowBlend, readNum, rng, smooth, useLight, useRoundedPlane, useView, useLineAlpha, usePalette } from "../kit";
import type { SceneProps } from "../GLRoot";

const useFit = (w: number, h: number) => { const viewport = useView(); return Math.min(viewport.width / w, viewport.height / h); };

/** A browser window whose layout blocks assemble, loop. */
export function Browser() {
  const HEX = usePalette();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const s = useFit(6, 4.6), frame = useRoundedPlane(4.2, 2.9, 0.12);
  const blocks: [number, number, number, number, string][] = [[0, 0.75, 3.7, 0.5, HEX.gold], [-1.25, -0.05, 1.2, 0.8, "#ffffff"], [0, -0.05, 1.2, 0.8, "#ffffff"], [1.25, -0.05, 1.2, 0.8, "#ffffff"], [-0.65, -0.95, 2.4, 0.55, "#ffffff"], [1.25, -0.95, 1.2, 0.55, HEX.champagne]];
  useFrame(({ clock }, dt) => {
    const t = (clock.elapsedTime % 7) / 7;
    refs.current.forEach((m, i) => { if (!m) return; const k = smooth(0.05 + i * 0.09, 0.2 + i * 0.09, t) * (1 - smooth(0.92, 1, t)); m.position.z = damp(m.position.z, 0.05 + (1 - k) * 1.6, 6, dt); (m.material as THREE.MeshBasicMaterial).opacity = k * (blocks[i][4] === "#ffffff" ? 0.22 : 0.9); });
  });
  return (
    <Rig strength={0.3} scale={s}>
      <Studio /><Glow color={HEX.gold} scale={4.4} opacity={0.35} position={[0, 0, -1]} />
      <group rotation={[-0.08, -0.35, 0]}>
        <mesh geometry={frame}><meshPhysicalMaterial color={HEX.ink} roughness={0.35} clearcoat={1} transparent opacity={0.9} /><Edges color={HEX.gold} threshold={40} /></mesh>
        {[-1.85, -1.68, -1.51].map((x, i) => <mesh key={x} position={[x, 1.27, 0.02]}><circleGeometry args={[0.05, 12]} /><meshBasicMaterial color={[HEX.amber, "#ffd166", HEX.green][i]} /></mesh>)}
        {blocks.map(([x, y, w, h, c], i) => <mesh key={i} ref={(m) => { refs.current[i] = m; }} position={[x, y - 0.1, 2]}><planeGeometry args={[w, h]} /><meshBasicMaterial color={c} transparent opacity={0} /></mesh>)}
      </group>
    </Rig>
  );
}

/** Three abstract low-poly busts: staff augmentation, dedicated team, contract. state.active highlights one. */
export function Pods({ state }: SceneProps) {
  const HEX = usePalette();
  const refs = useRef<(THREE.Group | null)[]>([]);
  const s = useFit(7, 4.4);
  useFrame(({ clock }, dt) => {
    const act = readNum(state, "active", -1);
    refs.current.forEach((g, i) => { if (!g) return; g.position.y = Math.sin(clock.elapsedTime * 1.1 + i * 1.7) * 0.1; g.scale.setScalar(damp(g.scale.x, act === i ? 1.18 : 1, 6, dt)); g.rotation.y = damp(g.rotation.y, act === i ? 0 : (1 - i) * 0.35, 4, dt); });
  });
  return (
    <Rig strength={0.25} scale={s}>
      <Studio />
      {[HEX.gold, HEX.champagne, HEX.amber].map((c, i) => (
        <group key={c} position-x={(i - 1) * 2.1}>
          <Glow color={c} scale={3.4} opacity={0.4} position={[0, 0, -0.6]} />
          <group ref={(g) => { refs.current[i] = g; }}>
            <mesh position-y={0.55}><icosahedronGeometry args={[0.42, 0]} /><meshPhysicalMaterial color={c} flatShading metalness={0.4} roughness={0.25} clearcoat={1} emissive={c} emissiveIntensity={0.25} /></mesh>
            <mesh position-y={-0.38}><cylinderGeometry args={[0.3, 0.72, 0.95, 6, 1]} /><meshPhysicalMaterial color={c} flatShading metalness={0.4} roughness={0.25} clearcoat={1} emissive={c} emissiveIntensity={0.2} /></mesh>
            <mesh position-y={-1} rotation-x={-Math.PI / 2}><torusGeometry args={[0.95, 0.015, 6, 6]} /><meshBasicMaterial color={c} toneMapped={false} /></mesh>
          </group>
        </group>
      ))}
    </Rig>
  );
}

/**
 * MVP scope: feature blocks stacked in three tiers (Core / Supporting / Later).
 * state.current.tiers = number[] (0|1|2 per block) written by the DOM drag UI; blocks ease to their tier.
 */
export function Blocks({ state, count = 9 }: SceneProps) {
  const HEX = usePalette();
  const n = count as number, refs = useRef<(THREE.Mesh | null)[]>([]);
  const s = useFit(7.5, 5);
  const tint = [HEX.champagne, HEX.gold, "#6b665c"];
  useFrame(({ clock }, dt) => {
    const tiers = ((state as { current?: { tiers?: number[] } })?.current?.tiers) ?? Array.from({ length: n }, (_, i) => (i < 4 ? 0 : i < 7 ? 1 : 2));
    const seen = [0, 0, 0];
    refs.current.forEach((m, i) => {
      if (!m) return; const t = tiers[i] ?? 2, k = seen[t]++;
      const x = (t - 1) * 2.3 + ((k % 2) - 0.5) * 0.74, y = -1.2 + Math.floor(k / 2) * 0.7;
      m.position.x = damp(m.position.x, x, 5, dt); m.position.y = damp(m.position.y, y + Math.sin(clock.elapsedTime + i) * 0.02, 5, dt);
      m.rotation.y = damp(m.rotation.y, t === 2 ? 0.5 : 0, 5, dt);
      const mat = m.material as THREE.MeshPhysicalMaterial; mat.color.lerp(new THREE.Color(tint[t]), 0.08); mat.emissive.copy(mat.color); mat.opacity = damp(mat.opacity, t === 2 ? 0.45 : 1, 5, dt);
    });
  });
  return (
    <Rig strength={0.25} scale={s}>
      <Studio /><Glow color={HEX.gold} scale={4.4} opacity={0.3} position={[0, 0, -1.5]} />
      {[0, 1, 2].map((t) => <mesh key={t} position={[(t - 1) * 2.3, -1.62, 0]}><boxGeometry args={[1.9, 0.05, 0.9]} /><meshBasicMaterial color={tint[t]} transparent opacity={0.5} /></mesh>)}
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }}><boxGeometry args={[0.64, 0.6, 0.64]} /><meshPhysicalMaterial color={HEX.gold} metalness={0.4} roughness={0.25} clearcoat={1} emissiveIntensity={0.3} transparent /><Edges color="#ffffff" /></mesh>
      ))}
    </Rig>
  );
}

/** 404: a lost phone tumbling through particle space. */
export function Astronaut({ tier }: SceneProps) {
  const HEX = usePalette(), A = useLineAlpha();
  const g = useRef<THREE.Group>(null);
  const s = useFit(6, 5);
  const dust = useMemo(() => { const r = rng(2), n = tier === "low" ? 300 : 900, a = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) a[i] = (r() - 0.5) * 14; return new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(a, 3)); }, [tier]);
  useFrame(({ clock }) => { if (g.current) { const t = clock.elapsedTime; g.current.rotation.set(t * 0.21, t * 0.33, t * 0.13); g.current.position.set(Math.sin(t * 0.3) * 0.5, Math.cos(t * 0.4) * 0.3, 0); } });
  return (
    <Rig strength={0.2} scale={s}>
      <Studio /><Glow color={HEX.gold} scale={4.4} opacity={0.4} />
      <points geometry={dust}><pointsMaterial color={HEX.champagne} size={0.035} transparent opacity={A(0.7)} blending={glowBlend()} depthWrite={false} /></points>
      <group ref={g} scale={0.7}>
        <Phone screenColor="#14110b" />
        {/* helmet ring + tether */}
        <mesh position-y={1.2}><torusGeometry args={[0.95, 0.04, 8, 40]} /><meshBasicMaterial color={HEX.champagne} toneMapped={false} /></mesh>
        <mesh position={[0.9, -1.2, -0.2]} rotation-z={0.7}><cylinderGeometry args={[0.012, 0.012, 1.6, 6]} /><meshBasicMaterial color={HEX.white} transparent opacity={A(0.5)} /></mesh>
      </group>
    </Rig>
  );
}

/** Blog hero: a loose stack of floating pages. */
export function Pages() {
  const HEX = usePalette();
  const refs = useRef<(THREE.Group | null)[]>([]);
  const light = useLight();
  const s = useFit(6, 4.4), geo = useRoundedPlane(1.5, 2, 0.06);
  useFrame(({ clock }) => { refs.current.forEach((g, i) => { if (!g) return; const t = clock.elapsedTime * 0.5 + i * 1.3; g.position.set((i - 2) * 0.75 + Math.sin(t) * 0.1, Math.cos(t * 1.2) * 0.18, -Math.abs(i - 2) * 0.5); g.rotation.set(Math.sin(t) * 0.08, (2 - i) * 0.22 + Math.sin(t * 0.7) * 0.06, (i - 2) * -0.05); }); });
  return (
    <Rig strength={0.3} scale={s}>
      <Studio /><Glow color={HEX.gold} scale={4.4} opacity={0.35} position={[0, 0, -1.5]} />
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} ref={(g) => { refs.current[i] = g; }}>
          <mesh geometry={geo}><meshPhysicalMaterial color={light ? "#fbfaf6" : HEX.ink} roughness={light ? 0.6 : 0.3} clearcoat={light ? 0.3 : 1} side={THREE.DoubleSide} /><Edges color={i === 2 ? HEX.gold : light ? HEX.bronze : HEX.gold} threshold={40} /></mesh>
          <mesh position={[0, 0.6, 0.01]}><planeGeometry args={[1.2, 0.5]} /><meshBasicMaterial color={i % 2 ? HEX.champagne : HEX.gold} transparent opacity={0.8} /></mesh>
          {[0.15, -0.05, -0.25, -0.45, -0.65].map((y, j) => <mesh key={y} position={[-(j % 2) * 0.1, y, 0.01]}><planeGeometry args={[1.2 - (j % 2) * 0.2, 0.06]} /><meshBasicMaterial color={light ? "#1d1b16" : "#fff"} transparent opacity={light ? 0.14 : 0.22} /></mesh>)}
        </group>
      ))}
    </Rig>
  );
}

/** Privacy: a gold shield with a keyhole inside a slow orbit ring. */
export function Shield() {
  const HEX = usePalette();
  const g = useRef<THREE.Group>(null), ring = useRef<THREE.Mesh>(null);
  const s = useFit(5.2, 5.4);
  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 1.6); sh.bezierCurveTo(0.6, 1.4, 1.2, 1.3, 1.35, 1.25);
    sh.lineTo(1.35, 0.1); sh.bezierCurveTo(1.35, -0.9, 0.7, -1.5, 0, -1.9);
    sh.bezierCurveTo(-0.7, -1.5, -1.35, -0.9, -1.35, 0.1); sh.lineTo(-1.35, 1.25);
    sh.bezierCurveTo(-1.2, 1.3, -0.6, 1.4, 0, 1.6);
    const e = new THREE.ExtrudeGeometry(sh, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4, curveSegments: 24 });
    e.center();
    return e;
  }, []);
  useFrame(({ clock }) => {
    if (g.current) { g.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.5; g.current.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.06; }
    if (ring.current) ring.current.rotation.z = clock.elapsedTime * 0.2;
  });
  return (
    <Rig strength={0.3} scale={s}>
      <Studio /><Glow color={HEX.gold} scale={4.6} opacity={0.35} position={[0, 0, -1]} />
      <group ref={g}>
        <mesh geometry={geo}><meshPhysicalMaterial color={HEX.gold} metalness={0.75} roughness={0.22} clearcoat={1} /></mesh>
        <mesh position={[0, 0.28, 0.22]}><circleGeometry args={[0.27, 32]} /><meshBasicMaterial color={HEX.ink} /></mesh>
        <mesh position={[0, -0.2, 0.22]}><planeGeometry args={[0.2, 0.66]} /><meshBasicMaterial color={HEX.ink} /></mesh>
      </group>
      <mesh ref={ring} rotation-x={1.2}><torusGeometry args={[2.15, 0.012, 8, 140, Math.PI * 1.6]} /><meshBasicMaterial color={HEX.champagne} toneMapped={false} /></mesh>
    </Rig>
  );
}
