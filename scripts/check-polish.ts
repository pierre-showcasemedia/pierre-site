// The finish details from the Nov 26 2026 polish pass. Offline.
//
//   npx tsx scripts/check-polish.ts
export {};
import { existsSync, readFileSync } from "node:fs";
let failures = 0;
let passes = 0;
const ok = (c: unknown, what: string) => (c ? passes++ : (failures++, console.error(`FAIL ${what}`)));
const read = (p: string) => readFileSync(p, "utf8");

async function main() {
  const { hero, services } = await import("../src/config/site");
  const film = read("src/components/HeroFilm.tsx");
  const home = read("src/app/(site)/page.tsx");
  ok(!/\bloop\b(?!From)/.test(film.replace(/\/\/.*$/gm, "").replace(/loopFrom/g, "")), "the film never restarts its logo animation (no loop attribute)");
  ok(hero.loopFrom > 4 && hero.loopFrom < 10 && /currentTime = loopFrom/.test(film), "each loop carries on after the logo is drawn");
  ok(existsSync(`public${hero.src}`) && hero.src !== "/images/site/hero.jpg", "the fallback still is a frame of Pierre's film, not another photo");
  ok(/state === "playing" \? "opacity-100" : "opacity-0"/.test(film), "the film fades in once it plays");
  ok(/aspect-video md:landscape:absolute/.test(home), "phones and upright tablets see the whole film, logo uncropped");
  for (const s of services) ok(!/service-(tours|video)\.jpg$/.test(s.image) && existsSync(`public${s.image}`), `service image is a clean photo: ${s.slug}`);
  ok(/<p className="label text-mute">Selected work<\/p>/.test(home) && /What agents say/.test(home), "home headings: no repeated label, testimonials titled");
  ok(!/Created by|All Rights Reserved/.test(read("src/components/Footer.tsx")), "footer copyright reads plainly");
  ok(/<Nav solid \/>/.test(read("src/app/not-found.tsx")), "a branded 404 with a solid menu");
  ok(/open\s*\?\s*"border-b border-white\/15 bg-night text-white"/.test(read("src/components/Nav.tsx")), "the open phone menu has a dark top bar");
  console.log(failures ? `${failures} FAILED, ${passes} passed` : `All ${passes} checks passed`);
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
