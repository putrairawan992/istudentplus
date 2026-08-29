// Checks for the embed platform table and the article-body splitter. No test framework, so:
//   node --experimental-strip-types lib/embeds.check.ts
import assert from "node:assert/strict";
import { PLATFORMS, RATIO_CLASS, resolveEmbed, platformOfEmbedUrl } from "./embeds.ts";
import { splitEmbeds, articleThumbnail, type Article } from "./blog.ts";

// --- the shapes a person actually copies --------------------------------------
const cases: [string, string, string][] = [
  // [pasted link, expected platform, expected id]
  ["https://www.youtube.com/watch?v=RSnU_ILuEqU", "youtube", "RSnU_ILuEqU"],
  ["https://youtu.be/RSnU_ILuEqU?si=abc", "youtube", "RSnU_ILuEqU"],
  ["https://www.youtube.com/shorts/dLYatad-L_8", "youtube", "dLYatad-L_8"],
  ["https://www.youtube.com/live/dLYatad-L_8", "youtube", "dLYatad-L_8"],
  // the share sheet adds tracking params ahead of v= often enough to matter
  ["https://www.youtube.com/watch?feature=shared&v=RSnU_ILuEqU", "youtube", "RSnU_ILuEqU"],
  ["https://www.instagram.com/p/CxYzAbC123/", "instagram", "CxYzAbC123"],
  ["https://www.instagram.com/reel/CxYzAbC123/?igsh=1", "instagram", "CxYzAbC123"],
  ["https://www.tiktok.com/@istudentplus/video/7412345678901234567", "tiktok", "7412345678901234567"],
  ["https://twitter.com/istudentplus/status/1798765432109876543", "twitter", "1798765432109876543"],
  ["https://x.com/istudentplus/status/1798765432109876543", "twitter", "1798765432109876543"],
  ["https://vimeo.com/123456789", "vimeo", "123456789"],
  ["https://www.facebook.com/watch?v=1234567890", "facebook", "1234567890"],
];
for (const [url, platform, id] of cases) {
  const r = resolveEmbed(url);
  assert.ok(r, "unrecognised: " + url);
  assert.equal(r.platform.id, platform, url);
  assert.equal(r.id, id, url);
  assert.ok(r.embedUrl.startsWith("https://"), url);
}

// Whitespace from a paste, and the empty box, must not throw or half-match.
assert.equal(resolveEmbed("   ")?.id, undefined);
assert.equal(resolveEmbed(""), null);
assert.equal(resolveEmbed("just some words"), null);
// Shortened links genuinely can't be resolved without following them — the guidance says so,
// and the field must reject them rather than store a broken embed.
assert.equal(resolveEmbed("https://vm.tiktok.com/ZSabc123/"), null, "short TikTok link");
assert.equal(resolveEmbed("https://bit.ly/xyz"), null);
// A profile is not a post.
assert.equal(resolveEmbed("https://www.instagram.com/istudentplus/"), null);
assert.equal(resolveEmbed("https://www.tiktok.com/@istudentplus"), null);

// --- only YouTube claims an automatic thumbnail --------------------------------
const withThumb = PLATFORMS.filter((p) => p.thumbnail).map((p) => p.id);
assert.deepEqual(withThumb, ["youtube"], "the CMS guidance promises a poster only for YouTube");
assert.equal(
  PLATFORMS.find((p) => p.id === "youtube")!.thumbnail!("abc123"),
  "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
  "must stay on i.ytimg.com — the only image host next.config.ts allows for this"
);
// Every platform needs the advice the CMS panel renders, or a row shows up blank.
for (const p of PLATFORMS) {
  assert.ok(p.accepts && p.note, p.id + " is missing its guidance copy");
  assert.ok(RATIO_CLASS[p.ratio], p.id + " has no ratio class");
}

// --- round trip: insert -> store -> render -------------------------------------
// What the CMS writes is what splitEmbeds has to read back.
for (const [url, platform] of cases) {
  const stored = `<p>before</p><iframe src="${resolveEmbed(url)!.embedUrl}"></iframe><p>after</p>`;
  const { embeds, body } = splitEmbeds(stored);
  assert.equal(embeds.length, 1, url);
  assert.equal(embeds[0].platform, platform, url);
  assert.equal(body, "<p>before</p><p>after</p>", "the iframe must leave the prose alone");
}

// Several embeds come back in document order — that's the order the grid renders them in.
const many = splitEmbeds(
  '<iframe src="https://www.youtube.com/embed/aaa111"></iframe><p>x</p>' +
    '<iframe src="https://www.tiktok.com/embed/v2/7412345678901234567"></iframe>'
);
assert.equal(many.embeds.length, 2);
assert.deepEqual(many.embeds.map((e) => e.platform), ["youtube", "tiktok"]);
assert.equal(many.embeds[0].ratioClass, RATIO_CLASS.video);
assert.equal(many.embeds[1].ratioClass, RATIO_CLASS.portrait, "a TikTok in a 16:9 box is a stripe");
assert.equal(many.body, "<p>x</p>");

// A multi-line or attribute-heavy iframe (hand-pasted) still gets lifted out.
const messy = splitEmbeds(
  '<p>a</p><iframe\n  width="560" height="315"\n  src="https://www.youtube.com/embed/bbb222"\n  allowfullscreen></iframe>'
);
assert.equal(messy.embeds.length, 1);
assert.equal(messy.embeds[0].platform, "youtube");
assert.equal(messy.body, "<p>a</p>");

// No body, no embeds, nothing thrown.
assert.deepEqual(splitEmbeds(undefined), { embeds: [], body: "" });
assert.deepEqual(splitEmbeds("<p>plain</p>"), { embeds: [], body: "<p>plain</p>" });
// An iframe with no src is dropped rather than rendered as an empty frame.
assert.deepEqual(splitEmbeds("<iframe></iframe>"), { embeds: [], body: "" });

// --- the blog list thumbnail ---------------------------------------------------
const article = (over: Partial<Article> = {}): Article =>
  ({ title: "t", excerpt: "e", category: "immigration", ...over }) as Article;

assert.equal(articleThumbnail(article({ image: "/blog/a.png" })), "/blog/a.png", "own image wins");
assert.equal(
  articleThumbnail(article({ html: '<iframe src="https://www.youtube.com/embed/abc123"></iframe>' })),
  "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
  "a video-only post shows its poster instead of the bare category name"
);
// The image slot holding a page link is not an image — it must fall through to the poster.
assert.equal(
  articleThumbnail(
    article({
      image: "https://www.youtube.com/watch?v=RSnU_ILuEqU",
      html: '<iframe src="https://www.youtube.com/embed/abc123"></iframe>',
    })
  ),
  "https://i.ytimg.com/vi/abc123/hqdefault.jpg"
);
// A TikTok-only post has nothing to show — the list falls back to the category placeholder,
// which is exactly what the CMS guidance warns about.
assert.equal(
  articleThumbnail(article({ html: '<iframe src="https://www.tiktok.com/embed/v2/7412345678901234567"></iframe>' })),
  null
);
assert.equal(articleThumbnail(article()), null);

// platformOfEmbedUrl must not be fooled by a lookalike host.
assert.equal(platformOfEmbedUrl("https://youtube.com.evil.test/embed/x"), null, "suffix, not substring");
assert.equal(platformOfEmbedUrl("https://notyoutube.com/embed/x"), null);
assert.equal(platformOfEmbedUrl("https://www.youtube-nocookie.com/embed/x")?.id, "youtube");
assert.equal(platformOfEmbedUrl("https://player.vimeo.com/video/1")?.id, "vimeo");
assert.equal(platformOfEmbedUrl("not a url"), null);

console.log("embeds.check.ts ok — " + PLATFORMS.length + " platforms, " + cases.length + " link shapes");
