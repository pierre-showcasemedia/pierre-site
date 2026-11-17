import type { Metadata } from "next";
import { BookingForm } from "@/components/BookingForm";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Book a Shoot",
  description: `Book a shoot with ${site.name}: Showcase Photography with a free floor plan, bundles with drone, 3D tours and video, twilight and business portraits across Greater Madison. See your estimate and send the request in about two minutes.`,
};

export default function BookPage() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 pb-28 pt-32 md:px-10 md:pb-40 md:pt-44">
      <div className="mb-12 grid gap-6 border-b border-line pb-10 md:mb-14 md:grid-cols-12 md:items-end md:pb-12">
        <div className="md:col-span-7">
          <p className="label text-mute">Book a shoot</p>
          <h1 className="display mt-5 text-6xl md:text-8xl">Request a date</h1>
        </div>
        <p className="text-[15px] leading-relaxed text-ink-soft md:col-span-4 md:col-start-9">
          Pick the size of the home, see your estimate and send the request. Pierre confirms {site.confirmWithin}. Prefer to talk it through? Call or text{" "}
          <a href={site.call} className="underline underline-offset-2">{site.phoneDisplay}</a> or email{" "}
          <a href={`mailto:${site.email}`} className="underline underline-offset-2">{site.email}</a>
        </p>
      </div>
      <BookingForm />
    </section>
  );
}
