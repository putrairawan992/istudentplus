import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

// When CONTENT_API_URL is set the CMS is backed by the Go/Postgres API; otherwise it falls
// back to local JSON files (handy for local dev with no backend running).
const API_URL = process.env.CONTENT_API_URL;
const API_TOKEN = process.env.CONTENT_API_TOKEN;

export type CollectionKey =
  | "settings"
  | "testimonials"
  | "team"
  | "homeServices"
  | "visaServices"
  | "languagePrograms"
  | "instructors"
  | "countries"
  | "blog"
  | "leads"
  | "servicesPage"
  | "coursesPage"
  | "englishSkills"
  | "videoSeries"
  | "webinars";

function filePath(key: CollectionKey) {
  return path.join(CONTENT_DIR, `${key}.json`);
}

export async function readContent<T>(key: CollectionKey): Promise<T> {
  if (API_URL) {
    // Always send the token: most collections are public, but "leads" holds visitor PII and
    // the API now requires auth to read it. This only ever runs server-side.
    const res = await fetch(`${API_URL}/content/${key}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });
    if (!res.ok) throw new Error(`readContent ${key}: ${res.status}`);
    return (await res.json()) as T;
  }
  const raw = fs.readFileSync(filePath(key), "utf-8");
  return JSON.parse(raw) as T;
}

// Atomically prepends one item to an array collection. Prefer this over readContent +
// writeContent for anything visitors can submit concurrently (e.g. leads) — a separate
// read-modify-write round trip loses data when two submissions land at the same time. The
// local-file fallback still read-modify-writes since a single dev process has nothing to
// race against.
export async function appendContent<T>(key: CollectionKey, item: T): Promise<void> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/content/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_TOKEN}` },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(`appendContent ${key}: ${res.status}`);
    return;
  }
  const list = await readContent<T[]>(key);
  list.unshift(item);
  await writeContent(key, list);
}

export async function writeContent<T>(key: CollectionKey, data: T): Promise<void> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/content/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_TOKEN}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`writeContent ${key}: ${res.status}`);
    return;
  }
  fs.writeFileSync(filePath(key), JSON.stringify(data, null, 2) + "\n", "utf-8");
}
