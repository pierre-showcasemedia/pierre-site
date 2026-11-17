"use client";

import { useCallback, useEffect } from "react";

export type LightboxItem = {
  src: string;
  w: number;
  h: number;
  alt: string;
  label?: string;
};

// Full-screen viewer: arrows, keyboard (left, right, escape), counter, optional caption.
export function Lightbox({
  items,
  index,
  onChange,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const go = useCallback(
    (d: number) => onChange((index + d + items.length) % items.length),
    [index, items.length, onChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  const item = items[index];
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-night/97 text-white" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <div className="flex h-16 shrink-0 items-center justify-between px-5 md:px-8">
        <span className="label text-white/60">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          {item.label ? <span className="ml-4 normal-case tracking-normal text-white/45">{item.label}</span> : null}
        </span>
        <button type="button" onClick={onClose} className="label pb-1 text-white/80 hover:text-white" aria-label="Close viewer">
          Close
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-24" onClick={onClose}>
        {/* eslint-disable-next-line @next/next/no-img-element -- full-res viewer, the gallery already optimised the thumbnails */}
        <img
          key={item.src}
          src={item.src}
          alt={item.alt}
          width={item.w}
          height={item.h}
          className="max-h-full max-w-full object-contain animate-[fadein_.5s_ease]"
          onClick={(e) => e.stopPropagation()}
        />
        {items.length > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="absolute left-2 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center text-white/70 hover:text-white md:left-6"
              aria-label="Previous photo"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1"><path d="M15 4l-8 8 8 8" /></svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(1); }}
              className="absolute right-2 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center text-white/70 hover:text-white md:right-6"
              aria-label="Next photo"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1"><path d="M9 4l8 8-8 8" /></svg>
            </button>
          </>
        ) : null}
      </div>
      <style>{`@keyframes fadein{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
