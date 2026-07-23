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
  | "videoSeries";

function filePath(key: CollectionKey) {
  return path.join(CONTENT_DIR, `${key}.json`);
}

export async function readContent<T>(key: CollectionKey): Promise<T> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/content/${key}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`readContent ${key}: ${res.status}`);
    return (await res.json()) as T;
  }
  const raw = fs.readFileSync(filePath(key), "utf-8");
  return JSON.parse(raw) as T;
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
