import type { Locale } from "./i18n";

export type Article = {
  title: string;
  excerpt: string;
  category: string;
  image?: string;
  date?: string;
  slug?: string;
  content?: string[];
  /** Article body as HTML — how every post migrated from the old WordPress site is stored.
      Kept as HTML on purpose: headings, lists and links are what the SEO value sits in, and
      flattening them into paragraphs would throw that away. `content` is the older
      hand-written shape and still renders. */
  html?: string;
  /** Original URL on the old site, for tracing a migrated post back to its source. */
  source?: string;
};

/** Category order as shown in the filter strip. The display labels are translated, so they
    live in the dictionaries (`blog.categories`) keyed by these slugs — the slug is what the
    URL and the stored articles use, and it never changes per language. */
export const CATEGORY_SLUGS = [
  "recent-news",
  "immigration",
  "destinations",
  "english-ielts",
  "student-life",
  "study-tips",
] as const;

/** Articles per page on /blog. The migration brought 310 posts across — the list was
    written for 3 and rendered all of them. */
export const PAGE_SIZE = 12;

export function categoryLabel(slug: string, labels: Record<string, string>) {
  return labels[slug] ?? slug;
}

const DATE_LOCALE: Record<Locale, string> = { en: "en-GB", id: "id-ID" };

export function formatDate(iso: string | undefined, locale: Locale) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(DATE_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
