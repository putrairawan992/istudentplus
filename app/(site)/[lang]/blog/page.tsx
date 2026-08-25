import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Marked from "@/app/components/Marked";
import YouTubeEmbed from "@/app/components/YouTubeEmbed";
import { readContent } from "@/lib/content";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getVisibleCountries } from "@/lib/countries";
import { CATEGORY_SLUGS, PAGE_SIZE, categoryLabel, formatDate, type Article } from "@/lib/blog";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, fmt, hasLocale, localePath } from "@/lib/i18n";

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

type Video = { series: string; title: string; youtubeId?: string | null; videoFile?: string | null };

export default async function BlogPage({ params, searchParams }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  const p = (path: string) => localePath(lang, path);

  const { category, page } = await searchParams;
  const activeCategory = typeof category === "string" ? category : undefined;
  const pageParam = typeof page === "string" ? page : undefined;

  const WHATSAPP_URL = await getWhatsAppUrl();
  const ARTICLES = await readContent<Article[]>("blog", lang);
  const VIDEO_SERIES = await readContent<Video[]>("videoSeries", lang);
  const filtered = activeCategory
    ? ARTICLES.filter((a) => a.category === activeCategory)
    : ARTICLES;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(pageParam) || 1), pageCount);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const pageHref = (n: number) =>
    p(
      `/blog?${new URLSearchParams({
        ...(activeCategory ? { category: activeCategory } : {}),
        ...(n > 1 ? { page: String(n) } : {}),
      })}`
    );
  const POPULAR_DESTINATIONS = await getVisibleCountries(lang);
  const CATEGORIES = CATEGORY_SLUGS.map((slug) => ({
    slug,
    label: categoryLabel(slug, d.blog.categories),
  }));

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

        <section className="pb-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
              <div>
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
                  <div className="flex flex-col">
                    {paged.map((article) => {
                      const date = formatDate(article.date, lang);
                      return (
                        <a
                          key={article.slug ?? article.title}
                          href={article.slug ? p(`/blog/${article.slug}`) : "#"}
                          className="group flex gap-5 border-b border-line py-6 first:pt-0 last:border-b-0"
                        >
                          {article.image && (
                            <div className="relative h-[110px] w-[150px] shrink-0 overflow-hidden rounded bg-paper-raise sm:h-[130px] sm:w-[176px]">
                              <Image src={article.image} alt={article.title} fill sizes="176px" className="object-cover" />
                            </div>
                          )}
                          <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <div className="mb-1.5 text-[13px]">
                              <span className="font-semibold text-accent">
                                {categoryLabel(article.category, d.blog.categories)}
                              </span>
                              {date && <span className="text-muted"> · {date}</span>}
                            </div>
                            <h2 className="mb-1.5 text-lg font-bold leading-snug text-ink transition-colors group-hover:text-accent sm:text-xl">
                              {article.title}
                            </h2>
                            <p className="line-clamp-2 text-[13.5px] leading-relaxed text-muted">{article.excerpt}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-line p-6.5 text-sm text-muted">
                    {d.blog.empty}
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
                <div key={video.youtubeId} className="overflow-hidden rounded-xl border border-line bg-card">
                  <YouTubeEmbed id={video.youtubeId} videoFile={video.videoFile} title={video.title} />
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
