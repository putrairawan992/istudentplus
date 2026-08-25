import "server-only";
import type { Locale } from "./i18n";

// Loaded per request on the server only, so the translation files never reach the browser
// bundle — see node_modules/next/dist/docs/01-app/02-guides/internationalization.md.
const dictionaries = {
  en: () => import("../dictionaries/en.json").then((m) => m.default),
  id: () => import("../dictionaries/id.json").then((m) => m.default),
};

/** Shape of en.json — the source of truth for what a dictionary must contain. */
export type Dictionary = Awaited<ReturnType<typeof dictionaries.en>>;

// TS widens JSON string values to `string`, so this compares key structure and nothing else:
// a key added to en.json and forgotten in id.json is a build error, not a blank spot on the
// Indonesian site. (An untranslated *value* is a human problem — see docs, not the compiler.)
type IdDictionary = Awaited<ReturnType<typeof dictionaries.id>>;
const _idMatchesEn: IdDictionary extends Dictionary ? true : never = true;
void _idMatchesEn;

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]() as Promise<Dictionary>;
}
