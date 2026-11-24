import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { VisitSource } from "@/components/VisitSource";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="fixed inset-x-0 top-0 z-50 h-20 border-b border-line bg-paper/95" />}>
        <Nav />
      </Suspense>
      <main>{children}</main>
      <Footer />
      <VisitSource />
    </>
  );
}
