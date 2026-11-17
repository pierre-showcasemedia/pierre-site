"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { videoEmbed } from "@/lib/projects";

// Shows the film's cover frame with a play button and only loads the player
// when someone presses play, so pages with films stay fast.
//
// A film only ever plays because the visitor pressed play, and a pause sticks:
// - Next keeps the pages you leave mounted but hidden (React Activity, with Cache Components on),
//   so an open player used to survive navigation. A hidden page's player keeps playing, and on
//   back/forward the browser reloads the iframe; its src asks for autoplay, so YouTube started
//   the film again from the top, with sound, on a page nobody could see (the Oct 27 call bug).
//   Now the player closes, back to the cover, whenever this component is hidden or unmounted.
// - If the browser reloads the player for any other reason, it closes instead of starting again.
// - Pressing play on one film closes any other film that is open.
const OPEN_EVENT = "video-facade:open";

// Unload the player right away. The state change that removes the iframe can render later
// (hidden pages render at low priority), so this is what actually stops the sound.
function silence(frame: HTMLIFrameElement | null) {
  if (frame && frame.getAttribute("src") !== "about:blank") frame.setAttribute("src", "about:blank");
}

export function VideoFacade({
  video,
  cover,
  title,
  sizes = "(min-width: 1024px) 66vw, 100vw",
  embedUrl,
  aspect = "aspect-video",
}: {
  video?: string;
  cover: string;
  title: string;
  sizes?: string;
  embedUrl?: string;
  aspect?: string;
}) {
  const [playing, setPlaying] = useState(false);
  // The last player element. Kept when React detaches refs, so the hide cleanup can still reach it.
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const loads = useRef(0);
  const id = useId();
  const src = embedUrl ?? (video ? videoEmbed(video) : "");

  // Hidden (the visitor went to another page) or unmounted: stop the player and show the cover.
  useLayoutEffect(() => {
    const frame = frameRef;
    return () => {
      silence(frame.current);
      setPlaying(false);
    };
  }, []);

  // One film at a time: another facade opening closes this one.
  useEffect(() => {
    if (!playing) return;
    const onOpen = (e: Event) => {
      if ((e as CustomEvent<string>).detail === id) return;
      silence(frameRef.current);
      setPlaying(false);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [playing, id]);

  function play() {
    loads.current = 0;
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    setPlaying(true);
  }

  // The player loads once, right after the press. A second load means the browser reloaded it.
  function onFrameLoad() {
    loads.current += 1;
    if (loads.current > 1) {
      silence(frameRef.current);
      setPlaying(false);
    }
  }

  return (
    <div className={`group relative w-full overflow-hidden bg-night ${aspect}`}>
      {playing ? (
        <iframe
          ref={(el) => {
            if (el) frameRef.current = el;
          }}
          src={src}
          title={title}
          onLoad={onFrameLoad}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; xr-spatial-tracking"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={play}
          className="absolute inset-0 h-full w-full text-left"
          aria-label={`Play ${title}`}
        >
          <Image
            src={cover}
            alt={title}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-black/25 transition-colors duration-700 group-hover:bg-black/35" />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 text-white transition-all duration-500 group-hover:scale-105 group-hover:border-white group-hover:bg-white group-hover:text-ink md:h-24 md:w-24">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
