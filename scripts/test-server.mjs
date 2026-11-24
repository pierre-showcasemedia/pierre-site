// A local test server that can't reach Pierre's real accounts (Nov 24 2026).
//
//   npm run test:server                 build, then serve on http://localhost:3124
//   npm run test:server -- --port 4000
//   npm run test:server -- --no-build   serve the last test build
//   npm run test:server -- --studio http://localhost:3171   a local studio only
//
// It starts Next with NEXT_PUBLIC_SITE_TEST_RUN=1 and test mode on, and
// without any Formspree id, studio address, intake secret or Maps key, so
// bookings, the contact form and pricing leads go nowhere real. Next would
// still read those from an env file, so it refuses to start while .env,
// .env.local, .env.production or .env.production.local sets one of them; and
// next.config.ts refuses on its own as a second line (src/lib/test-run.ts).
// Use this for every local test of the site.
import { spawnSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const port = flag("--port") || "3124";
const studio = flag("--studio") || "";
const build = !args.includes("--no-build");

const REAL = ["NEXT_PUBLIC_FORMSPREE_ID", "FORMSPREE_ID", "STUDIO_URL", "STUDIO_INTAKE_SECRET", "NEXT_PUBLIC_GOOGLE_MAPS_KEY"];
const local = (u) => {
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(u).hostname);
  } catch {
    return false;
  }
};
if (studio && !local(studio)) {
  console.error(`Refused: --studio must be a localhost address, not ${studio}.`);
  process.exit(2);
}

const found = [];
for (const f of [".env", ".env.local", ".env.production", ".env.production.local"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (m && REAL.includes(m[1]) && m[2].replace(/^["']|["']$/g, "").trim()) found.push(`${m[1]} in ${f}`);
  }
}
if (found.length) {
  console.error(`Refused: real settings would reach the test server (${found.join(", ")}). Move them out of the env file, or test on a Vercel preview instead.`);
  process.exit(2);
}

const env = { ...process.env };
for (const k of REAL) delete env[k];
Object.assign(env, { NEXT_PUBLIC_SITE_TEST_RUN: "1", NEXT_PUBLIC_BOOKING_TEST_MODE: "true", NEXT_PUBLIC_SITE_URL: `http://localhost:${port}` });
if (studio) Object.assign(env, { STUDIO_URL: studio, STUDIO_INTAKE_SECRET: "local-test-only" });

if (build) {
  const b = spawnSync("npx", ["next", "build"], { stdio: "inherit", env });
  if (b.status !== 0) process.exit(b.status ?? 1);
}
console.log(`Test server on http://localhost:${port} (test run: nothing reaches Formspree, the studio or Google${studio ? `; studio ${studio}` : ""}).`);
const s = spawn("npx", ["next", "start", "-p", port], { stdio: "inherit", env });
s.on("exit", (code) => process.exit(code ?? 0));
