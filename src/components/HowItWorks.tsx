import { howItWorks, site } from "@/config/site";
import { Reveal } from "./Reveal";

// Book, confirm, shoot, gallery, and how each kind of client pays. Used on Home and About.
export function HowItWorks({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
      <Reveal>
        <p className="label text-mute">How it works</p>
        <h2 className="display mt-4 max-w-3xl text-5xl md:text-7xl">{title}</h2>
      </Reveal>
      <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        {howItWorks.map((s, i) => (
          <Reveal key={s.step} delay={i * 120} className="border-t border-ink pt-8">
            <p className="figures text-6xl text-accent">{s.step}</p>
            <h3 className="label mt-6">{s.title}</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-14 grid gap-4 border-t border-line pt-8 text-[15px] leading-relaxed text-ink-soft md:grid-cols-12">
        <p className="label text-mute md:col-span-3">Paying</p>
        <p className="md:col-span-9">
          {site.payment.agents} {site.payment.direct}
        </p>
      </Reveal>
    </section>
  );
}
