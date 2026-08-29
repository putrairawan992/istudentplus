import Image from "next/image";
import Link from "next/link";
import { articleThumbnail, categoryLabel, formatDate, readingMinutes, type Article } from "@/lib/blog";
import { fmt, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

type BlogCopy = Dictionary["blog"];

/**
 * Six tints, one per category, keyed by position in CATEGORY_SLUGS. 223 of the 277 migrated
 * posts have no picture, so the imageless card is the normal case here, not the exception —
 * it gets a coloured plate with the category on it rather than a grey box, which is the
 * difference between a page that reads as designed and one that reads as broken.
 */
const CATEGORY_TINT = [
  "bg-sky-ink text-ink",
  "bg-accent/12 text-accent-ink",
  "bg-[#E8722C]/12 text-[#8A3D0B]",
  "bg-emerald-50 text-emerald-800",
  "bg-[#FDF3C7] text-[#7A5B00]",
  "bg-violet-50 text-violet-800",
] as const;

export function categoryTint(slug: string, order: readonly string[]) {
  const i = order.indexOf(slug);
  return CATEGORY_TINT[(i < 0 ? 0 : i) % CATEGORY_TINT.length];
}

/** The picture, or the coloured category plate that stands in for it. */
export function ArticleThumb({
  article,
  labels,
  tint,
  sizes,
  priority,
}: {
  article: Article;
  labels: BlogCopy["categories"];
  tint: string;
  sizes: string;
  priority?: boolean;
}) {
  const src = articleThumbnail(article);
  if (src) {
    return (
      <Image
        src={src}
        alt={article.title}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    );
  }
  return (
    <span
      className={`flex h-full items-center justify-center px-4 text-center text-[13px] font-extrabold uppercase leading-tight tracking-wide ${tint}`}
    >
      {categoryLabel(article.category, labels)}
    </span>
  );
}

/** Category chip · read time · date — the metadata line every card and slide shares. */
export function ArticleMeta({
  article,
  lang,
  d,
  tone = "muted",
}: {
  article: Article;
  lang: Locale;
  d: BlogCopy;
  tone?: "muted" | "light";
}) {
  const date = formatDate(article.date, lang);
  const dim = tone === "light" ? "text-white/70" : "text-muted";
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
      <span
        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
          tone === "light" ? "bg-white/15 text-white" : "bg-paper-raise text-accent-ink"
        }`}
      >
        {categoryLabel(article.category, d.categories)}
      </span>
      <span className={dim}>{fmt(d.readTime, { count: readingMinutes(article) })}</span>
      {date && (
        <>
          <span className={dim}>·</span>
          <span className={dim}>{date}</span>
        </>
      )}
    </div>
  );
}

/** The grid card: picture on top, metadata, headline, two lines of excerpt. */
export default function ArticleCard({
  article,
  href,
  lang,
  d,
  categoryOrder,
  sizes = "(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw",
}: {
  article: Article;
  href: string;
  lang: Locale;
  d: BlogCopy;
  categoryOrder: readonly string[];
  sizes?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-paper-raise">
        <ArticleThumb
          article={article}
          labels={d.categories}
          tint={categoryTint(article.category, categoryOrder)}
          sizes={sizes}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4.5">
        <ArticleMeta article={article} lang={lang} d={d} />
        <h3 className="text-[16px] font-extrabold leading-snug text-ink transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">{article.excerpt}</p>
      </div>
    </Link>
  );
}
