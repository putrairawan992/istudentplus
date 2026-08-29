"use server";

import { revalidatePath } from "next/cache";
import { readContent, readRawContent, writeContent, type CollectionKey } from "@/lib/content";
import { getCollectionMeta } from "@/lib/collections";
import { applyListOp, type ListOp } from "@/lib/list-ops";
import { DEFAULT_LOCALE, hasLocale, type Locale } from "@/lib/i18n";

/** An Inbox collection has no translated sibling; a bad locale falls back rather than
    writing to a key nobody reads. */
function localeFor(group: string, locale: string | undefined): Locale {
  return group !== "Inbox" && hasLocale(locale ?? "") ? (locale as Locale) : DEFAULT_LOCALE;
}

export async function saveCollectionAction(collection: string, json: string, locale?: string) {
  const meta = getCollectionMeta(collection);
  if (!meta) return { ok: false, error: "Unknown collection" };

  const lang = localeFor(meta.group, locale);

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }

  try {
    await writeContent(collection as CollectionKey, parsed, lang);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Saves one entry of a list collection.
 *
 * The whole-document `saveCollectionAction` above is still what single-object collections
 * (settings, servicesPage, …) use — they're a few KB. A list is not: `blog` is ~1.5MB, and
 * sending that up on every save exceeded the Server Action body limit, so no blog edit could
 * ever be saved. Here the browser sends only the entry it changed and the server splices it
 * into the document it reads itself.
 */
export async function saveEntryAction(collection: string, op: ListOp, locale?: string) {
  const meta = getCollectionMeta(collection);
  if (!meta) return { ok: false, error: "Unknown collection" };
  const lang = localeFor(meta.group, locale);
  const key = collection as CollectionKey;

  let current: unknown;
  try {
    // Exactly what the page loaded into the editor: a translation nobody has started yet is
    // edited as a copy of English, so that copy is what this op applies to.
    current =
      lang === DEFAULT_LOCALE
        ? await readContent<unknown>(key)
        : ((await readRawContent<unknown>(key, lang)) ?? (await readContent<unknown>(key)));
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not load the collection" };
  }
  if (!Array.isArray(current)) return { ok: false, error: "Not a list collection" };

  let next: unknown[];
  try {
    next = applyListOp(current, op);
  } catch {
    // The index no longer exists — the list moved under this editor.
    return { ok: false, error: "This entry has changed since the page was opened. Reload and try again." };
  }

  try {
    await writeContent(key, next, lang);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
