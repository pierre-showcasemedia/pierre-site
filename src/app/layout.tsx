import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Manrope } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

// Instrument Sans for headings and Manrope for body text: the two faces on Pierre's current site.
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Real Estate Photography in Madison, Wisconsin`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    images: [{ url: site.shareImage.src, width: site.shareImage.width, height: site.shareImage.height, alt: `${site.name}, real estate photography in Madison, Wisconsin` }],
  },
  twitter: { card: "summary_large_image", images: [site.shareImage.src] },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrument.variable} ${manrope.variable}`}>
      <body className="min-h-svh bg-paper text-ink antialiased">
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
