// One 3D tour in a 16:9 frame that loads only when it scrolls near
// (src/lib/tours.ts checks the address before it gets here).
export function TourEmbed({ src, allow, title }: { src: string; allow: string; title: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-sand">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow={allow}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
