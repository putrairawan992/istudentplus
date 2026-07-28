import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { readContent } from "../../../lib/content";
import { getWhatsAppUrl } from "../../../lib/whatsapp";
import { categoryLabel, formatDate, type Article } from "../shared";

async function getArticle(slug: string) {
  const articles = await readContent<Article[]>("blog");
  return articles.find((a) => a.slug === slug);
}

export async function generateStaticParams() {
  const articles = await readContent<Article[]>("blog");
  return articles.filter((a) => a.slug).map((a) => ({ slug: a.slug as string }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const WHATSAPP_URL = await getWhatsAppUrl();

  return (
    <>
      <Header />
      <main>
        <article className="py-12 sm:py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <Link href="/blog" className="mb-6 inline-block text-[13px] font-semibold text-muted hover:text-accent">
              ← Back to Blog
            </Link>

            <div className="mb-3 text-[13px]">
              <span className="font-semibold text-accent">{categoryLabel(article.category)}</span>
              {formatDate(article.date) && <span className="text-muted"> · {formatDate(article.date)}</span>}
            </div>

            <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[32px]">
              {article.title}
            </h1>
            <p className="mb-7 text-[13px] text-muted">iStudentPlus Team</p>

            {article.image && (
              <div className="relative mx-auto mb-8 aspect-[3/2] w-full max-w-3xl overflow-hidden rounded-xl bg-paper-raise">
                <Image src={article.image} alt={article.title} fill sizes="768px" className="object-cover" priority />
              </div>
            )}

            <div className="flex flex-col gap-4.5">
              {(article.content && article.content.length > 0 ? article.content : [article.excerpt]).map(
                (para, i) => (
                  <p key={i} className="text-[16px] leading-relaxed text-ink">
                    {para}
                  </p>
                )
              )}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-ink px-8 py-10 text-center text-white">
              <h2 className="text-xl font-extrabold">Have a question this article didn&apos;t answer?</h2>
              <a
                href={WHATSAPP_URL}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
