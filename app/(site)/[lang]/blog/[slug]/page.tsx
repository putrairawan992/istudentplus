import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { readContent } from "@/lib/content";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import {
  articleImage,
  categoryLabel,
  formatDate,
  relatedArticles,
  splitEmbeds,
  type Article,
  type Embed,
} from "@/lib/blog";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, hasLocale, localePath, LOCALE_TAGS, type Locale } from "@/lib/i18n";
import { SITE_URL as siteUrl } from "@/lib/site";
import Media from "@/app/components/Media";
import { anyMedia } from "@/lib/media";

async function getArticle(slug: string, locale: Locale) {
  const articles = await readContent<Article[]>("blog", locale);
  return articles.find((a) => a.slug === slug);
}

/* GEO/SEO: the 277 migrated posts carried no structured data across, so Google and the AI
   answer engines saw 277 pages of anonymous prose. BlogPosting is what makes a post citable
   with a date and a publisher attached. */
function articleJsonLd(article: Article, lang: Locale) {
  const url = `${siteUrl}${localePath(lang, `/blog/${article.slug}`)}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    inLanguage: LOCALE_TAGS[lang],
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    datePublished: article.date || undefined,
    image: articleImage(article) ? [new URL(articleImage(article) as string, siteUrl).toString()] : undefined,
    articleSection: article.category || undefined,
    author: { "@type": "Organization", name: "iStudentPlus", url: siteUrl },
    publisher: { "@type": "Organization", name: "iStudentPlus", url: siteUrl },
  };
}

/**
 * The embeds an article carries, in one block at the top.
 *
 * The CMS appends each inserted embed to the end of the body, which buried them under the
 * closing paragraph. They're lifted out and rendered here instead: one full-width video reads
 * as the article's header, and several sit two-up on a tablet and wider, one-up on a phone —
 * so a post with four videos is two rows rather than four full-width players to scroll past.
 *
 * The iframe is rebuilt from its `src` rather than passed through, so a hand-pasted embed
 * can't bring its own width/height (or anything else) and break out of the grid cell.
 */
function ArticleEmbeds({ embeds, title }: { embeds: Embed[]; title: string }) {
  if (embeds.length === 0) return null;
  return (
    <div
      className={`mx-auto mb-8 grid max-w-3xl gap-4 ${embeds.length > 1 ? "sm:grid-cols-2" : ""}`}
    >
      {embeds.map((embed, i) => (
        <div
          key={embed.src}
          // The ratio comes from the platform table (lib/embeds.ts) — a TikTok or a Reel in a
          // 16:9 box is a letterboxed stripe. It lives on the wrapper so the iframe stays a
          // plain 100%-of-the-box element at every width.
          className={`w-full overflow-hidden rounded-xl bg-ink ${embed.ratioClass}`}
        >
          <iframe
            src={embed.src}
            title={`${title} — embed ${i + 1}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ))}
    </div>
  );
}

export async function generateStaticParams() {
  const articles = await readContent<Article[]>("blog");
  return articles.filter((a) => a.slug).map((a) => ({ slug: a.slug as string }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const article = await getArticle(slug, lang);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: alternatesFor(lang, `/blog/${slug}`),
  };
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  const articles = await readContent<Article[]>("blog", lang);
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  const WHATSAPP_URL = await getWhatsAppUrl();
  const date = formatDate(article.date, lang);
  const related = relatedArticles(articles, article);
  const hero = articleImage(article);
  const { embeds, body } = splitEmbeds(article.html);
  const relatedHaveMedia = anyMedia(related);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article, lang)) }}
      />
      <Header lang={lang} />
      <main>
        <article className="py-12 sm:py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <Link
              href={localePath(lang, "/blog")}
              className="mb-6 inline-block text-[13px] font-semibold text-muted hover:text-accent"
            >
              {d.blog.backToBlog}
            </Link>

            <div className="mb-3 text-[13px]">
              <span className="font-semibold text-accent">
                {categoryLabel(article.category, d.blog.categories)}
              </span>
              {date && <span className="text-muted"> · {date}</span>}
            </div>

            <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[32px]">
              {article.title}
            </h1>
            <p className="mb-7 text-[13px] text-muted">{d.blog.author}</p>

            <ArticleEmbeds embeds={embeds} title={article.title} />

            {hero && (
              <div className="relative mx-auto mb-8 aspect-[3/2] w-full max-w-3xl overflow-hidden rounded-xl bg-paper-raise">
                <Image src={hero} alt={article.title} fill sizes="768px" className="object-cover" priority />
              </div>
            )}

            {article.html ? (
              /* Migrated WordPress bodies are HTML (headings, lists, tables, links). Sanitized
                 at migration time — tags and attributes are whitelisted there, not here.
                 YouTube/Instagram embeds pasted in via the admin's embed field are plain
                 <iframe>s, so they render straight out of innerHTML like everything else. */
              <div
                className="article-body mx-auto max-w-3xl"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-4.5">
                {(article.content && article.content.length > 0 ? article.content : [article.excerpt]).map(
                  (para, i) => (
                    <p key={i} className="text-[16px] leading-relaxed text-ink">
                      {para}
                    </p>
                  )
                )}
              </div>
            )}

            {/* Every post used to end in a WhatsApp button and nothing else — a reader who
                finished one had no way back into the other 276 except the browser's back button. */}
            {related.length > 0 && (
              <section className="mx-auto mt-12 max-w-3xl">
                <h2 className="mb-4 text-[13px] font-bold uppercase tracking-wide text-muted">
                  {d.blog.relatedTitle}
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={localePath(lang, `/blog/${r.slug}`)}
                      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-card p-4 transition-colors hover:border-accent"
                    >
                      {/* Three across at sm — reserved, so a post with a thumbnail doesn't push
                          its neighbours' titles out of line. */}
                      {relatedHaveMedia && (
                        <div className="-mx-4 -mt-4 mb-3">
                          <Media
                            media={r}
                            alt={r.title}
                            ratio="photo"
                            reserve
                            placeholder={categoryLabel(r.category, d.blog.categories)}
                            rounded="rounded-none"
                            zoomOnHover
                            sizes="(min-width: 640px) 33vw, 92vw"
                          />
                        </div>
                      )}
                      <span className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-accent">
                        {categoryLabel(r.category, d.blog.categories)}
                      </span>
                      <span className="line-clamp-3 text-[14.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
                        {r.title}
                      </span>
                      {formatDate(r.date, lang) && (
                        <span className="mt-auto pt-2 text-[12px] text-muted">
                          {formatDate(r.date, lang)}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-ink px-8 py-10 text-center text-white">
              <h2 className="text-xl font-extrabold">{d.blog.articleCtaTitle}</h2>
              <a
                href={WHATSAPP_URL}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30"
              >
                {d.common.chatOnWhatsApp}
              </a>
            </div>
          </div>
        </article>
      </main>
      <Footer lang={lang} />
    </>
  );
}
