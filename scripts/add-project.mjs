#!/usr/bin/env node
// Add a property to the portfolio in one command.
//
//   node scripts/add-project.mjs "<folder of finished photos>" \
//     --name "1234 Example Lane" --location "Middleton, Wisconsin" \
//     --headline "One line that sells it" --description "Two or three sentences." \
//     --credit "Listed by Jane Agent, Example Realty" \
//     --video "https://youtu.be/XXXX" --cover "IMG_0042.jpg"
//
// What it does: resizes every JPG/PNG/WEBP in the folder to 1600px on the long
// edge (originals are never touched), saves them in public/images/projects/<slug>/,
// and puts the new project FIRST in src/data/projects.json.
// Flags: --slug to set the URL yourself, --replace to overwrite an existing slug,
// --video can repeat (YouTube or Vimeo links), --dry to preview without writing,
// --captions to caption every photo with its file name (for collections that mix
// several properties: name the files "01 Orchid Penthouse.jpg", "02 Coral 4B.jpg", ...;
// the leading number sets the order and is left out of the caption).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "src/data/projects.json");
const LONG_EDGE = 1600;
const QUALITY = 80;
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);

function parseArgs(argv) {
  const out = { _: [], video: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { out._.push(a); continue; }
    const key = a.slice(2);
    if (key === "replace" || key === "dry" || key === "captions") { out[key] = true; continue; }
    const val = argv[++i];
    if (val === undefined) throw new Error(`Missing value for --${key}`);
    if (key === "video") out.video.push(val); else out[key] = val;
  }
  return out;
}

export function slugify(s) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// "https://youtu.be/abc" -> "youtube:abc", "https://vimeo.com/123" -> "vimeo:123"
export function parseVideo(v) {
  if (/^(youtube|vimeo):/.test(v)) return v;
  const yt = v.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (yt) return `youtube:${yt[1]}`;
  const vm = v.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `vimeo:${vm[1]}`;
  if (/^\d+$/.test(v)) return `vimeo:${v}`;
  throw new Error(`Couldn't read a YouTube or Vimeo id from: ${v}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const folder = args._[0];
  if (!folder || !args.name) {
    console.error('Usage: node scripts/add-project.mjs "<photo folder>" --name "<address or title>" [--location ..] [--headline ..] [--description ..] [--credit ..] [--video <url>] [--cover <file>] [--slug ..] [--captions] [--replace] [--dry]');
    process.exit(1);
  }
  const src = path.resolve(folder);
  if (!fs.existsSync(src)) throw new Error(`Folder not found: ${src}`);

  const files = fs.readdirSync(src)
    .filter((f) => !f.startsWith(".") && EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length === 0) throw new Error(`No photos (jpg, png, webp, tif) in ${src}`);

  const slug = args.slug ? slugify(args.slug) : slugify(args.name);
  const projects = JSON.parse(fs.readFileSync(DATA, "utf8"));
  const existing = projects.findIndex((p) => p.slug === slug);
  if (existing !== -1 && !args.replace) {
    throw new Error(`"${slug}" is already in the portfolio. Add --replace to overwrite it.`);
  }

  const outDir = path.join(ROOT, "public/images/projects", slug);
  console.log(`${args.dry ? "[dry run] " : ""}${files.length} photos -> public/images/projects/${slug}/`);
  if (!args.dry) {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
  }

  const images = [];
  let coverSrc = null;
  for (const [i, f] of files.entries()) {
    const name = `${String(i + 1).padStart(2, "0")}.jpg`;
    const rel = `/images/projects/${slug}/${name}`;
    const pipeline = sharp(path.join(src, f)).rotate()
      .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true });
    let w, h;
    if (args.dry) {
      const m = await sharp(path.join(src, f)).rotate().metadata();
      const scale = Math.min(1, LONG_EDGE / Math.max(m.width, m.height));
      w = Math.round(m.width * scale); h = Math.round(m.height * scale);
    } else {
      const info = await pipeline.toFile(path.join(outDir, name));
      w = info.width; h = info.height;
    }
    const caption = args.captions ? path.parse(f).name.replace(/^\d+[\s._-]*/, "").trim() : "";
    images.push(caption ? { src: rel, w, h, caption } : { src: rel, w, h });
    if (args.cover && f === args.cover) coverSrc = rel;
    process.stdout.write(`  ${f} -> ${name} (${w}x${h})${caption ? ` "${caption}"` : ""}\n`);
  }
  if (args.cover && !coverSrc) throw new Error(`--cover "${args.cover}" isn't one of the photos in the folder`);

  // The cover is the first horizontal photo unless --cover says otherwise.
  const cover = coverSrc ?? (images.find((im) => im.w >= im.h) ?? images[0]).src;
  const entry = {
    slug,
    name: args.name,
    location: args.location ?? "",
    headline: args.headline ?? "",
    description: args.description ?? "",
    credits: args.credit ?? "",
    videos: args.video.map(parseVideo),
    cover,
    images,
  };

  if (existing !== -1) projects.splice(existing, 1);
  projects.unshift(entry);
  if (!args.dry) fs.writeFileSync(DATA, JSON.stringify(projects, null, 2) + "\n");
  console.log(`${args.dry ? "[dry run] would add" : "Added"} "${entry.name}" at /work/${slug} (first in the portfolio, ${projects.length} total).`);
}

main().catch((e) => { console.error(`\n${e.message}`); process.exit(1); });
