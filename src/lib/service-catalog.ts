// What each service page (/services/[slug]) and each section of the pricing
// page (/pricing) lists: the bookable items from src/lib/pricing.ts, by id.
// Names, descriptions and prices always come from pricing.ts, so a price
// changes in one place. (Pierre, Nov 23 2026: a page per service, and the
// full price list behind a name and email form.)
import { ITEMS, itemDef, type Item } from "@/lib/pricing";
import { services, type Service } from "@/config/site";

export const SERVICE_ITEMS: Record<string, readonly string[]> = {
  photography: ["photos", "photo_drone", "tour_bundle", "classic", "walkthrough_bundle", "aerial_bundle", "grand", "extra_images"],
  aerial: ["drone_photos", "drone_video", "aerial_package", "drone_addon", "drone_video_addon"],
  tours: ["tour", "tour_bundle", "classic", "floor_plan_large", "floor_plan_schematic", "floor_plan_3d", "floor_plan_cad"],
  video: ["walkthrough_showcase", "walkthrough_complete", "walkthrough_bundle", "agent_tour", "advanced_imaging"],
  twilight: ["twilight", "virtual_twilight"],
  staging: ["virtual_staging"],
  portraits: ["portrait_session", "group_portrait", "large_group", "portrait_extra_person", "portrait_small_group", "portrait_retouch"],
};

// The items a service page lists, in order, never an admin-only one.
export function itemsFor(slug: string): Item[] {
  return (SERVICE_ITEMS[slug] ?? []).map((id) => itemDef(id)).filter((i): i is Item => Boolean(i && !i.adminOnly));
}

export const getService = (slug: string): Service | undefined => services.find((s) => s.slug === slug);

// Pricing page sections, in booking-form order. Every bookable item appears
// exactly once (scripts/check-service-pages.ts checks it).
export const PRICE_SECTIONS: readonly { id: string; title: string; intro: string; ids: readonly string[] }[] = [
  {
    id: "packages",
    title: "Photography and bundles",
    intro: "Priced by the finished size of the home. Every one includes Showcase Photography and a free basic floor plan.*",
    ids: ITEMS.filter((i) => i.group === "package").map((i) => i.id),
  },
  {
    id: "on-their-own",
    title: "On their own",
    intro: "Drone, 3D tours and video without photography.",
    ids: ITEMS.filter((i) => i.group === "solo").map((i) => i.id),
  },
  {
    id: "add-ons",
    title: "Add-ons",
    intro: "Added to a package at the same visit.",
    ids: ITEMS.filter((i) => (i.group === "extras" || i.group === "standalone") && !i.adminOnly && !i.id.startsWith("portrait_")).map((i) => i.id),
  },
  {
    id: "portraits",
    title: "Business portraits",
    intro: "Photographed at your business.",
    ids: ITEMS.filter((i) => i.group === "portrait" || (i.group === "extras" && i.id.startsWith("portrait_"))).map((i) => i.id),
  },
];
