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

  // How clients reach Pierre from the form (from src/config/site.ts).
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

  areaLine: "Based in east Madison, serving Greater Madison, Dane County, Wisconsin and Northern Illinois.",

  outsideAreaNote: "No travel fee within 30 miles of our east Madison location. Farther than that, Pierre will confirm any travel fee with you before the shoot.",

  includedNote: "Pick the size of the home, then a package. A free basic floor plan comes with every Showcase Photography shoot and every 3D tour.",

  packageNote: "Or skip the package and book twilight photography on its own in the next step.",

  twilightNote: "Twilight photography is taken near dusk. Pierre will confirm the evening with you.",

  quotedAddOnsNote: "Floor plans over 3,000 scanned sq ft have a small large-property fee, added for you.",

  quotedClientNote: "Commercial and architectural work is quoted to the project. Pick the closest size and Pierre will send a quote.",

  hours: "Pierre confirms the exact time with you.",

  payment: "Your gallery arrives in your client portal. Pierre sends your invoice, and your downloads unlock as soon as it's paid.",

  terms: [
    "Drone flights depend on FAA rules, local rules, safety and the weather, and may not be available everywhere.",
    "3D virtual tours are hosted for up to 1 year.",
    "Free floor plans are based on the actual scanned space, not the finished square footage.",
    "The listing agent handles MLS rules.",
    `Photos are delivered ${TURNAROUND}. Walkthrough videos take 48 hours.`,
    "Prices are in USD.",
  ],
};
