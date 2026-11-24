import type { NextConfig } from "next";
import { testRunProblems } from "./src/lib/test-run";

// A local test run (npm run test:server) refuses to build or serve while any
// real Formspree id, non-local studio or Maps key is in the environment.
const problems = testRunProblems(process.env);
if (problems.length) {
  throw new Error(`Test run refused: ${problems.join("; ")}. Remove these settings (check .env.local) and use npm run test:server.`);
}

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Nov 23 2026: "Work" is now "Portfolio". Old links keep working.
  async redirects() {
    return [
      { source: "/work", destination: "/portfolio", permanent: true },
      { source: "/work/:slug", destination: "/portfolio/:slug", permanent: true },
    ];
  },
  // YouTube film thumbnails on the Video page (videoThumb in src/lib/projects.ts).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
