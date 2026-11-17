import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { HowItWorks } from "@/components/HowItWorks";
import { ProjectTile } from "@/components/ProjectTile";
import { Reveal } from "@/components/Reveal";
import { ServiceMedia } from "@/components/ServiceMedia";
import { hero, services, site, testimonials, trustedBy } from "@/config/site";
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
  sameAs: [site.instagram.url, site.facebook.url].filter(Boolean),
  knowsAbout: ["Real estate photography", "Commercial photography", "Drone photography", "Floor plans", "Matterport 3D tours", "Zillow 3D tours", "Real estate video", "Business portraits"],
};

const included = [
  { title: "Showcase Photography", body: "Up to 40 images with HDR detail, window views, blue skies and green grass." },
  { title: "Free floor plan", body: "A basic floor plan with dimensions, free with every photo shoot and 3D tour." },
  { title: "Drone and 3D tours", body: "Aerials from an FAA certified pilot, and Matterport or Zillow tours." },
  { title: "Ready in 24 hours", body: "Your gallery in your client portal within 24 hours, 48 hours guaranteed." },
];

export default function Home() {
  const selected = projects.slice(0, 3);
  const lead = projects[0];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1. Hero: a home at twilight */}
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-night text-white">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          preload
          sizes="100vw"
          className="animate-hero-drift object-cover object-[50%_60%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-14 md:px-10 md:pb-20">
          <p className="label text-white/85">Real estate &amp; commercial photography · Madison, Wisconsin</p>
          <h1 className="display mt-6 max-w-5xl text-[3rem] sm:text-6xl md:text-7xl lg:text-[6.25rem]">
            Make your property stand out.
            <br />
            <span className="text-white/75">Ready in 24 hours.</span>
          </h1>
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-[17px] leading-relaxed text-white/85">{site.positioning}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/book" className="btn border-white bg-white text-ink hover:border-accent hover:bg-accent hover:text-white">
                Book a Shoot
              </Link>
              <Link href="/work" className="btn btn-light">View the Work</Link>
            </div>
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
            <p className="display text-[2rem] leading-[1.15] md:text-[3.4rem] md:leading-[1.1]">
              Award-winning photography, drone, 3D tours and video for the agents, builders and businesses of {site.market}.{" "}
              <span className="text-mute">A free floor plan comes with every shoot, and your gallery is ready {site.turnaround}.</span>
            </p>
            <div className="mt-12 grid gap-8 border-t border-line pt-8 text-[15px] leading-relaxed text-ink-soft sm:grid-cols-2">
              <p>With a 30 year track record of stunning visuals and personalized service, Pierre helps your property get the attention it deserves: residential, commercial, architectural, rentals, timelapse and business portraits.</p>
              <p>Book online in about two minutes, or call or text Pierre. No waiting days: we respond extremely quickly and look forward to working with you.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. Selected work */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10 md:pb-36">
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
          <Reveal>
            <p className="label text-mute">Selected work</p>
            <h2 className="display mt-4 text-5xl md:text-6xl">Recent work</h2>
          </Reveal>
          <Link href="/work" className="label link-underline hidden pb-1 sm:inline-block">All work</Link>
        </div>
        <div className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {selected.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 110}>
              <ProjectTile project={p} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
            </Reveal>
          ))}
        </div>
        <Link href="/work" className="btn btn-ghost mt-14 w-full sm:hidden">All work</Link>
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
                <Link href={`/work/${lead.slug}`} className="btn btn-light mt-10">See the full shoot</Link>
              </Reveal>
              <Reveal className="lg:col-span-8" delay={140}>
                <div className="grid grid-cols-2 gap-3">
                  {[lead.images[1], lead.images[10], lead.images[13]].filter(Boolean).map((im, i) => (
                    <Link key={im.src} href={`/work/${lead.slug}`} className={`relative block overflow-hidden ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}>
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
          <Reveal className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              <Image
                src="/images/site/pierre.jpg"
                alt="Pierre Stephenson, M.Photog., Cr., the photographer behind Showcase Media"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={140}>
            <p className="label text-mute">Meet Pierre</p>
            <h2 className="display mt-4 text-5xl md:text-6xl">Thirty years behind the camera.</h2>
            <p className="mt-8 text-[17px] leading-relaxed text-ink-soft">
              Pierre Stephenson is an award-winning PPA Master Photographer with 30 years of experience in
              commercial, real estate and portrait photography. He teaches at Madison College and at seminars
              and workshops across North America, and his work has helped close on thousands of properties.
            </p>
            <Link href="/about" className="label link-underline mt-10 inline-block pb-1">More about Pierre</Link>
          </Reveal>
        </div>
      </section>

      {/* 8. Testimonials, only once real quotes are in config/site.ts */}
      {testimonials.length > 0 ? (
        <section className="border-t border-line py-24 md:py-36">
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

      {/* 9. Trusted by: brokerages named in his testimonials */}
      {trustedBy.length > 0 ? (
        <section className="overflow-hidden border-y border-line py-12">
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
      <HowItWorks title="Simple to book, ready in 24 hours." />

      {/* 11. Book */}
      <CtaBand />
    </>
  );
}
