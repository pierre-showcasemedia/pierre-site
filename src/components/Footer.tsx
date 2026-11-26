import Link from "next/link";
import { nav, site } from "@/config/site";
import { Logo } from "./Logo";
import { Year } from "./Year";

export function Footer() {
  return (
    <footer className="bg-night text-white">
      <div className="mx-auto max-w-[1600px] px-5 pb-10 pt-20 md:px-10 md:pt-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo tone="white" variant="stacked" className="h-[104px] w-auto" />
            <p className="display mt-10 max-w-md text-4xl text-white/90 md:text-5xl">
              Award-winning real estate and commercial photography.
            </p>
            <Link href="/book" className="btn btn-light mt-10">Book a Shoot</Link>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="label text-white/45">Explore</p>
            <ul className="mt-6 space-y-3 text-[15px] text-white/80">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline">{item.label}</Link>
                </li>
              ))}
              <li><Link href="/book" className="link-underline">Book a Shoot</Link></li>
              <li><a href={site.portalUrl} className="link-underline">Client Login</a></li>
              {site.pastGalleries.show ? <li><a href={site.pastGalleries.url} className="link-underline">{site.pastGalleries.label}</a></li> : null}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="label text-white/45">Contact</p>
            <ul className="mt-6 space-y-3 text-[15px] text-white/80">
              <li><a href={`mailto:${site.email}`} className="link-underline">{site.email}</a></li>
              <li><a href={site.text} className="link-underline">Call or text {site.phoneDisplay}</a></li>
              {site.instagram.url ? <li><a href={site.instagram.url} className="link-underline">Instagram {site.instagram.handle}</a></li> : null}
              {site.facebook.url ? <li><a href={site.facebook.url} className="link-underline">Facebook</a></li> : null}
              {site.youtube.url ? <li><a href={site.youtube.url} className="link-underline">YouTube {site.youtube.handle}</a></li> : null}
              <li>{site.address}</li>
            </ul>
            <p className="mt-8 text-[15px] leading-relaxed text-white/55">
              Serving {site.serviceArea}.
            </p>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© <Year /> {site.legalName}. All rights reserved.</p>
          <p className="label text-[10px] text-white/35">{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
