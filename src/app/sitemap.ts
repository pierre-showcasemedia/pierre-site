import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { projects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/services", "/about", "/contact", "/book"].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const work = projects.map((p) => ({
    url: `${site.url}/work/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
    images: [`${site.url}${p.cover}`],
  }));
  return [...pages, ...work];
}
