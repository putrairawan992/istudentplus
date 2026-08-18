import type { MetadataRoute } from "next";
import { readContent } from "../lib/content";
import { SITE_URL } from "../lib/site";
import { getCountries } from "./study-abroad/data";
import type { Article } from "./blog/shared";

// Built from the live content, not a hardcoded list: the 277 migrated posts (§38) and the
// destination pages both come from the CMS, so anything the client publishes later shows up
// here without a code change. `readContent` fetches with `no-store`, which makes this route
// dynamic — the point is that a new post is crawlable the moment it's published.
//
// Deliberately omitted: `priority` and `changeFrequency` (Google ignores both), and
// `lastModified` on the static pages — inventing a timestamp per build is a worse signal than
// no timestamp at all. Posts have a real date, so they get one.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, countries] = await Promise.all([
    readContent<Article[]>("blog"),
    getCountries(),
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

  return [
    ...staticPaths.map((p) => ({ url: `${SITE_URL}${p}` })),
    ...countries.map((c) => ({ url: `${SITE_URL}/study-abroad/${c.slug}` })),
    ...articles
      .filter((a) => a.slug)
      .map((a) => ({
        url: `${SITE_URL}/blog/${a.slug}`,
        lastModified: a.date ? new Date(a.date) : undefined,
      })),
  ];
}
