import crypto from "crypto";
import { headers } from "next/headers";

// The threads board lives in Postgres behind the Go API (see backend/main.go). Unlike the
// CMS collections there is no local-file fallback — a board with no backend is just empty.
const API_URL = process.env.CONTENT_API_URL;
const API_TOKEN = process.env.CONTENT_API_TOKEN;

export type Post = {
  id: number;
  parentId: number | null;
  author: string;
  body: string;
  hidden: boolean;
  official: boolean;
  createdAt: string;
  ipHash?: string; // admins only
  blocked?: boolean; // admins only
};

export function threadsApi(path: string, init: RequestInit = {}) {
  if (!API_URL) throw new Error("CONTENT_API_URL is not set");
  return fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
      ...init.headers,
    },
  });
}

// Admins get hidden posts and the moderation handle; everyone else gets the visible board.
export async function listThreads(admin: boolean): Promise<Post[]> {
  if (!API_URL) return [];
  const res = admin
    ? await threadsApi("/threads")
    : await fetch(`${API_URL}/threads`, { cache: "no-store" });
  if (!res.ok) throw new Error(`listThreads: ${res.status}`);
  return (await res.json()) as Post[];
}

// The only trace we keep of an anonymous visitor: a salted hash of their IP. Enough to
// rate-limit and block a troublemaker, not enough to identify anyone.
export async function visitorHash(): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return crypto.createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}
