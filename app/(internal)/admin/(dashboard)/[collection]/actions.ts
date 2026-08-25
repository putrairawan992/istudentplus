"use server";

import { revalidatePath } from "next/cache";
import { writeContent, type CollectionKey } from "@/lib/content";
import { getCollectionMeta } from "@/lib/collections";
import { DEFAULT_LOCALE, hasLocale, type Locale } from "@/lib/i18n";

export async function saveCollectionAction(collection: string, json: string, locale?: string) {
  const meta = getCollectionMeta(collection);
  if (!meta) return { ok: false, error: "Unknown collection" };

  // An Inbox collection has no translated sibling; a bad locale falls back rather than
  // writing to a key nobody reads.
  const lang: Locale =
    meta.group !== "Inbox" && hasLocale(locale ?? "") ? (locale as Locale) : DEFAULT_LOCALE;

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
