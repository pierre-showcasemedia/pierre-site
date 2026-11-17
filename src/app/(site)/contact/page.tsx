import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call, text or email ${site.name}. Tell Pierre about your property or project and he'll confirm your date ${site.confirmWithin}.`,
};

export default function ContactPage() {
  const rows = [
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
    { label: "Call or text", value: site.phoneDisplay, href: site.text },
    { label: "Studio", value: site.address, href: "" },
    ...(site.instagram.url ? [{ label: "Instagram", value: site.instagram.handle, href: site.instagram.url }] : []),
  ];
  return (
    <section className="mx-auto max-w-[1600px] px-5 pb-28 pt-36 md:px-10 md:pb-40 md:pt-48">
      <div className="grid gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="label text-mute">Contact</p>
          <h1 className="display mt-5 text-6xl md:text-7xl">Say hello</h1>
          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Tell Pierre about your property or project and he&apos;ll confirm your date {site.confirmWithin}. {site.travel} Ready to book? The{" "}
            <Link href="/book" className="underline underline-offset-2">booking form</Link> shows your estimate as you go.
          </p>
          <dl className="mt-12 divide-y divide-line border-y border-line">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-6 py-5">
                <dt className="label text-mute">{r.label}</dt>
                <dd>{r.href ? <a href={r.href} className="link-underline text-lg font-light md:text-xl">{r.value}</a> : <span className="text-right text-lg font-light md:text-xl">{r.value}</span>}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-mute">Serving {site.serviceArea}. {site.hours}.</p>
        </Reveal>
        <Reveal className="md:col-span-6 md:col-start-7 md:pt-24" delay={120}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
