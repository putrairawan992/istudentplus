// Checks for the bilingual routing helpers and the CMS translation overlay. No test framework
// in this project, so:
//   node --experimental-strip-types lib/i18n.check.ts
import assert from "node:assert/strict";
import {
  alternatesFor,
  baseCollectionKey,
  fmt,
  hasLocale,
  localeKey,
  localePath,
  switchLocalePath,
} from "./i18n.ts";
import { overlay } from "./translation-overlay.ts";

// --- URL scheme: English keeps the paths Google already indexed, Indonesian gets a prefix ---
assert.equal(localePath("en", "/about"), "/about");
assert.equal(localePath("en", "/"), "/");
assert.equal(localePath("id", "/about"), "/id/about");
assert.equal(localePath("id", "/"), "/id");
assert.equal(localePath("id", "/#consultation"), "/id/#consultation");
assert.equal(localePath("id", "/blog?category=immigration"), "/id/blog?category=immigration");

// --- the language switcher: same page, other language, from either side ---
assert.equal(switchLocalePath("id", "/about"), "/id/about");
assert.equal(switchLocalePath("en", "/id/about"), "/about");
assert.equal(switchLocalePath("id", "/"), "/id");
assert.equal(switchLocalePath("en", "/id"), "/");
assert.equal(switchLocalePath("id", "/id/about"), "/id/about", "already there, stays put");
// proxy.ts rewrites bare paths onto /en, so usePathname() may report either shape
assert.equal(switchLocalePath("id", "/en/about"), "/id/about");
// a path that merely starts with the locale's letters is not a locale segment
assert.equal(switchLocalePath("id", "/identity"), "/id/identity");

assert.equal(hasLocale("en"), true);
assert.equal(hasLocale("id"), true);
assert.equal(hasLocale("de"), false);
assert.equal(hasLocale(""), false);

// --- hreflang: one canonical per language, x-default on the unprefixed one ---
const alts = alternatesFor("id", "/study-abroad/australia");
assert.equal(alts.canonical, "/id/study-abroad/australia");
assert.equal(alts.languages.en, "/study-abroad/australia");
assert.equal(alts.languages["id-ID"], "/id/study-abroad/australia");
assert.equal(alts.languages["x-default"], "/study-abroad/australia");

// --- placeholders ---
assert.equal(fmt("Study in {name}", { name: "Japan" }), "Study in Japan");
assert.equal(fmt("Kuliah di {name}", { name: "Jepang" }), "Kuliah di Jepang");
assert.equal(fmt("{count} min", { count: 90 }), "90 min");
assert.equal(fmt("Page {a} of {b}", { a: 2, b: 7 }), "Page 2 of 7");
assert.equal(fmt("no {missing} here", {}), "no {missing} here", "unknown key left visible");

// --- storage keys ---
assert.equal(localeKey("settings", "en"), "settings");
assert.equal(localeKey("settings", "id"), "settings.id");

// baseCollectionKey is localeKey's inverse — round-tripping either direction must land on the
// same collection, which is what lets a scan over content/*.json (base docs and .id siblings
// mixed together) treat them as one thing rather than two.
assert.equal(baseCollectionKey("settings"), "settings");
assert.equal(baseCollectionKey("settings.id"), "settings");
assert.equal(baseCollectionKey(localeKey("contactPage", "id")), "contactPage");

// --- the overlay: what the site actually renders per language -----------------------------
// No translation started at all -> English, untouched.
const english = { heroTitle: "Get into your **dream university**", stats: [{ label: "Enrolled" }] };
assert.deepEqual(overlay(english, null), english);
assert.deepEqual(overlay(english, undefined), english);
assert.deepEqual(overlay(english, {}), english, "an empty document is not a translation");

// A half-finished translation: Indonesian where written, English everywhere else.
assert.deepEqual(overlay(english, { heroTitle: "Masuk ke **kampus impianmu**" }), {
  heroTitle: "Masuk ke **kampus impianmu**",
  stats: [{ label: "Enrolled" }],
});

// A field cleared in the CMS falls back rather than rendering blank.
assert.deepEqual(overlay(english, { heroTitle: "   " }), english);
assert.deepEqual(overlay({ a: "x", b: "y" }, { a: "ax", b: null }), { a: "ax", b: "y" });

// Nested objects merge per field.
assert.deepEqual(
  overlay(
    { overview: { livingCost: "AUD 1,400/mo", culture: "Relaxed and outdoorsy" } },
    { overview: { culture: "Santai dan banyak kegiatan luar ruang" } }
  ),
  { overview: { livingCost: "AUD 1,400/mo", culture: "Santai dan banyak kegiatan luar ruang" } }
);

// Lists are all-or-nothing: entry 3 of one list is not necessarily entry 3 of the other, and
// merging them by index is how a Japanese webinar ends up captioned as an Australian one.
const enList = [{ name: "Australia" }, { name: "Japan" }, { name: "China" }];
assert.deepEqual(overlay(enList, []), enList, "an empty list is not a translation");
assert.deepEqual(overlay(enList, [{ name: "Jepang" }]), [{ name: "Jepang" }], "no index merging");

// A translation may add a field English doesn't have (a new CMS field, ID edited first).
assert.deepEqual(overlay({ a: "x" }, { a: "ax", extra: "baru" }), { a: "ax", extra: "baru" });

// Booleans and numbers are values, not copy: `false` and `0` must not read as "unfilled".
assert.deepEqual(overlay({ hidden: true }, { hidden: false }), { hidden: false });
assert.deepEqual(overlay({ durationMinutes: 90 }, { durationMinutes: 0 }), { durationMinutes: 0 });

console.log("i18n.check.ts: all assertions passed");
