import Image from "next/image";
import Link from "next/link";
import { coverOf, type Project } from "@/lib/projects";

export function ProjectTile({
  project,
  sizes,
  aspect = "aspect-[4/3]",
}: {
  project: Project;
  sizes: string;
  aspect?: string;
}) {
  const cover = coverOf(project);
  return (
    <Link href={`/portfolio/${project.slug}`} className="group block">
      <div className={`relative overflow-hidden bg-sand ${aspect}`}>
        <Image
          src={cover.src}
          alt={project.name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/10" />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="display text-3xl transition-colors duration-500 group-hover:text-accent">{project.name}</h3>
        <span className="label shrink-0 text-mute">
          {project.images.length} {project.images.length === 1 ? "photo" : "photos"}
          {project.videos.length ? " · film" : ""}
        </span>
      </div>
      {project.location ? <p className="mt-2 text-sm text-mute">{project.location}</p> : null}
    </Link>
  );
}
