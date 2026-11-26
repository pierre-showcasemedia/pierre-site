// Brokerage logos and business portraits (src/config/site.ts): ready for
// Pierre's files, invisible until they arrive. Offline.
//
//   npx tsx scripts/check-asset-stubs.ts
export {};
import { existsSync, readFileSync } from "node:fs";
let failures = 0;
let passes = 0;
const ok = (c: unknown, what: string) => (c ? passes++ : (failures++, console.error(`FAIL ${what}`)));
const read = (p: string) => readFileSync(p, "utf8");

async function main() {
  const { brokerageLogos, portraitGallery, trustedBy } = await import("../src/config/site");
  for (const b of brokerageLogos) {
    ok(b.src.startsWith("/images/brokerages/") && existsSync(`public${b.src}`), `logo file exists: ${b.src}`);
    ok(b.name.trim().length > 1 && b.w > 0 && b.h > 0, `logo has a name and its size: ${b.src}`);
  }
  for (const p of portraitGallery) {
    ok(p.src.startsWith("/images/portraits/") && existsSync(`public${p.src}`), `portrait file exists: ${p.src}`);
    ok(p.w > 0 && p.h > 0, `portrait has its size: ${p.src}`);
  }
  ok(new Set(brokerageLogos.map((b) => b.src)).size === brokerageLogos.length && new Set(portraitGallery.map((p) => p.src)).size === portraitGallery.length, "no file listed twice");
  ok(trustedBy.length > 0, "the brokerage names stay as the fallback");

  const home = read("src/app/(site)/page.tsx");
  ok(/brokerageLogos\.length > 0 \? \([\s\S]*\) : trustedBy\.length > 0 \? \(/.test(home), "home: logos when there are any, else the names");
  ok(/alt=\{k === 1 \? "" : b\.name\}/.test(home), "logos are named once for screen readers (the marquee copy is hidden)");
  const svc = read("src/app/(site)/services/[slug]/page.tsx");
  ok(/s\.slug === "portraits" && portraitGallery\.length > 0/.test(svc), "portraits show only on the Business Portraits page, only once there are files");

  console.log(failures ? `${failures} FAILED, ${passes} passed` : `All ${passes} checks passed (${brokerageLogos.length} logos, ${portraitGallery.length} portraits)`);
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
