"use client";
/** Wireframe globe with arcs from the studio (India) to every market served. */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { site } from "@/content/site";
import { Glow, damp, glowBlend, readNum, useLight, useLineAlpha, useView, usePalette } from "../kit";
import { shared } from "@/lib/gl-store";
import type { SceneProps } from "../GLRoot";

const R = 2, FRONT = new THREE.Vector3(0, 0, 1);
const ll = (lat: number, lon: number, r = R) => {
  const phi = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};
export default function Globe({ tier, orbit = false, state }: SceneProps) {
  const HEX = usePalette(), light = useLight(), A = useLineAlpha();
  const g = useRef<THREE.Group>(null), dots = useRef<THREE.InstancedMesh>(null), ring = useRef<THREE.Group>(null), halo = useRef<THREE.Mesh>(null);
  const { grid, arcs, curves, tubes } = useMemo(() => {
    const pts: number[] = [], seg = tier === "low" ? 36 : 64;
    for (let lat = -75; lat <= 75; lat += 15) for (let i = 0; i < seg; i++) pts.push(...ll(lat, (i / seg) * 360).toArray(), ...ll(lat, ((i + 1) / seg) * 360).toArray());
    for (let lon = 0; lon < 360; lon += 15) for (let i = 0; i < seg; i++) pts.push(...ll(-90 + (i / seg) * 180, lon).toArray(), ...ll(-90 + ((i + 1) / seg) * 180, lon).toArray());
    const grid = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const home = site.markets.find((m) => m.code === "IN")!, a = ll(home.lat, home.lon);
    const curves = site.markets.filter((m) => m.code !== "IN").map((m) => {
      const b = ll(m.lat, m.lon), mid = a.clone().add(b).multiplyScalar(0.5);
      mid.setLength(R + a.distanceTo(b) * 0.45);
      return new THREE.QuadraticBezierCurve3(a, mid, b);
    });
    const ap: number[] = [];
    curves.forEach((c) => { const p = c.getPoints(40); for (let i = 0; i < p.length - 1; i++) ap.push(...p[i].toArray(), ...p[i + 1].toArray()); });
    const arcs = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(ap, 3));
    // the light theme draws the routes as thin tubes: a one-pixel line is too faint on a white page
    const tubes = curves.map((c) => new THREE.TubeGeometry(c, 40, 0.011, 6, false));
    return { grid, arcs, curves, tubes };
  }, [tier]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const view = useView();
  // leave room for the orbit ring (r = 2.9) and the tallest arc inside the slot
  const fit = Math.min(1, view.width / (orbit ? 6.4 : 5.2), view.height / (orbit ? 6.4 : 5.2));
  useFrame(({ clock }, dt) => {
    // a DOM control can ask the globe to turn to one market (state.current.focus = index in site.markets)
    const f = readNum(state, "focus", -1), m = f >= 0 ? site.markets[f] : undefined;
    if (g.current) {
      if (m) {
        const target = Math.PI / 2 - ((m.lon + 180) * Math.PI) / 180;
        const d = Math.atan2(Math.sin(target - g.current.rotation.y), Math.cos(target - g.current.rotation.y));
        g.current.rotation.y += d * Math.min(1, dt * 4);
        g.current.rotation.x = damp(g.current.rotation.x, ((m.lat * Math.PI) / 180) * 0.7, 4, dt);
      } else { g.current.rotation.y += dt * 0.08 + shared.scrollVel * 0.02; g.current.rotation.x = damp(g.current.rotation.x, 0.35 + shared.my * 0.08, 4, dt); }
    }
    if (halo.current) {
      halo.current.visible = !!m;
      // lie flat on the surface: oriented in the globe's own space (lookAt would need world coordinates)
      if (m) { halo.current.position.copy(ll(m.lat, m.lon, R + 0.02)); halo.current.quaternion.setFromUnitVectors(FRONT, v.copy(halo.current.position).normalize()); halo.current.scale.setScalar(1 + 0.25 * Math.sin(clock.elapsedTime * 4)); }
    }
    if (ring.current) ring.current.rotation.z = clock.elapsedTime * 0.12;
    if (dots.current) {
      curves.forEach((c, i) => {
        c.getPoint((clock.elapsedTime * 0.3 + i * 0.21) % 1, v);
        dummy.position.copy(v); dummy.updateMatrix(); dots.current!.setMatrixAt(i, dummy.matrix);
      });
      dots.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group scale={fit}>
      <Glow color={HEX.gold} scale={4.4} opacity={0.35} />
      <group ref={g} rotation-y={-1.9}>
        {/* light theme: a tinted body so the globe reads as a solid object, a darker grid and solid routes */}
        {light ? <mesh><sphereGeometry args={[R * 0.985, 48, 32]} /><meshBasicMaterial color={HEX.champagne} transparent opacity={0.13} depthWrite={false} /></mesh> : null}
        <lineSegments geometry={grid}><lineBasicMaterial color={light ? HEX.bronze : HEX.gold} transparent opacity={light ? 0.62 : 0.28} /></lineSegments>
        {light
          ? tubes.map((geo, i) => <mesh key={i} geometry={geo}><meshBasicMaterial color={HEX.gold} toneMapped={false} /></mesh>)
          : <lineSegments geometry={arcs}><lineBasicMaterial color={HEX.champagne} transparent opacity={0.9} blending={glowBlend()} /></lineSegments>}
        {site.markets.map((m) => (
          <mesh key={m.code} position={ll(m.lat, m.lon, R + 0.01)}><sphereGeometry args={[m.code === "IN" ? 0.07 : 0.045, 12, 12]} /><meshBasicMaterial color={m.code === "IN" ? HEX.amber : HEX.champagne} toneMapped={false} /></mesh>
        ))}
        <mesh ref={halo} visible={false}><ringGeometry args={[0.1, 0.14, 32]} /><meshBasicMaterial color={HEX.amber} toneMapped={false} side={THREE.DoubleSide} /></mesh>
        <instancedMesh ref={dots} args={[undefined, undefined, curves.length]}><sphereGeometry args={[0.035, 8, 8]} /><meshBasicMaterial color={HEX.white} toneMapped={false} /></instancedMesh>
      </group>
      {orbit ? (
        <group ref={ring} rotation-x={1.25}>
          <mesh><torusGeometry args={[2.9, light ? 0.012 : 0.006, 6, 160]} /><meshBasicMaterial color={light ? HEX.bronze : HEX.white} transparent opacity={A(0.35)} /></mesh>
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} position={[Math.cos((i / 10) * Math.PI * 2) * 2.9, Math.sin((i / 10) * Math.PI * 2) * 2.9, 0]}><octahedronGeometry args={[0.07]} /><meshBasicMaterial color={i % 2 ? HEX.gold : HEX.champagne} toneMapped={false} /></mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
}
