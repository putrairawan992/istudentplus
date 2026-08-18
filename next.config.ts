import type { NextConfig } from "next";

// Media uploaded through the CMS is served by the Go backend (e.g.
// https://api.istudentplus.com/media/...). next/image needs those hosts allow-listed.
// We derive the host from CONTENT_API_URL and also include the known production host so
// prod works even if the env var isn't present at build time. Local-dev fallback uploads
// are same-origin (/uploads/...) and need no entry.
type RemotePattern = { protocol: "http" | "https"; hostname: string; port?: string; pathname: string };

const remotePatterns: RemotePattern[] = [
  { protocol: "https", hostname: "api.istudentplus.com", pathname: "/media/**" },
  // YouTube poster frames, used as the webinar banner's fallback when no poster was uploaded.
  { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
];

if (process.env.CONTENT_API_URL) {
  try {
    const u = new URL(process.env.CONTENT_API_URL);
    if (!remotePatterns.some((p) => p.hostname === u.hostname)) {
      remotePatterns.push({
        protocol: u.protocol === "http:" ? "http" : "https",
        hostname: u.hostname,
        port: u.port || undefined,
        pathname: "/media/**",
      });
    }
  } catch {
    // ignore a malformed CONTENT_API_URL — the default entry still covers production
  }
}

// The old WordPress site served every post at the site root (/some-post-slug/) and its
// archives at /category/<slug>/. Once istudentplus.com points at this app, every one of those
// URLs 404s — and they are what Google has indexed — so each migrated post gets a permanent
// redirect to its new /blog/<slug> home. Generated from the migrated collection rather than a
// /:slug wildcard, which would swallow /about, /services and every other real route.
import fs from "fs";
import path from "path";

// Old category slug -> the bucket it was merged into (see docs/HISTORY.md §38).
const OLD_CATEGORY_BUCKETS: Record<string, string> = {
  visa: "immigration",
  "visa-immigration": "immigration",
  ielts: "english-ielts",
  "english-study": "english-ielts",
  "study-in-australia": "destinations",
  destinations: "destinations",
  "popular-countries": "destinations",
  "study-abroad": "destinations",
  "course-providers": "destinations",
  "study-tips": "study-tips",
  "student-life": "student-life",
  tours: "student-life",
  indonesia: "student-life",
};

function migratedPostRedirects() {
  try {
    const file = path.join(process.cwd(), "content", "blog.json");
    const posts = JSON.parse(fs.readFileSync(file, "utf-8")) as { slug?: string }[];
    return posts
      .filter((p) => p.slug)
      .map((p) => ({ source: `/${p.slug}`, destination: `/blog/${p.slug}`, permanent: true }));
  } catch {
    // No local copy (content comes from the API): skip rather than fail the build.
    return [];
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
  async redirects() {
    return [
      ...migratedPostRedirects(),
      ...Object.entries(OLD_CATEGORY_BUCKETS).map(([oldSlug, bucket]) => ({
        source: `/category/${oldSlug}`,
        destination: `/blog?category=${bucket}`,
        permanent: true,
      })),
      // Demo-theme categories and anything else under /category/ lands on the blog index.
      { source: "/category/:slug", destination: "/blog", permanent: true },
    ];
  },
};

export default nextConfig;
