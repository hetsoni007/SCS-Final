"use client";
import type { Tier } from "./motion";

/** Scenes that can be attached to a DOM slot. Keys map to lazy chunks in components/three/GLRoot. */
export type SceneKey =
  | "hero" | "codeSplit" | "nodeGraph" | "neural" | "pipeline" | "carousel" | "portal" | "globe"
  | "exploded" | "cloud" | "constellation" | "calcPhone" | "booklet" | "orb" | "vault" | "shelf"
  | "city" | "ledger" | "browser" | "pods" | "blocks" | "blocksPhysics" | "astronaut" | "pages" | "device" | "graph" | "shield";

export type SlotEntry = { id: string; el: HTMLElement; scene: SceneKey; props: Record<string, unknown>; interactive: boolean };

let slots: SlotEntry[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const glStore = {
  register(entry: SlotEntry) {
    slots = [...slots.filter((s) => s.id !== entry.id), entry];
    emit();
  },
  unregister(id: string) {
    slots = slots.filter((s) => s.id !== id);
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => slots,
};

/** Mutable per-frame values shared between DOM (Lenis/GSAP) and shaders. Never triggers React renders. */
export const shared = {
  scrollY: 0,
  scrollVel: 0, // smoothed, roughly -1..1
  mx: 0.45, // pointer, -1..1 (starts right of centre so the idle particle cluster sits beside the headline, not on it)
  my: 0.05,
  pvel: 0, // pointer speed 0..1
  tier: "none" as Tier,
  light: false,
};
