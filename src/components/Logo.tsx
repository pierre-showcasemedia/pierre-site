import Image from "next/image";
import { site } from "@/config/site";

// Pierre's logo (from his current site, Nov 2026): the script S and SHOWCASE
// MEDIA. In public/brand/ (PNG, transparent):
//   logo-ink.png / logo-white.png   the full lockup, for the nav, bars and footers
//   mark-ink.png / mark-white.png   the S alone (favicon is src/app/icon.png)
// There is one lockup, so "stacked" uses it too. Sizes live in site.ts.
export function Logo({
  tone = "ink",
  variant = "horizontal",
  className = "h-[30px] w-auto",
}: {
  tone?: "ink" | "white";
  variant?: "horizontal" | "stacked";
  className?: string;
}) {
  const size = variant === "stacked" ? site.logoStacked : site.logo;
  return (
    <Image
      src={`/brand/logo-${tone}.png`}
      alt={site.name}
      width={size.width}
      height={size.height}
      className={className}
      unoptimized
    />
  );
}

export function Mark({ tone = "ink", className = "h-8 w-auto" }: { tone?: "ink" | "white"; className?: string }) {
  return <Image src={`/brand/mark-${tone}.png`} alt="" width={site.mark.width} height={site.mark.height} className={className} unoptimized />;
}
