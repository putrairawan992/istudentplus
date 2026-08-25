import type { MetadataRoute } from "next";
import { readContent } from "../lib/content";
import { SITE_URL } from "../lib/site";
import { getVisibleCountries } from "@/lib/countries";
import type { Article } from "@/lib/blog";
import { LOCALES, localePath } from "@/lib/i18n";

// Built from the live content, not a hardcoded list: the 277 migrated posts (§38) and the
// destination pages both come from the CMS, so anything the client publishes later shows up
// here without a code change. `readContent` fetches with `no-store`, which makes this route
// dynamic — the point is that a new post is crawlable the moment it's published.
//
// Every path is listed once per language, with the pair declared through `alternates` — the
// same relationship the pages' own hreflang tags state, which is what stops /about and
// /id/about competing as duplicates.
//
// Deliberately omitted: `priority` and `changeFrequency` (Google ignores both), and
// `lastModified` on the static pages — inventing a timestamp per build is a worse signal than
// no timestamp at all. Posts have a real date, so they get one.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, countries] = await Promise.all([
    readContent<Article[]>("blog"),
    getVisibleCountries(),
  ]);

  const staticPaths = [
    "/",
    "/about",
    "/services",
    "/study-abroad",
    "/courses",
    "/language-programs",
    "/blog",
    "/webinars",
    "/threads",
    "/contact",
  ];

  const paths: { path: string; lastModified?: Date }[] = [
    ...staticPaths.map((path) => ({ path })),
    ...countries.map((c) => ({ path: `/study-abroad/${c.slug}` })),
    ...articles
      .filter((a) => a.slug)
      .map((a) => ({
        path: `/blog/${a.slug}`,
        lastModified: a.date ? new Date(a.date) : undefined,
      })),
  ];

  const languagesFor = (path: string) =>
    Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${localePath(l, path)}`]));

  return paths.flatMap(({ path, lastModified }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified,
      alternates: { languages: languagesFor(path) },
    }))
  );
}
