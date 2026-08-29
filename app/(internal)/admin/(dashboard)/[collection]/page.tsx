import Link from "next/link";
import { notFound } from "next/navigation";
import { readContent, readRawContent, type CollectionKey } from "@/lib/content";
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
  const data =
    lang === DEFAULT_LOCALE
      ? await readContent<unknown>(key)
      : ((await readRawContent<unknown>(key, lang)) ?? (await readContent<unknown>(key)));
  const started = lang === DEFAULT_LOCALE || (await readRawContent<unknown>(key, lang)) !== null;

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
                className={`rounded-full px-3 py-1 ${
                  l === lang ? "bg-ink text-white" : "text-muted hover:text-ink"
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
