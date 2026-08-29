import type { Locale } from "./i18n";
import { isEmbedPageUrl } from "./media.ts";
import { platformOfEmbedUrl, RATIO_CLASS } from "./embeds.ts";

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
  /** Tick this in the CMS to put a post in the hero carousel and the Featured column. When
      nothing is ticked the blog falls back to the newest posts, so the header is never empty
      and nobody has to maintain a flag to keep the page working. */
  featured?: boolean;
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

/** Newest first. Undated posts sort last rather than jumping to the top on an empty string. */
export function byNewest(a: Article, b: Article) {
  return (b.date ?? "").localeCompare(a.date ?? "");
}

/**
 * Reading time in whole minutes, from the stored body. 200 wpm is the usual desk figure and
 * this is a "5 min read" chip, not a promise — the point is telling a long explainer apart
 * from a two-paragraph notice at a glance. Never returns 0: "0 min read" reads as broken.
 */
export function readingMinutes(article: Article): number {
  const text = article.html
    ? article.html.replace(/<[^>]+>/g, " ")
    : (article.content ?? [article.excerpt ?? ""]).join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * What the hero and the Featured column show, newest first: posts ticked `featured` in the
 * CMS, then — because most migrated posts have no picture and a hero slide without one is a
 * grey rectangle — whatever else has a real uploaded picture, and only then the plain newest.
 *
 * Ranks on `articleImage`, not `articleThumbnail`: a video's poster frame is fine on a small
 * card, but it is whatever the video happens to open on, and the hero is the largest thing on
 * the page. One live post proves the point — its embedded video's poster is an album cover,
 * which is not what should sit under a headline about visa refusals.
 */
export function featuredArticles(all: Article[], limit: number): Article[] {
  const live = all.filter((a) => a.slug);
  const picked = live.filter((a) => a.featured).sort(byNewest);
  const illustrated = live.filter((a) => !a.featured && articleImage(a)).sort(byNewest);
  const rest = live.filter((a) => !a.featured && !articleImage(a)).sort(byNewest);
  return [...picked, ...illustrated, ...rest].slice(0, limit);
}

/**
 * One row per category for the sections down the page, skipping categories too thin to fill a
 * row. `exclude` keeps the posts already shown in the hero from being repeated immediately
 * underneath.
 */
export function categoryRows(
  all: Article[],
  perRow: number,
  exclude: ReadonlySet<string> = new Set()
): { slug: string; articles: Article[] }[] {
  return CATEGORY_SLUGS.map((slug) => ({
    slug,
    articles: all
      .filter((a) => a.slug && a.category === slug && !exclude.has(a.slug))
      .sort(byNewest)
      .slice(0, perRow),
  })).filter((row) => row.articles.length >= perRow);
}

/** Case-insensitive substring match over what a reader can actually see on a card. The blog
    is 277 posts behind a 12-per-page list; category filters alone leave 81 posts in
    "Destinations" and no way to find one of them. Substring, not tokenised — a search index
    for 277 rows filtered on the server is a dependency with nothing to buy. */
export function matchesQuery(article: Article, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = `${article.title} ${article.excerpt ?? ""} ${article.category ?? ""}`;
  return haystack.toLowerCase().includes(q);
}

/** Up to `limit` other posts to read next: same category first, newest first, the rest of the
    blog filling in behind. Recent News has 19 posts and one of them is the article you're on,
    so category-only would sometimes render a single lonely card under "Keep reading". */
export function relatedArticles(all: Article[], current: Article, limit = 3): Article[] {
  const byDate = (a: Article, b: Article) => (b.date ?? "").localeCompare(a.date ?? "");
  const others = all.filter((a) => a.slug && a.slug !== current.slug);
  const same = others.filter((a) => a.category === current.category).sort(byDate);
  if (same.length >= limit) return same.slice(0, limit);
  const rest = others.filter((a) => a.category !== current.category).sort(byDate);
  return [...same, ...rest].slice(0, limit);
}

/**
 * The article's picture, or null when the Image slot holds something that isn't one.
 *
 * The CMS's Image field used to accept any pasted URL, and at least one live post has a
 * YouTube watch link in it — which rendered as a broken image on the article header and in
 * the list. The field is upload-only now, but the values already saved outlive that change,
 * so every render path asks here rather than reading `article.image` directly.
 */
export function articleImage(article: Article): string | null {
  return article.image && !isEmbedPageUrl(article.image) ? article.image : null;
}

/** One `<iframe>` lifted out of an article body, reduced to what's needed to render it. */
export type Embed = {
  src: string;
  /** Which platform, for the label and the poster frame. Null for anything unrecognised. */
  platform: string | null;
  /** Tailwind aspect class — a TikTok in a 16:9 box is a letterboxed stripe. */
  ratioClass: string;
  /** Only YouTube publishes a poster at a predictable URL. */
  thumbnail?: string;
};

// The bodies are stored HTML and the embeds in them are written by the CMS's own insert button
// (`embedIframeFor`), so the shape is `<iframe ...></iframe>` on one line — a regex is enough
// and this runs on the server where there is no DOM to parse with.
// ponytail: regex over known-shape markup. If the client ever pastes hand-written embed code
// with a nested tag inside the iframe, parse with a real HTML parser instead.
const IFRAME_TAG = /<iframe\b[^>]*>[\s\S]*?<\/iframe>|<iframe\b[^>]*\/>/gi;
const SRC_ATTR = /\bsrc\s*=\s*["']([^"']+)["']/i;
const EMBEDDED_ID = /\/embed\/(?:v2\/)?([a-zA-Z0-9_-]{6,})|[?&]id=(\d{6,})/i;

function classify(src: string): Embed {
  const platform = platformOfEmbedUrl(src);
  if (!platform) return { src, platform: null, ratioClass: RATIO_CLASS.video };
  const id = src.match(EMBEDDED_ID)?.slice(1).find(Boolean);
  return {
    src,
    platform: platform.id,
    ratioClass: RATIO_CLASS[platform.ratio],
    thumbnail: id && platform.thumbnail ? platform.thumbnail(id) : undefined,
  };
}

/**
 * Pulls every embed out of an article body and hands back the two halves.
 *
 * The CMS appends each inserted embed to the end of the HTML, so a post's videos ended up
 * below the closing paragraph where nobody scrolls. Collecting them here lets the page put
 * them in one block at the top and lay several out as a grid — and it fixes the posts that
 * already have an embed stuck at the bottom, without re-editing any of them.
 */
export function splitEmbeds(html: string | undefined): { embeds: Embed[]; body: string } {
  if (!html) return { embeds: [], body: "" };
  const embeds: Embed[] = [];
  const body = html.replace(IFRAME_TAG, (tag) => {
    const src = tag.match(SRC_ATTR)?.[1];
    if (!src) return ""; // an iframe with no src renders nothing either way
    embeds.push(classify(src));
    return "";
  });
  return { embeds, body };
}

/**
 * What the blog list should show in the thumbnail box: the article's own picture, or failing
 * that the poster frame of its first YouTube embed. A post whose only visual is a video used
 * to fall back to the bare category name; now it looks like what it is.
 *
 * Instagram has no public poster URL, so those still fall through to the category placeholder.
 */
export function articleThumbnail(article: Article): string | null {
  const own = articleImage(article);
  if (own) return own;
  // i.ytimg.com is already an allowed host in next.config.ts; no other platform publishes a
  // poster at a guessable URL, which is what the CMS guidance tells the client.
  return splitEmbeds(article.html).embeds.find((e) => e.thumbnail)?.thumbnail ?? null;
}
