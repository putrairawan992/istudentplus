import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { readContent, writeContent } from "../../../lib/content";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

type Lead = {
  id: string;
  source: "consultation" | "contact";
  submittedAt: string;
  name: string;
  email: string;
  fields: Record<string, string>;
  cvFilename: string | null;
};

async function saveCv(file: File): Promise<string> {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return filename;
}

export async function POST(request: Request) {
  const form = await request.formData();

  const source = form.get("source") === "contact" ? "contact" : "consultation";
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();

  if (!name || !email) {
    return NextResponse.json({ ok: false, error: "Name and email are required." }, { status: 400 });
  }

  const knownKeys = new Set(["source", "name", "email", "cv"]);
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
    fields,
    cvFilename,
  };

  const leads = await readContent<Lead[]>("leads");
  leads.unshift(lead);
  await writeContent("leads", leads);

  return NextResponse.json({ ok: true });
}
