import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { appendContent } from "../../../lib/content";
import { DEFAULT_LOCALE, hasLocale } from "../../../lib/i18n";
import { getDictionary } from "../../../lib/dictionary";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Same backend the admin's image uploads go through (app/api/upload/route.ts) — the browser
// never sees the token, this route forwards it server-side. Without this, CVs were written to
// the Next.js server's local disk, which doesn't persist on a fresh container/serverless host.
const API_URL = process.env.CONTENT_API_URL;
const API_TOKEN = process.env.CONTENT_API_TOKEN;

const SOURCES = ["consultation", "contact", "webinar", "checklist", "inquiry"] as const;

type Lead = {
  id: string;
  source: (typeof SOURCES)[number];
  submittedAt: string;
  name: string;
  email: string;
  /** Which language the visitor was reading the site in — i.e. which one to reply in. */
  lang: string;
  fields: Record<string, string>;
  cvFilename: string | null;
};

async function saveCv(file: File): Promise<string> {
  if (API_URL) {
    const upstream = new FormData();
    upstream.set("file", file, file.name);
    const res = await fetch(`${API_URL}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      body: upstream,
    });
    if (!res.ok) throw new Error(`cv upload: ${res.status}`);
    const data = (await res.json()) as { url: string };
    return `${API_URL}${data.url}`;
  }

  // Local-dev fallback: no backend running, write to local disk.
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return filename;
}

export async function POST(request: Request) {
  const form = await request.formData();

  const raw = String(form.get("source") || "");
  const source = (SOURCES as readonly string[]).includes(raw) ? (raw as Lead["source"]) : "consultation";
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  // Every form posts the locale it was rendered in, so this route's own validation messages
  // come back in the language the visitor is reading.
  const rawLang = String(form.get("lang") || "");
  const lang = hasLocale(rawLang) ? rawLang : DEFAULT_LOCALE;

  if (!name || !email) {
    const d = await getDictionary(lang);
    return NextResponse.json({ ok: false, error: d.api.nameEmailRequired }, { status: 400 });
  }

  const knownKeys = new Set(["source", "name", "email", "cv", "lang"]);
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (!knownKeys.has(key) && typeof value === "string") {
      fields[key] = value;
    }
  }

  let cvFilename: string | null = null;
  const cv = form.get("cv");
  if (cv instanceof File && cv.size > 0) {
    cvFilename = await saveCv(cv);
  }

  const lead: Lead = {
    id: crypto.randomUUID(),
    source,
    submittedAt: new Date().toISOString(),
    name,
    email,
    lang,
    fields,
    cvFilename,
  };

  await appendContent("leads", lead);

  return NextResponse.json({ ok: true });
}
