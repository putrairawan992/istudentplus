import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Marked from "@/app/components/Marked";
import { readContent } from "@/lib/content";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getVisibleCountries } from "@/lib/countries";
import {
  CATEGORY_SLUGS,
  PAGE_SIZE,
  categoryLabel,
  categoryRows,
  featuredArticles,
  matchesQuery,
  type Article,
} from "@/lib/blog";
import ArticleCard from "@/app/components/ArticleCard";
import BlogHero from "@/app/components/BlogHero";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, fmt, hasLocale, localePath } from "@/lib/i18n";
import Media from "@/app/components/Media";
import { type Media as MediaValue } from "@/lib/media";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  return {
    title: d.meta.blog.title,
    description: d.meta.blog.description,
    alternates: alternatesFor(lang, "/blog"),
  };
}

type Video = MediaValue & { series: string; title: string };

export default async function BlogPage({ params, searchParams }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  const p = (path: string) => localePath(lang, path);

  const { category, page, q } = await searchParams;
  const activeCategory = typeof category === "string" ? category : undefined;
  const pageParam = typeof page === "string" ? page : undefined;
  const query = typeof q === "string" ? q.trim() : "";

  const WHATSAPP_URL = await getWhatsAppUrl();
  const ARTICLES = await readContent<Article[]>("blog", lang);
  const VIDEO_SERIES = await readContent<Video[]>("videoSeries", lang);
  const filtered = ARTICLES.filter(
    (a) => (!activeCategory || a.category === activeCategory) && matchesQuery(a, query)
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(pageParam) || 1), pageCount);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const pageHref = (n: number) =>
    p(
      `/blog?${new URLSearchParams({
        ...(activeCategory ? { category: activeCategory } : {}),
        ...(query ? { q: query } : {}),
        ...(n > 1 ? { page: String(n) } : {}),
      })}`
    );
  const POPULAR_DESTINATIONS = await getVisibleCountries(lang);
  const CATEGORIES = CATEGORY_SLUGS.map((slug) => ({
    slug,
    label: categoryLabel(slug, d.blog.categories),
  }));

  // The hero and the Featured column are the blog's front-of-book, not a view of the result
  // list: they stay put on every tab, page and search so switching a filter changes the
  // articles below and nothing else. Which posts they hold is editorial — see featuredArticles
  // and the Featured checkbox in the CMS — so they don't follow the filter either.
  const HERO_SLIDES = 3;
  const FEATURED_ASIDE = 3;
  const headline = featuredArticles(ARTICLES, HERO_SLIDES + FEATURED_ASIDE);
  const heroSlides = headline.slice(0, HERO_SLIDES);
  const featuredAside = headline.slice(HERO_SLIDES);

  // The per-category rows are the exception: they're a way to browse everything, which is only
  // an offer worth making to someone who hasn't already narrowed down.
  const isUnfiltered = !activeCategory && !query && current === 1;
  const ROWS = isUnfiltered
    ? categoryRows(ARTICLES, 3, new Set(headline.map((a) => a.slug as string)))
    : [];

  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-[1400px] px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              {d.blog.kicker}
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              <Marked text={d.blog.title} />
            </h1>
          </div>
        </section>

        <BlogHero
          slides={heroSlides}
          featured={featuredAside}
          lang={lang}
          d={d.blog}
          categoryOrder={CATEGORY_SLUGS}
        />

        <section className="pb-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
              <div>
                {isUnfiltered && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                      {d.blog.latestTitle}
                    </h2>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
                      {d.blog.latestSubtitle}
                    </p>
                  </div>
                )}
                {/* A plain GET form: the results are rendered on the server, so search works
                    with JavaScript off and every result set has a shareable URL. The category
                    rides along in a hidden field so searching inside a category stays inside it. */}
                <form action={p("/blog")} method="get" className="mb-5 flex gap-2">
                  {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
                  <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder={d.blog.searchPlaceholder}
                    aria-label={d.blog.searchSubmit}
                    className="min-w-0 flex-1 rounded-full border border-line bg-card px-4.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-muted focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-semibold text-white"
                  >
                    {d.blog.searchSubmit}
                  </button>
                </form>

                {query && (
                  <div className="mb-5 flex flex-wrap items-center gap-3 text-[13.5px]">
                    <span className="font-semibold text-ink">
                      {fmt(d.blog.resultsFor, { count: filtered.length, query })}
                    </span>
                    <Link
                      href={p(activeCategory ? `/blog?category=${activeCategory}` : "/blog")}
                      className="font-semibold text-accent hover:underline"
                    >
                      {d.blog.clearSearch}
                    </Link>
                  </div>
                )}

                <div className="mb-7 flex flex-wrap gap-2">
                  <Link
                    href={p("/blog")}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${
                      !activeCategory ? "bg-ink text-white" : "border border-line text-muted hover:bg-paper-raise"
                    }`}
                  >
                    {d.blog.all}
                  </Link>
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={p(`/blog?category=${c.slug}`)}
                      className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${
                        activeCategory === c.slug
                          ? "bg-ink text-white"
                          : "border border-line text-muted hover:bg-paper-raise"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>

                {paged.length > 0 ? (
                  <div className="grid gap-4.5 sm:grid-cols-2 xl:grid-cols-3">
                    {paged.map((article) => (
                      <ArticleCard
                        key={article.slug ?? article.title}
                        article={article}
                        href={article.slug ? p(`/blog/${article.slug}`) : "#"}
                        lang={lang}
                        d={d.blog}
                        categoryOrder={CATEGORY_SLUGS}
                        sizes="(min-width: 1280px) 22vw, (min-width: 640px) 42vw, 92vw"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-line p-6.5 text-sm text-muted">
                    {query ? fmt(d.blog.noResults, { query }) : d.blog.empty}
                  </p>
                )}

                {pageCount > 1 && (
                  <nav className="mt-8 flex items-center justify-between gap-3 text-[13.5px] font-semibold">
                    {current > 1 ? (
                      <Link href={pageHref(current - 1)} className="rounded-full border border-line px-4 py-2 text-ink hover:bg-paper-raise">
                        {d.blog.newer}
                      </Link>
                    ) : (
                      <span />
                    )}
                    <span className="text-muted">
                      {fmt(d.blog.pagination, {
                        current,
                        total: pageCount,
                        count: filtered.length,
                      })}
                    </span>
                    {current < pageCount ? (
                      <Link href={pageHref(current + 1)} className="rounded-full border border-line px-4 py-2 text-ink hover:bg-paper-raise">
                        {d.blog.older}
                      </Link>
                    ) : (
                      <span />
                    )}
                  </nav>
                )}
              </div>

              <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-2xl border border-line bg-card p-5">
                  <h3 className="mb-3.5 text-[13px] font-bold uppercase tracking-wide text-muted">
                    {d.blog.browseByTopic}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {CATEGORIES.map((c) => {
                      const count = ARTICLES.filter((a) => a.category === c.slug).length;
                      return (
                        <Link
                          key={c.slug}
                          href={p(`/blog?category=${c.slug}`)}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[13.5px] font-semibold transition-colors ${
                            activeCategory === c.slug ? "bg-paper-raise text-accent" : "text-ink hover:bg-paper-raise"
                          }`}
                        >
                          {c.label}
                          <span className="text-[12px] font-medium text-muted">{count}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-card p-5">
                  <h3 className="mb-3.5 text-[13px] font-bold uppercase tracking-wide text-muted">
                    {d.blog.popularDestinations}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {POPULAR_DESTINATIONS.map((dest) => (
                      <Link
                        key={dest.slug}
                        href={p(`/study-abroad/${dest.slug}`)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:bg-paper-raise"
                      >
                        {dest.name}
                        <span className="text-muted">→</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-ink p-5 text-white">
                  <h3 className="mb-1.5 text-[15px] font-extrabold">{d.blog.counselingTitle}</h3>
                  <p className="mb-4 text-[13px] leading-relaxed text-white/75">{d.blog.counselingBody}</p>
                  <a
                    href={WHATSAPP_URL}
                    className="block rounded-full bg-accent px-4 py-2.5 text-center text-[13.5px] font-semibold text-white"
                  >
                    {d.common.chatOnWhatsApp}
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* One row per category, the way the reference site stacks its report and radar
            strips. Only categories with a full row appear, so a thin category never renders
            as a lonely card, and the hero's picks are excluded so the same story isn't the
            first thing twice. */}
        {ROWS.map((row) => (
          <section key={row.slug} className="border-t border-line py-12">
            <div className="mx-auto max-w-[1400px] px-7">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  {categoryLabel(row.slug, d.blog.categories)}
                </h2>
                <Link
                  href={p(`/blog?category=${row.slug}`)}
                  className="text-[13.5px] font-semibold text-accent hover:underline"
                >
                  {d.blog.seeAll}
                </Link>
              </div>
              <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
                {row.articles.map((article) => (
                  <ArticleCard
                    key={article.slug}
                    article={article}
                    href={p(`/blog/${article.slug}`)}
                    lang={lang}
                    d={d.blog}
                    categoryOrder={CATEGORY_SLUGS}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                  />
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="mb-8 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                {d.blog.videosKicker}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">{d.blog.videosTitle}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {VIDEO_SERIES.map((video) => (
                <div key={video.title} className="overflow-hidden rounded-xl border border-line bg-card">
                  {/* Was YouTube-or-nothing. A card can now carry an uploaded still instead,
                      which is what makes a video card publishable before the video exists. */}
                  <Media
                    media={video}
                    alt={video.title}
                    ratio="wide"
                    reserve
                    placeholder={video.series}
                    rounded="rounded-none"
                    sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 92vw"
                  />
                  <div className="p-4">
                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-accent">
                      {video.series}
                    </div>
                    <div className="text-sm font-semibold">{video.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">{d.blog.ctaTitle}</h2>
              <a href={WHATSAPP_URL} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30">
                {d.common.chatOnWhatsApp}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
