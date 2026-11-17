import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { ProjectTile } from "@/components/ProjectTile";
import { Reveal } from "@/components/Reveal";
import { site } from "@/config/site";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work",
  description: `Recent real estate photography, drone and twilight work across ${site.market} by ${site.name}.`,
};

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Work"
        title={<>Recent work across <span className="text-mute">Greater Madison</span></>}
        intro="Interiors, exteriors, aerials, twilight and commercial work from across Greater Madison and Dane County. Open any collection to see the full gallery."
      />
      <section className="mx-auto max-w-[1600px] px-5 pb-28 md:px-10 md:pb-40">
        <div className="grid gap-x-4 gap-y-16 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 120}>
              <ProjectTile
                project={p}
                aspect={i % 3 === 0 ? "aspect-[16/10]" : "aspect-[4/3]"}
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </Reveal>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
