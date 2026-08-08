// The house rules for every image the CMS can upload, in one place.
//
// Each spec's numbers come from measuring what the live site actually renders, not from taste:
// `minWidth` is the widest the image is ever displayed (below it the browser upscales and the
// photo visibly softens), and `width`/`height` are the recommended upload — comfortably above
// that so it still looks sharp on high-DPI screens, rounded to numbers a person can remember.
//
// Measured on 2026-08-08 at a 1440px viewport (see also the notes in each entry):
//   countries.image  -> 663x332 on the homepage grid
//   blog.image       -> 768x512 on the article hero
//   webinars.image   -> ~710x400 on the webinar card
//   *.photo          -> 112x112 at most (instructor cards), smaller elsewhere

export type ImageSpec = {
  width: number;
  height: number;
  /** Widest this image is ever rendered. Below this it gets upscaled and looks soft. */
  minWidth: number;
  /** Where it shows up, in the client's words. */
  usedOn: string;
  note?: string;
};

// Vercel rejects request bodies over ~4.3MB before our code runs, so this is the real ceiling
// for anything uploaded through the website — not the Go backend's own 25MB limit.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4 MB";

// What the upload endpoint actually accepts. The admin reads these same lists to tell the
// client what's allowed, so the advice on screen can't drift from what the server enforces.
export const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
export const VIDEO_EXT = [".mp4", ".webm"];
export const DOC_EXT = [".pdf"];
export const ALLOWED_UPLOAD_EXT = [...IMAGE_EXT, ...VIDEO_EXT, ...DOC_EXT];

/** ".jpg", ".jpeg", ".png" -> "JPG, PNG" — extensions as a person would say them. */
export function formatList(exts: string[]): string {
  const seen = new Set<string>();
  for (const e of exts) {
    // JPG and JPEG are the same thing to the person reading this.
    seen.add(e.replace(/^\./, "").toUpperCase().replace(/^JPEG$/, "JPG"));
  }
  return [...seen].join(", ");
}

/** Fields whose name says they hold a video clip rather than a still. */
export function isVideoField(field?: string): boolean {
  return !!field && /video/i.test(field);
}

/** The `accept` attribute for a field's file picker, so a PDF can't be chosen as a poster. */
export function acceptFor(field?: string): string {
  return (isVideoField(field) ? VIDEO_EXT : IMAGE_EXT).join(",");
}

// Keyed "<collection>.<field>". The same field name means different shapes in different
// collections (a country banner is 2:1, a blog header is 3:2), so the collection is part of
// the key rather than guessing from the field name alone.
const SPECS: Record<string, ImageSpec> = {
  "countries.image": {
    width: 1200,
    height: 600,
    minWidth: 700,
    usedOn: "kartu negara di Beranda & halaman Study Abroad",
    note: "Bagian bawah kartu tertutup teks nama negara — jangan taruh objek penting di situ.",
  },
  "blog.image": {
    width: 1200,
    height: 800,
    minWidth: 800,
    usedOn: "header artikel Blog & thumbnail di daftar Blog",
    note: "Dipakai dua kali: besar di atas artikel, dan dipotong kecil di daftar.",
  },
  "webinars.image": {
    width: 1280,
    height: 720,
    minWidth: 720,
    usedOn: "kartu Webinar & banner Webinar di Beranda",
    note: "Ukuran ini sama persis dengan thumbnail YouTube, jadi poster yang sama bisa dipakai untuk keduanya.",
  },
  "team.photo": {
    width: 600,
    height: 600,
    minWidth: 128,
    usedOn: "kartu tim di halaman About Us",
    note: "Ditampilkan sebagai lingkaran — pastikan wajah ada di tengah.",
  },
  "testimonials.photo": {
    width: 600,
    height: 600,
    minWidth: 128,
    usedOn: "kartu testimoni di Beranda",
    note: "Ditampilkan sebagai lingkaran kecil — pastikan wajah ada di tengah.",
  },
  "instructors.photo": {
    width: 600,
    height: 600,
    minWidth: 128,
    usedOn: "profil pengajar di halaman Language Programs",
    note: "Ditampilkan sebagai lingkaran — pastikan wajah ada di tengah.",
  },
};

export function getImageSpec(collection: string | undefined, field: string | undefined): ImageSpec | null {
  if (!collection || !field) return null;
  return SPECS[`${collection}.${field}`] ?? null;
}

/** "1200 × 600 px (2:1)" — the headline number a person actually needs. */
export function describeSpec(spec: ImageSpec): string {
  return `${spec.width} × ${spec.height} px (${ratioLabel(spec.width, spec.height)})`;
}

function ratioLabel(w: number, h: number): string {
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Checks a picked file against its spec. Returns a blocking `error` only for things that would
 * genuinely fail or look broken, and `warnings` for things worth fixing but still usable —
 * a too-small photo is the client's call, not something to refuse outright.
 */
export function checkImage(
  spec: ImageSpec | null,
  actual: { width: number; height: number }
): { warnings: string[] } {
  if (!spec) return { warnings: [] };
  const warnings: string[] = [];

  if (actual.width < spec.minWidth) {
    warnings.push(
      `Lebarnya cuma ${actual.width}px — akan tampil melar dan pecah karena dipakai sampai ${spec.minWidth}px. Idealnya ${describeSpec(spec)}.`
    );
  }

  const want = spec.width / spec.height;
  const got = actual.width / actual.height;
  // 12% covers the usual "close enough" crops; beyond that object-cover starts cutting off
  // visibly more than the client would expect.
  if (Math.abs(got - want) / want > 0.12) {
    warnings.push(
      `Perbandingan sisinya ${ratioLabel(actual.width, actual.height)}, sedangkan slotnya ${ratioLabel(spec.width, spec.height)} — sebagian gambar akan terpotong otomatis.`
    );
  }

  return { warnings };
}
