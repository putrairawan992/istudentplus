import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { hasValidSession } from "@/lib/auth";
import { listThreads } from "@/lib/threads";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, hasLocale, LOCALE_TAGS, type Locale } from "@/lib/i18n";
import Board from "./Board";
import AdminLogin from "./AdminLogin";

export async function generateMetadata({ params }: PageProps<"/[lang]/threads">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  return {
    title: d.meta.threads.title,
    description: d.meta.threads.description,
    alternates: alternatesFor(lang, "/threads"),
  };
}

// GEO/SEO: an ItemList of Question entries (with their top reply as the answer) so
// search/AI engines can index individual questions, not just the page's plain text.
function questionsJsonLd(posts: Awaited<ReturnType<typeof listThreads>>, lang: Locale) {
  const visible = posts.filter((p) => !p.hidden);
  const roots = visible.filter((p) => p.parentId === null);
  if (roots.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    inLanguage: LOCALE_TAGS[lang],
    itemListElement: roots.map((root, i) => {
      const replies = visible
        .filter((p) => p.parentId === root.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const top = replies.find((r) => r.official) ?? replies[0];
      const answerKey = top?.official ? "acceptedAnswer" : "suggestedAnswer";
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Question",
          name: root.body,
          text: root.body,
          answerCount: replies.length,
          dateCreated: root.createdAt,
          author: { "@type": "Person", name: root.author },
          ...(top && {
            [answerKey]: {
              "@type": "Answer",
              text: top.body,
              dateCreated: top.createdAt,
              author: { "@type": "Person", name: top.author },
            },
          }),
        },
      };
    }),
  };
}

export default async function ThreadsPage({ params }: PageProps<"/[lang]/threads">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);

  // An admin browsing the public board sees hidden posts and the moderation controls inline;
  // there's no separate moderation screen to keep in sync.
  const isAdmin = await hasValidSession();
  const posts = await listThreads(isAdmin);
  const questionsLd = questionsJsonLd(posts, lang);

  return (
    <>
      {questionsLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(questionsLd) }}
        />
      )}
      <Header lang={lang} />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-7 sm:py-14">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{d.threads.title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{d.threads.intro}</p>
        {isAdmin && (
          <p className="mt-4 rounded-xl bg-paper-raise px-4 py-2.5 text-[13px] font-semibold text-muted">
            {d.threads.adminNotice}
          </p>
        )}
        <div className="mt-7">
          <Board posts={posts} isAdmin={isAdmin} lang={lang} copy={d.threads} />
        </div>
        {!isAdmin && <AdminLogin lang={lang} copy={d.threads.login} />}
      </main>
      <Footer lang={lang} />
    </>
  );
}
