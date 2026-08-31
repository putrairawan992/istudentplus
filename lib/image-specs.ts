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

  // --- the `image` slot opened up on every remaining collection -------------------------
  // Every one of these renders through <Media> at a declared aspect ratio, so the spec is the
  // ratio the card holds plus enough pixels for a 2x screen at the widest the card ever gets.
  // Grouped by that ratio rather than by page, because that is what decides whether a photo
  // survives the crop.
  "homeServices.image": {
    width: 1200,
    height: 800,
    minWidth: 600,
    usedOn: "kartu layanan di Beranda",
    note: "Muncul di atas judul kartu. Kartu-kartu ini sebaris — isi gambarnya untuk semua kartu, atau tidak sama sekali, supaya tingginya seragam.",
  },
  "visaServices.image": {
    width: 1200,
    height: 800,
    minWidth: 600,
    usedOn: "kartu layanan visa di halaman Services",
  },
  "languagePrograms.image": {
    width: 1600,
    height: 900,
    minWidth: 800,
    usedOn: "bagian program di halaman Language Programs",
    note: "Ditampilkan lebar di samping keterangan program, jadi pakai foto suasana kelas, bukan potret.",
  },
  "englishSkills.image": {
    width: 1200,
    height: 800,
    minWidth: 500,
    usedOn: "kartu 4 keterampilan di halaman Language Programs",
  },
  "coursesPage.image": {
    width: 1600,
    height: 900,
    minWidth: 900,
    usedOn: "bagian atas halaman Courses & Universities",
  },
  "servicesPage.image": {
    width: 1600,
    height: 900,
    minWidth: 900,
    usedOn: "bagian atas halaman Services",
  },
  "contactPage.image": {
    width: 1200,
    height: 675,
    minWidth: 640,
    usedOn: "bawah form konsultasi di halaman Contact",
    note: "Kolom ini lebih sempit dari halaman lain (berbagi baris dengan form) — foto konselor atau kantor lebih cocok daripada foto lebar berisi banyak teks.",
  },
  "settings.image": {
    width: 1600,
    height: 900,
    minWidth: 900,
    usedOn: "bagian cerita di halaman About Us",
    note: "Kolom About Story Image. Kosongkan bila belum ada foto — bagiannya tetap rapi tanpa gambar.",
  },
  "videoSeries.image": {
    width: 1280,
    height: 720,
    minWidth: 720,
    usedOn: "kartu video di halaman Blog",
    note: "Hanya dipakai bila kartunya tidak memakai YouTube — video YouTube membawa thumbnail-nya sendiri.",
  },
};

/**
 * The house standard for the video half of the trio, shown next to every YouTube / Video File
 * slot in the CMS. Not a size check — a 4MB upload cap already decides what can go through the
 * website — but the advice that stops someone uploading a 40-minute recording and waiting.
 */
export const VIDEO_GUIDANCE = {
  ratio: "16:9",
  preferred: "YouTube",
  maxUploadLabel: MAX_UPLOAD_LABEL,
  note:
    "Video panjang sebaiknya diunggah ke YouTube lalu tempel alamatnya di kolom YouTube — tidak ada batas ukuran, dan halaman tetap ringan karena pemutarnya baru dimuat saat diklik. Kolom Video File hanya untuk klip pendek (di bawah " +
    MAX_UPLOAD_LABEL +
    ", biasanya beberapa detik) dalam format MP4 atau WEBM, 16:9.",
};

export function getImageSpec(collection: string | undefined, field: string | undefined): ImageSpec | null {
  if (!collection || !field) return null;
  return SPECS[`${collection}.${field}`] ?? null;
}

/** "1200 × 600 px (2:1)" — the headline number a person actually needs. */
export function describeSpec(spec: ImageSpec): string {
  return `${spec.width} × ${spec.height} px (${ratioLabel(spec.width, spec.height)})`;
}

/**
 * "16:9" for shapes that reduce cleanly, "≈2,1:1" for the ones that don't. A raw reduction
 * is useless to read — a 385×181 photo is not meaningfully "385:181" to anyone.
 */
function ratioLabel(w: number, h: number): string {
  const g = gcd(w, h);
  const a = w / g;
  const b = h / g;
  if (a <= 20 && b <= 20) return `${a}:${b}`;
  return `≈${(w / h).toFixed(1).replace(".", ",")}:1`;
}
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Checks a picked file against its spec before it is uploaded. Anything that would ship a
 * visibly broken image — too small to fill its slot, or a shape that forces a heavy crop —
 * is rejected outright rather than saved with a warning, so bad images can't reach the site
 * by someone clicking past a notice.
 *
 * Slots with no spec accept anything: there is no measured standard to judge them against,
 * and inventing one would reject valid files.
 */
export function checkImage(
  spec: ImageSpec | null,
  actual: { width: number; height: number }
): { ok: boolean; reasons: string[] } {
  if (!spec) return { ok: true, reasons: [] };
  const reasons: string[] = [];

  if (actual.width < spec.minWidth) {
    reasons.push(
      `lebarnya cuma ${actual.width}px, sedangkan slot ini menampilkannya sampai ${spec.minWidth}px — gambar akan melar dan pecah`
    );
  }

  const want = spec.width / spec.height;
  const got = actual.width / actual.height;
  // 12% covers the usual "close enough" crops; beyond that object-cover cuts off visibly
  // more of the picture than the person uploading it would expect.
  if (Math.abs(got - want) / want > 0.12) {
    reasons.push(
      `bentuknya ${ratioLabel(actual.width, actual.height)}, sedangkan slot ini ${ratioLabel(spec.width, spec.height)} — sebagian gambar akan terpotong`
    );
  }

  return { ok: reasons.length === 0, reasons };
}

/** One sentence a person can act on, for the rejection toast. */
export function rejectionMessage(
  spec: ImageSpec,
  actual: { width: number; height: number },
  reasons: string[]
): string {
  return `Gambar ${actual.width} × ${actual.height} px ditolak: ${reasons.join(", dan ")}. Siapkan ukuran ${describeSpec(spec)} lalu unggah lagi.`;
}
