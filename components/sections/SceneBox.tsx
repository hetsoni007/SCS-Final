"use client";
import { useCallback, useRef } from "react";
import ViewSlot from "@/components/three/ViewSlot";
import { Poster } from "@/components/ui/Poster";
import { useProgress } from "@/lib/use-progress";
import type { SceneKey } from "@/lib/gl-store";

/**
 * Client wrapper so server-rendered pages can place a 3D scene: owns the mutable state ref the
 * scene reads, and feeds it scroll progress (0..1 as the box travels through the viewport).
 */
export default function SceneBox({ scene, sceneProps, className = "", poster = "orb", screens }: {
  scene: SceneKey; sceneProps?: Record<string, unknown>; className?: string; poster?: "orb" | "globe" | "phones" | "device" | "portal" | "grid"; screens?: string[];
}) {
  const box = useRef<HTMLDivElement>(null), state = useRef({ progress: 0 });
  const on = useCallback((p: number) => { state.current.progress = Math.max(0, (p - 0.35) / 0.65); }, []);
  useProgress(box, on, "through");
  return (
    <div ref={box} className={`scene-box ${className}`}>
      <ViewSlot scene={scene} props={{ ...sceneProps, state }} className="h-full w-full" poster={<Poster kind={poster} screens={screens} />} />
    </div>
  );
}
