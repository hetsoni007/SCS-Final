"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { track } from "@/lib/analytics";

const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

/** Renders nothing but a button until it is used: the chat code is only downloaded on that first click. */
export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  return open ? <ChatWidget /> : (
    <div className="text-center"><button type="button" className="btn btn-glass btn-lg" onClick={() => { track("cta_click", { location: "chat", label: "open" }); setOpen(true); }}>Ask a question first</button></div>
  );
}
