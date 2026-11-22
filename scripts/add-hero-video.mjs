// Put Pierre's homepage video in the hero, in one command.
//
//   node scripts/add-hero-video.mjs "<his video file>.mp4"
//
// Makes public/clips/hero.mp4 (H.264, 1920 wide or 1280 for a long clip, no
// sound, under 10 MB) and
// public/clips/hero.webm (VP9), then fills in hero.video in src/config/site.ts.
// It plays muted and looped behind the headline; visitors who ask for reduced
// motion see the still photo. Needs ffmpeg. Undo: --remove.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";

const CONFIG = "src/config/site.ts";
const MP4 = "public/clips/hero.mp4";
const WEBM = "public/clips/hero.webm";
const LIMIT_MB = 10;

const setVideo = (mp4, webm) => {
  const src = readFileSync(CONFIG, "utf8");
  const re = /video: \{ mp4: "[^"]*", webm: "[^"]*" \},/;
  if (!re.test(src)) throw new Error(`hero.video not found in ${CONFIG}`);
  writeFileSync(CONFIG, src.replace(re, `video: { mp4: "${mp4}", webm: "${webm}" },`));
};

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node scripts/add-hero-video.mjs "<video>.mp4"   (or --remove)');
  process.exit(1);
}
if (arg === "--remove") {
  for (const f of [MP4, WEBM]) rmSync(f, { force: true });
  setVideo("", "");
  console.log("Hero video removed: the homepage shows the still photo.");
  process.exit(0);
}
if (!existsSync(arg)) {
  console.error(`No such file: ${arg}`);
  process.exit(1);
}

mkdirSync("public/clips", { recursive: true });
const ff = (width, args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", arg, "-an", "-vf", `scale='min(${width},iw)':-2`, ...args], { stdio: "inherit" });
const mb = (f) => statSync(f).size / 1e6;

// Raise the quality number (smaller file) until the MP4 fits. A long clip
// that won't fit at 1920 wide drops to 1280 rather than going blocky.
let crf = 24;
let width = 1920;
for (;;) {
  ff(width, ["-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart", MP4]);
  if (mb(MP4) <= LIMIT_MB) break;
  if (crf < 30) crf += 2;
  else if (width === 1920) { width = 1280; crf = 26; }
  else if (crf < 34) crf += 2;
  else break;
}
ff(width, ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(crf + 10), "-deadline", "good", "-cpu-used", "4", "-row-mt", "1", WEBM]);
if (mb(WEBM) > mb(MP4)) rmSync(WEBM);

setVideo("/clips/hero.mp4", existsSync(WEBM) ? "/clips/hero.webm" : "");
console.log(`${width} wide. hero.mp4 ${mb(MP4).toFixed(1)} MB${existsSync(WEBM) ? `, hero.webm ${mb(WEBM).toFixed(1)} MB` : ""}. hero.video is set in ${CONFIG}.`);
if (mb(MP4) > LIMIT_MB) console.log(`Note: still over ${LIMIT_MB} MB. A shorter clip will load faster.`);
console.log("Check it with npm run dev, then commit and push.");
