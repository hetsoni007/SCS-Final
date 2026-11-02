"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import InquiryForm from "./InquiryForm";

/** Modal sheet around the inquiry form. Native <dialog>: focus trap, Esc and inertness of the page come from the browser. */
export default function InquirySheet({ open, location, onClose }: { open: boolean; location: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); d.querySelector<HTMLElement>("[role=radio]")?.focus(); }
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} aria-label="Get a fixed-price proposal" onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }} className="m-auto max-h-[92svh] w-[min(560px,calc(100vw-24px))] overflow-y-auto rounded-3xl border border-line bg-bg-1 p-0 text-hi backdrop:bg-black/70 backdrop:backdrop-blur-sm" data-lenis-prevent>
      {open && (
        <div className="relative p-5 md:p-7">
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-white/5"><X size={16} /></button>
          <InquiryForm location={location} />
        </div>
      )}
    </dialog>
  );
}
