"use client";
import { Suspense, lazy, useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ComponentType, type LazyExoticComponent } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { View, PerformanceMonitor, PerspectiveCamera } from "@react-three/drei";
import { glStore, type SceneKey, type SlotEntry } from "@/lib/gl-store";
import { stepDown } from "@/lib/gpu-tier";
import { SlotEl } from "./kit";
import { getStudioEnv } from "./studio-env";
import type { Tier } from "@/lib/motion";

export type SceneProps = { tier: Tier } & Record<string, unknown>;
type Lazy = LazyExoticComponent<ComponentType<SceneProps>>;

/** One lazy chunk per scene: a page only downloads the scenes it mounts. */
const scenes: Record<SceneKey, Lazy> = {
  hero: lazy(() => import("./scenes/HeroScene")),
  codeSplit: lazy(() => import("./scenes/CodeSplit")),
  nodeGraph: lazy(() => import("./scenes/NodeGraph")),
  neural: lazy(() => import("./scenes/NeuralSphere")),
  pipeline: lazy(() => import("./scenes/Pipeline")),
  carousel: lazy(() => import("./scenes/WorkCarousel")),
  portal: lazy(() => import("./scenes/Portal")),
  globe: lazy(() => import("./scenes/Globe")),
  exploded: lazy(() => import("./scenes/ExplodedPhone")),
  cloud: lazy(() => import("./scenes/CloudDiorama")),
  constellation: lazy(() => import("./scenes/Constellation")),
  calcPhone: lazy(() => import("./scenes/CalcPhone")),
  booklet: lazy(() => import("./scenes/Booklet")),
  orb: lazy(() => import("./scenes/MessageOrb")),
  vault: lazy(() => import("./scenes/Industry").then((m) => ({ default: m.Vault }))),
  shelf: lazy(() => import("./scenes/Industry").then((m) => ({ default: m.Shelf }))),
  city: lazy(() => import("./scenes/Industry").then((m) => ({ default: m.City }))),
  ledger: lazy(() => import("./scenes/Industry").then((m) => ({ default: m.Ledger }))),
  browser: lazy(() => import("./scenes/Misc").then((m) => ({ default: m.Browser }))),
  pods: lazy(() => import("./scenes/Misc").then((m) => ({ default: m.Pods }))),
  blocks: lazy(() => import("./scenes/Misc").then((m) => ({ default: m.Blocks }))),
  blocksPhysics: lazy(() => import("./scenes/BlocksPhysics")),
  astronaut: lazy(() => import("./scenes/Misc").then((m) => ({ default: m.Astronaut }))),
  pages: lazy(() => import("./scenes/Misc").then((m) => ({ default: m.Pages }))),
  shield: lazy(() => import("./scenes/Misc").then((m) => ({ default: m.Shield }))),
  device: lazy(() => import("./scenes/DeviceScene")),
  graph: lazy(() => import("./scenes/ArchGraph")),
};

/**
 * Compiles the view's shaders without blocking (KHR_parallel_shader_compile) and reports when the scene can be
 * drawn. Sits inside the scene's Suspense boundary, so it runs once the scene chunk and its textures are in.
 */
function Warm({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene), camera = useThree((s) => s.camera);
  useEffect(() => {
    let dead = false;
    const done = () => { if (!dead) onReady(); };
    // Wait for the shared studio environment first (Studio assigns it to this scene as it resolves), so physical
    // materials are compiled in the variant they will be drawn with. Never wait more than 3 s for it.
    const env = Promise.race([getStudioEnv(gl), new Promise((r) => setTimeout(r, 3000))]);
    env.then(() => gl.compileAsync(scene, camera)).then(done, done);
    return () => { dead = true; };
  }, [gl, scene, camera, onReady]);
  return null;
}

/**
 * A scene (and its textures) only mounts once its slot comes within ~1 viewport; it then stays mounted.
 * The view stays hidden, with the poster still showing, until its shaders have compiled.
 */
function Slot({ entry, tier }: { entry: SlotEntry; tier: Tier }) {
  const Scene = scenes[entry.scene];
  const track = useMemo(() => ({ current: entry.el }), [entry.el]);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "100% 0px" });
    io.observe(entry.el);
    return () => io.disconnect();
  }, [entry.el]);
  const onReady = useCallback(() => setReady(true), []);
  // CSS fades the poster out once the scene is actually on screen
  useEffect(() => {
    if (!ready) return;
    const el = entry.el;
    el.dataset.ready = "1";
    return () => { delete el.dataset.ready; };
  }, [ready, entry.el]);
  if (!near) return null;
  return (
    <View track={track as React.RefObject<HTMLElement>} visible={ready}>
      <PerspectiveCamera makeDefault fov={35} position={[0, 0, 8]} near={0.1} far={100} />
      <SlotEl.Provider value={entry.el}>
        <Suspense fallback={null}>
          <Scene tier={tier} {...entry.props} />
          <Warm onReady={onReady} />
        </Suspense>
      </SlotEl.Provider>
    </View>
  );
}

export default function GLRoot({ tier, onTier }: { tier: Tier; onTier: (t: Tier) => void }) {
  const slots = useSyncExternalStore(glStore.subscribe, glStore.get, glStore.get);
  const [active, setActive] = useState(true);
  const [anyVisible, setAnyVisible] = useState(true);

  // Pause the render loop when the tab is hidden or no slot is near the viewport.
  useEffect(() => {
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  useEffect(() => {
    const vis = new Set<Element>();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? vis.add(e.target) : vis.delete(e.target)));
      setAnyVisible(vis.size > 0);
    }, { rootMargin: "200px" });
    slots.forEach((s) => io.observe(s.el));
    return () => io.disconnect();
  }, [slots]);
  useEffect(() => {
    document.documentElement.classList.add("gl-on");
    return () => document.documentElement.classList.remove("gl-on");
  }, []);

  return (
    <div className="gl-layer" aria-hidden>
      <Canvas
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
        frameloop={active && anyVisible ? "always" : "never"}
        dpr={tier === "high" ? [1, 2] : tier === "mid" ? [1, 1.5] : 1}
        gl={{ antialias: tier !== "low", alpha: true, powerPreference: "high-performance", stencil: false }}
        style={{ position: "absolute", inset: 0 }}
        // start building the shared reflections while the first scene's code is still downloading
        onCreated={({ gl }) => { void getStudioEnv(gl); }}
      >
        <PerformanceMonitor flipflops={2} onDecline={() => onTier(stepDown(tier))} />
        {slots.map((s) => <Slot key={s.id} entry={s} tier={tier} />)}
      </Canvas>
    </div>
  );
}
