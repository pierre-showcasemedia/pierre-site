// Book again prefill for the booking form (studio template, Nov 24 2026;
// src/lib/book-again.ts and book-again-server.ts). The form sends the token
// from its ?again= link; this server asks the studio with the intake secret,
// so the secret never reaches the browser, and passes back only the six form
// fields. No studio, a bad or expired token, or a slow studio: { ok: false }
// and the form starts empty.
import { connection } from "next/server";
import { prefillFromStudio } from "@/lib/book-again-server";

const NO_STORE = { "cache-control": "no-store" };

export async function GET(req: Request) {
  // Per request, never prerendered at build.
  await connection();
  const prefill = await prefillFromStudio(new URL(req.url).searchParams.get("token"));
  if (!prefill) return Response.json({ ok: false }, { headers: NO_STORE });
  return Response.json({ ok: true, ...prefill }, { headers: NO_STORE });
}
