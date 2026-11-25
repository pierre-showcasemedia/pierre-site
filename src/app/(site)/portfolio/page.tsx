import type { Metadata } from "next";
import { ToursSection } from "@/components/ToursSection";
import { CtaBand } from "@/components/CtaBand";
import { Gallery } from "@/components/Gallery";
import { PageHeader } from "@/components/PageHeader";
import { ProjectTile } from "@/components/ProjectTile";
import { Reveal } from "@/components/Reveal";
import { site } from "@/config/site";
import { projects, type ProjectImage } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Portfolio",
  description: `Real estate photography, drone, twilight and commercial work across ${site.market} by ${site.name}.`,
};

// Pierre, Nov 23 2026: one portfolio, every kind of shot mixed together rather
// than split into categories. Photos are taken in turn from each collection so
// interiors, exteriors, twilight and commercial work interleave. Collections
// with films (the Video collection) are shown below as their own tile.
function mixed(): ProjectImage[] {
  const lists = projects.filter((p) => !p.videos.length).map((p) => p.images.map((im) => ({ ...im, caption: undefined })));
  const out: ProjectImage[] = [];
  const seen = new Set<string>();
  for (let i = 0; lists.some((l) => i < l.length); i++) {
    for (const l of lists) {
      const im = l[i];
      if (im && !seen.has(im.src)) {
        seen.add(im.src);
        out.push(im);
      }
    }
  }
  return out;
}

export default function PortfolioPage() {
  const images = mixed();
  const films = projects.filter((p) => p.videos.length);
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title={<>Our work across <span className="text-mute">Greater Madison</span></>}
        intro="Interiors, exteriors, aerials, twilight and commercial work from across Greater Madison and Dane County. Click any photo to see it larger."
      />
      <section className="mx-auto max-w-[1600px] px-5 pb-20 md:px-10 md:pb-28">
        <Gallery images={images} alt={`${site.name} portfolio`} />
      </section>
      {films.length ? (
        <section className="mx-auto max-w-[1600px] px-5 pb-28 md:px-10 md:pb-40">
          <Reveal>
            <p className="label text-mute">Video</p>
            <h2 className="display mt-4 text-5xl md:text-6xl">Films</h2>
          </Reveal>
          <div className="mt-10 grid gap-x-4 gap-y-16 md:grid-cols-2">
            {films.map((p) => (
              <Reveal key={p.slug}>
                <ProjectTile project={p} aspect="aspect-[16/10]" sizes="(min-width: 768px) 50vw, 100vw" />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
      <ToursSection />
      <CtaBand />
    </>
  );
}
