import Link from "next/link";
import { articleThumbnail, type Article } from "@/lib/blog";
import { localePath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";
import { ArticleMeta, ArticleThumb, categoryTint } from "./ArticleCard";

/**
 * The news-portal header: one big rotating story on the left, a Featured column on the right.
 *
 * The carousel is CSS scroll-snap plus anchor links for the dots — no client component, no
 * hydration, and it stays swipeable on a phone and scrollable with a trackpad. A JS carousel
 * here would ship a bundle to do what `overflow-x-auto` already does.
 */
export default function BlogHero({
  slides,
  featured,
  lang,
  d,
  categoryOrder,
}: {
  slides: Article[];
  featured: Article[];
  lang: Locale;
  d: Dictionary["blog"];
  categoryOrder: readonly string[];
}) {
  if (slides.length === 0) return null;
  const p = (path: string) => localePath(lang, path);

  return (
    <section className="pt-8 pb-12">
      <div className="mx-auto grid max-w-[1400px] gap-6 px-7 lg:grid-cols-[1.9fr_1fr]">
        <div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {slides.map((article, i) => {
              // Once per slide: articleThumbnail scans the article body for embeds.
              const hasPhoto = articleThumbnail(article) !== null;
              return (
              <Link
                key={article.slug}
                id={`story-${i + 1}`}
                href={p(`/blog/${article.slug}`)}
                // scroll-mt keeps the sticky header off the slide when a dot link targets it
                className="group relative flex aspect-video w-full shrink-0 snap-center scroll-mt-24 flex-col justify-end overflow-hidden rounded-3xl bg-ink"
              >
                <div className="absolute inset-0">
                  <ArticleThumb
                    article={article}
                    labels={d.categories}
                    tint={categoryTint(article.category, categoryOrder)}
                    sizes="(min-width: 1024px) 62vw, 92vw"
                    priority={i === 0}
                  />
                </div>
                {/* Only the photo slides get the scrim. A category plate is already flat colour
                    picked for contrast, and laying a black gradient over it just muddies it. */}
                {hasPhoto ? (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                ) : null}
                <div
                  className={`relative flex flex-col gap-2 p-6 sm:p-8 ${
                    hasPhoto ? "text-white" : "text-ink"
                  }`}
                >
                  <ArticleMeta
                    article={article}
                    lang={lang}
                    d={d}
                    tone={hasPhoto ? "light" : "muted"}
                  />
                  <h2 className="max-w-2xl text-xl font-extrabold leading-tight text-balance sm:text-3xl">
                    {article.title}
                  </h2>
                  <p
                    className={`hidden max-w-xl text-[13.5px] leading-relaxed sm:line-clamp-2 ${
                      hasPhoto ? "text-white/80" : "text-ink/70"
                    }`}
                  >
                    {article.excerpt}
                  </p>
                </div>
              </Link>
              );
            })}
          </div>

          {slides.length > 1 && (
            <div className="mt-3 flex justify-center gap-2">
              {slides.map((article, i) => (
                <a
                  key={article.slug}
                  href={`#story-${i + 1}`}
                  aria-label={article.title}
                  className="h-1.5 w-6 rounded-full bg-line transition-colors hover:bg-accent"
                />
              ))}
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted">
            {d.featuredKicker}
          </h2>
          {featured.map((article) => (
            <Link
              key={article.slug}
              href={p(`/blog/${article.slug}`)}
              className="group flex gap-3.5 rounded-2xl border border-line bg-card p-3 transition-colors hover:border-accent/40"
            >
              <div className="relative h-[68px] w-[92px] shrink-0 overflow-hidden rounded-xl bg-paper-raise">
                <ArticleThumb
                  article={article}
                  labels={d.categories}
                  tint={categoryTint(article.category, categoryOrder)}
                  sizes="92px"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="line-clamp-2 text-[13.5px] font-bold leading-snug text-ink transition-colors group-hover:text-accent">
                  {article.title}
                </h3>
                <ArticleMeta article={article} lang={lang} d={d} />
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </section>
  );
}
