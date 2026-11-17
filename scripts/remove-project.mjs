#!/usr/bin/env node
// Take a project off the site: node scripts/remove-project.mjs <slug>
// Removes its entry from src/data/projects.json and its web-size photos.
// The original photos (wherever they live on your drive) are never touched.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "src/data/projects.json");

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/remove-project.mjs <slug>");
  process.exit(1);
}
const projects = JSON.parse(fs.readFileSync(DATA, "utf8"));
const i = projects.findIndex((p) => p.slug === slug);
if (i === -1) {
  console.error(`No project with slug "${slug}". Slugs: ${projects.map((p) => p.slug).join(", ")}`);
  process.exit(1);
}
const [removed] = projects.splice(i, 1);
fs.writeFileSync(DATA, JSON.stringify(projects, null, 2) + "\n");
fs.rmSync(path.join(ROOT, "public/images/projects", slug), { recursive: true, force: true });
console.log(`Removed "${removed.name}". ${projects.length} projects left.`);
