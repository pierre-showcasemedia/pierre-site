// POST /api/booking: the booking form → Pierre's studio (Showcase Media, Nov 17 2026).
//
// The browser posts the form here as JSON with a submission_id kept for the
// whole form session (a retry is the same booking, never a second one). This
// route checks it, prices it again from src/lib/pricing.ts (the browser's
// total is never trusted), then:
//   1. POSTs the booking as JSON to ${STUDIO_URL}/api/studio/bookings with
//      x-intake-secret: STUDIO_INTAKE_SECRET (the studio's BOOKING_INTAKE_SECRET),
//      6 s timeout, one retry. The studio makes the client, the listing, the
//      booking, the invoice and sends the request email.
//   2. Forwards a readable copy to Formspree as the archive (best effort,
//      NEXT_PUBLIC_FORMSPREE_ID or FORMSPREE_ID).
// Success when either accepted. With neither configured (a laptop, a preview
// with no keys), it answers a clear test-mode success with the payload the
// studio would have received, so the form can be tried end to end.
//
// The payload's field names follow the studio's booking contract (client_type,
// brokerage, billing, island = the county, off_island = outside the home
// counties, time_window, package, items, line_items, subtotal_cents,
// vat_cents = 0, total_cents, ...). See buildBookingPayload in pricing.ts.
import { CLIENT_TYPE_LABELS, TIME_WINDOW_LABELS, buildBookingPayload, usd, type ClientType, type TimeWindow } from "@/lib/pricing";
import { site } from "@/config/site";

export const maxDuration = 30;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STUDIO_TIMEOUT_MS = 6_000;
const FORMSPREE_TIMEOUT_MS = 5_000;
const WINDOW_MS = 60_000;
const PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > PER_WINDOW;
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin posts may omit it
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function studioConfig(): { url: string; secret: string } | null {
  const url = (process.env.STUDIO_URL || "").trim().replace(/\/+$/, "");
  const secret = (process.env.STUDIO_INTAKE_SECRET || "").trim();
  return /^https?:\/\//.test(url) && secret ? { url, secret } : null;
}

function formspreeId(): string | null {
  const id = (process.env.NEXT_PUBLIC_FORMSPREE_ID || process.env.FORMSPREE_ID || "").trim();
  return id && id !== "YOUR_FORM_ID" && /^[A-Za-z0-9]+$/.test(id) ? id : null;
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const text = (v: unknown, max = 200): string => (typeof v === "string" ? v.trim().slice(0, max) : typeof v === "number" ? String(v) : "");

async function post(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

// The Formspree copy: readable in an inbox, no nested objects.
function archiveCopy(p: Obj): Obj {
  const c = obj(p.client);
  const prop = obj(p.property);
  const lines = (Array.isArray(p.line_items) ? p.line_items : []).map(obj);
  const when = TIME_WINDOW_LABELS[p.time_window as TimeWindow] ?? text(p.time_window);
  return {
    _subject: `Booking request: ${text(prop.address)} (${text(p.desired_date)}, ${when})`,
    _replyto: text(c.email),
    submission_id: p.submission_id,
    name: c.name,
    email: c.email,
    mobile: c.phone ?? "",
    client_type: CLIENT_TYPE_LABELS[p.client_type as ClientType] ?? p.client_type,
    brokerage: p.brokerage ?? "",
    payment: "Payment due before delivery: pays online, the gallery unlocks once paid",
    address: prop.address,
    county: `${text(p.service_area)}${p.outside_area ? " (more than 25 miles from Madison or Sun Prairie, travel $0.50 a mile round trip to confirm)" : ""}`,
    date: `${text(p.desired_date)}, ${when}`,
    listing_launch: p.launch_date ?? "",
    services: lines.map((l) => `${text(l.name)}${typeof l.qty === "number" && l.unit !== "item" && l.unit !== "package" ? ` (${l.qty} ${text(l.unit)})` : ""}: ${l.priced === false ? "quoted" : `${l.from ? "from " : ""}${usd(Number(l.cents) || 0)}`}`).join("; "),
    total: `${usd(Number(p.total_cents) || 0)}${p.needs_quote ? " so far, prices to confirm" : ""}`,
    to_confirm: (Array.isArray(p.quote_reasons) ? p.quote_reasons : []).join(" "),
    access_notes: prop.access ?? "",
    notes: p.notes ?? "",
  };
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ ok: false, error: "origin" }, { status: 403 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (rateLimited(ip)) return Response.json({ ok: false, error: "Too many requests. Please wait a minute and try again." }, { status: 429 });

  let input: Obj;
  try {
    input = obj(await req.json());
  } catch {
    return Response.json({ ok: false, error: "send JSON" }, { status: 400 });
  }
  if (text(input._gotcha)) return Response.json({ ok: true, via: "honeypot" });
  const given = text(input.submission_id, 64);
  const submissionId = UUID_RE.test(given) ? given.toLowerCase() : crypto.randomUUID();
  const built = buildBookingPayload(input, submissionId);
  if (!built.ok) return Response.json({ ok: false, error: `Please check the form (${built.error}).` }, { status: 400 });
  const payload = built.payload;

  const studio = studioConfig();
  const formspree = formspreeId();
  if (!studio && !formspree) {
    return Response.json({ ok: true, test: true, via: [], submissionId, payload });
  }

  // 1. The studio (6 s, one retry on a network error or a 5xx).
  let studioOk = false;
  let studioJson: Obj = {};
  let studioError: string | null = null;
  if (studio) {
    const body = JSON.stringify(payload);
    for (let attempt = 0; attempt < 2 && !studioOk; attempt++) {
      try {
        const r = await post(`${studio.url}/api/studio/bookings`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json", "x-intake-secret": studio.secret }, body }, STUDIO_TIMEOUT_MS);
        studioJson = obj(await r.json().catch(() => ({})));
        studioOk = r.ok && studioJson.ok === true;
        studioError = studioOk ? null : `studio ${r.status}`;
        if (r.status < 500 && !studioOk) break; // a 4xx will not change on a retry
      } catch (e) {
        studioError = e instanceof Error && e.name === "AbortError" ? "studio timeout" : "studio unreachable";
      }
    }
  }

  // 2. The Formspree archive (best effort).
  let formspreeOk = false;
  if (formspree) {
    try {
      const r = await post(`https://formspree.io/f/${formspree}`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify({ ...archiveCopy(payload), in_studio: studioOk ? "yes" : `NOT IN STUDIO (${studioError ?? "not configured"})` }) }, FORMSPREE_TIMEOUT_MS);
      formspreeOk = r.ok;
    } catch {
      formspreeOk = false;
    }
  }

  if (!studioOk && !formspreeOk) {
    console.error("[booking] not accepted", { submissionId, studioError, formspree: Boolean(formspree) });
    return Response.json({ ok: false, error: `We couldn't send your request just now. Please try again in a minute, or call or text Pierre at ${site.phoneDisplay}.` }, { status: 502 });
  }
  if (!studioOk && studio) console.error("[booking] studio missed it, Formspree has it", { submissionId, studioError });
  return Response.json({
    ok: true,
    via: [...(studioOk ? ["studio"] : []), ...(formspreeOk ? ["formspree"] : [])],
    submissionId,
    bookingId: typeof studioJson.bookingId === "string" ? studioJson.bookingId : null,
    duplicate: Boolean(studioJson.duplicate),
    revision: Boolean(studioJson.revision),
    needsQuote: Boolean(studioJson.needsQuote ?? payload.needs_quote),
  });
}
