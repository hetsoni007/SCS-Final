"use client";
/** A single phone showing a case study's real screens. Used on work cards and case-study heroes. */
import { Glow, Phone, Rig, Studio, useView, usePalette } from "../kit";
import type { SceneProps } from "../GLRoot";

export default function DeviceScene({ screens, platform = "ios", tilt = 0.45 }: SceneProps) {
  const HEX = usePalette();
  const viewport = useView();
  const s = Math.min(viewport.height / 3.6, viewport.width / 2.1);
  return (
    <Rig strength={tilt as number}>
      <Studio />
      <Glow color={HEX.gold} scale={4.4 * s} opacity={0.45} position={[0, 0, -1]} />
      <Phone scale={s} rotation={[0, -0.25, 0.04]} platform={platform as "ios" | "android"} screens={(screens as string[]) ?? []} />
    </Rig>
  );
}
