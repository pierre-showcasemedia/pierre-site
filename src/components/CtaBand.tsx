import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";

export function CtaBand({
  image = "/images/site/cta.jpg",
  title = "Tell Pierre about your property.",
}: {
  image?: string;
  title?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative mx-auto flex min-h-[78svh] max-w-[1600px] flex-col items-center justify-center px-5 py-28 text-center md:px-10">
        <p className="label text-white/75">Book a shoot</p>
        <h2 className="display mt-6 max-w-4xl text-6xl md:text-8xl">{title}</h2>
        <p className="mt-8 max-w-lg text-[17px] leading-relaxed text-white/80">
          Pick your services, see the estimate and request a date in about two minutes. {site.bookingLead}
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/book" className="btn border-white bg-white text-ink hover:border-accent hover:bg-accent hover:text-white">
            Book a Shoot
          </Link>
          <a href={site.text} className="btn btn-light">Text {site.owner.split(" ")[0]}</a>
        </div>
      </div>
    </section>
  );
}
