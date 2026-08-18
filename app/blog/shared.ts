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

export const CATEGORIES = [
  { slug: "recent-news", label: "Recent News" },
  { slug: "immigration", label: "Immigration" },
  { slug: "destinations", label: "Destinations" },
  { slug: "english-ielts", label: "English & IELTS" },
  { slug: "student-life", label: "Student Life" },
  { slug: "study-tips", label: "Study Tips" },
];

/** Articles per page on /blog. The migration brought 310 posts across — the list was
    written for 3 and rendered all of them. */
export const PAGE_SIZE = 12;

export function categoryLabel(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
