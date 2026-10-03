"use client";
import { useEffect, useRef, type PointerEvent } from "react";

/**
 * Hover-to-select for mouse users. Only real pointer movement counts (a card that slides under a resting pointer
 * while the page scrolls does not), and the pick waits a moment, so sweeping across a list does not select every row.
 */
export function useHoverPick(pick: (k: number) => void, delay = 110) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null), pending = useRef(-1), latest = useRef(pick);
  useEffect(() => { latest.current = pick; });
  const cancel = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; pending.current = -1; };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const over = (k: number) => (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !(e.movementX || e.movementY) || pending.current === k) return;
    cancel();
    pending.current = k;
    timer.current = setTimeout(() => { timer.current = null; pending.current = -1; latest.current(k); }, delay);
  };
  return { over, cancel };
}
