// Local test runs never reach Pierre's real accounts (Nov 24 2026).
//
// With NEXT_PUBLIC_SITE_TEST_RUN=1 (set by `npm run test:server`):
//   - every Formspree id is ignored: nothing goes to his inbox,
//   - the studio is only ever a localhost one (a real STUDIO_URL is ignored),
//   - Google address suggestions stay off (his key is never used),
//   - the booking and contact forms are in test mode,
// and next.config.ts refuses to build or serve at all while a real Formspree
// id, a non-local STUDIO_URL or a Maps key is in the environment, so a
// mistake stops the server instead of sending a test to a real inbox.
// No imports: next.config.ts reads this before the app is built.

export const TEST_RUN = process.env.NEXT_PUBLIC_SITE_TEST_RUN === "1";

export function isLocalUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return (u.protocol === "http:" || u.protocol === "https:") && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  } catch {
    return false;
  }
}

// Settings that must not be present in a test run, by name (never values).
export function testRunProblems(env: Record<string, string | undefined>): string[] {
  if (env.NEXT_PUBLIC_SITE_TEST_RUN !== "1") return [];
  const out: string[] = [];
  for (const k of ["NEXT_PUBLIC_FORMSPREE_ID", "FORMSPREE_ID"]) {
    const v = (env[k] || "").trim();
    if (v && v !== "YOUR_FORM_ID") out.push(`${k} is set (a real Formspree form)`);
  }
  const studio = (env.STUDIO_URL || "").trim();
  if (studio && !isLocalUrl(studio)) out.push("STUDIO_URL is not a localhost address");
  if ((env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "").trim()) out.push("NEXT_PUBLIC_GOOGLE_MAPS_KEY is set");
  if ((env.NEXT_PUBLIC_BOOKING_TEST_MODE || "").trim() === "false") out.push("NEXT_PUBLIC_BOOKING_TEST_MODE is false");
  return out;
}
