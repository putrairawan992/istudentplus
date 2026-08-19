// Checks for the CMS tab grouping. No test framework in this project, so:
//   node --experimental-strip-types lib/form-sections.check.ts
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { sectionsOf, type Section } from "./form-sections.ts";
import type { JsonObject } from "./json-tree.ts";

// Stand-in for the editor's own predicate; the real one is in CollectionEditor.
const isMediaish = (k: string) =>
  /(image|photo|thumbnail|thumb|logo|avatar|cover|poster|banner|picture|img|video|youtube)/i.test(k) &&
  !/^imageLabel$/.test(k);

const labels = (s: Section[]) => s.map((x) => x.label);

// The invariant that matters: nothing disappears, nothing is rendered twice.
function assertCovers(obj: JsonObject, sections: Section[], what: string) {
  const placed = sections.flatMap((s) => s.keys);
  assert.deepEqual(
    [...placed].sort(),
    Object.keys(obj).sort(),
    `${what}: every field must land in exactly one section`
  );
  assert.equal(new Set(placed).size, placed.length, `${what}: a field was placed twice`);
}

// a long single document: scalars collapse into General, each list gets a tab
const settingsLike: JsonObject = {
  stats: [1, 2, 3],
  offices: [{}],
  whatsapp: "https://wa.me/1",
  heroTitle: "t",
  heroSubtitle: "s",
  aboutStory: ["a", "b"],
};
let s = sectionsOf(settingsLike, isMediaish);
assert.deepEqual(labels(s), ["General", "Stats", "Offices", "About Story"]);
assert.deepEqual(s[0].keys, ["whatsapp", "heroTitle", "heroSubtitle"]);
assertCovers(settingsLike, s, "settings-like");

// all lists, no scalars: no empty General tab
const servicesLike: JsonObject = { faqs: [], pitfalls: [], admissionSteps: [] };
s = sectionsOf(servicesLike, isMediaish);
assert.deepEqual(labels(s), ["Faqs", "Pitfalls", "Admission Steps"]);
assertCovers(servicesLike, s, "services-like");

// a webinar entry: no lists at all, but three media/recording fields worth their own tab
const webinarLike: JsonObject = {
  date: "2026-04-18T12:00:00+07:00",
  image: "/a.png",
  title: "t",
  speaker: "s",
  platform: "Zoom",
  description: "d",
  durationMinutes: 90,
  recordingVideoFile: "",
  recordingYoutubeId: "abc",
  theme: "Karier",
};
s = sectionsOf(webinarLike, isMediaish);
assert.deepEqual(labels(s), ["General", "Media"]);
assert.deepEqual(s[1].keys, ["image", "recordingVideoFile", "recordingYoutubeId"]);
assertCovers(webinarLike, s, "webinar-like");

// a short entry stays one plain form — a tab strip over four fields is noise
const videoLike: JsonObject = { series: "s", title: "t", youtubeId: "x", videoFile: null };
s = sectionsOf(videoLike, isMediaish);
assert.equal(s.length, 1, "short forms must not be tabbed");
assertCovers(videoLike, s, "video-like");

// a single media field is never split off on its own
const blogLike: JsonObject = {
  date: "2025-07-26",
  slug: "s",
  image: "/i.jpg",
  title: "t",
  excerpt: "e",
  category: "immigration",
  html: "<p>x</p>",
  source: "https://old/",
};
s = sectionsOf(blogLike, isMediaish);
assert.equal(s.length, 1);
assert.ok(s[0].keys.includes("image"));
assertCovers(blogLike, s, "blog-like");

// edge cases that must not throw or drop data
assert.deepEqual(sectionsOf({}, isMediaish), []);
const nullish: JsonObject = { a: null, b: "x" };
assertCovers(nullish, sectionsOf(nullish, isMediaish), "nulls are scalars");

// finally: run it over the real content files, since those are what the CMS actually renders
const dir = new URL("../content/", import.meta.url);
for (const file of readdirSync(dir)) {
  if (!file.endsWith(".json") || file === "leads.json") continue;
  const parsed = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
  const forms: JsonObject[] = Array.isArray(parsed)
    ? (parsed.slice(0, 3).filter((x) => x && typeof x === "object" && !Array.isArray(x)) as JsonObject[])
    : [parsed as JsonObject];
  forms.forEach((form, i) => assertCovers(form, sectionsOf(form, isMediaish), `${file}[${i}]`));
}

console.log("form-sections: all checks passed");
