// POST /api/pricing-lead: the pricing page's short form (Nov 24 2026).
//
// A visitor gives a name and email to see the full price list. This route
// checks it, then:
//   1. POSTs it to ${STUDIO_URL}/api/studio/leads with x-intake-secret
//      (the studio keeps it under Leads, and marks it booked when that email
//      books), 6 s timeout.
//   2. Sends a readable copy to Formspree (best effort, the archive).
// Success when either accepted. With neither configured (a laptop, a preview
// without settings) it answers a test-mode success so the page still opens.
// Nothing here emails or texts the visitor.
import { EMAIL_RE, UUID_RE, formspreeId, obj, post, rateLimited, sameOrigin, studioConfig, text, visitFrom, type Obj } from "@/lib/intake";
import { CLIENT_TYPES, CLIENT_TYPE_LABELS, type ClientType } from "@/lib/pricing";

export const maxDuration = 20;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ ok: false, error: "origin" }, { status: 403 });
  if (rateLimited(req, 6, "lead")) return Response.json({ ok: false, error: "Too many requests. Please wait a minute and try again." }, { status: 429 });

  let input: Obj;
  try {
    input = obj(await req.json());
  } catch {
    return Response.json({ ok: false, error: "send JSON" }, { status: 400 });
  }
  if (text(input._gotcha)) return Response.json({ ok: true, via: "honeypot" });

  const name = text(input.name, 120);
  const email = text(input.email, 200).toLowerCase();
  const phone = text(input.phone, 40);
  const ct = text(input.client_type, 20);
  const clientType = (CLIENT_TYPES as readonly string[]).includes(ct) ? (ct as ClientType) : null;
  const brokerage = text(input.brokerage, 120);
  if (name.length < 2) return Response.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  const given = text(input.submission_id, 64);
  const submissionId = UUID_RE.test(given) ? given.toLowerCase() : crypto.randomUUID();
  const visit = visitFrom(input);

  const lead = { submission_id: submissionId, kind: "pricing", name, email, phone: phone || null, client_type: clientType, brokerage: brokerage || null, visit };

  const studio = studioConfig();
  const formspree = formspreeId();
  if (!studio && !formspree) return Response.json({ ok: true, testMode: true, lead });

  let studioOk = false;
  if (studio) {
    try {
      const r = await post(`${studio.url}/api/studio/leads`, { method: "POST", headers: { "Content-Type": "application/json", "x-intake-secret": studio.secret }, body: JSON.stringify(lead) }, 6_000);
      studioOk = r.ok;
      if (!r.ok) console.error("[pricing-lead] studio answered", r.status);
    } catch (e) {
      console.error("[pricing-lead] studio:", e);
    }
  }
  let formspreeOk = false;
  if (formspree) {
    try {
      const r = await post(
        `https://formspree.io/f/${formspree}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: `Pricing page: ${name}`,
            _replyto: email,
            form: "Pricing page",
            name,
            email,
            phone,
            client_type: clientType ? CLIENT_TYPE_LABELS[clientType] : "",
            brokerage,
            came_from: [visit.utm_source, visit.utm_medium, visit.utm_campaign].filter(Boolean).join(" / ") || visit.referrer || "direct",
            landing_page: visit.landing ?? "",
          }),
        },
        5_000,
      );
      formspreeOk = r.ok;
    } catch (e) {
      console.error("[pricing-lead] formspree:", e);
    }
  }
  if (!studioOk && !formspreeOk) return Response.json({ ok: false, error: "We couldn't send that just now. Please try again, or call us." }, { status: 502 });
  return Response.json({ ok: true, studio: studioOk, formspree: formspreeOk });
}
