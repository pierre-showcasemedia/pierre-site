import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand } from "@/components/CtaBand";
import { HowItWorks } from "@/components/HowItWorks";
import { Reveal } from "@/components/Reveal";
import { gear, site, trustedBy } from "@/config/site";

export const metadata: Metadata = {
  title: "About Pierre",
  description: `${site.owner}, M.Photog., Cr., is an award-winning PPA Master Photographer with 30 years of commercial, real estate and portrait photography, based in Madison, Wisconsin.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-[1600px] px-5 pb-24 pt-36 md:px-10 md:pb-36 md:pt-48">
        <div className="grid gap-14 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              <Image src="/images/site/pierre.jpg" alt="Pierre Stephenson, M.Photog., Cr., the photographer behind Showcase Media" fill preload sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7 md:pt-10" delay={120}>
            <p className="label text-mute">Meet Pierre</p>
            <h1 className="display mt-5 text-6xl md:text-7xl">Pierre Stephenson</h1>
            <p className="label mt-4 text-mute">M.Photog., Cr., FAA certified drone pilot</p>
            {/* Pierre's own words from the About page of his current site (Nov 2026). */}
            <div className="mt-10 space-y-6 text-[17px] leading-relaxed text-ink-soft">
              <p>
                Greetings. I am an award-winning PPA Master Photographer with 30 years of experience in commercial,
                real estate and portrait photography. I teach both up and coming photographers at Madison College, as
                well as professional photographers all over North America at regional and international seminars and
                workshops.
              </p>
              <p>
                While those years of knowledge and talent have helped close on thousands of properties, it is my warm
                personality, attention to detail and care, and love of fluffy pets, that has so many agents and their
                clients pleased to be collaborating.
              </p>
              <p>
                We are all in the people business. My goal is to always provide a wonderful experience and make the
                process easy as I create stunning imagery that motivates buyers. I look forward to working with you soon.
              </p>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-line pt-8">
              <div>
                <dt className="label text-mute">Based in</dt>
                <dd className="display mt-3 text-2xl md:text-3xl">East Madison</dd>
              </div>
              <div>
                <dt className="label text-mute">Delivery</dt>
                <dd className="display mt-3 text-2xl md:text-3xl">Within 24 hours</dd>
              </div>
              <div>
                <dt className="label text-mute">Serving</dt>
                <dd className="display mt-3 text-2xl md:text-3xl">Dane County and Northern Illinois</dd>
              </div>
              <div>
                <dt className="label text-mute">Experience</dt>
                <dd className="display mt-3 text-2xl md:text-3xl">30 years</dd>
              </div>
            </dl>
            <div className="mt-12 border-t border-line pt-6">
              <p className="label text-mute">Credentials</p>
              <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm text-mute sm:grid-cols-2">
                {gear.map((g) => (
                  <div key={g.label} className="grid grid-cols-[6.5rem_1fr] gap-3">
                    <dt className="shrink-0 text-ink-soft">{g.label}</dt>
                    <dd>{g.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {trustedBy.length > 0 ? (
      <section className="bg-sand py-24 md:py-32">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <Reveal>
            <p className="label text-mute">Trusted by agents at</p>
          </Reveal>
          <ul className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {trustedBy.map((name, i) => (
              <Reveal key={name} as="li" delay={i * 60} className="display border-t border-line pt-5 text-3xl md:text-4xl">
                {name}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      ) : null}

      <HowItWorks title="From booking to gallery" />

      <CtaBand />
    </>
  );
}
