// Checks for the media trio's selection and all-or-nothing rules. No test framework here, so:
//   node --experimental-strip-types lib/media.check.ts
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { anyMedia, hasMedia, pickMedia, MEDIA_FIELDS, MEDIA_KEYS, type Media } from "./media.ts";
import { baseCollectionKey } from "./i18n.ts";

// --- hasMedia ---------------------------------------------------------------
assert.equal(hasMedia(null), false);
assert.equal(hasMedia(undefined), false);
assert.equal(hasMedia({}), false);
// The CMS writes "" when a field is cleared, and null when it was never filled. Neither is media.
assert.equal(hasMedia({ image: "", youtubeId: "", videoFile: "" }), false);
assert.equal(hasMedia({ image: null, youtubeId: null, videoFile: null }), false);
assert.equal(hasMedia({ image: "   " }), false, "whitespace is not a path");
assert.equal(hasMedia({ image: "/media/a.jpg" }), true);
assert.equal(hasMedia({ youtubeId: "dQw4w9WgXcQ" }), true);
assert.equal(hasMedia({ videoFile: "/media/a.mp4" }), true);

// --- pickMedia: one winner, in a stated order --------------------------------
assert.equal(pickMedia(null), null);
assert.equal(pickMedia({ image: "" }), null);

const all: Media = { image: "/i.jpg", youtubeId: "abc123", videoFile: "/v.mp4" };
assert.deepEqual(pickMedia(all), { kind: "videoFile", src: "/v.mp4" }, "upload beats YouTube beats still");
assert.deepEqual(pickMedia({ image: "/i.jpg", youtubeId: "abc123" }), { kind: "youtubeId", src: "abc123" });
assert.deepEqual(pickMedia({ image: "/i.jpg" }), { kind: "image", src: "/i.jpg" });
// A cleared higher-priority field must fall through, not win with an empty src — otherwise
// clearing a video in the CMS renders an empty player instead of revealing the still beneath it.
assert.deepEqual(pickMedia({ image: "/i.jpg", videoFile: "  " }), { kind: "image", src: "/i.jpg" });
assert.deepEqual(pickMedia({ image: "/i.jpg", youtubeId: null, videoFile: "" }), { kind: "image", src: "/i.jpg" });
// Paths are trimmed — a trailing space from a paste would 404 the image.
assert.deepEqual(pickMedia({ image: " /i.jpg " }), { kind: "image", src: "/i.jpg" });

// --- anyMedia: the switch that keeps a grid's rows level ---------------------
assert.equal(anyMedia([]), false);
assert.equal(anyMedia([{}, { image: "" }, null]), false, "a grid with nothing filled shows no boxes");
assert.equal(anyMedia([{}, { image: "/i.jpg" }, {}]), true, "one filled card turns the box on for all");

// --- the field names the CMS keys off ----------------------------------------
// The editor decides what widget to render purely from the key's name (MEDIA_KEY / YOUTUBE_KEY
// in CollectionEditor). Rename a field here and the upload box silently becomes a text input.
assert.deepEqual(Object.keys(MEDIA_FIELDS), ["image", "youtubeId", "videoFile"]);
assert.deepEqual(MEDIA_KEYS, ["image", "youtubeId", "videoFile"]);
assert.ok(MEDIA_KEYS.every((k) => MEDIA_FIELDS[k] === ""), "the model's blanks must be empty strings");
const MEDIA_KEY = /(image|photo|thumbnail|thumb|logo|icon|avatar|cover|poster|banner|picture|img|video)/i;
const YOUTUBE_KEY = /youtube/i;
assert.ok(MEDIA_KEY.test("image") && MEDIA_KEY.test("videoFile"), "upload widget");
assert.ok(YOUTUBE_KEY.test("youtubeId"), "YouTube widget");

// --- every slot the site can now fill has a size standard --------------------
// A field with no entry in SPECS is accepted at any size, which is how off-spec images used to
// ship. Anything rendered through <Media> must have one.
const specSrc = readFileSync(new URL("./image-specs.ts", import.meta.url), "utf8");
const specced = new Set([...specSrc.matchAll(/"([a-zA-Z]+)\.(image|photo)":/g)].map((m) => `${m[1]}.${m[2]}`));
const NO_TRIO = new Set(["leads", "webinars"]); // see CollectionEditor's NO_MEDIA_TRIO
// A local translation sibling (e.g. contactPage.id.json) is the same collection as its base —
// baseCollectionKey collapses it back so the scan doesn't go looking for a "contactPage.id.image"
// spec that was never meant to exist; the size standard applies per collection, not per locale.
const collections = [
  ...new Set(
    readdirSync(new URL("../content/", import.meta.url))
      .filter((f) => f.endsWith(".json"))
      .map((f) => baseCollectionKey(f.replace(/\.json$/, "")))
  ),
].filter((c) => !NO_TRIO.has(c));
const missing = collections.filter((c) => !specced.has(`${c}.image`) && !specced.has(`${c}.photo`));
assert.deepEqual(missing, [], "collections whose image slot has no size standard: " + missing.join(", "));

console.log("media.check.ts ok — " + collections.length + " collections, every image slot specced");

// --- isEmbedPageUrl: a platform page is never a picture ----------------------
// The live blog had `https://www.youtube.com/watch?v=...` saved in a post's Image slot, and
// the admin's own isImagePath counted it as an image, so it rendered broken.
import { isEmbedPageUrl } from "./media.ts";
for (const bad of [
  "https://www.youtube.com/watch?v=RSnU_ILuEqU",
  "https://youtu.be/RSnU_ILuEqU",
  "http://youtube.com/shorts/abc123",
  "https://www.instagram.com/p/Cxyz/",
  "https://www.instagram.com/reel/Cxyz/",
  "https://vimeo.com/12345",
  "https://www.tiktok.com/@user/video/123",
  "  https://www.youtube.com/watch?v=x  ",
]) assert.equal(isEmbedPageUrl(bad), true, bad);

for (const ok of [
  "/blog/2023-08-image.png",
  "/uploads/1724750000-poster.jpg",
  // Uploads come back from the Go API with no extension — the whole reason this is a blocklist
  // and not an is-it-an-image test.
  "https://api.istudentplus.com/media/9f2c1ab3",
  "https://api.istudentplus.com/media/9f2c1ab3.webp",
  "https://i.ytimg.com/vi/abc/hqdefault.jpg",   // a YouTube *thumbnail* is a real image
  "",
]) assert.equal(isEmbedPageUrl(ok), false, ok);
assert.equal(isEmbedPageUrl(null), false);
assert.equal(isEmbedPageUrl(undefined), false);

// Not fooled by a host that merely contains the name.
assert.equal(isEmbedPageUrl("https://youtube.com.evil.test/a.jpg"), false, "suffix match only");
assert.equal(isEmbedPageUrl("https://m.youtube.com/watch?v=x"), true, "subdomains still count");

// pickMedia must drop it rather than hand a broken src to <Media>
assert.equal(pickMedia({ image: "https://www.youtube.com/watch?v=x" }), null);
// ...but the youtubeId field is exactly where that link belongs, so it still wins there.
assert.deepEqual(pickMedia({ image: "https://www.youtube.com/watch?v=x", youtubeId: "abc" }),
  { kind: "youtubeId", src: "abc" });

// The real blog content must not carry a page link in an image slot without being caught.
const posts = JSON.parse(readFileSync(new URL("../content/blog.json", import.meta.url), "utf8"));
const leaked = (posts as { image?: string; slug?: string }[])
  .filter((x) => isEmbedPageUrl(x.image))
  .map((x) => x.slug);
console.log("embed-URLs found in blog image slots: " + (leaked.length ? leaked.join(", ") : "none"));

console.log("media.check.ts embed-guard ok");
