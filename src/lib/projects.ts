import data from "@/data/projects.json";

// caption: set on collections that mix several properties (add-project.mjs --captions)
export type ProjectImage = { src: string; w: number; h: number; caption?: string };
export type Project = {
  slug: string;
  name: string;
  location: string;
  headline: string;
  description: string;
  credits: string;
  videos: string[]; // "youtube:<id>" or "vimeo:<id>"
  cover: string;
  images: ProjectImage[];
};

// Array order is display order. scripts/add-project.mjs puts the newest first.
export const projects = data as Project[];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function coverOf(p: Project): ProjectImage {
  return p.images.find((im) => im.src === p.cover) ?? p.images[0];
}

export function neighbours(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}

export function videoEmbed(v: string) {
  const [provider, id] = v.split(":");
  if (provider === "vimeo") return `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`;
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

export function videoThumb(v: string) {
  const [provider, id] = v.split(":");
  return provider === "youtube" ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : null;
}
