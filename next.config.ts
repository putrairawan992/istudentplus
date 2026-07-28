import type { NextConfig } from "next";

// Media uploaded through the CMS is served by the Go backend (e.g.
// https://api.istudentplus.com/media/...). next/image needs those hosts allow-listed.
// We derive the host from CONTENT_API_URL and also include the known production host so
// prod works even if the env var isn't present at build time. Local-dev fallback uploads
// are same-origin (/uploads/...) and need no entry.
type RemotePattern = { protocol: "http" | "https"; hostname: string; port?: string; pathname: string };

const remotePatterns: RemotePattern[] = [
  { protocol: "https", hostname: "api.istudentplus.com", pathname: "/media/**" },
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

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
