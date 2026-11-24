// Checks for the Nov 24 2026 additions (offline, no network):
//   - a page per service, and the price list behind the pricing form
//   - address suggestions and distance that fall back to plain typing
//   - the plat map upload, and visit sources on leads and bookings
//
//   npx tsx scripts/check-service-pages.ts
export {};
import { readFileSync } from "node:fs";

let failures = 0;
let passes = 0;
const ok = (cond: unknown, what: string) => {
  if (cond) passes++;
  else {
    failures++;
    console.error(`FAIL ${what}`);
  }
};
const read = (p: string) => readFileSync(p, "utf8");

async function main() {
  const { ITEMS, itemDef } = await import("../src/lib/pricing");
  const { SERVICE_ITEMS, PRICE_SECTIONS, itemsFor } = await import("../src/lib/service-catalog");
  const { services, nav } = await import("../src/config/site");
  const { visitFrom } = await import("../src/lib/intake");

  // 1. Service pages
  for (const s of services) {
    ok(s.href === `/services/${s.slug}`, `${s.slug}: the home page card goes to its own page`);
    ok(SERVICE_ITEMS[s.slug]?.length, `${s.slug}: lists what can be booked`);
    for (const id of SERVICE_ITEMS[s.slug] ?? []) ok(itemDef(id), `${s.slug}: ${id} is in the price table`);
    ok(itemsFor(s.slug).every((i) => !i.adminOnly), `${s.slug}: no admin-only item on the page`);
  }
  const page = read("src/app/(site)/services/[slug]/page.tsx");
  ok(!/priceHint|usd\(|\$\d/.test(page), "service pages show no prices (they link to the pricing page)");
  ok(page.includes("generateStaticParams"), "service pages are built for every service");

  // 2. Pricing page: every bookable item exactly once, numbers only from pricing.ts
  const bookable = ITEMS.filter((i) => !i.adminOnly).map((i) => i.id).sort();
  const listed = PRICE_SECTIONS.flatMap((s) => s.ids);
  ok(JSON.stringify([...listed].sort()) === JSON.stringify(bookable), "the price list shows every bookable item exactly once");
  ok(!listed.some((id) => itemDef(id)?.adminOnly), "no admin-only item on the price list");
  const pricing = read("src/app/(site)/pricing/page.tsx");
  ok(!/\$\d/.test(pricing), "the pricing page hard-codes no dollar amount");
  ok(pricing.includes("<PricingGate>"), "the price list sits behind the form");
  ok(nav.some((n) => n.href === "/pricing"), "Pricing is in the menu");
  const gate = read("src/components/PricingGate.tsx");
  ok(gate.includes('"/api/pricing-lead"'), "the form posts to the site's own route");
  ok(/try \{[\s\S]*localStorage/.test(gate), "browser storage is wrapped in try");
  const lead = read("src/app/api/pricing-lead/route.ts");
  ok(lead.includes("/api/studio/leads") && lead.includes("x-intake-secret"), "leads go to the studio with the intake secret");
  ok(lead.includes("formspree.io"), "leads also go to Formspree");
  ok(!/resend|sendEmail|sms/i.test(lead), "the lead route sends nothing to the visitor");

  // 3. Address suggestions
  const addr = read("src/components/AddressField.tsx");
  ok(addr.includes("process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY"), "the Maps key comes from Pierre's settings");
  ok(/if \(!KEY\) return Promise\.resolve\(null\)/.test(addr), "no key: Google never loads");
  ok(addr.includes('autoComplete={KEY ? "off" : "street-address"}'), "no key: the plain address box as before");
  ok(!/AIza[0-9A-Za-z_-]{20,}/.test(addr + read("src/components/BookingForm.tsx") + read(".env.example")), "no Google key in the code");
  const form = read("src/components/BookingForm.tsx");
  ok(/onType=\{\(v\) => setD\(\(prev\) => \(\{ \.\.\.prev, address: v, miles: null \}\)\)\}/.test(form), "typing over a picked address clears the distance");
  ok(!/miles[^\n]*priceBooking|priceBooking[^\n]*miles/.test(form), "the distance never changes a price");

  // 4. Plat map upload
  const route = read("src/app/api/booking/route.ts");
  ok(route.includes("new RegExp(`^intake/${submissionId}/"), "a booking only carries files under its own submission id");
  const upload = read("src/app/api/plat-upload/route.ts");
  ok(upload.includes("/api/studio/intake-upload") && upload.includes("x-intake-secret"), "the upload address comes from the studio");
  ok(form.includes('if (step === 2 && platState === "sending")'), "the form waits for an upload before moving on");

  // 5. Visit sources
  const v = visitFrom({ visit: { utm_source: " google ", referrer: "facebook.com", evil: "x", landing: "/pricing" } });
  ok(v.utm_source === "google" && v.referrer === "facebook.com" && v.landing === "/pricing", "visit fields are kept, trimmed");
  ok(!("evil" in v), "unknown visit fields are dropped");
  ok(Object.keys(visitFrom({ visit: "nope" })).length === 0, "a bad visit is ignored");
  const vs = read("src/components/VisitSource.tsx");
  ok(vs.includes("r.host") && !/document\.cookie/.test(vs), "only the referring site is kept, no cookies");

  console.log(failures ? `${failures} FAILED, ${passes} passed` : `All ${passes} checks passed`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
