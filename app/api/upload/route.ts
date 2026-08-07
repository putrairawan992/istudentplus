import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { hasValidSession } from "../../../lib/auth";

// Media uploads go through the Go backend when configured, so files live with the rest of the
// CMS data (and persist on a real host). The browser never sees the API token: it posts here,
// this admin-only route forwards to the backend with the bearer token. When CONTENT_API_URL is
// unset (local dev with no backend) it falls back to writing into public/uploads.
const API_URL = process.env.CONTENT_API_URL;
const API_TOKEN = process.env.CONTENT_API_TOKEN;

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".mp4", ".webm", ".pdf"]);

// Vercel rejects any request body over ~4.3 MB at the platform level (measured against this
// deployment: 4.25 MB passes, 4.3 MB comes back 413 "FUNCTION_PAYLOAD_TOO_LARGE") — before this
// route even runs, as plain text rather than JSON. The Go backend itself accepts up to 25 MB
// (see maxUploadBytes in backend/main.go), but nothing bigger than this ever survives the trip
// through Vercel to reach it, so this is the real ceiling for uploads made through the website.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "File too large (max 4 MB)." }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED.has(ext)) {
    return NextResponse.json({ ok: false, error: "Unsupported file type." }, { status: 415 });
  }

  // Backend-backed path: forward the file to the Go API's POST /media.
  if (API_URL) {
    const upstream = new FormData();
    upstream.set("file", file, file.name);
    const res = await fetch(`${API_URL}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      body: upstream,
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `Upload failed (${res.status}).` }, { status: 502 });
    }
    const data = (await res.json()) as { url: string };
    // Return an absolute URL so it drops straight into an <img src> / stored field.
    return NextResponse.json({ ok: true, url: `${API_URL}${data.url}` });
  }

  // Local-dev fallback: save into public/uploads and return a site-relative path.
  const dir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filename = `${Date.now()}-${safe}`;
  fs.writeFileSync(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ ok: true, url: `/uploads/${filename}` });
}
