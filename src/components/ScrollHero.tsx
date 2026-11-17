"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { HeroFilm } from "@/config/site";

// Homepage hero that plays a day-to-night time-lapse as you scroll. A tall "runway"
// holds a sticky full-screen video; scroll position sets the video's current time, so
// the house goes from day to night, then the page carries on. Phones get a portrait cut.
// Reduced-motion users (and data savers) get the still cover photo with no runway.
// The video needs dense keyframes to scrub smoothly: build it with tools/build-scroll-video.py.

const RUNWAY_SVH = 300; // how long the time-lapse lasts, in screen heights
const HOLD = 0.08; // last share of the runway that rests on the final frame

// Scroll progress (0 to 1) to video seconds, through the film's time map so fast
// moments get more scroll. Falls back to linear when there's no map.
function timeAt(map: number[], v: number, duration: number) {
  if (map.length < 2) return v * duration;
  const x = v * (map.length - 1);
  const i = Math.min(map.length - 2, Math.floor(x));
  const t = map[i] + (map[i + 1] - map[i]) * (x - i);
  return Math.min(t, duration);
}

// Motion is off for reduced-motion users and data savers; read in the browser only.
const REDUCE = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const m = window.matchMedia(REDUCE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
function motionOff() {
  const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  return window.matchMedia(REDUCE).matches || saveData;
}

export function ScrollHero({ film, children }: { film: HeroFilm; children: React.ReactNode }) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  const [failed, setFailed] = useState(false);
  const isStatic = useSyncExternalStore(subscribeMotion, motionOff, () => false) || failed;

  useEffect(() => {
    const runway = runwayRef.current;
    const sticky = stickyRef.current;
    const video = videoRef.current;
    if (!runway || !sticky || !video || isStatic) return;

    const portrait = window.matchMedia("(max-aspect-ratio: 4/5)").matches;
    const webm = video.canPlayType('video/webm; codecs="vp9"') !== "";
    video.src = portrait ? (webm ? film.mobileWebm : film.mobileMp4) : webm ? film.webm : film.mp4;
    video.muted = true;
    video.load();

    let target = 0;
    let raf = 0;
    let lastStage = -1;

    const seek = () => {
      if (video.readyState < 2 || video.seeking) return;
      if (Math.abs(video.currentTime - target) > 0.03) video.currentTime = target;
    };

    const update = () => {
      raf = 0;
      const range = Math.max(1, runway.offsetHeight - sticky.offsetHeight);
      const p = Math.min(1, Math.max(0, -runway.getBoundingClientRect().top / range));
      const v = Math.min(1, p / (1 - HOLD));
      sticky.style.setProperty("--hero-p", v.toFixed(4));
      // The headline steps aside while the light changes, and returns on the final frame.
      const copyHidden = v > 0.2 && v < 0.88;
      if (sticky.dataset.copy !== (copyHidden ? "hidden" : "shown")) sticky.dataset.copy = copyHidden ? "hidden" : "shown";
      const s = Math.min(film.stages.length - 1, Math.round(v * (film.stages.length - 1)));
      if (s !== lastStage) {
        lastStage = s;
        setStage(s);
      }
      if (Number.isFinite(video.duration) && video.duration > 0) {
        target = Math.min(timeAt(film.timeMap, v, video.duration), Math.max(0, video.duration - 0.06));
        seek();
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const onLoaded = () => {
      // iOS Safari only paints a seeked frame after the video has played once.
      video.play().then(() => video.pause()).catch(() => {});
      schedule();
    };
    const onSeeked = () => {
      setReady(true);
      seek();
    };
    const onError = () => setFailed(true);

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [film, isStatic]);

  return (
    <div
      ref={runwayRef}
      data-hero-runway
      className="relative motion-reduce:!h-auto"
      style={{ height: isStatic ? "auto" : `${RUNWAY_SVH}svh` }}
    >
      <section ref={stickyRef} className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden bg-night text-white">
        {/* First frame while the film loads, the cover photo when motion is off */}
        <Image
          src={isStatic ? film.cover : film.poster}
          alt={film.alt}
          fill
          preload
          sizes="100vw"
          className="object-cover motion-reduce:hidden"
        />
        <Image src={film.cover} alt={film.alt} fill sizes="100vw" className="hidden object-cover motion-reduce:block" />
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:hidden ${ready && !isStatic ? "opacity-100" : "opacity-0"}`}
        />
        {/* Legibility shade under the text only, so the sky keeps its colour */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.62)_0%,rgb(0_0_0/0.25)_38%,rgb(0_0_0/0)_62%)]" />
        <div className="absolute inset-0 bg-black/10" />

        <div
          className="absolute inset-0 transition-[opacity] duration-300 [[data-copy=hidden]_&]:pointer-events-none"
          style={{ opacity: "max(clamp(0, 1 - (var(--hero-p, 0) - 0.03) * 6, 1), clamp(0, (var(--hero-p, 0) - 0.86) * 8, 1))" }}
        >
          {children}
        </div>

        {/* Day to night meter */}
        {!isStatic ? (
          <div className="pointer-events-none absolute bottom-10 right-5 hidden w-[300px] md:right-10 md:block motion-reduce:!hidden" aria-hidden="true">
            <div className="flex justify-between">
              {film.stages.map((label, i) => (
                <span key={label} className={`label text-[9px] transition-colors duration-500 ${i === stage ? "text-white" : "text-white/40"}`}>
                  {label}
                </span>
              ))}
            </div>
            <span className="mt-3 block h-px bg-white/25">
              <span className="block h-px origin-left bg-accent-soft" style={{ transform: "scaleX(var(--hero-p, 0))" }} />
            </span>
          </div>
        ) : null}

        {/* Scroll cue, fades as soon as the time-lapse starts. Desktop only: on a
            phone the hero's buttons sit at the bottom where the cue would be. */}
        {!isStatic ? (
          <div
            className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex motion-reduce:hidden"
            style={{ opacity: "calc(1 - var(--hero-p, 0) * 12)" }}
            aria-hidden="true"
          >
            <span className="label text-[9px] text-white/70">Scroll</span>
            <span className="block h-10 w-px bg-white/50" />
          </div>
        ) : null}
      </section>
    </div>
  );
}
