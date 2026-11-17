import { Reveal } from "./Reveal";

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: React.ReactNode; intro?: React.ReactNode }) {
  return (
    <header className="mx-auto max-w-[1600px] px-5 pb-14 pt-36 md:px-10 md:pb-20 md:pt-48">
      <Reveal>
        <p className="label text-mute">{eyebrow}</p>
        <h1 className="display mt-5 max-w-5xl text-6xl md:text-8xl lg:text-[7.5rem]">{title}</h1>
        {intro ? <div className="mt-10 max-w-2xl text-[17px] leading-relaxed text-ink-soft">{intro}</div> : null}
      </Reveal>
    </header>
  );
}
