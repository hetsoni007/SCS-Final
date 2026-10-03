"use client";
import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from "react";
import { glStore, type SceneKey } from "@/lib/gl-store";
import { useApp } from "@/components/providers/AppProviders";
import { cn } from "@/lib/cn";

/**
 * A DOM box that a 3D scene attaches to. The shared <Canvas> (GLRoot) renders the scene
 * into this element's rect via drei <View>. Until WebGL mounts — or when it never does
 * (reduced motion, no GPU) — the static `poster` is shown instead.
 * 3D is decorative: aria-hidden unless `label` is given.
 */
export default function ViewSlot({
  scene, props, poster, className, style, interactive = false, label,
}: {
  scene: SceneKey;
  /** Passed to the scene. Use a stable (useRef/useMemo) object; mutable refs let the DOM drive the scene. */
  props?: Record<string, unknown>;
  poster?: ReactNode;
  className?: string;
  style?: CSSProperties;
  interactive?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { gl } = useApp();
  const latest = useRef<Record<string, unknown>>({});
  useEffect(() => { latest.current = props ?? {}; });

  useEffect(() => {
    if (!gl || !ref.current) return;
    glStore.register({ id, el: ref.current, scene, props: latest.current, interactive });
    return () => glStore.unregister(id);
  }, [gl, id, scene, interactive]);

  return (
    <div
      ref={ref}
      className={cn("view-slot", !interactive && "pointer-events-none", className)}
      style={style}
      data-live={gl ? "1" : "0"}
      data-scene={scene}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {poster && <div className="poster">{poster}</div>}
    </div>
  );
}
