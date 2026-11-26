import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand } from "@/components/CtaBand";
import { HowItWorks } from "@/components/HowItWorks";
import { Reveal } from "@/components/Reveal";
import { gear, site, trustedBy } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} is a Madison, Wisconsin real estate and commercial media company: photography, drone, 3D tours, floor plans and video, founded by ${site.owner}, M.Photog., Cr.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-[1600px] px-5 pb-24 pt-36 md:px-10 md:pb-36 md:pt-48">
        <div className="grid gap-14 md:grid-cols-12">
          {/* Pierre, Nov 23 2026: about the business first, not him, now that other
              photographers shoot for Showcase Media too; his portrait smaller. */}
          <Reveal className="md:col-span-7">
            <p className="label text-mute">About us</p>
            <h1 className="display mt-5 text-6xl md:text-7xl">Showcase Media</h1>
            <div className="mt-10 space-y-6 text-[17px] leading-relaxed text-ink-soft">
              <p>
                Showcase Media is a real estate and commercial media company on the east side of Madison. Our
                photographers, drone pilots and editors create photography, aerials, 3D tours, floor plans and video
                for agents, builders and businesses across Greater Madison, Dane County and Northern Illinois.
              </p>
              <p>
                Our work has helped close on thousands of properties. What keeps agents and their clients coming back
                is the experience: attention to detail, real care for every listing, and a process that&apos;s easy from
                booking to delivery.
              </p>
              <p>
                We are all in the people business. Our goal is to always provide a wonderful experience and create
                stunning imagery that motivates buyers. We look forward to working with you.
              </p>
            </div>
          </Reveal>
          <Reveal className="md:col-span-4 md:col-start-9 md:pt-24" delay={120}>
            <div className="relative aspect-[4/5] w-full max-w-[300px] overflow-hidden bg-sand">
              <Image src="/images/site/pierre-2026.jpg" alt="Pierre Stephenson, M.Photog., Cr., founder of Showcase Media" fill preload sizes="300px" className="object-cover object-top" />
            </div>
            <p className="label mt-6 text-mute">Founder</p>
            <p className="display mt-3 text-2xl">Pierre Stephenson</p>
            <p className="mt-2 text-sm text-mute">M.Photog., Cr., FAA certified drone pilot</p>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              An award-winning PPA Master Photographer with 30 years in commercial, real estate and portrait
              photography. He teaches at Madison College and at seminars and workshops across North America.
            </p>
          </Reveal>
          <Reveal className="md:col-span-12">
            <dl className="mt-4 grid grid-cols-2 gap-8 border-t border-line pt-8 md:grid-cols-4">
              <div>
                <dt className="label text-mute">Based in</dt>
                <dd className="display mt-3 text-2xl md:text-3xl">East Madison</dd>
              </div>
              <div>
                <dt className="label text-mute">Services</dt>
                <dd className="display mt-3 text-2xl md:text-3xl">Photo, video, drone and 3D</dd>
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
              <p className="label text-mute">The details</p>
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
          <ul className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
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
