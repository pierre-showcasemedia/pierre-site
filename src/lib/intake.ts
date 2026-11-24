// Shared plumbing for the website's server routes that hand something to
// Pierre's studio (the pricing lead form, the plat map upload). The booking
// route (src/app/api/booking/route.ts) has its own copy of the same rules.
//
// Settings (names only; values live in Pierre's Vercel project):
//   STUDIO_URL            the studio's address
//   STUDIO_INTAKE_SECRET  the studio's BOOKING_INTAKE_SECRET
//   NEXT_PUBLIC_FORMSPREE_ID (or FORMSPREE_ID)  the archive copy

const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

export function rateLimited(req: Request, perMinute: number, bucket: string): boolean {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > perMinute;
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin posts may omit it
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function studioConfig(): { url: string; secret: string } | null {
  const url = (process.env.STUDIO_URL || "").trim().replace(/\/+$/, "");
  const secret = (process.env.STUDIO_INTAKE_SECRET || "").trim();
  return /^https?:\/\//.test(url) && secret ? { url, secret } : null;
}

export function formspreeId(): string | null {
  const id = (process.env.NEXT_PUBLIC_FORMSPREE_ID || process.env.FORMSPREE_ID || "").trim();
  return id && id !== "YOUR_FORM_ID" && /^[A-Za-z0-9]+$/.test(id) ? id : null;
}

export async function post(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

export type Obj = Record<string, unknown>;
export const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
export const text = (v: unknown, max = 200): string => (typeof v === "string" ? v.trim().slice(0, max) : typeof v === "number" ? String(v) : "");
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Where a visitor came from, read from the page they were on (UTM tags and
// the referring site). Plain strings, trimmed; never cookies or ids.
export const VISIT_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing"] as const;
export function visitFrom(input: Obj): Partial<Record<(typeof VISIT_KEYS)[number], string>> {
  const v = obj(input.visit);
  const out: Partial<Record<(typeof VISIT_KEYS)[number], string>> = {};
  for (const k of VISIT_KEYS) {
    const s = text(v[k], 300);
    if (s) out[k] = s;
  }
  return out;
}
