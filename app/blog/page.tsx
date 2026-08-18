import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import YouTubeEmbed from "../components/YouTubeEmbed";
import { readContent } from "../../lib/content";
import { getWhatsAppUrl } from "../../lib/whatsapp";
import { getCountries } from "../study-abroad/data";
import { CATEGORIES, PAGE_SIZE, categoryLabel, formatDate, type Article } from "./shared";

export const metadata: Metadata = {
  title: "Blog",
  description: "Visa updates, study tips, and student stories from the iStudentPlus team.",
};

type Video = { series: string; title: string; youtubeId?: string | null; videoFile?: string | null };

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page } = await searchParams;
  const WHATSAPP_URL = await getWhatsAppUrl();
  const ARTICLES = await readContent<Article[]>("blog");
  const VIDEO_SERIES = await readContent<Video[]>("videoSeries");
  const filtered = category ? ARTICLES.filter((a) => a.category === category) : ARTICLES;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(page) || 1), pageCount);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const pageHref = (n: number) =>
    `/blog?${new URLSearchParams({ ...(category ? { category } : {}), ...(n > 1 ? { page: String(n) } : {}) })}`;
  const POPULAR_DESTINATIONS = (await getCountries()).filter((c) =>
    ["australia", "japan", "uk", "canada"].includes(c.slug)
  );

  return (
    <>
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-[1400px] px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Blog
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Visa updates and stories from <span className="text-accent">the road</span>.
            </h1>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
              <div>
                <div className="mb-7 flex flex-wrap gap-2">
                  <Link
                    href="/blog"
                    className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${
                      !category ? "bg-ink text-white" : "border border-line text-muted hover:bg-paper-raise"
                    }`}
                  >
                    All
                  </Link>
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/blog?category=${c.slug}`}
                      className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${
                        category === c.slug ? "bg-ink text-white" : "border border-line text-muted hover:bg-paper-raise"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>

                {paged.length > 0 ? (
                  <div className="flex flex-col">
                    {paged.map((article) => (
                      <a
                        key={article.title}
                        href={article.slug ? `/blog/${article.slug}` : "#"}
                        className="group flex gap-5 border-b border-line py-6 first:pt-0 last:border-b-0"
                      >
                        {article.image && (
                          <div className="relative h-[110px] w-[150px] shrink-0 overflow-hidden rounded bg-paper-raise sm:h-[130px] sm:w-[176px]">
                            <Image src={article.image} alt={article.title} fill sizes="176px" className="object-cover" />
                          </div>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                          <div className="mb-1.5 text-[13px]">
                            <span className="font-semibold text-accent">{categoryLabel(article.category)}</span>
                            {formatDate(article.date) && (
                              <span className="text-muted"> · {formatDate(article.date)}</span>
                            )}
                          </div>
                          <h2 className="mb-1.5 text-lg font-bold leading-snug text-ink transition-colors group-hover:text-accent sm:text-xl">
                            {article.title}
                          </h2>
                          <p className="line-clamp-2 text-[13.5px] leading-relaxed text-muted">{article.excerpt}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-line p-6.5 text-sm text-muted">
                    No articles in this category yet — check back soon.
                  </p>
                )}

                {pageCount > 1 && (
                  <nav className="mt-8 flex items-center justify-between gap-3 text-[13.5px] font-semibold">
                    {current > 1 ? (
                      <Link href={pageHref(current - 1)} className="rounded-full border border-line px-4 py-2 text-ink hover:bg-paper-raise">
                        ← Newer
                      </Link>
                    ) : (
                      <span />
                    )}
                    <span className="text-muted">
                      Page {current} of {pageCount} · {filtered.length} articles
                    </span>
                    {current < pageCount ? (
                      <Link href={pageHref(current + 1)} className="rounded-full border border-line px-4 py-2 text-ink hover:bg-paper-raise">
                        Older →
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
                    Browse by Topic
                  </h3>
                  <div className="flex flex-col gap-1">
                    {CATEGORIES.map((c) => {
                      const count = ARTICLES.filter((a) => a.category === c.slug).length;
                      return (
                        <Link
                          key={c.slug}
                          href={`/blog?category=${c.slug}`}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[13.5px] font-semibold transition-colors ${
                            category === c.slug ? "bg-paper-raise text-accent" : "text-ink hover:bg-paper-raise"
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
                    Popular Destinations
                  </h3>
                  <div className="flex flex-col gap-1">
                    {POPULAR_DESTINATIONS.map((dest) => (
                      <Link
                        key={dest.slug}
                        href={`/study-abroad/${dest.slug}`}
                        className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:bg-paper-raise"
                      >
                        {dest.name}
                        <span className="text-muted">→</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-ink p-5 text-white">
                  <h3 className="mb-1.5 text-[15px] font-extrabold">Free 1:1 counseling</h3>
                  <p className="mb-4 text-[13px] leading-relaxed text-white/75">
                    No obligation, no fees to talk. Get a personalized recommendation.
                  </p>
                  <a
                    href={WHATSAPP_URL}
                    className="block rounded-full bg-accent px-4 py-2.5 text-center text-[13.5px] font-semibold text-white"
                  >
                    Chat on WhatsApp
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
                Watch
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Abroad Stories &amp; Scholarships</h2>
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
              <h2 className="max-w-md text-3xl font-extrabold">
                Have a question a blog post didn&apos;t answer?
              </h2>
              <a href={WHATSAPP_URL} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
