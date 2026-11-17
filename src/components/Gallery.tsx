"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProjectImage } from "@/lib/projects";
import { Lightbox } from "./Lightbox";
import { Reveal } from "./Reveal";

// Natural aspect ratios (verticals are never cropped), filled round-robin into
// columns so the order reads left to right. Click any photo to open the viewer.
// Collections that mix properties caption each photo with its property.
function columns<T>(items: T[], n: number) {
  const cols: { item: T; i: number }[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n].push({ item, i }));
  return cols;
}

export function Gallery({ images, alt }: { images: ProjectImage[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const altFor = (im: ProjectImage, i: number) => (im.caption ? `${im.caption}, ${alt}` : `${alt}, photo ${i + 1}`);

  const layouts = [
    { n: 1, cls: "flex md:hidden" },
    { n: 2, cls: "hidden md:flex lg:hidden" },
    { n: images.length < 3 ? 2 : 3, cls: "hidden lg:flex" },
  ];

  return (
    <>
      {layouts.map(({ n, cls }) => (
        <div key={cls} className={`${cls} gap-3 md:gap-4`}>
          {columns(images, n).map((col, c) => (
            <div key={c} className="flex flex-1 flex-col gap-3 md:gap-4">
              {col.map(({ item, i }) => (
                <Reveal key={item.src} delay={(i % n) * 90}>
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    className="group relative block w-full overflow-hidden bg-sand"
                    aria-label={`Open photo ${i + 1} of ${images.length}${item.caption ? `, ${item.caption}` : ""}`}
                  >
                    <Image
                      src={item.src}
                      alt={altFor(item, i)}
                      width={item.w}
                      height={item.h}
                      sizes={`(min-width: 1024px) ${Math.round(100 / n)}vw, (min-width: 768px) 50vw, 100vw`}
                      className="h-auto w-full transition-transform duration-[1.4s] ease-out group-hover:scale-[1.025]"
                    />
                  </button>
                  {item.caption ? <p className="mt-2 text-xs tracking-wide text-mute">{item.caption}</p> : null}
                </Reveal>
              ))}
            </div>
          ))}
        </div>
      ))}

      {open !== null ? (
        <Lightbox
          items={images.map((im, i) => ({ ...im, alt: altFor(im, i), label: im.caption }))}
          index={open}
          onChange={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}
