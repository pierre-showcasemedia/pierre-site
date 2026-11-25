// Pierre's 3D tours (Nov 25 2026, from his embed codes): Matterport and
// Zillow, shown on the Portfolio page and the 3D tours service page. Only
// these two hosts are ever framed; anything else in site.ts is dropped.
import { tours, type Tour } from "@/config/site";

const MATTERPORT = /^https:\/\/my\.matterport\.com\/show\/\?m=[A-Za-z0-9]{8,20}(&[A-Za-z0-9_=.-]*)*$/;
const ZILLOW = /^https:\/\/www\.zillow\.com\/view-imx\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\?[A-Za-z0-9_=&.-]*)?$/;

// What each provider's own embed code allows the frame to do.
const ALLOW: Record<Tour["kind"], string> = {
  matterport: "autoplay; fullscreen; web-share; xr-spatial-tracking",
  zillow: "fullscreen",
};

export function tourEmbed(t: Tour): { src: string; allow: string } | null {
  const ok = t.kind === "matterport" ? MATTERPORT.test(t.src) : t.kind === "zillow" ? ZILLOW.test(t.src) : false;
  return ok ? { src: t.src, allow: ALLOW[t.kind] } : null;
}

export const shownTours = (): (Tour & { allow: string })[] =>
  tours.flatMap((t) => {
    const e = tourEmbed(t);
    return e ? [{ ...t, allow: e.allow }] : [];
  });
