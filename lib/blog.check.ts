// Checks for blog search and "keep reading". No test framework in this project, so:
//   node --experimental-strip-types lib/blog.check.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  categoryRows,
  featuredArticles,
  matchesQuery,
  readingMinutes,
  relatedArticles,
  type Article,
} from "./blog.ts";

const a = (over: Partial<Article> = {}): Article => ({
  title: "Student visa rules for Australia",
  excerpt: "What changed in the subclass 500 this year.",
  category: "immigration",
  slug: "au-visa",
  date: "2026-01-01",
  ...over,
});

// --- matchesQuery -----------------------------------------------------------
// An empty box is not a filter — it must not empty the page.
assert.equal(matchesQuery(a(), ""), true);
assert.equal(matchesQuery(a(), "   "), true);

assert.equal(matchesQuery(a(), "australia"), true, "title, case-insensitive");
assert.equal(matchesQuery(a(), "AUSTRALIA"), true);
assert.equal(matchesQuery(a(), "subclass 500"), true, "excerpt");
assert.equal(matchesQuery(a(), "immigration"), true, "category slug is searchable");
assert.equal(matchesQuery(a(), "japan"), false);

// 223 migrated posts have no image and some have a thin excerpt — a missing field must not
// throw, it just doesn't match.
assert.equal(matchesQuery({ title: "Only a title" } as Article, "title"), true);
assert.equal(matchesQuery({ title: "Only a title" } as Article, "excerpt"), false);

// The query is trimmed, so a stray space from a paste still finds the post.
assert.equal(matchesQuery(a(), "  australia  "), true);

// --- relatedArticles --------------------------------------------------------
const pool: Article[] = [
  a({ slug: "self" }),
  a({ slug: "imm-1", date: "2026-03-01" }),
  a({ slug: "imm-2", date: "2026-02-01" }),
  a({ slug: "imm-3", date: "2026-04-01" }),
  a({ slug: "tips-1", category: "study-tips", date: "2026-05-01" }),
];
const self = pool[0];

const r = relatedArticles(pool, self);
assert.equal(r.length, 3);
assert.ok(!r.some((x) => x.slug === "self"), "never links back to the article you're on");
assert.deepEqual(
  r.map((x) => x.slug),
  ["imm-3", "imm-1", "imm-2"],
  "same category, newest first"
);

// A thin category falls back to the rest of the blog rather than rendering one lonely card.
const thin = [self, a({ slug: "tips-1", category: "study-tips", date: "2026-05-01" }), a({ slug: "life-1", category: "student-life", date: "2026-06-01" })];
const rf = relatedArticles(thin, self);
assert.equal(rf.length, 2, "uses everything available when the category is thin");
assert.deepEqual(rf.map((x) => x.slug), ["life-1", "tips-1"]);

// A post with no siblings at all renders no section, not a broken one.
assert.deepEqual(relatedArticles([self], self), []);

// Drafts without a slug can't be linked to, so they're never offered.
assert.deepEqual(relatedArticles([self, a({ slug: undefined })], self), []);

// A missing date sorts last instead of throwing.
const undated = relatedArticles([self, a({ slug: "no-date", date: undefined }), a({ slug: "dated", date: "2026-09-01" })], self);
assert.deepEqual(undated.map((x) => x.slug), ["dated", "no-date"]);

// --- readingMinutes ---------------------------------------------------------
// Tags don't count as words, and nothing ever reads "0 min read".
assert.equal(readingMinutes(a({ html: "<p>" + "word ".repeat(400) + "</p>" })), 2);
assert.equal(readingMinutes(a({ html: "<p>hi</p>" })), 1, "floor is 1 minute");
assert.equal(readingMinutes({ title: "t", excerpt: "", category: "c" } as Article), 1, "no body");
assert.ok(
  readingMinutes(a({ html: "<div class='x'><a href='#'>one two three</a></div>" })) === 1,
  "attributes are not words"
);

// --- featuredArticles -------------------------------------------------------
const ticked = a({ slug: "ticked", featured: true, date: "2020-01-01" });
const photo = a({ slug: "photo", image: "/uploads/x.jpg", date: "2024-01-01" });
const newerPlain = a({ slug: "plain", date: "2026-06-01" });
// A ticked post outranks a newer one; a real picture outranks a newer post without one.
assert.deepEqual(
  featuredArticles([newerPlain, photo, ticked], 3).map((x) => x.slug),
  ["ticked", "photo", "plain"]
);
// Ranked on the uploaded picture, not on a video poster: one live post has an embedded music
// video whose poster frame would otherwise lead the blog under a visa headline.
const videoOnly = a({
  slug: "video",
  date: "2025-01-01",
  html: '<iframe src="https://www.youtube.com/embed/abc123"></iframe>',
});
assert.deepEqual(
  featuredArticles([videoOnly, photo], 2).map((x) => x.slug),
  ["photo", "video"]
);
// A YouTube link pasted into the Image field is not a picture.
const pastedLink = a({ slug: "pasted", image: "https://www.youtube.com/watch?v=abc", date: "2026-01-01" });
assert.deepEqual(featuredArticles([pastedLink, photo], 2).map((x) => x.slug), ["photo", "pasted"]);
// Draft entries (no slug) have nowhere to link to.
assert.deepEqual(featuredArticles([a({ slug: undefined }), photo], 5).map((x) => x.slug), ["photo"]);

// --- categoryRows -----------------------------------------------------------
const three = (cat: string, n: number) =>
  Array.from({ length: n }, (_, i) => a({ slug: `${cat}-${i}`, category: cat, date: `2026-01-0${i + 1}` }));
const rows = categoryRows([...three("immigration", 3), ...three("study-tips", 2)], 3);
assert.deepEqual(rows.map((r) => r.slug), ["immigration"], "a category that can't fill a row is skipped");
assert.deepEqual(rows[0].articles.map((x) => x.slug), ["immigration-2", "immigration-1", "immigration-0"]);
// What the hero already showed doesn't come back three sections later.
const excluded = categoryRows(three("immigration", 4), 3, new Set(["immigration-3"]));
assert.deepEqual(excluded[0].articles.map((x) => x.slug), ["immigration-2", "immigration-1", "immigration-0"]);

// --- against the real content -----------------------------------------------
const ARTICLES: Article[] = JSON.parse(readFileSync(new URL("../content/blog.json", import.meta.url), "utf8"));
assert.ok(ARTICLES.length > 200, "expected the migrated blog, got " + ARTICLES.length);
for (const article of ARTICLES.slice(0, 40)) {
  assert.equal(matchesQuery(article, ""), true);
  const rel = relatedArticles(ARTICLES, article);
  assert.equal(rel.length, 3, article.slug);
  assert.ok(rel.every((x) => x.slug && x.slug !== article.slug), article.slug);
  assert.ok(readingMinutes(article) >= 1, article.slug);
}
// The blog's front page must always have a hero and a Featured column to put in it.
assert.equal(featuredArticles(ARTICLES, 6).length, 6);
assert.ok(new Set(featuredArticles(ARTICLES, 6).map((x) => x.slug)).size === 6, "no repeats");

console.log("blog.check.ts ok");
