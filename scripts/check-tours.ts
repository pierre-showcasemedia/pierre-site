// Pierre's 3D tours (src/lib/tours.ts): only Matterport and Zillow are framed,
// each lazy and 16:9, on Portfolio and the 3D tours page. Offline.
//
//   npx tsx scripts/check-tours.ts
export {};
import { readFileSync } from "node:fs";
let failures = 0;
let passes = 0;
const ok = (c: unknown, what: string) => (c ? passes++ : (failures++, console.error(`FAIL ${what}`)));
const read = (p: string) => readFileSync(p, "utf8");

async function main() {
  const { tours } = await import("../src/config/site");
  const { tourEmbed, shownTours } = await import("../src/lib/tours");
  ok(tours.length === 2 && shownTours().length === 2, "both of Pierre's tours are shown");
  ok(tours.some((t) => t.src === "https://my.matterport.com/show/?m=jGmuVQBTaaB"), "the Matterport model from his embed code");
  ok(tours.some((t) => t.src.startsWith("https://www.zillow.com/view-imx/8ba0b55a-275a-4188-b1b8-05836bf048da?")), "the Zillow tour from his embed code");
  const bad = [
    { kind: "matterport", src: "https://my.matterport.com.evil.example/show/?m=jGmuVQBTaaB" },
    { kind: "matterport", src: "http://my.matterport.com/show/?m=jGmuVQBTaaB" },
    { kind: "matterport", src: "https://my.matterport.com/show/?m=x\"><script>" },
    { kind: "zillow", src: "https://www.zillow.com.evil.example/view-imx/8ba0b55a-275a-4188-b1b8-05836bf048da" },
    { kind: "zillow", src: "javascript:alert(1)" },
    { kind: "zillow", src: "https://my.matterport.com/show/?m=jGmuVQBTaaB" },
    { kind: "youtube", src: "https://www.youtube.com/embed/x" },
  ] as never[];
  for (const t of bad) ok(tourEmbed(t) === null, `refused: ${(t as { src: string }).src}`);
  ok(tourEmbed({ title: "x", kind: "matterport", src: "https://my.matterport.com/show/?m=jGmuVQBTaaB" })?.allow.includes("xr-spatial-tracking"), "Matterport keeps the permissions from its embed code");
  ok(tourEmbed({ title: "x", kind: "zillow", src: "https://www.zillow.com/view-imx/8ba0b55a-275a-4188-b1b8-05836bf048da" })?.allow === "fullscreen", "Zillow gets fullscreen only");

  const comp = read("src/components/TourEmbed.tsx");
  ok(/loading="lazy"/.test(comp) && /aspect-video/.test(comp) && /absolute inset-0 h-full w-full/.test(comp), "lazy, in a 16:9 wrapper that fills its width");
  ok(/title=\{title\}/.test(comp) && /allowFullScreen/.test(comp), "a title for screen readers, fullscreen allowed");
  ok(/<ToursSection \/>/.test(read("src/app/(site)/portfolio/page.tsx")), "on the Portfolio page");
  ok(/s\.slug === "tours" \? .*<ToursSection/.test(read("src/app/(site)/services/[slug]/page.tsx")), "on the 3D tours service page only");
  const headers = read("next.config.ts");
  ok(!/Content-Security-Policy|X-Frame-Options/.test(headers) || /frame-src[^"]*my\.matterport\.com[^"]*zillow\.com/.test(headers), "no CSP blocks the frames (or it allows both hosts)");

  console.log(failures ? `${failures} FAILED, ${passes} passed` : `All ${passes} checks passed`);
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
