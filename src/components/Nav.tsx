"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/config/site";
import { Logo } from "./Logo";

// Floats transparent over the homepage hero, solid on every inner page and once you scroll.
export function Nav() {
  const pathname = usePathname();
  // Pages that open on a full-bleed photo get the transparent nav.
  const overHero = pathname === "/" || /^\/work\/[^/]+$/.test(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Over a scroll hero, stay transparent until the time-lapse has finished.
    const onScroll = () => {
      const runway = document.querySelector<HTMLElement>("[data-hero-runway]");
      const until = runway ? Math.max(48, runway.offsetHeight - window.innerHeight - 48) : 48;
      setScrolled(window.scrollY > until);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const transparent = overHero && !scrolled && !open;

  return (
    <>
      <header
        data-tone={transparent ? "over-photo" : "solid"}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-500 ${
          transparent
            ? "border-b border-white/15 bg-transparent text-white"
            : "border-b border-line bg-paper/95 text-ink backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 md:px-10">
          <Link href="/" aria-label={`${site.name}, home`} className="relative z-10 shrink-0">
            <Logo tone={transparent || open ? "white" : "ink"} className="h-[40px] w-auto md:h-[46px]" />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                className="label link-underline pb-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <a href={site.portalUrl} className="label link-underline pb-1 opacity-80 hover:opacity-100">
              Client Login
            </a>
            <Link href="/book" className={`btn h-11 px-6 ${transparent ? "btn-light" : "btn-ghost"}`}>
              Book a Shoot
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className={`relative z-10 flex h-11 w-11 items-center justify-center lg:hidden ${open ? "text-white" : ""}`}
          >
            <span className="relative block h-3 w-7">
              <span className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ${open ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-night px-6 pb-10 pt-28 text-white transition-opacity duration-500 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="display py-2 text-5xl transition-colors hover:text-accent-soft"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <Link href="/book" onClick={() => setOpen(false)} className="btn btn-light w-full">Book a Shoot</Link>
          <a href={site.portalUrl} className="label text-center text-white/70">Client Login</a>
          <div className="mt-4 flex justify-between text-sm text-white/60">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={site.text}>Call or text {site.phoneDisplay}</a>
          </div>
        </div>
      </div>
    </>
  );
}
