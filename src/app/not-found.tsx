import Link from "next/link";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

// A mistyped or old address: the site's own menu and footer, not a bare 404.
export default function NotFound() {
  return (
    <>
      <Suspense fallback={<div className="fixed inset-x-0 top-0 z-50 h-20 border-b border-line bg-paper/95" />}>
        <Nav solid />
      </Suspense>
      <main className="mx-auto flex min-h-[70svh] max-w-[1600px] flex-col justify-center px-5 pb-24 pt-36 md:px-10">
        <p className="label text-mute">Page not found</p>
        <h1 className="display mt-5 max-w-4xl text-5xl sm:text-6xl md:text-8xl">This page has moved, or never was.</h1>
        <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-ink-soft">The rest of the site is right where you left it.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn">Go to the home page</Link>
          <Link href="/portfolio" className="btn btn-ghost">See the portfolio</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
