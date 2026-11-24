// A local test run can never reach Pierre's real Formspree, studio or Google
// key (src/lib/test-run.ts, scripts/test-server.mjs). Offline.
//
//   npx tsx scripts/check-test-run.ts
export {};
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

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
  // Pretend a careless test run with real settings around.
  process.env.NEXT_PUBLIC_SITE_TEST_RUN = "1";
  process.env.NEXT_PUBLIC_FORMSPREE_ID = "abcd1234";
  process.env.FORMSPREE_ID = "abcd1234";
  process.env.STUDIO_URL = "https://portal.example.com";
  process.env.STUDIO_INTAKE_SECRET = "x".repeat(64);
  process.env.NEXT_PUBLIC_BOOKING_TEST_MODE = "false";

  const { testRunProblems, isLocalUrl, TEST_RUN } = await import("../src/lib/test-run");
  const { studioConfig, formspreeId } = await import("../src/lib/intake");
  const { BOOKING } = await import("../src/config/booking");

  ok(TEST_RUN, "the test-run flag is read");
  ok(formspreeId() === null, "a test run ignores every Formspree id");
  ok(studioConfig() === null, "a test run ignores a non-local studio");
  process.env.STUDIO_URL = "http://localhost:3171";
  ok(studioConfig()?.url === "http://localhost:3171", "a test run may use a localhost studio");
  process.env.STUDIO_URL = "http://localhost.evil.example";
  ok(studioConfig() === null, "a look-alike localhost host is refused");
  ok(BOOKING.testMode === true, "a test run is always in form test mode");
  ok(BOOKING.formspreeId === "YOUR_FORM_ID", "the contact form gets no Formspree id");

  ok(isLocalUrl("http://127.0.0.1:3000") && isLocalUrl("http://[::1]:3000") && !isLocalUrl("https://pierre-studio.vercel.app"), "only localhost counts as local");
  const p = testRunProblems({ NEXT_PUBLIC_SITE_TEST_RUN: "1", NEXT_PUBLIC_FORMSPREE_ID: "abcd1234", STUDIO_URL: "https://x.vercel.app", NEXT_PUBLIC_GOOGLE_MAPS_KEY: "k" });
  ok(p.length === 3, "the build refuses a real Formspree id, a real studio and a Maps key");
  ok(p.every((s) => !s.includes("abcd1234") && !s.includes("x.vercel.app")), "the refusal names settings, never their values");
  ok(testRunProblems({ NEXT_PUBLIC_FORMSPREE_ID: "abcd1234" }).length === 0, "outside a test run nothing changes");
  ok(testRunProblems({ NEXT_PUBLIC_SITE_TEST_RUN: "1", STUDIO_URL: "http://localhost:3171" }).length === 0, "a clean test run passes");

  const cfg = read("next.config.ts");
  ok(/testRunProblems\(process\.env\)[\s\S]*throw new Error/.test(cfg), "next.config.ts refuses to build or serve a bad test run");
  ok(read("src/components/AddressField.tsx").includes('const KEY = TEST_RUN ? ""'), "a test run never uses the Maps key");
  const route = read("src/app/api/booking/route.ts");
  ok(!/function (studioConfig|formspreeId)\(/.test(route) && route.includes('import { formspreeId, studioConfig'), "the booking route uses the guarded settings");
  for (const f of ["src/app/api/pricing-lead/route.ts", "src/app/api/plat-upload/route.ts", "src/lib/book-again-server.ts"]) {
    ok(!/process\.env\.(STUDIO_URL|NEXT_PUBLIC_FORMSPREE_ID|FORMSPREE_ID)/.test(read(f)), `${f} reads settings only through the guard`);
  }
  ok(/fetch\(`https:\/\/formspree\.io\/f\/\$\{BOOKING\.formspreeId\}`/.test(read("src/components/ContactForm.tsx")) && /if \(BOOKING\.testMode\)/.test(read("src/components/ContactForm.tsx")), "the contact form checks test mode before Formspree");

  // The script itself
  const script = read("scripts/test-server.mjs");
  for (const k of ["NEXT_PUBLIC_FORMSPREE_ID", "FORMSPREE_ID", "STUDIO_URL", "STUDIO_INTAKE_SECRET", "NEXT_PUBLIC_GOOGLE_MAPS_KEY"]) ok(script.includes(`"${k}"`), `the test server strips ${k}`);
  ok(script.includes('NEXT_PUBLIC_SITE_TEST_RUN: "1"') && script.includes('NEXT_PUBLIC_BOOKING_TEST_MODE: "true"'), "the test server turns the guard and test mode on");
  ok(/\.env\.local/.test(script) && /process\.exit\(2\)/.test(script), "the test server refuses real settings in env files");
  ok(JSON.parse(read("package.json")).scripts["test:server"] === "node scripts/test-server.mjs", "npm run test:server exists");
  const r = spawnSync("node", ["scripts/test-server.mjs", "--studio", "https://portal.example.com", "--no-build"], { encoding: "utf8" });
  ok(r.status === 2 && /must be a localhost address/.test(r.stderr), "the test server refuses a real studio address");

  console.log(failures ? `${failures} FAILED, ${passes} passed` : `All ${passes} checks passed`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
