/* =====================================================================
   BOOKING FORM COPY: the words on /book for Showcase Media. Prices are NOT
   here: they live in src/lib/pricing.ts (run scripts/check-pricing.ts after
   any change). Client copy rules: plain and warm, short sentences, sentence
   case buttons, no em dashes, no exclamation marks.
   ===================================================================== */
import { site } from "@/config/site";
import { CONFIRM_WITHIN, TURNAROUND, type ClientType, type ItemGroup, type TimeWindow } from "@/lib/pricing";

export const BOOKING = {
  // The contact form (components/ContactForm.tsx) still posts to Formspree
  // from the browser and reads these two. The booking form posts to
  // /api/booking instead, which reads its own server env (README "Booking form").
  formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "YOUR_FORM_ID",
  testMode: process.env.NEXT_PUBLIC_BOOKING_TEST_MODE !== "false",

  person: "Pierre",
  confirmWithin: CONFIRM_WITHIN,
  turnaround: TURNAROUND,

  // How clients reach the business from the form (from src/config/site.ts).
  contact: {
    phoneDisplay: site.phoneDisplay,
    phoneHref: site.call,
    smsHref: site.text,
  },

  steps: ["You", "Property", "Package", "Add-ons", "When", "Review"],

  // Who's booking. The order on the form; the label comes from pricing.ts.
  clientTypes: [
    { id: "agent", hint: "Listing a home for sale" },
    { id: "homeowner", hint: "Selling or renting your own home" },
    { id: "builder", hint: "New builds, remodels and model homes" },
    { id: "other", hint: "Commercial and architectural projects are quoted" },
  ] as { id: ClientType; hint: string }[],

  windows: [
    { id: "morning", label: "Morning" },
    { id: "midday", label: "Midday" },
    { id: "afternoon", label: "Afternoon" },
  ] as { id: TimeWindow; label: string }[],

  // The package step: Showcase Photography and the bundles first, then services
  // booked on their own, then business portraits.
  packageGroups: [
    { id: "package", title: "Showcase Photography and bundles" },
    { id: "solo", title: "On its own, no photography" },
    { id: "portrait", title: "Business portraits" },
  ] as { id: ItemGroup; title: string }[],

  // The add-on step, in this order.
  groups: [
    { id: "standalone", title: "With a package, or on its own" },
    { id: "extras", title: "Add to your order" },
  ] as { id: ItemGroup; title: string }[],

  areaLine: "Based on the east side of Madison, near Sun Prairie, serving Greater Madison, Dane County, Wisconsin and Northern Illinois. No travel fee within 25 miles of our location.",

  outsideAreaNote: "No travel fee within 25 miles of our location on the east side of Madison, near Sun Prairie. Farther, travel is $0.50 a mile round trip, and we confirm it with you before the shoot.",

  includedNote: "Pick the finished size of the property, then a package. A free basic floor plan* comes with every Showcase Photography shoot and every 3D tour.",

  // Pierre, Nov 23 2026: say it plainly wherever the free floor plan appears.
  floorPlanNote: "*The free floor plan is included up to 3,000 sq ft of total scanned space. That counts garages, basements and unfinished areas, not just the finished square footage, so a home listed at 2,000 sq ft can scan larger. For a larger property, add the larger floor plan in the add-ons ($30 to $75), or we confirm it with you after the scan.",

  packageNote: "Or skip the package and book twilight photography on its own in the next step.",

  twilightNote: "Twilight photography is taken near dusk. We confirm the evening with you. Virtual twilight, just below, gives a similar look from a daytime photo.",

  quotedAddOnsNote: "The free floor plan covers up to 3,000 sq ft of total scanned space. If your property is larger, add the larger floor plan below.",

  quotedClientNote: "Commercial and architectural work is quoted to the project. Pick the closest size and we send a quote.",

  hours: "We shoot Monday to Friday, starting from 9:30 AM to 4 PM, and confirm every time with you. Weekends and earlier or later times are by request: add them in the notes.",

  payment: "Your gallery link arrives by email and in your client portal, along with your invoice.",

  terms: [
    "Cancelling or rescheduling with less than 24 hours notice costs 50% of the order, plus any travel fees if we are already on the way.",
    "Drone flights depend on FAA rules, local rules, safety and the weather, and may not be available everywhere.",
    "3D virtual tours are hosted for up to 1 year.",
    "A free floor plan comes with every Showcase Photography shoot, included up to 3,000 sq ft scanned. Floor plans are based on the actual total scanned square footage, not the finished space.",
    "Larger floor plans: 3,001 to 5,000 sq ft $30, 5,001 to 7,500 sq ft $50, 7,501 to 10,000 sq ft $75.",
    "The listing agent and brokerage are responsible for posting to MLS and handling MLS rules.",
    "Photos are delivered within 24 hours, 48 hours guaranteed. All videos take 48 to 72 hours.",
    "Prices are in USD and subject to applicable sales tax.",
  ],
};
