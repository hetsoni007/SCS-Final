import Link from "next/link";
import SceneBox from "@/components/sections/SceneBox";
import PaletteButton from "@/components/ui/PaletteButton";

export const metadata = { title: "404 — This screen didn't ship | Soni Consultancy Services", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-[var(--nav-h)]">
      <SceneBox scene="astronaut" className="!absolute inset-0" />
      <div className="wrap relative z-10 text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="display mt-6">This screen<br /><span className="grad-text">didn&apos;t ship.</span></h1>
        <p className="lead mx-auto mt-6">The page you&apos;re after has moved or never existed. Everything that did ship is one click away.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary btn-lg" data-magnetic="0.25">Back to home</Link>
          <Link href="/work/" className="btn btn-glass btn-lg">See our work</Link>
          <Link href="/blog/" className="btn btn-glass btn-lg">Read the blog</Link>
          <PaletteButton />
        </div>
      </div>
    </section>
  );
}
