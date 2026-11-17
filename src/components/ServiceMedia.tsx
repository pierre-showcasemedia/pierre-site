"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Service } from "@/config/site";

// A service card's picture. Always the poster photo; when the service has a clip (site.ts),
// a short loop plays over it while the card is on screen.
// The clip never has sound (muted, and it should carry no audio track), never loads until the
// card comes into view, pauses when it scrolls off or the page is hidden, and never plays for
// visitors who ask for reduced motion or save data: they keep the poster.

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

export function ServiceMedia({
  service,
  sizes,
  className = "",
}: {
  service: Pick<Service, "name" | "image" | "clip">;
  sizes: string;
  className?: string;
}) {
  const { name, image, clip } = service;
  // The server and the first paint show the poster only.
  const still = useSyncExternalStore(subscribeMotion, motionOff, () => true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !clip || still) return;
    v.muted = true;
    v.defaultMuted = true;
    let loaded = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!loaded) {
            loaded = true;
            v.src = clip.webm && v.canPlayType('video/webm; codecs="vp9"') ? clip.webm : clip.mp4;
          }
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    // Runs on unmount and when the page is hidden (Activity): no clip plays off screen.
    return () => {
      io.disconnect();
      v.pause();
    };
  }, [clip, still]);

  return (
    <>
      <Image src={image} alt={name} fill sizes={sizes} className={`object-cover ${className}`} />
      {clip && !still ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setShowing(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${showing ? "opacity-100" : "opacity-0"} ${className}`}
        />
      ) : null}
    </>
  );
}
