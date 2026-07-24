import type { Metadata } from "next";
import Link from "next/link";
import Header, { WHATSAPP_URL } from "../components/Header";
import Footer from "../components/Footer";
import YouTubeEmbed from "../components/YouTubeEmbed";
import { readContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Visa updates, study tips, and student stories from the iStudentPlus team.",
};

type Article = { title: string; excerpt: string; category: string };
type Video = { series: string; title: string; youtubeId: string };

const CATEGORIES = [
  { slug: "recent-news", label: "Recent News" },
  { slug: "immigration", label: "Immigration" },
  { slug: "student-life", label: "Student Life" },
  { slug: "study-tips", label: "Study Tips" },
];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const ARTICLES = await readContent<Article[]>("blog");
  const VIDEO_SERIES = await readContent<Video[]>("videoSeries");
  const filtered = category ? ARTICLES.filter((a) => a.category === category) : ARTICLES;

  return (
    <>
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Blog
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Visa updates and stories from <span className="text-accent">the road</span>.
            </h1>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-4xl px-7">
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

            {filtered.length > 0 ? (
              <div className="flex flex-col gap-4.5">
                {filtered.map((article) => (
                  <a
                    key={article.title}
                    href="#"
                    className="block rounded-2xl border border-line bg-card p-6.5 transition-colors hover:border-accent/40"
                  >
                    <h2 className="mb-2 text-lg font-extrabold">{article.title}</h2>
                    <p className="text-[14.5px] leading-relaxed text-muted">{article.excerpt}</p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-line p-6.5 text-sm text-muted">
                No articles in this category yet — check back soon.
              </p>
            )}
          </div>
        </section>

        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-4xl px-7">
            <div className="mb-8 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                Watch
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Abroad Stories &amp; Scholarships</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {VIDEO_SERIES.map((video) => (
                <div key={video.youtubeId} className="overflow-hidden rounded-xl border border-line bg-card">
                  <YouTubeEmbed id={video.youtubeId} title={video.title} />
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
          <div className="mx-auto max-w-5xl px-7">
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
