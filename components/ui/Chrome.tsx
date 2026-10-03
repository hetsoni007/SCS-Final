"use client";
/** Loads the client chrome that is not needed for first paint (preloader, cursor, consent, exit intent, analytics) after hydration. */
import dynamic from "next/dynamic";

const Preloader = dynamic(() => import("./Preloader"), { ssr: false });
const ChromeExtras = dynamic(() => import("./ChromeExtras"), { ssr: false });

export default function Chrome() {
  return (<><Preloader /><ChromeExtras /></>);
}
