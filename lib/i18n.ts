// Locale primitives — safe to import from client components (no dictionary payload here,
// that lives in ./dictionary which is server-only).
//
// URL scheme: English keeps the bare paths it was already indexed under (/about), Indonesian
// gets a prefix (/id/about). proxy.ts rewrites the bare paths onto the `en` segment, so
// `app/(site)/[lang]/` serves both without a single existing URL changing.

export const LOCALES = ["en", "id"] as const;
export type Locale = (typeof LOCALES)[number];

/** The unprefixed locale. Changing this alone would break every indexed URL — don't. */
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = { en: "EN", id: "ID" };
/** `lang`/`hreflang` attribute values — "id" alone is ambiguous enough that some crawlers
    want the region. */
export const LOCALE_TAGS: Record<Locale, string> = { en: "en", id: "id-ID" };

/** `fmt("Study in {name}", { name: "Japan" })`. Word order differs between the two locales
    often enough that stitching sentences from fragments in JSX doesn't survive translation. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key) =>
    key in vars ? String(vars[key]) : whole
  );
}

/**
 * Where a collection's copy is stored for one language: `settings` holds the English document,
 * `settings.id` the Indonesian one. Same shape either way, which is what lets the CMS's generic
 * editor render both without knowing anything about languages.
 */
export function localeKey(collection: string, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? collection : `${collection}.${locale}`;
}

/** The inverse of `localeKey`: `"settings.id"` -> `"settings"`, `"settings"` -> `"settings"`.
    Mirrors the Go backend's own `baseCollection` — what a size spec or an allow-list check is
    keyed on, since a translated document is still the same collection. */
export function baseCollectionKey(key: string): string {
  const dot = key.indexOf(".");
  return dot === -1 ? key : key.slice(0, dot);
}

export function hasLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** `("id", "/about") -> "/id/about"`, `("en", "/about") -> "/about"`. Every internal link
    goes through this, otherwise one click drops an Indonesian visitor back into English. */
export function localePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  if (locale === DEFAULT_LOCALE) return clean || "/";
  return `/${locale}${clean}`;
}

/**
 * `alternates` for a page's metadata: a self-referencing canonical plus the hreflang pair, so
 * Google treats /about and /id/about as one page in two languages instead of two competing
 * pages. `path` is the locale-less route ("/about", "/blog/some-slug").
 */
export function alternatesFor(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: {
      en: localePath("en", path),
      "id-ID": localePath("id", path),
      "x-default": localePath(DEFAULT_LOCALE, path),
    },
  };
}

/** The current path as it would look in another locale, for the language switcher. */
export function switchLocalePath(target: Locale, pathname: string): string {
  const stripped = LOCALES.reduce(
    (p, l) => (p === `/${l}` ? "/" : p.startsWith(`/${l}/`) ? p.slice(l.length + 1) : p),
    pathname
  );
  return localePath(target, stripped);
}
