// Checks for the tree helpers behind the CMS editor — path read/write and the cross-entry
// shape merge that drives consistent tabs (see form-sections.check.ts for the tab grouping
// itself). No test framework in this project, so:
//   node --experimental-strip-types lib/json-tree.check.ts
import assert from "node:assert/strict";
import {
  blankShapeOf,
  getAtPath,
  insertAtEnd,
  mergeWithModel,
  removeAtIndex,
  setAtPath,
  unionShapeOf,
  type JsonObject,
} from "./json-tree.ts";

// --- blankShapeOf -----------------------------------------------------------------------
// A checkbox defaulting to whatever the model happened to be would carry "hidden: true" onto
// a brand-new entry just because some other entry in the list was hidden.
assert.equal(blankShapeOf(true), false);
assert.equal(blankShapeOf(false), false);
assert.equal(blankShapeOf("x"), "");
assert.equal(blankShapeOf(3), 0);
assert.deepEqual(blankShapeOf([1, 2, 3]), []);
assert.deepEqual(blankShapeOf({ a: "x", b: 1, c: true }), { a: "", b: 0, c: false });

// --- unionShapeOf / mergeWithModel: the actual countries.json shape ---------------------
// Australia has the full destination-page treatment; the rest don't yet (docs/HISTORY.md §37) —
// this is exactly the data that made every entry's admin tabs look different.
const australia: JsonObject = {
  tag: "Open",
  name: "Australia",
  slug: "australia",
  keyFacts: [{ label: "Languages spoken", value: "English" }],
  overview: { livingCost: "AUD 20,000–45,000" },
  livingCosts: [{ expense: "Rent", range: "AUD 200–400/week" }],
  featuredPrograms: [
    { name: "VET Courses", description: "d", href: "/courses#vet" },
    { name: "High School", description: "d", href: "/courses#high-school" },
  ],
  visaRequirements: ["Passport", "CoE"],
};
const japan: JsonObject = {
  tag: "3 seats",
  name: "Japan",
  slug: "japan",
  overview: { livingCost: "JPY ..." },
  imageLabel: "Study in Japan",
  featuredPrograms: [{ name: "Language School", description: "d", href: "/courses#language" }],
};
const uk: JsonObject = {
  tag: "Open",
  name: "United Kingdom",
  slug: "uk",
  overview: { livingCost: "GBP ..." },
  hidden: true,
};

const model = unionShapeOf([australia, japan, uk]);

// every field seen anywhere is in the model, in first-seen order
assert.deepEqual(
  Object.keys(model),
  ["tag", "name", "slug", "keyFacts", "overview", "livingCosts", "featuredPrograms", "visaRequirements", "imageLabel", "hidden"]
);
// the richer example wins as the shape template — Australia's 2 programs over Japan's 1
assert.equal((model.featuredPrograms as unknown[]).length, 2);
// hidden's *template* value is whatever was found (true) — mergeWithModel is what has to blank it
assert.equal(model.hidden, true);

for (const [name, entry] of [
  ["australia", australia],
  ["japan", japan],
  ["uk", uk],
] as const) {
  const merged = mergeWithModel(entry, model);
  assert.deepEqual(Object.keys(merged), Object.keys(model), `${name}: tab order must match the model exactly`);
  for (const key of Object.keys(entry)) {
    assert.deepEqual(merged[key], entry[key], `${name}.${key}: an entry's own value must survive the merge untouched`);
  }
}

// japan never had keyFacts/livingCosts/visaRequirements — merged shows them as genuinely empty,
// not Australia's real content leaking into another country's editor
const japanMerged = mergeWithModel(japan, model);
assert.deepEqual(japanMerged.keyFacts, []);
assert.deepEqual(japanMerged.livingCosts, []);
assert.deepEqual(japanMerged.visaRequirements, []);
// japan has no `hidden` field at all — merging in the model's boolean must not turn it on
assert.equal(japanMerged.hidden, false);
// australia never had `hidden` or `imageLabel` either — same story
const ausMerged = mergeWithModel(australia, model);
assert.equal(ausMerged.hidden, false);
assert.equal(ausMerged.imageLabel, "");

// merging is non-destructive: it must not mutate the inputs
assert.deepEqual(japan, { ...japan }, "sanity: japan wasn't touched by reference elsewhere");
assert.ok(!("keyFacts" in japan), "mergeWithModel must not mutate the original entry");

// a field only one, non-model-order entry has still comes through (defensive: not expected with
// a real union, but mergeWithModel must not drop data it doesn't recognize)
const weird: JsonObject = { onlyHere: "x" };
assert.deepEqual(mergeWithModel(weird, model).onlyHere, "x");

// --- setAtPath / getAtPath / insertAtEnd: growing a field that didn't exist -------------
// This is what actually happens when an admin fills in Japan's first-ever Key Fact after the
// merge showed it as an empty array: the real record (no `keyFacts` key at all) has to end up a
// genuine array, not an object-with-numeric-keys.
let root: JsonObject = { slug: "japan" }; // no keyFacts key at all, same as real data
root = insertAtEnd(root, ["keyFacts"], { label: "Languages spoken", value: "Japanese" }) as JsonObject;
assert.ok(Array.isArray(root.keyFacts), "a field grown from nothing must become a real array");
assert.deepEqual(root.keyFacts, [{ label: "Languages spoken", value: "Japanese" }]);

// editing that new item's own field (the deep path an open, populated card actually writes to)
root = setAtPath(root, ["keyFacts", 0, "value"], "Japanese (JLPT N3+)") as JsonObject;
assert.equal(getAtPath(root, ["keyFacts", 0, "value"]), "Japanese (JLPT N3+)");

// remove takes it back to a genuine empty array, not back to "missing"
root = removeAtIndex(root, ["keyFacts"], 0) as JsonObject;
assert.deepEqual(root.keyFacts, []);

// getAtPath on a path that still doesn't exist reads as null, not a throw
assert.equal(getAtPath(root, ["livingCosts", 0, "expense"]), null);

console.log("json-tree: all checks passed");
