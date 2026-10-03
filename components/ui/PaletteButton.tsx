"use client";
import { Search } from "lucide-react";
import { useApp } from "@/components/providers/AppProviders";

/** Opens the site search (the ⌘K palette). */
export default function PaletteButton({ className = "btn btn-glass btn-lg", children = "Search the site" }: { className?: string; children?: React.ReactNode }) {
  const { openPalette } = useApp();
  return <button type="button" className={className} onClick={openPalette}><Search size={18} aria-hidden /> {children}</button>;
}
