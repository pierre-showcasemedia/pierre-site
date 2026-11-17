// Checks for Showcase Media's booking price table (src/lib/pricing.ts) and the
// payload /api/booking sends the studio. No network.
//
//   npx tsx scripts/check-pricing.ts
//
// The studio (pierre-showcasemedia/pierre-studio) prices every booking with an
// exact copy of this file, src/lib/booking-pricing.ts. With the studio checked
// out next to this repo (../pierre-studio) or STUDIO_DIR set, the last check
// proves the two files are identical (so the same PRICING_HASH). Change a
// price here, copy the file over, bump PRICING_VERSION, run this and the
// studio's scripts/check-pricing.ts.
//
// Every price below is from Pierre's published price sheet (Nov 2026).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import * as W from "../src/lib/pricing";

let failures = 0;
let passes = 0;
const ok = (cond: unknown, what: string) => {
  if (cond) passes++;
  else {
    failures++;
    console.error(`FAIL ${what}`);
  }
};

type Sel = string | { id: string; qty?: number; option?: string };
const q = (size: string | null, items: Sel[] = [], over: { clientType?: string; area?: string } = {}) =>
  W.priceBooking({
    package: size,
    items: items.map((s) => (typeof s === "string" ? { id: s } : s)),
    clientType: over.clientType ?? "agent",
    area: over.area ?? "Within 30 miles of Madison",
  });
const total = (size: string | null, items: Sel[] = []) => q(size, items).totalCents;

// Sizes.
ok(W.PACKAGES.length === 7 && W.PACKAGES[6].quoted, "seven sizes, over 10,000 sq ft quoted");

// Showcase Photography: $175 at every size up to 3,000 sq ft, with the free floor plan.
for (const s of ["up_to_1200", "to_2500", "to_3000"]) ok(total(s, ["photos"]) === 175_00 && !q(s, ["photos"]).needsQuote, `Showcase Photography $175 at ${s}`);
// The free floor plan's large-property fee: $30, $50, $75.
ok(total("to_5000", ["photos"]) === 205_00, "3,001 to 5,000 sq ft: $175 + $30 floor plan fee");
ok(total("to_7500", ["photos"]) === 225_00, "5,001 to 7,500 sq ft: $175 + $50 floor plan fee");
ok(total("to_10000", ["photos"]) === 250_00, "7,501 to 10,000 sq ft: $175 + $75 floor plan fee");
ok(q("over_10000", ["photos"]).needsQuote, "over 10,000 sq ft is quoted");
ok(q("to_5000", ["photos"]).lines.some((l) => l.id === "floor_plan_large" && l.cents === 30_00), "the fee is its own invoice line");
ok(!q("to_5000", ["drone_photos"]).lines.some((l) => l.id === "floor_plan_large"), "no floor plan fee on a drone-only order");

// Bundles.
ok(total("up_to_1200", ["photo_drone"]) === 234_00, "Photo Drone Bundle $234");
ok([0, 1, 2].every(() => true) && total("up_to_1200", ["tour_bundle"]) === 300_00 && total("to_2500", ["tour_bundle"]) === 325_00 && total("to_3000", ["tour_bundle"]) === 325_00, "3D Tour Bundle $300 / $325");
ok(total("to_5000", ["tour_bundle"]) === 375_00 + 30_00 && total("to_7500", ["tour_bundle"]) === 470_00 + 50_00, "3D Tour Bundle $375 / $470 (+ floor plan fee)");
ok(q("to_10000", ["tour_bundle"]).needsQuote, "3D Tour Bundle over 7,500 sq ft is quoted");
ok(total("up_to_1200", ["classic"]) === 365_00 && total("to_2500", ["classic"]) === 390_00 && total("to_5000", ["classic"]) === 440_00 + 30_00 && total("to_7500", ["classic"]) === 535_00 + 50_00, "Classic Bundle $365 / $390 / $440 / $535");
ok(total("up_to_1200", ["grand"]) === 515_00 && total("to_2500", ["grand"]) === 540_00 && total("to_5000", ["grand"]) === 590_00 + 30_00 && total("to_7500", ["grand"]) === 685_00 + 50_00, "Grand Showcase Bundle $515 / $540 / $590 / $685");
ok(total("to_2500", ["walkthrough_bundle"]) === 375_00 && total("to_2500", ["aerial_bundle"]) === 375_00, "Highlight Walkthrough and Complete Aerial Bundles $375");

// On their own.
ok(total("to_2500", ["drone_photos"]) === 150_00 && total("to_2500", ["drone_video"]) === 150_00 && total("to_2500", ["aerial_package"]) === 250_00, "drone $150 / $150 / $250");
ok(total("up_to_1200", ["tour"]) === 150_00 && total("to_2500", ["tour"]) === 175_00 && total("to_5000", ["tour"]) === 225_00 + 30_00 && total("to_7500", ["tour"]) === 300_00 + 50_00, "3D Virtual Tour $150 / $175 / $225 / $300");
ok(q("to_10000", ["tour"]).needsQuote, "3D tour over 7,500 sq ft is quoted");
ok(total("to_2500", ["walkthrough_showcase"]) === 175_00, "Showcase Walkthrough Video $175");
ok(total("to_2500", ["walkthrough_complete"]) === 225_00 && total("to_3000", ["walkthrough_complete"]) === 255_00 && total("to_7500", ["walkthrough_complete"]) === 280_00 && total("to_10000", ["walkthrough_complete"]) === 310_00, "Complete Walkthrough Video $225 / $255 / $280 / $310");

// Add-ons.
ok(total("to_2500", ["photos", "drone_addon"]) === 244_00, "drone photos added to Showcase Photography $69");
ok(total("to_2500", ["photos", { id: "extra_images", qty: 10 }]) === 215_00, "additional images $4 each");
ok(total("to_2500", ["photos", { id: "virtual_staging", qty: 3 }]) === 265_00, "virtual staging 1 to 3: $30 each");
ok(total("to_2500", ["photos", { id: "virtual_staging", qty: 4 }]) === 275_00, "virtual staging 4 or more: $25 each");
ok(total("to_2500", ["photos", { id: "virtual_twilight", qty: 2 }]) === 215_00 && total("to_2500", ["photos", { id: "virtual_twilight", qty: 5 }]) === 250_00, "virtual twilight $20 each, $15 each for 4 or more");
ok(total("to_2500", ["twilight"]) === 125_00 && !q("to_2500", ["twilight"]).quoteReasons.some((r) => /package/.test(r)), "twilight photography $125, bookable on its own");
ok(total("to_2500", ["walkthrough_bundle", "agent_tour", { id: "advanced_imaging", qty: 2 }]) === 375_00 + 69_00 + 60_00, "agent guided tour $69, advanced imaging $30 each");
ok(q("to_2500", ["photos", "agent_tour"]).needsQuote, "the agent guided tour needs a walkthrough video");
ok(total("to_2500", ["photos", "drone_video_addon"]) === 310_00, "cinematic drone video added to any package $135");
ok(total("to_2500", ["photos", "floor_plan_schematic"]) === 225_00 && total("to_2500", ["photos", "floor_plan_3d"]) === 275_00 && total("to_2500", ["photos", "floor_plan_cad"]) === 275_00, "floor plan upgrades $50 / $100 / $100");

// Business portraits.
ok(total("up_to_1200", ["portrait_session", { id: "portrait_extra_person", qty: 2 }, { id: "portrait_retouch", qty: 1 }]) === 295_00 + 300_00 + 95_00, "portrait session $295, extra person $150, retouched image $95");
ok(total("up_to_1200", ["group_portrait"]) === 295_00 && q("up_to_1200", ["large_group"]).needsQuote, "group portrait $295, large group quoted");

// One package at most.
ok(q("to_2500", ["photos", "grand"]).items.length === 1, "only one package or solo service");

// Areas: within 30 miles of Madison is home; farther gets a travel fee to confirm.
ok(!q("to_2500", ["photos"]).needsQuote, "within 30 miles of Madison: no travel fee");
ok(q("to_2500", ["photos"], { area: "Northern Illinois" }).needsQuote, "Northern Illinois: travel fee to confirm");

// Commercial is quoted.
const commercial = q("to_2500", ["photos"], { clientType: "other" });
ok(commercial.totalCents === 0 && commercial.needsQuote, "commercial work is quoted");

// No price on the public form that isn't on the sheet: only timelapse and large groups are quoted.
ok(W.ITEMS.filter((i) => i.price.kind === "quote").map((i) => i.id).sort().join() === "large_group,timelapse", "only timelapse and large groups are quoted");

// The payload.
const built = W.buildBookingPayload(
  {
    client: { name: "Test Agent", email: "agent@example.com", phone: "6085550123" },
    client_type: "agent",
    property: { address: "123 Main Street, Madison" },
    area: "Within 30 miles of Madison",
    time_window: "midday",
    desired_date: "2026-11-20",
    package: "to_2500",
    items: [{ id: "classic" }, { id: "twilight" }],
    agreed_to_terms: true,
  },
  "00000000-0000-4000-8000-000000000000"
);
ok(built.ok && built.payload.total_cents === 515_00 && built.payload.island === "Within 30 miles of Madison" && built.payload.billing === "pay_first", "payload builds");
ok(!W.buildBookingPayload({ client_type: "agent" }, "x").ok, "payload rejects an empty form");

// The studio's copy, when it is next to this repo.
const studio = [process.env.STUDIO_DIR, "../pierre-studio"].filter((d): d is string => Boolean(d)).map((d) => path.join(d, "src/lib/booking-pricing.ts")).find((f) => existsSync(f));
if (studio) ok(readFileSync(studio, "utf8") === readFileSync("src/lib/pricing.ts", "utf8"), `the studio's ${studio} is identical to src/lib/pricing.ts`);
else console.log("(no studio checkout next to this one: set STUDIO_DIR to compare the files)");

console.log(`${passes} passed, ${failures} failed (pricing ${W.PRICING_VERSION}, hash ${W.PRICING_HASH})`);
if (failures) process.exit(1);
