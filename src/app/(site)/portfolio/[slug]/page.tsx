import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CtaBand } from "@/components/CtaBand";
import { Gallery } from "@/components/Gallery";
import { Reveal } from "@/components/Reveal";
import { VideoFacade } from "@/components/VideoFacade";
import { site } from "@/config/site";
import { coverOf, getProject, neighbours, projects, videoThumb } from "@/lib/projects";

// One template for every project. Change it here and every project page updates.
export function generateStaticParams() {
  // Next needs at least one entry; a brand-new site with no projects yet gets a 404 stub.
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: "coming-soon" }];
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const place = p.location || site.country;
  const cover = coverOf(p);
  return {
    title: `${p.name} | Real Estate Photography in ${place}`,
    description: p.description || p.headline,
    openGraph: { images: [{ url: cover.src, width: cover.w, height: cover.h }] },
  };
}

export default function ProjectPage({ params }: PageProps<"/portfolio/[slug]">) {
  return (
    <Suspense fallback={<div className="h-[86svh] min-h-[560px] bg-night" />}>
      <Project params={params} />
    </Suspense>
  );
}

async function Project({ params }: Pick<PageProps<"/portfolio/[slug]">, "params">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const cover = coverOf(p);
  const { prev, next } = neighbours(p.slug);

  return (
    <>
      <section className="relative h-[86svh] min-h-[560px] overflow-hidden bg-night text-white">
        <Image src={cover.src} alt={p.name} fill preload sizes="100vw" className="animate-hero-drift object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-14 md:px-10 md:pb-20">
          <p className="label text-white/80">{p.location || site.country}</p>
          <h1 className="display mt-5 text-6xl md:text-8xl lg:text-[8rem]">{p.name}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            {p.headline ? <p className="display text-4xl leading-[1.1] md:text-5xl">{p.headline}</p> : null}
            {p.description ? <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-ink-soft">{p.description}</p> : null}
          </Reveal>
          <Reveal className="space-y-6 border-t border-line pt-6 md:col-span-4 md:col-start-9" delay={120}>
            <div>
              <p className="label text-mute">Location</p>
              <p className="mt-2">{p.location || site.country}</p>
            </div>
            {p.credits ? (
              <div>
                <p className="label text-mute">Credits</p>
                <p className="mt-2">{p.credits}</p>
              </div>
            ) : null}
            <div>
              <p className="label text-mute">In this gallery</p>
              <p className="mt-2">
                {p.images.length} photos{p.videos.length ? `, ${p.videos.length} ${p.videos.length === 1 ? "film" : "films"}` : ""}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {p.videos.length ? (
        <section className="mx-auto max-w-[1600px] space-y-4 px-5 pb-16 md:px-10">
          {p.videos.map((v, i) => (
            <VideoFacade key={v} video={v} cover={videoThumb(v) ?? cover.src} title={`${p.name} film ${i + 1}`} sizes="100vw" />
          ))}
        </section>
      ) : null}

      <section className="mx-auto max-w-[1600px] px-3 pb-24 md:px-10 md:pb-36">
        <Gallery images={p.images} alt={p.name} />
      </section>

      <nav className="grid border-t border-line md:grid-cols-2" aria-label="More projects">
        {[{ label: "Previous", p: prev }, { label: "Next", p: next }].map(({ label, p: q }) => (
          <Link
            key={label}
            href={`/portfolio/${q.slug}`}
            className={`group flex items-center gap-6 px-5 py-10 transition-colors hover:bg-sand md:px-10 ${label === "Next" ? "md:flex-row-reverse md:border-l md:border-line md:text-right" : ""}`}
          >
            <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-sand">
              <Image src={coverOf(q).src} alt="" fill sizes="112px" className="object-cover" />
            </div>
            <div>
              <p className="label text-mute">{label} project</p>
              <p className="display mt-2 text-3xl transition-colors group-hover:text-accent">{q.name}</p>
            </div>
          </Link>
        ))}
      </nav>

      <CtaBand />
    </>
  );
}
