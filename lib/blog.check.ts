// Checks for blog search and "keep reading". No test framework in this project, so:
//   node --experimental-strip-types lib/blog.check.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { matchesQuery, relatedArticles, type Article } from "./blog.ts";

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

// --- against the real content -----------------------------------------------
const ARTICLES: Article[] = JSON.parse(readFileSync(new URL("../content/blog.json", import.meta.url), "utf8"));
assert.ok(ARTICLES.length > 200, "expected the migrated blog, got " + ARTICLES.length);
for (const article of ARTICLES.slice(0, 40)) {
  assert.equal(matchesQuery(article, ""), true);
  const rel = relatedArticles(ARTICLES, article);
  assert.equal(rel.length, 3, article.slug);
  assert.ok(rel.every((x) => x.slug && x.slug !== article.slug), article.slug);
}

console.log("blog.check.ts ok");
