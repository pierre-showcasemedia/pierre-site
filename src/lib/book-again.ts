// Book again (studio template, Nov 24 2026): the client portal links to
// /book?again=<token>, with the address and the item ids of the last order.
// The token is the studio's own (signed there, good for 30 days); this site
// never reads what is inside it. The form asks /api/book-again, and this
// site's server asks the studio with the intake secret, for the client's name,
// email, phone, company and client type. Nothing personal ever rides in the
// link. Browser-safe: reads no env var.
//
// Older-style links with first, last, email, phone or company in the query
// still open the form with the address and the order, but those personal
// fields are never read, and they are wiped from the address bar.

export const PERSONAL_KEYS = ["first", "last", "email", "phone", "company"] as const;

// The studio's tokens are 48 url-safe characters; a little room either way.
const TOKEN_RE = /^[A-Za-z0-9_-]{20,200}$/;
export const isBookAgainToken = (v: unknown): v is string => typeof v === "string" && TOKEN_RE.test(v);

export type AgainQuery = {
  on: boolean; // the link came from Book again
  token: string | null;
  type: string;
  pkg: string;
  address: string;
  items: string[];
};

// What the form may take from the query. Never the personal fields.
export function againFromQuery(q: URLSearchParams): AgainQuery {
  const str = (k: string) => (q.get(k) ?? "").slice(0, 200);
  const again = str("again");
  return {
    on: Boolean(again),
    token: isBookAgainToken(again) ? again : null,
    type: str("type"),
    pkg: str("pkg"),
    address: str("address"),
    items: str("items").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 40),
  };
}

// The query to leave in the address bar: no token, no personal field.
export function scrubbedSearch(q: URLSearchParams): string {
  const out = new URLSearchParams(q);
  out.delete("again");
  for (const k of PERSONAL_KEYS) out.delete(k);
  const s = out.toString();
  return s ? `?${s}` : "";
}

export type BookAgainPrefill = { firstName: string; lastName: string; email: string; phone: string; company: string; type: string };

// The studio's answer, cut down to the six form fields (strings, trimmed, short).
export function cleanPrefill(j: unknown): BookAgainPrefill | null {
  if (!j || typeof j !== "object") return null;
  const o = j as Record<string, unknown>;
  const s = (k: string, max = 200) => (typeof o[k] === "string" ? (o[k] as string).trim().slice(0, max) : "");
  const p = { firstName: s("firstName", 80), lastName: s("lastName", 120), email: s("email", 200), phone: s("phone", 40), company: s("company", 160), type: s("type", 40) };
  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) p.email = "";
  return p.firstName || p.lastName || p.email || p.phone || p.company ? p : null;
}
