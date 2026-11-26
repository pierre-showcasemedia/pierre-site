"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Pierre's hero film (Nov 26 2026). It opens on the dark background and fades
// in from its first frame, so the logo draws in once, from the start. When it
// ends it carries on from loopFrom (the first scene after the logo is drawn),
// so the logo never restarts mid-page. If the film can't play (reduced motion,
// low power mode, a slow line), a still from the film fades in instead.
const WAIT_MS = 3500;

export function HeroFilm({
  video,
  still,
  alt,
  loopFrom,
}: {
  video: { av1?: string; mp4: string; mobile?: string };
  still: string;
  alt: string;
  loopFrom: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"wait" | "playing" | "still">("wait");

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      v.pause();
      const t = setTimeout(() => setState("still"), 0);
      return () => clearTimeout(t);
    }
    const onPlaying = () => setState("playing");
    const onEnded = () => {
      v.currentTime = loopFrom;
      v.play().catch(() => {});
    };
    v.addEventListener("playing", onPlaying);
    v.addEventListener("ended", onEnded);
    if (!v.paused && v.readyState > 2) onPlaying();
    v.play().catch(() => setState("still"));
    const t = setTimeout(() => setState((s) => (s === "wait" ? "still" : s)), WAIT_MS);
    return () => {
      clearTimeout(t);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("ended", onEnded);
    };
  }, [loopFrom]);

  return (
    <>
      <Image
        src={still}
        alt={alt}
        fill
        sizes="100vw"
        className={`object-cover transition-opacity duration-1000 ease-out motion-reduce:!opacity-100 ${state === "still" ? "opacity-100" : "opacity-0"}`}
      />
      <video
        ref={ref}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out motion-reduce:hidden ${state === "playing" ? "opacity-100" : "opacity-0"}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      >
        {/* Phones take the lighter file; computers take AV1 where the
            browser can play it, otherwise H.264. */}
        {video.mobile ? <source src={video.mobile} type="video/mp4" media="(max-width: 767px)" /> : null}
        {video.av1 ? <source src={video.av1} type='video/mp4; codecs="av01.0.08M.08"' /> : null}
        <source src={video.mp4} type="video/mp4" />
      </video>
    </>
  );
}
