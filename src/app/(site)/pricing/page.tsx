import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { PricingGate } from "@/components/PricingGate";
import { serviceExtras, site } from "@/config/site";
import { PACKAGES, TRAVEL_CENTS_PER_MILE, TRAVEL_FREE_MILES, itemDef, priceHint, usd, type Item } from "@/lib/pricing";
import { PRICE_SECTIONS } from "@/lib/service-catalog";

// The full price list, behind a short name and email form (Pierre, Nov 23
// 2026). Every number comes from src/lib/pricing.ts, the same table the
// booking form and the studio use, so it can never disagree with them.
export const metadata: Metadata = {
  title: "Pricing",
  description: `Real estate photography, drone, 3D tour and video pricing from ${site.name}, by home size, across ${site.market}.`,
};

// Service pages link here as /pricing#<service>: which section each lands on.
const ANCHORS: Record<string, readonly string[]> = {
  packages: ["photography"],
  "on-their-own": ["aerial", "tours", "video"],
  "add-ons": ["twilight", "staging"],
  portraits: ["portraits"],
};

const SIZES = PACKAGES.filter((p) => !p.quoted);

function SizeTable({ items }: { items: Item[] }) {
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
        <caption className="sr-only">Prices by the finished size of the home</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="label py-4 pr-4 font-normal text-mute">Finished size</th>
            {SIZES.map((p) => (
              <th key={p.id} scope="col" className="label py-4 pr-4 font-normal text-mute">{p.name.replace(" sq ft", "")}</th>
            ))}
            <th scope="col" className="label py-4 font-normal text-mute">Over 10,000</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-line align-top">
              <th scope="row" className="py-5 pr-6 font-normal">
                <span className="block text-lg font-light">{it.name}</span>
                <span className="mt-1 block max-w-xs text-[13px] leading-relaxed text-mute">{it.desc}</span>
              </th>
              {SIZES.map((p) => (
                <td key={p.id} className="figures py-5 pr-4 text-lg">{priceHint(it, p.tier)}</td>
              ))}
              <td className="py-5 text-mute">Quoted</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[13px] text-mute">Sizes are finished square feet. Scroll the table sideways on a phone.</p>
    </div>
  );
}

function PriceRows({ items }: { items: Item[] }) {
  return (
    <ul className="mt-8 divide-y divide-line border-y border-line">
      {items.map((it) => (
        <li key={it.id} className="grid gap-2 py-5 sm:grid-cols-12 sm:gap-6">
          <div className="sm:col-span-9">
            <p className="text-lg font-light">{it.name}</p>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-mute">{it.desc}</p>
            {it.options?.some((o) => o.cents != null) ? (
              <p className="mt-2 text-[13px] text-ink-soft">
                {it.options.map((o) => `${o.name}: ${usd(o.cents ?? 0)}`).join(". ")}.
              </p>
            ) : null}
          </div>
          <p className="figures text-lg sm:col-span-3 sm:text-right">{priceHint(it, -1)}</p>
        </li>
      ))}
    </ul>
  );
}

function PriceList() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-28 md:px-10 md:pb-40">
      {PRICE_SECTIONS.map((sec) => {
        const items = sec.ids.map((id) => itemDef(id)).filter((i): i is Item => Boolean(i));
        const bySize = items.filter((i) => i.price.kind === "tier");
        const rest = items.filter((i) => !bySize.includes(i));
        return (
          <section key={sec.id} id={sec.id} className="scroll-mt-24 border-t border-line py-14 md:py-20">
            {(ANCHORS[sec.id] ?? []).map((a) => (
              <span key={a} id={a} className="block scroll-mt-24" />
            ))}
            <h2 className="display text-4xl md:text-5xl">{sec.title}</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{sec.intro}</p>
            {bySize.length ? <SizeTable items={bySize} /> : null}
            {rest.length ? <PriceRows items={rest} /> : null}
          </section>
        );
      })}
      <section className="grid gap-6 border-t border-line pt-12 text-[15px] leading-relaxed text-ink-soft sm:grid-cols-2">
        <p>{serviceExtras.video}</p>
        <p>
          No travel fee within {TRAVEL_FREE_MILES} miles of our studio on the east side of Madison, near Sun Prairie. Farther, {usd(TRAVEL_CENTS_PER_MILE)} a mile round trip.
        </p>
        <p>Commercial work and anything marked Quoted gets a price for your project. Prices are in USD and subject to applicable sales tax.</p>
        <p>
          Ready? <Link href="/book" className="link-underline">Book a shoot</Link> and the form adds it all up as you go.
        </p>
      </section>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title={<>Clear prices, <span className="text-mute">by home size</span></>}
        intro="Every package, add-on and business portrait, in one list."
      />
      <PricingGate>
        <PriceList />
      </PricingGate>
      <CtaBand />
    </>
  );
}
