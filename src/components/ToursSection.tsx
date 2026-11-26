import { Reveal } from "@/components/Reveal";
import { TourEmbed } from "@/components/TourEmbed";
import { shownTours } from "@/lib/tours";

// The 3D tours block on the Portfolio page and the 3D tours service page.
// Nothing shows until site.ts has a tour.
export function ToursSection({ eyebrow = "3D tours", title = "Walk through a home", className = "pb-28 md:pb-40" }: { eyebrow?: string; title?: string; className?: string }) {
  const list = shownTours();
  if (!list.length) return null;
  return (
    <section className={`mx-auto max-w-[1600px] px-5 md:px-10 ${className}`}>
      <Reveal>
        <p className="label text-mute">{eyebrow}</p>
        <h2 className="display mt-4 text-5xl md:text-6xl">{title}</h2>
      </Reveal>
      <div className="mt-10 grid gap-x-4 gap-y-16 md:grid-cols-2">
        {list.map((t) => (
          <Reveal key={t.src}>
            <TourEmbed src={t.src} allow={t.allow} title={t.title} />
            <p className="label mt-4 text-mute">{t.title}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
