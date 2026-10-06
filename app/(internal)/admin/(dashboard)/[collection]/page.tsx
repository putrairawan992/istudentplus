import Link from "next/link";
import { notFound } from "next/navigation";
import { readRawContent, type CollectionKey } from "@/lib/content";
import { getCollectionMeta } from "@/lib/collections";
import type { JsonValue } from "@/lib/json-tree";
import { DEFAULT_LOCALE, hasLocale, LOCALES, type Locale } from "@/lib/i18n";
import CollectionEditor from "../../components/CollectionEditor";
import { saveCollectionAction, saveEntryAction } from "./actions";

const LOCALE_NAMES: Record<Locale, string> = { en: "English", id: "Bahasa Indonesia" };

/**
 * One editor, one document per language. `?lang=id` edits the Indonesian copy of the same
 * collection; the form is identical because the document's shape is identical — that's the
 * whole point of storing translations as sibling documents rather than as `{en, id}` on every
 * field.
 *
 * A translation nobody has started yet opens prefilled with the English text, so the editor
 * has something to overwrite instead of a blank form they'd have to rebuild from scratch. Any
 * field left as-is (or cleared) falls back to English at render time, so a half-finished
 * translation never shows a blank on the site.
 */
export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { collection } = await params;
  const { lang: rawLang } = await searchParams;
  const meta = getCollectionMeta(collection);
  if (!meta) notFound();

  // Leads are visitor submissions, not website copy — nothing to translate.
  const translatable = meta.group !== "Inbox";
  const lang: Locale = translatable && hasLocale(rawLang ?? "") ? (rawLang as Locale) : DEFAULT_LOCALE;

  const key = collection as CollectionKey;
  // A brand-new collection reaches the API only when its first save happens (the backend's seed
  // catches up on its next deploy), so a missing document must not take the editor down: it
  // opens empty, the ALWAYS_FIELDS defaults fill the form, and saving creates the document.
  // Only a genuinely absent document is tolerated — an unreachable API still throws.
  const en = await readRawContent<unknown>(key, DEFAULT_LOCALE);
  const translated = lang === DEFAULT_LOCALE ? null : await readRawContent<unknown>(key, lang);
  const data = (lang === DEFAULT_LOCALE ? en : (translated ?? en)) ?? (meta.kind === "list" ? [] : {});
  const started = lang === DEFAULT_LOCALE || translated !== null;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">{meta.label}</h1>
      <p className="mb-4 text-sm text-muted">{meta.description} — used on {meta.usedOn}.</p>

      {translatable && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-line p-1 text-[13px] font-semibold">
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={l === DEFAULT_LOCALE ? `/admin/${collection}` : `/admin/${collection}?lang=${l}`}
                className={`rounded-full px-3 py-1 ${l === lang ? "bg-ink text-white" : "text-muted hover:text-ink"
                  }`}
              >
                {LOCALE_NAMES[l]}
              </Link>
            ))}
          </div>
          {lang !== DEFAULT_LOCALE && (
            <p className="text-[13px] text-muted">
              {started
                ? "Editing the Indonesian version. Anything left blank falls back to English."
                : "No Indonesian version yet — this is a copy of the English text to translate over. Saving creates it."}
            </p>
          )}
        </div>
      )}

      {collection === "webinars" && (
        <div className="mb-6 rounded-2xl border border-accent/25 bg-accent/5 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                <span>🎥</span> Header Halaman Webinar
              </div>
              <h3 className="mt-1 text-sm font-extrabold text-ink sm:text-base">
                Ingin mengubah Judul, Badge, atau Subjudul Utama Webinar?
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                Teks banner utama di halaman /webinars (seperti <em>&quot;Ask your questions to people who already went&quot;</em>) dapat dikelola langsung di menu <strong>Site Settings</strong> pada tab <strong>Webinar Hero</strong>.
              </p>
            </div>
            <Link
              href={lang === DEFAULT_LOCALE ? "/admin/settings" : `/admin/settings?lang=${lang}`}
              className="inline-flex items-center justify-center shrink-0 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm shadow-accent/20 transition-all hover:bg-accent/90"
            >
              Edit Header Webinar →
            </Link>
          </div>
        </div>
      )}

      {collection === "servicesPage" && (
        <div className="mb-6 rounded-2xl border border-line bg-paper-raise/70 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
            <span>🛂</span> Tips Pengelolaan Halaman Layanan (/services)
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            • Tab <strong>Visa Pitfalls &amp; Checklist</strong>: untuk mengubah judul penolakan visa (<em>&quot;Avoid the most common visa rejection reasons&quot;</em>), 4 poin alasan penolakan visa, dan teks ajakan formulir checklist dokumen.<br />
            • Tab <strong>Admission Steps</strong>: untuk tahapan pendaftaran kuliah.<br />
            • Tab <strong>Faqs</strong>: untuk pertanyaan umum seputar visa dan studi.
          </p>
        </div>
      )}

      {collection === "adsPage" && (
        <div className="mb-6 rounded-2xl border border-line bg-paper-raise/70 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
            <span>🎨</span> Gaya Halaman Iklan (/consultation)
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Logo, warna, dan font untuk halaman iklan <strong>/consultation</strong> — perubahan
            langsung tampil setelah disimpan, tanpa deploy ulang. Warna brand ISP: navy{" "}
            <strong>#14304C</strong> dan pink <strong>#EC4899</strong>. Kosongkan logo untuk
            kembali ke tulisan iStudentPlus.
          </p>
        </div>
      )}

      {/* The editor is keyed by language so switching swaps the form's state instead of
          carrying the previous language's unsaved edits across. */}
      <CollectionEditor
        key={lang}
        collection={collection}
        locale={lang}
        initialData={data as JsonValue}
        saveAction={saveCollectionAction}
        entryAction={saveEntryAction}
      />
    </div>
  );
}
