import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { ServiceMedia } from "@/components/ServiceMedia";
import { ToursSection } from "@/components/ToursSection";
import { portraitGallery, services, site } from "@/config/site";
import { Gallery } from "@/components/Gallery";
import { getService, itemsFor } from "@/lib/service-catalog";

// One page per service (Pierre, Nov 23 2026). The words come from site.ts,
// what can be booked from pricing.ts. Prices are on /pricing, behind its
// short form, so this page links there instead of listing them.
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: `${s.name} in ${site.market}`,
    description: s.body.replace(/\*/g, ""),
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { images: [{ url: s.image }] },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const items = itemsFor(s.slug);
  const i = services.indexOf(s);
  const next = services[(i + 1) % services.length];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.body.replace(/\*/g, ""),
    areaServed: site.market,
    provider: { "@type": "LocalBusiness", name: site.name, url: site.url, telephone: site.phoneE164 },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="mx-auto max-w-[1600px] px-5 pb-14 pt-36 md:px-10 md:pb-20 md:pt-48">
        <Reveal>
          <p className="label text-mute">
            <Link href="/services" className="link-underline">Services</Link>
            <span className="mx-2">/</span>
            {s.short}
          </p>
          <h1 className="display mt-5 max-w-5xl text-5xl sm:text-6xl md:text-8xl">{s.name}</h1>
          <p className="mt-10 max-w-2xl text-[17px] leading-relaxed text-ink-soft">{s.body}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/book" className="btn">Book a Shoot</Link>
            <Link href={`/pricing#${s.slug}`} className="btn btn-ghost">See pricing</Link>
            {s.examples ? <Link href={s.examples} className="btn btn-ghost">See examples</Link> : null}
          </div>
        </Reveal>
      </header>

      <section className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="relative aspect-[16/9] overflow-hidden bg-sand">
          <ServiceMedia service={s} sizes="100vw" />
        </div>
      </section>

      {s.slug === "portraits" && portraitGallery.length > 0 ? (
        <section className="mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-32">
          <Reveal>
            <p className="label text-mute">Examples</p>
            <h2 className="display mt-4 text-5xl md:text-6xl">Business portraits</h2>
          </Reveal>
          <div className="mt-10">
            <Gallery images={portraitGallery} alt={`${site.name} business portraits`} />
          </div>
        </section>
      ) : null}

      {s.slug === "tours" ? <div className="pt-24 md:pt-32"><ToursSection eyebrow="Examples" title="Try a tour" /></div> : null}

      {items.length ? (
        <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
          <Reveal className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="label text-mute">What you can book</p>
              <h2 className="display mt-4 text-4xl md:text-5xl">Ways to book it</h2>
              <Link href={`/pricing#${s.slug}`} className="label link-underline mt-8 inline-block pb-1">See the prices</Link>
            </div>
            <ul className="divide-y divide-line border-y border-line md:col-span-8">
              {items.map((it) => (
                <li key={it.id} className="py-6">
                  <h3 className="text-xl font-light md:text-2xl">{it.name}</h3>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{it.desc}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10 md:pb-32">
        <Reveal className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
          <Link href="/services" className="label link-underline pb-1 text-mute">All services</Link>
          <Link href={`/services/${next.slug}`} className="label link-underline pb-1">Next: {next.name}</Link>
        </Reveal>
      </section>

      <CtaBand />
    </>
  );
}
