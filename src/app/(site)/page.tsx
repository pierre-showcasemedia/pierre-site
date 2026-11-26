import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { HeroFilm } from "@/components/HeroFilm";
import { HowItWorks } from "@/components/HowItWorks";
import { Reveal } from "@/components/Reveal";
import { ServiceMedia } from "@/components/ServiceMedia";
import { brokerageLogos, hero, services, site, testimonials, trustedBy } from "@/config/site";
import { projects } from "@/lib/projects";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  url: site.url,
  email: site.email,
  telephone: site.phoneE164,
  image: `${site.url}${site.shareImage.src}`,
  logo: `${site.url}/brand/logo-ink.png`,
  founder: { "@type": "Person", name: site.owner },
  address: { "@type": "PostalAddress", streetAddress: "3315 Ambassador Dr", addressLocality: "Madison", addressRegion: "WI", postalCode: "53718", addressCountry: "US" },
  areaServed: [
    { "@type": "City", name: "Madison, Wisconsin" },
    { "@type": "AdministrativeArea", name: "Dane County, Wisconsin" },
    { "@type": "AdministrativeArea", name: "Northern Illinois" },
  ],
  sameAs: [site.instagram.url, site.facebook.url, site.youtube.url].filter(Boolean),
  knowsAbout: ["Real estate photography", "Commercial photography", "Drone photography", "Floor plans", "Matterport 3D tours", "Zillow 3D tours", "Real estate video", "Business portraits"],
};

// What we do, at a glance, just below the landing video (Pierre, Nov 23 2026:
// short, like bullet points; "ready in 24 hours" is standard now, so it's out).
// A first draft for Pierre to rewrite.
const included = [
  { title: "Showcase Photography", body: "Up to 40 images with HDR detail, window views, blue skies and green grass." },
  { title: "Video", body: "Walkthrough and aerial films edited to music, with an agent guided tour if you want one." },
  { title: "Drone and 3D tours", body: "Aerials from an FAA certified pilot, and Matterport or Zillow tours." },
  { title: "Free floor plan*", body: "A basic floor plan with dimensions with every Showcase Photography shoot, up to 3,000 sq ft scanned." },
];

export default function Home() {
  // A mixed taste of the portfolio: photos taken in turn from each collection.
  const photoSets = projects.filter((p) => !p.videos.length).map((p) => p.images);
  const selected = Array.from({ length: 6 }, (_, i) => photoSets[i % photoSets.length]?.[Math.floor(i / photoSets.length) + 1]).filter(Boolean);
  const lead = projects[0];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1. Hero: Pierre's film */}
      {/* Phones and upright tablets see the whole film, 16:9 under the menu,
          so Pierre's logo is never cropped; wide screens get it full screen. */}
      <section className="relative overflow-hidden bg-night pt-20 text-white md:landscape:h-[100svh] md:landscape:min-h-[640px] md:landscape:pt-0">
        <div className="relative aspect-video md:landscape:absolute md:landscape:inset-0 md:landscape:aspect-auto">
          <HeroFilm video={hero.video} still={hero.src} alt={hero.alt} loopFrom={hero.loopFrom} />
        </div>
        {/* Pierre, Nov 23 2026: a clean landing. His video carries the logo and
            its own darkening, so only a soft fade at the top (for the menu)
            and the bottom (for the buttons). The words come as they scroll. */}
        <div className="absolute inset-0 hidden bg-gradient-to-b from-black/35 via-transparent to-black/45 md:landscape:block" />
        <div className="relative mx-auto flex max-w-[1600px] flex-col justify-end px-5 py-8 md:px-10 md:landscape:h-full md:landscape:pb-20 md:landscape:pt-0">
          <h1 className="sr-only">{site.name}: real estate and commercial photography, drone, 3D tours and video in {site.market}</h1>
          <div className="mx-auto flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/book" className="btn border-white bg-white text-ink hover:border-accent hover:bg-accent hover:text-white">
              Book a Shoot
            </Link>
            <Link href="/portfolio" className="btn btn-light">View the Portfolio</Link>
          </div>
        </div>
      </section>

      {/* 2. What comes with every shoot */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1600px] gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {included.map((item, i) => (
            <Reveal key={item.title} delay={i * 90} className="bg-paper px-5 py-10 md:px-10 md:py-14">
              <p className="label text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="display mt-4 text-2xl md:text-[1.7rem]">{item.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. Statement */}
      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <p className="label text-mute">Showcase Media</p>
          </Reveal>
          <Reveal className="md:col-span-9" delay={120}>
            <p className="display text-[1.7rem] leading-[1.2] md:text-[2.5rem] md:leading-[1.15]">
              Award-winning photography, drone, 3D tours and video for the agents, builders and businesses of {site.market}.{" "}
              <span className="text-mute">A free floor plan* comes with every Showcase Photography shoot.</span>
            </p>
            <div className="mt-12 grid gap-8 border-t border-line pt-8 text-[15px] leading-relaxed text-ink-soft sm:grid-cols-2">
              <p>With a 30 year track record of stunning visuals and personalized service, Showcase Media helps your property get the attention it deserves: residential, commercial, architectural, rentals, timelapse and business portraits.</p>
              <p>Book online in about two minutes, or call or text us. No waiting days: we respond extremely quickly and look forward to working with you.</p>
              <p className="text-sm text-mute sm:col-span-2">*Included up to 3,000 sq ft of total scanned space, garages, basements and unfinished areas included. Larger floor plans are $30 to $75.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. Selected work */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10 md:pb-36">
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
          <Reveal>
            <p className="label text-mute">Selected work</p>
            <h2 className="display mt-4 text-5xl md:text-6xl">Portfolio</h2>
          </Reveal>
          <Link href="/portfolio" className="label link-underline hidden pb-1 sm:inline-block">Full portfolio</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {selected.map((im, i) => (
            <Reveal key={im.src} delay={(i % 3) * 110}>
              <Link href="/portfolio" className="relative block aspect-[4/3] overflow-hidden bg-shell">
                <Image src={im.src} alt={`${site.name} portfolio, photo ${i + 1}`} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover transition-transform duration-[1.6s] ease-out hover:scale-[1.04]" />
              </Link>
            </Reveal>
          ))}
        </div>
        <Link href="/portfolio" className="btn btn-ghost mt-14 w-full sm:hidden">Full portfolio</Link>
      </section>

      {/* 5. Services */}
      <section className="bg-sand py-24 md:py-36">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <Reveal className="md:col-span-7">
              <p className="label text-mute">Services</p>
              <h2 className="display mt-4 text-5xl md:text-6xl">Everything a property needs.</h2>
            </Reveal>
            <Reveal className="md:col-span-4 md:col-start-9" delay={120}>
              <p className="text-[15px] leading-relaxed text-ink-soft">
                Photography, drone, 3D tours, floor plans and video, booked together as a bundle and shot in one visit.
              </p>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 4).map((s, i) => (
              <Reveal key={s.slug} delay={i * 100}>
                <Link href={s.href ?? "/services"} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-shell">
                    <ServiceMedia
                      service={s}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]"
                    />
                    {s.included ? (
                      <span className="label absolute left-4 top-4 bg-white px-3 py-2 text-[10px] text-ink">Included</span>
                    ) : null}
                  </div>
                  <p className="label mt-6 text-accent">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="display mt-3 text-2xl md:text-3xl">{s.short}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-14 flex flex-wrap items-center gap-6 border-t border-line pt-8">
            <Link href="/services" className="btn btn-ghost">All services</Link>
            <p className="text-[15px] text-mute">
              Also: {services.slice(4).map((s) => s.name.toLowerCase()).join(", ")}.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Featured listing */}
      {lead ? (
        <section className="bg-night py-24 text-white md:py-36">
          <div className="mx-auto max-w-[1600px] px-5 md:px-10">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <Reveal className="lg:col-span-4">
                <p className="label text-white/50">Featured work</p>
                <h2 className="display mt-4 text-5xl md:text-6xl">{lead.name}</h2>
                <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/70">{lead.headline}</p>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/55">{lead.images.length} photos, with Showcase editing on every image.</p>
                <Link href="/portfolio" className="btn btn-light mt-10">See the portfolio</Link>
              </Reveal>
              <Reveal className="lg:col-span-8" delay={140}>
                <div className="grid grid-cols-2 gap-3">
                  {[lead.images[1], lead.images[10], lead.images[13]].filter(Boolean).map((im, i) => (
                    <Link key={im.src} href="/portfolio" className={`relative block overflow-hidden ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}>
                      <Image src={im.src} alt={`${lead.name}, photo ${i + 2}`} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-out hover:scale-[1.03]" />
                    </Link>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}

      {/* 7. About teaser */}
      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
        <div className="grid gap-12 md:grid-cols-12 md:items-center">
          <Reveal className="md:col-span-3">
            <div className="relative mx-auto aspect-[4/5] max-w-[280px] overflow-hidden bg-sand md:max-w-none">
              <Image
                src="/images/site/pierre-2026.jpg"
                alt="Pierre Stephenson, M.Photog., Cr., founder of Showcase Media"
                fill
                sizes="(min-width: 768px) 25vw, 280px"
                className="object-cover object-top"
              />
            </div>
          </Reveal>
          <Reveal className="md:col-span-7 md:col-start-5" delay={140}>
            <p className="label text-mute">About Showcase Media</p>
            <h2 className="display mt-4 text-5xl md:text-6xl">Thirty years of experience in every shoot.</h2>
            <p className="mt-8 text-[17px] leading-relaxed text-ink-soft">
              Showcase Media was founded by Pierre Stephenson, an award-winning PPA Master Photographer with
              30 years in commercial, real estate and portrait photography. Our photographers bring the same
              standard to every property, and our work has helped close on thousands of them.
            </p>
            <Link href="/about" className="label link-underline mt-10 inline-block pb-1">About us</Link>
          </Reveal>
        </div>
      </section>

      {/* 8. Testimonials, only once real quotes are in config/site.ts */}
      {testimonials.length > 0 ? (
        <section className="border-t border-line py-24 md:py-36">
          <Reveal className="mx-auto mb-14 max-w-[1600px] px-5 md:mb-20 md:px-10">
            <p className="label text-mute">Kind words</p>
            <h2 className="display mt-4 text-5xl md:text-6xl">What agents say</h2>
          </Reveal>
          <div className="mx-auto grid max-w-[1600px] gap-16 px-5 md:grid-cols-3 md:px-10">
            {testimonials.map((t) => (
              <Reveal key={t.name}>
                <blockquote className="display text-2xl leading-snug">&ldquo;{t.quote}&rdquo;</blockquote>
                <p className="label mt-8">{t.name}</p>
                <p className="mt-2 text-sm text-mute">{t.brokerage}</p>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* 9. Trusted by: the brokerages' logos once they arrive, else their names */}
      {brokerageLogos.length > 0 ? (
        <section className="overflow-hidden border-y border-line py-12 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <p className="label mb-8 text-center text-mute">Trusted by agents at</p>
          <div className="flex w-max animate-marquee">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
                {[...brokerageLogos, ...brokerageLogos].map((b, i) => (
                  <Image
                    key={`${k}-${i}`}
                    src={b.src}
                    alt={k === 1 ? "" : b.name}
                    width={b.w}
                    height={b.h}
                    sizes="200px"
                    className="mx-10 h-12 w-auto object-contain opacity-80 grayscale md:h-14"
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : trustedBy.length > 0 ? (
        <section className="overflow-hidden border-y border-line py-12 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <p className="label mb-8 text-center text-mute">Trusted by agents at</p>
          <div className="flex w-max animate-marquee">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
                {[...trustedBy, ...trustedBy].map((name, i) => (
                  <span key={`${k}-${i}`} className="display flex items-center whitespace-nowrap px-8 text-3xl text-ink-soft md:text-4xl">
                    {name}
                    <span className="ml-16 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* 10. How it works */}
      <HowItWorks title="Simple to book." />

      {/* 11. Book */}
      <CtaBand />
    </>
  );
}
