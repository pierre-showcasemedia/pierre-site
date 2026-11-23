// Put Pierre's homepage video in the hero, in one command.
//
//   node scripts/add-hero-video.mjs "<his video file>.mp4"
//
// Makes three files in public/clips/, all without sound:
//   hero-1920-av1.mp4  AV1, 1920 wide: the smallest file, for browsers that play AV1
//   hero-1920.mp4      H.264, 1920 wide: every other computer
//   hero-1280.mp4      H.264, 1280 wide: phones (screens up to 767 px wide)
// then fills in hero.video in src/config/site.ts.
//
// Nov 23 2026: the first version squeezed the clip to 1280 wide and about
// 1 Mbps to stay under 10 MB, and the animated logo in the middle went soft
// next to the sharp buttons. These settings keep the logo close to his
// original frame by frame (logo-area SSIM at 3, 20 and 45 s: H.264 0.92 to
// 0.97, against 0.79 to 0.88 before), at the cost of bigger files. Don't lower them to save size: send
// Pierre a shorter clip instead.
//
// It plays muted and looped behind the buttons; visitors who ask for reduced
// motion see the still photo. Needs ffmpeg with libsvtav1. Undo: --remove.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";

const CONFIG = "src/config/site.ts";
const AV1 = "public/clips/hero-1920-av1.mp4";
const MP4 = "public/clips/hero-1920.mp4";
const MOBILE = "public/clips/hero-1280.mp4";

const setVideo = (v) => {
  const src = readFileSync(CONFIG, "utf8");
  const re = /video: \{ av1: "[^"]*", mp4: "[^"]*", mobile: "[^"]*" \},/;
  if (!re.test(src)) throw new Error(`hero.video not found in ${CONFIG}`);
  writeFileSync(CONFIG, src.replace(re, `video: { av1: "${v.av1}", mp4: "${v.mp4}", mobile: "${v.mobile}" },`));
};

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node scripts/add-hero-video.mjs "<video>.mp4"   (or --remove)');
  process.exit(1);
}
if (arg === "--remove") {
  for (const f of [AV1, MP4, MOBILE]) rmSync(f, { force: true });
  setVideo({ av1: "", mp4: "", mobile: "" });
  console.log("Hero video removed: the homepage shows the still photo.");
  process.exit(0);
}
if (!existsSync(arg)) {
  console.error(`No such file: ${arg}`);
  process.exit(1);
}

mkdirSync("public/clips", { recursive: true });
const ff = (width, args, out) =>
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", arg, "-an", "-vf", `scale='min(${width},iw)':-2:flags=lanczos`, ...args, "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: "inherit" });
const x264 = (crf) => ["-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", String(crf)];
const mb = (f) => statSync(f).size / 1e6;

ff(1920, ["-c:v", "libsvtav1", "-preset", "6", "-crf", "38", "-svtav1-params", "tune=0"], AV1);
ff(1920, x264(24), MP4);
ff(1280, x264(26), MOBILE);

setVideo({ av1: "/clips/hero-1920-av1.mp4", mp4: "/clips/hero-1920.mp4", mobile: "/clips/hero-1280.mp4" });
console.log(`AV1 ${mb(AV1).toFixed(1)} MB, H.264 ${mb(MP4).toFixed(1)} MB, phone ${mb(MOBILE).toFixed(1)} MB. hero.video is set in ${CONFIG}.`);
console.log("Check it with npm run dev, then commit and push. New file names mean visitors never get the old cached clip.");
