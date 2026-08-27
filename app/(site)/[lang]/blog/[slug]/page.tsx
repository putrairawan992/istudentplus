import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { readContent } from "@/lib/content";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { categoryLabel, formatDate, type Article } from "@/lib/blog";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, hasLocale, localePath, type Locale } from "@/lib/i18n";
import ArticleEmbeds from "@/app/components/ArticleEmbeds";

async function getArticle(slug: string, locale: Locale) {
  const articles = await readContent<Article[]>("blog", locale);
  return articles.find((a) => a.slug === slug);
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
  const article = await getArticle(slug, lang);
  if (!article) notFound();
  const WHATSAPP_URL = await getWhatsAppUrl();
  const date = formatDate(article.date, lang);

  return (
    <>
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

            {article.image && (
              <div className="relative mx-auto mb-8 aspect-[3/2] w-full max-w-3xl overflow-hidden rounded-xl bg-paper-raise">
                <Image src={article.image} alt={article.title} fill sizes="768px" className="object-cover" priority />
              </div>
            )}

            {article.html ? (
              /* Migrated WordPress bodies are HTML (headings, lists, tables, links). Sanitized
                 at migration time — tags and attributes are whitelisted there, not here. */
              <>
                <div
                  className="article-body mx-auto max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: article.html }}
                />
                {/* Pasted YouTube iframes render on their own; an Instagram embed needs its
                    script run for it, which innerHTML won't do. */}
                <ArticleEmbeds html={article.html} />
              </>
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
