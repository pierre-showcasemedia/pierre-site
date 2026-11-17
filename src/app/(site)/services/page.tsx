import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { ServiceMedia } from "@/components/ServiceMedia";
import { serviceExtras, services, site } from "@/config/site";

export const metadata: Metadata = {
  title: "Services",
  description: `Showcase Photography with a free floor plan, drone aerials, Matterport and Zillow 3D tours, walkthrough video, twilight, virtual staging and business portraits across ${site.market}.`,
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={<>Everything a <span className="text-mute">property</span> needs</>}
        intro={
          <>
            From Showcase Photography to drone, 3D tours and video, delivered {site.turnaround}. Pick a bundle and
            save, or tell Pierre about the property and he&apos;ll put together the right package.
          </>
        }
      />

      <section className="mx-auto max-w-[1600px] px-5 pb-28 md:px-10 md:pb-40">
        <div className="divide-y divide-line border-y border-line">
          {services.map((s, i) => {
            const media = (
              <ServiceMedia
                service={s}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]"
              />
            );
            return (
              <Reveal key={s.slug} as="article" className="scroll-mt-24 py-12 md:py-16">
                <div id={s.slug} className="grid gap-8 md:grid-cols-12 md:items-center">
                  <p className="figures text-5xl text-accent md:col-span-1">{String(i + 1).padStart(2, "0")}</p>
                  <div className="md:col-span-5">
                    <h2 className="display text-3xl md:text-5xl">{s.name}</h2>
                    {s.included ? <p className="label mt-4 text-accent">Included with every shoot</p> : null}
                    <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-soft">{s.body}</p>
                    <div className="mt-8 flex flex-wrap gap-6">
                      <Link href="/book" className="label link-underline pb-1">Book this</Link>
                      {s.href ? (
                        <Link href={s.href} className="label link-underline pb-1 text-mute">See examples</Link>
                      ) : null}
                    </div>
                  </div>
                  {s.href ? (
                    <Link href={s.href} className="group relative block aspect-[16/10] overflow-hidden bg-sand md:col-span-6" tabIndex={-1} aria-hidden="true">
                      {media}
                    </Link>
                  ) : (
                    <div className="group relative aspect-[16/10] overflow-hidden bg-sand md:col-span-6">{media}</div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-20 grid gap-10 md:grid-cols-12">
          <p className="label text-mute md:col-span-3">With every shoot</p>
          <ul className="grid gap-6 text-[15px] leading-relaxed text-ink-soft sm:grid-cols-2 md:col-span-9">
            <li className="border-t border-line pt-4">Bundle services and save: photography, drone, 3D tour and video in one visit.</li>
            <li className="border-t border-line pt-4">Showcase editing: HDR detail, blue sky replacement as needed, window views, fire in the fireplaces and green grass.</li>
            <li className="border-t border-line pt-4">{serviceExtras.video}</li>
            <li className="border-t border-line pt-4">Your gallery in the client portal {site.turnaround}.</li>
          </ul>
          <p className="text-[15px] leading-relaxed text-mute md:col-span-9 md:col-start-4">{serviceExtras.editing}</p>
        </Reveal>

        <Reveal className="mt-20 grid gap-10 md:grid-cols-12">
          <p className="label text-mute md:col-span-3">Good to know</p>
          <dl className="grid gap-6 text-[15px] leading-relaxed text-ink-soft sm:grid-cols-2 md:col-span-9">
            <div className="border-t border-line pt-4">
              <dt className="label text-ink">Where</dt>
              <dd className="mt-3">Greater Madison, Dane County, Wisconsin and Northern Illinois. No travel fee within 30 miles of our east Madison location.</dd>
            </div>
            <div className="border-t border-line pt-4">
              <dt className="label text-ink">Booking</dt>
              <dd className="mt-3">Book online, or call or text Pierre. No waiting days: we respond extremely quickly.</dd>
            </div>
            <div className="border-t border-line pt-4">
              <dt className="label text-ink">Turnaround</dt>
              <dd className="mt-3">Photos within 24 hours, 48 hours guaranteed. Walkthrough videos in 48 hours.</dd>
            </div>
            <div className="border-t border-line pt-4">
              <dt className="label text-ink">Paying</dt>
              <dd className="mt-3">
                {site.payment.agents} {site.payment.direct}
              </dd>
            </div>
          </dl>
        </Reveal>
      </section>

      <CtaBand title="Not sure what the property needs?" />
    </>
  );
}
