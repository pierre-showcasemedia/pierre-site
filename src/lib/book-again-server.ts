// The server half of Book again (src/lib/book-again.ts): only /api/book-again
// imports this, so nothing here reaches the browser bundle. The studio's
// address and the intake secret come through studioConfig() in
// src/lib/intake.ts, so a local test run (src/lib/test-run.ts) can only ever
// ask a localhost studio.
import { cleanPrefill, isBookAgainToken, type BookAgainPrefill } from "./book-again";
import { post, studioConfig } from "./intake";

// Ask the studio (STUDIO_URL/api/studio/book-again with the intake secret)
// for the prefill. Null for a bad token, no studio here, a studio that says
// no, or one that takes longer than 6 seconds.
export async function prefillFromStudio(token: unknown): Promise<BookAgainPrefill | null> {
  const studio = studioConfig();
  if (!isBookAgainToken(token) || !studio) return null;
  try {
    const r = await post(`${studio.url}/api/studio/book-again?token=${encodeURIComponent(token)}`, { method: "GET", headers: { "x-intake-secret": studio.secret, accept: "application/json" } }, 6_000);
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean };
    return r.ok && j.ok ? cleanPrefill(j) : null;
  } catch {
    return null;
  }
}
