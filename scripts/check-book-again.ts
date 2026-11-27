// Book again without personal details in the link (studio template, Nov 24
// 2026; src/lib/book-again.ts, src/lib/book-again-server.ts,
// src/app/api/book-again/route.ts and the form's Book again effect).
//   npx tsx scripts/check-book-again.ts
// 1. What the form takes from the query: the token, type, package, address
//    and items, never first, last, email, phone or company.
// 2. The address bar loses the token and those fields, keeps the rest.
// 3. The studio's answer is cut down to the six form fields.
// 4. The server call, against a stand-in studio: the intake secret header,
//    the token passed through, nothing on a bad token or a studio error.
// 5. Static: the form reads no personal field from the query, and the server
//    half goes through the test-run guard.
export {};
import { readFileSync } from "node:fs";
import { againFromQuery, cleanPrefill, isBookAgainToken, PERSONAL_KEYS, scrubbedSearch } from "../src/lib/book-again";

let passes = 0;
let failures = 0;
const ok = (cond: unknown, label: string) => {
  if (cond) passes++;
  else {
    failures++;
    console.error(`FAIL ${label}`);
  }
};
const read = (p: string) => readFileSync(p, "utf8");
const TOKEN = "m7Qn0cXbS1y8Zt3KfV2pA9wLrE4uJ6hGdT5oN1iB8sC0xY_-";

async function main() {
  // 1. the query
  const fresh = againFromQuery(new URLSearchParams(`again=${TOKEN}&address=12+Example+Elm+St%2C+Madison&items=photos,drone_addon`));
  ok(fresh.on && fresh.token === TOKEN, "a new link: the token");
  ok(fresh.address === "12 Example Elm St, Madison" && fresh.items.join(",") === "photos,drone_addon", "a new link: address and items");
  const old = againFromQuery(new URLSearchParams("again=1&first=Taylor&last=Brooks&email=agent%40example.com&phone=5550100100&company=Brooks&type=agent&address=12+Example+Elm+St&items=photos"));
  ok(old.on && old.token === null, "an old-style link is still Book again, with no token");
  ok(!JSON.stringify(old).includes("Taylor") && !JSON.stringify(old).includes("agent@example.com") && !JSON.stringify(old).includes("5550100100") && !JSON.stringify(old).includes("Brooks"), "no personal field is taken");
  ok(Object.keys(old).sort().join(",") === "address,items,on,pkg,token,type", "the query read has no personal keys at all");
  ok(!againFromQuery(new URLSearchParams("address=12+Elm")).on, "no again: not Book again");
  ok(againFromQuery(new URLSearchParams("again=<script>")).token === null, "a malformed token is dropped");
  ok(isBookAgainToken(TOKEN) && !isBookAgainToken("1") && !isBookAgainToken("a b") && !isBookAgainToken("x".repeat(201)) && !isBookAgainToken(null), "token shape");
  ok(againFromQuery(new URLSearchParams(`items=${"a,".repeat(100)}&again=1`)).items.length === 40, "at most 40 items");

  // 2. the address bar
  const s = scrubbedSearch(new URLSearchParams("again=1&first=Taylor&last=Brooks&email=a%40b.co&phone=1&company=X&type=agent&address=12+Elm&items=photos&utm_source=fb"));
  ok(s === "?type=agent&address=12+Elm&items=photos&utm_source=fb", `the address bar keeps the rest (${s})`);
  ok(scrubbedSearch(new URLSearchParams(`again=${TOKEN}`)) === "", "a bare token link leaves no query");
  ok([...PERSONAL_KEYS].sort().join(",") === "company,email,first,last,phone", "the personal keys");

  // 3. the studio's answer
  const p = cleanPrefill({ ok: true, firstName: " Taylor ", lastName: "Brooks", email: "agent@example.com", phone: "(555) 010-0100", company: "Brooks Realty", type: "agent", price: 100, address: "x" });
  ok(p && p.firstName === "Taylor" && p.email === "agent@example.com" && p.type === "agent", "the six fields come through, trimmed");
  ok(p && Object.keys(p).sort().join(",") === "company,email,firstName,lastName,phone,type", "nothing else comes through");
  ok(cleanPrefill({ ok: true, email: "not an email", firstName: "A" })?.email === "", "a bad email is dropped");
  ok(cleanPrefill(null) === null && cleanPrefill("x") === null && cleanPrefill({ ok: true }) === null, "an empty answer is nothing");
  ok(cleanPrefill({ firstName: 12, email: ["a@b.co"] }) === null, "only strings");
  ok((cleanPrefill({ firstName: "a".repeat(500) })?.firstName.length ?? 0) === 80, "fields are kept short");

  // 4. the server call against a stand-in studio
  process.env.STUDIO_URL = "https://studio.example.test/";
  process.env.STUDIO_INTAKE_SECRET = "check-only-value";
  const calls: { url: string; secret: string | null }[] = [];
  let reply: { status: number; body: unknown } = { status: 200, body: { ok: true, firstName: "Taylor", lastName: "Brooks", email: "agent@example.com", phone: "5550100100", company: "Brooks Realty", type: "agent" } };
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), secret: new Headers(init?.headers).get("x-intake-secret") });
    return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  const { prefillFromStudio } = await import("../src/lib/book-again-server");
  const j = await prefillFromStudio(TOKEN);
  ok(j && j.email === "agent@example.com" && j.firstName === "Taylor", "the prefill comes back from the studio");
  ok(calls.length === 1 && calls[0].url === `https://studio.example.test/api/studio/book-again?token=${TOKEN}` && calls[0].secret === "check-only-value", "the studio is asked with the intake secret and the token");
  calls.length = 0;
  ok((await prefillFromStudio("bad token")) === null && calls.length === 0, "a bad token never reaches the studio");
  ok((await prefillFromStudio(null)) === null && calls.length === 0, "no token never reaches the studio");
  reply = { status: 404, body: { ok: false, error: "not found" } };
  ok((await prefillFromStudio(TOKEN)) === null, "an expired or unknown token: nothing");
  reply = { status: 500, body: "oops" };
  ok((await prefillFromStudio(TOKEN)) === null, "a studio error: nothing");
  reply = { status: 200, body: { ok: true } };
  ok((await prefillFromStudio(TOKEN)) === null, "an empty answer: nothing");
  delete process.env.STUDIO_INTAKE_SECRET;
  calls.length = 0;
  ok((await prefillFromStudio(TOKEN)) === null && calls.length === 0, "no intake secret: the studio is not asked");
  process.env.STUDIO_INTAKE_SECRET = "check-only-value";
  process.env.STUDIO_URL = "not a url";
  ok((await prefillFromStudio(TOKEN)) === null && calls.length === 0, "no studio address: the studio is not asked");
  process.env.STUDIO_URL = "https://studio.example.test/";
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  ok((await prefillFromStudio(TOKEN)) === null, "a network error: nothing");

  // 5. static
  const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
  const form = code(read("src/components/BookingForm.tsx"));
  ok(!/get\(["'](first|last|email|phone|company)["']\)/.test(form) && !/str\(["'](first|last|email|phone|company)["']\)/.test(form), "the form reads no personal field from the query");
  ok(/againFromQuery\(q\)/.test(form) && /\/api\/book-again\?token=/.test(form), "the form reads the query through againFromQuery and asks /api/book-again");
  ok(/replaceState\([^)]*scrubbedSearch\(q\)/.test(form), "the form wipes the token and the personal fields from the address bar");
  ok(/prev\.name \|\| /.test(form) && /prev\.email \|\| p\.email/.test(form), "the prefill fills only what the client has not typed");
  const route = code(read("src/app/api/book-again/route.ts"));
  const lib = code(read("src/lib/book-again-server.ts"));
  ok(!/process\.env/.test(code(read("src/lib/book-again.ts"))), "the browser half reads no env var");
  ok(/prefillFromStudio\(/.test(route) && /no-store/.test(route) && /await connection\(\)/.test(route), "the route runs per request and is never cached");
  ok(/studioConfig\(\)/.test(lib) && /"x-intake-secret": studio\.secret/.test(lib) && !/process\.env/.test(lib), "the server call goes through the guarded studio settings");
  ok(!/NEXT_PUBLIC_[A-Z_]*SECRET/.test(route + lib), "the secret is never a public env var");

  console.log(failures ? `${failures} FAILED, ${passes} passed` : `All ${passes} checks passed`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
