"use client";
/** Type "ship it" or enter the Konami code: a phone launches into orbit. Purely decorative. */
import { useEffect, useState } from "react";
import { PhoneFrame } from "./Poster";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
export default function EasterEgg() {
  const [go, setGo] = useState(0);
  useEffect(() => {
    let typed = "", k: string[] = [];
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea,select,[contenteditable]")) return;
      typed = (typed + e.key.toLowerCase()).slice(-7); k = [...k, e.key].slice(-10);
      if (typed === "ship it" || KONAMI.every((x, i) => k[i]?.toLowerCase() === x.toLowerCase())) { typed = ""; k = []; setGo((g) => g + 1); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);
  useEffect(() => { if (!go) return; const t = setTimeout(() => setGo(0), 3200); return () => clearTimeout(t); }, [go]);
  if (!go) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[170] overflow-hidden" aria-hidden key={go}>
      <div className="absolute bottom-[-30vh] left-1/2 w-[110px]" style={{ animation: "launch 3s cubic-bezier(.5,0,.2,1) forwards", transformStyle: "preserve-3d" }}>
        <PhoneFrame />
        <div className="mx-auto h-[220px] w-[46px] rounded-b-full blur-md" style={{ background: "linear-gradient(#E8A33D,#C9A24B00)" }} />
      </div>
      <p className="mono absolute bottom-10 left-1/2 -translate-x-1/2 text-[13px] uppercase tracking-[.3em] text-accent-2">Shipped 🚀</p>
      <style>{`@keyframes launch{0%{transform:translate(-50%,0) rotate(0) perspective(600px) rotateY(0)}60%{transform:translate(-30%,-90vh) rotate(8deg) perspective(600px) rotateY(180deg) scale(.7)}100%{transform:translate(60vw,-150vh) rotate(60deg) perspective(600px) rotateY(540deg) scale(.15)}}`}</style>
    </div>
  );
}
