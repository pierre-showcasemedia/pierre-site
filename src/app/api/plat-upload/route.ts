// POST /api/plat-upload: asks Pierre's studio for a short-lived address to
// upload a plat or lot map from the booking form (Nov 24 2026). The browser
// then sends the file straight to the studio's storage, and the booking
// carries { key, name, kind: "plat" } (see /api/booking). Without the studio
// settings it answers 503 and the form keeps the plat map link box instead.
import { UUID_RE, obj, post, rateLimited, sameOrigin, studioConfig, text } from "@/lib/intake";

export const maxDuration = 15;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ ok: false, error: "origin" }, { status: 403 });
  if (rateLimited(req, 10, "upload")) return Response.json({ ok: false, error: "Too many uploads. Please wait a minute and try again." }, { status: 429 });
  const studio = studioConfig();
  if (!studio) return Response.json({ ok: false, error: "Uploads aren't switched on yet. Please paste a link instead." }, { status: 503 });
  let input;
  try {
    input = obj(await req.json());
  } catch {
    return Response.json({ ok: false, error: "send JSON" }, { status: 400 });
  }
  const submissionId = text(input.submission_id, 64).toLowerCase();
  if (!UUID_RE.test(submissionId)) return Response.json({ ok: false, error: "Please reload the page and try again." }, { status: 400 });
  try {
    const r = await post(
      `${studio.url}/api/studio/intake-upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-intake-secret": studio.secret },
        body: JSON.stringify({ submission_id: submissionId, filename: text(input.filename, 200), content_type: text(input.content_type, 80).toLowerCase(), size: Number(input.size) }),
      },
      6_000,
    );
    const j = obj(await r.json().catch(() => ({})));
    if (!r.ok || !j.ok) return Response.json({ ok: false, error: text(j.error) || "We couldn't take that file just now. Please paste a link instead." }, { status: r.status === 400 ? 400 : 502 });
    return Response.json({ ok: true, url: j.url, key: j.key, contentType: j.contentType });
  } catch (e) {
    console.error("[plat-upload]", e);
    return Response.json({ ok: false, error: "We couldn't take that file just now. Please paste a link instead." }, { status: 502 });
  }
}
